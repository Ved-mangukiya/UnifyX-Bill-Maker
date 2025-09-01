/**
 * ⚡️ UnifyX Bill Maker - Analytics & Reporting System
 * Comprehensive business analytics, charts, reports, and data insights
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class Analytics {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.productManager = window.ProductManager;
        this.customerManager = window.CustomerManager;
        this.billingEngine = window.BillingEngine;
        
        // Analytics data storage
        this.analyticsData = [];
        this.reportCache = new Map();
        this.chartCache = new Map();
        
        // Report types
        this.reportTypes = {
            SALES: 'sales',
            INVENTORY: 'inventory',
            CUSTOMER: 'customer',
            PROFIT_LOSS: 'profit_loss',
            TAX: 'tax',
            DAILY_CLOSURE: 'daily_closure'
        };
        
        // Date ranges for reports
        this.dateRanges = {
            TODAY: 'today',
            YESTERDAY: 'yesterday',
            THIS_WEEK: 'this_week',
            LAST_WEEK: 'last_week',
            THIS_MONTH: 'this_month',
            LAST_MONTH: 'last_month',
            THIS_QUARTER: 'this_quarter',
            LAST_QUARTER: 'last_quarter',
            THIS_YEAR: 'this_year',
            LAST_YEAR: 'last_year',
            CUSTOM: 'custom'
        };
        
        // Load analytics data
        this.loadAnalyticsData();
        
        // Setup periodic report generation
        this.setupPeriodicReports();
        
        console.log('📊 Analytics initialized successfully!');
    }

    /**
     * Load analytics data from storage
     */
    loadAnalyticsData() {
        try {
            this.analyticsData = this.dataManager.getItem('analytics') || [];
            console.log(`Loaded ${this.analyticsData.length} analytics events`);
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.analyticsData = [];
        }
    }

    /**
     * Save analytics data to storage
     */
    saveAnalyticsData() {
        try {
            this.dataManager.setItem('analytics', this.analyticsData);
        } catch (error) {
            console.error('Failed to save analytics data:', error);
        }
    }

    /**
     * Track analytics event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    trackEvent(eventType, data = {}) {
        try {
            const event = {
                id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                type: eventType,
                data: data,
                timestamp: new Date().toISOString(),
                businessId: this.businessManager.getCurrentBusiness()?.id,
                sessionId: this.getSessionId()
            };

            this.analyticsData.push(event);

            // Keep only last 10000 events
            if (this.analyticsData.length > 10000) {
                this.analyticsData = this.analyticsData.slice(-10000);
            }

            this.saveAnalyticsData();
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }

    /**
     * Get session ID
     * @returns {string} Session ID
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        return this.sessionId;
    }

    /**
     * Generate sales analytics
     * @param {Object} options - Report options
     * @returns {Object} Sales analytics data
     */
    generateSalesAnalytics(options = {}) {
        try {
            const { dateRange = 'this_month', startDate, endDate } = options;
            const invoices = this.getInvoicesInDateRange(dateRange, startDate, endDate);
            
            const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.status === 'generated');
            
            // Basic metrics
            const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0);
            const totalInvoices = paidInvoices.length;
            const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
            
            // Sales by day
            const salesByDay = this.groupSalesByPeriod(paidInvoices, 'day');
            
            // Sales by category
            const salesByCategory = this.getSalesByCategory(paidInvoices);
            
            // Payment method breakdown
            const paymentMethods = this.getPaymentMethodBreakdown(paidInvoices);
            
            // Top products
            const topProducts = this.getTopProducts(paidInvoices, 10);
            
            // Growth metrics
            const growthMetrics = this.calculateGrowthMetrics(paidInvoices, dateRange);
            
            return {
                summary: {
                    totalRevenue,
                    totalInvoices,
                    averageOrderValue,
                    totalCustomers: new Set(paidInvoices.map(inv => inv.customerId).filter(Boolean)).size,
                    totalProducts: new Set(paidInvoices.flatMap(inv => inv.items?.map(item => item.productId) || [])).size
                },
                trends: {
                    salesByDay,
                    growthMetrics
                },
                breakdown: {
                    salesByCategory,
                    paymentMethods,
                    topProducts
                },
                dateRange: {
                    type: dateRange,
                    startDate: this.getDateRangeStart(dateRange, startDate),
                    endDate: this.getDateRangeEnd(dateRange, endDate)
                }
            };
        } catch (error) {
            console.error('Failed to generate sales analytics:', error);
            throw error;
        }
    }

    /**
     * Generate inventory analytics
     * @param {Object} options - Report options
     * @returns {Object} Inventory analytics data
     */
    generateInventoryAnalytics(options = {}) {
        try {
            const products = this.productManager.getActiveProducts();
            
            // Stock status analysis
            const inStock = products.filter(p => p.stock > 0);
            const lowStock = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 10));
            const outOfStock = products.filter(p => p.stock === 0);
            
            // Stock value analysis
            const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
            const avgStockValue = products.length > 0 ? totalStockValue / products.length : 0;
            
            // Category-wise stock
            const stockByCategory = this.getStockByCategory(products);
            
            // Top moving products (based on recent sales)
            const topMovingProducts = this.getTopMovingProducts(products, 30); // Last 30 days
            
            // Slow moving products
            const slowMovingProducts = this.getSlowMovingProducts(products, 90); // No sales in 90 days
            
            return {
                summary: {
                    totalProducts: products.length,
                    inStock: inStock.length,
                    lowStock: lowStock.length,
                    outOfStock: outOfStock.length,
                    totalStockValue,
                    averageStockValue: avgStockValue
                },
                analysis: {
                    stockByCategory,
                    topMovingProducts,
                    slowMovingProducts
                },
                alerts: {
                    lowStockProducts: lowStock.map(p => ({
                        id: p.id,
                        name: p.name,
                        currentStock: p.stock,
                        minStock: p.minStock || 10
                    })),
                    outOfStockProducts: outOfStock.map(p => ({
                        id: p.id,
                        name: p.name
                    }))
                }
            };
        } catch (error) {
            console.error('Failed to generate inventory analytics:', error);
            throw error;
        }
    }

    /**
     * Generate customer analytics
     * @param {Object} options - Report options
     * @returns {Object} Customer analytics data
     */
    generateCustomerAnalytics(options = {}) {
        try {
            const customers = this.customerManager.getActiveCustomers();
            const invoices = this.dataManager.getInvoices();
            
            // Customer metrics
            const totalCustomers = customers.length;
            const activeCustomers = customers.filter(c => c.lastPurchaseDate && 
                new Date(c.lastPurchaseDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            ).length;
            
            // Customer lifetime value
            const avgCustomerValue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / totalCustomers;
            
            // Top customers
            const topCustomers = customers
                .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                .slice(0, 10)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    totalSpent: c.totalSpent || 0,
                    invoiceCount: c.invoiceCount || 0,
                    loyaltyTier: c.loyaltyTier || 'Bronze',
                    lastPurchase: c.lastPurchaseDate
                }));
            
            // Customer acquisition trend
            const acquisitionTrend = this.getCustomerAcquisitionTrend(customers);
            
            // Loyalty tier distribution
            const loyaltyDistribution = this.getLoyaltyTierDistribution(customers);
            
            // Customer retention analysis
            const retentionAnalysis = this.getCustomerRetentionAnalysis(customers, invoices);
            
            return {
                summary: {
                    totalCustomers,
                    activeCustomers,
                    averageLifetimeValue: avgCustomerValue,
                    retentionRate: retentionAnalysis.retentionRate,
                    churnRate: retentionAnalysis.churnRate
                },
                trends: {
                    acquisitionTrend,
                    retentionAnalysis
                },
                segmentation: {
                    topCustomers,
                    loyaltyDistribution
                }
            };
        } catch (error) {
            console.error('Failed to generate customer analytics:', error);
            throw error;
        }
    }

    /**
     * Generate profit & loss report
     * @param {Object} options - Report options
     * @returns {Object} P&L data
     */
    generateProfitLossReport(options = {}) {
        try {
            const { dateRange = 'this_month', startDate, endDate } = options;
            const invoices = this.getInvoicesInDateRange(dateRange, startDate, endDate);
            
            const revenue = invoices
                .filter(inv => inv.status === 'paid' || inv.status === 'generated')
                .reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0);
            
            // Get expenses (placeholder - would need expense tracking)
            const expenses = this.getExpensesInDateRange(dateRange, startDate, endDate);
            
            const grossProfit = revenue - (expenses.cogs || 0);
            const netProfit = grossProfit - (expenses.operating || 0);
            const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
            
            return {
                revenue: {
                    total: revenue,
                    breakdown: this.getRevenueBreakdown(invoices)
                },
                expenses: {
                    cogs: expenses.cogs || 0,
                    operating: expenses.operating || 0,
                    total: (expenses.cogs || 0) + (expenses.operating || 0),
                    breakdown: expenses.breakdown || {}
                },
                profit: {
                    gross: grossProfit,
                    net: netProfit,
                    margin: profitMargin
                },
                dateRange: {
                    type: dateRange,
                    startDate: this.getDateRangeStart(dateRange, startDate),
                    endDate: this.getDateRangeEnd(dateRange, endDate)
                }
            };
        } catch (error) {
            console.error('Failed to generate P&L report:', error);
            throw error;
        }
    }

    /**
     * Generate tax report
     * @param {Object} options - Report options
     * @returns {Object} Tax report data
     */
    generateTaxReport(options = {}) {
        try {
            const { dateRange = 'this_month', startDate, endDate } = options;
            const invoices = this.getInvoicesInDateRange(dateRange, startDate, endDate);
            
            const taxInvoices = invoices.filter(inv => 
                (inv.status === 'paid' || inv.status === 'generated') && 
                inv.billType === 'tax_invoice'
            );
            
            const taxSummary = taxInvoices.reduce((acc, inv) => {
                const totals = inv.totals || {};
                return {
                    taxableValue: acc.taxableValue + (totals.taxableAmount || 0),
                    cgst: acc.cgst + (totals.cgst || 0),
                    sgst: acc.sgst + (totals.sgst || 0),
                    igst: acc.igst + (totals.igst || 0),
                    totalTax: acc.totalTax + (totals.totalTax || 0)
                };
            }, {
                taxableValue: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                totalTax: 0
            });
            
            // Tax rate wise breakdown
            const taxRateBreakdown = this.getTaxRateBreakdown(taxInvoices);
            
            // HSN wise summary
            const hsnSummary = this.getHSNwiseSummary(taxInvoices);
            
            return {
                summary: taxSummary,
                breakdown: {
                    byTaxRate: taxRateBreakdown,
                    byHSN: hsnSummary
                },
                invoiceCount: taxInvoices.length,
                dateRange: {
                    type: dateRange,
                    startDate: this.getDateRangeStart(dateRange, startDate),
                    endDate: this.getDateRangeEnd(dateRange, endDate)
                }
            };
        } catch (error) {
            console.error('Failed to generate tax report:', error);
            throw error;
        }
    }

    /**
     * Generate daily closure report
     * @param {Date} date - Date for closure
     * @returns {Object} Daily closure data
     */
    generateDailyClosureReport(date = new Date()) {
        try {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            const invoices = this.dataManager.getInvoices().filter(inv => {
                const invDate = new Date(inv.invoiceDate);
                return invDate >= startDate && invDate <= endDate;
            });
            
            const paidInvoices = invoices.filter(inv => inv.status === 'paid' || inv.status === 'generated');
            
            // Sales summary
            const salesSummary = {
                totalSales: paidInvoices.reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0),
                invoiceCount: paidInvoices.length,
                averageOrderValue: paidInvoices.length > 0 ? 
                    paidInvoices.reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0) / paidInvoices.length : 0
            };
            
            // Payment method breakdown
            const paymentBreakdown = this.getPaymentMethodBreakdown(paidInvoices);
            
            // Hourly sales distribution
            const hourlySales = this.getHourlySales(paidInvoices);
            
            // Top products of the day
            const topProducts = this.getTopProducts(paidInvoices, 5);
            
            return {
                date: date.toISOString().split('T')[0],
                sales: salesSummary,
                payments: paymentBreakdown,
                trends: {
                    hourlySales
                },
                products: {
                    topSelling: topProducts
                },
                invoices: {
                    generated: invoices.length,
                    paid: paidInvoices.length,
                    pending: invoices.filter(inv => inv.status === 'pending').length
                }
            };
        } catch (error) {
            console.error('Failed to generate daily closure report:', error);
            throw error;
        }
    }

    /**
     * Get chart data for analytics
     * @param {string} chartType - Type of chart
     * @param {Object} options - Chart options
     * @returns {Object} Chart data
     */
    getChartData(chartType, options = {}) {
        try {
            const cacheKey = `${chartType}_${JSON.stringify(options)}`;
            
            if (this.chartCache.has(cacheKey)) {
                return this.chartCache.get(cacheKey);
            }
            
            let chartData;
            
            switch (chartType) {
                case 'sales_trend':
                    chartData = this.getSalesTrendChart(options);
                    break;
                case 'revenue_by_category':
                    chartData = this.getRevenueByCategoryChart(options);
                    break;
                case 'top_products':
                    chartData = this.getTopProductsChart(options);
                    break;
                case 'customer_growth':
                    chartData = this.getCustomerGrowthChart(options);
                    break;
                case 'payment_methods':
                    chartData = this.getPaymentMethodsChart(options);
                    break;
                case 'profit_trend':
                    chartData = this.getProfitTrendChart(options);
                    break;
                default:
                    throw new Error(`Unknown chart type: ${chartType}`);
            }
            
            // Cache the result
            this.chartCache.set(cacheKey, chartData);
            
            return chartData;
            
        } catch (error) {
            console.error('Failed to get chart data:', error);
            throw error;
        }
    }

    /**
     * Get sales trend chart data
     * @param {Object} options - Chart options
     * @returns {Object} Chart data
     */
    getSalesTrendChart(options = {}) {
        const { dateRange = 'this_month' } = options;
        const invoices = this.getInvoicesInDateRange(dateRange);
        const salesByDay = this.groupSalesByPeriod(invoices, 'day');
        
        return {
            type: 'line',
            labels: Object.keys(salesByDay),
            datasets: [{
                label: 'Sales',
                data: Object.values(salesByDay),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4
            }]
        };
    }

    /**
     * Get revenue by category chart data
     * @param {Object} options - Chart options
     * @returns {Object} Chart data
     */
    getRevenueByCategoryChart(options = {}) {
        const { dateRange = 'this_month' } = options;
        const invoices = this.getInvoicesInDateRange(dateRange);
        const salesByCategory = this.getSalesByCategory(invoices);
        
        return {
            type: 'doughnut',
            labels: Object.keys(salesByCategory),
            datasets: [{
                data: Object.values(salesByCategory),
                backgroundColor: [
                    '#6366f1', '#10b981', '#f59e0b', '#ef4444',
                    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                ]
            }]
        };
    }

    /**
     * Setup periodic report generation
     */
    setupPeriodicReports() {
        // Generate daily reports at midnight
        const now = new Date();
        const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
        
        setTimeout(() => {
            this.generateAutomaticReports();
            // Then run every 24 hours
            setInterval(() => {
                this.generateAutomaticReports();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }

    /**
     * Generate automatic reports
     */
    generateAutomaticReports() {
        try {
            // Generate yesterday's closure report
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const closureReport = this.generateDailyClosureReport(yesterday);
            
            // Store the report
            const reports = this.dataManager.getItem('dailyReports') || [];
            reports.push({
                date: yesterday.toISOString().split('T')[0],
                report: closureReport,
                generatedAt: new Date().toISOString()
            });
            
            // Keep only last 30 days
            if (reports.length > 30) {
                reports.splice(0, reports.length - 30);
            }
            
            this.dataManager.setItem('dailyReports', reports);
            
            console.log(`Daily report generated for ${yesterday.toDateString()}`);
            
        } catch (error) {
            console.error('Failed to generate automatic reports:', error);
        }
    }

    /**
     * Helper method to get invoices in date range
     * @param {string} dateRange - Date range type
     * @param {string} startDate - Custom start date
     * @param {string} endDate - Custom end date
     * @returns {Array} Filtered invoices
     */
    getInvoicesInDateRange(dateRange, startDate, endDate) {
        const invoices = this.dataManager.getInvoices();
        const start = this.getDateRangeStart(dateRange, startDate);
        const end = this.getDateRangeEnd(dateRange, endDate);
        
        return invoices.filter(inv => {
            const invDate = new Date(inv.invoiceDate);
            return invDate >= start && invDate <= end;
        });
    }

    /**
     * Get date range start date
     * @param {string} dateRange - Date range type
     * @param {string} customStart - Custom start date
     * @returns {Date} Start date
     */
    getDateRangeStart(dateRange, customStart) {
        const now = new Date();
        
        switch (dateRange) {
            case 'today':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'yesterday':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            case 'this_week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                return startOfWeek;
            case 'this_month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'last_month':
                return new Date(now.getFullYear(), now.getMonth() - 1, 1);
            case 'this_year':
                return new Date(now.getFullYear(), 0, 1);
            case 'custom':
                return customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1);
            default:
                return new Date(now.getFullYear(), now.getMonth(), 1);
        }
    }

    /**
     * Get date range end date
     * @param {string} dateRange - Date range type
     * @param {string} customEnd - Custom end date
     * @returns {Date} End date
     */
    getDateRangeEnd(dateRange, customEnd) {
        const now = new Date();
        
        switch (dateRange) {
            case 'today':
            case 'yesterday':
                const date = dateRange === 'today' ? now : new Date(now.getTime() - 24 * 60 * 60 * 1000);
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
            case 'this_week':
                const endOfWeek = new Date(now);
                endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
                return endOfWeek;
            case 'this_month':
                return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            case 'last_month':
                return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            case 'this_year':
                return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            case 'custom':
                return customEnd ? new Date(customEnd) : now;
            default:
                return now;
        }
    }

    /**
     * Group sales by time period
     * @param {Array} invoices - Invoice array
     * @param {string} period - Time period (day, week, month)
     * @returns {Object} Grouped sales data
     */
    groupSalesByPeriod(invoices, period) {
        const grouped = {};
        
        invoices.forEach(inv => {
            if (inv.status !== 'paid' && inv.status !== 'generated') return;
            
            const date = new Date(inv.invoiceDate);
            let key;
            
            switch (period) {
                case 'day':
                    key = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split('T')[0];
                    break;
                case 'month':
                    key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default:
                    key = date.toISOString().split('T')[0];
            }
            
            grouped[key] = (grouped[key] || 0) + (inv.totals?.grandTotal || 0);
        });
        
        return grouped;
    }

    /**
     * Get sales by category
     * @param {Array} invoices - Invoice array
     * @returns {Object} Sales by category
     */
    getSalesByCategory(invoices) {
        const salesByCategory = {};
        
        invoices.forEach(inv => {
            if (inv.status !== 'paid' && inv.status !== 'generated') return;
            
            inv.items?.forEach(item => {
                const category = item.category || 'Uncategorized';
                salesByCategory[category] = (salesByCategory[category] || 0) + (item.quantity * item.rate);
            });
        });
        
        return salesByCategory;
    }

    /**
     * Get payment method breakdown
     * @param {Array} invoices - Invoice array
     * @returns {Object} Payment method breakdown
     */
    getPaymentMethodBreakdown(invoices) {
        const paymentMethods = {};
        
        invoices.forEach(inv => {
            const method = inv.paymentMethod || 'cash';
            paymentMethods[method] = (paymentMethods[method] || 0) + (inv.totals?.grandTotal || 0);
        });
        
        return paymentMethods;
    }

    /**
     * Get top products
     * @param {Array} invoices - Invoice array
     * @param {number} limit - Number of top products
     * @returns {Array} Top products
     */
    getTopProducts(invoices, limit = 10) {
        const productSales = {};
        
        invoices.forEach(inv => {
            inv.items?.forEach(item => {
                if (item.productId) {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = {
                            productId: item.productId,
                            name: item.name,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    
                    productSales[item.productId].quantity += item.quantity;
                    productSales[item.productId].revenue += item.quantity * item.rate;
                }
            });
        });
        
        return Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }

    /**
     * Get expenses in date range (placeholder for expense tracking)
     * @param {string} dateRange - Date range
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Object} Expenses data
     */
    getExpensesInDateRange(dateRange, startDate, endDate) {
        // Placeholder for expense tracking system
        return {
            cogs: 0,
            operating: 0,
            breakdown: {}
        };
    }

    /**
     * Calculate growth metrics
     * @param {Array} invoices - Current period invoices
     * @param {string} dateRange - Date range type
     * @returns {Object} Growth metrics
     */
    calculateGrowthMetrics(invoices, dateRange) {
        // Get previous period data for comparison
        const currentRevenue = invoices
            .filter(inv => inv.status === 'paid' || inv.status === 'generated')
            .reduce((sum, inv) => sum + (inv.totals?.grandTotal || 0), 0);
        
        // This is a simplified implementation
        // In production, you'd compare with actual previous period data
        
        return {
            revenueGrowth: 0, // Placeholder
            invoiceGrowth: 0, // Placeholder
            customerGrowth: 0 // Placeholder
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.reportCache.clear();
        this.chartCache.clear();
        console.log('Analytics cache cleared');
    }

    /**
     * Export analytics data
     * @param {string} format - Export format (json, csv)
     * @param {Object} data - Data to export
     * @returns {string} Exported data
     */
    exportAnalyticsData(format, data) {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return this.convertToCSV(data);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Convert data to CSV format
     * @param {Object} data - Data to convert
     * @returns {string} CSV data
     */
    convertToCSV(data) {
        // Simple CSV conversion - can be enhanced based on data structure
        if (Array.isArray(data)) {
            const headers = Object.keys(data[0] || {});
            const csvRows = [headers.join(',')];
            
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' ? `"${value}"` : value;
                });
                csvRows.push(values.join(','));
            });
            
            return csvRows.join('\n');
        }
        
        return JSON.stringify(data);
    }
}

// Create and export global Analytics instance
window.Analytics = new Analytics();

console.log('📊 UnifyX Bill Maker Analytics Loaded Successfully!');
