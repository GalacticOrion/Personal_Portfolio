/**
 * Portfolio Website JavaScript
 * Main application logic for the portfolio website
 * 
 * @author Ravi Thakur
 * @version 1.0.0
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
    ANIMATION_DELAYS: {
        TIMELINE: 200,
        PROJECT_CARDS: 100,
        SKILL_BARS: 50
    },
    SCROLL_THRESHOLDS: {
        DEFAULT: 0.1,
        TIMELINE: 0.3,
        SKILLS: 0.5
    },
    TERMINAL: {
        TYPING_SPEED: {
            FAST: 30,
            MEDIUM: 80,
            SLOW: 100
        },
        COMMAND_DELAY: 500,
        OUTPUT_DELAY: 100,
        CLEAR_DELAY: 1200
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Set background based on type
    const backgrounds = {
        success: 'linear-gradient(135deg, #4ec9b0, #4ec9b0)',
        error: 'linear-gradient(135deg, #f44747, #f44747)',
        info: 'linear-gradient(135deg, #569cd6, #569cd6)'
    };
    
    notification.style.background = backgrounds[type] || backgrounds.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================================================================
// TAB NAVIGATION SYSTEM
// ============================================================================

/**
 * Initialize tab navigation functionality
 */
function initTabNavigation() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabNavigation = document.querySelector('.tab-navigation');

    if (!tabLinks.length || !tabContents.length) {
        console.warn('Tab navigation elements not found');
        return;
    }

    // Navigation scroll effect with throttling
    if (tabNavigation) {
        const handleScroll = throttle(() => {
            const scrollY = window.scrollY;
            if (scrollY > 100) {
                tabNavigation.style.background = 'rgba(0, 0, 0, 0.4)';
                tabNavigation.style.boxShadow = '0 8px 32px rgba(255, 255, 255, 0.1)';
            } else {
                tabNavigation.style.background = 'rgba(0, 0, 0, 0.3)';
                tabNavigation.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
            }
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll);
    }

    // Handle tab switching
    tabLinks.forEach(link => {
        const handleTabClick = (e) => {
            e.preventDefault();
            
            const targetTab = link.getAttribute('data-tab');
            if (!targetTab) return;
            
            // Update active states (animations are triggered in updateActiveTab)
            updateActiveTab(targetTab);
            
            // Update URL hash
            history.pushState(null, null, `#${targetTab}`);
        };

        // Add event listeners
        link.addEventListener('click', handleTabClick);
        link.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleTabClick(e);
        }, { passive: false });
    });

    // Handle initial tab from URL hash
    handleInitialTab();
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
}

/**
 * Update active tab and content
 * @param {string} targetTab - Target tab ID
 */
function updateActiveTab(targetTab) {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all
    tabLinks.forEach(l => l.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to target
    const targetLink = document.querySelector(`[data-tab="${targetTab}"]`);
    const targetContent = document.getElementById(targetTab);
    
    if (targetLink) targetLink.classList.add('active');
    if (targetContent) {
        targetContent.classList.add('active');
        
        // Always trigger animations when tab becomes active
        // Use a small delay to ensure the tab is fully visible
        setTimeout(() => {
            triggerContentAnimations(targetContent);
        }, 100);
    }
    
    // Scroll to top of main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTop = 0;
    }
}

/**
 * Handle initial tab from URL hash
 */
function handleInitialTab() {
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        updateActiveTab(initialHash);
    }
}

/**
 * Handle browser popstate event
 */
function handlePopState() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        updateActiveTab(hash);
    } else {
        // Default to home tab
        updateActiveTab('home');
    }
}

// ============================================================================
// SKILLS SUB-TABS SYSTEM
// ============================================================================

/**
 * Initialize skills sub-tabs functionality
 */
function initSkillsSubTabs() {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');

    if (!subTabBtns.length || !subTabContents.length) {
        console.warn('Skills sub-tabs elements not found');
        return;
    }

    subTabBtns.forEach(btn => {
        const handleClick = () => {
            const targetSubTab = btn.getAttribute('data-sub-tab');
            if (!targetSubTab) return;
            
            updateActiveSubTab(targetSubTab);
            
            // Trigger animations for new content
            const targetContent = document.getElementById(targetSubTab);
            if (targetContent) {
                setTimeout(() => {
                    triggerContentAnimations(targetContent);
                }, 100);
            }
        };

        btn.addEventListener('click', handleClick);
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClick();
        }, { passive: false });
    });
}

