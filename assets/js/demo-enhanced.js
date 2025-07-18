// Enhanced Demo JavaScript with Full Voice Capabilities
// Voice Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;
let utterance = null;

// Elements
const aiAvatar = document.getElementById('aiAvatar');
const voiceButton = document.getElementById('voiceButton');
const voiceStatus = document.getElementById('voiceStatus');
const commandList = document.getElementById('commandList');
const voiceResponse = document.getElementById('voiceResponse');
const helpTooltip = document.getElementById('helpTooltip');

// Initialize Speech Recognition
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        aiAvatar.classList.add('listening');
        voiceStatus.textContent = 'Listening...';
        voiceStatus.classList.add('active');
        voiceButton.textContent = '⏸️ Stop Listening';
    };

    recognition.onend = () => {
        isListening = false;
        aiAvatar.classList.remove('listening');
        voiceStatus.textContent = 'Click to speak again';
        voiceStatus.classList.remove('active');
        voiceButton.textContent = '🎙️ Try Voice Command';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        aiAvatar.classList.remove('listening');
        aiAvatar.classList.add('processing');
        voiceStatus.textContent = 'Processing command...';
        
        // Add user command to history
        addToConversation(transcript, 'user');
        
        setTimeout(() => {
            processCommand(transcript);
            aiAvatar.classList.remove('processing');
        }, 500);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        voiceStatus.textContent = 'Error: ' + event.error;
        const errorMessage = `Sorry, I encountered an error: ${event.error}. Please try again.`;
        addToConversation(errorMessage, 'ai', false);
        setTimeout(() => {
            voiceStatus.textContent = 'Click to try again';
        }, 3000);
    };
}

