/**
 * ⚡️ UnifyX Bill Maker - Classic PDF Template
 * Traditional business invoice template
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class ClassicTemplate {
    constructor() {
        this.templateName = 'Classic';
    }

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
            <div class="classic-template">
                ${this.generateHeader(business)}
                ${this.generateInvoiceInfo(invoiceNumber, invoiceDate, dueDate)}
                ${this.generateCustomerInfo(customerData)}
                ${this.generateItemsTable(items)}
                ${this.generateTotals(totals)}
                ${this.generateFooter(notes)}
            </div>
            
            <style>
                .classic-template {
                    font-family: 'Times New Roman', serif;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: #000;
                    border: 2px solid #000;
                }
                
                .classic-header {
                    text-align: center;
                    padding: 2rem;
                    border-bottom: 2px solid #000;
                }
                
                .business-name {
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .invoice-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-align: center;
                    margin: 1rem 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .invoice-details {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem 2rem;
                    border-bottom: 1px solid #000;
                }
                
                .customer-section {
                    display: flex;
                    justify-content: space-between;
                    padding: 1rem 2rem;
                    border-bottom: 2px solid #000;
                }
                
                .classic-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0;
                }
                
                .classic-table th,
                .classic-table td {
                    border: 1px solid #000;
                    padding: 0.75rem;
                    text-align: left;
                }
                
                .classic-table th {
                    background: #f0f0f0;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                
                .totals-section {
                    padding: 1rem 2rem;
                }
                
                .totals-table {
                    margin-left: auto;
                    width: 300px;
                }
                
                .totals-table td {
                    padding: 0.5rem;
                    border: none;
                }
                
                .total-row {
                    border-top: 2px solid #000;
                    font-weight: bold;
                    font-size: 1.1rem;
                }
                
                .footer {
                    padding: 2rem;
                    text-align: center;
                    border-top: 1px solid #000;
                }
                
                @media print {
                    .classic-template {
                        border: 2px solid #000;
                    }
                }
            </style>
        `;
    }

    generateHeader(business) {
        return `
            <div class="classic-header">
                <div class="business-name">${business.name || 'Business Name'}</div>
                <div>${business.address || 'Business Address'}</div>
                <div>Phone: ${business.phone || 'N/A'} | Email: ${business.email || 'N/A'}</div>
                ${business.gstin ? `<div>GSTIN: ${business.gstin}</div>` : ''}
            </div>
        `;
    }

    generateInvoiceInfo(invoiceNumber, invoiceDate, dueDate) {
        return `
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-details">
                <div>
                    <strong>Invoice Number:</strong> ${invoiceNumber}<br>
                    <strong>Invoice Date:</strong> ${new Date(invoiceDate).toLocaleDateString()}
                </div>
                <div>
                    ${dueDate ? `<strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}` : ''}
                </div>
            </div>
        `;
    }

    generateCustomerInfo(customerData) {
        return `
            <div class="customer-section">
                <div>
                    <strong>Bill To:</strong><br>
                    <strong>${customerData.name || 'Customer Name'}</strong><br>
                    ${customerData.address || ''}<br>
                    ${customerData.phone ? `Phone: ${customerData.phone}` : ''}<br>
                    ${customerData.email ? `Email: ${customerData.email}` : ''}
                    ${customerData.gstin ? `<br>GSTIN: ${customerData.gstin}` : ''}
                </div>
            </div>
        `;
    }

    generateItemsTable(items) {
        if (!items || items.length === 0) {
            return `
                <div style="padding: 2rem; text-align: center;">
                    No items found
                </div>
            `;
        }

        return `
            <table class="classic-table">
                <thead>
                    <tr>
                        <th>Sr. No.</th>
                        <th>Description</th>
                        <th>HSN/SAC</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Tax %</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name || item.description}</td>
                            <td>${item.hsn || '-'}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${(item.rate || 0).toFixed(2)}</td>
                            <td style="text-align: center;">${item.taxRate || 0}%</td>
                            <td style="text-align: right;">₹${(item.total || 0).toFixed(2)}</td>
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
                    ${totals.totalTax > 0 ? `
                        <tr>
                            <td>Total Tax:</td>
                            <td style="text-align: right;">₹${totals.totalTax.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td><strong>Grand Total:</strong></td>
                        <td style="text-align: right;"><strong>₹${(totals.grandTotal || 0).toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        `;
    }

    generateFooter(notes) {
        return `
            <div class="footer">
                ${notes ? `<div style="margin-bottom: 1rem;"><strong>Notes:</strong> ${notes}</div>` : ''}
                <div>
                    <strong>Terms & Conditions:</strong><br>
                    Payment is due within 30 days. Thank you for your business!
                </div>
                <br>
                <div>
                    ________________________<br>
                    <strong>Authorized Signature</strong>
                </div>
            </div>
        `;
    }
}

window.ClassicTemplate = ClassicTemplate;