/**
 * Update active sub-tab
 * @param {string} targetSubTab - Target sub-tab ID
 */
function updateActiveSubTab(targetSubTab) {
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabContents = document.querySelectorAll('.sub-tab-content');
    
    // Remove active class from all
    subTabBtns.forEach(b => b.classList.remove('active'));
    subTabContents.forEach(content => {
        content.classList.remove('active');
        content.hidden = true;
    });
    
    // Add active class to target
    const targetBtn = document.querySelector(`[data-sub-tab="${targetSubTab}"]`);
    const targetContent = document.getElementById(targetSubTab);
    
    if (targetBtn) {
        targetBtn.classList.add('active');
        targetBtn.setAttribute('aria-selected', 'true');
    }
    
    if (targetContent) {
        targetContent.classList.add('active');
        targetContent.hidden = false;
    }
}

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

/**
 * Trigger content animations when tab becomes active
 * @param {Element} content - Content element to animate
 */
function triggerContentAnimations(content) {
    // Reset all animation states first
    resetAnimationStates(content);
    
    // Small delay to ensure reset is complete
    setTimeout(() => {
        // Trigger skill bar animations
        const skillBars = content.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            const progress = bar.getAttribute('data-progress');
            if (progress) {
                setTimeout(() => {
                    bar.style.width = `${progress}%`;
                    bar.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
                }, index * CONFIG.ANIMATION_DELAYS.SKILL_BARS);
            }
        });

        // Trigger timeline animations
        const timelineItems = content.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.remove('animate-reset');
                item.classList.add('animate');
            }, index * CONFIG.ANIMATION_DELAYS.TIMELINE);
        });

        // Trigger project card animations
        const projectCards = content.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.remove('animate-reset');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * CONFIG.ANIMATION_DELAYS.PROJECT_CARDS);
        });

        // Trigger AOS animations
        const aosElements = content.querySelectorAll('[data-aos]');
        aosElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.remove('animate-reset');
                element.classList.add('aos-animate');
            }, index * 100);
        });

        // Trigger skill card animations
        const skillCards = content.querySelectorAll('.skill-card');
        skillCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.remove('animate-reset');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Trigger certification card animations
        const certCards = content.querySelectorAll('.certification-card');
        certCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.remove('animate-reset');
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Trigger About section animations
        if (content.id === 'about') {
            triggerAboutAnimations(content);
        }
    }, 50);
}

/**
 * Reset animation states for content
 * @param {Element} content - Content element to reset
 */
function resetAnimationStates(content) {
    // Reset timeline items
    const timelineItems = content.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.classList.remove('animate');
        item.classList.add('animate-reset');
        item.style.animationDelay = '';
    });

    // Reset skill bars
    const skillBars = content.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        bar.style.width = '0%';
        bar.style.boxShadow = '';
    });

    // Reset project cards
    const projectCards = content.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.classList.add('animate-reset');
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    // Reset AOS elements
    const aosElements = content.querySelectorAll('[data-aos]');
    aosElements.forEach(element => {
        element.classList.remove('aos-animate');
        element.classList.add('animate-reset');
    });

    // Reset skill cards
    const skillCards = content.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.classList.add('animate-reset');
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    // Reset certification cards
    const certCards = content.querySelectorAll('.certification-card');
    certCards.forEach(card => {
        card.classList.add('animate-reset');
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
    });

    // Reset About section elements
    if (content.id === 'about') {
        resetAboutAnimations(content);
        
        // Add reset classes to About elements
        const aboutText = content.querySelector('.about-text');
        const aboutStats = content.querySelector('.about-stats');
        const statItems = content.querySelectorAll('.stat-item');
        
        if (aboutText) aboutText.classList.add('animate-reset');
        if (aboutStats) aboutStats.classList.add('animate-reset');
        statItems.forEach(item => item.classList.add('animate-reset'));
    }

    // Force reflow to ensure reset is applied
    content.offsetHeight;
}

