/**
 * ⚡️ UnifyX Bill Maker - Data Management System
 * Complete localStorage operations, backup, restore, and data validation
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class DataManager {
    constructor() {
        this.storagePrefix = 'unifyxBillMaker_';
        this.version = '1.0.0';
        this.maxStorageSize = 50 * 1024 * 1024; // 50MB limit
        this.compressionEnabled = true;
        this.encryptionEnabled = false; // For future use
        
        // Initialize storage structure
        this.initializeStorage();
        
        // Setup auto-backup
        this.setupAutoBackup();
        
        console.log('📊 DataManager initialized successfully!');
    }

    /**
     * Initialize storage with default structure
     */
    initializeStorage() {
        const defaultData = {
            businesses: [],
            customers: [],
            products: [],
            invoices: [],
            drafts: [],
            templates: this.getDefaultTemplates(),
            settings: this.getDefaultSettings(),
            counters: {
                business: 1,
                customer: 1,
                product: 1,
                invoice: 1,
                draft: 1
            },
            analytics: [],
            backups: [],
            cache: {},
            logs: [],
            session: {
                created: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            }
        };

        // Initialize each data type if not exists
        Object.keys(defaultData).forEach(key => {
            if (!this.getItem(key)) {
                this.setItem(key, defaultData[key]);
            }
        });

        // Verify data integrity
        this.verifyDataIntegrity();
    }

    /**
     * Get default application settings
     * @returns {Object} Default settings
     */
    getDefaultSettings() {
        return {
            app: {
                theme: 'light',
                language: 'en',
                currency: 'INR',
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '12h',
                autoSave: true,
                autoBackup: true,
                soundNotifications: true,
                showShortcuts: true,
                animations: true
            },
            business: {
                defaultTemplate: 'modern',
                invoiceNumberFormat: 'INV-{###}',
                taxCalculation: 'exclusive',
                showHSN: true,
                showSignature: true,
                showLogo: true,
                termsAndConditions: 'Payment due within 30 days.',
                thankYouNote: 'Thank you for your business!'
            },
            ui: {
                itemsPerPage: 50,
                gridView: true,
                compactMode: false,
                showThumbnails: true
            },
            pdf: {
                format: 'A4',
                orientation: 'portrait',
                margin: 20,
                compression: true,
                watermark: 'none'
            },
            notifications: {
                lowStock: true,
                overdueInvoices: true,
                dailyReports: false,
                backupReminders: true
            }
        };
    }

    /**
     * Get default templates
     * @returns {Array} Default templates
     */
    getDefaultTemplates() {
        return [
            {
                id: 'modern',
                name: 'Modern',
                description: 'Clean, modern design with bold typography',
                preview: '🎨',
                config: {
                    colors: { primary: '#6366f1', secondary: '#64748b', accent: '#10b981' },
                    fonts: { heading: 'Inter', body: 'Inter' },
                    layout: 'standard'
                },
                createdAt: new Date().toISOString(),
                isDefault: true
            },
            {
                id: 'minimal',
                name: 'Minimal',
                description: 'Simple, clean layout with minimal design',
                preview: '📄',
                config: {
                    colors: { primary: '#000000', secondary: '#666666', accent: '#000000' },
                    fonts: { heading: 'Inter', body: 'Inter' },
                    layout: 'minimal'
                },
                createdAt: new Date().toISOString(),
                isDefault: true
            },
            {
                id: 'classic',
                name: 'Classic',
                description: 'Traditional business invoice template',
                preview: '📋',
                config: {
                    colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#3b82f6' },
                    fonts: { heading: 'Inter', body: 'Inter' },
                    layout: 'classic'
                },
                createdAt: new Date().toISOString(),
                isDefault: true
            },
            {
                id: 'corporate',
                name: 'Corporate',
                description: 'Professional corporate invoice design',
                preview: '🏢',
                config: {
                    colors: { primary: '#1e40af', secondary: '#64748b', accent: '#059669' },
                    fonts: { heading: 'Inter', body: 'Inter' },
                    layout: 'corporate'
                },
                createdAt: new Date().toISOString(),
                isDefault: true
            },
            {
                id: 'creative',
                name: 'Creative',
                description: 'Colorful, creative design for modern businesses',
                preview: '🎭',
                config: {
                    colors: { primary: '#7c3aed', secondary: '#64748b', accent: '#f59e0b' },
                    fonts: { heading: 'Inter', body: 'Inter' },
                    layout: 'creative'
                },
                createdAt: new Date().toISOString(),
                isDefault: true
            }
        ];
    }

    /**
     * Generic localStorage operations with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} Success status
     */
    setItem(key, value) {
        try {
            const dataStr = JSON.stringify({
                data: value,
                timestamp: new Date().toISOString(),
                version: this.version,
                compressed: false
            });

            // Check if compression is needed
            if (this.compressionEnabled && dataStr.length > 10000) {
                // Simple compression simulation (in real app, use proper compression)
                const compressed = this.compress(dataStr);
                localStorage.setItem(this.storagePrefix + key, JSON.stringify({
                    data: compressed,
                    timestamp: new Date().toISOString(),
                    version: this.version,
                    compressed: true
                }));
            } else {
                localStorage.setItem(this.storagePrefix + key, dataStr);
            }

            // Log successful operations
            this.log('info', `Data saved: ${key}`, { size: dataStr.length });
            return true;

        } catch (error) {
            this.handleStorageError(error, 'setItem', key);
            return false;
        }
    }

    /**
     * Get item from localStorage with error handling
     * @param {string} key - Storage key
     * @returns {*} Stored value or null
     */
    getItem(key) {
        try {
            const item = localStorage.getItem(this.storagePrefix + key);
            if (!item) return null;

            const parsed = JSON.parse(item);
            
            // Handle compressed data
            if (parsed.compressed) {
                const decompressed = this.decompress(parsed.data);
                return JSON.parse(decompressed).data;
            }

            return parsed.data;

        } catch (error) {
            this.handleStorageError(error, 'getItem', key);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem(key) {
        try {
            localStorage.removeItem(this.storagePrefix + key);
            this.log('info', `Data removed: ${key}`);
            return true;
        } catch (error) {
            this.handleStorageError(error, 'removeItem', key);
            return false;
        }
    }

    /**
     * Get all keys with prefix
     * @returns {Array} Array of keys
     */
    getAllKeys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.storagePrefix)) {
                keys.push(key.replace(this.storagePrefix, ''));
            }
        }
        return keys;
    }

    /**
     * Calculate storage usage
     * @returns {Object} Storage information
     */
    getStorageInfo() {
        let totalSize = 0;
        let itemCount = 0;
        const breakdown = {};

        this.getAllKeys().forEach(key => {
            const item = localStorage.getItem(this.storagePrefix + key);
            if (item) {
                const size = new Blob([item]).size;
                totalSize += size;
                itemCount++;
                breakdown[key] = size;
            }
        });

        return {
            totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            itemCount,
            maxSize: this.maxStorageSize,
            maxSizeFormatted: this.formatBytes(this.maxStorageSize),
            usagePercentage: Math.round((totalSize / this.maxStorageSize) * 100),
            breakdown
        };
    }

    /**
     * Business Profile Operations
     */
    
    /**
     * Save business profile
     * @param {Object} businessData - Business profile data
     * @returns {string} Business ID
     */
    saveBusinessProfile(businessData) {
        const businesses = this.getItem('businesses') || [];
        const counters = this.getItem('counters');

        if (businessData.id) {
            // Update existing business
            const index = businesses.findIndex(b => b.id === businessData.id);
            if (index !== -1) {
                businesses[index] = {
                    ...businessData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new business
            businessData.id = `business_${counters.business}`;
            businessData.createdAt = new Date().toISOString();
            businessData.updatedAt = new Date().toISOString();
            businessData.isActive = businesses.length === 0; // First business is active
            
            businesses.push(businessData);
            counters.business++;
            this.setItem('counters', counters);
        }

        this.setItem('businesses', businesses);
        this.log('info', 'Business profile saved', { businessId: businessData.id });
        return businessData.id;
    }

    /**
     * Get all business profiles
     * @returns {Array} Business profiles
     */
    getBusinessProfiles() {
        return this.getItem('businesses') || [];
    }

    /**
     * Get business profile by ID
     * @param {string} id - Business ID
     * @returns {Object|null} Business profile
     */
    getBusinessProfile(id) {
        const businesses = this.getBusinessProfiles();
        return businesses.find(b => b.id === id) || null;
    }

    /**
     * Delete business profile
     * @param {string} id - Business ID
     * @returns {boolean} Success status
     */
    deleteBusinessProfile(id) {
        const businesses = this.getBusinessProfiles();
        const filtered = businesses.filter(b => b.id !== id);
        
        if (filtered.length !== businesses.length) {
            this.setItem('businesses', filtered);
            this.log('info', 'Business profile deleted', { businessId: id });
            return true;
        }
        return false;
    }

    /**
     * Customer Operations
     */

    /**
     * Save customer
     * @param {Object} customerData - Customer data
     * @returns {string} Customer ID
     */
    saveCustomer(customerData) {
        const customers = this.getItem('customers') || [];
        const counters = this.getItem('counters');

        if (customerData.id) {
            // Update existing customer
            const index = customers.findIndex(c => c.id === customerData.id);
            if (index !== -1) {
                customers[index] = {
                    ...customerData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new customer
            customerData.id = `customer_${counters.customer}`;
            customerData.createdAt = new Date().toISOString();
            customerData.updatedAt = new Date().toISOString();
            customerData.totalPurchases = 0;
            customerData.loyaltyPoints = 0;
            
            customers.push(customerData);
            counters.customer++;
            this.setItem('counters', counters);
        }

        this.setItem('customers', customers);
        this.log('info', 'Customer saved', { customerId: customerData.id });
        return customerData.id;
    }

    /**
     * Get all customers
     * @returns {Array} Customers
     */
    getCustomers() {
        return this.getItem('customers') || [];
    }

    /**
     * Search customers
     * @param {string} query - Search query
     * @returns {Array} Matching customers
     */
    searchCustomers(query) {
        const customers = this.getCustomers();
        if (!query || query.length < 2) return customers;

        const searchTerm = query.toLowerCase();
        return customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phone?.includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm) ||
            customer.address?.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Product Operations
     */

    /**
     * Save product
     * @param {Object} productData - Product data
     * @returns {string} Product ID
     */
    saveProduct(productData) {
        const products = this.getItem('products') || [];
        const counters = this.getItem('counters');

        if (productData.id) {
            // Update existing product
            const index = products.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                products[index] = {
                    ...productData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new product
            productData.id = `product_${counters.product}`;
            productData.createdAt = new Date().toISOString();
            productData.updatedAt = new Date().toISOString();
            productData.totalSold = 0;
            productData.isActive = true;
            
            products.push(productData);
            counters.product++;
            this.setItem('counters', counters);
        }

        this.setItem('products', products);
        this.log('info', 'Product saved', { productId: productData.id });
        return productData.id;
    }

    /**
     * Get all products
     * @returns {Array} Products
     */
    getProducts() {
        return this.getItem('products') || [];
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Array} Matching products
     */
    searchProducts(query) {
        const products = this.getProducts().filter(p => p.isActive);
        if (!query || query.length < 2) return products;

        const searchTerm = query.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category?.toLowerCase().includes(searchTerm) ||
            product.hsn?.includes(searchTerm) ||
            product.barcode?.includes(searchTerm)
        );
    }

    /**
     * Update product stock
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity to add/subtract
     * @returns {boolean} Success status
     */
    updateProductStock(productId, quantity) {
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex !== -1) {
            products[productIndex].stock = (products[productIndex].stock || 0) + quantity;
            products[productIndex].updatedAt = new Date().toISOString();
            
            this.setItem('products', products);
            this.log('info', 'Product stock updated', { productId, quantity, newStock: products[productIndex].stock });
            return true;
        }
        return false;
    }

    /**
     * Invoice Operations
     */

    /**
     * Save invoice
     * @param {Object} invoiceData - Invoice data
     * @returns {string} Invoice ID
     */
    saveInvoice(invoiceData) {
        const invoices = this.getItem('invoices') || [];
        const counters = this.getItem('counters');

        if (invoiceData.id) {
            // Update existing invoice
            const index = invoices.findIndex(i => i.id === invoiceData.id);
            if (index !== -1) {
                invoices[index] = {
                    ...invoiceData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new invoice
            invoiceData.id = `invoice_${Date.now()}`;
            invoiceData.invoiceNumber = this.generateInvoiceNumber();
            invoiceData.createdAt = new Date().toISOString();
            invoiceData.updatedAt = new Date().toISOString();
            invoiceData.status = invoiceData.status || 'draft';
            
            invoices.push(invoiceData);
            counters.invoice++;
            this.setItem('counters', counters);
        }

        // Update product stock if invoice is completed
        if (invoiceData.status === 'generated' || invoiceData.status === 'paid') {
            this.updateStockFromInvoice(invoiceData);
        }

        // Update customer purchase history
        if (invoiceData.customerId) {
            this.updateCustomerPurchases(invoiceData.customerId, invoiceData);
        }

        this.setItem('invoices', invoices);
        this.log('info', 'Invoice saved', { invoiceId: invoiceData.id, status: invoiceData.status });
        return invoiceData.id;
    }

    /**
     * Get all invoices
     * @returns {Array} Invoices
     */
    getInvoices() {
        return this.getItem('invoices') || [];
    }

    /**
     * Generate invoice number
     * @returns {string} Generated invoice number
     */
    generateInvoiceNumber() {
        const settings = this.getItem('settings');
        const counters = this.getItem('counters');
        const format = settings?.business?.invoiceNumberFormat || 'INV-{###}';
        const now = new Date();

        let invoiceNumber = format
            .replace('{YYYY}', now.getFullYear().toString())
            .replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
            .replace('{DD}', String(now.getDate()).padStart(2, '0'))
            .replace('{###}', String(counters.invoice).padStart(3, '0'));

        return invoiceNumber;
    }

    /**
     * Update stock from invoice items
     * @param {Object} invoiceData - Invoice data
     */
    updateStockFromInvoice(invoiceData) {
        if (invoiceData.items && Array.isArray(invoiceData.items)) {
            invoiceData.items.forEach(item => {
                if (item.productId) {
                    this.updateProductStock(item.productId, -item.quantity);
                }
            });
        }
    }

    /**
     * Update customer purchase history
     * @param {string} customerId - Customer ID
     * @param {Object} invoiceData - Invoice data
     */
    updateCustomerPurchases(customerId, invoiceData) {
        const customers = this.getCustomers();
        const customerIndex = customers.findIndex(c => c.id === customerId);
        
        if (customerIndex !== -1) {
            customers[customerIndex].totalPurchases = (customers[customerIndex].totalPurchases || 0) + invoiceData.total;
            customers[customerIndex].lastPurchase = invoiceData.createdAt;
            customers[customerIndex].invoiceCount = (customers[customerIndex].invoiceCount || 0) + 1;
            
            // Add loyalty points (1 point per 100 currency units)
            const points = Math.floor(invoiceData.total / 100);
            customers[customerIndex].loyaltyPoints = (customers[customerIndex].loyaltyPoints || 0) + points;
            
            this.setItem('customers', customers);
        }
    }

    /**
     * Analytics and Reporting
     */

    /**
     * Get dashboard statistics
     * @returns {Object} Dashboard stats
     */
    getDashboardStats() {
        const invoices = this.getInvoices();
        const customers = this.getCustomers();
        const products = this.getProducts();
        
        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid' || inv.status === 'generated')
            .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const monthlyInvoices = invoices.filter(inv =>
            new Date(inv.createdAt) >= thisMonth
        );

        const monthlyRevenue = monthlyInvoices
            .filter(inv => inv.status === 'paid' || inv.status === 'generated')
            .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

        return {
            totalRevenue,
            totalInvoices: invoices.length,
            totalCustomers: customers.length,
            totalProducts: products.filter(p => p.isActive).length,
            monthlyInvoices: monthlyInvoices.length,
            monthlyRevenue,
            lowStockProducts: products.filter(p => p.isActive && (p.stock || 0) <= (p.minStock || 10)).length,
            recentInvoices: invoices
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
        };
    }

    /**
     * Backup and Restore Operations
     */

    /**
     * Create full backup
     * @returns {Object} Backup data
     */
    createBackup() {
        const backupData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            data: {
                businesses: this.getItem('businesses'),
                customers: this.getItem('customers'),
                products: this.getItem('products'),
                invoices: this.getItem('invoices'),
                drafts: this.getItem('drafts'),
                templates: this.getItem('templates'),
                settings: this.getItem('settings'),
                counters: this.getItem('counters')
            },
            metadata: {
                totalSize: this.getStorageInfo().totalSize,
                itemCount: this.getAllKeys().length,
                created: new Date().toISOString()
            }
        };

        // Store backup reference
        const backups = this.getItem('backups') || [];
        backups.push({
            id: `backup_${Date.now()}`,
            timestamp: backupData.timestamp,
            size: JSON.stringify(backupData).length
        });

        // Keep only last 10 backups
        if (backups.length > 10) {
            backups.splice(0, backups.length - 10);
        }

        this.setItem('backups', backups);
        this.log('info', 'Backup created successfully');
        
        return backupData;
    }

    /**
     * Restore from backup
     * @param {Object} backupData - Backup data to restore
     * @returns {boolean} Success status
     */
    restoreBackup(backupData) {
        try {
            // Validate backup data
            if (!backupData || !backupData.data || !backupData.version) {
                throw new Error('Invalid backup data format');
            }

            // Create current state backup before restore
            const currentBackup = this.createBackup();
            this.setItem(`restore_backup_${Date.now()}`, currentBackup);

            // Restore each data type
            Object.keys(backupData.data).forEach(key => {
                if (backupData.data[key] !== null) {
                    this.setItem(key, backupData.data[key]);
                }
            });

            this.log('info', 'Data restored successfully from backup');
            return true;

        } catch (error) {
            this.log('error', 'Failed to restore backup', { error: error.message });
            return false;
        }
    }

    /**
     * Setup auto-backup system
     */
    setupAutoBackup() {
        const settings = this.getItem('settings');
        if (settings?.app?.autoBackup) {
            // Create backup every 24 hours
            setInterval(() => {
                this.createBackup();
            }, 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Utility Functions
     */

    /**
     * Simple compression simulation
     * @param {string} data - Data to compress
     * @returns {string} Compressed data
     */
    compress(data) {
        // In a real implementation, use proper compression library
        return btoa(data);
    }

    /**
     * Simple decompression simulation
     * @param {string} data - Data to decompress
     * @returns {string} Decompressed data
     */
    decompress(data) {
        // In a real implementation, use proper compression library
        return atob(data);
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Handle storage errors
     * @param {Error} error - Error object
     * @param {string} operation - Operation that failed
     * @param {string} key - Storage key involved
     */
    handleStorageError(error, operation, key) {
        const errorData = {
            operation,
            key,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        // Log error
        this.log('error', `Storage ${operation} failed`, errorData);

        // Handle specific errors
        if (error.name === 'QuotaExceededError') {
            console.warn('Storage quota exceeded. Consider clearing old data.');
            // Auto-cleanup if enabled
            this.performAutoCleanup();
        }
    }

    /**
     * Perform automatic cleanup of old data
     */
    performAutoCleanup() {
        try {
            // Remove old logs (keep last 100)
            const logs = this.getItem('logs') || [];
            if (logs.length > 100) {
                this.setItem('logs', logs.slice(-100));
            }

            // Remove old analytics data (keep last 3 months)
            const analytics = this.getItem('analytics') || [];
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            const filteredAnalytics = analytics.filter(entry => 
                new Date(entry.timestamp) > threeMonthsAgo
            );
            this.setItem('analytics', filteredAnalytics);

            this.log('info', 'Auto-cleanup completed');

        } catch (error) {
            this.log('error', 'Auto-cleanup failed', { error: error.message });
        }
    }

    /**
     * Verify data integrity
     * @returns {Object} Integrity report
     */
    verifyDataIntegrity() {
        const report = {
            isValid: true,
            errors: [],
            warnings: [],
            checkedAt: new Date().toISOString()
        };

        try {
            // Check if all required data structures exist
            const requiredKeys = ['businesses', 'customers', 'products', 'invoices', 'settings', 'counters'];
            requiredKeys.forEach(key => {
                if (!this.getItem(key)) {
                    report.errors.push(`Missing required data: ${key}`);
                    report.isValid = false;
                }
            });

            // Check data consistency
            const businesses = this.getItem('businesses') || [];
            const customers = this.getItem('customers') || [];
            const products = this.getItem('products') || [];
            const invoices = this.getItem('invoices') || [];

            // Validate business profiles
            businesses.forEach((business, index) => {
                if (!business.id || !business.name) {
                    report.errors.push(`Invalid business at index ${index}`);
                }
            });

            // Validate customer references in invoices
            invoices.forEach((invoice, index) => {
                if (invoice.customerId && !customers.find(c => c.id === invoice.customerId)) {
                    report.warnings.push(`Invoice ${index} references non-existent customer ${invoice.customerId}`);
                }
            });

            this.log('info', 'Data integrity check completed', report);
            return report;

        } catch (error) {
            report.isValid = false;
            report.errors.push(`Integrity check failed: ${error.message}`);
            return report;
        }
    }

    /**
     * Logging system
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    log(level, message, data = {}) {
        const logEntry = {
            level,
            message,
            data,
            timestamp: new Date().toISOString()
        };

        // Console output
        const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[DataManager] ${message}`, data);

        // Store in logs
        try {
            const logs = this.getItem('logs') || [];
            logs.push(logEntry);

            // Keep only last 200 logs
            if (logs.length > 200) {
                logs.splice(0, logs.length - 200);
            }

            this.setItem('logs', logs);
        } catch (error) {
            console.error('Failed to store log:', error);
        }
    }

    /**
     * Export all data
     * @returns {Object} Exported data
     */
    exportAllData() {
        return {
            version: this.version,
            exportedAt: new Date().toISOString(),
            data: {
                businesses: this.getItem('businesses'),
                customers: this.getItem('customers'),
                products: this.getItem('products'),
                invoices: this.getItem('invoices'),
                drafts: this.getItem('drafts'),
                templates: this.getItem('templates'),
                settings: this.getItem('settings'),
                counters: this.getItem('counters')
            }
        };
    }

    /**
     * Clear all data (factory reset)
     * @returns {boolean} Success status
     */
    clearAllData() {
        try {
            // Create backup before clearing
            const backup = this.createBackup();
            this.setItem(`factory_reset_backup_${Date.now()}`, backup);

            // Clear all data
            this.getAllKeys().forEach(key => {
                if (key !== 'logs') { // Keep logs for debugging
                    this.removeItem(key);
                }
            });

            // Reinitialize with defaults
            this.initializeStorage();

            this.log('info', 'Factory reset completed');
            return true;

        } catch (error) {
            this.log('error', 'Factory reset failed', { error: error.message });
            return false;
        }
    }
}

// Create and export global DataManager instance
window.DataManager = new DataManager();

console.log('📊 UnifyX Bill Maker DataManager Loaded Successfully!');
