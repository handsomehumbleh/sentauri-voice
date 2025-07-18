/**
 * Main Demo Controller for Sentauri Voice Demo
 * Coordinates voice recognition, animations, and UI updates
 */

class SentauriDemo {
    constructor() {
        // Initialize modules
        this.voice = new VoiceRecognition();
        this.animator = new AnimationController();
        
        // Demo state
        this.isDarkTheme = true;
        this.commandHistory = [];
        this.editableElements = new Map();
        
        // DOM Elements
        this.elements = {
            aiAvatar: document.getElementById('aiAvatar'),
            voiceButton: document.getElementById('voiceButton'),
            voiceStatus: document.getElementById('voiceStatus'),
            commandList: document.getElementById('commandList'),
            voiceResponse: document.getElementById('voiceResponse'),
            helpTooltip: document.getElementById('helpTooltip'),
            themeToggleBtn: document.getElementById('themeToggleBtn'),
            webViewBtn: document.getElementById('webViewBtn'),
            mobileViewBtn: document.getElementById('mobileViewBtn'),
            previewPanel: document.querySelector('.preview-panel'),
            mobileScreen: document.getElementById('mobileScreen'),
            neuralCanvas: document.getElementById('neuralCanvas')
        };
        
        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.registerEditableElements();
        this.showWelcomeMessage();
        
        // Initialize neural network animation if canvas exists
        if (this.elements.neuralCanvas) {
            this.animator.animateNeuralNetwork(this.elements.neuralCanvas);
        }
    }

    setupVoiceRecognition() {
        if (!this.voice.isSupported()) {
            this.showUnsupportedBrowserMessage();
            return;
        }

        // Set up voice recognition callbacks
        this.voice.on('start', () => {
            this.animator.setAvatarState(this.elements.aiAvatar, 'listening');
            this.updateVoiceStatus('Listening...', true);
            this.elements.voiceButton.textContent = '⏸️ Stop Listening';
        });

        this.voice.on('end', () => {
            this.animator.setAvatarState(this.elements.aiAvatar, null);
            this.updateVoiceStatus('Click to speak again', false);
            this.elements.voiceButton.textContent = '🎙️ Try Voice Command';
        });

        this.voice.on('result', (transcript, confidence) => {
            this.animator.setAvatarState(this.elements.aiAvatar, 'processing');
            this.updateVoiceStatus('Processing command...', true);
            
            // Add user command to history
            this.addToConversation(transcript, 'user');
            
            // Process command after short delay
            setTimeout(() => {
                this.processVoiceCommand(transcript);
            }, 500);
        });

        this.voice.on('error', (error) => {
            const errorMessage = this.getErrorMessage(error);
            this.addToConversation(errorMessage, 'ai', false);
            this.updateVoiceStatus('Click to try again', false);
        });
    }

    setupEventListeners() {
        // Voice controls
        this.elements.aiAvatar?.addEventListener('click', () => this.toggleVoice());
        this.elements.voiceButton?.addEventListener('click', () => this.toggleVoice());
        
        // Theme toggle
        this.elements.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());
        