/**
 * Initialize scroll animations with Intersection Observer
 */
function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
        return;
    }

    const observerOptions = {
        threshold: CONFIG.SCROLL_THRESHOLDS.DEFAULT,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos
    const animatedElements = document.querySelectorAll('[data-aos]');
    animatedElements.forEach(el => observer.observe(el));
}

/**
 * Initialize timeline animations
 */
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!timelineItems.length) return;
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Add staggered animation delay
                const index = Array.from(timelineItems).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.2}s`;
            }
        });
    }, { threshold: CONFIG.SCROLL_THRESHOLDS.TIMELINE });

    timelineItems.forEach(item => timelineObserver.observe(item));
}

/**
 * Initialize skill animations
 */
function initSkillAnimations() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    if (!skillBars.length) return;
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.getAttribute('data-progress');
                if (progress) {
                    entry.target.style.width = `${progress}%`;
                    entry.target.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
                }
                
                // Remove observer after animation
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: CONFIG.SCROLL_THRESHOLDS.SKILLS });

    skillBars.forEach(bar => skillObserver.observe(bar));
}

// ============================================================================
// PROJECT CARDS SYSTEM
// ============================================================================

/**
 * Initialize project cards 3D effect
 */
function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 60;
            const rotateY = (centerX - x) / 60;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        };
        
        const handleMouseLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
    });
}

// ============================================================================
// CONTACT FORM SYSTEM
// ============================================================================

/**
 * Initialize contact form functionality
 */
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (!contactForm) {
        console.warn('Contact form not found');
        return;
    }
    
    contactForm.addEventListener('submit', handleFormSubmit);
}

/**
 * Handle contact form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name') || form.querySelector('input[name="name"]')?.value;
    const email = formData.get('email') || form.querySelector('input[name="email"]')?.value;
    const message = formData.get('message') || form.querySelector('textarea[name="message"]')?.value;
    
    // Validation
    if (!name || !email || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Simulate form submission
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Message sent successfully!', 'success');
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================================================
// TERMINAL SYSTEM
// ============================================================================

/**
 * Initialize terminal functionality
 */
function initTerminal() {
    const terminalContent = document.getElementById('terminalContent');
    if (!terminalContent) {
        console.warn('Terminal content element not found');
        return;
    }

    const terminal = new Terminal(terminalContent);
    terminal.start();
}

/**
 * Terminal class for managing terminal functionality
 */
class Terminal {
    constructor(container) {
        this.container = container;
        this.currentCommandIndex = 0;
        this.isTyping = false;
        this.commands = this.getCommands();
    }

    /**
     * Get terminal commands and outputs
     * @returns {Array} Array of command objects
     */
    getCommands() {
        return [
            {
                command: '$ install-projects --all',
                output: [
                     'PROJECTS INSTALLER v1.0',
                    'Installing: Expense Manager (Tkinter)',
                    '[████] 25%',
                     
                    'Installing: PingPal - Advanced LAN File Transfer',
                    '[██████████] 50%',
                     
                    'Installing: Password Generator',
                    '[█████████████████] 75%',
                     
                    'Installing: Expense Manager (Web)',
                    '[██████████████████████] 100%',

                    '✅ Installation Complete!'
                ]
            },
            {
                command: 'cat README.md',
                output: [
                    '# Portfolio Website',
                    '',
                    'A creative developer portfolio showcasing skills and projects.',
                    'Built with HTML, CSS, and JavaScript.',
                    '',
                    '## Features',
                    '- Responsive design',
                    '- Interactive animations',
                    '- Terminal interface',
                    '- Modern UI/UX'
                ]
            },
            {
                command: 'whoami',
                output: [
                    'Ravi Thakur',
                    'Full Stack Developer',
                    'Creative Problem Solver'
                ]
            },
            {
                command: '$ ./run_ai.sh',
                output: [
                    '[INFO] Bootstrapping AI module...',
                    '[INFO] Loading neural networks... ',
                    '[##########] 100%',
                    '[INFO] Calibrating creativity engine... done',
                    '[INFO] Generating portfolio content...',
                    'Hello, world! 👋',
                    'Projects: █████████████████████ 100%',
                    'Skills  : █████████████████████ 100%',
                    'Portfolio compiled successfully!']
            },
            {
                command: 'git status',
                output: [
                    'On branch main',
                    'Your branch is up to date with \'origin/main\'.',
                    '',
                    'Changes not staged for commit:',
                    '  (use "git add <file>..." to update what will be committed)',
                    '  (use "git restore <file>..." to discard changes in working directory)',
                    '        modified:   index.html',
                    '        modified:   styles.css',
                    '        modified:   script.js',
                    '',
                    'no changes added to commit (use "git add" and/or "git commit -a")'
                ]
            },
            {
                command: 'npm list --depth=0',
                output: [
                    'Certificate... /home/certificate',
                    'Loading certificates...',
                    'Certificates: █████████████████████ 100%',
                    '├── Google Cloud Digital Leader',
                    '├── Google Cloud AI Principles',
                    '├── Google Cloud Vertex AI',
                    '├── Google Cloud Prompt Engineering',
                    '└── HCLTech Digital MERN'
                ]
            },
            {
                command: 'help',
                output: [
                    'Available commands:',
                    '  ls -la          - List directory contents',
                    '  cat README.md   - Display README file',
                    '  whoami          - Show user information',
                    '  pwd             - Print working directory',
                    '  git status      - Show git repository status',
                    '  npm list        - List installed packages',
                    '  help            - Show this help message',
                    '',
                    'Type any command to see it in action!'
                ]
            }
        ];
    }

    /**
     * Start the terminal
     */
    async start() {
        await this.showWelcomeMessage();
        
        // Wait before starting commands
        setTimeout(() => {
            this.executeCommand();
        }, 2000);
    }

    /**
     * Show welcome message
     */
    async showWelcomeMessage() {
        const welcomeText = `Welcome to Ravi Thakur's Portfolio Terminal
