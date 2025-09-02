/**
 * ⚡️ UnifyX Bill Maker - Corporate PDF Template
 * Professional corporate invoice template
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class CorporateTemplate {
    constructor() {
        this.templateName = 'Corporate';
        this.colors = {
            primary: '#1e40af',
            secondary: '#64748b',
            accent: '#059669',
            text: '#1f2937',
            light: '#f8fafc',
            border: '#e5e7eb'
        };
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
            <div class="corporate-template">
                ${this.generateHeader(business)}
                ${this.generateInvoiceHeader(invoiceNumber, invoiceDate, dueDate)}
                ${this.generateParties(business, customerData)}
                ${this.generateItemsTable(items)}
                ${this.generateTaxSummary(totals)}
                ${this.generateTotals(totals)}
                ${this.generateFooter(business, notes)}
            </div>
            
            <style>
                .corporate-template {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: ${this.colors.text};
                    line-height: 1.4;
                }
                
                .corporate-header {
                    background: ${this.colors.primary};
                    color: white;
                    padding: 1.5rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .company-logo {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                
                .company-name {
                    font-size: 1.75rem;
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                }
                
                .company-tagline {
                    font-size: 0.875rem;
                    opacity: 0.9;
                }
                
                .invoice-header {
                    background: ${this.colors.light};
                    padding: 1.5rem 2rem;
                    border-bottom: 3px solid ${this.colors.primary};
                }
                
                .invoice-title {
                    font-size: 2rem;
                    font-weight: bold;
                    color: ${this.colors.primary};
                    margin-bottom: 1rem;
                }
                
                .invoice-meta {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                }
                
                .meta-item {
                    display: flex;
                    flex-direction: column;
                }
                
                .meta-label {
                    font-size: 0.75rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: ${this.colors.secondary};
                    margin-bottom: 0.25rem;
                }
                
                .meta-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${this.colors.text};
                }
                
                .parties-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    padding: 2rem;
                    background: white;
                }
                
                .party-box {
                    border: 1px solid ${this.colors.border};
                    padding: 1.5rem;
                    border-radius: 4px;
                }
                
                .party-title {
                    font-size: 0.875rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: ${this.colors.primary};
                    margin-bottom: 1rem;
                    border-bottom: 2px solid ${this.colors.primary};
                    padding-bottom: 0.5rem;
                }
                
                .party-name {
                    font-size: 1.1rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .corporate-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0;
                    background: white;
                }
                
                .corporate-table th {
                    background: ${this.colors.primary};
                    color: white;
                    padding: 1rem 0.75rem;
                    text-align: left;
                    font-weight: bold;
                    font-size: 0.875rem;
                    border-right: 1px solid rgba(255,255,255,0.2);
                }
                
                .corporate-table th:last-child {
                    border-right: none;
                }
                
                .corporate-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid ${this.colors.border};
                    border-right: 1px solid ${this.colors.border};
                    font-size: 0.875rem;
                }
                
                .corporate-table td:last-child {
                    border-right: none;
                }
                
                .corporate-table tbody tr:nth-child(even) {
                    background-color: #f9fafb;
                }
                
                .tax-summary {
                    background: ${this.colors.light};
                    padding: 1.5rem 2rem;
                    margin: 0;
                }
                
                .tax-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }
                
                .tax-item {
                    text-align: center;
                    padding: 1rem;
                    background: white;
                    border-radius: 4px;
                    border: 1px solid ${this.colors.border};
                }
                
                .tax-label {
                    font-size: 0.75rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    color: ${this.colors.secondary};
                    margin-bottom: 0.5rem;
                }
                
                .tax-amount {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: ${this.colors.primary};
                }
                
                .totals-section {
                    padding: 2rem;
                    background: white;
                }
                
                .totals-table {
                    width: 100%;
                    max-width: 400px;
                    margin-left: auto;
                }
                
                .totals-table td {
                    padding: 0.75rem 0;
                    font-size: 0.875rem;
                    border-bottom: 1px solid ${this.colors.border};
                }
                
                .total-row {
                    background: ${this.colors.primary};
                    color: white;
                    font-weight: bold;
                    font-size: 1.25rem;
                }
                
                .total-row td {
                    padding: 1rem 1.5rem;
                    border-bottom: none;
                }
                
                .corporate-footer {
                    background: ${this.colors.text};
                    color: white;
                    padding: 2rem;
                    text-align: center;
                }
                
                .footer-content {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .footer-section h4 {
                    font-size: 0.875rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    margin-bottom: 0.5rem;
                }
                
                .footer-section p {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }
                
                @media print {
                    .corporate-template {
                        box-shadow: none;
                    }
                }
            </style>
        `;
    }

    generateHeader(business) {
        return `
            <div class="corporate-header">
                <div>
                    <div class="company-name">${business.name || 'Company Name'}</div>
                    <div class="company-tagline">Professional Services & Solutions</div>
                </div>
                <div class="company-logo">⚡</div>
            </div>
        `;
    }

    generateInvoiceHeader(invoiceNumber, invoiceDate, dueDate) {
        return `
            <div class="invoice-header">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-meta">
                    <div class="meta-item">
                        <div class="meta-label">Invoice Number</div>
                        <div class="meta-value">${invoiceNumber}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Invoice Date</div>
                        <div class="meta-value">${new Date(invoiceDate).toLocaleDateString()}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Due Date</div>
                        <div class="meta-value">${dueDate ? new Date(dueDate).toLocaleDateString() : 'Upon Receipt'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateParties(business, customerData) {
        return `
            <div class="parties-section">
                <div class="party-box">
                    <div class="party-title">From</div>
                    <div class="party-name">${business.name || 'Your Company'}</div>
                    <div>${business.address || 'Company Address'}</div>
                    ${business.phone ? `<div>Phone: ${business.phone}</div>` : ''}
                    ${business.email ? `<div>Email: ${business.email}</div>` : ''}
                    ${business.gstin ? `<div>GSTIN: ${business.gstin}</div>` : ''}
                </div>
                <div class="party-box">
                    <div class="party-title">Bill To</div>
                    <div class="party-name">${customerData.name || 'Customer Name'}</div>
                    ${customerData.address ? `<div>${customerData.address}</div>` : ''}
                    ${customerData.phone ? `<div>Phone: ${customerData.phone}</div>` : ''}
                    ${customerData.email ? `<div>Email: ${customerData.email}</div>` : ''}
                    ${customerData.gstin ? `<div>GSTIN: ${customerData.gstin}</div>` : ''}
                </div>
            </div>
        `;
    }

    generateItemsTable(items) {
        if (!items || items.length === 0) {
            return `
                <div style="padding: 2rem; text-align: center; color: ${this.colors.secondary};">
                    No items found
                </div>
            `;
        }

        return `
            <table class="corporate-table">
                <thead>
                    <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 35%;">Description</th>
                        <th style="width: 15%;">HSN/SAC</th>
                        <th style="width: 10%; text-align: center;">Qty</th>
                        <th style="width: 10%; text-align: right;">Rate</th>
                        <th style="width: 10%; text-align: center;">Tax%</th>
                        <th style="width: 15%; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map((item, index) => `
                        <tr>
                            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                            <td>
                                <div style="font-weight: 600;">${item.name || item.description}</div>
                                ${item.description && item.name !== item.description ? 
                                    `<div style="font-size: 0.75rem; color: ${this.colors.secondary};">${item.description}</div>` : ''
                                }
                            </td>
                            <td style="text-align: center;">${item.hsn || '-'}</td>
                            <td style="text-align: center;">${item.quantity}</td>
                            <td style="text-align: right;">₹${(item.rate || 0).toFixed(2)}</td>
                            <td style="text-align: center;">${item.taxRate || 0}%</td>
                            <td style="text-align: right; font-weight: 600;">₹${(item.total || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    generateTaxSummary(totals) {
        const taxItems = [];
        
        if (totals.cgst > 0) {
            taxItems.push({ label: 'CGST', amount: totals.cgst });
        }
        if (totals.sgst > 0) {
            taxItems.push({ label: 'SGST', amount: totals.sgst });
        }
        if (totals.igst > 0) {
            taxItems.push({ label: 'IGST', amount: totals.igst });
        }

        if (taxItems.length === 0) return '';

        return `
            <div class="tax-summary">
                <h3 style="margin-bottom: 1rem; color: ${this.colors.primary}; font-size: 1rem;">Tax Breakdown</h3>
                <div class="tax-grid">
                    ${taxItems.map(tax => `
                        <div class="tax-item">
                            <div class="tax-label">${tax.label}</div>
                            <div class="tax-amount">₹${tax.amount.toFixed(2)}</div>
                        </div>
                    `).join('')}
                    <div class="tax-item">
                        <div class="tax-label">Total Tax</div>
                        <div class="tax-amount">₹${(totals.totalTax || 0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
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
                            <td style="text-align: right; color: ${this.colors.accent};">-₹${totals.discount.toFixed(2)}</td>
                        </tr>
                    ` : ''}
                    <tr>
                        <td>Total Tax:</td>
                        <td style="text-align: right;">₹${(totals.totalTax || 0).toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>GRAND TOTAL</strong></td>
                        <td style="text-align: right;"><strong>₹${(totals.grandTotal || 0).toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        `;
    }

    generateFooter(business, notes) {
        return `
            <div class="corporate-footer">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>Payment Terms</h4>
                        <p>Payment is due within 30 days of invoice date. Late payments may incur additional charges.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Contact Information</h4>
                        <p>For any queries regarding this invoice, please contact us at ${business.email || 'info@company.com'}</p>
                    </div>
                    <div class="footer-section">
                        <h4>Thank You</h4>
                        <p>We appreciate your business and look forward to serving you again.</p>
                    </div>
                </div>
                ${notes ? `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);"><strong>Additional Notes:</strong> ${notes}</div>` : ''}
                <div style="margin-top: 2rem; font-size: 0.75rem; opacity: 0.6;">
                    This is a computer-generated invoice. Generated with UnifyX Bill Maker.
                </div>
            </div>
        `;
    }
}

window.CorporateTemplate = CorporateTemplate;