// Toggle voice recognition
function toggleVoice() {
    if (!recognition) {
        const message = "Sorry, your browser doesn't support voice commands. Try Chrome or Edge.";
        showResponse(message);
        addToConversation(message, 'ai', false);
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Process voice commands
function processCommand(command) {
    const lowerCommand = command.toLowerCase();
    let actionTaken = false;
    let responseText = '';

    // Title changes
    if (lowerCommand.includes('title') || lowerCommand.includes('heading')) {
        const titleMatch = command.match(/(?:to|say|says)\s+(.+)/i);
        if (titleMatch) {
            const newTitle = titleMatch[1];
            updateElement('websiteTitle', newTitle);
            responseText = `I've updated the title to "${newTitle}"`;
            actionTaken = true;
        }
    }
    // Subtitle changes
    else if (lowerCommand.includes('subtitle') || lowerCommand.includes('description')) {
        const subtitleMatch = command.match(/(?:to|say|says)\s+(.+)/i);
        if (subtitleMatch) {
            const newSubtitle = subtitleMatch[1];
            updateElement('websiteSubtitle', newSubtitle);
            responseText = `Perfect! The subtitle now reads "${newSubtitle}"`;
            actionTaken = true;
        }
    }
    // Logo/Brand changes
    else if (lowerCommand.includes('logo') || lowerCommand.includes('brand')) {
        const logoMatch = command.match(/(?:to|say|says)\s+(.+)/i);
        if (logoMatch) {
            const newLogo = logoMatch[1];
            updateElement('previewLogo', newLogo);
            updateElement('footerBrand', newLogo);
            responseText = `The brand name is now "${newLogo}"`;
            actionTaken = true;
        }
    }
    // Badge text
    else if (lowerCommand.includes('badge')) {
        const badgeMatch = command.match(/(?:to|say|says)\s+(.+)/i);
        if (badgeMatch) {
            const newBadge = badgeMatch[1];
            const badge = document.getElementById('heroBadge');
            badge.innerHTML = `<span>🚀</span><span>${newBadge}</span>`;
            highlightElement(badge);
            responseText = `Badge updated to "${newBadge}"`;
            actionTaken = true;
        }
    }
    // Button text changes
    else if (lowerCommand.includes('button')) {
        if (lowerCommand.includes('primary') || lowerCommand.includes('first')) {
            const buttonMatch = command.match(/(?:to|say|says)\s+(.+)/i);
            if (buttonMatch) {
                updateElement('websiteButton', buttonMatch[1]);
                responseText = `Primary button now says "${buttonMatch[1]}"`;
                actionTaken = true;
            }
        } else if (lowerCommand.includes('secondary') || lowerCommand.includes('second')) {
            const buttonMatch = command.match(/(?:to|say|says)\s+(.+)/i);
            if (buttonMatch) {
                updateElement('secondaryButton', buttonMatch[1]);
                responseText = `Secondary button updated to "${buttonMatch[1]}"`;
                actionTaken = true;
            }
        } else {
            const buttonMatch = command.match(/(?:to|say|says)\s+(.+)/i);
            if (buttonMatch) {
                updateElement('websiteButton', buttonMatch[1]);
                responseText = `Button text changed to "${buttonMatch[1]}"`;
                actionTaken = true;
            }
        }
    }
    // Stats changes
    else if (lowerCommand.includes('stat') || lowerCommand.includes('number')) {
        if (lowerCommand.includes('user')) {
            const statMatch = command.match(/(\d+[kKmM]?\+?)/);
            if (statMatch) {
                updateElement('stat1', statMatch[1].toUpperCase());
                responseText = `User count updated to ${statMatch[1]}`;
                actionTaken = true;
            }
        }
    }
    // CTA changes
    else if (lowerCommand.includes('cta')) {
        const ctaMatch = command.match(/(?:to|say|says)\s+(.+)/i);
        if (ctaMatch) {
            updateElement('ctaTitle', ctaMatch[1]);
            responseText = `Call-to-action updated to "${ctaMatch[1]}"`;
            actionTaken = true;
        }
    }
    // Add gradient
    else if (lowerCommand.includes('gradient')) {
        if (lowerCommand.includes('remove')) {
            document.getElementById('websiteTitle').classList.remove('gradient');
            responseText = "I've removed the gradient effect";
        } else {
            document.getElementById('websiteTitle').classList.add('gradient');
            responseText = "I've applied a beautiful gradient effect to the title";
        }
        actionTaken = true;
    }
    // Background changes
    else if (lowerCommand.includes('background')) {
        const wrapper = document.querySelector('.preview-wrapper');
        if (lowerCommand.includes('dark')) {
            wrapper.style.background = 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)';
            responseText = "I've made the background darker for you";
            actionTaken = true;
        } else if (lowerCommand.includes('light')) {
            wrapper.style.background = 'linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)';
            responseText = "I've lightened the background";
            actionTaken = true;
        } else if (lowerCommand.includes('blue')) {
            wrapper.style.background = 'linear-gradient(180deg, #0a0f1c 0%, #050810 100%)';
            responseText = "I've added a blue tint to the background";
            actionTaken = true;
        }
    }
    // Add feature
    else if (lowerCommand.includes('add') && lowerCommand.includes('feature')) {
        addNewFeature();
        responseText = "I've added a new feature card for you";
        actionTaken = true;
    }
    // Remove feature
    else if (lowerCommand.includes('remove') && lowerCommand.includes('feature')) {
        const features = document.querySelectorAll('.feature-card');
        if (features.length > 1) {
            features[features.length - 1].style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => features[features.length - 1].remove(), 500);
            responseText = "I've removed the last feature card";
            actionTaken = true;
        }
    }
    // Animate
    else if (lowerCommand.includes('animate')) {
        animatePage();
        responseText = "Here's a smooth animation for your page";
        actionTaken = true;
    }
    // Show/Hide elements
    else if (lowerCommand.includes('hide')) {
        if (lowerCommand.includes('nav')) {
            const navbar = document.getElementById('previewNavbar');
            navbar.style.opacity = '0';
            navbar.style.transform = 'translateY(-100%)';
            navbar.style.pointerEvents = 'none';
            responseText = "I've hidden the navigation bar";
            actionTaken = true;
        } else if (lowerCommand.includes('stats')) {
            const stats = document.getElementById('statsSection');
            stats.style.opacity = '0';
            stats.style.transform = 'scale(0.9)';
            stats.style.height = '0';
            stats.style.overflow = 'hidden';
            stats.style.padding = '0';
            responseText = "I've hidden the statistics section";
            actionTaken = true;
        }
    }
    else if (lowerCommand.includes('show')) {
        if (lowerCommand.includes('nav')) {
            const navbar = document.getElementById('previewNavbar');
            navbar.style.opacity = '1';
            navbar.style.transform = 'translateY(0)';
            navbar.style.pointerEvents = 'auto';
            responseText = "The navigation bar is now visible";
            actionTaken = true;
        } else if (lowerCommand.includes('stats')) {
            const stats = document.getElementById('statsSection');
            stats.style.opacity = '1';
            stats.style.transform = 'scale(1)';
            stats.style.height = 'auto';
            stats.style.overflow = 'visible';
            stats.style.padding = '80px 48px';
            responseText = "The statistics section is now visible";
            actionTaken = true;
        }
    }
    // Theme switching
    else if (lowerCommand.includes('theme') || lowerCommand.includes('mode')) {
        if (lowerCommand.includes('light') || lowerCommand.includes('white')) {
            if (isDarkTheme) {
                toggleTheme();
                responseText = "I've switched to light theme for better daytime viewing";
            } else {
                responseText = "Already using light theme";
            }
            actionTaken = true;
        } else if (lowerCommand.includes('dark') || lowerCommand.includes('black')) {
            if (!isDarkTheme) {
                toggleTheme();
                responseText = "I've switched to dark theme for a more comfortable viewing experience";
            } else {
                responseText = "Already using dark theme";
            }
            actionTaken = true;
        } else if (lowerCommand.includes('toggle') || lowerCommand.includes('switch')) {
            toggleTheme();
            responseText = isDarkTheme ? "Switched to dark theme" : "Switched to light theme";
            actionTaken = true;
        } else if (lowerCommand.includes('blue')) {
            applyColorTheme('blue');
            responseText = "I've applied a blue color theme";
            actionTaken = true;
        } else if (lowerCommand.includes('green')) {
            applyColorTheme('green');
            responseText = "I've switched to a green color theme";
            actionTaken = true;
        } else if (lowerCommand.includes('purple')) {
            applyColorTheme('purple');
            responseText = "I've applied a purple color theme";
            actionTaken = true;
        }
    }
    // Scroll commands
    else if (lowerCommand.includes('scroll')) {
        const isMobileView = previewPanel.classList.contains('mobile-view');
        const scrollContainer = isMobileView ? mobileScreen : document.querySelector('.preview-content');
        
        if (lowerCommand.includes('top')) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            responseText = "Scrolling to the top of the page";
            actionTaken = true;
        } else if (lowerCommand.includes('bottom')) {
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
            responseText = "Scrolling to the bottom of the page";
            actionTaken = true;
        } else if (lowerCommand.includes('features')) {
            document.getElementById('featuresSection').scrollIntoView({ behavior: 'smooth' });
            responseText = "Navigating to the features section";
            actionTaken = true;
        } else if (lowerCommand.includes('stats')) {
            document.getElementById('statsSection').scrollIntoView({ behavior: 'smooth' });
            responseText = "Showing the statistics section";
            actionTaken = true;
        }
    }
    // Help
    else if (lowerCommand.includes('help') || lowerCommand.includes('hello')) {
        responseText = "Hello! I can help you edit this website. Try commands like 'Change the title to...', 'Add a gradient', 'Change the logo to...', 'Hide the stats', 'Switch to light theme', 'Apply blue theme', or 'Scroll to features'";
        actionTaken = true;
        showHelpTooltip();
    }

    // Add AI response to conversation
    if (actionTaken) {
        addToConversation(responseText, 'ai', true);
        showResponse(responseText);
        speak(responseText);
    } else {
        const errorResponse = "I didn't quite understand that. Try saying 'Change the title to...' or 'Add a new feature'";
        addToConversation(errorResponse, 'ai', false);
        showResponse(errorResponse);
        speak(errorResponse);
    }
}