Type "help" for available commands

Starting system...
Loading portfolio data...
Ready!`;

        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'terminal-line';
        welcomeElement.textContent = '';
        this.container.appendChild(welcomeElement);
        
        await this.typeText(welcomeElement, welcomeText, CONFIG.TERMINAL.TYPING_SPEED.SLOW);
    }

    /**
     * Type text with typewriter effect
     * @param {Element} element - Element to type in
     * @param {string} text - Text to type
     * @param {number} speed - Typing speed in milliseconds
     */
    async typeText(element, text, speed = 50) {
        element.textContent = '';
        element.classList.add('typing');
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await new Promise(resolve => setTimeout(resolve, speed));
        }
        
        element.classList.remove('typing');
    }

    /**
     * Type command line
     * @param {string} command - Command to type
     * @returns {Element} Command line element
     */
    async typeCommand(command) {
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.innerHTML = `
            <span class="terminal-prompt">$</span>
            <span class="terminal-command"></span>
        `;
        this.container.appendChild(commandLine);

        const commandElement = commandLine.querySelector('.terminal-command');
        commandElement.style.position = 'relative';
        await this.typeText(commandElement, command, CONFIG.TERMINAL.TYPING_SPEED.MEDIUM);
        
        return commandLine;
    }

    /**
     * Type output lines
     * @param {Array} outputLines - Array of output lines
     */
    async typeOutput(outputLines) {
        const outputContainer = document.createElement('div');
        outputContainer.className = 'terminal-output';
        this.container.appendChild(outputContainer);

        for (let i = 0; i < outputLines.length; i++) {
            const outputLine = document.createElement('div');
            outputLine.textContent = '';
            outputLine.style.minHeight = '10px';
            outputContainer.appendChild(outputLine);
            
            await this.typeText(outputLine, outputLines[i], CONFIG.TERMINAL.TYPING_SPEED.FAST);
            await new Promise(resolve => setTimeout(resolve, CONFIG.TERMINAL.OUTPUT_DELAY));
        }
    }

    /**
     * Execute a single command cycle
     */
    async executeCommand() {
        if (this.isTyping) return;
        this.isTyping = true;

        const command = this.commands[this.currentCommandIndex];
        
        // Type the command
        const commandLine = await this.typeCommand(command.command);
        
        // Wait before showing output
        await new Promise(resolve => setTimeout(resolve, CONFIG.TERMINAL.COMMAND_DELAY));
        
        // Type the output
        await this.typeOutput(command.output);
        
        // Wait before clearing
        await new Promise(resolve => setTimeout(resolve, CONFIG.TERMINAL.CLEAR_DELAY));
        
        // Clear terminal with smooth fade effect
        await this.clearTerminal();
        
        // Move to next command
        this.currentCommandIndex = (this.currentCommandIndex + 1) % this.commands.length;
        
        this.isTyping = false;
        
        // Wait before next command
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Execute next command
        this.executeCommand();
    }

    /**
     * Clear terminal with smooth animation
     */
    async clearTerminal() {
        // Smooth fade out
        this.container.style.transition = 'all 0.5s ease-in-out';
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(-20px) scale(0.95)';
        
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Clear content
        this.container.innerHTML = '';
        
        // Reset styles and smooth fade in
        this.container.style.opacity = '0';
        this.container.style.transform = 'translateY(20px) scale(0.95)';
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateY(0) scale(1)';
    }
}

// ============================================================================
// BUTTON EFFECTS SYSTEM
// ============================================================================

/**
 * Initialize button click effects
 */
function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
    
    // Add ripple animation styles
    addRippleStyles();
}

/**
 * Create ripple effect on button click
 * @param {Event} e - Click event
 */
function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

/**
 * Add ripple animation styles
 */
function addRippleStyles() {
    if (document.querySelector('#ripple-styles')) return;
    
    const rippleStyle = document.createElement('style');
    rippleStyle.id = 'ripple-styles';
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// ============================================================================
// ABOUT SECTION ANIMATIONS
// ============================================================================

/**
 * Trigger About section specific animations
 * @param {Element} content - About content element
 */
function triggerAboutAnimations(content) {
    // Animate about text
    const aboutText = content.querySelector('.about-text');
    if (aboutText) {
        setTimeout(() => {
            aboutText.classList.remove('animate-reset');
            aboutText.classList.add('animate');
        }, 200);
    }

    // Animate about paragraphs with stagger
    const aboutParagraphs = content.querySelectorAll('.about-text p');
    aboutParagraphs.forEach((paragraph, index) => {
        setTimeout(() => {
            paragraph.classList.add('animate');
        }, 300 + (index * 100));
    });

    // Animate stats container
    const aboutStats = content.querySelector('.about-stats');
    if (aboutStats) {
        setTimeout(() => {
            aboutStats.classList.remove('animate-reset');
            aboutStats.classList.add('animate');
        }, 500);
    }

    // Animate stat items with counter effect
    const statItems = content.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.remove('animate-reset');
            item.classList.add('animate');
            
            // Start counter animation
            const statNumber = item.querySelector('.stat-number');
            if (statNumber) {
                animateCounter(statNumber);
            }
        }, 600 + (index * 100));
    });
}

/**
 * Reset About section animations
 * @param {Element} content - About content element
 */
function resetAboutAnimations(content) {
    // Reset about text
    const aboutText = content.querySelector('.about-text');
    if (aboutText) {
        aboutText.classList.remove('animate');
    }

    // Reset about paragraphs
    const aboutParagraphs = content.querySelectorAll('.about-text p');
    aboutParagraphs.forEach(paragraph => {
        paragraph.classList.remove('animate');
    });

    // Reset stats container
    const aboutStats = content.querySelector('.about-stats');
    if (aboutStats) {
        aboutStats.classList.remove('animate');
    }

    // Reset stat items
    const statItems = content.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.classList.remove('animate');
        
        // Reset counter
        const statNumber = item.querySelector('.stat-number');
        if (statNumber) {
            statNumber.textContent = '0+';
            statNumber.classList.remove('counting');
        }
    });
}

/**
 * Animate counter numbers
 * @param {Element} element - Stat number element
 */
function animateCounter(element) {
    const targetValue = parseInt(element.getAttribute('data-count'));
    const duration = 1000; // 2 seconds
    const startTime = performance.now();
    
    element.classList.add('counting');
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(targetValue * easeOutQuart);
        
        element.textContent = currentValue + '+';
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.classList.remove('counting');
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// ============================================================================
// GLOBAL UTILITY FUNCTIONS
// ============================================================================

/**
 * Scroll to specific section
 * @param {string} sectionId - Section ID to scroll to
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Download CV function
 */
function downloadCV() {
    // Placeholder for CV download functionality
    showNotification('CV download feature coming soon!', 'info');
}

// ============================================================================
// CERTIFICATE LIGHTBOX FUNCTIONALITY
// ============================================================================

/**
 * Certificate data mapping
 */
const CERTIFICATE_DATA = {
    'google-cloud': {
        title: 'Google Cloud Digital Leader',
        image: 'img/google.png',
        url: 'https://www.credly.com/badges/550cc2b3-f800-4e44-9e4c-ba7da422210c/public_url'
    },
    'google-cloud-AI': {
        title: 'AI Principles',
        image: 'img/googleAI.png',
        url: 'https://www.credly.com/users/ravi-thakur.d25fcef0/badges#credly'
    },
    'google-cloud-Vertex-AI': {
        title: 'Microsoft Azure Developer',
        image: 'img/integrate-vertex-ai-search-and-conversation-into-vo.1.png',
        url: 'https://www.credly.com/badges/6c378ed3-011d-4c2a-9072-18e0ce312c85/public_url'
    },
    'google-cloud-prompt-engineering': {
        title: 'Python Programming',
        image: 'img/text-prompt-engineering-techniques-skill-badge.1.png',
        url: 'https://www.credly.com/badges/bd1fe4a7-833c-469a-9f71-a6b2107b932f/public_url'
    },
    'MERN': {
        title: 'Python Programming',
        image: 'img/',
        
    }
};

/**
 * Initialize certificate lightbox functionality
 */
function initializeCertificateLightbox() {
    const modal = document.getElementById('certificateModal');
    const modalImage = document.getElementById('modalCertificateImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const viewCertificateBtn = document.getElementById('viewCertificateBtn');
    
    let currentCertificate = null;

    // Add click event listeners to certification cards
    const certificationCards = document.querySelectorAll('.certification-card[data-certificate]');
    
    certificationCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            const certId = this.getAttribute('data-certificate');
            openCertificateModal(certId);
        });
    });

    /**
     * Open certificate modal
     * @param {string} certId - Certificate ID
     */
    function openCertificateModal(certId) {
        const certData = CERTIFICATE_DATA[certId];
        if (!certData) return;

        currentCertificate = certData;
        
        // Update modal content
        modalTitle.textContent = certData.title;
        modalImage.src = certData.image;
        modalImage.alt = `${certData.title} Certificate`;
        
        // Update view certificate button
        viewCertificateBtn.onclick = () => {
            window.open(certData.url, '_blank', 'noopener,noreferrer');
        };
        
        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    }

    /**
     * Close certificate modal
     */
    function closeCertificateModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        currentCertificate = null;
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    }

    /**
     * Handle escape key press
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape') {
            closeCertificateModal();
        }
    }

    // Event listeners for closing modal
    modalClose.addEventListener('click', closeCertificateModal);
    modalBackdrop.addEventListener('click', closeCertificateModal);
    
    // Prevent modal content clicks from closing modal
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all functionality when DOM is loaded
 */
function initializeApp() {
    try {
        initTabNavigation();
        initSkillsSubTabs();
        initScrollAnimations();
        initTimelineAnimations();
        initSkillAnimations();
        initProjectCards();
        initContactForm();
        initTerminal();
        initButtonEffects();
        initializeCertificateLightbox();
        
        console.log('Portfolio website initialized successfully');
    } catch (error) {
        console.error('Error initializing portfolio website:', error);
        showNotification('Error initializing website', 'error');
    }
}

// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export functions for global use
window.scrollToSection = scrollToSection;
window.downloadCV = downloadCV;
