// Voice Recognition Module for Sentauri Voice Demo
class VoiceRecognition {
    constructor() {
        this.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = null;
        this.isListening = false;
        this.utterance = null;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.onStartCallback = null;
        this.onEndCallback = null;
        
        this.initializeRecognition();
    }
    
    initializeRecognition() {
        if (!this.SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }
        
        this.recognition = new this.SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        // Set up event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onStartCallback) {
                this.onStartCallback();
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.onResultCallback) {
                this.onResultCallback(transcript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }
        };
    }
    
    // Start listening
    start() {
        if (!this.recognition) {
            return false;
        }
        
        if (!this.isListening) {
            this.recognition.start();
            return true;
        }
        return false;
    }
    
    // Stop listening
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    // Toggle listening state
    toggle() {
        if (!this.recognition) {
            return false;
        }
        
        if (this.isListening) {
            this.stop();
        } else {
            this.start();
        }
        return true;
    }
    
    // Set callbacks
    onStart(callback) {
        this.onStartCallback = callback;
    }
    
    onEnd(callback) {
        this.onEndCallback = callback;
    }
    
    onResult(callback) {
        this.onResultCallback = callback;
    }
    
    onError(callback) {
        this.onErrorCallback = callback;
    }
    
    // Text to speech
    speak(text, onStart, onEnd) {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis not supported in this browser');
            return;
        }
        
        // Cancel any ongoing speech
        if (this.utterance) {
            speechSynthesis.cancel();
        }
        
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = 1.0;
        this.utterance.pitch = 1.1;
        this.utterance.volume = 0.9;
        
        if (onStart) {
            this.utterance.onstart = onStart;
        }
        
        if (onEnd) {
            this.utterance.onend = onEnd;
        }
        
        speechSynthesis.speak(this.utterance);
    }
    
    // Check if browser supports voice recognition
    isSupported() {
        return !!this.SpeechRecognition;
    }
    
    // Get listening state
    getIsListening() {
        return this.isListening;
    }
}

// Command Processor for voice commands
class CommandProcessor {
    constructor() {
        this.commands = new Map();
        this.setupDefaultCommands();
    }
    
    setupDefaultCommands() {
        // Title commands
        this.addCommand(['title', 'heading'], (command) => {
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            if (match) {
                return {
                    action: 'updateElement',
                    target: 'websiteTitle',
                    value: match[1],
                    message: `I've updated the title to "${match[1]}"`
                };
            }
            return null;
        });
        
        // Subtitle commands
        this.addCommand(['subtitle', 'description'], (command) => {
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            if (match) {
                return {
                    action: 'updateElement',
                    target: 'websiteSubtitle',
                    value: match[1],
                    message: `Perfect! The subtitle now reads "${match[1]}"`
                };
            }
            return null;
        });
        
        // Logo/Brand commands
        this.addCommand(['logo', 'brand'], (command) => {
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            if (match) {
                return {
                    action: 'updateMultipleElements',
                    targets: ['previewLogo', 'footerBrand'],
                    value: match[1],
                    message: `The brand name is now "${match[1]}"`
                };
            }
            return null;
        });
        
        // Badge commands
        this.addCommand(['badge'], (command) => {
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            if (match) {
                return {
                    action: 'updateBadge',
                    value: match[1],
                    message: `Badge updated to "${match[1]}"`
                };
            }
            return null;
        });
        
        // Button commands
        this.addCommand(['button'], (command) => {
            const lowerCommand = command.toLowerCase();
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            
            if (!match) return null;
            
            if (lowerCommand.includes('primary') || lowerCommand.includes('first')) {
                return {
                    action: 'updateElement',
                    target: 'websiteButton',
                    value: match[1],
                    message: `Primary button now says "${match[1]}"`
                };
            } else if (lowerCommand.includes('secondary') || lowerCommand.includes('second')) {
                return {
                    action: 'updateElement',
                    target: 'secondaryButton',
                    value: match[1],
                    message: `Secondary button updated to "${match[1]}"`
                };
            } else {
                return {
                    action: 'updateElement',
                    target: 'websiteButton',
                    value: match[1],
                    message: `Button text changed to "${match[1]}"`
                };
            }
        });
        
        // Stats commands
        this.addCommand(['stat', 'number'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('user')) {
                const match = command.match(/(\d+[kKmM]?\+?)/);
                if (match) {
                    return {
                        action: 'updateElement',
                        target: 'stat1',
                        value: match[1].toUpperCase(),
                        message: `User count updated to ${match[1]}`
                    };
                }
            }
            return null;
        });
        
        // CTA commands
        this.addCommand(['cta'], (command) => {
            const match = command.match(/(?:to|say|says)\s+(.+)/i);
            if (match) {
                return {
                    action: 'updateElement',
                    target: 'ctaTitle',
                    value: match[1],
                    message: `Call-to-action updated to "${match[1]}"`
                };
            }
            return null;
        });
        
