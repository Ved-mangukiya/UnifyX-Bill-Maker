/**
 * ⚡️ UnifyX Bill Maker - Billing Engine & Invoice Management
 * Complete billing system, invoice generation, tax calculations, and multi-bill support
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class BillingEngine {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.productManager = window.ProductManager;
        this.customerManager = window.CustomerManager;
        
        // Current invoice state
        this.currentInvoice = null;
        this.invoiceItems = [];
        this.invoiceTotals = this.getInitialTotals();
        
        // Multi-bill support
        this.multiBillMode = false;
        this.openInvoices = new Map();
        this.activeInvoiceId = null;
        
        // Bulk entry mode
        this.bulkEntryMode = false;
        this.bulkItems = [];
        
        // Tax calculation settings
        this.taxSettings = this.initializeTaxSettings();
        
        // Invoice templates cache
        this.templates = new Map();
        
        // Event handlers
        this.eventHandlers = new Map();
        
        console.log('🧾 BillingEngine initialized successfully!');
    }

    /**
     * Initialize tax calculation settings
     * @returns {Object} Tax settings
     */
    initializeTaxSettings() {
        return {
            gstEnabled: true,
            gstRates: [0, 5, 12, 18, 28],
            taxCalculationType: 'exclusive', // 'inclusive' or 'exclusive'
            roundingPrecision: 2,
            roundOffTotal: true,
            showTaxBreakup: true,
            defaultTaxRate: 18,
            cgstSgstThreshold: 'same_state', // 'same_state' or 'always'
            igstThreshold: 'different_state'
        };
    }

    /**
     * Get initial totals structure
     * @returns {Object} Initial totals
     */
    getInitialTotals() {
        return {
            subtotal: 0,
            discountAmount: 0,
            discountPercent: 0,
            taxableAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
            additionalCharges: 0,
            roundOff: 0,
            grandTotal: 0,
            totalQuantity: 0,
            totalItems: 0
        };
    }

    /**
     * Create new invoice
     * @param {Object} invoiceData - Initial invoice data
     * @returns {Promise<Object>} Created invoice
     */
    async createNewInvoice(invoiceData = {}) {
        try {
            const currentBusiness = this.businessManager.getCurrentBusiness();
            if (!currentBusiness) {
                throw new Error('No active business profile found');
            }

            const newInvoice = {
                id: this.generateInvoiceId(),
                invoiceNumber: invoiceData.invoiceNumber || await this.generateInvoiceNumber(),
                businessId: currentBusiness.id,
                customerId: invoiceData.customerId || null,
                customerData: invoiceData.customerData || {},
                
                // Invoice details
                invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
                dueDate: invoiceData.dueDate || this.calculateDueDate(),
                placeOfSupply: invoiceData.placeOfSupply || currentBusiness.stateCode || '24',
                
                // Bill type and settings
                billType: invoiceData.billType || 'tax_invoice',
                template: invoiceData.template || currentBusiness.settings?.invoiceTemplate || 'modern',
                
                // Invoice items and calculations
                items: [],
                totals: this.getInitialTotals(),
                
                // Payment details
                paymentMethod: invoiceData.paymentMethod || 'cash',
                paymentStatus: 'pending',
                paymentTerms: invoiceData.paymentTerms || 'Payment due within 30 days',
                
                // Additional details
                notes: invoiceData.notes || '',
                internalNotes: invoiceData.internalNotes || '',
                termsAndConditions: invoiceData.termsAndConditions || currentBusiness.settings?.termsAndConditions || '',
                
                // Status and metadata
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'user', // In future, can be actual user ID
                version: '1.0.0',
                
                // Multi-currency support
                currency: currentBusiness.currency || 'INR',
                exchangeRate: 1,
                
                // Delivery information
                deliveryAddress: invoiceData.deliveryAddress || '',
                deliveryDate: invoiceData.deliveryDate || null,
                deliveryMethod: invoiceData.deliveryMethod || 'pickup'
            };

            // Set as current invoice
            this.currentInvoice = newInvoice;
            this.invoiceItems = [];
            this.invoiceTotals = this.getInitialTotals();

            // Add to multi-bill if enabled
            if (this.multiBillMode) {
                this.openInvoices.set(newInvoice.id, newInvoice);
                this.activeInvoiceId = newInvoice.id;
            }

            // Track event
            this.trackBillingEvent('invoice_created', { 
                invoiceId: newInvoice.id,
                billType: newInvoice.billType,
                multiBill: this.multiBillMode 
            });

            console.log('New invoice created:', newInvoice.id);
            return newInvoice;
            
        } catch (error) {
            console.error('Failed to create new invoice:', error);
            throw error;
        }
    }

    /**
     * Load existing invoice
     * @param {string} invoiceId - Invoice ID
     * @returns {Promise<Object>} Loaded invoice
     */
    async loadInvoice(invoiceId) {
        try {
            const invoice = this.dataManager.getInvoice(invoiceId);
            if (!invoice) {
                throw new Error('Invoice not found');
            }

            this.currentInvoice = invoice;
            this.invoiceItems = invoice.items || [];
            this.invoiceTotals = invoice.totals || this.getInitialTotals();

            // Add to multi-bill if enabled
            if (this.multiBillMode) {
                this.openInvoices.set(invoice.id, invoice);
                this.activeInvoiceId = invoice.id;
            }

            console.log('Invoice loaded:', invoiceId);
            return invoice;
            
        } catch (error) {
            console.error('Failed to load invoice:', error);
            throw error;
        }
    }

    /**
     * Add item to current invoice
     * @param {Object} itemData - Item data
     * @returns {Promise<Object>} Added item
     */
    async addItem(itemData) {
        try {
            if (!this.currentInvoice) {
                throw new Error('No active invoice');
            }

            // Validate item data
            const validation = this.validateItemData(itemData);
            if (!validation.valid) {
                throw new Error(`Invalid item data: ${validation.errors.join(', ')}`);
            }

            // Get product details if productId provided
            let productDetails = {};
            if (itemData.productId) {
                const product = this.productManager.getProductById(itemData.productId);
                if (product) {
                    productDetails = {
                        name: product.name,
                        description: product.description,
                        hsn: product.hsn,
                        unit: product.unit || 'pcs',
                        rate: product.price,
                        taxRate: product.taxRate || 0,
                        category: product.category
                    };
                }
            }

            // Create new item
            const newItem = {
                id: this.generateItemId(),
                productId: itemData.productId || null,
                name: itemData.name || productDetails.name || '',
                description: itemData.description || productDetails.description || '',
                hsn: itemData.hsn || productDetails.hsn || '',
                unit: itemData.unit || productDetails.unit || 'pcs',
                quantity: parseFloat(itemData.quantity) || 1,
                rate: parseFloat(itemData.rate) || productDetails.rate || 0,
                taxRate: parseFloat(itemData.taxRate) || productDetails.taxRate || this.taxSettings.defaultTaxRate,
                discountPercent: parseFloat(itemData.discountPercent) || 0,
                discountAmount: 0, // Will be calculated
                taxableAmount: 0, // Will be calculated
                cgst: 0,
                sgst: 0,
                igst: 0,
                totalTax: 0,
                total: 0, // Will be calculated
                category: itemData.category || productDetails.category || '',
                notes: itemData.notes || '',
                addedAt: new Date().toISOString()
            };

            // Calculate item totals
            this.calculateItemTotals(newItem);

            // Add to invoice items
            this.invoiceItems.push(newItem);

            // Update current invoice
            this.currentInvoice.items = [...this.invoiceItems];
            this.currentInvoice.updatedAt = new Date().toISOString();

            // Recalculate invoice totals
            this.calculateInvoiceTotals();

            // Save if not in bulk mode
            if (!this.bulkEntryMode) {
                await this.saveCurrentInvoice();
            }

            // Track event
            this.trackBillingEvent('item_added', { 
                invoiceId: this.currentInvoice.id,
                itemId: newItem.id,
                productId: newItem.productId,
                quantity: newItem.quantity,
                rate: newItem.rate 
            });

            console.log('Item added to invoice:', newItem.id);
            return newItem;
            
        } catch (error) {
            console.error('Failed to add item:', error);
            throw error;
        }
    }

    /**
     * Update existing item
     * @param {string} itemId - Item ID
     * @param {Object} itemData - Updated item data
     * @returns {Promise<Object>} Updated item
     */
    async updateItem(itemId, itemData) {
        try {
            const itemIndex = this.invoiceItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                throw new Error('Item not found');
            }

            // Update item
            const updatedItem = {
                ...this.invoiceItems[itemIndex],
                ...itemData,
                updatedAt: new Date().toISOString()
            };

            // Recalculate item totals
            this.calculateItemTotals(updatedItem);

            // Update in array
            this.invoiceItems[itemIndex] = updatedItem;

            // Update current invoice
            this.currentInvoice.items = [...this.invoiceItems];
            this.currentInvoice.updatedAt = new Date().toISOString();

            // Recalculate invoice totals
            this.calculateInvoiceTotals();

            // Save if not in bulk mode
            if (!this.bulkEntryMode) {
                await this.saveCurrentInvoice();
            }

            // Track event
            this.trackBillingEvent('item_updated', { 
                invoiceId: this.currentInvoice.id,
                itemId: updatedItem.id 
            });

            return updatedItem;
            
        } catch (error) {
            console.error('Failed to update item:', error);
            throw error;
        }
    }

    /**
     * Remove item from invoice
     * @param {string} itemId - Item ID
     * @returns {Promise<boolean>} Success status
     */
    async removeItem(itemId) {
        try {
            const itemIndex = this.invoiceItems.findIndex(item => item.id === itemId);
            if (itemIndex === -1) {
                throw new Error('Item not found');
            }

            // Remove item
            const removedItem = this.invoiceItems.splice(itemIndex, 1)[0];

            // Update current invoice
            this.currentInvoice.items = [...this.invoiceItems];
            this.currentInvoice.updatedAt = new Date().toISOString();

            // Recalculate invoice totals
            this.calculateInvoiceTotals();

            // Save if not in bulk mode
            if (!this.bulkEntryMode) {
                await this.saveCurrentInvoice();
            }

            // Track event
            this.trackBillingEvent('item_removed', { 
                invoiceId: this.currentInvoice.id,
                itemId: removedItem.id 
            });

            console.log('Item removed from invoice:', itemId);
            return true;
            
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    }

    /**
     * Calculate totals for a single item
     * @param {Object} item - Item object
     */
    calculateItemTotals(item) {
        // Basic calculations
        const baseAmount = item.quantity * item.rate;
        
        // Apply discount
        if (item.discountPercent > 0) {
            item.discountAmount = (baseAmount * item.discountPercent) / 100;
        } else {
            item.discountAmount = 0;
        }
        
        item.taxableAmount = baseAmount - item.discountAmount;

        // Calculate tax based on place of supply
        const businessState = this.businessManager.getCurrentBusiness()?.stateCode || '24';
        const supplyState = this.currentInvoice?.placeOfSupply || businessState;
        const isSameState = businessState === supplyState;

        if (this.taxSettings.gstEnabled && item.taxRate > 0) {
            const taxAmount = (item.taxableAmount * item.taxRate) / 100;
            
            if (isSameState) {
                // CGST + SGST for same state
                item.cgst = taxAmount / 2;
                item.sgst = taxAmount / 2;
                item.igst = 0;
            } else {
                // IGST for different state
                item.cgst = 0;
                item.sgst = 0;
                item.igst = taxAmount;
            }
            
            item.totalTax = taxAmount;
        } else {
            // No tax
            item.cgst = 0;
            item.sgst = 0;
            item.igst = 0;
            item.totalTax = 0;
        }

        // Calculate total
        item.total = item.taxableAmount + item.totalTax;

        // Round values
        const precision = this.taxSettings.roundingPrecision;
        item.discountAmount = this.roundValue(item.discountAmount, precision);
        item.taxableAmount = this.roundValue(item.taxableAmount, precision);
        item.cgst = this.roundValue(item.cgst, precision);
        item.sgst = this.roundValue(item.sgst, precision);
        item.igst = this.roundValue(item.igst, precision);
        item.totalTax = this.roundValue(item.totalTax, precision);
        item.total = this.roundValue(item.total, precision);
    }

    /**
     * Calculate invoice totals
     */
    calculateInvoiceTotals() {
        if (!this.invoiceItems.length) {
            this.invoiceTotals = this.getInitialTotals();
            this.currentInvoice.totals = this.invoiceTotals;
            return;
        }

        // Sum up all items
        const totals = this.invoiceItems.reduce((acc, item) => ({
            subtotal: acc.subtotal + (item.quantity * item.rate),
            discountAmount: acc.discountAmount + item.discountAmount,
            taxableAmount: acc.taxableAmount + item.taxableAmount,
            cgst: acc.cgst + item.cgst,
            sgst: acc.sgst + item.sgst,
            igst: acc.igst + item.igst,
            totalTax: acc.totalTax + item.totalTax,
            totalQuantity: acc.totalQuantity + item.quantity,
            totalItems: acc.totalItems + 1,
            itemTotal: acc.itemTotal + item.total
        }), {
            subtotal: 0,
            discountAmount: 0,
            taxableAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalTax: 0,
            totalQuantity: 0,
            totalItems: 0,
            itemTotal: 0
        });

        // Apply invoice-level discount
        const invoiceDiscountPercent = this.currentInvoice.discountPercent || 0;
        let invoiceDiscountAmount = 0;
        
        if (invoiceDiscountPercent > 0) {
            invoiceDiscountAmount = (totals.subtotal * invoiceDiscountPercent) / 100;
            totals.discountAmount += invoiceDiscountAmount;
            totals.taxableAmount = totals.subtotal - totals.discountAmount;
        }

        // Add additional charges
        const additionalCharges = this.currentInvoice.additionalCharges || 0;
        
        // Calculate grand total
        let grandTotal = totals.taxableAmount + totals.totalTax + additionalCharges;

        // Apply rounding if enabled
        let roundOff = 0;
        if (this.taxSettings.roundOffTotal) {
            const rounded = Math.round(grandTotal);
            roundOff = rounded - grandTotal;
            grandTotal = rounded;
        }

        // Update totals
        this.invoiceTotals = {
            subtotal: this.roundValue(totals.subtotal),
            discountAmount: this.roundValue(totals.discountAmount),
            discountPercent: invoiceDiscountPercent,
            taxableAmount: this.roundValue(totals.taxableAmount),
            cgst: this.roundValue(totals.cgst),
            sgst: this.roundValue(totals.sgst),
            igst: this.roundValue(totals.igst),
            totalTax: this.roundValue(totals.totalTax),
            additionalCharges: this.roundValue(additionalCharges),
            roundOff: this.roundValue(roundOff),
            grandTotal: this.roundValue(grandTotal),
            totalQuantity: totals.totalQuantity,
            totalItems: totals.totalItems
        };

        // Update current invoice
        this.currentInvoice.totals = this.invoiceTotals;
    }

    /**
     * Apply discount to invoice
     * @param {number} discountPercent - Discount percentage
     * @param {number} discountAmount - Fixed discount amount
     */
    applyInvoiceDiscount(discountPercent = 0, discountAmount = 0) {
        if (!this.currentInvoice) return;

        if (discountAmount > 0) {
            // Convert fixed amount to percentage
            this.currentInvoice.discountPercent = (discountAmount / this.invoiceTotals.subtotal) * 100;
        } else {
            this.currentInvoice.discountPercent = discountPercent;
        }

        this.calculateInvoiceTotals();
        
        this.trackBillingEvent('discount_applied', { 
            invoiceId: this.currentInvoice.id,
            discountPercent: this.currentInvoice.discountPercent 
        });
    }

    /**
     * Add additional charges
     * @param {number} amount - Additional charges amount
     * @param {string} description - Description of charges
     */
    addAdditionalCharges(amount, description = '') {
        if (!this.currentInvoice) return;

        this.currentInvoice.additionalCharges = parseFloat(amount) || 0;
        this.currentInvoice.additionalChargesDescription = description;
        
        this.calculateInvoiceTotals();
        
        this.trackBillingEvent('additional_charges_added', { 
            invoiceId: this.currentInvoice.id,
            amount: amount 
        });
    }

    /**
     * Generate invoice
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generated invoice
     */
    async generateInvoice(options = {}) {
        try {
            if (!this.currentInvoice) {
                throw new Error('No active invoice');
            }

            if (!this.invoiceItems.length) {
                throw new Error('Invoice must have at least one item');
            }

            // Validate invoice
            const validation = this.validateInvoice();
            if (!validation.valid) {
                throw new Error(`Invoice validation failed: ${validation.errors.join(', ')}`);
            }

            // Update invoice status
            this.currentInvoice.status = 'generated';
            this.currentInvoice.generatedAt = new Date().toISOString();
            this.currentInvoice.generatedBy = 'user';

            // Assign final invoice number if still draft
            if (!this.currentInvoice.invoiceNumber || this.currentInvoice.invoiceNumber.startsWith('DRAFT')) {
                this.currentInvoice.invoiceNumber = await this.generateInvoiceNumber();
            }

            // Update customer purchase data
            if (this.currentInvoice.customerId) {
                await this.customerManager.updateCustomerPurchase(
                    this.currentInvoice.customerId,
                    this.currentInvoice
                );
            }

            // Update product stock
            await this.updateProductStock();

            // Save invoice
            const invoiceId = this.dataManager.saveInvoice(this.currentInvoice);

            // Generate PDF if requested
            if (options.generatePDF !== false) {
                // PDF generation will be handled by pdfGenerator
                this.currentInvoice.pdfGenerated = true;
            }

            // Send notifications if enabled
            if (options.sendNotifications !== false) {
                await this.sendInvoiceNotifications();
            }

            // Track event
            this.trackBillingEvent('invoice_generated', { 
                invoiceId: this.currentInvoice.id,
                invoiceNumber: this.currentInvoice.invoiceNumber,
                total: this.invoiceTotals.grandTotal,
                items: this.invoiceItems.length 
            });

            console.log('Invoice generated:', this.currentInvoice.invoiceNumber);
            return this.currentInvoice;
            
        } catch (error) {
            console.error('Failed to generate invoice:', error);
            throw error;
        }
    }

    /**
     * Save current invoice as draft
     * @returns {Promise<string>} Invoice ID
     */
    async saveCurrentInvoice() {
        try {
            if (!this.currentInvoice) {
                throw new Error('No active invoice');
            }

            this.currentInvoice.updatedAt = new Date().toISOString();
            
            const invoiceId = this.dataManager.saveInvoice(this.currentInvoice);
            
            this.trackBillingEvent('invoice_saved', { 
                invoiceId: this.currentInvoice.id,
                status: this.currentInvoice.status 
            });

            return invoiceId;
            
        } catch (error) {
            console.error('Failed to save invoice:', error);
            throw error;
        }
    }

    /**
     * Bulk add items to invoice
     * @param {Array} itemsData - Array of item data
     * @returns {Promise<Object>} Bulk operation result
     */
    async bulkAddItems(itemsData) {
        try {
            this.bulkEntryMode = true;
            
            const results = {
                success: [],
                errors: [],
                total: itemsData.length
            };

            for (let i = 0; i < itemsData.length; i++) {
                try {
                    const item = await this.addItem(itemsData[i]);
                    results.success.push({
                        index: i,
                        item: item,
                        data: itemsData[i]
                    });
                } catch (error) {
                    results.errors.push({
                        index: i,
                        error: error.message,
                        data: itemsData[i]
                    });
                }
            }

            // Save once after all items
            if (results.success.length > 0) {
                await this.saveCurrentInvoice();
            }

            this.bulkEntryMode = false;

            this.trackBillingEvent('bulk_items_added', {
                invoiceId: this.currentInvoice.id,
                total: results.total,
                success: results.success.length,
                errors: results.errors.length
            });

            return results;
            
        } catch (error) {
            this.bulkEntryMode = false;
            console.error('Failed to bulk add items:', error);
            throw error;
        }
    }

    /**
     * Enable multi-bill mode
     */
    enableMultiBillMode() {
        this.multiBillMode = true;
        console.log('Multi-bill mode enabled');
        
        this.trackBillingEvent('multi_bill_enabled');
    }

    /**
     * Disable multi-bill mode
     */
    disableMultiBillMode() {
        this.multiBillMode = false;
        this.openInvoices.clear();
        this.activeInvoiceId = null;
        console.log('Multi-bill mode disabled');
        
        this.trackBillingEvent('multi_bill_disabled');
    }

    /**
     * Switch active invoice in multi-bill mode
     * @param {string} invoiceId - Invoice ID to switch to
     */
    switchActiveInvoice(invoiceId) {
        if (!this.multiBillMode) return;

        const invoice = this.openInvoices.get(invoiceId);
        if (invoice) {
            this.currentInvoice = invoice;
            this.invoiceItems = invoice.items || [];
            this.invoiceTotals = invoice.totals || this.getInitialTotals();
            this.activeInvoiceId = invoiceId;
            
            this.trackBillingEvent('active_invoice_switched', { invoiceId });
        }
    }

    /**
     * Update product stock after invoice generation
     */
    async updateProductStock() {
        try {
            const stockUpdates = this.invoiceItems
                .filter(item => item.productId)
                .map(item => ({
                    productId: item.productId,
                    quantity: -item.quantity, // Negative for sale
                    type: 'sale',
                    notes: `Sold in invoice ${this.currentInvoice.invoiceNumber}`
                }));

            if (stockUpdates.length > 0) {
                await this.productManager.bulkUpdateStock(stockUpdates);
            }
            
        } catch (error) {
            console.warn('Failed to update product stock:', error);
            // Don't throw error as invoice generation should still succeed
        }
    }

    /**
     * Send invoice notifications
     */
    async sendInvoiceNotifications() {
        try {
            // Email notification (placeholder for future implementation)
            if (this.currentInvoice.customerData?.email) {
                console.log(`Email notification would be sent to: ${this.currentInvoice.customerData.email}`);
            }

            // SMS notification (placeholder for future implementation)
            if (this.currentInvoice.customerData?.phone) {
                console.log(`SMS notification would be sent to: ${this.currentInvoice.customerData.phone}`);
            }
            
        } catch (error) {
            console.warn('Failed to send notifications:', error);
        }
    }

    /**
     * Validate invoice before generation
     * @returns {Object} Validation result
     */
    validateInvoice() {
        const errors = [];
        const warnings = [];

        if (!this.currentInvoice) {
            errors.push('No active invoice');
            return { valid: false, errors, warnings };
        }

        // Check required fields
        if (!this.currentInvoice.invoiceDate) {
            errors.push('Invoice date is required');
        }

        if (!this.invoiceItems.length) {
            errors.push('Invoice must have at least one item');
        }

        // Validate items
        this.invoiceItems.forEach((item, index) => {
            if (!item.name || !item.name.trim()) {
                errors.push(`Item ${index + 1}: Name is required`);
            }
            
            if (item.quantity <= 0) {
                errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
            }
            
            if (item.rate < 0) {
                errors.push(`Item ${index + 1}: Rate cannot be negative`);
            }
        });

        // Check customer data if B2B invoice
        if (this.currentInvoice.billType === 'tax_invoice' && this.currentInvoice.customerId) {
            const customer = this.customerManager.getCustomerById(this.currentInvoice.customerId);
            if (customer && !customer.gstin) {
                warnings.push('Customer GSTIN not provided for tax invoice');
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate item data
     * @param {Object} itemData - Item data to validate
     * @returns {Object} Validation result
     */
    validateItemData(itemData) {
        const errors = [];

        if (!itemData.name && !itemData.productId) {
            errors.push('Item name or product ID is required');
        }

        if (!itemData.quantity || itemData.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (itemData.rate === undefined || itemData.rate < 0) {
            errors.push('Rate must be non-negative');
        }

        if (itemData.taxRate !== undefined && (itemData.taxRate < 0 || itemData.taxRate > 100)) {
            errors.push('Tax rate must be between 0 and 100');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate unique invoice ID
     * @returns {string} Invoice ID
     */
    generateInvoiceId() {
        return `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique item ID
     * @returns {string} Item ID
     */
    generateItemId() {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * Generate invoice number
     * @returns {Promise<string>} Invoice number
     */
    async generateInvoiceNumber() {
        const business = this.businessManager.getCurrentBusiness();
        const format = business?.settings?.invoiceNumberFormat || 'INV-{###}';
        
        const counters = this.dataManager.getItem('counters') || { invoice: 1 };
        const invoiceCount = counters.invoice;
        
        const now = new Date();
        let invoiceNumber = format
            .replace('{YYYY}', now.getFullYear().toString())
            .replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
            .replace('{DD}', String(now.getDate()).padStart(2, '0'))
            .replace('{###}', String(invoiceCount).padStart(3, '0'));

        // Update counter
        counters.invoice = invoiceCount + 1;
        this.dataManager.setItem('counters', counters);

        return invoiceNumber;
    }

    /**
     * Calculate due date
     * @param {number} days - Days from invoice date
     * @returns {string} Due date
     */
    calculateDueDate(days = 30) {
        const dueDate = new Date(this.currentInvoice?.invoiceDate || new Date());
        dueDate.setDate(dueDate.getDate() + days);
        return dueDate.toISOString().split('T')[0];
    }

    /**
     * Round value to specified precision
     * @param {number} value - Value to round
     * @param {number} precision - Decimal places
     * @returns {number} Rounded value
     */
    roundValue(value, precision = 2) {
        return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    /**
     * Track billing events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackBillingEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'billingEngine',
                    timestamp: new Date().toISOString(),
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track billing event:', error);
        }
    }

    /**
     * Get current invoice summary
     * @returns {Object} Invoice summary
     */
    getCurrentInvoiceSummary() {
        if (!this.currentInvoice) return null;

        return {
            id: this.currentInvoice.id,
            invoiceNumber: this.currentInvoice.invoiceNumber,
            status: this.currentInvoice.status,
            customerId: this.currentInvoice.customerId,
            customerName: this.currentInvoice.customerData?.name,
            itemsCount: this.invoiceItems.length,
            totalQuantity: this.invoiceTotals.totalQuantity,
            subtotal: this.invoiceTotals.subtotal,
            totalTax: this.invoiceTotals.totalTax,
            grandTotal: this.invoiceTotals.grandTotal,
            createdAt: this.currentInvoice.createdAt,
            updatedAt: this.currentInvoice.updatedAt
        };
    }

    /**
     * Get billing statistics
     * @returns {Object} Billing statistics
     */
    getBillingStatistics() {
        const invoices = this.dataManager.getInvoices();
        const drafts = invoices.filter(inv => inv.status === 'draft');
        const generated = invoices.filter(inv => inv.status === 'generated');
        
        const totalRevenue = generated.reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0);
        const avgOrderValue = generated.length > 0 ? totalRevenue / generated.length : 0;

        return {
            totalInvoices: invoices.length,
            drafts: drafts.length,
            generated: generated.length,
            totalRevenue: totalRevenue,
            averageOrderValue: avgOrderValue,
            multiBillEnabled: this.multiBillMode,
            openInvoices: this.openInvoices.size,
            currentInvoiceItems: this.invoiceItems.length
        };
    }
}

// Create and export global BillingEngine instance
window.BillingEngine = new BillingEngine();

console.log('🧾 UnifyX Bill Maker BillingEngine Loaded Successfully!');
