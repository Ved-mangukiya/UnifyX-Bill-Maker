/**
 * ⚡️ UnifyX Bill Maker - Constants & Enums
 * Application constants, enums, and static data
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class AppConstants {
    constructor() {
        // Application Metadata
        this.APP = Object.freeze({
            NAME: 'UnifyX Bill Maker',
            VERSION: '1.0.0',
            AUTHOR: 'Ved Mangukiya',
            BUILD_DATE: '2025-09-01',
            DESCRIPTION: 'Complete Billing Solution for Modern Businesses',
            LOGO: '⚡️',
            TAGLINE: 'Digital Sidekick for Smart Billing'
        });

        // Storage Keys
        this.STORAGE_KEYS = Object.freeze({
            BUSINESSES: 'businesses',
            CUSTOMERS: 'customers',
            PRODUCTS: 'products',
            INVOICES: 'invoices',
            DRAFTS: 'drafts',
            SETTINGS: 'settings',
            TEMPLATES: 'templates',
            BACKUP: 'backup',
            SESSION: 'session',
            COUNTERS: 'counters',
            ANALYTICS: 'analytics',
            LOGS: 'logs',
            CACHE: 'cache'
        });

        // UI Constants
        this.UI = Object.freeze({
            BREAKPOINTS: window.BREAKPOINTS || { mobile: 768, tablet: 1024, desktop: 1200 },
            THEMES: ['light', 'dark', 'auto'],
            LANGUAGES: ['en', 'hi', 'gu'],
            DEVICE_TYPES: ['mobile', 'tablet', 'desktop'],
            ANIMATION_SPEEDS: {
                FAST: 150,
                NORMAL: 250,
                SLOW: 350,
                EXTRA_SLOW: 500
            },
            Z_INDEX: {
                BASE: 1,
                DROPDOWN: 100,
                STICKY: 200,
                MODAL: 1000,
                TOAST: 2000,
                LOADING: 9999
            }
        });

        // Business Types & Categories
        this.BUSINESS_TYPES = Object.freeze([
            { id: 'retail', name: 'Retail Store', icon: '🛍️' },
            { id: 'wholesale', name: 'Wholesale', icon: '📦' },
            { id: 'service', name: 'Service Provider', icon: '🔧' },
            { id: 'restaurant', name: 'Restaurant/Cafe', icon: '🍽️' },
            { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
            { id: 'electronics', name: 'Electronics', icon: '📱' },
            { id: 'clothing', name: 'Clothing/Fashion', icon: '👕' },
            { id: 'automotive', name: 'Automotive', icon: '🚗' },
            { id: 'beauty', name: 'Beauty/Salon', icon: '💄' },
            { id: 'other', name: 'Other', icon: '🏢' }
        ]);

        // Currency Configurations
        this.CURRENCIES = Object.freeze({
            INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2, code: 'INR' },
            USD: { symbol: '$', name: 'US Dollar', decimals: 2, code: 'USD' },
            EUR: { symbol: '€', name: 'Euro', decimals: 2, code: 'EUR' },
            GBP: { symbol: '£', name: 'British Pound', decimals: 2, code: 'GBP' },
            JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0, code: 'JPY' },
            AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, code: 'AED' },
            CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2, code: 'CAD' },
            AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2, code: 'AUD' }
        });

        // Indian States with GST Codes
        this.INDIAN_STATES = Object.freeze([
            { code: '01', name: 'Jammu and Kashmir', gstCode: '01' },
            { code: '02', name: 'Himachal Pradesh', gstCode: '02' },
            { code: '03', name: 'Punjab', gstCode: '03' },
            { code: '04', name: 'Chandigarh', gstCode: '04' },
            { code: '05', name: 'Uttarakhand', gstCode: '05' },
            { code: '06', name: 'Haryana', gstCode: '06' },
            { code: '07', name: 'Delhi', gstCode: '07' },
            { code: '08', name: 'Rajasthan', gstCode: '08' },
            { code: '09', name: 'Uttar Pradesh', gstCode: '09' },
            { code: '10', name: 'Bihar', gstCode: '10' },
            { code: '11', name: 'Sikkim', gstCode: '11' },
            { code: '12', name: 'Arunachal Pradesh', gstCode: '12' },
            { code: '13', name: 'Nagaland', gstCode: '13' },
            { code: '14', name: 'Manipur', gstCode: '14' },
            { code: '15', name: 'Mizoram', gstCode: '15' },
            { code: '16', name: 'Tripura', gstCode: '16' },
            { code: '17', name: 'Meghalaya', gstCode: '17' },
            { code: '18', name: 'Assam', gstCode: '18' },
            { code: '19', name: 'West Bengal', gstCode: '19' },
            { code: '20', name: 'Jharkhand', gstCode: '20' },
            { code: '21', name: 'Odisha', gstCode: '21' },
            { code: '22', name: 'Chhattisgarh', gstCode: '22' },
            { code: '23', name: 'Madhya Pradesh', gstCode: '23' },
            { code: '24', name: 'Gujarat', gstCode: '24' },
            { code: '27', name: 'Maharashtra', gstCode: '27' },
            { code: '29', name: 'Karnataka', gstCode: '29' },
            { code: '32', name: 'Kerala', gstCode: '32' },
            { code: '33', name: 'Tamil Nadu', gstCode: '33' },
            { code: '34', name: 'Puducherry', gstCode: '34' },
            { code: '35', name: 'Andaman and Nicobar Islands', gstCode: '35' },
            { code: '36', name: 'Telangana', gstCode: '36' },
            { code: '37', name: 'Andhra Pradesh', gstCode: '37' }
        ]);

        // Tax Rates & Types
        this.TAX = Object.freeze({
            GST_RATES: [0, 5, 12, 18, 28],
            VAT_RATES: [0, 5, 12.5, 20],
            TYPES: {
                GST: 'gst',
                VAT: 'vat',
                SALES_TAX: 'sales_tax',
                NONE: 'none'
            },
            CALCULATION: {
                INCLUSIVE: 'inclusive',
                EXCLUSIVE: 'exclusive'
            }
        });

        // Product Categories
        this.PRODUCT_CATEGORIES = Object.freeze([
            { id: 'electronics', name: 'Electronics', icon: '📱', color: '#3b82f6' },
            { id: 'clothing', name: 'Clothing & Fashion', icon: '👕', color: '#8b5cf6' },
            { id: 'food', name: 'Food & Beverages', icon: '🍕', color: '#ef4444' },
            { id: 'books', name: 'Books & Stationery', icon: '📚', color: '#10b981' },
            { id: 'home', name: 'Home & Kitchen', icon: '🏠', color: '#f59e0b' },
            { id: 'health', name: 'Health & Beauty', icon: '💊', color: '#06b6d4' },
            { id: 'sports', name: 'Sports & Fitness', icon: '⚽', color: '#84cc16' },
            { id: 'automotive', name: 'Automotive', icon: '🚗', color: '#6366f1' },
            { id: 'jewelry', name: 'Jewelry & Accessories', icon: '💍', color: '#ec4899' },
            { id: 'toys', name: 'Toys & Games', icon: '🎮', color: '#f97316' },
            { id: 'tools', name: 'Tools & Hardware', icon: '🔨', color: '#64748b' },
            { id: 'other', name: 'Other', icon: '📦', color: '#6b7280' }
        ]);

        // Units of Measurement
        this.UNITS = Object.freeze({
            QUANTITY: [
                { id: 'pcs', name: 'Pieces', symbol: 'pcs' },
                { id: 'nos', name: 'Numbers', symbol: 'nos' },
                { id: 'sets', name: 'Sets', symbol: 'sets' },
                { id: 'pairs', name: 'Pairs', symbol: 'pairs' },
                { id: 'dozen', name: 'Dozen', symbol: 'dzn' }
            ],
            WEIGHT: [
                { id: 'kg', name: 'Kilogram', symbol: 'kg' },
                { id: 'gm', name: 'Gram', symbol: 'gm' },
                { id: 'ton', name: 'Ton', symbol: 'ton' },
                { id: 'lb', name: 'Pound', symbol: 'lb' },
                { id: 'oz', name: 'Ounce', symbol: 'oz' }
            ],
            VOLUME: [
                { id: 'ltr', name: 'Liter', symbol: 'ltr' },
                { id: 'ml', name: 'Milliliter', symbol: 'ml' },
                { id: 'gal', name: 'Gallon', symbol: 'gal' }
            ],
            LENGTH: [
                { id: 'm', name: 'Meter', symbol: 'm' },
                { id: 'cm', name: 'Centimeter', symbol: 'cm' },
                { id: 'ft', name: 'Feet', symbol: 'ft' },
                { id: 'inch', name: 'Inch', symbol: 'inch' }
            ]
        });

        // Invoice Statuses
        this.INVOICE_STATUS = Object.freeze({
            DRAFT: { id: 'draft', name: 'Draft', color: '#64748b', icon: '📝' },
            GENERATED: { id: 'generated', name: 'Generated', color: '#3b82f6', icon: '📄' },
            SENT: { id: 'sent', name: 'Sent', color: '#8b5cf6', icon: '📧' },
            PAID: { id: 'paid', name: 'Paid', color: '#10b981', icon: '✅' },
            OVERDUE: { id: 'overdue', name: 'Overdue', color: '#ef4444', icon: '⏰' },
            CANCELLED: { id: 'cancelled', name: 'Cancelled', color: '#6b7280', icon: '❌' },
            RETURNED: { id: 'returned', name: 'Returned', color: '#f59e0b', icon: '↩️' }
        });

        // Payment Methods
        this.PAYMENT_METHODS = Object.freeze([
            { id: 'cash', name: 'Cash', icon: '💵', color: '#10b981' },
            { id: 'upi', name: 'UPI', icon: '📱', color: '#3b82f6' },
            { id: 'card', name: 'Card', icon: '💳', color: '#8b5cf6' },
            { id: 'cheque', name: 'Cheque', icon: '📝', color: '#f59e0b' },
            { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: '#06b6d4' },
            { id: 'wallet', name: 'Digital Wallet', icon: '📲', color: '#ec4899' },
            { id: 'credit', name: 'Credit', icon: '💰', color: '#ef4444' }
        ]);

        // Bill Types
        this.BILL_TYPES = Object.freeze({
            TAX_INVOICE: {
                id: 'tax_invoice',
                name: 'Tax Invoice',
                description: 'GST registered business',
                icon: '🧾',
                requiresGST: true,
                showHSN: true,
                showTax: true
            },
            BILL_OF_SUPPLY: {
                id: 'bill_of_supply',
                name: 'Bill of Supply',
                description: 'Composition scheme',
                icon: '📄',
                requiresGST: false,
                showHSN: true,
                showTax: false
            },
            CASH_MEMO: {
                id: 'cash_memo',
                name: 'Cash Memo',
                description: 'Individual/Used items',
                icon: '🧾',
                requiresGST: false,
                showHSN: false,
                showTax: false
            },
            ESTIMATE: {
                id: 'estimate',
                name: 'Estimate/Quote',
                description: 'Price quotation',
                icon: '💭',
                requiresGST: false,
                showHSN: true,
                showTax: true
            }
        });

        // PDF Templates
        this.TEMPLATES = Object.freeze({
            MODERN: {
                id: 'modern',
                name: 'Modern',
                description: 'Clean, modern design with bold typography',
                preview: '🎨',
                colors: { primary: '#6366f1', secondary: '#64748b', accent: '#10b981' }
            },
            MINIMAL: {
                id: 'minimal',
                name: 'Minimal',
                description: 'Simple, clean layout with minimal design',
                preview: '📄',
                colors: { primary: '#000000', secondary: '#666666', accent: '#000000' }
            },
            CLASSIC: {
                id: 'classic',
                name: 'Classic',
                description: 'Traditional business invoice template',
                preview: '📋',
                colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' }
            },
            CORPORATE: {
                id: 'corporate',
                name: 'Corporate',
                description: 'Professional corporate invoice design',
                preview: '🏢',
                colors: { primary: '#1e40af', secondary: '#64748b', accent: '#059669' }
            },
            CREATIVE: {
                id: 'creative',
                name: 'Creative',
                description: 'Colorful, creative design for modern businesses',
                preview: '🎭',
                colors: { primary: '#7c3aed', secondary: '#64748b', accent: '#f59e0b' }
            }
        });

        // Keyboard Shortcuts Map
        this.SHORTCUTS = Object.freeze({
            // Navigation
            'F1': { action: 'showShortcuts', description: 'Show shortcuts panel' },
            'F2': { action: 'openCalculator', description: 'Open calculator' },
            'F3': { action: 'searchProduct', description: 'Search products' },
            'F4': { action: 'searchCustomer', description: 'Search customers' },
            
            // Bill Operations
            'Ctrl+N': { action: 'newBill', description: 'Create new bill' },
            'Ctrl+S': { action: 'saveBill', description: 'Save current bill' },
            'Ctrl+P': { action: 'printBill', description: 'Print/PDF bill' },
            'Ctrl+D': { action: 'deleteRow', description: 'Delete selected row' },
            'Ctrl+B': { action: 'bulkEntry', description: 'Bulk entry mode' },
            'Ctrl+M': { action: 'multiBill', description: 'Multi-bill mode' },
            'Ctrl+Z': { action: 'undo', description: 'Undo last action' },
            'Ctrl+Y': { action: 'redo', description: 'Redo last action' },
            
            // Form Navigation
            'Enter': { action: 'nextField', description: 'Move to next field' },
            'Shift+Enter': { action: 'prevField', description: 'Move to previous field' },
            'Tab': { action: 'nextField', description: 'Move to next field' },
            'Shift+Tab': { action: 'prevField', description: 'Move to previous field' },
            
            // Modal Operations
            'Escape': { action: 'closeModal', description: 'Close modal/panel' },
            'Ctrl+Enter': { action: 'confirmAction', description: 'Confirm current action' },
            
            // Quick Actions
            'Ctrl+/': { action: 'quickSearch', description: 'Global search' },
            'Ctrl+1': { action: 'gotoTab', description: 'Go to Dashboard' },
            'Ctrl+2': { action: 'gotoTab', description: 'Go to Products' },
            'Ctrl+3': { action: 'gotoTab', description: 'Go to Customers' },
            'Ctrl+4': { action: 'gotoTab', description: 'Go to Billing' },
            'Ctrl+5': { action: 'gotoTab', description: 'Go to Analytics' },
            'Ctrl+6': { action: 'gotoTab', description: 'Go to Settings' }
        });

        // Error Messages
        this.ERROR_MESSAGES = Object.freeze({
            STORAGE_FULL: 'Storage is full. Please clear some data or backup and reset.',
            INVALID_DATA: 'Invalid data format. Please check your input.',
            NETWORK_ERROR: 'Network error occurred. Please check your connection.',
            PERMISSION_DENIED: 'Permission denied. Please check your settings.',
            FILE_TOO_LARGE: 'File is too large. Maximum size allowed is',
            INVALID_FILE_TYPE: 'Invalid file type. Supported types are',
            VALIDATION_ERROR: 'Validation error occurred. Please fix the highlighted fields.',
            SAVE_ERROR: 'Failed to save data. Please try again.',
            LOAD_ERROR: 'Failed to load data. The data might be corrupted.',
            BACKUP_ERROR: 'Failed to create backup. Please check your storage.',
            RESTORE_ERROR: 'Failed to restore backup. The backup file might be corrupted.',
            PDF_GENERATION_ERROR: 'Failed to generate PDF. Please try again.',
            CALCULATION_ERROR: 'Calculation error occurred. Please check your numbers.',
            DATABASE_ERROR: 'Database operation failed. Please refresh and try again.'
        });

        // Success Messages
        this.SUCCESS_MESSAGES = Object.freeze({
            SAVE_SUCCESS: 'Data saved successfully!',
            DELETE_SUCCESS: 'Item deleted successfully!',
            BACKUP_SUCCESS: 'Backup created successfully!',
            RESTORE_SUCCESS: 'Data restored successfully!',
            PDF_SUCCESS: 'PDF generated successfully!',
            EMAIL_SUCCESS: 'Email sent successfully!',
            COPY_SUCCESS: 'Copied to clipboard!',
            IMPORT_SUCCESS: 'Data imported successfully!',
            EXPORT_SUCCESS: 'Data exported successfully!',
            SYNC_SUCCESS: 'Data synchronized successfully!'
        });

        // Regular Expressions
        this.REGEX = Object.freeze({
            EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            PHONE: /^[+]?[(]?[\d\s\-()]{10,}$/,
            GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            PINCODE: /^[0-9]{6}$/,
            IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            UPI_ID: /^[\w.\-_]{3,}@[\w.\-_]{3,}$/,
            INVOICE_NUMBER: /^[A-Z0-9\-\/]{3,}$/,
            DECIMAL: /^\d+(\.\d{1,2})?$/,
            POSITIVE_INTEGER: /^\d+$/
        });

        // File Types & Sizes
        this.FILES = Object.freeze({
            IMAGE: {
                TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                MAX_SIZE: 2 * 1024 * 1024, // 2MB
                EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
            },
            DOCUMENT: {
                TYPES: ['application/pdf', 'text/csv', 'application/json'],
                MAX_SIZE: 10 * 1024 * 1024, // 10MB
                EXTENSIONS: ['.pdf', '.csv', '.json']
            },
            BACKUP: {
                TYPES: ['application/json'],
                MAX_SIZE: 50 * 1024 * 1024, // 50MB
                EXTENSIONS: ['.json']
            }
        });

        // Date & Time Formats
        this.DATE_FORMATS = Object.freeze({
            DISPLAY: 'DD/MM/YYYY',
            INPUT: 'YYYY-MM-DD',
            STORAGE: 'YYYY-MM-DDTHH:mm:ss.sssZ',
            FILENAME: 'YYYY-MM-DD_HH-mm-ss',
            HUMAN: 'DD MMM YYYY',
            SHORT: 'DD/MM/YY'
        });

        // Number Formats
        this.NUMBER_FORMATS = Object.freeze({
            CURRENCY: {
                INDIAN: { style: 'currency', currency: 'INR', locale: 'en-IN' },
                US: { style: 'currency', currency: 'USD', locale: 'en-US' },
                EUROPEAN: { style: 'currency', currency: 'EUR', locale: 'de-DE' }
            },
            DECIMAL: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            PERCENTAGE: { style: 'percent', minimumFractionDigits: 2 },
            COMPACT: { notation: 'compact', compactDisplay: 'short' }
        });

        // Color Palettes
        this.COLORS = Object.freeze({
            PRIMARY: '#6366f1',
            SECONDARY: '#64748b',
            SUCCESS: '#10b981',
            WARNING: '#f59e0b',
            ERROR: '#ef4444',
            INFO: '#3b82f6',
            LIGHT: '#f8fafc',
            DARK: '#0f172a',
            
            GRADIENTS: {
                PRIMARY: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                SUCCESS: 'linear-gradient(135deg, #10b981, #059669)',
                WARNING: 'linear-gradient(135deg, #f59e0b, #d97706)',
                ERROR: 'linear-gradient(135deg, #ef4444, #dc2626)'
            }
        });

        // Chart Configuration
        this.CHARTS = Object.freeze({
            TYPES: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'],
            COLORS: [
                '#6366f1', '#10b981', '#f59e0b', '#ef4444',
                '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
            ],
            ANIMATION_DURATION: 750
        });

        // Notification Types
        this.NOTIFICATION_TYPES = Object.freeze({
            SUCCESS: { type: 'success', icon: '✅', duration: 3000 },
            ERROR: { type: 'error', icon: '❌', duration: 5000 },
            WARNING: { type: 'warning', icon: '⚠️', duration: 4000 },
            INFO: { type: 'info', icon: 'ℹ️', duration: 3000 }
        });
    }

    /**
     * Get constant value by path
     * @param {string} path - Dot notation path
     * @returns {any} Constant value
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this);
    }

    /**
     * Check if constant exists
     * @param {string} path - Dot notation path
     * @returns {boolean} Exists or not
     */
    has(path) {
        return this.get(path) !== undefined;
    }

    /**
     * Get all constants for a category
     * @param {string} category - Category name
     * @returns {Object} Category constants
     */
    getCategory(category) {
        return this[category.toUpperCase()] || {};
    }

    /**
     * Search constants by value
     * @param {any} value - Value to search
     * @param {string} category - Optional category to search in
     * @returns {Array} Found paths
     */
    search(value, category = null) {
        const results = [];
        const searchObj = category ? this.getCategory(category) : this;
        
        const searchRecursive = (obj, path = '') => {
            Object.entries(obj).forEach(([key, val]) => {
                const currentPath = path ? `${path}.${key}` : key;
                
                if (val === value || (typeof val === 'string' && val.includes(value))) {
                    results.push(currentPath);
                } else if (typeof val === 'object' && val !== null) {
                    searchRecursive(val, currentPath);
                }
            });
        };
        
        searchRecursive(searchObj);
        return results;
    }
}

// Create and export global constants instance
window.AppConstants = new AppConstants();

// Freeze the constants to prevent modifications
Object.freeze(window.AppConstants);

console.log('⚡️ UnifyX Bill Maker Constants Loaded Successfully!');