// Add to conversation history
function addToConversation(text, type, success = true) {
    const commandItem = document.createElement('div');
    commandItem.className = `command-item ${type === 'user' ? 'user-command' : 'ai-response'}`;
    
    const icon = type === 'user' ? '👤' : '🤖';
    const iconClass = type === 'user' ? '' : (success ? 'success' : 'error');
    
    commandItem.innerHTML = `
        <span class="command-icon ${iconClass}">${icon}</span>
        <div>
            <span class="command-text">${text}</span>
            <div class="command-timestamp">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    commandList.appendChild(commandItem);
    
    // Auto-scroll to the latest message
    commandList.scrollTop = commandList.scrollHeight;
}

// Update element with highlight effect
function updateElement(elementId, newText) {
    const element = document.getElementById(elementId);
    if (element) {
        highlightElement(element);
        element.textContent = newText;
        
        // If in mobile view, update the cloned element too
        if (previewPanel.classList.contains('mobile-view')) {
            const mobileElement = mobileScreen.querySelector('#' + elementId);
            if (mobileElement) {
                highlightElement(mobileElement);
                mobileElement.textContent = newText;
            }
        }
    }
}

// Highlight element
function highlightElement(element) {
    element.classList.add('active');
    setTimeout(() => {
        element.classList.remove('active');
    }, 2000);
}

// Add new feature card
function addNewFeature() {
    const featuresGrid = document.querySelector('.features-grid');
    const icons = ['✨', '🔥', '💡', '⭐', '🎯', '🏆'];
    const titles = ['AI-Powered', 'Real-time Sync', 'Analytics', 'Collaboration', 'Automation', 'Integration'];
    const descs = [
        'Leverage cutting-edge AI technology to enhance your workflow',
        'Keep your data synchronized across all devices in real-time',
        'Get detailed insights and analytics about your website performance',
        'Work together with your team in real-time collaboration',
        'Automate repetitive tasks and focus on what matters',
        'Connect with your favorite tools and services seamlessly'
    ];
    
    const randomIndex = Math.floor(Math.random() * icons.length);
    
    const newFeature = document.createElement('div');
    newFeature.className = 'feature-card';
    newFeature.innerHTML = `
        <div class="feature-icon">${icons[randomIndex]}</div>
        <h3 class="feature-title">${titles[randomIndex]}</h3>
        <p class="feature-desc">${descs[randomIndex]}</p>
    `;
    newFeature.style.animation = 'fadeIn 0.6s ease-out';
    featuresGrid.appendChild(newFeature);
}

// Apply color theme
function applyColorTheme(theme) {
    const root = document.documentElement;
    const themes = {
        blue: {
            primary: '#3B82F6',
            secondary: '#60A5FA',
            accent: '#1E40AF'
        },
        green: {
            primary: '#10B981',
            secondary: '#34D399',
            accent: '#059669'
        },
        purple: {
            primary: '#8B5CF6',
            secondary: '#A78BFA',
            accent: '#6D28D9'
        }
    };

    if (themes[theme]) {
        root.style.setProperty('--sentauri-blue', themes[theme].primary);
        root.style.setProperty('--sentauri-cyan', themes[theme].secondary);
        root.style.setProperty('--sentauri-green', themes[theme].accent);
    }
}

// Animate page
function animatePage() {
    const sections = [
        document.getElementById('heroSection'),
        document.getElementById('statsSection'),
        document.getElementById('featuresSection'),
        document.getElementById('ctaSection')
    ];

    sections.forEach((section, index) => {
        if (section) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.6s ease-out';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}

// Add CSS for fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
`;
document.head.appendChild(style);

// Show voice response
function showResponse(text) {
    voiceResponse.textContent = text;
    voiceResponse.classList.add('show');
    
    setTimeout(() => {
        voiceResponse.classList.remove('show');
    }, 4000);
}

// Text to speech
function speak(text) {
    if ('speechSynthesis' in window) {
        if (utterance) {
            speechSynthesis.cancel();
        }
        
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        
        // Add speaking visual feedback
        utterance.onstart = () => {
            aiAvatar.classList.add('speaking');
        };
        
        utterance.onend = () => {
            aiAvatar.classList.remove('speaking');
        };
        
        speechSynthesis.speak(utterance);
    }
}

// Show help tooltip
function showHelpTooltip() {
    helpTooltip.classList.add('show');
    setTimeout(() => {
        helpTooltip.classList.remove('show');
    }, 5000);
}

// Theme Toggle Functionality
const themeToggleBtn = document.getElementById('themeToggleBtn');
let isDarkTheme = true;

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const previewWrapper = document.querySelector('.preview-content .preview-wrapper');
    const mobileWrapper = document.querySelector('.mobile-screen .preview-wrapper');
    const sunIcon = themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = themeToggleBtn.querySelector('.moon-icon');
    
    if (isDarkTheme) {
        if (previewWrapper) {
            previewWrapper.classList.remove('light-theme');
        }
        if (mobileWrapper) {
            mobileWrapper.classList.remove('light-theme');
        }
        // Show sun icon (click to switch to light mode)
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        showResponse('Switched to dark theme');
        addToConversation('Switched to dark theme', 'ai', true);
    } else {
        if (previewWrapper) {
            previewWrapper.classList.add('light-theme');
        }
        if (mobileWrapper) {
            mobileWrapper.classList.add('light-theme');
        }
        // Show moon icon (click to switch to dark mode)
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        showResponse('Switched to light theme');
        addToConversation('Switched to light theme', 'ai', true);
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

// Screen toggle functionality
const webViewBtn = document.getElementById('webViewBtn');
const mobileViewBtn = document.getElementById('mobileViewBtn');
const previewPanel = document.querySelector('.preview-panel');
const mobileScreen = document.getElementById('mobileScreen');
const urlText = document.querySelector('.url-text');

function switchToWebView() {
    previewPanel.classList.remove('mobile-view');
    webViewBtn.classList.add('active');
    mobileViewBtn.classList.remove('active');
    urlText.textContent = 'https://preview.sentauri.ai/demo';
}

function switchToMobileView() {
    previewPanel.classList.add('mobile-view');
    mobileViewBtn.classList.add('active');
    webViewBtn.classList.remove('active');
    urlText.textContent = 'https://m.sentauri.ai/demo';
    
    // Clone the entire preview wrapper content to mobile screen
    const originalWrapper = document.querySelector('.preview-content > .preview-wrapper');
    if (originalWrapper) {
        const clonedWrapper = originalWrapper.cloneNode(true);
        mobileScreen.innerHTML = '';
        mobileScreen.appendChild(clonedWrapper);
        
        // Force a reflow to ensure styles are applied
        mobileScreen.offsetHeight;
        
        // Re-attach event listeners to cloned elements
        reattachMobileEventListeners();
    } else {
        console.error('Could not find preview wrapper to clone');
    }
}

function reattachMobileEventListeners() {
    // Re-attach any necessary event listeners to elements in mobile view
    const mobileElements = mobileScreen.querySelectorAll('.element-highlight');
    mobileElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        el.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
}

webViewBtn.addEventListener('click', switchToWebView);
mobileViewBtn.addEventListener('click', switchToMobileView);

// Event listeners
aiAvatar.addEventListener('click', toggleVoice);
voiceButton.addEventListener('click', toggleVoice);

// Show initial welcome message
window.addEventListener('load', () => {
    const welcomeMessage = "Welcome to Sentauri Voice Demo! I'm ready to help you edit this website using voice commands. Click the avatar or button to start speaking.";
    addToConversation(welcomeMessage, 'ai', true);
    showHelpTooltip();
    // Briefly highlight all editable elements
    highlightEditableElements();
});

// Highlight all editable elements briefly
function highlightEditableElements() {
    const editables = document.querySelectorAll('.element-highlight');
    editables.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('active');
            setTimeout(() => {
                el.classList.remove('active');
            }, 800);
        }, index * 100);
    });
}

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        toggleVoice();
    }
});