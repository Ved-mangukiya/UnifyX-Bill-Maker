/**
 * ⚡️ UnifyX Bill Maker - Main Application Class
 * Core application initialization and management
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class UnifyXApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.currentUser = null;
        this.currentBusiness = null;
        this.activeTab = 'dashboard';
        this.modals = new Map();
        this.shortcuts = new Map();
        this.observers = new Map();
        this.cache = new Map();
        this.state = {
            isLoading: false,
            theme: 'light',
            language: 'en',
            deviceType: 'desktop',
            isOnline: navigator.onLine,
            lastActivity: Date.now()
        };

        // Performance monitoring
        this.performance = {
            startTime: performance.now(),
            loadTimes: {},
            errors: [],
            warnings: []
        };

        // Event listeners storage
        this.eventListeners = new Map();
        
        // Initialize application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing UnifyX Bill Maker...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core components
            await this.initializeCore();
            
            // Load user data and settings
            await this.loadUserData();
            
            // Setup UI and event handlers
            await this.initializeUI();
            
            // Setup keyboard shortcuts
            this.initializeKeyboardShortcuts();
            
            // Setup auto-save and cleanup
            this.initializePeriodicTasks();
            
            // Setup error handling
            this.initializeErrorHandling();
            
            // Mark as initialized
            this.initialized = true;
            
            // Hide loading screen and show app
            await this.hideLoadingScreen();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            console.log('✅ UnifyX Bill Maker initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Initialize core components
     */
    async initializeCore() {
        // Initialize data managers
        if (window.DataManager) {
            this.dataManager = window.DataManager;
        }
        
        if (window.BusinessManager) {
            this.businessManager = window.BusinessManager;
        }
        
        if (window.ProductManager) {
            this.productManager = window.ProductManager;
        }
        
        if (window.CustomerManager) {
            this.customerManager = window.CustomerManager;
        }
        
        if (window.BillingEngine) {
            this.billingEngine = window.BillingEngine;
        }

        // Detect device type
        this.detectDeviceType();
        
        // Load app configuration
        this.loadConfiguration();
        
        // Initialize theme
        this.initializeTheme();
    }

    /**
     * Load user data and settings
     */
    async loadUserData() {
        try {
            // Load settings
            const settings = this.dataManager?.getSettings() || {};
            this.applySettings(settings);
            
            // Load active business profile
            const businesses = this.dataManager?.getBusinessProfiles() || [];
            if (businesses.length > 0) {
                this.currentBusiness = businesses.find(b => b.isActive) || businesses[0];
            }
            
            // Load recent activity
            this.loadRecentActivity();
            
        } catch (error) {
            console.warn('Failed to load user data:', error);
        }
    }

    /**
     * Initialize UI components
     */
    async initializeUI() {
        // Setup tab navigation
        this.initializeTabNavigation();
        
        // Setup responsive handlers
        this.initializeResponsiveHandlers();
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        // Initialize components
        await this.initializeComponents();
        
        // Setup modal system
        this.initializeModalSystem();
        
        // Setup notification system
        this.initializeNotificationSystem();
        
        // Load initial tab content
        this.switchTab(this.activeTab);
    }

    /**
     * Initialize tab navigation
     */
    initializeTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            this.addEventListener(button, 'click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Setup tab keyboard navigation
        this.addEventListener(document, 'keydown', (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const tabIndex = parseInt(e.key) - 1;
                const tabs = ['dashboard', 'products', 'customers', 'billing', 'analytics', 'settings'];
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }
        });
    }

    /**
     * Switch active tab
     * @param {string} tabName - Tab to switch to
     */
    switchTab(tabName) {
        try {
            // Update active tab
            this.activeTab = tabName;
            
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });
            
            // Update tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabName);
            });
            
            // Load tab-specific data
            this.loadTabContent(tabName);
            
            // Update URL without page reload
            this.updateURL(tabName);
            
            // Track analytics
            this.trackEvent('tab_switch', { tab: tabName });
            
        } catch (error) {
            console.error('Failed to switch tab:', error);
        }
    }

    /**
     * Load content for specific tab
     * @param {string} tabName - Tab name
     */
    async loadTabContent(tabName) {
        try {
            this.showTabLoading(tabName);
            
            switch (tabName) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'products':
                    await this.loadProducts();
                    break;
                case 'customers':
                    await this.loadCustomers();
                    break;
                case 'billing':
                    await this.loadBilling();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'settings':
                    await this.loadSettings();
                    break;
            }
            
            this.hideTabLoading(tabName);
            
        } catch (error) {
            console.error(`Failed to load ${tabName} content:`, error);
            this.hideTabLoading(tabName);
            this.showError(`Failed to load ${tabName} content`);
        }
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeKeyboardShortcuts() {
        const shortcuts = AppConstants.SHORTCUTS;
        
        this.addEventListener(document, 'keydown', (e) => {
            const key = this.getKeyCombo(e);
            const shortcut = shortcuts[key];
            
            if (shortcut && this.canExecuteShortcut(shortcut, e)) {
                e.preventDefault();
                this.executeShortcut(shortcut.action, e);
            }
        });

        // Store shortcuts for reference panel
        this.shortcuts = new Map(Object.entries(shortcuts));
    }

    /**
     * Get key combination string
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Key combination
     */
    getKeyCombo(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.altKey) parts.push('Alt');
        if (event.metaKey) parts.push('Meta');
        
        const key = event.key === ' ' ? 'Space' : event.key;
        parts.push(key);
        
        return parts.join('+');
    }

    /**
     * Execute keyboard shortcut
     * @param {string} action - Action to execute
     * @param {KeyboardEvent} event - Original event
     */
    executeShortcut(action, event) {
        try {
            switch (action) {
                case 'showShortcuts':
                    this.toggleShortcutsPanel();
                    break;
                case 'openCalculator':
                    this.openCalculator();
                    break;
                case 'searchProduct':
                    this.focusProductSearch();
                    break;
                case 'searchCustomer':
                    this.focusCustomerSearch();
                    break;
                case 'newBill':
                    this.createNewBill();
                    break;
                case 'saveBill':
                    this.saveBill();
                    break;
                case 'printBill':
                    this.printBill();
                    break;
                case 'deleteRow':
                    this.deleteSelectedRow();
                    break;
                case 'bulkEntry':
                    this.toggleBulkEntry();
                    break;
                case 'multiBill':
                    this.toggleMultiBill();
                    break;
                case 'nextField':
                    this.focusNextField();
                    break;
                case 'prevField':
                    this.focusPrevField();
                    break;
                case 'closeModal':
                    this.closeTopModal();
                    break;
                case 'quickSearch':
                    this.openQuickSearch();
                    break;
                case 'gotoTab':
                    // Handled in tab navigation
                    break;
                default:
                    console.warn(`Unknown shortcut action: ${action}`);
            }
        } catch (error) {
            console.error(`Failed to execute shortcut ${action}:`, error);
        }
    }

    /**
     * Initialize periodic tasks
     */
    initializePeriodicTasks() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.autoSave();
            }
        }, 30000);

        // Activity tracking
        setInterval(() => {
            this.trackActivity();
        }, 60000);

        // Cache cleanup every 5 minutes
        setInterval(() => {
            this.cleanupCache();
        }, 300000);

        // Performance monitoring
        setInterval(() => {
            this.monitorPerformance();
        }, 60000);
    }

    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });

        // Network status monitoring
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.showNotification('success', 'Connection restored', 'You are back online');
        });

        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.showNotification('warning', 'Connection lost', 'Working in offline mode');
        });
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    async hideLoadingScreen() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                const app = document.getElementById('app');
                
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                
                if (app) {
                    app.classList.remove('hidden');
                }
                
                resolve();
            }, 1500); // Minimum loading time for UX
        });
    }

    /**
     * Detect device type
     */
    detectDeviceType() {
        const width = window.innerWidth;
        if (width < AppConstants.UI.BREAKPOINTS.MOBILE) {
            this.state.deviceType = 'mobile';
        } else if (width < AppConstants.UI.BREAKPOINTS.TABLET) {
            this.state.deviceType = 'tablet';
        } else {
            this.state.deviceType = 'desktop';
        }
        
        document.body.setAttribute('data-device', this.state.deviceType);
    }

    /**
     * Initialize theme system
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Setup theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.addEventListener(themeToggle, 'click', () => {
                this.toggleTheme();
            });
        }
        
        // Watch for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (this.state.theme === 'auto') {
                    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Set application theme
     * @param {string} theme - Theme name ('light', 'dark', 'auto')
     */
    setTheme(theme) {
        this.state.theme = theme;
        
        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        document.documentElement.setAttribute('data-theme', actualTheme);
        localStorage.setItem('theme', theme);
        
        // Update theme toggle button
        this.updateThemeToggle(theme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.state.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }

    /**
     * Initialize responsive handlers
     */
    initializeResponsiveHandlers() {
        let resizeTimeout;
        
        this.addEventListener(window, 'resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.detectDeviceType();
                this.handleResize();
            }, 250);
        });
        
        // Handle orientation change on mobile
        this.addEventListener(window, 'orientationchange', () => {
            setTimeout(() => {
                this.detectDeviceType();
                this.handleOrientationChange();
            }, 100);
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Click outside to close dropdowns/modals
        this.addEventListener(document, 'click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Focus management
        this.addEventListener(document, 'focusin', (e) => {
            this.handleFocusChange(e);
        });
        
        // Form submission prevention
        this.addEventListener(document, 'submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(e);
        });
        
        // Context menu customization
        this.addEventListener(document, 'contextmenu', (e) => {
            // Add custom context menu if needed
            if (e.target.classList.contains('custom-context')) {
                e.preventDefault();
                this.showCustomContextMenu(e);
            }
        });
    }

    /**
     * Add event listener and track it for cleanup
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Store for cleanup
        const key = `${element.constructor.name}_${event}_${Date.now()}`;
        this.eventListeners.set(key, { element, event, handler, options });
    }

    /**
     * Show notification
     * @param {string} type - Notification type
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {number} duration - Duration in ms
     */
    showNotification(type, title, message, duration = null) {
        const notification = AppConstants.NOTIFICATION_TYPES[type.toUpperCase()] || AppConstants.NOTIFICATION_TYPES.INFO;
        
        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = `toast ${notification.type}`;
        notificationEl.innerHTML = `
            <div class="toast-icon">${notification.icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notificationEl);
        
        // Auto remove
        const removeAfter = duration || notification.duration;
        setTimeout(() => {
            if (notificationEl.parentElement) {
                notificationEl.remove();
            }
        }, removeAfter);
        
        // Limit number of notifications
        const maxNotifications = AppConfig.get('ui.notifications.maxVisible') || 5;
        const notifications = container.children;
        if (notifications.length > maxNotifications) {
            notifications[0].remove();
        }
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {string} title - Error title
     */
    showError(message, title = 'Error') {
        this.showNotification('error', title, message);
        console.error(`${title}: ${message}`);
    }

    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {string} title - Success title
     */
    showSuccess(message, title = 'Success') {
        this.showNotification('success', title, message);
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Good morning';
        
        if (hour >= 12 && hour < 17) {
            greeting = 'Good afternoon';
        } else if (hour >= 17) {
            greeting = 'Good evening';
        }
        
        const businessName = this.currentBusiness?.name || 'there';
        this.showSuccess(`${greeting}, ${businessName}! Welcome to UnifyX Bill Maker`, 'Welcome Back');
    }

    /**
     * Handle critical errors
     * @param {Error} error - Error object
     */
    handleCriticalError(error) {
        console.error('Critical error:', error);
        
        // Show error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'modal active critical-error';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Application Error</h3>
                </div>
                <div class="modal-body">
                    <p>A critical error occurred and the application needs to restart.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p>Your data is safe. Click reload to restart the application.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Reload Application
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
    }

    /**
     * Track analytics event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackEvent(event, data = {}) {
        try {
            const eventData = {
                event,
                timestamp: new Date().toISOString(),
                session: this.getSessionId(),
                user: this.currentUser?.id,
                business: this.currentBusiness?.id,
                device: this.state.deviceType,
                ...data
            };
            
            // Store in analytics
            const analytics = this.dataManager?.getAnalytics() || [];
            analytics.push(eventData);
            
            // Keep only last 1000 events
            if (analytics.length > 1000) {
                analytics.splice(0, analytics.length - 1000);
            }
            
            this.dataManager?.setAnalytics(analytics);
            
        } catch (error) {
            console.warn('Failed to track event:', error);
        }
    }

    /**
     * Get or create session ID
     * @returns {string} Session ID
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }

    /**
     * Cleanup resources before page unload
     */
    cleanup() {
        try {
            // Remove event listeners
            this.eventListeners.forEach(({ element, event, handler, options }, key) => {
                element.removeEventListener(event, handler, options);
            });
            this.eventListeners.clear();
            
            // Clear intervals and timeouts
            // Note: Specific intervals would be stored and cleared here
            
            // Save any pending data
            if (this.hasUnsavedChanges()) {
                this.autoSave();
            }
            
            // Clear cache
            this.cache.clear();
            
            console.log('Application cleanup completed');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    /**
     * Check if there are unsaved changes
     * @returns {boolean} Has unsaved changes
     */
    hasUnsavedChanges() {
        // Implementation depends on specific form states
        return false; // Placeholder
    }

    /**
     * Auto-save functionality
     */
    autoSave() {
        try {
            // Implementation for auto-saving current state
            console.log('Auto-saving...');
            this.trackEvent('auto_save');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.UnifyXApp = new UnifyXApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.UnifyXApp) {
        window.UnifyXApp.cleanup();
    }
});

console.log('⚡️ UnifyX Bill Maker App Core Loaded Successfully!');
