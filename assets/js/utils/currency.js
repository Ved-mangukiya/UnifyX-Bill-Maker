/**
 * ⚡️ UnifyX Bill Maker - Currency Utilities
 * Multi-currency support and formatting
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class CurrencyUtils {
    constructor() {
        this.currencies = {
            INR: {
                symbol: '₹',
                code: 'INR',
                name: 'Indian Rupee',
                decimals: 2,
                locale: 'en-IN'
            },
            USD: {
                symbol: '$',
                code: 'USD',
                name: 'US Dollar',
                decimals: 2,
                locale: 'en-US'
            },
            EUR: {
                symbol: '€',
                code: 'EUR',
                name: 'Euro',
                decimals: 2,
                locale: 'de-DE'
            },
            GBP: {
                symbol: '£',
                code: 'GBP',
                name: 'British Pound',
                decimals: 2,
                locale: 'en-GB'
            },
            JPY: {
                symbol: '¥',
                code: 'JPY',
                name: 'Japanese Yen',
                decimals: 0,
                locale: 'ja-JP'
            },
            AUD: {
                symbol: 'A$',
                code: 'AUD',
                name: 'Australian Dollar',
                decimals: 2,
                locale: 'en-AU'
            },
            CAD: {
                symbol: 'C$',
                code: 'CAD',
                name: 'Canadian Dollar',
                decimals: 2,
                locale: 'en-CA'
            },
            SGD: {
                symbol: 'S$',
                code: 'SGD',
                name: 'Singapore Dollar',
                decimals: 2,
                locale: 'en-SG'
            }
        };

        this.defaultCurrency = 'INR';
        this.exchangeRates = {
            INR: 1,
            USD: 0.012,
            EUR: 0.011,
            GBP: 0.0095,
            JPY: 1.79,
            AUD: 0.018,
            CAD: 0.016,
            SGD: 0.016
        };

        console.log('💱 CurrencyUtils initialized');
    }

    /**
     * Get currency information
     */
    getCurrency(code) {
        return this.currencies[code.toUpperCase()] || this.currencies[this.defaultCurrency];
    }

    /**
     * Get all supported currencies
     */
    getAllCurrencies() {
        return Object.values(this.currencies);
    }

    /**
     * Format amount in specified currency
     */
    format(amount, currencyCode = this.defaultCurrency, options = {}) {
        const currency = this.getCurrency(currencyCode);
        const value = parseFloat(amount) || 0;

        const {
            showSymbol = true,
            minimumFractionDigits = currency.decimals,
            maximumFractionDigits = currency.decimals
        } = options;

        if (showSymbol) {
            return new Intl.NumberFormat(currency.locale, {
                style: 'currency',
                currency: currency.code,
                minimumFractionDigits,
                maximumFractionDigits
            }).format(value);
        } else {
            return new Intl.NumberFormat(currency.locale, {
                minimumFractionDigits,
                maximumFractionDigits
            }).format(value);
        }
    }

    /**
     * Parse currency string to number
     */
    parse(currencyString) {
        if (typeof currencyString === 'number') {
            return currencyString;
        }

        if (typeof currencyString !== 'string') {
            return 0;
        }

        // Remove all non-numeric characters except decimal point and minus
        const cleaned = currencyString.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Convert between currencies
     */
    convert(amount, fromCurrency, toCurrency) {
        const value = parseFloat(amount) || 0;
        const fromRate = this.exchangeRates[fromCurrency.toUpperCase()] || 1;
        const toRate = this.exchangeRates[toCurrency.toUpperCase()] || 1;

        // Convert to INR first, then to target currency
        const inrAmount = value / fromRate;
        const convertedAmount = inrAmount * toRate;

        return parseFloat(convertedAmount.toFixed(4));
    }

    /**
     * Get exchange rate between currencies
     */
    getExchangeRate(fromCurrency, toCurrency) {
        const fromRate = this.exchangeRates[fromCurrency.toUpperCase()] || 1;
        const toRate = this.exchangeRates[toCurrency.toUpperCase()] || 1;

        return parseFloat((toRate / fromRate).toFixed(6));
    }

    /**
     * Update exchange rates
     */
    updateExchangeRates(rates) {
        this.exchangeRates = { ...this.exchangeRates, ...rates };
    }

    /**
     * Format amount in words (Indian system)
     */
    formatInWords(amount, currencyCode = this.defaultCurrency) {
        const currency = this.getCurrency(currencyCode);
        const value = parseFloat(amount) || 0;

        if (currencyCode === 'INR') {
            return this.formatIndianRupeesInWords(value);
        } else {
            return this.formatGenericAmountInWords(value, currency);
        }
    }

    /**
     * Format Indian Rupees in words
     */
    formatIndianRupeesInWords(amount) {
        const ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];

        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];

        function convertHundreds(num) {
            let result = '';
            
            if (num > 99) {
                result += ones[Math.floor(num / 100)] + ' Hundred ';
                num %= 100;
            }
            
            if (num > 19) {
                result += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            }
            
            if (num > 0) {
                result += ones[num] + ' ';
            }
            
            return result;
        }

        if (amount === 0) return 'Zero Rupees Only';

        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);

        let result = '';

        // Crores
        if (rupees >= 10000000) {
            result += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore ';
            amount %= 10000000;
        }

        // Lakhs
        if (rupees >= 100000) {
            result += convertHundreds(Math.floor(rupees / 100000)) + 'Lakh ';
            amount %= 100000;
        }

        // Thousands
        if (rupees >= 1000) {
            result += convertHundreds(Math.floor(rupees / 1000)) + 'Thousand ';
            amount %= 1000;
        }

        // Hundreds
        if (rupees > 0) {
            result += convertHundreds(rupees);
        }

        result += 'Rupees';

        if (paise > 0) {
            result += ' and ' + convertHundreds(paise) + 'Paise';
        }

        return result.trim() + ' Only';
    }

    /**
     * Format generic amount in words
     */
    formatGenericAmountInWords(amount, currency) {
        // Simplified version - you can expand this
        const rounded = Math.round(amount);
        return `${rounded} ${currency.name} Only`;
    }

    /**
     * Validate currency code
     */
    isValidCurrency(code) {
        return this.currencies.hasOwnProperty(code.toUpperCase());
    }

    /**
     * Get currency symbol
     */
    getSymbol(currencyCode) {
        const currency = this.getCurrency(currencyCode);
        return currency.symbol;
    }

    /**
     * Format for input fields
     */
    formatForInput(amount, currencyCode = this.defaultCurrency) {
        const currency = this.getCurrency(currencyCode);
        const value = parseFloat(amount) || 0;

        return new Intl.NumberFormat(currency.locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: currency.decimals
        }).format(value);
    }

    /**
     * Create currency formatter function
     */
    createFormatter(currencyCode, options = {}) {
        const currency = this.getCurrency(currencyCode);
        
        return (amount) => {
            return this.format(amount, currencyCode, options);
        };
    }

    /**
     * Calculate tax in different currencies
     */
    calculateTaxInCurrency(amount, taxRate, currencyCode) {
        const value = parseFloat(amount) || 0;
        const rate = parseFloat(taxRate) || 0;
        const taxAmount = (value * rate) / 100;

        return {
            originalAmount: this.format(value, currencyCode),
            taxAmount: this.format(taxAmount, currencyCode),
            totalAmount: this.format(value + taxAmount, currencyCode),
            currencyCode: currencyCode
        };
    }
}

// Export currency utilities
window.CurrencyUtils = new CurrencyUtils();
console.log('💱 UnifyX CurrencyUtils loaded');
