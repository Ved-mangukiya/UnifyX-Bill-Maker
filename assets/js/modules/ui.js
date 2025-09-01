/**
 * ⚡️ UnifyX Bill Maker - UI Management System
 * Complete UI/UX management, components, animations, and responsive design
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class UIManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.activeModals = new Set();
        this.notifications = new Map();
        this.loadingStates = new Set();
        this.animations = new Map();
        this.components = new Map();
        
        // UI state management
        this.state = {
            theme: 'light',
            sidebarCollapsed: false,
            currentModal: null,
            activeTooltip: null,
            fullScreenMode: false,
            compactMode: false
        };
        
        // Animation settings
        this.animationSettings = {
            duration: {
                fast: 200,
                normal: 300,
                slow: 500
            },
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        };
        
        // Initialize UI system
        this.initializeUI();
        
        console.log('🎨 UIManager initialized successfully!');
    }

    /**
     * Initialize UI system
     */
    initializeUI() {
        // Setup theme system
        this.initializeTheme();
        
        // Setup responsive handlers
        this.setupResponsiveHandlers();
        
        // Initialize components
        this.initializeComponents();
        
        // Setup global UI event listeners
        this.setupGlobalEventListeners();
        
        // Initialize animations
        this.initializeAnimations();
        
        // Setup accessibility features
        this.setupAccessibility();
        
        // Initialize tooltips and popovers
        this.initializeTooltips();
    }

    /**
     * Theme Management
     */
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('unifyxTheme') || 'light';
        this.setTheme(savedTheme);
        
        // Watch for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.state.theme === 'auto') {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        this.state.theme = theme;
        
        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        this.applyTheme(actualTheme);
        localStorage.setItem('unifyxTheme', theme);
        
        // Update theme toggle button
        this.updateThemeToggle(theme);
        
        // Dispatch theme change event
        this.dispatchEvent('theme-changed', { theme: actualTheme });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
        
        // Update meta theme color for mobile browsers
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#0f172a' : '#ffffff';
        }
    }

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.state.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }

    /**
     * Modal Management
     */
    
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} not found`);
            return false;
        }

        // Close existing modal if exclusive
        if (options.exclusive !== false) {
            this.closeAllModals();
        }

        // Add to active modals
        this.activeModals.add(modalId);
        this.state.currentModal = modalId;

        // Show modal with animation
        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Focus management
        const focusableElement = modal.querySelector('[autofocus], input, button, select, textarea');
        if (focusableElement) {
            setTimeout(() => focusableElement.focus(), 100);
        }

        // Setup close handlers
        this.setupModalCloseHandlers(modal);

        // Animate in
        this.animateIn(modal, options.animation || 'fadeIn');

        // Dispatch event
        this.dispatchEvent('modal-opened', { modalId, options });

        return true;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal || !this.activeModals.has(modalId)) {
            return false;
        }

        // Animate out and then hide
        this.animateOut(modal, 'fadeOut', () => {
            modal.classList.remove('active');
            this.activeModals.delete(modalId);

            // Update body class if no active modals
            if (this.activeModals.size === 0) {
                document.body.classList.remove('modal-open');
                this.state.currentModal = null;
            } else {
                // Set focus to previous modal
                const remainingModals = Array.from(this.activeModals);
                this.state.currentModal = remainingModals[remainingModals.length - 1];
            }

            // Dispatch event
            this.dispatchEvent('modal-closed', { modalId });
        });

        return true;
    }

    closeAllModals() {
        const modals = Array.from(this.activeModals);
        modals.forEach(modalId => this.closeModal(modalId));
    }

    setupModalCloseHandlers(modal) {
        // Close button
        const closeButtons = modal.querySelectorAll('.modal-close, [data-dismiss="modal"]');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal(modal.id);
            });
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal.id);
            }
        });
    }

    /**
     * Notification System
     */
    
    showNotification(type, title, message, options = {}) {
        const {
            duration = 5000,
            closable = true,
            position = 'top-right',
            persistent = false
        } = options;

        const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const notification = this.createNotificationElement(notificationId, type, title, message, {
            closable,
            persistent
        });

        // Add to container
        const container = this.getNotificationContainer(position);
        container.appendChild(notification);

        // Animate in
        this.animateIn(notification, 'slideInRight');

        // Store reference
        this.notifications.set(notificationId, {
            element: notification,
            type,
            createdAt: Date.now(),
            duration
        });

        // Auto remove if not persistent
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.removeNotification(notificationId);
            }, duration);
        }

        // Limit number of notifications
        this.limitNotifications(container, 5);

        return notificationId;
    }

    createNotificationElement(id, type, title, message, options) {
        const notification = document.createElement('div');
        notification.id = id;
        notification.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            ${options.closable ? '<button class="toast-close" onclick="window.UIManager.removeNotification(\'' + id + '\')">&times;</button>' : ''}
        `;

        return notification;
    }

    getNotificationContainer(position) {
        let container = document.querySelector(`.toast-container.${position}`);
        
        if (!container) {
            container = document.createElement('div');
            container.className = `toast-container ${position}`;
            document.body.appendChild(container);
        }

        return container;
    }

    removeNotification(notificationId) {
        const notification = this.notifications.get(notificationId);
        if (!notification) return;

        this.animateOut(notification.element, 'slideOutRight', () => {
            notification.element.remove();
            this.notifications.delete(notificationId);
        });
    }

    limitNotifications(container, maxNotifications) {
        const notifications = container.children;
        if (notifications.length > maxNotifications) {
            const oldest = notifications[0];
            this.animateOut(oldest, 'slideOutRight', () => oldest.remove());
        }
    }

    /**
     * Loading States
     */
    
    showLoading(targetId, message = 'Loading...') {
        const target = document.getElementById(targetId);
        if (!target) return;

        const loadingId = `loading_${targetId}`;
        
        if (this.loadingStates.has(loadingId)) {
            return loadingId;
        }

        const overlay = document.createElement('div');
        overlay.id = loadingId;
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;

        target.style.position = 'relative';
        target.appendChild(overlay);
        
        this.loadingStates.add(loadingId);
        this.animateIn(overlay, 'fadeIn');

        return loadingId;
    }

    hideLoading(targetId) {
        const loadingId = `loading_${targetId}`;
        const overlay = document.getElementById(loadingId);
        
        if (!overlay || !this.loadingStates.has(loadingId)) {
            return;
        }

        this.animateOut(overlay, 'fadeOut', () => {
            overlay.remove();
            this.loadingStates.delete(loadingId);
        });
    }

    /**
     * Animation System
     */
    
    initializeAnimations() {
        // Add CSS animation classes if not present
        this.addAnimationStyles();
        
        // Setup intersection observer for scroll animations
        this.setupScrollAnimations();
    }

    animateIn(element, animation = 'fadeIn', duration = null) {
        const animationDuration = duration || this.animationSettings.duration.normal;
        
        element.style.animationDuration = `${animationDuration}ms`;
        element.style.animationTimingFunction = this.animationSettings.easing;
        
        element.classList.add('animate-in', `animate-${animation}`);
        
        return new Promise((resolve) => {
            const handleAnimationEnd = () => {
                element.classList.remove('animate-in', `animate-${animation}`);
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    animateOut(element, animation = 'fadeOut', callback = null, duration = null) {
        const animationDuration = duration || this.animationSettings.duration.normal;
        
        element.style.animationDuration = `${animationDuration}ms`;
        element.style.animationTimingFunction = this.animationSettings.easing;
        
        element.classList.add('animate-out', `animate-${animation}`);
        
        const handleAnimationEnd = () => {
            element.removeEventListener('animationend', handleAnimationEnd);
            if (callback) callback();
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
    }

    addAnimationStyles() {
        if (document.getElementById('unifyxAnimations')) return;

        const style = document.createElement('style');
        style.id = 'unifyxAnimations';
        style.textContent = `
            .animate-in, .animate-out {
                animation-fill-mode: both;
            }
            
            .animate-fadeIn {
                animation-name: fadeIn;
            }
            
            .animate-fadeOut {
                animation-name: fadeOut;
            }
            
            .animate-slideInRight {
                animation-name: slideInRight;
            }
            
            .animate-slideOutRight {
                animation-name: slideOutRight;
            }
            
            .animate-slideInUp {
                animation-name: slideInUp;
            }
            
            .animate-slideOutDown {
                animation-name: slideOutDown;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOutDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
                40%, 43% { transform: translateY(-30px); }
                70% { transform: translateY(-15px); }
                90% { transform: translateY(-4px); }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Component System
     */
    
    initializeComponents() {
        // Initialize dropdowns
        this.initializeDropdowns();
        
        // Initialize tabs
        this.initializeTabs();
        
        // Initialize forms
        this.initializeForms();
        
        // Initialize tables
        this.initializeTables();
    }

    initializeDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.classList.contains('open');
        
        // Close all other dropdowns
        this.closeAllDropdowns();
        
        if (!isOpen) {
            dropdown.classList.add('open');
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                this.animateIn(menu, 'slideInUp', 200);
            }
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }

    /**
     * Responsive Design Management
     */
    
    setupResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Initial setup
        this.handleResize();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Update device class
        document.body.className = document.body.className.replace(/device-\w+/g, '');
        
        if (width < 768) {
            document.body.classList.add('device-mobile');
            this.state.sidebarCollapsed = true;
        } else if (width < 1024) {
            document.body.classList.add('device-tablet');
        } else {
            document.body.classList.add('device-desktop');
            this.state.sidebarCollapsed = false;
        }
        
        // Update sidebar state
        this.updateSidebarState();
        
        // Dispatch resize event
        this.dispatchEvent('responsive-change', { width, height });
    }

    /**
     * Accessibility Features
     */
    
    setupAccessibility() {
        // Focus management
        this.setupFocusTrapping();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // ARIA labels and roles
        this.setupAriaLabels();
        
        // High contrast mode detection
        this.setupHighContrastMode();
    }

    setupFocusTrapping() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.activeModals.size > 0) {
                const currentModal = document.getElementById(this.state.currentModal);
                if (currentModal) {
                    this.trapFocus(e, currentModal);
                }
            }
        });
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Tooltip System
     */
    
    initializeTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            this.setupTooltip(element);
        });
    }

    setupTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        const position = element.getAttribute('data-tooltip-position') || 'top';
        
        element.addEventListener('mouseenter', () => {
            this.showTooltip(element, tooltipText, position);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        element.addEventListener('focus', () => {
            this.showTooltip(element, tooltipText, position);
        });
        
        element.addEventListener('blur', () => {
            this.hideTooltip();
        });
    }

    showTooltip(element, text, position) {
        this.hideTooltip(); // Hide existing tooltip
        
        const tooltip = document.createElement('div');
        tooltip.id = 'active-tooltip';
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 8;
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 8;
                break;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        this.animateIn(tooltip, 'fadeIn', 200);
        this.state.activeTooltip = tooltip;
    }

    hideTooltip() {
        if (this.state.activeTooltip) {
            this.state.activeTooltip.remove();
            this.state.activeTooltip = null;
        }
    }

    /**
     * Utility Methods
     */
    
    setupGlobalEventListeners() {
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.activeModals.size > 0) {
                    const currentModal = this.state.currentModal;
                    if (currentModal) {
                        this.closeModal(currentModal);
                    }
                }
                
                this.hideTooltip();
                this.closeAllDropdowns();
            }
        });
        
        // Prevent default form submissions
        document.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    dispatchEvent(eventName, data = {}) {
        const event = new CustomEvent(`unifyX:${eventName}`, {
            detail: data,
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }

    updateThemeToggle(theme) {
        const toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(toggle => {
            const icon = toggle.querySelector('i, .icon');
            if (icon) {
                icon.className = theme === 'dark' ? 'icon-sun' : 'icon-moon';
            }
        });
    }

    updateSidebarState() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed', this.state.sidebarCollapsed);
        }
        
        const body = document.body;
        body.classList.toggle('sidebar-collapsed', this.state.sidebarCollapsed);
    }

    // Public API methods
    showSuccess(title, message, options = {}) {
        return this.showNotification('success', title, message, options);
    }

    showError(title, message, options = {}) {
        return this.showNotification('error', title, message, options);
    }

    showWarning(title, message, options = {}) {
        return this.showNotification('warning', title, message, options);
    }

    showInfo(title, message, options = {}) {
        return this.showNotification('info', title, message, options);
    }

    confirm(title, message, callback, options = {}) {
        const confirmModal = document.createElement('div');
        confirmModal.id = 'confirm-modal';
        confirmModal.className = 'modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.UIManager.closeModal('confirm-modal')">Cancel</button>
                    <button class="btn btn-primary" onclick="window.UIManager.handleConfirm('confirm-modal')">Confirm</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        this._confirmCallback = callback;
        this.showModal('confirm-modal');
    }

    handleConfirm(modalId) {
        if (this._confirmCallback) {
            this._confirmCallback(true);
            this._confirmCallback = null;
        }
        this.closeModal(modalId);
        document.getElementById(modalId).remove();
    }

    getState() {
        return { ...this.state };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
}

// Create and export global UIManager instance
window.UIManager = new UIManager();

console.log('🎨 UnifyX Bill Maker UIManager Loaded Successfully!');