        // View toggles
        this.elements.webViewBtn?.addEventListener('click', () => this.switchToWebView());
        this.elements.mobileViewBtn?.addEventListener('click', () => this.switchToMobileView());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                this.toggleVoice();
            }
        });
        
        // Avatar hover effects
        this.elements.aiAvatar?.addEventListener('mouseenter', () => {
            if (!this.voice.isListening) {
                this.elements.aiAvatar.style.transform = 'scale(1.05)';
            }
        });
        
        this.elements.aiAvatar?.addEventListener('mouseleave', () => {
            if (!this.voice.isListening) {
                this.elements.aiAvatar.style.transform = 'scale(1)';
            }
        });
    }

    registerEditableElements() {
        // Register all editable elements with their IDs and types
        const editableConfig = [
            { id: 'websiteTitle', type: 'text', description: 'main title' },
            { id: 'websiteSubtitle', type: 'text', description: 'subtitle' },
            { id: 'previewLogo', type: 'text', description: 'logo' },
            { id: 'footerBrand', type: 'text', description: 'footer brand' },
            { id: 'heroBadge', type: 'badge', description: 'hero badge' },
            { id: 'websiteButton', type: 'button', description: 'primary button' },
            { id: 'secondaryButton', type: 'button', description: 'secondary button' },
            { id: 'ctaTitle', type: 'text', description: 'CTA title' },
            { id: 'ctaSubtitle', type: 'text', description: 'CTA subtitle' },
            { id: 'ctaButton', type: 'button', description: 'CTA button' },
            { id: 'featuresTitle', type: 'text', description: 'features title' },
            { id: 'featuresSubtitle', type: 'text', description: 'features subtitle' },
            { id: 'footerDesc', type: 'text', description: 'footer description' },
            { id: 'footerCopyright', type: 'text', description: 'copyright text' }
        ];

        editableConfig.forEach(config => {
            const element = document.getElementById(config.id);
            if (element) {
                this.editableElements.set(config.id, {
                    element,
                    type: config.type,
                    description: config.description,
                    originalContent: element.textContent
                });
            }
        });
    }

    processVoiceCommand(transcript) {
        const command = this.voice.processCommand(transcript);
        
        if (!command) {
            this.handleUnknownCommand();
            return;
        }

        let response = '';
        let success = true;

        switch (command.action) {
            case 'title':
                response = this.updateTitle(command);
                break;
                
            case 'subtitle':
                response = this.updateSubtitle(command);
                break;
                
            case 'logo':
                response = this.updateLogo(command);
                break;
                
            case 'badge':
                response = this.updateBadge(command);
                break;
                
            case 'button':
                response = this.updateButton(command);
                break;
                
            case 'theme':
                response = this.handleThemeCommand(command);
                break;
                
            case 'animation':
                response = this.handleAnimationCommand(command);
                break;
                
            case 'visibility':
                response = this.handleVisibilityCommand(command);
                break;
                
            case 'scroll':
                response = this.handleScrollCommand(command);
                break;
                
            case 'help':
                response = this.showHelp();
                break;
                
            default:
                response = "I'm not sure how to handle that command yet.";
                success = false;
        }

        // Complete the command processing
        this.completeCommand(response, success);
    }

    updateTitle(command) {
        if (command.value) {
            this.updateElement('websiteTitle', command.value);
            return `I've updated the title to "${command.value}"`;
        }
        return "Please specify what you'd like the title to say.";
    }

    updateSubtitle(command) {
        if (command.value) {
            this.updateElement('websiteSubtitle', command.value);
            return `Perfect! The subtitle now reads "${command.value}"`;
        }
        return "Please specify what you'd like the subtitle to say.";
    }

    updateLogo(command) {
        if (command.value) {
            this.updateElement('previewLogo', command.value);
            this.updateElement('footerBrand', command.value);
            return `The brand name is now "${command.value}"`;
        }
        return "Please specify the new brand name.";
    }

    updateBadge(command) {
        if (command.value) {
            const badge = document.getElementById('heroBadge');
            if (badge) {
                badge.innerHTML = `<span>🚀</span><span>${command.value}</span>`;
                this.animator.highlightElement(badge);
                return `Badge updated to "${command.value}"`;
            }
        }
        return "Please specify what the badge should say.";
    }

    updateButton(command) {
        let buttonId = 'websiteButton';
        let buttonName = 'primary';
        
        if (command.modifier) {
            if (command.modifier === 'secondary' || command.modifier === 'second') {
                buttonId = 'secondaryButton';
                buttonName = 'secondary';
            }
        }
        
        if (command.value) {
            this.updateElement(buttonId, command.value);
            return `The ${buttonName} button now says "${command.value}"`;
        }
        return `Please specify what the ${buttonName} button should say.`;
    }

    handleThemeCommand(command) {
        if (command.modifier) {
            switch (command.modifier) {
                case 'light':
                    if (this.isDarkTheme) {
                        this.toggleTheme();
                        return "I've switched to light theme for better daytime viewing";
                    }
                    return "Already using light theme";
                    
                case 'dark':
                    if (!this.isDarkTheme) {
                        this.toggleTheme();
                        return "I've switched to dark theme for a more comfortable viewing experience";
                    }
                    return "Already using dark theme";
                    
                case 'blue':
                    this.applyColorTheme('blue');
                    return "I've applied a blue color theme";
                    
                case 'green':
                    this.applyColorTheme('green');
                    return "I've switched to a green color theme";
                    
                case 'purple':
                    this.applyColorTheme('purple');
                    return "I've applied a purple color theme";
            }
        }
        
        // Default toggle
        this.toggleTheme();
        return this.isDarkTheme ? "Switched to dark theme" : "Switched to light theme";
    }

    handleAnimationCommand(command) {
        this.animatePage();
        return "Here's a smooth animation for your page";
    }

    handleVisibilityCommand(command) {
        const action = command.lowerCommand.includes('hide') ? 'hide' : 'show';
        let element = null;
        let elementName = '';
        
        if (command.target) {
            switch (command.target) {
                case 'nav':
                case 'navigation':
                    element = document.getElementById('previewNavbar');
                    elementName = 'navigation bar';
                    break;
                case 'stats':
                case 'statistics':
                    element = document.getElementById('statsSection');
                    elementName = 'statistics section';
                    break;
                case 'features':
                    element = document.getElementById('featuresSection');
                    elementName = 'features section';
                    break;
            }
        }
        
        if (element) {
            const show = action === 'show';
            this.animator.toggleElementVisibility(element, show, { animateHeight: true });
            return show ? `The ${elementName} is now visible` : `I've hidden the ${elementName}`;
        }
        
        return "Please specify what you'd like to show or hide (e.g., navigation, stats, features)";
    }

    handleScrollCommand(command) {
        const isMobileView = this.elements.previewPanel?.classList.contains('mobile-view');
        const scrollContainer = isMobileView ? this.elements.mobileScreen : document.querySelector('.preview-content');
        
        if (command.target) {
            switch (command.target) {
                case 'top':
                    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
                    return "Scrolling to the top of the page";
                    
                case 'bottom':
                    if (scrollContainer) {
                        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
                    }
                    return "Scrolling to the bottom of the page";
                    
                case 'features':
                    this.animator.smoothScroll('#featuresSection');
                    return "Navigating to the features section";
                    
                case 'stats':
                    this.animator.smoothScroll('#statsSection');
                    return "Showing the statistics section";
            }
        }
        
        return "Where would you like to scroll? Try 'scroll to top', 'scroll to features', etc.";
    }

    showHelp() {
        const helpMessage = "Hello! I can help you edit this website. Try commands like:\n" +
            "• 'Change the title to...'\n" +
            "• 'Add a gradient'\n" +
            "• 'Change the logo to...'\n" +
            "• 'Hide the stats'\n" +
            "• 'Switch to light theme'\n" +
            "• 'Apply blue theme'\n" +
            "• 'Scroll to features'";
        
        this.showHelpTooltip();
        return helpMessage;
    }

    updateElement(elementId, newText) {
        const elementData = this.editableElements.get(elementId);
        if (!elementData) return;
        
        const { element } = elementData;
        this.animator.highlightElement(element);
        element.textContent = newText;
        
        // Update mobile view if active
        if (this.elements.previewPanel?.classList.contains('mobile-view')) {
            const mobileElement = this.elements.mobileScreen?.querySelector(`#${elementId}`);
            if (mobileElement) {
                this.animator.highlightElement(mobileElement);
                mobileElement.textContent = newText;
            }
        }
    }

    applyColorTheme(theme) {
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

    animatePage() {
        const sections = [
            document.getElementById('heroSection'),
            document.getElementById('statsSection'),
            document.getElementById('featuresSection'),
            document.getElementById('ctaSection')
        ];
        
        this.animator.animatePage(sections.filter(Boolean));
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        const wrappers = [
            document.querySelector('.preview-content .preview-wrapper'),
            document.querySelector('.mobile-screen .preview-wrapper')
        ];
        
        wrappers.forEach(wrapper => {
            if (wrapper) {
                this.animator.transitionTheme(wrapper, this.isDarkTheme ? 'dark' : 'light');
            }
        });
        
        // Update theme toggle icon
        const sunIcon = this.elements.themeToggleBtn?.querySelector('.sun-icon');
        const moonIcon = this.elements.themeToggleBtn?.querySelector('.moon-icon');
        
        if (this.isDarkTheme) {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
        }
    }

    switchToWebView() {
        this.elements.previewPanel?.classList.remove('mobile-view');
        this.elements.webViewBtn?.classList.add('active');
        this.elements.mobileViewBtn?.classList.remove('active');
        
        const urlText = document.querySelector('.url-text');
        if (urlText) urlText.textContent = 'https://preview.sentauri.ai/demo';
    }

    switchToMobileView() {
        this.elements.previewPanel?.classList.add('mobile-view');
        this.elements.mobileViewBtn?.classList.add('active');
        this.elements.webViewBtn?.classList.remove('active');
        
        const urlText = document.querySelector('.url-text');
        if (urlText) urlText.textContent = 'https://m.sentauri.ai/demo';
        
        // Clone content to mobile screen
        const originalWrapper = document.querySelector('.preview-content > .preview-wrapper');
        if (originalWrapper && this.elements.mobileScreen) {
            const clonedWrapper = originalWrapper.cloneNode(true);
            this.elements.mobileScreen.innerHTML = '';
            this.elements.mobileScreen.appendChild(clonedWrapper);
        }
    }

    toggleVoice() {
        if (!this.voice.isSupported()) {
            this.showUnsupportedBrowserMessage();
            return;
        }
        
        this.voice.toggle();
    }

    addToConversation(text, type, success = true) {
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
        
        this.elements.commandList?.appendChild(commandItem);
        
        // Auto-scroll to latest
        if (this.elements.commandList) {
            this.elements.commandList.scrollTop = this.elements.commandList.scrollHeight;
        }
        
        // Add to history
        this.commandHistory.push({
            text,
            type,
            success,
            timestamp: new Date()
        });
    }

    updateVoiceStatus(text, active = false) {
        if (this.elements.voiceStatus) {
            this.elements.voiceStatus.textContent = text;
            this.elements.voiceStatus.classList.toggle('active', active);
        }
    }

    showResponse(text) {
        if (this.elements.voiceResponse) {
            this.elements.voiceResponse.textContent = text;
            this.elements.voiceResponse.classList.add('show');
            
            setTimeout(() => {
                this.elements.voiceResponse.classList.remove('show');
            }, 4000);
        }
    }

    showHelpTooltip() {
        if (this.elements.helpTooltip) {
            this.elements.helpTooltip.classList.add('show');
            setTimeout(() => {
                this.elements.helpTooltip.classList.remove('show');
            }, 5000);
        }
    }

    completeCommand(response, success) {
        this.animator.setAvatarState(this.elements.aiAvatar, 'speaking');
        this.addToConversation(response, 'ai', success);
        this.showResponse(response);
        
        // Text-to-speech
        this.voice.speak(response, {
            onEnd: () => {
                this.animator.setAvatarState(this.elements.aiAvatar, null);
            }
        });
    }

    handleUnknownCommand() {
        const response = "I didn't quite understand that. Try saying 'Change the title to...' or 'Add a new feature'";
        this.completeCommand(response, false);
    }

    getErrorMessage(error) {
        const errorMessages = {
            'network': 'Network error. Please check your internet connection.',
            'not-allowed': 'Microphone access was denied. Please allow microphone access.',
            'no-speech': 'No speech was detected. Please try again.',
            'aborted': 'Speech recognition was aborted.',
            'audio-capture': 'No microphone was found.',
            'service-not-allowed': 'Speech recognition service is not allowed.'
        };
        
        return errorMessages[error] || `Sorry, I encountered an error: ${error}. Please try again.`;
    }

    showUnsupportedBrowserMessage() {
        const message = "Sorry, your browser doesn't support voice commands. Try Chrome or Edge for the best experience.";
        this.showResponse(message);
        this.addToConversation(message, 'ai', false);
    }

    showWelcomeMessage() {
        setTimeout(() => {
            const welcomeMessage = "Welcome to Sentauri Voice Demo! I'm ready to help you edit this website using voice commands. Click the avatar or button to start speaking.";
            this.addToConversation(welcomeMessage, 'ai', true);
            this.showHelpTooltip();
            
            // Highlight editable elements briefly
            this.highlightEditableElements();
        }, 1000);
    }

    highlightEditableElements() {
        const editables = document.querySelectorAll('.element-highlight');
        editables.forEach((el, index) => {
            setTimeout(() => {
                this.animator.highlightElement(el, 800);
            }, index * 100);
        });
    }
}

// Initialize the demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sentauriDemo = new SentauriDemo();
});