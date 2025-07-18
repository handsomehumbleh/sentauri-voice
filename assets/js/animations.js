/**
 * Animations Module for Sentauri Voice Demo
 * Handles all visual animations and transitions
 */

class AnimationController {
    constructor() {
        this.animationDurations = {
            microInteraction: 300,
            contentReveal: 600,
            decorativeFloat: 6000,
            dataFlow: 3000,
            glowPulse: 3000
        };

        this.easings = {
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            elasticOut: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        };

        this.init();
    }

    init() {
        this.injectKeyframes();
        this.setupIntersectionObserver();
    }

    // Inject custom keyframe animations
    injectKeyframes() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Sentauri Brand Animations */
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }

            @keyframes glowPulse {
                0%, 100% {
                    box-shadow: 
                        0 0 40px 15px rgba(59, 130, 246, 0.3),
                        0 0 80px 30px rgba(0, 206, 200, 0.2),
                        0 0 120px 45px rgba(74, 222, 128, 0.1);
                }
                50% {
                    box-shadow: 
                        0 0 60px 20px rgba(59, 130, 246, 0.5),
                        0 0 100px 40px rgba(0, 206, 200, 0.3),
                        0 0 140px 60px rgba(74, 222, 128, 0.2);
                }
            }

            @keyframes dataFlow {
                from { transform: translateX(-100%); }
                to { transform: translateX(100%); }
            }

            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }

            @keyframes elementHighlight {
                0% {
                    box-shadow: 0 0 0 0 rgba(0, 206, 200, 0.7);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 20px 10px rgba(0, 206, 200, 0.3);
                    transform: scale(1.02);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(0, 206, 200, 0);
                    transform: scale(1);
                }
            }

            @keyframes neuralPulse {
                0%, 100% {
                    opacity: 0.3;
                    stroke-width: 1;
                }
                50% {
                    opacity: 0.8;
                    stroke-width: 2;
                }
            }

            @keyframes tooltipFade {
                from { 
                    opacity: 0;
                    transform: translateY(10px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes scanline {
                from { transform: translateX(-100%); }
                to { transform: translateX(100%); }
            }

            @keyframes voiceWave {
                0%, 100% { height: 10px; }
                50% { height: 30px; }
            }

            /* Utility classes */
            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
            }

            .animate-float {
                animation: float 6s ease-in-out infinite;
            }

            .animate-glow-pulse {
                animation: glowPulse 3s ease-in-out infinite;
            }

            .animate-data-flow {
                animation: dataFlow 3s linear infinite;
            }

            .animate-gradient-shift {
                background-size: 200% 200%;
                animation: gradientShift 8s ease infinite;
            }

            .animate-highlight {
                animation: elementHighlight 1.5s ease-out;
            }

            .animate-neural-pulse {
                animation: neuralPulse 2s ease-in-out infinite;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Setup intersection observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add specific animation based on data attribute
                    const animationType = entry.target.dataset.animation;
                    if (animationType) {
                        this.applyAnimation(entry.target, animationType);
                    }
                }
            });
        }, observerOptions);

        // Observe elements with fade-in-up class
        document.querySelectorAll('.fade-in-up').forEach(el => {
            this.observer.observe(el);
        });
    }

    // Avatar animations
    setAvatarState(avatar, state) {
        if (!avatar) return;

        // Remove all state classes
        avatar.classList.remove('listening', 'processing', 'speaking');
        
        // Add new state
        if (state) {
            avatar.classList.add(state);
        }
    }

    // Element highlighting
    highlightElement(element, duration = 2000) {
        if (!element) return;

        element.classList.add('animate-highlight', 'active');
        
        setTimeout(() => {
            element.classList.remove('animate-highlight', 'active');
        }, duration);
    }

    // Page animations
    animatePage(sections) {
        sections.forEach((section, index) => {
            if (section) {
                // Initial state
                section.style.opacity = '0';
                section.style.transform = 'translateY(40px)';
                
                // Animate after delay
                setTimeout(() => {
                    section.style.transition = `all ${this.animationDurations.contentReveal}ms ${this.easings.easeOut}`;
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }

    // Apply gradient animation
    applyGradientAnimation(element) {
        if (!element) return;
        
        element.classList.add('animate-gradient-shift');
        element.style.background = 'linear-gradient(135deg, var(--sentauri-blue), var(--sentauri-cyan), var(--sentauri-green))';
        element.style.webkitBackgroundClip = 'text';
        element.style.webkitTextFillColor = 'transparent';
        element.style.backgroundClip = 'text';
    }

    // Remove gradient animation
    removeGradientAnimation(element) {
        if (!element) return;
        
        element.classList.remove('animate-gradient-shift');
        element.style.background = '';
        element.style.webkitBackgroundClip = '';
        element.style.webkitTextFillColor = '';
        element.style.backgroundClip = '';
    }

    // Voice waves animation
    animateVoiceWaves(container, active) {
        if (!container) return;

        if (active) {
            container.classList.add('active');
            const waves = container.querySelectorAll('.wave');
            waves.forEach((wave, index) => {
                wave.style.animationDelay = `${index * 0.1}s`;
            });
        } else {
            container.classList.remove('active');
        }
    }

    // Show/hide elements with animation
    toggleElementVisibility(element, show, options = {}) {
        if (!element) return;

        const {
            duration = this.animationDurations.microInteraction,
            scale = 0.9,
            opacity = 0,
            transform = 'translateY(-20px)'
        } = options;

        element.style.transition = `all ${duration}ms ${this.easings.easeOut}`;

        if (show) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            element.style.pointerEvents = 'auto';
            
            // Handle height for smooth transitions
            if (options.animateHeight) {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        } else {
            element.style.opacity = opacity.toString();
            element.style.transform = transform + ` scale(${scale})`;
            element.style.pointerEvents = 'none';
            
            // Handle height for smooth transitions
            if (options.animateHeight) {
                element.style.height = '0';
                element.style.overflow = 'hidden';
                element.style.padding = '0';
            }
        }
    }

    // Scroll animations
    smoothScroll(target, options = {}) {
        const {
            behavior = 'smooth',
            block = 'start',
            inline = 'nearest'
        } = options;

        if (typeof target === 'string') {
            target = document.querySelector(target);
        }

        if (target) {
            target.scrollIntoView({ behavior, block, inline });
        }
    }

    // Add floating animation to elements
    addFloatingAnimation(elements, options = {}) {
        const {
            duration = this.animationDurations.decorativeFloat,
            range = 20,
            delay = 0
        } = options;

        if (NodeList.prototype.isPrototypeOf(elements)) {
            elements.forEach((el, index) => {
                this.applyFloatingAnimation(el, duration, range, delay + (index * 1000));
            });
        } else if (elements) {
            this.applyFloatingAnimation(elements, duration, range, delay);
        }
    }

    applyFloatingAnimation(element, duration, range, delay) {
        element.style.animation = `float ${duration}ms ease-in-out ${delay}ms infinite`;
        element.style.setProperty('--float-range', `${range}px`);
    }

    // Theme transitions
    transitionTheme(wrapper, theme) {
        if (!wrapper) return;

        wrapper.style.transition = 'all 500ms ease-out';
        
        if (theme === 'light') {
            wrapper.classList.add('light-theme');
        } else {
            wrapper.classList.remove('light-theme');
        }
    }

    // Apply animation based on type
    applyAnimation(element, type, options = {}) {
        switch (type) {
            case 'fadeInUp':
                element.classList.add('animate-fade-in-up');
                break;
            case 'float':
                this.addFloatingAnimation(element, options);
                break;
            case 'glowPulse':
                element.classList.add('animate-glow-pulse');
                break;
            case 'dataFlow':
                element.classList.add('animate-data-flow');
                break;
            case 'gradient':
                this.applyGradientAnimation(element);
                break;
            case 'highlight':
                this.highlightElement(element, options.duration);
                break;
            default:
                console.warn(`Unknown animation type: ${type}`);
        }
    }

    // Remove all animations from element
    clearAnimations(element) {
        if (!element) return;

        const animationClasses = [
            'animate-fade-in-up',
            'animate-float',
            'animate-glow-pulse',
            'animate-data-flow',
            'animate-gradient-shift',
            'animate-highlight',
            'animate-neural-pulse'
        ];

        animationClasses.forEach(className => {
            element.classList.remove(className);
        });

        element.style.animation = '';
    }

    // Ripple effect for buttons
    createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Neural network background animation
    animateNeuralNetwork(canvas) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const nodes = [];
        const connections = [];
        
        // Create nodes
        for (let i = 0; i < 8; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 3 + Math.random() * 3
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw nodes
            nodes.forEach((node, i) => {
                // Update position
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce off walls
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
                
                // Draw connections
                nodes.forEach((otherNode, j) => {
                    if (i < j) {
                        const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
                        if (distance < 150) {
                            ctx.beginPath();
                            ctx.moveTo(node.x, node.y);
                            ctx.lineTo(otherNode.x, otherNode.y);
                            ctx.strokeStyle = `rgba(0, 206, 200, ${0.3 * (1 - distance / 150)})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                });
                
                // Draw node
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00CEC8';
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Export for use in other modules
window.AnimationController = AnimationController;