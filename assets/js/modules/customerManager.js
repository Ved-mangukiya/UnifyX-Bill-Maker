/**
 * ⚡️ UnifyX Bill Maker - Customer Management System
 * Complete customer management, loyalty points, purchase history, and analytics
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class CustomerManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.customers = [];
        this.customerCache = new Map();
        this.loyaltyProgram = this.initializeLoyaltyProgram();
        this.validators = this.initializeValidators();
        this.searchIndex = new Map();
        
        // Load customers
        this.loadCustomers();
        
        // Setup customer analytics
        this.setupCustomerAnalytics();
        
        console.log('👥 CustomerManager initialized successfully!');
    }

    /**
     * Initialize field validators
     * @returns {Object} Validator functions
     */
    initializeValidators() {
        return {
            name: (value) => ({
                valid: value && value.trim().length >= 2,
                message: 'Customer name must be at least 2 characters'
            }),
            phone: (value) => {
                if (!value) return { valid: true };
                const phoneRegex = /^[+]?[(]?[\d\s\-()]{10,}$/;
                return {
                    valid: phoneRegex.test(value),
                    message: 'Invalid phone number format'
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
            gstin: (value) => {
                if (!value) return { valid: true };
                const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
                return {
                    valid: gstinRegex.test(value),
                    message: 'Invalid GSTIN format'
                };
            },
            pincode: (value) => {
                if (!value) return { valid: true };
                const pincodeRegex = /^[0-9]{6}$/;
                return {
                    valid: pincodeRegex.test(value),
                    message: 'Invalid pincode. Must be 6 digits'
                };
            }
        };
    }

    /**
     * Initialize loyalty program settings
     * @returns {Object} Loyalty program configuration
     */
    initializeLoyaltyProgram() {
        return {
            enabled: true,
            pointsPerRupee: 1, // 1 point per rupee spent
            redeemRate: 100, // 100 points = 1 rupee
            minRedemption: 500, // Minimum 500 points to redeem
            bonusThresholds: [
                { amount: 10000, bonus: 500, message: 'Congratulations! Bonus 500 points for spending ₹10,000+' },
                { amount: 25000, bonus: 1500, message: 'Amazing! Bonus 1500 points for spending ₹25,000+' },
                { amount: 50000, bonus: 3500, message: 'Fantastic! Bonus 3500 points for spending ₹50,000+' }
            ],
            tiers: [
                { name: 'Bronze', minSpent: 0, discount: 0, color: '#cd7f32' },
                { name: 'Silver', minSpent: 50000, discount: 2, color: '#c0c0c0' },
                { name: 'Gold', minSpent: 100000, discount: 5, color: '#ffd700' },
                { name: 'Platinum', minSpent: 250000, discount: 8, color: '#e5e4e2' }
            ]
        };
    }

    /**
     * Load all customers from storage
     */
    loadCustomers() {
        try {
            this.customers = this.dataManager.getCustomers();
            this.updateCustomerCache();
            this.buildSearchIndex();
            
            console.log(`Loaded ${this.customers.length} customers`);
            
        } catch (error) {
            console.error('Failed to load customers:', error);
            this.customers = [];
        }
    }

    /**
     * Update customer cache for faster access
     */
    updateCustomerCache() {
        this.customerCache.clear();
        this.customers.forEach(customer => {
            this.customerCache.set(customer.id, customer);
            
            // Cache by phone for quick lookups
            if (customer.phone) {
                this.customerCache.set(`phone_${customer.phone}`, customer);
            }
            
            // Cache by email
            if (customer.email) {
                this.customerCache.set(`email_${customer.email.toLowerCase()}`, customer);
            }
        });
    }

    /**
     * Build search index for fast searching
     */
    buildSearchIndex() {
        this.searchIndex.clear();
        
        this.customers.forEach(customer => {
            const searchTerms = [
                customer.name.toLowerCase(),
                customer.phone || '',
                customer.email?.toLowerCase() || '',
                customer.address?.toLowerCase() || '',
                customer.gstin || ''
            ].filter(Boolean);
            
            searchTerms.forEach(term => {
                if (!this.searchIndex.has(term)) {
                    this.searchIndex.set(term, []);
                }
                this.searchIndex.get(term).push(customer.id);
            });
        });
    }

    /**
     * Create new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise<Object>} Created customer
     */
    async createCustomer(customerData) {
        try {
            // Validate customer data
            const validation = this.validateCustomerData(customerData);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate phone
            if (customerData.phone && this.isPhoneExists(customerData.phone)) {
                throw new Error('A customer with this phone number already exists');
            }

            // Check for duplicate email
            if (customerData.email && this.isEmailExists(customerData.email)) {
                throw new Error('A customer with this email already exists');
            }

            // Prepare customer data
            const newCustomer = {
                ...customerData,
                id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                businessId: this.businessManager.getCurrentBusiness()?.id,
                
                // Customer metrics
                totalPurchases: 0,
                totalSpent: 0,
                invoiceCount: 0,
                averageOrderValue: 0,
                lastPurchaseDate: null,
                firstPurchaseDate: null,
                
                // Loyalty program
                loyaltyPoints: 0,
                loyaltyTier: 'Bronze',
                lifetimePoints: 0,
                
                // Customer preferences
                preferredPaymentMethod: 'cash',
                emailNotifications: customerData.emailNotifications !== false,
                smsNotifications: customerData.smsNotifications !== false,
                
                // Birthday and anniversary for marketing
                birthday: customerData.birthday || null,
                anniversary: customerData.anniversary || null,
                
                // Tags for segmentation
                tags: customerData.tags || [],
                
                // Customer status
                isActive: true,
                version: '1.0.0'
            };

            // Save to storage
            const customerId = this.dataManager.saveCustomer(newCustomer);
            
            // Reload customers
            this.loadCustomers();
            
            // Track event
            this.trackCustomerEvent('customer_created', { 
                customerId,
                hasEmail: !!newCustomer.email,
                hasPhone: !!newCustomer.phone,
                tags: newCustomer.tags
            });
            
            console.log('Customer created:', customerId);
            return this.getCustomerById(customerId);
            
        } catch (error) {
            console.error('Failed to create customer:', error);
            throw error;
        }
    }

    /**
     * Update existing customer
     * @param {string} customerId - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise<Object>} Updated customer
     */
    async updateCustomer(customerId, customerData) {
        try {
            const existingCustomer = this.getCustomerById(customerId);
            if (!existingCustomer) {
                throw new Error('Customer not found');
            }

            // Validate updated data
            const validation = this.validateCustomerData(customerData, customerId);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate phone (excluding current customer)
            if (customerData.phone && customerData.phone !== existingCustomer.phone) {
                if (this.isPhoneExists(customerData.phone, customerId)) {
                    throw new Error('A customer with this phone number already exists');
                }
            }

            // Check for duplicate email (excluding current customer)
            if (customerData.email && customerData.email !== existingCustomer.email) {
                if (this.isEmailExists(customerData.email, customerId)) {
                    throw new Error('A customer with this email already exists');
                }
            }

            // Prepare updated customer data
            const updatedCustomer = {
                ...existingCustomer,
                ...customerData,
                updatedAt: new Date().toISOString()
            };

            // Update loyalty tier if total spent changed
            if (customerData.totalSpent !== undefined && customerData.totalSpent !== existingCustomer.totalSpent) {
                updatedCustomer.loyaltyTier = this.calculateLoyaltyTier(customerData.totalSpent);
            }

            // Save to storage
            this.dataManager.saveCustomer(updatedCustomer);
            
            // Reload customers
            this.loadCustomers();
            
            // Track event
            this.trackCustomerEvent('customer_updated', { 
                customerId,
                changes: Object.keys(customerData)
            });
            
            console.log('Customer updated:', customerId);
            return this.getCustomerById(customerId);
            
        } catch (error) {
            console.error('Failed to update customer:', error);
            throw error;
        }
    }

    /**
     * Delete customer (soft delete)
     * @param {string} customerId - Customer ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCustomer(customerId) {
        try {
            const customer = this.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }

            // Check if customer has invoices
            const invoices = this.dataManager.getInvoices();
            const customerInvoices = invoices.filter(inv => inv.customerId === customerId);

            if (customerInvoices.length > 0) {
                // Soft delete - mark as inactive
                customer.isActive = false;
                customer.deletedAt = new Date().toISOString();
                
                this.dataManager.saveCustomer(customer);
                this.loadCustomers();
                
                this.trackCustomerEvent('customer_deactivated', { customerId, invoiceCount: customerInvoices.length });
                console.log('Customer deactivated:', customerId);
                return true;
            } else {
                // Hard delete if no invoices
                const success = this.dataManager.deleteCustomer(customerId);
                if (success) {
                    this.loadCustomers();
                    this.trackCustomerEvent('customer_deleted', { customerId });
                    console.log('Customer deleted:', customerId);
                }
                return success;
            }
            
        } catch (error) {
            console.error('Failed to delete customer:', error);
            throw error;
        }
    }

    /**
     * Get customer by ID
     * @param {string} customerId - Customer ID
     * @returns {Object|null} Customer
     */
    getCustomerById(customerId) {
        return this.customerCache.get(customerId) || null;
    }

    /**
     * Get customer by phone
     * @param {string} phone - Customer phone
     * @returns {Object|null} Customer
     */
    getCustomerByPhone(phone) {
        return this.customerCache.get(`phone_${phone}`) || null;
    }

    /**
     * Get customer by email
     * @param {string} email - Customer email
     * @returns {Object|null} Customer
     */
    getCustomerByEmail(email) {
        return this.customerCache.get(`email_${email.toLowerCase()}`) || null;
    }

    /**
     * Get all active customers
     * @returns {Array} Active customers
     */
    getActiveCustomers() {
        return this.customers.filter(customer => customer.isActive);
    }

    /**
     * Search customers with advanced options
     * @param {Object} searchOptions - Search options
     * @returns {Array} Matching customers
     */
    searchCustomers(searchOptions = {}) {
        let customers = this.getActiveCustomers();
        
        // Text search
        if (searchOptions.query && searchOptions.query.length >= 2) {
            const searchTerm = searchOptions.query.toLowerCase();
            const matchingIds = new Set();
            
            // Use search index for better performance
            for (const [term, customerIds] of this.searchIndex.entries()) {
                if (term.includes(searchTerm)) {
                    customerIds.forEach(id => matchingIds.add(id));
                }
            }
            
            customers = customers.filter(customer => matchingIds.has(customer.id));
        }

        // Loyalty tier filter
        if (searchOptions.loyaltyTier) {
            customers = customers.filter(customer => customer.loyaltyTier === searchOptions.loyaltyTier);
        }

        // Spending range filter
        if (searchOptions.minSpent !== undefined) {
            customers = customers.filter(customer => (customer.totalSpent || 0) >= searchOptions.minSpent);
        }
        
        if (searchOptions.maxSpent !== undefined) {
            customers = customers.filter(customer => (customer.totalSpent || 0) <= searchOptions.maxSpent);
        }

        // Tags filter
        if (searchOptions.tags && searchOptions.tags.length > 0) {
            customers = customers.filter(customer => 
                customer.tags && customer.tags.some(tag => searchOptions.tags.includes(tag))
            );
        }

        // Recent activity filter
        if (searchOptions.recentActivity) {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - searchOptions.recentActivity);
            customers = customers.filter(customer => 
                customer.lastPurchaseDate && new Date(customer.lastPurchaseDate) >= daysAgo
            );
        }

        // Birthday this month
        if (searchOptions.birthdayThisMonth) {
            const currentMonth = new Date().getMonth();
            customers = customers.filter(customer => 
                customer.birthday && new Date(customer.birthday).getMonth() === currentMonth
            );
        }

        // Sort options
        if (searchOptions.sortBy) {
            customers.sort((a, b) => {
                switch (searchOptions.sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'total_spent_high':
                        return (b.totalSpent || 0) - (a.totalSpent || 0);
                    case 'total_spent_low':
                        return (a.totalSpent || 0) - (b.totalSpent || 0);
                    case 'last_purchase':
                        return new Date(b.lastPurchaseDate || 0) - new Date(a.lastPurchaseDate || 0);
                    case 'created':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'loyalty_points':
                        return (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0);
                    default:
                        return 0;
                }
            });
        }

        // Pagination
        if (searchOptions.limit) {
            const start = (searchOptions.page || 0) * searchOptions.limit;
            customers = customers.slice(start, start + searchOptions.limit);
        }

        return customers;
    }

    /**
     * Update customer purchase data after invoice
     * @param {string} customerId - Customer ID
     * @param {Object} invoiceData - Invoice data
     * @returns {Promise<Object>} Updated customer
     */
    async updateCustomerPurchase(customerId, invoiceData) {
        try {
            const customer = this.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }

            const invoiceTotal = parseFloat(invoiceData.total) || 0;
            const oldTotalSpent = customer.totalSpent || 0;
            const newTotalSpent = oldTotalSpent + invoiceTotal;

            // Update customer metrics
            customer.totalSpent = newTotalSpent;
            customer.invoiceCount = (customer.invoiceCount || 0) + 1;
            customer.averageOrderValue = customer.totalSpent / customer.invoiceCount;
            customer.lastPurchaseDate = invoiceData.createdAt || new Date().toISOString();
            
            if (!customer.firstPurchaseDate) {
                customer.firstPurchaseDate = customer.lastPurchaseDate;
            }

            // Update loyalty points
            const pointsEarned = Math.floor(invoiceTotal * this.loyaltyProgram.pointsPerRupee);
            customer.loyaltyPoints = (customer.loyaltyPoints || 0) + pointsEarned;
            customer.lifetimePoints = (customer.lifetimePoints || 0) + pointsEarned;

            // Check for bonus points
            const bonusPoints = this.checkBonusEligibility(oldTotalSpent, newTotalSpent);
            if (bonusPoints > 0) {
                customer.loyaltyPoints += bonusPoints;
                customer.lifetimePoints += bonusPoints;
            }

            // Update loyalty tier
            customer.loyaltyTier = this.calculateLoyaltyTier(newTotalSpent);

            // Update timestamp
            customer.updatedAt = new Date().toISOString();

            // Save customer
            this.dataManager.saveCustomer(customer);
            this.loadCustomers();

            // Track event
            this.trackCustomerEvent('customer_purchase_updated', { 
                customerId, 
                invoiceTotal, 
                pointsEarned,
                bonusPoints,
                newTier: customer.loyaltyTier 
            });

            return customer;
            
        } catch (error) {
            console.error('Failed to update customer purchase:', error);
            throw error;
        }
    }

    /**
     * Redeem loyalty points
     * @param {string} customerId - Customer ID
     * @param {number} points - Points to redeem
     * @returns {Promise<Object>} Redemption result
     */
    async redeemLoyaltyPoints(customerId, points) {
        try {
            const customer = this.getCustomerById(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }

            // Validate redemption
            if (points < this.loyaltyProgram.minRedemption) {
                throw new Error(`Minimum redemption is ${this.loyaltyProgram.minRedemption} points`);
            }

            if (customer.loyaltyPoints < points) {
                throw new Error('Insufficient loyalty points');
            }

            // Calculate redemption value
            const redemptionValue = points / this.loyaltyProgram.redeemRate;

            // Deduct points
            customer.loyaltyPoints -= points;
            customer.updatedAt = new Date().toISOString();

            // Add redemption record
            if (!customer.redemptions) {
                customer.redemptions = [];
            }

            const redemption = {
                id: `redemption_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                points: points,
                value: redemptionValue,
                date: new Date().toISOString(),
                status: 'completed'
            };

            customer.redemptions.push(redemption);

            // Keep only last 50 redemptions
            if (customer.redemptions.length > 50) {
                customer.redemptions = customer.redemptions.slice(-50);
            }

            // Save customer
            this.dataManager.saveCustomer(customer);
            this.loadCustomers();

            // Track event
            this.trackCustomerEvent('loyalty_points_redeemed', { 
                customerId, 
                points, 
                value: redemptionValue 
            });

            return {
                success: true,
                pointsRedeemed: points,
                redemptionValue: redemptionValue,
                remainingPoints: customer.loyaltyPoints,
                redemptionId: redemption.id
            };
            
        } catch (error) {
            console.error('Failed to redeem loyalty points:', error);
            throw error;
        }
    }

    /**
     * Calculate loyalty tier based on total spent
     * @param {number} totalSpent - Total amount spent
     * @returns {string} Loyalty tier name
     */
    calculateLoyaltyTier(totalSpent) {
        const tiers = [...this.loyaltyProgram.tiers].reverse(); // Start from highest tier
        
        for (const tier of tiers) {
            if (totalSpent >= tier.minSpent) {
                return tier.name;
            }
        }
        
        return this.loyaltyProgram.tiers[0].name; // Default to first tier
    }

    /**
     * Check bonus point eligibility
     * @param {number} oldTotal - Previous total spent
     * @param {number} newTotal - New total spent
     * @returns {number} Bonus points earned
     */
    checkBonusEligibility(oldTotal, newTotal) {
        let bonusPoints = 0;
        
        this.loyaltyProgram.bonusThresholds.forEach(threshold => {
            if (oldTotal < threshold.amount && newTotal >= threshold.amount) {
                bonusPoints += threshold.bonus;
            }
        });
        
        return bonusPoints;
    }

    /**
     * Get customer analytics
     * @param {string} customerId - Customer ID
     * @returns {Object} Customer analytics
     */
    getCustomerAnalytics(customerId) {
        const customer = this.getCustomerById(customerId);
        if (!customer) return null;

        const invoices = this.dataManager.getInvoices()
            .filter(inv => inv.customerId === customerId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Calculate trends
        const monthlySpending = {};
        const categorySpending = {};
        let totalItems = 0;

        invoices.forEach(invoice => {
            const month = new Date(invoice.createdAt).toISOString().substring(0, 7); // YYYY-MM
            monthlySpending[month] = (monthlySpending[month] || 0) + invoice.total;

            if (invoice.items) {
                invoice.items.forEach(item => {
                    totalItems += item.quantity;
                    const category = item.category || 'Uncategorized';
                    categorySpending[category] = (categorySpending[category] || 0) + (item.quantity * item.rate);
                });
            }
        });

        return {
            customerId: customer.id,
            name: customer.name,
            totalSpent: customer.totalSpent || 0,
            totalInvoices: invoices.length,
            totalItems: totalItems,
            averageOrderValue: customer.averageOrderValue || 0,
            loyaltyPoints: customer.loyaltyPoints || 0,
            loyaltyTier: customer.loyaltyTier,
            firstPurchase: customer.firstPurchaseDate,
            lastPurchase: customer.lastPurchaseDate,
            monthlySpending: Object.entries(monthlySpending)
                .map(([month, amount]) => ({ month, amount }))
                .sort((a, b) => a.month.localeCompare(b.month)),
            categorySpending: Object.entries(categorySpending)
                .map(([category, amount]) => ({ category, amount }))
                .sort((a, b) => b.amount - a.amount),
            paymentMethodPreference: this.analyzePaymentMethods(invoices),
            purchaseFrequency: this.calculatePurchaseFrequency(invoices)
        };
    }

    /**
     * Analyze payment method preferences
     * @param {Array} invoices - Customer invoices
     * @returns {Object} Payment method analysis
     */
    analyzePaymentMethods(invoices) {
        const methods = {};
        
        invoices.forEach(invoice => {
            const method = invoice.paymentMethod || 'cash';
            methods[method] = (methods[method] || 0) + 1;
        });

        const total = invoices.length;
        const preferred = Object.entries(methods)
            .sort((a, b) => b[1] - a[1])
            .map(([method, count]) => ({
                method,
                count,
                percentage: Math.round((count / total) * 100)
            }));

        return {
            preferred: preferred[0]?.method || 'cash',
            breakdown: preferred
        };
    }

    /**
     * Calculate purchase frequency
     * @param {Array} invoices - Customer invoices
     * @returns {Object} Purchase frequency analysis
     */
    calculatePurchaseFrequency(invoices) {
        if (invoices.length < 2) {
            return { frequency: 'insufficient_data', averageDays: 0 };
        }

        const dates = invoices.map(inv => new Date(inv.createdAt)).sort((a, b) => a - b);
        const intervals = [];

        for (let i = 1; i < dates.length; i++) {
            const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
            intervals.push(daysDiff);
        }

        const averageDays = intervals.reduce((sum, days) => sum + days, 0) / intervals.length;
        
        let frequency;
        if (averageDays <= 7) frequency = 'weekly';
        else if (averageDays <= 14) frequency = 'biweekly';
        else if (averageDays <= 30) frequency = 'monthly';
        else if (averageDays <= 90) frequency = 'quarterly';
        else frequency = 'irregular';

        return {
            frequency,
            averageDays: Math.round(averageDays),
            totalPurchases: invoices.length,
            timeSpan: Math.round((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Get customer statistics
     * @returns {Object} Customer statistics
     */
    getCustomerStatistics() {
        const customers = this.getActiveCustomers();
        const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const totalPoints = customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0);
        
        // Tier distribution
        const tierCounts = {};
        this.loyaltyProgram.tiers.forEach(tier => {
            tierCounts[tier.name] = customers.filter(c => c.loyaltyTier === tier.name).length;
        });

        // Top customers by spending
        const topSpenders = customers
            .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
            .slice(0, 10)
            .map(c => ({
                id: c.id,
                name: c.name,
                totalSpent: c.totalSpent || 0,
                loyaltyTier: c.loyaltyTier,
                invoiceCount: c.invoiceCount || 0
            }));

        return {
            totalCustomers: customers.length,
            totalSpent: totalSpent,
            averageSpentPerCustomer: customers.length > 0 ? totalSpent / customers.length : 0,
            totalLoyaltyPoints: totalPoints,
            tierDistribution: tierCounts,
            topSpenders: topSpenders,
            recentCustomers: customers
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    createdAt: c.createdAt,
                    totalSpent: c.totalSpent || 0
                }))
        };
    }

    /**
     * Setup customer analytics tracking
     */
    setupCustomerAnalytics() {
        // Track customer birthdays and anniversaries
        this.checkSpecialDates();
        
        // Check daily for special dates
        setInterval(() => {
            this.checkSpecialDates();
        }, 24 * 60 * 60 * 1000); // Daily check
    }

    /**
     * Check for customer birthdays and anniversaries
     */
    checkSpecialDates() {
        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const birthdayCustomers = this.customers.filter(customer => {
            if (!customer.birthday) return false;
            const birthday = new Date(customer.birthday);
            const birthdayStr = `${String(birthday.getMonth() + 1).padStart(2, '0')}-${String(birthday.getDate()).padStart(2, '0')}`;
            return birthdayStr === todayStr;
        });

        const anniversaryCustomers = this.customers.filter(customer => {
            if (!customer.anniversary) return false;
            const anniversary = new Date(customer.anniversary);
            const anniversaryStr = `${String(anniversary.getMonth() + 1).padStart(2, '0')}-${String(anniversary.getDate()).padStart(2, '0')}`;
            return anniversaryStr === todayStr;
        });

        if (birthdayCustomers.length > 0) {
            console.log(`🎂 ${birthdayCustomers.length} customer(s) have birthdays today!`);
            this.trackCustomerEvent('customers_birthday_today', { count: birthdayCustomers.length });
        }

        if (anniversaryCustomers.length > 0) {
            console.log(`💍 ${anniversaryCustomers.length} customer(s) have anniversaries today!`);
            this.trackCustomerEvent('customers_anniversary_today', { count: anniversaryCustomers.length });
        }
    }

    /**
     * Validate customer data
     * @param {Object} customerData - Customer data to validate
     * @param {string} excludeId - Customer ID to exclude from duplicate checks
     * @returns {Object} Validation result
     */
    validateCustomerData(customerData, excludeId = null) {
        const errors = [];
        const warnings = [];

        // Validate using field validators
        Object.keys(this.validators).forEach(field => {
            if (customerData[field] !== undefined) {
                const validation = this.validators[field](customerData[field]);
                if (!validation.valid) {
                    errors.push(validation.message);
                }
            }
        });

        // Check required fields
        if (!customerData.name || !customerData.name.trim()) {
            errors.push('Customer name is required');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if phone number already exists
     * @param {string} phone - Phone number to check
     * @param {string} excludeId - Customer ID to exclude
     * @returns {boolean} Phone exists
     */
    isPhoneExists(phone, excludeId = null) {
        return this.customers.some(c => 
            c.id !== excludeId && 
            c.phone && 
            c.phone === phone
        );
    }

    /**
     * Check if email already exists
     * @param {string} email - Email to check
     * @param {string} excludeId - Customer ID to exclude
     * @returns {boolean} Email exists
     */
    isEmailExists(email, excludeId = null) {
        return this.customers.some(c => 
            c.id !== excludeId && 
            c.email && 
            c.email.toLowerCase() === email.toLowerCase()
        );
    }

    /**
     * Track customer-related events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackCustomerEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'customerManager',
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track customer event:', error);
        }
    }

    /**
     * Export customers to CSV
     * @param {Array} customerIds - Optional array of customer IDs
     * @returns {string} CSV data
     */
    exportCustomersToCSV(customerIds = null) {
        const customers = customerIds ? 
            customerIds.map(id => this.getCustomerById(id)).filter(Boolean) :
            this.getActiveCustomers();
            
        const headers = [
            'Name', 'Phone', 'Email', 'Address', 'GSTIN', 
            'Total Spent', 'Invoice Count', 'Loyalty Points', 'Loyalty Tier',
            'Created Date', 'Last Purchase', 'Tags'
        ];
        
        const csvRows = [headers.join(',')];
        
        customers.forEach(customer => {
            const row = [
                `"${customer.name || ''}"`,
                `"${customer.phone || ''}"`,
                `"${customer.email || ''}"`,
                `"${customer.address || ''}"`,
                `"${customer.gstin || ''}"`,
                customer.totalSpent || 0,
                customer.invoiceCount || 0,
                customer.loyaltyPoints || 0,
                `"${customer.loyaltyTier || 'Bronze'}"`,
                `"${new Date(customer.createdAt).toLocaleDateString()}"`,
                `"${customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : ''}"`,
                `"${customer.tags ? customer.tags.join('; ') : ''}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * Get customer suggestions for autocomplete
     * @param {string} query - Search query
     * @param {number} limit - Maximum suggestions
     * @returns {Array} Customer suggestions
     */
    getCustomerSuggestions(query, limit = 10) {
        if (!query || query.length < 1) {
            // Return recent customers
            return this.getActiveCustomers()
                .sort((a, b) => new Date(b.lastPurchaseDate || 0) - new Date(a.lastPurchaseDate || 0))
                .slice(0, limit)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone,
                    email: c.email,
                    totalSpent: c.totalSpent || 0
                }));
        }

        const searchResults = this.searchCustomers({ 
            query, 
            limit,
            sortBy: 'total_spent_high' 
        });

        return searchResults.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            totalSpent: c.totalSpent || 0,
            loyaltyPoints: c.loyaltyPoints || 0
        }));
    }
}

// Create and export global CustomerManager instance
window.CustomerManager = new CustomerManager();

console.log('👥 UnifyX Bill Maker CustomerManager Loaded Successfully!');
