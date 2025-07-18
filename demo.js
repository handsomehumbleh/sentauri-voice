// Sentauri Voice Demo - Main JavaScript with OpenAI Support
const { API_URL, VOICE_ID, DEMO_SETTINGS, FEATURES } = window.SentauriConfig;

let isListening = false;
let recognition = null;
let audioContext = null;
let analyser = null;
let microphone = null;
let animationFrame = null;
let rippleTimeout = null;
let isSpeaking = false;
let mediaRecorder = null;
let audioChunks = [];

// Initialize speech synthesis
const synth = window.speechSynthesis;
const voices = [];

// Analytics helper
function trackEvent(eventName, parameters = {}) {
    if (FEATURES.enableAnalytics && window.gtag) {
        gtag('event', eventName, parameters);
    }
    if (FEATURES.showDebugInfo) {
        console.log('Analytics Event:', eventName, parameters);
    }
}

// Load voices
function loadVoices() {
    const availableVoices = synth.getVoices();
    const preferredVoices = availableVoices.filter(voice => 
        voice.lang.includes('en') && 
        (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha'))
    );
    voices.push(...(preferredVoices.length > 0 ? preferredVoices : availableVoices));
}

// Initial load and reload on change
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Enhanced speak function with multiple TTS options
async function speak(text, callback) {
    // Priority order: OpenAI > ElevenLabs > Browser
    if (FEATURES.useOpenAI && window.SentauriConfig.OPENAI_API_KEY) {
        try {
            await speakWithOpenAI(text, callback);
            return;
        } catch (error) {
            console.error('OpenAI TTS failed, trying next...', error);
        }
    }
    
    if (FEATURES.useElevenLabs) {
        try {
            await speakWithElevenLabs(text, callback);
            return;
        } catch (error) {
            console.error('ElevenLabs TTS failed, falling back...', error);
        }
    }
    
    // Fallback to browser TTS
    useBrowserTTS(text, callback);
}

// OpenAI TTS
async function speakWithOpenAI(text, callback) {
    const response = await fetch(`${API_URL}/api/text-to-speech/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            voice: FEATURES.openaiVoice || 'nova' 
        })
    });

    if (!response.ok) {
        throw new Error('OpenAI TTS failed');
    }

    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    
    audio.onplay = () => {
        isSpeaking = true;
        animateSpeaking();
    };
    
    audio.onended = () => {
        isSpeaking = false;
        resetSpeakingAnimation();
        if (callback) callback();
    };
    
    audio.play();
    trackEvent('voice_response', { type: 'openai', text_length: text.length });
}

// ElevenLabs TTS
async function speakWithElevenLabs(text, callback) {
    const response = await fetch(`${API_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text,
            voiceId: VOICE_ID 
        })
    });

    if (!response.ok) {
        throw new Error('ElevenLabs TTS failed');
    }

    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    
    audio.onplay = () => {
        isSpeaking = true;
        animateSpeaking();
    };
    
    audio.onended = () => {
        isSpeaking = false;
        resetSpeakingAnimation();
        if (callback) callback();
    };
    
    audio.play();
    trackEvent('voice_response', { type: 'elevenlabs', text_length: text.length });
}

// Browser TTS fallback
function useBrowserTTS(text, callback) {
    if (!synth) return;
    
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = DEMO_SETTINGS.voiceRate;
    utterance.pitch = DEMO_SETTINGS.voicePitch;
    utterance.volume = DEMO_SETTINGS.voiceVolume;
    
    if (voices.length > 0) {
        utterance.voice = voices[0];
    }
    
    utterance.onstart = () => {
        isSpeaking = true;
        animateSpeaking();
    };
    
    utterance.onend = () => {
        isSpeaking = false;
        resetSpeakingAnimation();
        if (callback) callback();
    };
    
    synth.speak(utterance);
    trackEvent('voice_response', { type: 'browser_tts', text_length: text.length });
}

// Initialize speech recognition (Browser or Whisper)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript;
        processCommandWithAI(command);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        trackEvent('speech_error', { error: event.error });
        stopListening();
    };

    recognition.onend = function() {
        stopListening();
    };
}

