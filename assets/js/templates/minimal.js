/**
 * ⚡️ UnifyX Bill Maker - Minimal PDF Template
 * Clean, simple invoice template
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class MinimalTemplate {
    constructor() {
        this.templateName = 'Minimal';
    }

    generate(invoiceData) {
        const {
            business = {},
            customerData = {},
            items = [],
            totals = {},
            invoiceNumber = '',
            invoiceDate = '',
            notes = ''
        } = invoiceData;

        return `
            <div class="minimal-template">
                ${this.generateHeader(business, invoiceNumber, invoiceDate)}
                ${this.generateCustomerInfo(customerData)}
                ${this.generateItemsTable(items)}
                ${this.generateTotals(totals)}
                ${notes ? this.generateNotes(notes) : ''}
            </div>
            
            <style>
                .minimal-template {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: #2d3748;
                    line-height: 1.5;
                    padding: 2rem;
                }
                
                .minimal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 3rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .business-info h1 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                    color: #1a202c;
                }
                
                .business-details {
                    font-size: 0.875rem;
                    color: #718096;
                }
                
                .invoice-info {
                    text-align: right;
                }
                
                .invoice-number {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                    color: #1a202c;
                }
                
                .customer-section {
                    margin-bottom: 2rem;
                }
                
                .customer-section h3 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #718096;
                    margin-bottom: 0.5rem;
                }
                
                .customer-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1a202c;
                    margin-bottom: 0.25rem;
                }
                
                .minimal-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2rem;
                }
                
                .minimal-table th {
                    background: transparent;
                    border-bottom: 2px solid #e2e8f0;
                    padding: 0.75rem 0;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.875rem;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .minimal-table td {
                    padding: 1rem 0;
                    border-bottom: 1px solid #f7fafc;
                    font-size: 0.875rem;
                }
                
                .item-name {
                    font-weight: 500;
                    color: #2d3748;
                }
                
                .totals-section {
                    margin-left: auto;
                    width: 250px;
                }
                
                .totals-table {
                    width: 100%;
                }
                
                .totals-table td {
                    padding: 0.5rem 0;
                    border: none;
                    font-size: 0.875rem;
                }
                
                .total-row {
                    border-top: 1px solid #e2e8f0;
                    font-weight: 600;
                    font-size: 1rem;
                    color: #1a202c;
                }
                
                .notes-section {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                }
                
                .notes-section h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #718096;
                    margin-bottom: 0.5rem;
                }
                
                @media print {
                    .minimal-template {
                        padding: 0;
                    }
                }
            </style>
        `;
    }

    generateHeader(business, invoiceNumber, invoiceDate) {
        return `
            <div class="minimal-header">
                <div class="business-info">
                    <h1>${business.name || 'Your Business'}</h1>
                    <div class="business-details">
                        ${business.address ? `<div>${business.address}</div>` : ''}
                        ${business.phone ? `<div>${business.phone}</div>` : ''}
                        ${business.email ? `<div>${business.email}</div>` : ''}
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-number">Invoice ${invoiceNumber}</div>
                    <div style="font-size: 0.875rem; color: #718096;">
                        ${new Date(invoiceDate).toLocaleDateString()}
                    </div>
                </div>
            </div>
        `;
    }

    generateCustomerInfo(customerData) {
        return `
            <div class="customer-section">
                <h3>Bill To</h3>
                <div class="customer-name">${customerData.name || 'Customer'}</div>
                ${customerData.address ? `<div style="font-size: 0.875rem; color: #718096;">${customerData.address}</div>` : ''}
                ${customerData.phone ? `<div style="font-size: 0.875rem; color: #718096;">${customerData.phone}</div>` : ''}
                ${customerData.email ? `<div style="font-size: 0.875rem; color: #718096;">${customerData.email}</div>` : ''}
            </div>
        `;
    }

    generateItemsTable(items) {
        if (!items || items.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: #a0aec0;">
                    No items found
                </div>
            `;
        }

        return `
            <table class="minimal-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name || item.description}</div>
                            </td>
                            <td style="text-align: center; color: #718096;">${item.quantity}</td>
                            <td style="text-align: right; color: #718096;">₹${(item.rate || 0).toFixed(2)}</td>
                            <td style="text-align: right; font-weight: 500;">₹${(item.total || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateTotals(totals) {
        return `
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td style="color: #718096;">Subtotal</td>
                        <td style="text-align: right;">₹${(totals.subtotal || 0).toFixed(2)}</td>
                    </tr>
                    ${totals.discount > 0 ? `
                        <tr>
                            <td style="color: #718096;">Discount</td>
                            <td style="text-align: right;">-₹${totals.discount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    ${totals.totalTax > 0 ? `
                        <tr>
                            <td style="color: #718096;">Tax</td>
                            <td style="text-align: right;">₹${totals.totalTax.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>Total</td>
                        <td style="text-align: right;">₹${(totals.grandTotal || 0).toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        `;
    }

    generateNotes(notes) {
        return `
            <div class="notes-section">
                <h4>Notes</h4>
                <div style="font-size: 0.875rem; color: #718096;">
                    ${notes}
                </div>
            </div>
        `;
    }
}

window.MinimalTemplate = MinimalTemplate;
