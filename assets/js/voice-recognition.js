/**
 * Voice Recognition Module for Sentauri Voice Demo
 * Handles all speech recognition and text-to-speech functionality
 */

class VoiceRecognition {
    constructor() {
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = null;
        this.isListening = false;
        this.utterance = null;
        this.callbacks = {
            onStart: null,
            onEnd: null,
            onResult: null,
            onError: null
        };
        
        this.initialize();
    }

    initialize() {
        if (!this.SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return false;
        }

        this.recognition = new this.SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.setupEventHandlers();
        return true;
    }

    setupEventHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.callbacks.onEnd) {
                this.callbacks.onEnd();
            }
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            if (this.callbacks.onResult) {
                this.callbacks.onResult(transcript, confidence);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.callbacks.onError) {
                this.callbacks.onError(event.error);
            }
        };
    }

    start() {
        if (!this.recognition) {
            return false;
        }
        
        if (!this.isListening) {
            try {
                this.recognition.start();
                return true;
            } catch (error) {
                console.error('Error starting recognition:', error);
                return false;
            }
        }
        return false;
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    toggle() {
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
    }

    speak(text, options = {}) {
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported in this browser');
            return false;
        }

        // Cancel any ongoing speech
        if (this.utterance) {
            speechSynthesis.cancel();
        }

        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Apply Sentauri voice parameters
        this.utterance.rate = options.rate || 1.0;
        this.utterance.pitch = options.pitch || 1.1;
        this.utterance.volume = options.volume || 0.9;
        
        // Select voice if specified
        if (options.voice) {
            const voices = speechSynthesis.getVoices();
            const selectedVoice = voices.find(voice => voice.name === options.voice);
            if (selectedVoice) {
                this.utterance.voice = selectedVoice;
            }
        }

        // Event handlers
        if (options.onStart) {
            this.utterance.onstart = options.onStart;
        }
        
        if (options.onEnd) {
            this.utterance.onend = options.onEnd;
        }

        speechSynthesis.speak(this.utterance);
        return true;
    }

    cancelSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }

    // Command processing helper
    processCommand(command) {
        const lowerCommand = command.toLowerCase();
        const commandPatterns = {
            title: {
                patterns: ['title', 'heading', 'headline'],
                extractor: /(?:to|say|says)\s+(.+)/i
            },
            subtitle: {
                patterns: ['subtitle', 'description', 'tagline'],
                extractor: /(?:to|say|says)\s+(.+)/i
            },
            logo: {
                patterns: ['logo', 'brand', 'company name'],
                extractor: /(?:to|say|says)\s+(.+)/i
            },
            badge: {
                patterns: ['badge', 'label', 'tag'],
                extractor: /(?:to|say|says)\s+(.+)/i
            },
            button: {
                patterns: ['button', 'cta', 'call to action'],
                extractor: /(?:to|say|says)\s+(.+)/i,
                modifiers: ['primary', 'secondary', 'first', 'second']
            },
            theme: {
                patterns: ['theme', 'mode', 'color scheme'],
                modifiers: ['light', 'dark', 'blue', 'green', 'purple']
            },
            animation: {
                patterns: ['animate', 'animation', 'move', 'transition']
            },
            visibility: {
                patterns: ['hide', 'show', 'toggle'],
                targets: ['nav', 'navigation', 'stats', 'statistics', 'features']
            },
            scroll: {
                patterns: ['scroll', 'go to', 'navigate to'],
                targets: ['top', 'bottom', 'features', 'stats', 'footer']
            }
        };

        // Analyze command
        for (const [action, config] of Object.entries(commandPatterns)) {
            const hasPattern = config.patterns.some(pattern => lowerCommand.includes(pattern));
            
            if (hasPattern) {
                const result = {
                    action,
                    command: command,
                    lowerCommand: lowerCommand
                };

                // Extract value if extractor is defined
                if (config.extractor) {
                    const match = command.match(config.extractor);
                    if (match) {
                        result.value = match[1];
                    }
                }

                // Check for modifiers
                if (config.modifiers) {
                    result.modifier = config.modifiers.find(mod => lowerCommand.includes(mod));
                }

                // Check for targets
                if (config.targets) {
                    result.target = config.targets.find(target => lowerCommand.includes(target));
                }

                return result;
            }
        }

        // Check for help/greeting
        if (lowerCommand.includes('help') || lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
            return { action: 'help' };
        }

        return null;
    }

    // Set callback functions
    on(event, callback) {
        const eventMap = {
            'start': 'onStart',
            'end': 'onEnd',
            'result': 'onResult',
            'error': 'onError'
        };

        if (eventMap[event]) {
            this.callbacks[eventMap[event]] = callback;
        }
    }

    // Check if browser supports speech recognition
    isSupported() {
        return !!this.SpeechRecognition;
    }

    // Get available voices for TTS
    getVoices() {
        if ('speechSynthesis' in window) {
            return speechSynthesis.getVoices();
        }
        return [];
    }
}

// Export for use in other modules
window.VoiceRecognition = VoiceRecognition;