// Initialize audio recording for Whisper
async function initializeRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];
            
            // Send to Whisper API
            await processWithWhisper(audioBlob);
        };
        
        return true;
    } catch (error) {
        console.error('Failed to initialize recording:', error);
        return false;
    }
}

// Process audio with Whisper
async function processWithWhisper(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    try {
        const response = await fetch(`${API_URL}/api/speech-to-text`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Whisper transcription failed');
        }
        
        const result = await response.json();
        
        if (result.transcript) {
            addCommandToHistory(`You said: "${result.transcript}"`);
            processCommandWithAI(result.transcript);
        }
    } catch (error) {
        console.error('Whisper error:', error);
        addCommandToHistory('Failed to transcribe audio. Please try again.');
    }
}

// Process command with GPT-4
async function processCommandWithAI(command) {
    animateProcessing();
    
    if (FEATURES.useGPT4) {
        try {
            const response = await fetch(`${API_URL}/api/process-command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            
            if (response.ok) {
                const result = await response.json();
                executeCommand(result);
                speak(result.response, () => {
                    addCommandToHistory(`✓ Sentauri: ${result.response}`);
                    animateSuccess();
                });
                return;
            }
        } catch (error) {
            console.error('GPT-4 processing failed:', error);
        }
    }
    
    // Fallback to local processing
    processCommand(command);
}

// Execute command from AI
function executeCommand(commandData) {
    const { action, target, value } = commandData;
    
    switch (action) {
        case 'style':
            if (target === 'background') {
                changeBackground(value);
            } else if (target === 'button') {
                changeButtonColor(value);
            }
            break;
        case 'content':
            if (target === 'title') {
                changeTitle(value);
            } else if (target === 'subtitle') {
                changeSubtitle(value);
            } else if (target === 'button') {
                changeButtonText(value);
            }
            break;
        case 'structure':
            if (target === 'feature' && value === 'add') {
                addFeature();
            } else if (target === 'feature' && value === 'remove') {
                removeFeature();
            }
            break;
        case 'animation':
            animateElements();
            break;
    }
    
    trackEvent('command_success', { 
        action, 
        target, 
        ai_processed: true 
    });
}

// Initialize audio context for voice visualization
async function initializeAudio() {
    if (!FEATURES.enableVoiceVisualization) return;
    
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        visualizeVoice();
    } catch (error) {
        console.error('Error accessing microphone:', error);
        trackEvent('microphone_error', { error: error.message });
    }
}

// Voice visualization
function visualizeVoice() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function animate() {
        if (!isListening) {
            resetVoiceAnimation();
            return;
        }

        animationFrame = requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalizedVolume = average / 255;

        animateSoundBars(dataArray);
        
        if (normalizedVolume > 0.1) {
            animateAvatar(normalizedVolume);
            triggerRipple(normalizedVolume);
        }
    }

    animate();
}

// Animation functions
function animateSoundBars(dataArray) {
    const bars = ['bar1', 'bar2', 'bar3', 'bar4', 'bar5'];
    const segments = Math.floor(dataArray.length / bars.length);

    bars.forEach((barId, index) => {
        const start = index * segments;
        const end = start + segments;
        let sum = 0;
        
        for (let i = start; i < end; i++) {
            sum += dataArray[i];
        }
        
        const average = sum / segments;
        const height = Math.max(10, Math.min(60, (average / 255) * 60));
        const bar = document.getElementById(barId);
        
        if (bar) {
            bar.style.height = height + 'px';
            bar.style.transition = 'height 0.1s ease-out';
        }
    });
}

function animateAvatar(volume) {
    const avatar = document.getElementById('assistantAvatar');
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    avatar.classList.add('speaking');
    
    const eyeHeight = 24 + (volume * 20);
    leftEye.style.height = eyeHeight + 'px';
    rightEye.style.height = eyeHeight + 'px';
    
    const scale = 1 + (volume * 0.1);
    avatar.style.transform = `scale(${scale})`;
}

function triggerRipple(volume) {
    if (rippleTimeout) return;
    
    const ripple1 = document.getElementById('voiceRipple1');
    const ripple2 = document.getElementById('voiceRipple2');
    
    if (volume > 0.3) {
        ripple1.classList.add('active');
        setTimeout(() => {
            ripple2.classList.add('active');
        }, 200);
        
        rippleTimeout = setTimeout(() => {
            ripple1.classList.remove('active');
            ripple2.classList.remove('active');
            rippleTimeout = null;
        }, 1500);
    }
}

function resetVoiceAnimation() {
    const bars = ['bar1', 'bar2', 'bar3', 'bar4', 'bar5'];
    bars.forEach(barId => {
        const bar = document.getElementById(barId);
        if (bar) {
            bar.style.height = '20px';
        }
    });
    
    const avatar = document.getElementById('assistantAvatar');
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    avatar.classList.remove('speaking');
    avatar.style.transform = 'scale(1)';
    leftEye.style.height = '24px';
    rightEye.style.height = '24px';
}

// Animate speaking
function animateSpeaking() {
    const avatar = document.getElementById('assistantAvatar');
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    function animateMouth() {
        if (!isSpeaking) return;
        
        const variation = Math.random() * 10 + 20;
        leftEye.style.height = variation + 'px';
        rightEye.style.height = variation + 'px';
        
        avatar.classList.add('speaking');
        
        setTimeout(animateMouth, 100);
    }
    
    animateMouth();
}

function resetSpeakingAnimation() {
    const avatar = document.getElementById('assistantAvatar');
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    avatar.classList.remove('speaking');
    leftEye.style.height = '24px';
    rightEye.style.height = '24px';
}

// Main control functions
function toggleListening() {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
}

async function startListening() {
    // Use Whisper if enabled and available
    if (FEATURES.useWhisper && window.SentauriConfig.OPENAI_API_KEY) {
        if (!mediaRecorder) {
            const initialized = await initializeRecording();
            if (!initialized) {
                addCommandToHistory("Failed to initialize microphone");
                return;
            }
        }
        
        isListening = true;
        document.getElementById('voiceButton').classList.add('listening');
        document.getElementById('voiceButton').innerHTML = '⏹️ Stop Recording';
        document.getElementById('listeningIndicator').classList.add('active');
        
        audioChunks = [];
        mediaRecorder.start();
        
        animateWakeUp();
        speak("I'm recording. Speak your command and click stop when done.");
        
        trackEvent('demo_started', { 
            method: 'whisper',
            has_microphone: true 
        });
        
    } else if (recognition) {
        // Use browser speech recognition
        isListening = true;
        document.getElementById('voiceButton').classList.add('listening');
        document.getElementById('voiceButton').innerHTML = '⏹️ Stop Listening';
        document.getElementById('listeningIndicator').classList.add('active');
        
        if (!audioContext && FEATURES.enableVoiceVisualization) {
            await initializeAudio();
        } else if (FEATURES.enableVoiceVisualization) {
            visualizeVoice();
        }
        
        recognition.start();
        
        animateWakeUp();
        
        const greetings = [
            "I'm listening! What would you like to change?",
            "Ready to help! Tell me what to modify.",
            "Hi there! What should we update?",
            "Listening now. How can I improve your site?"
        ];
        speak(greetings[Math.floor(Math.random() * greetings.length)]);
        
        trackEvent('demo_started', { 
            method: 'browser_speech',
            has_microphone: true,
            browser: navigator.userAgent 
        });
        
    } else {
        addCommandToHistory("Speech recognition not supported in your browser");
        speak("Sorry, speech recognition isn't supported in your browser. Try Chrome or Edge for the best experience.");
    }
}

function stopListening() {
    isListening = false;
    document.getElementById('voiceButton').classList.remove('listening');
    document.getElementById('voiceButton').innerHTML = '🎤 Start Voice Command';
    document.getElementById('listeningIndicator').classList.remove('active');
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    if (recognition) {
        recognition.stop();
    }
    
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
    
    resetVoiceAnimation();
}

// Original local command processing (fallback)
function processCommand(command) {
    addCommandToHistory(`You said: "${command}"`);
    trackEvent('voice_command', { command: command });
    
    animateProcessing();
    
    const lowerCommand = command.toLowerCase();
    let responseText = "";
    let actionTaken = false;
    
    if (lowerCommand.includes('title')) {
        const match = command.match(/title to (.+)/i);
        if (match) {
            changeTitle(match[1]);
            responseText = `I've updated the title to "${match[1]}". Looking great!`;
            actionTaken = true;
        }
    } else if (lowerCommand.includes('background')) {
        if (lowerCommand.includes('blue')) {
            changeBackground('#e3f2fd');
            responseText = "I've changed the background to a beautiful blue. Very calming!";
            actionTaken = true;
        } else if (lowerCommand.includes('green')) {
            changeBackground('#e8f5e9');
            responseText = "Nice choice! The background is now a fresh green.";
            actionTaken = true;
        } else if (lowerCommand.includes('red')) {
            changeBackground('#ffebee');
            responseText = "Background changed to red. That's bold and eye-catching!";
            actionTaken = true;
        } else if (lowerCommand.includes('yellow')) {
            changeBackground('#fffde7');
            responseText = "I've set a sunny yellow background. Very cheerful!";
            actionTaken = true;
        } else if (lowerCommand.includes('dark')) {
            changeBackground('#263238');
            document.querySelector('.preview-content').style.color = '#ffffff';
            responseText = "I've switched to dark mode. Perfect for modern designs!";
            actionTaken = true;
        }
    } else if (lowerCommand.includes('subtitle') || lowerCommand.includes('description')) {
        const match = command.match(/(?:subtitle|description) to (.+)/i);
        if (match) {
            changeSubtitle(match[1]);
            responseText = `Subtitle updated! "${match[1]}" sounds professional.`;
            actionTaken = true;
        }
    } else if (lowerCommand.includes('button')) {
        if (lowerCommand.includes('color')) {
            if (lowerCommand.includes('green')) {
                changeButtonColor('#4caf50');
                responseText = "Button color changed to green. Great for positive actions!";
                actionTaken = true;
            } else if (lowerCommand.includes('red')) {
                changeButtonColor('#f44336');
                responseText = "Red button activated. This will definitely grab attention!";
                actionTaken = true;
            } else if (lowerCommand.includes('purple')) {
                changeButtonColor('#9c27b0');
                responseText = "Purple looks elegant! Your button really stands out now.";
                actionTaken = true;
            }
        } else if (lowerCommand.includes('text')) {
            const match = command.match(/button (?:text|to) (.+)/i);
            if (match) {
                changeButtonText(match[1]);
                responseText = `Button text updated to "${match[1]}". Clear call to action!`;
                actionTaken = true;
            }
        }
    } else if (lowerCommand.includes('add') && lowerCommand.includes('feature')) {
        addFeature();
        responseText = "I've added a new feature card. Your product is growing!";
        actionTaken = true;
    } else if (lowerCommand.includes('remove') && lowerCommand.includes('feature')) {
        if (removeFeature()) {
            responseText = "Feature removed. Sometimes less is more!";
            actionTaken = true;
        } else {
            responseText = "I need to keep at least one feature. Try adding more first!";
        }
    } else if (lowerCommand.includes('animate')) {
        animateElements();
        responseText = "Watch this! I've added some smooth animations to your page.";
        actionTaken = true;
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
        responseText = "Hello! I'm Sentauri, your AI assistant. Try asking me to change the title, background color, or add features!";
    } else if (lowerCommand.includes('help')) {
        responseText = "I can help you modify this website! Try saying: change the title to something, make the background blue, or add a new feature.";
    } else {
        responseText = "I didn't quite catch that. Try saying something like: change the title, make the background blue, or add a feature.";
    }
    
    setTimeout(() => {
        speak(responseText, () => {
            if (actionTaken) {
                addCommandToHistory(`✓ Sentauri: ${responseText}`);
                animateSuccess();
                trackEvent('command_success', { command_type: getCommandType(lowerCommand) });
            }
        });
    }, 500);
}

// Helper function to categorize commands
function getCommandType(command) {
    if (command.includes('title') || command.includes('subtitle')) return 'content';
    if (command.includes('background') || command.includes('color')) return 'style';
    if (command.includes('add') || command.includes('remove')) return 'structure';
    if (command.includes('animate')) return 'animation';
    return 'other';
}

// Animation helper functions
function animateWakeUp() {
    const avatar = document.getElementById('assistantAvatar');
    avatar.style.transition = 'transform 0.5s ease-out';
    avatar.style.transform = 'scale(1.1)';
    
    setTimeout(() => {
        avatar.style.transform = 'scale(1)';
    }, 500);
}

function animateProcessing() {
    const avatar = document.getElementById('assistantAvatar');
    avatar.style.animation = 'pulse 0.5s ease-in-out 3';
    
    setTimeout(() => {
        avatar.style.animation = 'float 3s ease-in-out infinite';
    }, 1500);
}

function animateSuccess() {
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    
    leftEye.style.width = '16px';
    rightEye.style.width = '16px';
    
    setTimeout(() => {
        leftEye.style.width = '12px';
        rightEye.style.width = '12px';
    }, 500);
}

function animateElements() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'rotateY(360deg)';
            card.style.transition = 'transform 0.6s';
            
            setTimeout(() => {
                card.style.transform = 'rotateY(0)';
            }, 600);
        }, index * 100);
    });
}

