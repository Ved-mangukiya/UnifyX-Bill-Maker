/**
 * ⚡️ UnifyX Bill Maker - Product & Inventory Management System
 * Complete product management, stock tracking, categories, and bulk operations
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class ProductManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.products = [];
        this.categories = [];
        this.productCache = new Map();
        this.lowStockProducts = [];
        this.validators = this.initializeValidators();
        this.batchOperations = [];
        
        // Load products and categories
        this.loadProducts();
        this.loadCategories();
        
        // Setup stock monitoring
        this.setupStockMonitoring();
        
        console.log('📦 ProductManager initialized successfully!');
    }

    /**
     * Initialize field validators
     * @returns {Object} Validator functions
     */
    initializeValidators() {
        return {
            name: (value) => ({
                valid: value && value.trim().length >= 2,
                message: 'Product name must be at least 2 characters'
            }),
            price: (value) => ({
                valid: value && parseFloat(value) > 0,
                message: 'Price must be a positive number'
            }),
            stock: (value) => ({
                valid: value === undefined || value === null || parseInt(value) >= 0,
                message: 'Stock must be a non-negative number'
            }),
            hsn: (value) => {
                if (!value) return { valid: true };
                const hsnRegex = /^[0-9]{4,8}$/;
                return {
                    valid: hsnRegex.test(value),
                    message: 'HSN/SAC code must be 4-8 digits'
                };
            },
            barcode: (value) => {
                if (!value) return { valid: true };
                const barcodeRegex = /^[0-9A-Za-z]{8,20}$/;
                return {
                    valid: barcodeRegex.test(value),
                    message: 'Barcode must be 8-20 alphanumeric characters'
                };
            },
            taxRate: (value) => {
                if (value === undefined || value === null) return { valid: true };
                const rate = parseFloat(value);
                return {
                    valid: rate >= 0 && rate <= 100,
                    message: 'Tax rate must be between 0 and 100'
                };
            }
        };
    }

    /**
     * Load all products from storage
     */
    loadProducts() {
        try {
            this.products = this.dataManager.getProducts();
            this.updateProductCache();
            this.checkLowStock();
            
            console.log(`Loaded ${this.products.length} products`);
            
        } catch (error) {
            console.error('Failed to load products:', error);
            this.products = [];
        }
    }

    /**
     * Load product categories
     */
    loadCategories() {
        try {
            // Get categories from constants and user-defined categories
            const defaultCategories = AppConstants.PRODUCT_CATEGORIES || [];
            const customCategories = this.dataManager.getItem('productCategories') || [];
            
            this.categories = [...defaultCategories, ...customCategories];
            
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.categories = [];
        }
    }

    /**
     * Update product cache for faster access
     */
    updateProductCache() {
        this.productCache.clear();
        this.products.forEach(product => {
            this.productCache.set(product.id, product);
            
            // Also cache by barcode for quick lookups
            if (product.barcode) {
                this.productCache.set(`barcode_${product.barcode}`, product);
            }
        });
    }

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async createProduct(productData) {
        try {
            // Validate product data
            const validation = this.validateProductData(productData);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate barcode
            if (productData.barcode && this.isBarcodeExists(productData.barcode)) {
                throw new Error('A product with this barcode already exists');
            }

            // Check for duplicate name in same category
            if (this.isProductNameExists(productData.name, productData.category)) {
                throw new Error('A product with this name already exists in the same category');
            }

            // Prepare product data
            const newProduct = {
                ...productData,
                id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                businessId: this.businessManager.getCurrentBusiness()?.id,
                isActive: true,
                totalSold: 0,
                stockMovements: [],
                version: '1.0.0',
                
                // Normalize data
                price: parseFloat(productData.price) || 0,
                stock: parseInt(productData.stock) || 0,
                minStock: parseInt(productData.minStock) || 10,
                maxStock: parseInt(productData.maxStock) || 1000,
                taxRate: parseFloat(productData.taxRate) || 0
            };

            // Process product image if provided
            if (productData.image) {
                newProduct.image = await this.processProductImage(productData.image);
            }

            // Generate SKU if not provided
            if (!newProduct.sku) {
                newProduct.sku = this.generateSKU(newProduct);
            }

            // Save to storage
            const productId = this.dataManager.saveProduct(newProduct);
            
            // Reload products
            this.loadProducts();
            
            // Add stock movement entry
            this.addStockMovement(productId, newProduct.stock, 'initial', 'Initial stock');
            
            // Track event
            this.trackProductEvent('product_created', { 
                productId, 
                category: newProduct.category,
                price: newProduct.price,
                stock: newProduct.stock 
            });
            
            console.log('Product created:', productId);
            return this.getProductById(productId);
            
        } catch (error) {
            console.error('Failed to create product:', error);
            throw error;
        }
    }

    /**
     * Update existing product
     * @param {string} productId - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Updated product
     */
    async updateProduct(productId, productData) {
        try {
            const existingProduct = this.getProductById(productId);
            if (!existingProduct) {
                throw new Error('Product not found');
            }

            // Validate updated data
            const validation = this.validateProductData(productData, productId);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // Check for duplicate barcode (excluding current product)
            if (productData.barcode && productData.barcode !== existingProduct.barcode) {
                if (this.isBarcodeExists(productData.barcode, productId)) {
                    throw new Error('A product with this barcode already exists');
                }
            }

            // Prepare updated product data
            const updatedProduct = {
                ...existingProduct,
                ...productData,
                updatedAt: new Date().toISOString(),
                price: parseFloat(productData.price) || existingProduct.price,
                taxRate: parseFloat(productData.taxRate) || existingProduct.taxRate
            };

            // Handle stock changes
            if (productData.stock !== undefined && productData.stock !== existingProduct.stock) {
                const stockDifference = parseInt(productData.stock) - existingProduct.stock;
                updatedProduct.stock = parseInt(productData.stock);
                
                // Add stock movement
                this.addStockMovement(
                    productId, 
                    stockDifference, 
                    stockDifference > 0 ? 'restock' : 'adjustment',
                    `Stock ${stockDifference > 0 ? 'increased' : 'decreased'} by ${Math.abs(stockDifference)}`
                );
            }

            // Process new image if provided
            if (productData.image && productData.image !== existingProduct.image) {
                updatedProduct.image = await this.processProductImage(productData.image);
            }

            // Save to storage
            this.dataManager.saveProduct(updatedProduct);
            
            // Reload products
            this.loadProducts();
            
            // Track event
            this.trackProductEvent('product_updated', { 
                productId,
                changes: Object.keys(productData)
            });
            
            console.log('Product updated:', productId);
            return this.getProductById(productId);
            
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    }

    /**
     * Delete product (soft delete)
     * @param {string} productId - Product ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteProduct(productId) {
        try {
            const product = this.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            // Check if product is used in any invoices
            const invoices = this.dataManager.getInvoices();
            const productInUse = invoices.some(invoice => 
                invoice.items && invoice.items.some(item => item.productId === productId)
            );

            if (productInUse) {
                // Soft delete - mark as inactive
                product.isActive = false;
                product.deletedAt = new Date().toISOString();
                
                this.dataManager.saveProduct(product);
                this.loadProducts();
                
                this.trackProductEvent('product_deactivated', { productId });
                console.log('Product deactivated:', productId);
                return true;
            } else {
                // Hard delete if not used
                const success = this.dataManager.deleteProduct(productId);
                if (success) {
                    this.loadProducts();
                    this.trackProductEvent('product_deleted', { productId });
                    console.log('Product deleted:', productId);
                }
                return success;
            }
            
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    }

    /**
     * Get product by ID
     * @param {string} productId - Product ID
     * @returns {Object|null} Product
     */
    getProductById(productId) {
        return this.productCache.get(productId) || null;
    }

    /**
     * Get product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Object|null} Product
     */
    getProductByBarcode(barcode) {
        return this.productCache.get(`barcode_${barcode}`) || null;
    }

    /**
     * Get all active products
     * @returns {Array} Active products
     */
    getActiveProducts() {
        return this.products.filter(product => product.isActive);
    }

    /**
     * Search products with advanced filtering
     * @param {Object} searchOptions - Search options
     * @returns {Array} Matching products
     */
    searchProducts(searchOptions = {}) {
        let products = this.getActiveProducts();
        
        // Text search
        if (searchOptions.query && searchOptions.query.length >= 2) {
            const searchTerm = searchOptions.query.toLowerCase();
            products = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm) ||
                product.hsn?.includes(searchTerm) ||
                product.barcode?.includes(searchTerm) ||
                product.sku?.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        if (searchOptions.category) {
            products = products.filter(product => product.category === searchOptions.category);
        }

        // Price range filter
        if (searchOptions.minPrice !== undefined) {
            products = products.filter(product => product.price >= searchOptions.minPrice);
        }
        
        if (searchOptions.maxPrice !== undefined) {
            products = products.filter(product => product.price <= searchOptions.maxPrice);
        }

        // Stock status filter
        if (searchOptions.stockStatus) {
            switch (searchOptions.stockStatus) {
                case 'in_stock':
                    products = products.filter(product => product.stock > 0);
                    break;
                case 'low_stock':
                    products = products.filter(product => 
                        product.stock > 0 && product.stock <= (product.minStock || 10)
                    );
                    break;
                case 'out_of_stock':
                    products = products.filter(product => product.stock === 0);
                    break;
            }
        }

        // Sort options
        if (searchOptions.sortBy) {
            products.sort((a, b) => {
                switch (searchOptions.sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'price_low':
                        return a.price - b.price;
                    case 'price_high':
                        return b.price - a.price;
                    case 'stock':
                        return b.stock - a.stock;
                    case 'created':
                        return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'updated':
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    default:
                        return 0;
                }
            });
        }

        // Pagination
        if (searchOptions.limit) {
            const start = (searchOptions.page || 0) * searchOptions.limit;
            products = products.slice(start, start + searchOptions.limit);
        }

        return products;
    }

    /**
     * Get products by category
     * @param {string} category - Category name
     * @returns {Array} Products in category
     */
    getProductsByCategory(category) {
        return this.getActiveProducts().filter(product => product.category === category);
    }

    /**
     * Get low stock products
     * @returns {Array} Low stock products
     */
    getLowStockProducts() {
        return this.lowStockProducts;
    }

    /**
     * Check for low stock products
     */
    checkLowStock() {
        this.lowStockProducts = this.getActiveProducts().filter(product => 
            product.stock > 0 && 
            product.stock <= (product.minStock || 10)
        );

        // Notify if low stock products found
        if (this.lowStockProducts.length > 0) {
            console.warn(`${this.lowStockProducts.length} products have low stock`);
        }
    }

    /**
     * Update product stock
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity to add/subtract
     * @param {string} type - Movement type (sale, restock, adjustment)
     * @param {string} notes - Notes for the movement
     * @returns {Promise<boolean>} Success status
     */
    async updateStock(productId, quantity, type = 'adjustment', notes = '') {
        try {
            const product = this.getProductById(productId);
            if (!product) {
                throw new Error('Product not found');
            }

            const oldStock = product.stock;
            const newStock = Math.max(0, oldStock + quantity);
            
            product.stock = newStock;
            product.updatedAt = new Date().toISOString();

            // Update total sold if it's a sale
            if (type === 'sale' && quantity < 0) {
                product.totalSold = (product.totalSold || 0) + Math.abs(quantity);
            }

            // Save product
            this.dataManager.saveProduct(product);
            
            // Add stock movement
            this.addStockMovement(productId, quantity, type, notes);
            
            // Reload products and check stock
            this.loadProducts();
            
            // Track event
            this.trackProductEvent('stock_updated', { 
                productId, 
                oldStock, 
                newStock, 
                quantity,
                type 
            });
            
            return true;
            
        } catch (error) {
            console.error('Failed to update stock:', error);
            throw error;
        }
    }

    /**
     * Add stock movement record
     * @param {string} productId - Product ID
     * @param {number} quantity - Quantity changed
     * @param {string} type - Movement type
     * @param {string} notes - Movement notes
     */
    addStockMovement(productId, quantity, type, notes) {
        const product = this.getProductById(productId);
        if (!product) return;

        if (!product.stockMovements) {
            product.stockMovements = [];
        }

        const movement = {
            id: `movement_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            quantity,
            type,
            notes,
            timestamp: new Date().toISOString(),
            balanceAfter: product.stock
        };

        product.stockMovements.push(movement);

        // Keep only last 100 movements per product
        if (product.stockMovements.length > 100) {
            product.stockMovements = product.stockMovements.slice(-100);
        }

        this.dataManager.saveProduct(product);
    }

    /**
     * Bulk create products
     * @param {Array} productsData - Array of product data
     * @returns {Promise<Object>} Bulk operation result
     */
    async bulkCreateProducts(productsData) {
        const results = {
            success: [],
            errors: [],
            total: productsData.length
        };

        for (let i = 0; i < productsData.length; i++) {
            try {
                const product = await this.createProduct(productsData[i]);
                results.success.push({
                    index: i,
                    product: product,
                    data: productsData[i]
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    data: productsData[i]
                });
            }
        }

        this.trackProductEvent('bulk_create_products', {
            total: results.total,
            success: results.success.length,
            errors: results.errors.length
        });

        return results;
    }

    /**
     * Bulk update product stocks
     * @param {Array} stockUpdates - Array of {productId, quantity, type, notes}
     * @returns {Promise<Object>} Bulk operation result
     */
    async bulkUpdateStock(stockUpdates) {
        const results = {
            success: [],
            errors: [],
            total: stockUpdates.length
        };

        for (let i = 0; i < stockUpdates.length; i++) {
            const update = stockUpdates[i];
            try {
                await this.updateStock(
                    update.productId,
                    update.quantity,
                    update.type || 'adjustment',
                    update.notes || ''
                );
                results.success.push({
                    index: i,
                    productId: update.productId,
                    quantity: update.quantity
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    productId: update.productId
                });
            }
        }

        this.trackProductEvent('bulk_update_stock', {
            total: results.total,
            success: results.success.length,
            errors: results.errors.length
        });

        return results;
    }

    /**
     * Import products from CSV data
     * @param {string} csvData - CSV data string
     * @returns {Promise<Object>} Import result
     */
    async importProductsFromCSV(csvData) {
        try {
            const lines = csvData.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const products = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                const product = {};
                
                headers.forEach((header, index) => {
                    const value = values[index]?.trim();
                    if (value) {
                        // Map CSV headers to product properties
                        switch (header) {
                            case 'name':
                            case 'product name':
                                product.name = value;
                                break;
                            case 'price':
                            case 'unit price':
                                product.price = parseFloat(value) || 0;
                                break;
                            case 'stock':
                            case 'quantity':
                                product.stock = parseInt(value) || 0;
                                break;
                            case 'category':
                                product.category = value;
                                break;
                            case 'hsn':
                            case 'hsn code':
                                product.hsn = value;
                                break;
                            case 'tax':
                            case 'tax rate':
                                product.taxRate = parseFloat(value) || 0;
                                break;
                            case 'description':
                                product.description = value;
                                break;
                            case 'unit':
                                product.unit = value;
                                break;
                            case 'barcode':
                                product.barcode = value;
                                break;
                        }
                    }
                });
                
                if (product.name) {
                    products.push(product);
                }
            }
            
            return await this.bulkCreateProducts(products);
            
        } catch (error) {
            console.error('Failed to import products from CSV:', error);
            throw new Error('Failed to parse CSV data');
        }
    }

    /**
     * Export products to CSV
     * @param {Array} productIds - Optional array of product IDs to export
     * @returns {string} CSV data
     */
    exportProductsToCSV(productIds = null) {
        const products = productIds ? 
            productIds.map(id => this.getProductById(id)).filter(Boolean) :
            this.getActiveProducts();
            
        const headers = [
            'Name', 'Category', 'Price', 'Stock', 'Unit', 'HSN Code', 
            'Tax Rate', 'Barcode', 'SKU', 'Description', 'Min Stock', 'Max Stock'
        ];
        
        const csvRows = [headers.join(',')];
        
        products.forEach(product => {
            const row = [
                `"${product.name || ''}"`,
                `"${product.category || ''}"`,
                product.price || 0,
                product.stock || 0,
                `"${product.unit || 'pcs'}"`,
                `"${product.hsn || ''}"`,
                product.taxRate || 0,
                `"${product.barcode || ''}"`,
                `"${product.sku || ''}"`,
                `"${product.description || ''}"`,
                product.minStock || 10,
                product.maxStock || 1000
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * Generate unique SKU
     * @param {Object} product - Product data
     * @returns {string} Generated SKU
     */
    generateSKU(product) {
        const category = (product.category || 'GEN').substring(0, 3).toUpperCase();
        const name = product.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        const timestamp = Date.now().toString().slice(-6);
        
        return `${category}${name}${timestamp}`;
    }

    /**
     * Process and optimize product image
     * @param {string|File} image - Image data or file
     * @returns {Promise<string>} Processed image data
     */
    async processProductImage(image) {
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
                            
                            // Set max dimensions for product images
                            const maxWidth = 300;
                            const maxHeight = 300;
                            
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
            console.error('Failed to process product image:', error);
            throw new Error('Failed to process product image');
        }
    }

    /**
     * Setup stock monitoring
     */
    setupStockMonitoring() {
        // Check low stock every 5 minutes
        setInterval(() => {
            this.checkLowStock();
        }, 5 * 60 * 1000);

        // Daily stock report (if enabled in settings)
        const now = new Date();
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
        
        setTimeout(() => {
            this.generateDailyStockReport();
            // Then run every 24 hours
            setInterval(() => {
                this.generateDailyStockReport();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    /**
     * Generate daily stock report
     */
    generateDailyStockReport() {
        try {
            const products = this.getActiveProducts();
            const lowStock = this.getLowStockProducts();
            const outOfStock = products.filter(p => p.stock === 0);
            
            const report = {
                date: new Date().toISOString().split('T')[0],
                totalProducts: products.length,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
                totalStockValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
                lowStockProducts: lowStock.map(p => ({
                    id: p.id,
                    name: p.name,
                    stock: p.stock,
                    minStock: p.minStock
                })),
                outOfStockProducts: outOfStock.map(p => ({
                    id: p.id,
                    name: p.name
                }))
            };

            // Store report
            const reports = this.dataManager.getItem('stockReports') || [];
            reports.push(report);
            
            // Keep only last 30 days of reports
            if (reports.length > 30) {
                reports.splice(0, reports.length - 30);
            }
            
            this.dataManager.setItem('stockReports', reports);
            
            // Notify about low stock
            if (lowStock.length > 0 || outOfStock.length > 0) {
                console.warn(`Daily Stock Alert: ${lowStock.length} low stock, ${outOfStock.length} out of stock`);
            }
            
        } catch (error) {
            console.error('Failed to generate daily stock report:', error);
        }
    }

    /**
     * Validate product data
     * @param {Object} productData - Product data to validate
     * @param {string} excludeId - Product ID to exclude from duplicate checks
     * @returns {Object} Validation result
     */
    validateProductData(productData, excludeId = null) {
        const errors = [];
        const warnings = [];

        // Validate using field validators
        Object.keys(this.validators).forEach(field => {
            if (productData[field] !== undefined) {
                const validation = this.validators[field](productData[field]);
                if (!validation.valid) {
                    errors.push(validation.message);
                }
            }
        });

        // Check required fields
        if (!productData.name || !productData.name.trim()) {
            errors.push('Product name is required');
        }

        if (productData.price === undefined || productData.price === null || productData.price < 0) {
            errors.push('Product price is required and must be non-negative');
        }

        // Warn about missing category
        if (!productData.category) {
            warnings.push('Product category is not set');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if barcode already exists
     * @param {string} barcode - Barcode to check
     * @param {string} excludeId - Product ID to exclude
     * @returns {boolean} Barcode exists
     */
    isBarcodeExists(barcode, excludeId = null) {
        return this.products.some(p => 
            p.id !== excludeId && 
            p.barcode && 
            p.barcode.toUpperCase() === barcode.toUpperCase()
        );
    }

    /**
     * Check if product name exists in category
     * @param {string} name - Product name
     * @param {string} category - Product category
     * @param {string} excludeId - Product ID to exclude
     * @returns {boolean} Product name exists
     */
    isProductNameExists(name, category, excludeId = null) {
        return this.products.some(p => 
            p.id !== excludeId && 
            p.name.toLowerCase().trim() === name.toLowerCase().trim() &&
            p.category === category
        );
    }

    /**
     * Track product-related events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackProductEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'productManager',
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track product event:', error);
        }
    }

    /**
     * Get product statistics
     * @returns {Object} Product statistics
     */
    getProductStatistics() {
        const products = this.getActiveProducts();
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
        const categoryCounts = {};
        const categoryValues = {};
        
        products.forEach(product => {
            const cat = product.category || 'Uncategorized';
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            categoryValues[cat] = (categoryValues[cat] || 0) + (product.stock * product.price);
        });

        return {
            totalProducts: products.length,
            totalStockValue: totalValue,
            averagePrice: products.length > 0 ? totalValue / products.reduce((sum, p) => sum + p.stock, 0) : 0,
            lowStockCount: this.lowStockProducts.length,
            outOfStockCount: products.filter(p => p.stock === 0).length,
            categoryCounts,
            categoryValues,
            topCategories: Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            topValueCategories: Object.entries(categoryValues)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }
}

// Create and export global ProductManager instance
window.ProductManager = new ProductManager();

console.log('📦 UnifyX Bill Maker ProductManager Loaded Successfully!');
