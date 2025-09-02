/**
 * ⚡️ UnifyX Bill Maker - Modern PDF Template
 * Clean, modern invoice template with gradients and icons
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class ModernTemplate {
    constructor() {
        this.templateName = 'Modern';
        this.colors = {
            primary: '#6366f1',
            secondary: '#64748b',
            accent: '#10b981',
            text: '#0f172a',
            light: '#f8fafc'
        };
    }

    /**
     * Generate modern template HTML
     */
    generate(invoiceData) {
        const {
            business = {},
            customerData = {},
            items = [],
            totals = {},
            invoiceNumber = '',
            invoiceDate = '',
            dueDate = '',
            notes = ''
        } = invoiceData;

        return `
            <div class="modern-template">
                ${this.generateHeader(business, invoiceNumber, invoiceDate)}
                ${this.generateCustomerSection(customerData, dueDate)}
                ${this.generateItemsTable(items)}
                ${this.generateTotals(totals)}
                ${this.generateFooter(business, notes)}
            </div>
            
            <style>
                .modern-template {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: ${this.colors.text};
                    line-height: 1.6;
                }
                
                .modern-header {
                    background: linear-gradient(135deg, ${this.colors.primary} 0%, #8b5cf6 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px 12px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                
                .business-info h1 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin: 0 0 0.5rem 0;
                }
                
                .business-details {
                    opacity: 0.9;
                    font-size: 0.9rem;
                }
                
                .invoice-info {
                    text-align: right;
                }
                
                .invoice-number {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .invoice-date {
                    opacity: 0.9;
                    font-size: 0.9rem;
                }
                
                .customer-section {
                    padding: 2rem;
                    background: ${this.colors.light};
                    display: flex;
                    justify-content: space-between;
                }
                
                .bill-to h3 {
                    color: ${this.colors.primary};
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }
                
                .customer-name {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .items-table {
                    margin: 0;
                    border-collapse: collapse;
                    width: 100%;
                    background: white;
                }
                
                .items-table th {
                    background: ${this.colors.primary};
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .items-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    font-size: 0.9rem;
                }
                
                .items-table tr:hover {
                    background-color: #f9fafb;
                }
                
                .item-name {
                    font-weight: 600;
                    color: ${this.colors.text};
                }
                
                .totals-section {
                    padding: 2rem;
                    background: ${this.colors.light};
                }
                
                .totals-table {
                    width: 100%;
                    max-width: 300px;
                    margin-left: auto;
                }
                
                .totals-table td {
                    padding: 0.5rem 0;
                    font-size: 0.9rem;
                }
                
                .total-row {
                    border-top: 2px solid ${this.colors.primary};
                    font-weight: 700;
                    font-size: 1.1rem !important;
                    color: ${this.colors.primary};
                }
                
                .footer {
                    padding: 2rem;
                    text-align: center;
                    background: ${this.colors.text};
                    color: white;
                    border-radius: 0 0 12px 12px;
                }
                
                .thank-you {
                    font-size: 1.2rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }
                
                @media print {
                    .modern-template {
                        box-shadow: none;
                        border: none;
                    }
                }
            </style>
        `;
    }

    generateHeader(business, invoiceNumber, invoiceDate) {
        return `
            <div class="modern-header">
                <div class="business-info">
                    <h1>${business.name || 'Your Business'}</h1>
                    <div class="business-details">
                        ${business.address ? `<div>${business.address}</div>` : ''}
                        ${business.phone ? `<div>📞 ${business.phone}</div>` : ''}
                        ${business.email ? `<div>✉️ ${business.email}</div>` : ''}
                        ${business.gstin ? `<div>🏛️ GSTIN: ${business.gstin}</div>` : ''}
                    </div>
                </div>
                <div class="invoice-info">
                    <div class="invoice-number">Invoice #${invoiceNumber}</div>
                    <div class="invoice-date">Date: ${new Date(invoiceDate).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }

    generateCustomerSection(customerData, dueDate) {
        return `
            <div class="customer-section">
                <div class="bill-to">
                    <h3>📋 Bill To</h3>
                    <div class="customer-name">${customerData.name || 'Customer'}</div>
                    ${customerData.address ? `<div>${customerData.address}</div>` : ''}
                    ${customerData.phone ? `<div>📞 ${customerData.phone}</div>` : ''}
                    ${customerData.email ? `<div>✉️ ${customerData.email}</div>` : ''}
                    ${customerData.gstin ? `<div>🏛️ GSTIN: ${customerData.gstin}</div>` : ''}
                </div>
                <div class="invoice-details">
                    ${dueDate ? `<div><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</div>` : ''}
                    <div><strong>Payment Status:</strong> Pending</div>
                </div>
            </div>
        `;
    }

    generateItemsTable(items) {
        if (!items || items.length === 0) {
            return `
                <div style="padding: 2rem; text-align: center; color: #64748b;">
                    No items found
                </div>
            `;
        }

        return `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>📦 Description</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Tax</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name || item.description}</div>
                                ${item.hsn ? `<small style="color: #64748b;">HSN: ${item.hsn}</small>` : ''}
                            </td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${(item.rate || 0).toFixed(2)}</td>
                            <td style="text-align: right;">${item.taxRate || 0}%</td>
                            <td style="text-align: right; font-weight: 600;">₹${(item.total || 0).toFixed(2)}</td>
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
                        <td>Subtotal:</td>
                        <td style="text-align: right;">₹${(totals.subtotal || 0).toFixed(2)}</td>
                    </tr>
                    ${totals.discount > 0 ? `
                        <tr>
                            <td>Discount:</td>
                            <td style="text-align: right;">-₹${totals.discount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    ${totals.cgst > 0 ? `
                        <tr>
                            <td>CGST:</td>
                            <td style="text-align: right;">₹${totals.cgst.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    ${totals.sgst > 0 ? `
                        <tr>
                            <td>SGST:</td>
                            <td style="text-align: right;">₹${totals.sgst.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    ${totals.igst > 0 ? `
                        <tr>
                            <td>IGST:</td>
                            <td style="text-align: right;">₹${totals.igst.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td><strong>Total:</strong></td>
                        <td style="text-align: right;"><strong>₹${(totals.grandTotal || 0).toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        `;
    }

    generateFooter(business, notes) {
        return `
            <div class="footer">
                <div class="thank-you">🙏 Thank you for your business!</div>
                ${notes ? `<div style="margin: 1rem 0; font-style: italic;">${notes}</div>` : ''}
                <div style="font-size: 0.8rem; opacity: 0.8;">
                    Generated with ⚡ UnifyX Bill Maker
                </div>
            </div>
        `;
    }
}

window.ModernTemplate = ModernTemplate;
