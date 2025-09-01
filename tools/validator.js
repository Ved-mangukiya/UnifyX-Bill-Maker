/**
 * ⚡️ UnifyX Bill Maker - Code Validator & Unit Tests
 * Complete testing suite and validation for all modules
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class UnifyXValidator {
    constructor() {
        this.testResults = new Map();
        this.validationResults = new Map();
        this.modules = [
            'config', 'constants', 'app', 'dataManager', 'businessManager',
            'productManager', 'customerManager', 'billingEngine', 
            'pdfGenerator', 'analytics', 'keyboard', 'backup', 'ui'
        ];
        
        console.log('🧪 UnifyXValidator initialized successfully!');
    }

    /**
     * Run all validation tests
     */
    async runAllTests() {
        console.log('🚀 Starting UnifyX Bill Maker validation tests...\n');
        
        const startTime = Date.now();
        
        // Test each module
        for (const module of this.modules) {
            await this.testModule(module);
        }
        
        // Integration tests
        await this.runIntegrationTests();
        
        // Performance tests
        await this.runPerformanceTests();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Generate test report
        this.generateTestReport(duration);
        
        return this.getAllResults();
    }

    /**
     * Test individual module
     */
    async testModule(moduleName) {
        console.log(`📦 Testing ${moduleName}...`);
        
        const results = {
            module: moduleName,
            tests: [],
            passed: 0,
            failed: 0,
            startTime: Date.now()
        };

        try {
            switch (moduleName) {
                case 'config':
                    await this.testConfigModule(results);
                    break;
                case 'dataManager':
                    await this.testDataManagerModule(results);
                    break;
                case 'billingEngine':
                    await this.testBillingEngineModule(results);
                    break;
                case 'productManager':
                    await this.testProductManagerModule(results);
                    break;
                case 'customerManager':
                    await this.testCustomerManagerModule(results);
                    break;
                default:
                    await this.testGenericModule(moduleName, results);
            }
        } catch (error) {
            results.tests.push({
                name: `${moduleName} module loading`,
                status: 'failed',
                error: error.message
            });
            results.failed++;
        }

        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        
        this.testResults.set(moduleName, results);
        
        const passRate = results.tests.length > 0 ? 
            Math.round((results.passed / results.tests.length) * 100) : 0;
            
        console.log(`  ✅ ${results.passed} passed, ❌ ${results.failed} failed (${passRate}% pass rate)\n`);
    }

    /**
     * Test Config Module
     */
    async testConfigModule(results) {
        // Test 1: AppConfig exists and is properly initialized
        this.addTest(results, 'AppConfig initialization', () => {
            return window.AppConfig !== undefined && 
                   window.AppConfig.version !== undefined &&
                   window.AppConfig.get !== undefined;
        });

        // Test 2: Configuration values are accessible
        this.addTest(results, 'Configuration values access', () => {
            const currencies = window.AppConfig.getCurrencies();
            return Array.isArray(currencies) && currencies.length > 0;
        });

        // Test 3: Theme configuration works
        this.addTest(results, 'Theme configuration', () => {
            const themes = window.AppConfig.get('ui.theme.options');
            return Array.isArray(themes) && themes.includes('light') && themes.includes('dark');
        });

        // Test 4: Currency formatting
        this.addTest(results, 'Currency formatting', () => {
            const inrCurrency = window.AppConfig.getCurrency('INR');
            return inrCurrency && inrCurrency.symbol === '₹' && inrCurrency.decimals === 2;
        });
    }

    /**
     * Test DataManager Module
     */
    async testDataManagerModule(results) {
        // Test 1: DataManager initialization
        this.addTest(results, 'DataManager initialization', () => {
            return window.DataManager !== undefined &&
                   typeof window.DataManager.setItem === 'function' &&
                   typeof window.DataManager.getItem === 'function';
        });

        // Test 2: Data storage and retrieval
        this.addTest(results, 'Data storage and retrieval', () => {
            const testData = { test: 'value', number: 123 };
            window.DataManager.setItem('test_key', testData);
            const retrieved = window.DataManager.getItem('test_key');
            
            return retrieved && 
                   retrieved.test === 'value' && 
                   retrieved.number === 123;
        });

        // Test 3: Backup creation
        this.addTest(results, 'Backup functionality', () => {
            const backup = window.DataManager.createBackup();
            return backup && 
                   backup.metadata !== undefined &&
                   backup.data !== undefined;
        });

        // Test 4: Data validation
        this.addTest(results, 'Data integrity check', () => {
            const integrity = window.DataManager.verifyDataIntegrity();
            return integrity && typeof integrity.isValid === 'boolean';
        });
    }

    /**
     * Test BillingEngine Module
     */
    async testBillingEngineModule(results) {
        // Test 1: BillingEngine initialization
        this.addTest(results, 'BillingEngine initialization', () => {
            return window.BillingEngine !== undefined &&
                   typeof window.BillingEngine.createNewInvoice === 'function';
        });

        // Test 2: Invoice creation
        this.addTest(results, 'Invoice creation', async () => {
            const invoice = await window.BillingEngine.createNewInvoice({
                customerId: 'test_customer',
                invoiceDate: '2025-09-01'
            });
            
            return invoice && 
                   invoice.id !== undefined &&
                   invoice.status === 'draft';
        });

        // Test 3: Item calculation
        this.addTest(results, 'Tax calculation', () => {
            const testItem = {
                quantity: 2,
                rate: 100,
                discountPercent: 10,
                taxRate: 18
            };
            
            window.BillingEngine.calculateItemTotals(testItem);
            
            // Expected: (2 * 100) - 10% = 180, Tax = 18% of 180 = 32.4, Total = 212.4
            return Math.abs(testItem.taxableAmount - 180) < 0.01 &&
                   Math.abs(testItem.totalTax - 32.4) < 0.01 &&
                   Math.abs(testItem.total - 212.4) < 0.01;
        });

        // Test 4: Multi-bill mode
        this.addTest(results, 'Multi-bill functionality', () => {
            window.BillingEngine.enableMultiBillMode();
            const isEnabled = window.BillingEngine.multiBillMode === true;
            window.BillingEngine.disableMultiBillMode();
            
            return isEnabled && window.BillingEngine.multiBillMode === false;
        });
    }

    /**
     * Test ProductManager Module
     */
    async testProductManagerModule(results) {
        // Test 1: ProductManager initialization
        this.addTest(results, 'ProductManager initialization', () => {
            return window.ProductManager !== undefined &&
                   typeof window.ProductManager.createProduct === 'function';
        });

        // Test 2: Product creation
        this.addTest(results, 'Product creation', async () => {
            const productData = {
                name: 'Test Product',
                price: 99.99,
                stock: 100,
                category: 'electronics',
                taxRate: 18
            };
            
            const product = await window.ProductManager.createProduct(productData);
            
            return product && 
                   product.id !== undefined &&
                   product.name === 'Test Product' &&
                   product.price === 99.99;
        });

        // Test 3: Stock management
        this.addTest(results, 'Stock management', async () => {
            const products = window.ProductManager.getActiveProducts();
            if (products.length === 0) return true; // Skip if no products
            
            const product = products[0];
            const initialStock = product.stock;
            
            await window.ProductManager.updateStock(product.id, -5, 'sale', 'Test sale');
            const updatedProduct = window.ProductManager.getProductById(product.id);
            
            return updatedProduct.stock === initialStock - 5;
        });

        // Test 4: Product search
        this.addTest(results, 'Product search', () => {
            const searchResults = window.ProductManager.searchProducts({ query: 'test' });
            return Array.isArray(searchResults);
        });
    }

    /**
     * Test CustomerManager Module
     */
    async testCustomerManagerModule(results) {
        // Test 1: CustomerManager initialization
        this.addTest(results, 'CustomerManager initialization', () => {
            return window.CustomerManager !== undefined &&
                   typeof window.CustomerManager.createCustomer === 'function';
        });

        // Test 2: Customer creation
        this.addTest(results, 'Customer creation', async () => {
            const customerData = {
                name: 'Test Customer',
                phone: '9876543210',
                email: 'test@example.com'
            };
            
            const customer = await window.CustomerManager.createCustomer(customerData);
            
            return customer && 
                   customer.id !== undefined &&
                   customer.name === 'Test Customer' &&
                   customer.loyaltyPoints === 0;
        });

        // Test 3: Loyalty points calculation
        this.addTest(results, 'Loyalty points system', () => {
            const tier = window.CustomerManager.calculateLoyaltyTier(75000);
            return tier === 'Silver'; // 75k should be Silver tier
        });

        // Test 4: Customer search
        this.addTest(results, 'Customer search', () => {
            const searchResults = window.CustomerManager.searchCustomers({ query: 'test' });
            return Array.isArray(searchResults);
        });
    }

    /**
     * Test generic module
     */
    async testGenericModule(moduleName, results) {
        const moduleWindow = `window.${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`;
        
        // Test 1: Module exists
        this.addTest(results, `${moduleName} module exists`, () => {
            return eval(moduleWindow) !== undefined;
        });

        // Test 2: Module has constructor
        this.addTest(results, `${moduleName} is properly constructed`, () => {
            const module = eval(moduleWindow);
            return typeof module === 'object' && module.constructor !== undefined;
        });
    }

    /**
     * Run integration tests
     */
    async runIntegrationTests() {
        console.log('🔗 Running integration tests...');
        
        const results = {
            module: 'integration',
            tests: [],
            passed: 0,
            failed: 0,
            startTime: Date.now()
        };

        // Test 1: Module inter-communication
        this.addTest(results, 'Modules can communicate', () => {
            return window.DataManager !== undefined &&
                   window.BillingEngine !== undefined &&
                   window.BillingEngine.dataManager === window.DataManager;
        });

        // Test 2: Complete workflow
        this.addTest(results, 'Complete billing workflow', async () => {
            try {
                // Create business
                if (!window.BusinessManager.getCurrentBusiness()) {
                    await window.BusinessManager.createBusiness({
                        name: 'Test Business',
                        address: 'Test Address',
                        phone: '1234567890'
                    });
                }

                // Create customer
                const customer = await window.CustomerManager.createCustomer({
                    name: 'Integration Test Customer',
                    phone: '9876543210'
                });

                // Create product
                const product = await window.ProductManager.createProduct({
                    name: 'Integration Test Product',
                    price: 100,
                    stock: 10,
                    taxRate: 18
                });

                // Create invoice
                const invoice = await window.BillingEngine.createNewInvoice({
                    customerId: customer.id
                });

                // Add item
                await window.BillingEngine.addItem({
                    productId: product.id,
                    quantity: 2
                });

                return invoice && 
                       window.BillingEngine.invoiceItems.length > 0 &&
                       window.BillingEngine.invoiceTotals.grandTotal > 0;
            } catch (error) {
                console.error('Integration test failed:', error);
                return false;
            }
        });

        // Test 3: Keyboard shortcuts integration
        this.addTest(results, 'Keyboard shortcuts work', () => {
            return window.KeyboardManager !== undefined &&
                   window.KeyboardManager.shortcuts.size > 0;
        });

        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        this.testResults.set('integration', results);
        
        console.log(`  ✅ ${results.passed} passed, ❌ ${results.failed} failed\n`);
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        console.log('⚡ Running performance tests...');
        
        const results = {
            module: 'performance',
            tests: [],
            passed: 0,
            failed: 0,
            startTime: Date.now()
        };

        // Test 1: Data operations performance
        this.addTest(results, 'Data operations under 100ms', () => {
            const start = Date.now();
            
            // Perform multiple data operations
            for (let i = 0; i < 100; i++) {
                window.DataManager.setItem(`perf_test_${i}`, { data: `test_${i}` });
                window.DataManager.getItem(`perf_test_${i}`);
            }
            
            const duration = Date.now() - start;
            return duration < 100;
        });

        // Test 2: Search performance
        this.addTest(results, 'Product search under 50ms', () => {
            const start = Date.now();
            
            // Perform search operations
            for (let i = 0; i < 10; i++) {
                window.ProductManager.searchProducts({ query: 'test' });
            }
            
            const duration = Date.now() - start;
            return duration < 50;
        });

        // Test 3: Memory usage
        this.addTest(results, 'Memory usage reasonable', () => {
            // Check if we have performance API
            if (performance.memory) {
                const memoryUsed = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
                return memoryUsed < 50; // Less than 50MB
            }
            return true; // Skip test if not available
        });

        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        this.testResults.set('performance', results);
        
        console.log(`  ✅ ${results.passed} passed, ❌ ${results.failed} failed\n`);
    }

    /**
     * Add a test case
     */
    addTest(results, testName, testFunction) {
        try {
            const startTime = Date.now();
            const result = testFunction();
            const duration = Date.now() - startTime;
            
            // Handle async functions
            if (result instanceof Promise) {
                result.then(asyncResult => {
                    const asyncDuration = Date.now() - startTime;
                    this.recordTestResult(results, testName, asyncResult, null, asyncDuration);
                }).catch(error => {
                    const asyncDuration = Date.now() - startTime;
                    this.recordTestResult(results, testName, false, error.message, asyncDuration);
                });
                return;
            }
            
            this.recordTestResult(results, testName, result, null, duration);
            
        } catch (error) {
            this.recordTestResult(results, testName, false, error.message, 0);
        }
    }

    /**
     * Record test result
     */
    recordTestResult(results, testName, passed, error, duration) {
        const testResult = {
            name: testName,
            status: passed ? 'passed' : 'failed',
            duration: duration,
            error: error
        };
        
        results.tests.push(testResult);
        
        if (passed) {
            results.passed++;
        } else {
            results.failed++;
        }
    }

    /**
     * Generate test report
     */
    generateTestReport(totalDuration) {
        console.log('📋 UNIFYХ BILL MAKER - TEST REPORT');
        console.log('=' .repeat(50));
        
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        
        // Module results
        for (const [moduleName, result] of this.testResults.entries()) {
            totalTests += result.tests.length;
            totalPassed += result.passed;
            totalFailed += result.failed;
            
            console.log(`\n📦 ${moduleName.toUpperCase()}`);
            console.log(`  Tests: ${result.tests.length}, Passed: ${result.passed}, Failed: ${result.failed}`);
            console.log(`  Duration: ${result.duration}ms`);
            
            // Show failed tests
            const failedTests = result.tests.filter(t => t.status === 'failed');
            if (failedTests.length > 0) {
                console.log('  ❌ Failed tests:');
                failedTests.forEach(test => {
                    console.log(`    - ${test.name}: ${test.error || 'Unknown error'}`);
                });
            }
        }
        
        // Overall results
        const passRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
        
        console.log('\n' + '=' .repeat(50));
        console.log('📊 OVERALL RESULTS');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${totalPassed} ✅`);
        console.log(`Failed: ${totalFailed} ❌`);
        console.log(`Pass Rate: ${passRate}%`);
        console.log(`Total Duration: ${totalDuration}ms`);
        
        // Final verdict
        if (passRate >= 95) {
            console.log('\n🎉 EXCELLENT! UnifyX Bill Maker is ready for production!');
        } else if (passRate >= 85) {
            console.log('\n✅ GOOD! UnifyX Bill Maker is mostly ready, minor fixes needed.');
        } else if (passRate >= 70) {
            console.log('\n⚠️  FAIR! UnifyX Bill Maker needs some improvements.');
        } else {
            console.log('\n❌ POOR! UnifyX Bill Maker needs significant fixes before use.');
        }
        
        console.log('=' .repeat(50));
    }

    /**
     * Get all test results
     */
    getAllResults() {
        const results = {};
        for (const [key, value] of this.testResults.entries()) {
            results[key] = value;
        }
        return results;
    }

    /**
     * Validate code quality
     */
    validateCodeQuality() {
        console.log('🔍 Validating code quality...\n');
        
        const checks = [
            {
                name: 'All modules loaded',
                check: () => this.modules.every(module => {
                    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);
                    return window[moduleName] !== undefined;
                })
            },
            {
                name: 'No global variable pollution',
                check: () => {
                    // Check for unexpected global variables
                    const expectedGlobals = [
                        'AppConfig', 'AppConstants', 'UnifyXApp', 'DataManager',
                        'BusinessManager', 'ProductManager', 'CustomerManager',
                        'BillingEngine', 'PDFGenerator', 'Analytics', 
                        'KeyboardManager', 'BackupManager', 'UIManager'
                    ];
                    
                    let pollutionCount = 0;
                    for (let prop in window) {
                        if (prop.startsWith('unifyX') || prop.startsWith('UnifyX')) {
                            if (!expectedGlobals.some(expected => prop.includes(expected))) {
                                pollutionCount++;
                            }
                        }
                    }
                    
                    return pollutionCount === 0;
                }
            },
            {
                name: 'Error handling present',
                check: () => {
                    // Check if modules have proper error handling
                    return window.DataManager.handleStorageError !== undefined &&
                           window.BillingEngine.trackBillingEvent !== undefined;
                }
            },
            {
                name: 'Memory leaks check',
                check: () => {
                    // Basic memory leak check
                    const initialMemory = performance.memory ? 
                        performance.memory.usedJSHeapSize : 0;
                    
                    // Perform some operations
                    for (let i = 0; i < 100; i++) {
                        window.DataManager.setItem(`leak_test_${i}`, { data: i });
                    }
                    
                    // Clean up
                    for (let i = 0; i < 100; i++) {
                        window.DataManager.removeItem(`leak_test_${i}`);
                    }
                    
                    const finalMemory = performance.memory ? 
                        performance.memory.usedJSHeapSize : 0;
                    
                    // Memory should not increase significantly
                    return !performance.memory || (finalMemory - initialMemory) < 1024 * 1024; // 1MB threshold
                }
            }
        ];
        
        checks.forEach(({ name, check }) => {
            try {
                const passed = check();
                console.log(`${passed ? '✅' : '❌'} ${name}`);
            } catch (error) {
                console.log(`❌ ${name} - Error: ${error.message}`);
            }
        });
    }
}

// Jest-style unit tests for individual functions
const jestStyleTests = {
    // Test suite for BillingEngine
    billingEngineTests: {
        'should calculate item totals correctly': () => {
            const item = {
                quantity: 2,
                rate: 100,
                discountPercent: 10,
                taxRate: 18
            };
            
            window.BillingEngine.calculateItemTotals(item);
            
            // Expectations
            expect(item.taxableAmount).toBeCloseTo(180, 2);
            expect(item.totalTax).toBeCloseTo(32.4, 2);
            expect(item.total).toBeCloseTo(212.4, 2);
        },
        
        'should throw error when generating empty invoice': () => {
            window.BillingEngine.currentInvoice = { items: [] };
            window.BillingEngine.invoiceItems = [];
            
            expect(() => {
                window.BillingEngine.generateInvoice();
            }).toThrow();
        }
    },
    
    // Test suite for DataManager
    dataManagerTests: {
        'should store and retrieve data correctly': () => {
            const testData = { name: 'Test', value: 123 };
            window.DataManager.setItem('test_key', testData);
            const retrieved = window.DataManager.getItem('test_key');
            
            expect(retrieved).toEqual(testData);
        },
        
        'should return null for non-existent key': () => {
            const result = window.DataManager.getItem('non_existent_key_xyz');
            expect(result).toBeNull();
        }
    },
    
    // Test suite for ProductManager
    productManagerTests: {
        'should validate product data correctly': () => {
            const validProduct = {
                name: 'Test Product',
                price: 99.99,
                stock: 10
            };
            
            const validation = window.ProductManager.validateProductData(validProduct);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        },
        
        'should reject invalid product data': () => {
            const invalidProduct = {
                name: '',  // Invalid: empty name
                price: -10, // Invalid: negative price
            };
            
            const validation = window.ProductManager.validateProductData(invalidProduct);
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        }
    }
};

// Simple expect function for tests
function expect(actual) {
    return {
        toBe: (expected) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
        },
        toEqual: (expected) => {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
        },
        toBeCloseTo: (expected, precision = 2) => {
            const diff = Math.abs(actual - expected);
            const tolerance = Math.pow(10, -precision);
            if (diff > tolerance) {
                throw new Error(`Expected ${actual} to be close to ${expected} within ${tolerance}`);
            }
        },
        toThrow: () => {
            let thrown = false;
            try {
                if (typeof actual === 'function') {
                    actual();
                }
            } catch (e) {
                thrown = true;
            }
            if (!thrown) {
                throw new Error('Expected function to throw an error');
            }
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null, but got ${actual}`);
            }
        },
        toHaveLength: (expectedLength) => {
            if (!actual || actual.length !== expectedLength) {
                throw new Error(`Expected length ${expectedLength}, but got ${actual ? actual.length : 'undefined'}`);
            }
        },
        toBeGreaterThan: (expected) => {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        }
    };
}

// Create and export global validator instance
window.UnifyXValidator = new UnifyXValidator();

// Auto-run tests when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.UnifyXValidator.runAllTests();
        }, 2000); // Wait 2 seconds for all modules to load
    });
} else {
    setTimeout(() => {
        window.UnifyXValidator.runAllTests();
    }, 2000);
}

console.log('🧪 UnifyX Bill Maker Validator Loaded Successfully!');