// DOM manipulation functions
function changeTitle(newTitle) {
    const titleElement = document.getElementById('siteTitle');
    titleElement.classList.add('highlight');
    titleElement.textContent = newTitle;
    setTimeout(() => titleElement.classList.remove('highlight'), 2000);
}

function changeSubtitle(newSubtitle) {
    const subtitleElement = document.getElementById('siteSubtitle');
    subtitleElement.classList.add('highlight');
    subtitleElement.textContent = newSubtitle;
    setTimeout(() => subtitleElement.classList.remove('highlight'), 2000);
}

function changeBackground(color) {
    document.querySelector('.preview-content').style.backgroundColor = color;
}

function changeButtonColor(color) {
    const ctaSection = document.getElementById('ctaSection');
    ctaSection.style.backgroundColor = color;
    ctaSection.classList.add('highlight');
    setTimeout(() => ctaSection.classList.remove('highlight'), 2000);
}

function changeButtonText(text) {
    const button = document.querySelector('.cta-button');
    button.classList.add('highlight');
    button.textContent = text;
    setTimeout(() => button.classList.remove('highlight'), 2000);
}

function addFeature() {
    const featuresContainer = document.getElementById('features');
    const icons = ['✨', '💡', '🎯', '🔧', '📈', '🎉'];
    const titles = ['Innovation', 'Smart Features', 'Precision Tools', 'Easy Setup', 'Analytics', 'Celebration Mode'];
    const descriptions = [
        'Cutting-edge technology at your fingertips',
        'Intelligent automation that learns from you',
        'Targeted solutions for your needs',
        'Get started in minutes, not hours',
        'Deep insights into your performance',
        'Because success should be celebrated'
    ];
    const randomIndex = Math.floor(Math.random() * icons.length);
    
    const newFeature = document.createElement('div');
    newFeature.className = 'feature-card';
    newFeature.innerHTML = `
        <div class="feature-icon">${icons[randomIndex]}</div>
        <h3>${titles[randomIndex]}</h3>
        <p>${descriptions[randomIndex]}</p>
    `;
    newFeature.classList.add('highlight');
    newFeature.style.opacity = '0';
    newFeature.style.transform = 'scale(0.8)';
    featuresContainer.appendChild(newFeature);
    
    setTimeout(() => {
        newFeature.style.transition = 'all 0.5s ease-out';
        newFeature.style.opacity = '1';
        newFeature.style.transform = 'scale(1)';
    }, 100);
    
    setTimeout(() => newFeature.classList.remove('highlight'), 2000);
}

