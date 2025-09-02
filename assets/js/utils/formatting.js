/**
 * ⚡️ UnifyX Bill Maker - Formatting Utilities
 * Text, number, and date formatting helpers
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class FormattingUtils {
    constructor() {
        this.dateFormats = {
            short: 'dd/MM/yyyy',
            medium: 'dd MMM yyyy',
            long: 'dd MMMM yyyy',
            full: 'EEEE, dd MMMM yyyy'
        };

        console.log('📝 FormattingUtils initialized');
    }

    /**
     * Format date in various formats
     */
    formatDate(date, format = 'medium', locale = 'en-IN') {
        if (!date) return '';

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: '2-digit', month: 'short', year: 'numeric' },
            long: { day: '2-digit', month: 'long', year: 'numeric' },
            full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
        };

        return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(dateObj);
    }

    /**
     * Format time
     */
    formatTime(date, format = '24', locale = 'en-IN') {
        if (!date) return '';

        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        const options = format === '12' 
            ? { hour: '2-digit', minute: '2-digit', hour12: true }
            : { hour: '2-digit', minute: '2-digit', hour12: false };

        return new Intl.DateTimeFormat(locale, options).format(dateObj);
    }

    /**
     * Format relative time (time ago)
     */
    formatRelativeTime(date, locale = 'en') {
        if (!date) return '';

        const now = new Date();
        const targetDate = new Date(date);
        const diffInMs = now - targetDate;
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

        if (diffInSeconds < 60) {
            return rtf.format(-diffInSeconds, 'second');
        } else if (diffInMinutes < 60) {
            return rtf.format(-diffInMinutes, 'minute');
        } else if (diffInHours < 24) {
            return rtf.format(-diffInHours, 'hour');
        } else if (diffInDays < 30) {
            return rtf.format(-diffInDays, 'day');
        } else {
            return this.formatDate(date);
        }
    }

    /**
     * Format number with custom options
     */
    formatNumber(number, options = {}) {
        const {
            minimumFractionDigits = 0,
            maximumFractionDigits = 2,
            useGrouping = true,
            locale = 'en-IN'
        } = options;

        const value = parseFloat(number) || 0;

        return new Intl.NumberFormat(locale, {
            minimumFractionDigits,
            maximumFractionDigits,
            useGrouping
        }).format(value);
    }

    /**
     * Format percentage
     */
    formatPercentage(value, decimals = 2, locale = 'en-IN') {
        const number = parseFloat(value) || 0;
        
        return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number / 100);
    }

    /**
     * Format phone number (Indian format)
     */
    formatPhoneNumber(phone, format = 'standard') {
        if (!phone) return '';

        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');

        // Handle different formats
        if (format === 'standard') {
            if (cleaned.length === 10) {
                return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
            } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
                return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
            }
        } else if (format === 'dots') {
            if (cleaned.length === 10) {
                return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6)}`;
            }
        } else if (format === 'brackets') {
            if (cleaned.length === 10) {
                return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
            }
        }

        return phone; // Return original if can't format
    }

    /**
     * Format GSTIN
     */
    formatGSTIN(gstin) {
        if (!gstin) return '';

        const cleaned = gstin.replace(/\s/g, '').toUpperCase();
        
        if (cleaned.length === 15) {
            return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}-${cleaned.substring(11, 12)}-${cleaned.substring(12, 13)}-${cleaned.substring(13, 14)}-${cleaned.substring(14)}`;
        }

        return gstin;
    }

    /**
     * Format address for display
     */
    formatAddress(addressObj, format = 'multiline') {
        if (!addressObj) return '';

        const {
            street = '',
            city = '',
            state = '',
            postalCode = '',
            country = ''
        } = addressObj;

        const parts = [street, city, state, postalCode, country].filter(Boolean);

        if (format === 'multiline') {
            return parts.join('\n');
        } else if (format === 'inline') {
            return parts.join(', ');
        } else if (format === 'compact') {
            return [city, state].filter(Boolean).join(', ');
        }

        return parts.join(', ');
    }

    /**
     * Truncate text with ellipsis
     */
    truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Capitalize text
     */
    capitalize(text, mode = 'first') {
        if (!text) return '';

        switch (mode) {
            case 'first':
                return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
            case 'words':
                return text.replace(/\b\w/g, char => char.toUpperCase());
            case 'all':
                return text.toUpperCase();
            case 'none':
                return text.toLowerCase();
            default:
                return text;
        }
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Format currency (using CurrencyUtils)
     */
    formatCurrency(amount, currencyCode = 'INR', options = {}) {
        if (window.CurrencyUtils) {
            return window.CurrencyUtils.format(amount, currencyCode, options);
        }
        
        // Fallback formatting
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(parseFloat(amount) || 0);
    }

    /**
     * Format invoice number
     */
    formatInvoiceNumber(number, prefix = 'INV', digits = 4) {
        const num = parseInt(number) || 0;
        const padded = num.toString().padStart(digits, '0');
        return `${prefix}-${padded}`;
    }

    /**
     * Format customer code
     */
    formatCustomerCode(name, id) {
        if (!name) return `CUST-${String(id).padStart(4, '0')}`;
        
        const initials = name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
        return `${initials}-${String(id).padStart(4, '0')}`;
    }

    /**
     * Format product SKU
     */
    formatProductSKU(category, name, id) {
        const catCode = category ? category.substring(0, 3).toUpperCase() : 'PRD';
        const nameCode = name ? name.substring(0, 3).toUpperCase() : 'ITM';
        const idCode = String(id).padStart(4, '0');
        
        return `${catCode}-${nameCode}-${idCode}`;
    }

    /**
     * Format tax percentage
     */
    formatTaxRate(rate) {
        const num = parseFloat(rate) || 0;
        return `${num}%`;
    }

    /**
     * Format quantity with unit
     */
    formatQuantity(quantity, unit = 'pcs') {
        const qty = parseFloat(quantity) || 0;
        const formattedQty = qty % 1 === 0 ? qty.toString() : qty.toFixed(2);
        return `${formattedQty} ${unit}`;
    }

    /**
     * Format business hours
     */
    formatBusinessHours(openTime, closeTime) {
        if (!openTime || !closeTime) return '';

        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            return `${displayHour}:${minutes} ${period}`;
        };

        return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
    }

    /**
     * Sanitize HTML content
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Format validation messages
     */
    formatValidationMessage(field, rule, value) {
        const messages = {
            required: `${field} is required.`,
            email: `Please enter a valid email address.`,
            phone: `Please enter a valid phone number.`,
            number: `${field} must be a valid number.`,
            min: `${field} must be at least ${value}.`,
            max: `${field} cannot exceed ${value}.`,
            gstin: `Please enter a valid GSTIN.`
        };

        return messages[rule] || `${field} is invalid.`;
    }

    /**
     * Format search query highlight
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Export formatting utilities
window.FormattingUtils = new FormattingUtils();
console.log('📝 UnifyX FormattingUtils loaded');
