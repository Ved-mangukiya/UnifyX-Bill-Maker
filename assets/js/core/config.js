/**
 * ⚡️ UnifyX Bill Maker - Configuration
 * Core application configuration and settings
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class AppConfig {
    constructor() {
        this.version = '1.0.0';
        this.appName = 'UnifyX Bill Maker';
        this.author = 'Ved Mangukiya';
        this.buildDate = new Date().toISOString();
        
        // Storage configuration
        this.storage = {
            prefix: 'unifyxBillMaker_',
            version: '1.0',
            maxSize: 50 * 1024 * 1024, // 50MB localStorage limit
            backupInterval: 7 * 24 * 60 * 60 * 1000, // 7 days
            autoSaveInterval: 30000, // 30 seconds
        };

        // UI Configuration
        this.ui = {
            theme: {
                default: 'light',
                options: ['light', 'dark', 'auto']
            },
            responsive: {
                mobileBreakpoint: 768,
                tabletBreakpoint: 1024,
                desktopBreakpoint: 1200
            },
            animations: {
                enabled: true,
                duration: {
                    fast: 150,
                    normal: 250,
                    slow: 350
                }
            },
            notifications: {
                duration: 5000,
                maxVisible: 5,
                position: 'top-right'
            }
        };

        // Business Configuration
        this.business = {
            maxProfiles: 50,
            defaultCurrency: 'INR',
            supportedCurrencies: [
                { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
                { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
                { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
                { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
                { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 }
            ],
            gstRates: [0, 5, 12, 18, 28],
            invoiceNumberFormats: [
                { id: 'default', label: 'INV-{###}', format: 'INV-{###}' },
                { id: 'yearly', label: 'INV-{YYYY}-{###}', format: 'INV-{YYYY}-{###}' },
                { id: 'monthly', label: '{MM}/{YYYY}/{###}', format: '{MM}/{YYYY}/{###}' },
                { id: 'custom', label: 'Custom Format', format: '{PREFIX}-{YYYY}-{###}' }
            ]
        };

        // Product Configuration
        this.products = {
            maxProducts: 10000,
            maxCategories: 100,
            imageMaxSize: 2 * 1024 * 1024, // 2MB per image
            supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
            stockAlertThreshold: 10,
            batchSize: 100, // For bulk operations
            searchMinLength: 2
        };

        // Customer Configuration
        this.customers = {
            maxCustomers: 5000,
            searchMinLength: 2,
            autoCompleteLimit: 10,
            loyaltyPointsEnabled: true,
            birthdayReminders: true
        };

        // Billing Configuration
        this.billing = {
            maxItemsPerBill: 100,
            maxDrafts: 50,
            taxCalculation: 'exclusive', // 'inclusive' or 'exclusive'
            roundingPrecision: 2,
            discountTypes: ['percentage', 'fixed'],
            paymentMethods: ['cash', 'upi', 'card', 'cheque', 'bank-transfer'],
            billStatuses: ['draft', 'generated', 'sent', 'paid', 'cancelled', 'returned'],
            multiBillLimit: 5
        };

        // PDF Configuration
        this.pdf = {
            formats: ['A4', 'A5', 'thermal-80mm', 'thermal-58mm'],
            defaultFormat: 'A4',
            margins: {
                A4: { top: 20, right: 20, bottom: 20, left: 20 },
                A5: { top: 15, right: 15, bottom: 15, left: 15 },
                thermal: { top: 5, right: 5, bottom: 5, left: 5 }
            },
            maxFileSize: 10 * 1024 * 1024, // 10MB
            watermarks: ['PAID', 'DRAFT', 'COPY', 'CANCELLED'],
            compression: true
        };

        // Analytics Configuration
        this.analytics = {
            retentionDays: 365,
            reportTypes: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
            chartTypes: ['line', 'bar', 'pie', 'doughnut', 'area'],
            exportFormats: ['pdf', 'csv', 'json', 'excel']
        };

        // Keyboard Shortcuts
        this.shortcuts = {
            enabled: true,
            showPanel: 'F1',
            newBill: 'Ctrl+N',
            saveBill: 'Ctrl+S',
            printBill: 'Ctrl+P',
            deleteRow: 'Ctrl+D',
            bulkEntry: 'Ctrl+B',
            multiBill: 'Ctrl+M',
            calculator: 'F2',
            searchProduct: 'F3',
            searchCustomer: 'F4',
            nextField: 'Enter',
            prevField: 'Shift+Enter',
            closeModal: 'Escape'
        };

        // Security Configuration
        this.security = {
            sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
            lockAfterInactivity: 30 * 60 * 1000, // 30 minutes
            maxLoginAttempts: 5,
            passwordMinLength: 6,
            enableEncryption: false // For future use
        };

        // Development Configuration
        this.development = {
            debug: false,
            logging: {
                enabled: true,
                level: 'info', // 'debug', 'info', 'warn', 'error'
                maxLogs: 1000
            },
            performance: {
                monitoring: true,
                slowQueryThreshold: 100 // milliseconds
            }
        };

        // Language Configuration
        this.language = {
            default: 'en',
            supported: ['en', 'hi', 'gu'],
            rtl: false,
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '12h' // '12h' or '24h'
        };

        // Backup Configuration
        this.backup = {
            autoBackup: true,
            maxBackups: 10,
            includeImages: false, // To keep backup size small
            compression: true,
            cloudSync: false // For future use
        };

        // Initialize default settings
        this.initializeDefaults();
    }

    /**
     * Initialize default application settings
     */
    initializeDefaults() {
        this.defaults = {
            business: {
                name: '',
                gstin: '',
                address: '',
                phone: '',
                email: '',
                website: '',
                logo: null,
                signature: null,
                theme: 'modern',
                currency: 'INR'
            },
            invoice: {
                template: 'modern',
                numberFormat: 'default',
                taxType: 'exclusive',
                showHSN: true,
                showSignature: true,
                showLogo: true,
                termsAndConditions: 'Payment due within 30 days.',
                thankYouNote: 'Thank you for your business!'
            },
            ui: {
                theme: 'light',
                language: 'en',
                showShortcuts: true,
                autoSave: true,
                soundNotifications: true,
                animations: true
            }
        };
    }

    /**
     * Get configuration value by path
     * @param {string} path - Dot notation path (e.g., 'ui.theme.default')
     * @returns {any} Configuration value
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this);
    }

    /**
     * Set configuration value by path
     * @param {string} path - Dot notation path
     * @param {any} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, this);
        target[lastKey] = value;
    }

    /**
     * Get all supported currencies with formatting info
     * @returns {Array} Currency configuration array
     */
    getCurrencies() {
        return this.business.supportedCurrencies.map(currency => ({
            ...currency,
            formatter: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: currency.code,
                minimumFractionDigits: currency.decimals,
                maximumFractionDigits: currency.decimals
            })
        }));
    }

    /**
     * Get currency by code
     * @param {string} code - Currency code
     * @returns {Object} Currency configuration
     */
    getCurrency(code = 'INR') {
        return this.business.supportedCurrencies.find(currency => 
            currency.code === code
        ) || this.business.supportedCurrencies[0];
    }

    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} Feature status
     */
    isFeatureEnabled(feature) {
        const featureMap = {
            'animations': this.ui.animations.enabled,
            'shortcuts': this.shortcuts.enabled,
            'autoBackup': this.backup.autoBackup,
            'debug': this.development.debug,
            'logging': this.development.logging.enabled,
            'loyaltyPoints': this.customers.loyaltyPointsEnabled,
            'birthdayReminders': this.customers.birthdayReminders
        };
        
        return featureMap[feature] !== undefined ? featureMap[feature] : false;
    }

    /**
     * Get device type based on screen width
     * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < this.ui.responsive.mobileBreakpoint) return 'mobile';
        if (width < this.ui.responsive.tabletBreakpoint) return 'tablet';
        return 'desktop';
    }

    /**
     * Check if mobile device
     * @returns {boolean} Is mobile device
     */
    isMobile() {
        return this.getDeviceType() === 'mobile';
    }

    /**
     * Get animation duration by type
     * @param {string} type - Animation type: 'fast', 'normal', or 'slow'
     * @returns {number} Duration in milliseconds
     */
    getAnimationDuration(type = 'normal') {
        return this.ui.animations.duration[type] || this.ui.animations.duration.normal;
    }

    /**
     * Export configuration
     * @returns {Object} Configuration object
     */
    export() {
        return {
            version: this.version,
            appName: this.appName,
            config: {
                storage: this.storage,
                ui: this.ui,
                business: this.business,
                products: this.products,
                customers: this.customers,
                billing: this.billing,
                pdf: this.pdf,
                analytics: this.analytics,
                shortcuts: this.shortcuts,
                language: this.language,
                backup: this.backup
            },
            defaults: this.defaults,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import configuration
     * @param {Object} configData - Configuration data to import
     * @returns {boolean} Import success status
     */
    import(configData) {
        try {
            if (configData.version !== this.version) {
                console.warn('Configuration version mismatch');
            }

            // Merge imported config with current config
            Object.keys(configData.config).forEach(key => {
                if (this[key]) {
                    this[key] = { ...this[key], ...configData.config[key] };
                }
            });

            // Merge defaults
            if (configData.defaults) {
                this.defaults = { ...this.defaults, ...configData.defaults };
            }

            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            return false;
        }
    }

    /**
     * Reset configuration to defaults
     */
    reset() {
        this.initializeDefaults();
        console.log('Configuration reset to defaults');
    }

    /**
     * Validate configuration
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];
        const warnings = [];

        // Validate storage limits
        if (this.storage.maxSize < 10 * 1024 * 1024) { // 10MB minimum
            warnings.push('Storage max size is very low, may cause issues');
        }

        // Validate currency codes
        this.business.supportedCurrencies.forEach(currency => {
            if (!/^[A-Z]{3}$/.test(currency.code)) {
                errors.push(`Invalid currency code: ${currency.code}`);
            }
        });

        // Validate GST rates
        this.business.gstRates.forEach(rate => {
            if (rate < 0 || rate > 100) {
                errors.push(`Invalid GST rate: ${rate}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Create and export global configuration instance
window.AppConfig = new AppConfig();

// Freeze the configuration to prevent accidental modifications
Object.freeze(window.AppConfig);

console.log('⚡️ UnifyX Bill Maker Configuration Loaded Successfully!');