        // Gradient commands
        this.addCommand(['gradient'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('remove')) {
                return {
                    action: 'removeGradient',
                    message: "I've removed the gradient effect"
                };
            } else {
                return {
                    action: 'addGradient',
                    message: "I've applied a beautiful gradient effect to the title"
                };
            }
        });
        
        // Background commands
        this.addCommand(['background'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('dark')) {
                return {
                    action: 'changeBackground',
                    value: 'dark',
                    message: "I've made the background darker for you"
                };
            } else if (lowerCommand.includes('light')) {
                return {
                    action: 'changeBackground',
                    value: 'light',
                    message: "I've lightened the background"
                };
            } else if (lowerCommand.includes('blue')) {
                return {
                    action: 'changeBackground',
                    value: 'blue',
                    message: "I've added a blue tint to the background"
                };
            }
            return null;
        });
        
        // Feature commands
        this.addCommand(['add', 'feature'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('add') && lowerCommand.includes('feature')) {
                return {
                    action: 'addFeature',
                    message: "I've added a new feature card for you"
                };
            }
            return null;
        });
        
        this.addCommand(['remove', 'feature'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('remove') && lowerCommand.includes('feature')) {
                return {
                    action: 'removeFeature',
                    message: "I've removed the last feature card"
                };
            }
            return null;
        });
        
        // Animate command
        this.addCommand(['animate'], (command) => {
            return {
                action: 'animatePage',
                message: "Here's a smooth animation for your page"
            };
        });
        
        // Show/Hide commands
        this.addCommand(['hide'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('nav')) {
                return {
                    action: 'hideElement',
                    target: 'navbar',
                    message: "I've hidden the navigation bar"
                };
            } else if (lowerCommand.includes('stats')) {
                return {
                    action: 'hideElement',
                    target: 'stats',
                    message: "I've hidden the statistics section"
                };
            }
            return null;
        });
        
        this.addCommand(['show'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('nav')) {
                return {
                    action: 'showElement',
                    target: 'navbar',
                    message: "The navigation bar is now visible"
                };
            } else if (lowerCommand.includes('stats')) {
                return {
                    action: 'showElement',
                    target: 'stats',
                    message: "The statistics section is now visible"
                };
            }
            return null;
        });
        
        // Theme commands
        this.addCommand(['theme', 'mode'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('light') || lowerCommand.includes('white')) {
                return {
                    action: 'setTheme',
                    value: 'light',
                    message: "I've switched to light theme for better daytime viewing"
                };
            } else if (lowerCommand.includes('dark') || lowerCommand.includes('black')) {
                return {
                    action: 'setTheme',
                    value: 'dark',
                    message: "I've switched to dark theme for a more comfortable viewing experience"
                };
            } else if (lowerCommand.includes('toggle') || lowerCommand.includes('switch')) {
                return {
                    action: 'toggleTheme',
                    message: "Theme toggled"
                };
            } else if (lowerCommand.includes('blue')) {
                return {
                    action: 'applyColorTheme',
                    value: 'blue',
                    message: "I've applied a blue color theme"
                };
            } else if (lowerCommand.includes('green')) {
                return {
                    action: 'applyColorTheme',
                    value: 'green',
                    message: "I've switched to a green color theme"
                };
            } else if (lowerCommand.includes('purple')) {
                return {
                    action: 'applyColorTheme',
                    value: 'purple',
                    message: "I've applied a purple color theme"
                };
            }
            return null;
        });
        
        // Scroll commands
        this.addCommand(['scroll'], (command) => {
            const lowerCommand = command.toLowerCase();
            if (lowerCommand.includes('top')) {
                return {
                    action: 'scroll',
                    target: 'top',
                    message: "Scrolling to the top of the page"
                };
            } else if (lowerCommand.includes('bottom')) {
                return {
                    action: 'scroll',
                    target: 'bottom',
                    message: "Scrolling to the bottom of the page"
                };
            } else if (lowerCommand.includes('features')) {
                return {
                    action: 'scroll',
                    target: 'features',
                    message: "Navigating to the features section"
                };
            } else if (lowerCommand.includes('stats')) {
                return {
                    action: 'scroll',
                    target: 'stats',
                    message: "Showing the statistics section"
                };
            }
            return null;
        });
        
        // Help command
        this.addCommand(['help', 'hello'], (command) => {
            return {
                action: 'help',
                message: "Hello! I can help you edit this website. Try commands like 'Change the title to...', 'Add a gradient', 'Change the logo to...', 'Hide the stats', 'Switch to light theme', 'Apply blue theme', or 'Scroll to features'"
            };
        });
    }
    
    addCommand(keywords, handler) {
        keywords.forEach(keyword => {
            this.commands.set(keyword, handler);
        });
    }
    
    process(command) {
        const lowerCommand = command.toLowerCase();
        
        // Check each command handler
        for (const [keyword, handler] of this.commands) {
            if (lowerCommand.includes(keyword)) {
                const result = handler(command);
                if (result) {
                    return { success: true, ...result };
                }
            }
        }
        
        // No matching command found
        return {
            success: false,
            message: "I didn't quite understand that. Try saying 'Change the title to...' or 'Add a new feature'"
        };
    }
}

// Export for use in other modules
window.VoiceRecognition = VoiceRecognition;
window.CommandProcessor = CommandProcessor;