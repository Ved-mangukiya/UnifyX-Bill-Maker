/**
 * ⚡️ UnifyX Bill Maker - Creative PDF Template
 * Colorful and modern creative invoice template
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class CreativeTemplate {
    constructor() {
        this.templateName = 'Creative';
        this.colors = {
            primary: '#7c3aed',
            secondary: '#06b6d4',
            accent: '#f59e0b',
            success: '#10b981',
            text: '#1f2937',
            light: '#faf5ff'
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
            <div class="creative-template">
                ${this.generateHeader(business, invoiceNumber, invoiceDate)}
                ${this.generateCustomerSection(customerData, dueDate)}
                ${this.generateItemsTable(items)}
                ${this.generateTotals(totals)}
                ${this.generateFooter(business, notes)}
            </div>
            
            <style>
                .creative-template {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    color: ${this.colors.text};
                    overflow: hidden;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                
                .creative-header {
                    background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.secondary} 100%);
                    color: white;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .creative-header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    pointer-events: none;
                }
                
                .header-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                
                .business-info h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin: 0 0 0.5rem 0;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .business-details {
                    opacity: 0.9;
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .invoice-badge {
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(10px);
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    text-align: right;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .invoice-number {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                
                .customer-section {
                    padding: 2rem;
                    background: linear-gradient(135deg, ${this.colors.light} 0%, #ffffff 100%);
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2rem;
                    position: relative;
                }
                
                .customer-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, ${this.colors.primary}, ${this.colors.secondary}, ${this.colors.accent});
                }
                
                .customer-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border-left: 4px solid ${this.colors.primary};
                }
                
                .customer-title {
                    color: ${this.colors.primary};
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .customer-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: ${this.colors.text};
                    margin-bottom: 0.5rem;
                }
                
                .creative-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                    margin: 0;
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }
                
                .creative-table th {
                    background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.secondary} 100%);
                    color: white;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 700;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border: none;
                }
                
                .creative-table th:first-child {
                    border-radius: 12px 0 0 0;
                }
                
                .creative-table th:last-child {
                    border-radius: 0 12px 0 0;
                }
                
                .creative-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f3f4f6;
                    background: white;
                    font-size: 0.875rem;
                }
                
                .creative-table tbody tr:last-child td:first-child {
                    border-radius: 0 0 0 12px;
                }
                
                .creative-table tbody tr:last-child td:last-child {
                    border-radius: 0 0 12px 0;
                }
                
                .creative-table tbody tr:nth-child(even) {
                    background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%);
                }
                
                .creative-table tbody tr:nth-child(even) td {
                    background: transparent;
                }
                
                .item-name {
                    font-weight: 600;
                    color: ${this.colors.text};
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .item-name::before {
                    content: '📦';
                    font-size: 1rem;
                }
                
                .totals-section {
                    padding: 2rem;
                    background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
                }
                
                .totals-container {
                    max-width: 400px;
                    margin-left: auto;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                
                .totals-header {
                    background: linear-gradient(135deg, ${this.colors.accent} 0%, #f97316 100%);
                    color: white;
                    padding: 1rem;
                    font-weight: 700;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                
                .totals-table {
                    width: 100%;
                }
                
                .totals-table td {
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                
                .totals-table tr:last-child td {
                    border-bottom: none;
                }
                
                .total-row {
                    background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.secondary} 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 1.125rem;
                }
                
                .creative-footer {
                    background: ${this.colors.text};
                    color: white;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                
                .creative-footer::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -50%;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(45deg, 
                        transparent 30%, 
                        rgba(124, 58, 237, 0.1) 50%, 
                        transparent 70%);
                    animation: shimmer 3s ease-in-out infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .footer-content {
                    position: relative;
                    z-index: 1;
                    text-align: center;
                }
                
                .thank-you {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    background: linear-gradient(135deg, ${this.colors.accent}, ${this.colors.success});
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .footer-message {
                    font-size: 0.875rem;
                    opacity: 0.8;
                    margin-bottom: 1rem;
                }
                
                .creative-signature {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.2);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                
                .color-accent { color: ${this.colors.accent}; }
                .color-success { color: ${this.colors.success}; }
                .color-secondary { color: ${this.colors.secondary}; }
                
                @media print {
                    .creative-template {
                        box-shadow: none;
                        border-radius: 0;
                    }
                    
                    .creative-footer::before {
                        animation: none;
                    }
                }
            </style>
        `;
    }

    generateHeader(business, invoiceNumber, invoiceDate) {
        return `
            <div class="creative-header">
                <div class="header-content">
                    <div class="business-info">
                        <h1>🎨 ${business.name || 'Creative Studio'}</h1>
                        <div class="business-details">
                            ${business.address ? `<div>📍 ${business.address}</div>` : ''}
                            ${business.phone ? `<div>📞 ${business.phone}</div>` : ''}
                            ${business.email ? `<div>✉️ ${business.email}</div>` : ''}
                        </div>
                    </div>
                    <div class="invoice-badge">
                        <div class="invoice-number">#${invoiceNumber}</div>
                        <div style="font-size: 0.875rem; opacity: 0.9;">
                            📅 ${new Date(invoiceDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateCustomerSection(customerData, dueDate) {
        return `
            <div class="customer-section">
                <div class="customer-card">
                    <div class="customer-title">
                        👤 Bill To
                    </div>
                    <div class="customer-name">${customerData.name || 'Valued Customer'}</div>
                    ${customerData.address ? `<div style="margin-bottom: 0.25rem;">📍 ${customerData.address}</div>` : ''}
                    ${customerData.phone ? `<div style="margin-bottom: 0.25rem;">📞 ${customerData.phone}</div>` : ''}
                    ${customerData.email ? `<div style="margin-bottom: 0.25rem;">✉️ ${customerData.email}</div>` : ''}
                    ${customerData.gstin ? `<div>🏛️ GSTIN: ${customerData.gstin}</div>` : ''}
                </div>
                <div class="customer-card">
                    <div class="customer-title">
                        📋 Invoice Details
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>Status:</strong> <span class="color-accent">●</span> Pending
                    </div>
                    ${dueDate ? `
                        <div style="margin-bottom: 0.5rem;">
                            <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}
                        </div>
                    ` : ''}
                    <div>
                        <strong>Payment Terms:</strong> Net 30 Days
                    </div>
                </div>
            </div>
        `;
    }

    generateItemsTable(items) {
        if (!items || items.length === 0) {
            return `
                <div style="padding: 3rem; text-align: center; color: #9ca3af;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <div>No items to display</div>
                </div>
            `;
        }

        return `
            <div style="padding: 0 2rem;">
                <table class="creative-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: center;">Tax %</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>
                                    <div class="item-name">${item.name || item.description}</div>
                                    ${item.hsn ? `<div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">HSN: ${item.hsn}</div>` : ''}
                                </td>
                                <td style="text-align: center; font-weight: 600;">${item.quantity}</td>
                                <td style="text-align: right; color: #6b7280;">₹${(item.rate || 0).toFixed(2)}</td>
                                <td style="text-align: center;">
                                    <span style="background: ${this.colors.accent}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                                        ${item.taxRate || 0}%
                                    </span>
                                </td>
                                <td style="text-align: right; font-weight: 700; color: ${this.colors.primary};">₹${(item.total || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    generateTotals(totals) {
        return `
            <div class="totals-section">
                <div class="totals-container">
                    <div class="totals-header">
                        💰 Invoice Summary
                    </div>
                    <table class="totals-table">
                        <tr>
                            <td style="color: #6b7280;">Subtotal</td>
                            <td style="text-align: right; font-weight: 600;">₹${(totals.subtotal || 0).toFixed(2)}</td>
                        </tr>
                        ${totals.discount > 0 ? `
                            <tr>
                                <td style="color: #6b7280;">Discount</td>
                                <td style="text-align: right; font-weight: 600; color: ${this.colors.success};">-₹${totals.discount.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${totals.cgst > 0 ? `
                            <tr>
                                <td style="color: #6b7280;">CGST</td>
                                <td style="text-align: right; font-weight: 600;">₹${totals.cgst.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${totals.sgst > 0 ? `
                            <tr>
                                <td style="color: #6b7280;">SGST</td>
                                <td style="text-align: right; font-weight: 600;">₹${totals.sgst.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        ${totals.igst > 0 ? `
                            <tr>
                                <td style="color: #6b7280;">IGST</td>
                                <td style="text-align: right; font-weight: 600;">₹${totals.igst.toFixed(2)}</td>
                            </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td><strong>💎 Grand Total</strong></td>
                            <td style="text-align: right;"><strong>₹${(totals.grandTotal || 0).toFixed(2)}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    generateFooter(business, notes) {
        return `
            <div class="creative-footer">
                <div class="footer-content">
                    <div class="thank-you">Thank You! 🙏</div>
                    <div class="footer-message">
                        We appreciate your business and look forward to working with you again.
                    </div>
                    ${notes ? `
                        <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; border-left: 4px solid ${this.colors.accent};">
                            <strong>📝 Notes:</strong> ${notes}
                        </div>
                    ` : ''}
                    <div class="creative-signature">
                        ⚡ Generated with UnifyX Bill Maker
                    </div>
                </div>
            </div>
        `;
    }
}

window.CreativeTemplate = CreativeTemplate;
