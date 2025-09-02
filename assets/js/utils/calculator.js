/**
 * ⚡️ UnifyX Bill Maker - Calculator Utilities
 * Mathematical calculations and business logic helpers
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class CalculatorUtils {
    constructor() {
        this.precision = 2;
        
        console.log('🧮 CalculatorUtils initialized');
    }

    /**
     * Add two numbers with precision
     */
    add(a, b) {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return parseFloat((numA + numB).toFixed(this.precision));
    }

    /**
     * Subtract two numbers with precision
     */
    subtract(a, b) {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return parseFloat((numA - numB).toFixed(this.precision));
    }

    /**
     * Multiply two numbers with precision
     */
    multiply(a, b) {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return parseFloat((numA * numB).toFixed(this.precision));
    }

    /**
     * Divide two numbers with precision
     */
    divide(a, b) {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        
        if (numB === 0) {
            throw new Error('Division by zero is not allowed');
        }
        
        return parseFloat((numA / numB).toFixed(this.precision));
    }

    /**
     * Calculate percentage
     */
    percentage(value, total) {
        const numValue = parseFloat(value) || 0;
        const numTotal = parseFloat(total) || 0;
        
        if (numTotal === 0) return 0;
        
        return parseFloat(((numValue / numTotal) * 100).toFixed(this.precision));
    }

    /**
     * Calculate percentage of a value
     */
    percentageOf(value, percentage) {
        const numValue = parseFloat(value) || 0;
        const numPercentage = parseFloat(percentage) || 0;
        
        return parseFloat(((numValue * numPercentage) / 100).toFixed(this.precision));
    }

    /**
     * Round number to specified decimal places
     */
    round(value, decimals = this.precision) {
        const num = parseFloat(value) || 0;
        return parseFloat(num.toFixed(decimals));
    }

    /**
     * Calculate GST amount
     */
    calculateGST(amount, gstRate) {
        const numAmount = parseFloat(amount) || 0;
        const numRate = parseFloat(gstRate) || 0;
        
        return this.percentageOf(numAmount, numRate);
    }

    /**
     * Calculate amount including GST
     */
    addGST(amount, gstRate) {
        const numAmount = parseFloat(amount) || 0;
        const gstAmount = this.calculateGST(numAmount, gstRate);
        
        return this.add(numAmount, gstAmount);
    }

    /**
     * Calculate amount excluding GST
     */
    removeGST(amountIncludingGST, gstRate) {
        const numAmount = parseFloat(amountIncludingGST) || 0;
        const numRate = parseFloat(gstRate) || 0;
        
        const baseAmount = numAmount / (1 + (numRate / 100));
        return this.round(baseAmount);
    }

    /**
     * Calculate discount amount
     */
    calculateDiscount(amount, discountPercent) {
        return this.percentageOf(amount, discountPercent);
    }

    /**
     * Apply discount to amount
     */
    applyDiscount(amount, discountPercent) {
        const numAmount = parseFloat(amount) || 0;
        const discountAmount = this.calculateDiscount(numAmount, discountPercent);
        
        return this.subtract(numAmount, discountAmount);
    }

    /**
     * Calculate compound interest
     */
    compoundInterest(principal, rate, time, frequency = 1) {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(rate) / 100;
        const t = parseFloat(time) || 0;
        const n = parseFloat(frequency) || 1;
        
        const amount = p * Math.pow((1 + r/n), n * t);
        return this.round(amount);
    }

    /**
     * Calculate simple interest
     */
    simpleInterest(principal, rate, time) {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(rate) / 100;
        const t = parseFloat(time) || 0;
        
        const interest = p * r * t;
        return this.round(interest);
    }

    /**
     * Calculate EMI (Equated Monthly Installment)
     */
    calculateEMI(principal, annualRate, months) {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(annualRate) / 100 / 12;
        const n = parseFloat(months) || 0;
        
        if (r === 0) return p / n;
        
        const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        return this.round(emi);
    }

    /**
     * Calculate profit margin
     */
    profitMargin(sellingPrice, costPrice) {
        const sp = parseFloat(sellingPrice) || 0;
        const cp = parseFloat(costPrice) || 0;
        
        if (cp === 0) return 0;
        
        const profit = this.subtract(sp, cp);
        return this.percentage(profit, sp);
    }

    /**
     * Calculate markup percentage
     */
    markupPercentage(sellingPrice, costPrice) {
        const sp = parseFloat(sellingPrice) || 0;
        const cp = parseFloat(costPrice) || 0;
        
        if (cp === 0) return 0;
        
        const markup = this.subtract(sp, cp);
        return this.percentage(markup, cp);
    }

    /**
     * Calculate invoice totals
     */
    calculateInvoiceTotals(items) {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        items.forEach(item => {
            const itemTotal = this.multiply(item.quantity, item.rate);
            const discount = this.calculateDiscount(itemTotal, item.discountPercent || 0);
            const taxableAmount = this.subtract(itemTotal, discount);
            const tax = this.calculateGST(taxableAmount, item.taxRate || 0);

            subtotal = this.add(subtotal, itemTotal);
            totalDiscount = this.add(totalDiscount, discount);
            totalTax = this.add(totalTax, tax);
        });

        const taxableAmount = this.subtract(subtotal, totalDiscount);
        const grandTotal = this.add(taxableAmount, totalTax);

        return {
            subtotal: this.round(subtotal),
            totalDiscount: this.round(totalDiscount),
            taxableAmount: this.round(taxableAmount),
            totalTax: this.round(totalTax),
            grandTotal: this.round(grandTotal)
        };
    }

    /**
     * Split GST into CGST and SGST
     */
    splitGST(gstAmount) {
        const amount = parseFloat(gstAmount) || 0;
        const half = this.divide(amount, 2);
        
        return {
            cgst: half,
            sgst: half,
            igst: 0
        };
    }

    /**
     * Calculate IGST for inter-state transactions
     */
    calculateIGST(amount, gstRate) {
        const gstAmount = this.calculateGST(amount, gstRate);
        
        return {
            cgst: 0,
            sgst: 0,
            igst: gstAmount
        };
    }

    /**
     * Generate amortization schedule
     */
    generateAmortizationSchedule(principal, annualRate, months) {
        const emi = this.calculateEMI(principal, annualRate, months);
        const monthlyRate = parseFloat(annualRate) / 100 / 12;
        
        const schedule = [];
        let remainingPrincipal = parseFloat(principal);

        for (let i = 1; i <= months; i++) {
            const interestAmount = this.multiply(remainingPrincipal, monthlyRate);
            const principalAmount = this.subtract(emi, interestAmount);
            remainingPrincipal = this.subtract(remainingPrincipal, principalAmount);

            schedule.push({
                month: i,
                emi: this.round(emi),
                principalAmount: this.round(principalAmount),
                interestAmount: this.round(interestAmount),
                remainingPrincipal: this.round(Math.max(0, remainingPrincipal))
            });
        }

        return schedule;
    }

    /**
     * Validate calculation inputs
     */
    validateInputs(...values) {
        for (const value of values) {
            if (value === null || value === undefined || isNaN(parseFloat(value))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Safe calculation wrapper
     */
    safeCalculate(operation, ...args) {
        try {
            if (!this.validateInputs(...args)) {
                throw new Error('Invalid input values');
            }
            
            return operation.apply(this, args);
        } catch (error) {
            console.error('Calculation error:', error);
            return 0;
        }
    }

    /**
     * Format number for display
     */
    formatNumber(value, options = {}) {
        const {
            minimumFractionDigits = this.precision,
            maximumFractionDigits = this.precision,
            useGrouping = true
        } = options;

        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits,
            maximumFractionDigits,
            useGrouping
        }).format(parseFloat(value) || 0);
    }
}

// Export calculator utilities
window.CalculatorUtils = new CalculatorUtils();
console.log('🧮 UnifyX CalculatorUtils loaded');