function removeFeature() {
    const features = document.querySelectorAll('.feature-card');
    if (features.length > 1) {
        const lastFeature = features[features.length - 1];
        lastFeature.style.transform = 'scale(0) rotate(180deg)';
        lastFeature.style.opacity = '0';
        setTimeout(() => {
            lastFeature.remove();
        }, 500);
        return true;
    }
    return false;
}

function addCommandToHistory(command) {
    const historyContainer = document.getElementById('commandHistory');
    const commandItem = document.createElement('div');
    commandItem.className = 'command-item';
    commandItem.textContent = command;
    commandItem.style.opacity = '0';
    historyContainer.appendChild(commandItem);
    
    setTimeout(() => {
        commandItem.style.opacity = '1';
    }, 100);
    
    // Limit history items
    const items = historyContainer.querySelectorAll('.command-item');
    if (items.length > DEMO_SETTINGS.maxCommandHistory) {
        items[0].remove();
    }
    
    historyContainer.scrollTop = historyContainer.scrollHeight;
}

// Test speech function
function testSpeech() {
    const testMessage = FEATURES.useOpenAI 
        ? "Hello! I'm Sentauri, powered by OpenAI. I can help you modify websites using advanced AI understanding."
        : "Hello! I'm Sentauri, your AI website assistant. I can help you modify websites using voice commands.";
    
    speak(testMessage);
    trackEvent('test_voice_clicked');
}

