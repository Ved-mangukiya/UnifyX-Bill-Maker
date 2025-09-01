/**
 * ⚡️ UnifyX Bill Maker - Business Management System
 * Complete business profile management, multi-business support, and settings
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class BusinessManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.currentBusiness = null;
        this.businesses = [];
        this.businessCache = new Map();
        this.validators = this.initializeValidators();
        
        // Load businesses on initialization
        this.loadBusinesses();
        
        console.log('🏢 BusinessManager initialized successfully!');
    }

    /**
     * Initialize field validators
     * @returns {Object} Validator functions
     */
    initializeValidators() {
        return {
            gstin: (value) => {
                if (!value) return { valid: true }; // Optional field
                const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                return {
                    valid: gstinRegex.test(value),
                    message: 'Invalid GSTIN format. Format should be: 22AAAAA0000A1Z5'
                };
            },
            pan: (value) => {
                if (!value) return { valid: true };
                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                return {
                    valid: panRegex.test(value),
                    message: 'Invalid PAN format. Format should be: ABCDE1234F'
                };
            },
            email: (value) => {
                if (!value) return { valid: true };
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    valid: emailRegex.test(value),
                    message: 'Invalid email format'
                };
            },
            phone: (value) => {
                if (!value) return { valid: true };
                const phoneRegex = /^[+]?[(]?[\d\s\-()]{10,}$/;
                return {
                    valid: phoneRegex.test(value),
                    message: 'Invalid phone number format'
                };
            },
            pincode: (value) => {
                if (!value) return { valid: true };
                const pincodeRegex = /^[0-9]{6}$/;
                return {
                    valid: pincodeRegex.test(value),
                    message: 'Invalid pincode. Must be 6 digits'
                };
            },
            upiId: (value) => {
                if (!value) return { valid: true };
                const upiRegex = /^[\w.\-_]{3,}@[\w.\-_]{3,}$/;
                return {
                    valid: upiRegex.test(value),
                    message: 'Invalid UPI ID format. Example: user@paytm'
                };
            },
            ifsc: (value) => {
                if (!value) return { valid: true };
                const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
                return {
                    valid: ifscRegex.test(value),
                    message: 'Invalid IFSC code format. Example: SBIN0001234'
                };
            },
            accountNumber: (value) => {
                if (!value) return { valid: true };
                const accountRegex = /^[0-9]{9,18}$/;
                return {
                    valid: accountRegex.test(value),
                    message: 'Invalid account number. Must be 9-18 digits'
                };
            }
        };
    }

    /**
     * Load all businesses from storage
     */
    loadBusinesses() {
        try {
            this.businesses = this.dataManager.getBusinessProfiles();
            
            // Set current business (active or first)
            this.currentBusiness = this.businesses.find(b => b.isActive) || this.businesses[0] || null;
            
            // Update cache
            this.updateCache();
            
            console.log(`Loaded ${this.businesses.length} business profiles`);
            
        } catch (error) {
            console.error('Failed to load businesses:', error);
            this.businesses = [];
            this.currentBusiness = null;
        }
    }

    /**
     * Update business cache for faster access
     */
    updateCache() {
        this.businessCache.clear();
        this.businesses.forEach(business => {
            this.businessCache.set(business.id, business);
        });
    }

    /**
     * Create new business profile
     * @param {Object} businessData - Business profile data
     * @returns {Promise<Object>} Created business profile
     */
    async createBusiness(businessData) {
        try {
            // Validate required fields
            const validation = this.validateBusinessData(businessData);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate GSTIN
            if (businessData.gstin && this.isGSTINExists(businessData.gstin)) {
                throw new Error('A business with this GSTIN already exists');
            }

            // Prepare business data
            const newBusiness = {
                ...businessData,
                id: `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: this.businesses.length === 0, // First business is active
                settings: this.getDefaultBusinessSettings(),
                stats: this.getInitialBusinessStats(),
                version: '1.0.0'
            };

            // Process logo and signature if provided
            if (businessData.logo) {
                newBusiness.logo = await this.processImage(businessData.logo, 'logo');
            }
            
            if (businessData.signature) {
                newBusiness.signature = await this.processImage(businessData.signature, 'signature');
            }

            // Save to storage
            const businessId = this.dataManager.saveBusinessProfile(newBusiness);
            
            // Reload businesses
            this.loadBusinesses();
            
            // Track event
            this.trackBusinessEvent('business_created', { businessId });
            
            console.log('Business profile created:', businessId);
            return this.getBusinessById(businessId);
            
        } catch (error) {
            console.error('Failed to create business:', error);
            throw error;
        }
    }

    /**
     * Update existing business profile
     * @param {string} businessId - Business ID
     * @param {Object} businessData - Updated business data
     * @returns {Promise<Object>} Updated business profile
     */
    async updateBusiness(businessId, businessData) {
        try {
            const existingBusiness = this.getBusinessById(businessId);
            if (!existingBusiness) {
                throw new Error('Business not found');
            }

            // Validate updated data
            const validation = this.validateBusinessData(businessData, businessId);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate GSTIN (excluding current business)
            if (businessData.gstin && businessData.gstin !== existingBusiness.gstin) {
                if (this.isGSTINExists(businessData.gstin, businessId)) {
                    throw new Error('A business with this GSTIN already exists');
                }
            }

            // Prepare updated business data
            const updatedBusiness = {
                ...existingBusiness,
                ...businessData,
                updatedAt: new Date().toISOString()
            };

            // Process new logo and signature if provided
            if (businessData.logo && businessData.logo !== existingBusiness.logo) {
                updatedBusiness.logo = await this.processImage(businessData.logo, 'logo');
            }
            
            if (businessData.signature && businessData.signature !== existingBusiness.signature) {
                updatedBusiness.signature = await this.processImage(businessData.signature, 'signature');
            }

            // Save to storage
            this.dataManager.saveBusinessProfile(updatedBusiness);
            
            // Reload businesses
            this.loadBusinesses();
            
            // Track event
            this.trackBusinessEvent('business_updated', { businessId });
            
            console.log('Business profile updated:', businessId);
            return this.getBusinessById(businessId);
            
        } catch (error) {
            console.error('Failed to update business:', error);
            throw error;
        }
    }

    /**
     * Delete business profile
     * @param {string} businessId - Business ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteBusiness(businessId) {
        try {
            const business = this.getBusinessById(businessId);
            if (!business) {
                throw new Error('Business not found');
            }

            // Check if this is the only business
            if (this.businesses.length === 1) {
                throw new Error('Cannot delete the only business profile');
            }

            // Check if business has invoices
            const invoices = this.dataManager.getInvoices();
            const businessInvoices = invoices.filter(inv => inv.businessId === businessId);
            
            if (businessInvoices.length > 0) {
                throw new Error(`Cannot delete business with ${businessInvoices.length} invoices. Archive it instead.`);
            }

            // Delete from storage
            const success = this.dataManager.deleteBusinessProfile(businessId);
            
            if (success) {
                // If deleted business was active, set another as active
                if (business.isActive) {
                    const remainingBusinesses = this.businesses.filter(b => b.id !== businessId);
                    if (remainingBusinesses.length > 0) {
                        await this.setActiveBusiness(remainingBusinesses[0].id);
                    }
                }
                
                // Reload businesses
                this.loadBusinesses();
                
                // Track event
                this.trackBusinessEvent('business_deleted', { businessId });
                
                console.log('Business profile deleted:', businessId);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Failed to delete business:', error);
            throw error;
        }
    }

    /**
     * Set business as active
     * @param {string} businessId - Business ID
     * @returns {Promise<boolean>} Success status
     */
    async setActiveBusiness(businessId) {
        try {
            const business = this.getBusinessById(businessId);
            if (!business) {
                throw new Error('Business not found');
            }

            // Deactivate all businesses
            this.businesses.forEach(b => {
                b.isActive = false;
                this.dataManager.saveBusinessProfile(b);
            });

            // Activate selected business
            business.isActive = true;
            this.dataManager.saveBusinessProfile(business);

            // Reload businesses
            this.loadBusinesses();

            // Track event
            this.trackBusinessEvent('business_activated', { businessId });

            console.log('Active business changed to:', businessId);
            return true;

        } catch (error) {
            console.error('Failed to set active business:', error);
            throw error;
        }
    }

    /**
     * Get business by ID
     * @param {string} businessId - Business ID
     * @returns {Object|null} Business profile
     */
    getBusinessById(businessId) {
        return this.businessCache.get(businessId) || null;
    }

    /**
     * Get current active business
     * @returns {Object|null} Active business profile
     */
    getCurrentBusiness() {
        return this.currentBusiness;
    }

    /**
     * Get all businesses
     * @returns {Array} Business profiles
     */
    getAllBusinesses() {
        return [...this.businesses];
    }

    /**
     * Search businesses
     * @param {string} query - Search query
     * @returns {Array} Matching businesses
     */
    searchBusinesses(query) {
        if (!query || query.length < 2) {
            return this.getAllBusinesses();
        }

        const searchTerm = query.toLowerCase();
        return this.businesses.filter(business =>
            business.name.toLowerCase().includes(searchTerm) ||
            business.email?.toLowerCase().includes(searchTerm) ||
            business.phone?.includes(searchTerm) ||
            business.gstin?.toLowerCase().includes(searchTerm) ||
            business.address?.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Validate business data
     * @param {Object} businessData - Business data to validate
     * @param {string} excludeId - Business ID to exclude from duplicate checks
     * @returns {Object} Validation result
     */
    validateBusinessData(businessData, excludeId = null) {
        const errors = [];
        const warnings = [];

        // Required fields
        if (!businessData.name || businessData.name.trim().length < 2) {
            errors.push('Business name is required and must be at least 2 characters');
        }

        if (!businessData.address || businessData.address.trim().length < 10) {
            errors.push('Business address is required and must be at least 10 characters');
        }

        // Validate using field validators
        Object.keys(this.validators).forEach(field => {
            if (businessData[field]) {
                const validation = this.validators[field](businessData[field]);
                if (!validation.valid) {
                    errors.push(validation.message);
                }
            }
        });

        // Business-specific validations
        if (businessData.gstin && businessData.address) {
            const gstinState = businessData.gstin.substring(0, 2);
            const addressState = this.extractStateFromAddress(businessData.address);
            
            if (addressState && gstinState !== addressState) {
                warnings.push('GSTIN state code does not match business address state');
            }
        }

        // Check business name uniqueness
        const duplicateName = this.businesses.find(b => 
            b.id !== excludeId && 
            b.name.toLowerCase().trim() === businessData.name.toLowerCase().trim()
        );
        
        if (duplicateName) {
            errors.push('A business with this name already exists');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if GSTIN already exists
     * @param {string} gstin - GSTIN to check
     * @param {string} excludeId - Business ID to exclude
     * @returns {boolean} GSTIN exists
     */
    isGSTINExists(gstin, excludeId = null) {
        return this.businesses.some(b => 
            b.id !== excludeId && 
            b.gstin && 
            b.gstin.toUpperCase() === gstin.toUpperCase()
        );
    }

    /**
     * Process and optimize image
     * @param {string|File} image - Image data or file
     * @param {string} type - Image type (logo/signature)
     * @returns {Promise<string>} Processed image data
     */
    async processImage(image, type) {
        try {
            // If already a data URL, return as is
            if (typeof image === 'string' && image.startsWith('data:')) {
                return image;
            }

            // If it's a File object, convert to data URL
            if (image instanceof File) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        const img = new Image();
                        
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // Set max dimensions based on type
                            const maxWidth = type === 'logo' ? 200 : 150;
                            const maxHeight = type === 'logo' ? 100 : 75;
                            
                            // Calculate new dimensions
                            let { width, height } = img;
                            
                            if (width > maxWidth || height > maxHeight) {
                                const ratio = Math.min(maxWidth / width, maxHeight / height);
                                width *= ratio;
                                height *= ratio;
                            }
                            
                            // Set canvas size and draw image
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // Convert to data URL with compression
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                            resolve(dataUrl);
                        };
                        
                        img.onerror = () => reject(new Error('Failed to load image'));
                        img.src = e.target.result;
                    };
                    
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(image);
                });
            }

            return image; // Return as is if unknown format

        } catch (error) {
            console.error('Failed to process image:', error);
            throw new Error('Failed to process image');
        }
    }

    /**
     * Get default business settings
     * @returns {Object} Default settings
     */
    getDefaultBusinessSettings() {
        return {
            invoiceTemplate: 'modern',
            invoiceNumberFormat: 'INV-{###}',
            taxCalculation: 'exclusive',
            showHSN: true,
            showSignature: true,
            showLogo: true,
            showQRCode: true,
            currency: 'INR',
            termsAndConditions: 'Payment due within 30 days.',
            thankYouNote: 'Thank you for your business!',
            autoGenerateInvoiceNumber: true,
            roundOffTotal: true,
            emailInvoices: false,
            smsNotifications: false,
            inventoryTracking: true,
            lowStockAlert: 10
        };
    }

    /**
     * Get initial business statistics
     * @returns {Object} Initial stats
     */
    getInitialBusinessStats() {
        return {
            totalInvoices: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0,
            monthlyRevenue: 0,
            averageOrderValue: 0,
            topCustomer: null,
            topProduct: null,
            lastInvoiceDate: null,
            firstInvoiceDate: null
        };
    }

    /**
     * Update business statistics
     * @param {string} businessId - Business ID
     */
    updateBusinessStats(businessId) {
        try {
            const business = this.getBusinessById(businessId);
            if (!business) return;

            const invoices = this.dataManager.getInvoices()
                .filter(inv => inv.businessId === businessId);
            
            const customers = this.dataManager.getCustomers()
                .filter(cust => cust.businessId === businessId);
            
            const products = this.dataManager.getProducts()
                .filter(prod => prod.businessId === businessId);

            // Calculate statistics
            const totalRevenue = invoices
                .filter(inv => inv.status === 'paid' || inv.status === 'generated')
                .reduce((sum, inv) => sum + (inv.total || 0), 0);

            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const monthlyRevenue = invoices
                .filter(inv => 
                    (inv.status === 'paid' || inv.status === 'generated') &&
                    new Date(inv.createdAt) >= thisMonth
                )
                .reduce((sum, inv) => sum + (inv.total || 0), 0);

            const averageOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

            // Find top customer
            const customerPurchases = {};
            invoices.forEach(inv => {
                if (inv.customerId) {
                    customerPurchases[inv.customerId] = (customerPurchases[inv.customerId] || 0) + inv.total;
                }
            });
            
            const topCustomerId = Object.keys(customerPurchases)
                .reduce((a, b) => customerPurchases[a] > customerPurchases[b] ? a : b, null);
            
            const topCustomer = topCustomerId ? 
                customers.find(c => c.id === topCustomerId) : null;

            // Update business stats
            business.stats = {
                totalInvoices: invoices.length,
                totalRevenue,
                totalCustomers: customers.length,
                totalProducts: products.length,
                monthlyRevenue,
                averageOrderValue,
                topCustomer: topCustomer ? {
                    id: topCustomer.id,
                    name: topCustomer.name,
                    totalPurchases: customerPurchases[topCustomerId]
                } : null,
                lastInvoiceDate: invoices.length > 0 ? 
                    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null,
                firstInvoiceDate: invoices.length > 0 ? 
                    invoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0].createdAt : null,
                updatedAt: new Date().toISOString()
            };

            // Save updated business
            this.dataManager.saveBusinessProfile(business);
            this.updateCache();

        } catch (error) {
            console.error('Failed to update business stats:', error);
        }
    }

    /**
     * Extract state code from address
     * @param {string} address - Address string
     * @returns {string|null} State code
     */
    extractStateFromAddress(address) {
        // Simple implementation - in real app, use address parsing library
        const statePatterns = {
            '24': ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot'],
            '27': ['maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik'],
            '07': ['delhi', 'new delhi'],
            '29': ['karnataka', 'bangalore', 'bengaluru', 'mysore'],
            '33': ['tamil nadu', 'chennai', 'coimbatore', 'madurai']
        };

        const lowerAddress = address.toLowerCase();
        
        for (const [code, patterns] of Object.entries(statePatterns)) {
            if (patterns.some(pattern => lowerAddress.includes(pattern))) {
                return code;
            }
        }
        
        return null;
    }

    /**
     * Track business-related events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackBusinessEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'businessManager',
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track business event:', error);
        }
    }

    /**
     * Export business data
     * @param {string} businessId - Business ID
     * @returns {Object} Business export data
     */
    exportBusinessData(businessId) {
        const business = this.getBusinessById(businessId);
        if (!business) {
            throw new Error('Business not found');
        }

        const invoices = this.dataManager.getInvoices()
            .filter(inv => inv.businessId === businessId);
        
        const customers = this.dataManager.getCustomers()
            .filter(cust => cust.businessId === businessId);
        
        const products = this.dataManager.getProducts()
            .filter(prod => prod.businessId === businessId);

        return {
            business,
            invoices,
            customers,
            products,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Duplicate business profile
     * @param {string} businessId - Business ID to duplicate
     * @param {string} newName - New business name
     * @returns {Promise<Object>} Duplicated business
     */
    async duplicateBusiness(businessId, newName) {
        try {
            const originalBusiness = this.getBusinessById(businessId);
            if (!originalBusiness) {
                throw new Error('Business not found');
            }

            const duplicatedBusiness = {
                ...originalBusiness,
                name: newName,
                gstin: '', // Clear GSTIN to avoid duplicates
                isActive: false, // New business is not active by default
                stats: this.getInitialBusinessStats() // Reset stats
            };

            // Remove original business properties
            delete duplicatedBusiness.id;
            delete duplicatedBusiness.createdAt;
            delete duplicatedBusiness.updatedAt;

            return await this.createBusiness(duplicatedBusiness);

        } catch (error) {
            console.error('Failed to duplicate business:', error);
            throw error;
        }
    }

    /**
     * Archive business (soft delete)
     * @param {string} businessId - Business ID
     * @returns {Promise<boolean>} Success status
     */
    async archiveBusiness(businessId) {
        try {
            const business = this.getBusinessById(businessId);
            if (!business) {
                throw new Error('Business not found');
            }

            business.isArchived = true;
            business.archivedAt = new Date().toISOString();
            business.isActive = false;

            this.dataManager.saveBusinessProfile(business);
            this.loadBusinesses();

            // If archived business was active, set another as active
            if (this.businesses.filter(b => !b.isArchived).length > 0) {
                const firstActive = this.businesses.find(b => !b.isArchived);
                if (firstActive) {
                    await this.setActiveBusiness(firstActive.id);
                }
            }

            this.trackBusinessEvent('business_archived', { businessId });
            return true;

        } catch (error) {
            console.error('Failed to archive business:', error);
            throw error;
        }
    }

    /**
     * Restore archived business
     * @param {string} businessId - Business ID
     * @returns {Promise<boolean>} Success status
     */
    async restoreBusiness(businessId) {
        try {
            const business = this.getBusinessById(businessId);
            if (!business) {
                throw new Error('Business not found');
            }

            business.isArchived = false;
            delete business.archivedAt;

            this.dataManager.saveBusinessProfile(business);
            this.loadBusinesses();

            this.trackBusinessEvent('business_restored', { businessId });
            return true;

        } catch (error) {
            console.error('Failed to restore business:', error);
            throw error;
        }
    }
}

// Create and export global BusinessManager instance
window.BusinessManager = new BusinessManager();

console.log('🏢 UnifyX Bill Maker BusinessManager Loaded Successfully!');
