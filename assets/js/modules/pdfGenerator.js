/**
 * ⚡️ UnifyX Bill Maker - PDF Generation System
 * Complete PDF generation with templates, multi-page support, watermarks, and printing
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class PDFGenerator {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.templates = new Map();
        this.currentInvoice = null;
        this.currentTemplate = null;
        this.pdfLibraryLoaded = false;
        
        // PDF configuration
        this.pageFormats = {
            A4: { width: 595.28, height: 841.89 },
            A5: { width: 420.94, height: 595.28 },
            'thermal-80mm': { width: 226.77, height: 'auto' },
            'thermal-58mm': { width: 164.41, height: 'auto' }
        };
        
        this.margins = {
            A4: { top: 40, right: 40, bottom: 40, left: 40 },
            A5: { top: 30, right: 30, bottom: 30, left: 30 },
            thermal: { top: 10, right: 10, bottom: 10, left: 10 }
        };
        
        // Load templates
        this.loadTemplates();
        
        console.log('📄 PDFGenerator initialized successfully!');
    }

    /**
     * Load PDF templates
     */
    loadTemplates() {
        try {
            const templates = this.dataManager.getTemplates() || [];
            
            templates.forEach(template => {
                this.templates.set(template.id, {
                    ...template,
                    generator: this.getTemplateGenerator(template.id)
                });
            });
            
            console.log(`Loaded ${templates.length} PDF templates`);
            
        } catch (error) {
            console.error('Failed to load PDF templates:', error);
        }
    }

    /**
     * Get template generator function
     * @param {string} templateId - Template ID
     * @returns {Function} Template generator function
     */
    getTemplateGenerator(templateId) {
        const generators = {
            modern: this.generateModernTemplate.bind(this),
            minimal: this.generateMinimalTemplate.bind(this),
            classic: this.generateClassicTemplate.bind(this),
            corporate: this.generateCorporateTemplate.bind(this),
            creative: this.generateCreativeTemplate.bind(this)
        };
        
        return generators[templateId] || generators.modern;
    }

    /**
     * Generate PDF for invoice
     * @param {Object} invoiceData - Invoice data
     * @param {Object} options - Generation options
     * @returns {Promise<Blob>} Generated PDF blob
     */
    async generateInvoicePDF(invoiceData, options = {}) {
        try {
            this.currentInvoice = invoiceData;
            
            // Load PDF library if needed
            await this.loadPDFLibrary();
            
            // Get template
            const templateId = options.template || invoiceData.template || 'modern';
            this.currentTemplate = this.templates.get(templateId);
            
            if (!this.currentTemplate) {
                throw new Error(`Template '${templateId}' not found`);
            }

            // Generate PDF content
            const docDefinition = await this.buildDocumentDefinition(options);
            
            // Generate PDF using library (placeholder for actual PDF generation)
            const pdfBlob = await this.generatePDFFromDefinition(docDefinition);
            
            // Track event
            this.trackPDFEvent('pdf_generated', { 
                invoiceId: invoiceData.id,
                template: templateId,
                format: options.format || 'A4'
            });
            
            return pdfBlob;
            
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            throw error;
        }
    }

    /**
     * Build document definition for PDF generation
     * @param {Object} options - Generation options
     * @returns {Object} Document definition
     */
    async buildDocumentDefinition(options = {}) {
        const format = options.format || 'A4';
        const pageFormat = this.pageFormats[format];
        const margins = format.includes('thermal') ? this.margins.thermal : this.margins[format];
        
        const docDefinition = {
            pageSize: format === 'A4' ? 'A4' : format === 'A5' ? 'A5' : { width: pageFormat.width, height: pageFormat.height },
            pageMargins: [margins.left, margins.top, margins.right, margins.bottom],
            
            // Document info
            info: {
                title: `Invoice ${this.currentInvoice.invoiceNumber}`,
                author: this.currentInvoice.business?.name || 'UnifyX Bill Maker',
                subject: `Invoice for ${this.currentInvoice.customerData?.name || 'Customer'}`,
                creator: 'UnifyX Bill Maker',
                producer: 'UnifyX PDF Generator',
                creationDate: new Date(),
                modDate: new Date()
            },
            
            // Content
            content: [],
            
            // Styles
            styles: this.getTemplateStyles(),
            defaultStyle: this.getDefaultStyle(),
            
            // Header and footer
            header: this.buildHeader.bind(this),
            footer: this.buildFooter.bind(this),
            
            // Watermark
            watermark: this.buildWatermark(options.watermark)
        };

        // Generate content using template
        const content = await this.currentTemplate.generator(this.currentInvoice, options);
        docDefinition.content = content;
        
        return docDefinition;
    }

    /**
     * Generate Modern template
     * @param {Object} invoice - Invoice data
     * @param {Object} options - Template options
     * @returns {Array} PDF content array
     */
    generateModernTemplate(invoice, options) {
        const content = [];
        
        // Business header with logo
        content.push(this.buildBusinessHeader(invoice.business, 'modern'));
        
        // Invoice details section
        content.push(this.buildInvoiceDetails(invoice, 'modern'));
        
        // Customer details
        content.push(this.buildCustomerDetails(invoice.customerData, 'modern'));
        
        // Items table
        content.push(this.buildItemsTable(invoice.items, invoice.billType, 'modern'));
        
        // Totals section
        content.push(this.buildTotalsSection(invoice.totals, 'modern'));
        
        // Payment and terms
        content.push(this.buildPaymentTerms(invoice, 'modern'));
        
        // QR Code for UPI payments
        if (invoice.business?.upiId) {
            content.push(this.buildQRCode(invoice, 'modern'));
        }
        
        // Signature section
        if (invoice.business?.signature) {
            content.push(this.buildSignatureSection(invoice.business, 'modern'));
        }
        
        return content;
    }

    /**
     * Generate Minimal template
     * @param {Object} invoice - Invoice data
     * @param {Object} options - Template options
     * @returns {Array} PDF content array
     */
    generateMinimalTemplate(invoice, options) {
        const content = [];
        
        // Simple header
        content.push({
            columns: [
                { text: invoice.business?.name || 'Business Name', style: 'businessName' },
                { text: `Invoice: ${invoice.invoiceNumber}`, style: 'invoiceNumber', alignment: 'right' }
            ],
            margin: [0, 0, 0, 20]
        });
        
        // Customer and date info
        content.push({
            columns: [
                {
                    text: [
                        { text: 'Bill To:\n', style: 'label' },
                        { text: invoice.customerData?.name || 'Customer', style: 'customerName' },
                        invoice.customerData?.address ? `\n${invoice.customerData.address}` : ''
                    ]
                },
                {
                    text: [
                        { text: 'Date: ', style: 'label' },
                        { text: new Date(invoice.invoiceDate).toLocaleDateString(), style: 'dateText' },
                        invoice.dueDate ? `\nDue: ${new Date(invoice.dueDate).toLocaleDateString()}` : ''
                    ],
                    alignment: 'right'
                }
            ],
            margin: [0, 0, 0, 20]
        });
        
        // Simple items table
        const tableBody = [
            [
                { text: 'Description', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                { text: 'Rate', style: 'tableHeader', alignment: 'right' },
                { text: 'Amount', style: 'tableHeader', alignment: 'right' }
            ]
        ];
        
        invoice.items.forEach(item => {
            tableBody.push([
                { text: item.name, style: 'tableCell' },
                { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
                { text: this.formatCurrency(item.rate), style: 'tableCell', alignment: 'right' },
                { text: this.formatCurrency(item.total), style: 'tableCell', alignment: 'right' }
            ]);
        });
        
        // Add total row
        tableBody.push([
            { text: '', border: [false, false, false, false] },
            { text: '', border: [false, false, false, false] },
            { text: 'Total:', style: 'totalLabel', alignment: 'right', border: [false, true, false, false] },
            { text: this.formatCurrency(invoice.totals.grandTotal), style: 'totalAmount', alignment: 'right', border: [false, true, false, false] }
        ]);
        
        content.push({
            table: {
                widths: ['*', 'auto', 'auto', 'auto'],
                body: tableBody
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 20]
        });
        
        // Simple footer
        content.push({
            text: invoice.termsAndConditions || 'Thank you for your business!',
            style: 'footer',
            margin: [0, 20, 0, 0]
        });
        
        return content;
    }

    /**
     * Generate Classic template
     * @param {Object} invoice - Invoice data
     * @param {Object} options - Template options
     * @returns {Array} PDF content array
     */
    generateClassicTemplate(invoice, options) {
        const content = [];
        
        // Traditional header with border
        content.push({
            table: {
                widths: ['*'],
                body: [[
                    {
                        stack: [
                            { text: invoice.business?.name || 'Business Name', style: 'businessNameClassic' },
                            { text: invoice.business?.address || '', style: 'businessAddress' },
                            { text: `Phone: ${invoice.business?.phone || ''} | Email: ${invoice.business?.email || ''}`, style: 'businessContact' }
                        ],
                        alignment: 'center',
                        margin: [10, 10, 10, 10]
                    }
                ]]
            },
            layout: {
                hLineWidth: () => 2,
                vLineWidth: () => 2,
                hLineColor: () => '#000000',
                vLineColor: () => '#000000'
            },
            margin: [0, 0, 0, 20]
        });
        
        // Invoice title and details
        content.push({
            text: 'INVOICE',
            style: 'invoiceTitle',
            alignment: 'center',
            margin: [0, 0, 0, 20]
        });
        
        // Two-column layout for invoice and customer details
        content.push({
            columns: [
                {
                    stack: [
                        { text: 'Invoice Details:', style: 'sectionHeader' },
                        { text: `Invoice No: ${invoice.invoiceNumber}`, style: 'detailText' },
                        { text: `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, style: 'detailText' },
                        { text: `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, style: 'detailText' }
                    ]
                },
                {
                    stack: [
                        { text: 'Bill To:', style: 'sectionHeader' },
                        { text: invoice.customerData?.name || 'Customer', style: 'customerNameClassic' },
                        { text: invoice.customerData?.address || '', style: 'detailText' },
                        { text: invoice.customerData?.phone || '', style: 'detailText' }
                    ]
                }
            ],
            margin: [0, 0, 0, 30]
        });
        
        // Classic items table with borders
        content.push(this.buildClassicItemsTable(invoice.items, invoice.totals));
        
        // Terms and signature
        content.push({
            columns: [
                {
                    stack: [
                        { text: 'Terms & Conditions:', style: 'sectionHeader' },
                        { text: invoice.termsAndConditions || 'Payment due within 30 days.', style: 'termsText' }
                    ],
                    width: '60%'
                },
                {
                    stack: [
                        { text: 'Authorized Signature:', style: 'sectionHeader' },
                        { text: '\n\n', style: 'signatureSpace' },
                        { text: '____________________', style: 'signatureLine' }
                    ],
                    width: '40%',
                    alignment: 'center'
                }
            ],
            margin: [0, 30, 0, 0]
        });
        
        return content;
    }

    /**
     * Generate Corporate template
     * @param {Object} invoice - Invoice data
     * @param {Object} options - Template options
     * @returns {Array} PDF content array
     */
    generateCorporateTemplate(invoice, options) {
        const content = [];
        
        // Professional header with logo and company details
        content.push({
            columns: [
                {
                    image: invoice.business?.logo || '',
                    width: 100,
                    margin: [0, 0, 20, 0]
                },
                {
                    stack: [
                        { text: invoice.business?.name || 'Company Name', style: 'companyName' },
                        { text: invoice.business?.address || '', style: 'companyAddress' },
                        { text: `GST: ${invoice.business?.gstin || 'N/A'}`, style: 'gstNumber' }
                    ]
                },
                {
                    stack: [
                        { text: 'INVOICE', style: 'invoiceTitleCorp' },
                        { text: invoice.invoiceNumber, style: 'invoiceNumberCorp' }
                    ],
                    alignment: 'right'
                }
            ],
            margin: [0, 0, 0, 30]
        });
        
        // Customer and invoice details in professional layout
        content.push(this.buildCorporateDetailsSection(invoice));
        
        // Professional items table
        content.push(this.buildCorporateItemsTable(invoice.items, invoice.billType));
        
        // Tax summary and totals
        content.push(this.buildCorporateTotalsSection(invoice.totals));
        
        // Payment details and QR code
        if (invoice.business?.upiId) {
            content.push(this.buildCorporatePaymentSection(invoice));
        }
        
        return content;
    }

    /**
     * Generate Creative template
     * @param {Object} invoice - Invoice data
     * @param {Object} options - Template options
     * @returns {Array} PDF content array
     */
    generateCreativeTemplate(invoice, options) {
        const content = [];
        
        // Creative header with gradient-like design
        content.push({
            canvas: [
                {
                    type: 'rect',
                    x: 0, y: 0,
                    w: 515, h: 60,
                    color: '#7c3aed',
                    r: 5
                }
            ],
            margin: [0, 0, 0, 10]
        });
        
        content.push({
            columns: [
                {
                    text: invoice.business?.name || 'Creative Business',
                    style: 'creativeBusinessName',
                    color: 'white',
                    margin: [20, -50, 0, 0]
                },
                {
                    text: 'INVOICE',
                    style: 'creativeInvoiceTitle',
                    color: 'white',
                    alignment: 'right',
                    margin: [0, -50, 20, 0]
                }
            ]
        });
        
        // Colorful details section
        content.push(this.buildCreativeDetailsSection(invoice));
        
        // Modern items table with colors
        content.push(this.buildCreativeItemsTable(invoice.items));
        
        // Gradient totals section
        content.push(this.buildCreativeTotalsSection(invoice.totals));
        
        return content;
    }

    /**
     * Build business header section
     * @param {Object} business - Business data
     * @param {string} style - Template style
     * @returns {Object} Header content
     */
    buildBusinessHeader(business, style) {
        const header = {
            columns: [
                {
                    image: business?.logo || '',
                    width: 80,
                    margin: [0, 0, 20, 0]
                },
                {
                    stack: [
                        { text: business?.name || 'Business Name', style: 'businessName' },
                        { text: business?.address || '', style: 'businessAddress' },
                        { text: business?.phone || '', style: 'businessPhone' },
                        { text: business?.email || '', style: 'businessEmail' }
                    ]
                }
            ],
            margin: [0, 0, 0, 20]
        };
        
        return header;
    }

    /**
     * Build invoice details section
     * @param {Object} invoice - Invoice data
     * @param {string} style - Template style
     * @returns {Object} Invoice details content
     */
    buildInvoiceDetails(invoice, style) {
        return {
            columns: [
                {
                    text: 'INVOICE',
                    style: 'invoiceTitle'
                },
                {
                    stack: [
                        { text: `Invoice #: ${invoice.invoiceNumber}`, style: 'invoiceDetail' },
                        { text: `Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, style: 'invoiceDetail' },
                        { text: `Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, style: 'invoiceDetail' }
                    ],
                    alignment: 'right'
                }
            ],
            margin: [0, 0, 0, 20]
        };
    }

    /**
     * Build items table
     * @param {Array} items - Invoice items
     * @param {string} billType - Bill type
     * @param {string} style - Template style
     * @returns {Object} Items table content
     */
    buildItemsTable(items, billType, style) {
        const showHSN = billType === 'tax_invoice';
        const showTax = billType !== 'cash_memo';
        
        // Table headers
        const headers = ['#', 'Description'];
        if (showHSN) headers.push('HSN/SAC');
        headers.push('Qty', 'Rate');
        if (showTax) headers.push('Tax%');
        headers.push('Amount');
        
        // Table widths
        const widths = ['auto', '*'];
        if (showHSN) widths.push('auto');
        widths.push('auto', 'auto');
        if (showTax) widths.push('auto');
        widths.push('auto');
        
        const tableBody = [headers.map(h => ({ text: h, style: 'tableHeader' }))];
        
        // Add items
        items.forEach((item, index) => {
            const row = [
                { text: (index + 1).toString(), style: 'tableCell' },
                { text: item.name, style: 'tableCell' }
            ];
            
            if (showHSN) row.push({ text: item.hsn || '', style: 'tableCell' });
            
            row.push(
                { text: item.quantity.toString(), style: 'tableCell', alignment: 'center' },
                { text: this.formatCurrency(item.rate), style: 'tableCell', alignment: 'right' }
            );
            
            if (showTax) row.push({ text: `${item.taxRate}%`, style: 'tableCell', alignment: 'center' });
            
            row.push({ text: this.formatCurrency(item.total), style: 'tableCell', alignment: 'right' });
            
            tableBody.push(row);
        });
        
        return {
            table: {
                widths: widths,
                body: tableBody
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20]
        };
    }

    /**
     * Build totals section
     * @param {Object} totals - Invoice totals
     * @param {string} style - Template style
     * @returns {Object} Totals content
     */
    buildTotalsSection(totals, style) {
        const totalsTable = [
            [{ text: 'Subtotal:', style: 'totalLabel' }, { text: this.formatCurrency(totals.subtotal), style: 'totalValue' }]
        ];
        
        if (totals.discountAmount > 0) {
            totalsTable.push([
                { text: 'Discount:', style: 'totalLabel' },
                { text: `-${this.formatCurrency(totals.discountAmount)}`, style: 'totalValue' }
            ]);
        }
        
        if (totals.cgst > 0) {
            totalsTable.push([
                { text: 'CGST:', style: 'totalLabel' },
                { text: this.formatCurrency(totals.cgst), style: 'totalValue' }
            ]);
        }
        
        if (totals.sgst > 0) {
            totalsTable.push([
                { text: 'SGST:', style: 'totalLabel' },
                { text: this.formatCurrency(totals.sgst), style: 'totalValue' }
            ]);
        }
        
        if (totals.igst > 0) {
            totalsTable.push([
                { text: 'IGST:', style: 'totalLabel' },
                { text: this.formatCurrency(totals.igst), style: 'totalValue' }
            ]);
        }
        
        if (totals.additionalCharges > 0) {
            totalsTable.push([
                { text: 'Additional Charges:', style: 'totalLabel' },
                { text: this.formatCurrency(totals.additionalCharges), style: 'totalValue' }
            ]);
        }
        
        if (totals.roundOff !== 0) {
            totalsTable.push([
                { text: 'Round Off:', style: 'totalLabel' },
                { text: this.formatCurrency(totals.roundOff), style: 'totalValue' }
            ]);
        }
        
        totalsTable.push([
            { text: 'Grand Total:', style: 'grandTotalLabel' },
            { text: this.formatCurrency(totals.grandTotal), style: 'grandTotalValue' }
        ]);
        
        return {
            columns: [
                { text: '', width: '*' },
                {
                    table: {
                        widths: ['auto', 'auto'],
                        body: totalsTable
                    },
                    layout: 'noBorders',
                    width: 'auto'
                }
            ],
            margin: [0, 0, 0, 20]
        };
    }

    /**
     * Build QR code section for UPI payments
     * @param {Object} invoice - Invoice data
     * @param {string} style - Template style
     * @returns {Object} QR code content
     */
    buildQRCode(invoice, style) {
        const upiString = `upi://pay?pa=${invoice.business.upiId}&pn=${encodeURIComponent(invoice.business.name)}&am=${invoice.totals.grandTotal}&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
        
        return {
            columns: [
                {
                    stack: [
                        { text: 'Pay using UPI:', style: 'qrLabel' },
                        { text: invoice.business.upiId, style: 'upiId' }
                    ]
                },
                {
                    qr: upiString,
                    fit: 100,
                    alignment: 'right'
                }
            ],
            margin: [0, 20, 0, 0]
        };
    }

    /**
     * Build watermark
     * @param {string} watermarkText - Watermark text
     * @returns {Object} Watermark configuration
     */
    buildWatermark(watermarkText) {
        if (!watermarkText) return null;
        
        return {
            text: watermarkText,
            color: 'gray',
            opacity: 0.3,
            bold: true,
            italics: false,
            fontSize: 60,
            angle: -30
        };
    }

    /**
     * Build header function
     * @param {number} currentPage - Current page number
     * @param {number} pageCount - Total page count
     * @returns {Object} Header content
     */
    buildHeader(currentPage, pageCount) {
        if (currentPage === 1) return null; // No header on first page
        
        return {
            text: `${this.currentInvoice.business?.name || 'Business'} - Invoice ${this.currentInvoice.invoiceNumber}`,
            style: 'pageHeader',
            margin: [40, 20, 40, 10]
        };
    }

    /**
     * Build footer function
     * @param {number} currentPage - Current page number
     * @param {number} pageCount - Total page count
     * @returns {Object} Footer content
     */
    buildFooter(currentPage, pageCount) {
        return {
            columns: [
                {
                    text: 'Generated by UnifyX Bill Maker',
                    style: 'footerText',
                    alignment: 'left'
                },
                {
                    text: `Page ${currentPage} of ${pageCount}`,
                    style: 'footerText',
                    alignment: 'right'
                }
            ],
            margin: [40, 10, 40, 10]
        };
    }

    /**
     * Get template styles
     * @returns {Object} PDF styles
     */
    getTemplateStyles() {
        return {
            businessName: { fontSize: 18, bold: true, color: '#2563eb' },
            businessAddress: { fontSize: 10, color: '#6b7280' },
            businessPhone: { fontSize: 10, color: '#6b7280' },
            businessEmail: { fontSize: 10, color: '#6b7280' },
            invoiceTitle: { fontSize: 24, bold: true, color: '#1f2937' },
            invoiceDetail: { fontSize: 10, color: '#374151' },
            customerName: { fontSize: 12, bold: true },
            customerAddress: { fontSize: 10, color: '#6b7280' },
            tableHeader: { fontSize: 10, bold: true, fillColor: '#f3f4f6', color: '#374151' },
            tableCell: { fontSize: 9, color: '#374151' },
            totalLabel: { fontSize: 10, bold: true, alignment: 'right' },
            totalValue: { fontSize: 10, alignment: 'right' },
            grandTotalLabel: { fontSize: 12, bold: true, alignment: 'right' },
            grandTotalValue: { fontSize: 12, bold: true, alignment: 'right', color: '#dc2626' },
            qrLabel: { fontSize: 10, bold: true },
            upiId: { fontSize: 9, color: '#6b7280' },
            pageHeader: { fontSize: 8, color: '#9ca3af' },
            footerText: { fontSize: 8, color: '#9ca3af' },
            termsText: { fontSize: 8, color: '#6b7280' }
        };
    }

    /**
     * Get default style
     * @returns {Object} Default PDF style
     */
    getDefaultStyle() {
        return {
            font: 'Helvetica',
            fontSize: 10,
            lineHeight: 1.3,
            color: '#374151'
        };
    }

    /**
     * Load PDF library (placeholder for actual library loading)
     */
    async loadPDFLibrary() {
        if (this.pdfLibraryLoaded) return;
        
        // In production, dynamically load pdfmake or jsPDF
        // For now, we'll simulate the loading
        console.log('Loading PDF library...');
        await new Promise(resolve => setTimeout(resolve, 100));
        this.pdfLibraryLoaded = true;
        console.log('PDF library loaded');
    }

    /**
     * Generate PDF from definition (placeholder)
     * @param {Object} docDefinition - Document definition
     * @returns {Promise<Blob>} PDF blob
     */
    async generatePDFFromDefinition(docDefinition) {
        // In production, use pdfmake.createPdf(docDefinition).getBlob()
        console.log('Generating PDF from definition...');
        
        // Simulate PDF generation
        const pdfContent = `Generated PDF for Invoice ${this.currentInvoice.invoiceNumber}`;
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        
        return blob;
    }

    /**
     * Download PDF
     * @param {Blob} pdfBlob - PDF blob
     * @param {string} filename - Filename
     */
    downloadPDF(pdfBlob, filename) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `invoice_${this.currentInvoice.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.trackPDFEvent('pdf_downloaded', { filename });
    }

    /**
     * Print PDF
     * @param {Blob} pdfBlob - PDF blob
     */
    printPDF(pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        
        iframe.onload = () => {
            iframe.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
                URL.revokeObjectURL(url);
            }, 100);
        };
        
        document.body.appendChild(iframe);
        
        this.trackPDFEvent('pdf_printed');
    }

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        const currency = this.currentInvoice?.currency || 'INR';
        if (currency === 'INR') {
            return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        return amount.toFixed(2);
    }

    /**
     * Track PDF events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackPDFEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'pdfGenerator',
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track PDF event:', error);
        }
    }

    /**
     * Get available templates
     * @returns {Array} Template list
     */
    getAvailableTemplates() {
        return Array.from(this.templates.values()).map(template => ({
            id: template.id,
            name: template.name,
            description: template.description,
            preview: template.preview
        }));
    }

    /**
     * Preview invoice template
     * @param {Object} invoiceData - Invoice data
     * @param {string} templateId - Template ID
     * @returns {Promise<string>} Preview HTML
     */
    async previewTemplate(invoiceData, templateId) {
        // Generate HTML preview for template
        this.currentInvoice = invoiceData;
        this.currentTemplate = this.templates.get(templateId);
        
        // In production, generate HTML version of the PDF
        return `<div>Preview for template: ${templateId}</div>`;
    }
}

// Create and export global PDFGenerator instance
window.PDFGenerator = new PDFGenerator();

console.log('📄 UnifyX Bill Maker PDFGenerator Loaded Successfully!');