// Demo mode for browsers without speech recognition
function simulateCommand() {
    const demoCommands = [
        "Change the title to AI-Powered Solutions",
        "Make the background blue",
        "Change button text to Get Started Now",
        "Add a new feature",
        "Change button color to purple",
        "Animate the page",
        "Make the background dark"
    ];
    const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
    
    if (!isListening) {
        startListening();
        setTimeout(() => {
            processCommandWithAI(randomCommand);
            setTimeout(() => {
                stopListening();
            }, 1000);
        }, 1500);
    }
}

// Complete voice interaction (all-in-one)
async function completeVoiceInteraction() {
    if (!FEATURES.useCompleteAPI || !window.SentauriConfig.OPENAI_API_KEY) {
        return;
    }
    
    try {
        // Record audio
        if (!mediaRecorder) {
            await initializeRecording();
        }
        
        // Start recording
        audioChunks = [];
        mediaRecorder.start();
        
        // Stop after 5 seconds
        setTimeout(async () => {
            mediaRecorder.stop();
            
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', audioBlob);
            
            // Send to complete endpoint
            const response = await fetch(`${API_URL}/api/voice-interact`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Execute command
                executeCommand(result.command);
                
                // Play audio response
                const audio = new Audio(result.audioUrl);
                audio.play();
                
                addCommandToHistory(`You: "${result.transcript}"`);
                addCommandToHistory(`Sentauri: ${result.command.response}`);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Complete voice interaction failed:', error);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        simulateCommand();
    }
});

// Ambient animations
setInterval(() => {
    if (!isListening && !isSpeaking) {
        const leftEye = document.getElementById('leftEye');
        const rightEye = document.getElementById('rightEye');
        
        if (Math.random() > 0.95) {
            leftEye.style.transform = 'scaleY(0.1)';
            rightEye.style.transform = 'scaleY(0.1)';
            
            setTimeout(() => {
                leftEye.style.transform = 'scaleY(1)';
                rightEye.style.transform = 'scaleY(1)';
            }, 150);
        }
    }
}, 2000);

// Welcome message on load
window.addEventListener('load', () => {
    trackEvent('page_view', { page: 'demo' });
    
    const welcomeMessage = FEATURES.useOpenAI 
        ? "Welcome! I'm Sentauri, enhanced with OpenAI. Click the microphone to start modifying this website with natural language."
        : "Welcome! I'm Sentauri. Click the microphone button to start modifying this website with your voice.";
    
    setTimeout(() => {
        speak(welcomeMessage, () => {
            const button = document.getElementById('voiceButton');
            button.style.animation = 'pulse 2s ease-in-out 3';
        });
    }, 1000);
});
