/**
 * ⚡️ UnifyX Bill Maker - Form Components
 * Dynamic form generation and validation components
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class FormComponents {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        
        this.initializeValidators();
        
        console.log('📝 FormComponents initialized');
    }

    /**
     * Initialize form validators
     */
    initializeValidators() {
        this.validators.set('required', (value) => ({
            valid: value && value.toString().trim() !== '',
            message: 'This field is required'
        }));

        this.validators.set('email', (value) => ({
            valid: !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        }));

        this.validators.set('phone', (value) => ({
            valid: !value || /^[+]?[(]?[\d\s\-()]{10,}$/.test(value),
            message: 'Please enter a valid phone number'
        }));

        this.validators.set('number', (value) => ({
            valid: !value || /^\d*\.?\d+$/.test(value),
            message: 'Please enter a valid number'
        }));

        this.validators.set('gstin', (value) => ({
            valid: !value || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value),
            message: 'Please enter a valid GSTIN'
        }));
    }

    /**
     * Create a dynamic form
     */
    createForm(containerId, formConfig) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            title = 'Form',
            fields = [],
            submitText = 'Submit',
            onSubmit = null,
            layout = 'vertical'
        } = formConfig;

        let html = `
            <form class="dynamic-form ${layout}" id="${containerId}-form">
                <div class="form-header">
                    <h3 class="form-title">${title}</h3>
                </div>
                <div class="form-body">
        `;

        fields.forEach(field => {
            html += this.createField(field);
        });

        html += `
                </div>
                <div class="form-footer">
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal')?.classList.remove('active')">Cancel</button>
                        <button type="submit" class="btn btn-primary">${submitText}</button>
                    </div>
                </div>
            </form>
        `;

        container.innerHTML = html;

        // Setup form submission
        const form = document.getElementById(`${containerId}-form`);
        if (form && onSubmit) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    const formData = this.getFormData(form);
                    onSubmit(formData);
                }
            });
        }

        this.forms.set(containerId, formConfig);
    }

    /**
     * Create individual form field
     */
    createField(field) {
        const {
            name,
            type = 'text',
            label,
            placeholder = '',
            required = false,
            options = [],
            value = '',
            validators = []
        } = field;

        let fieldHtml = '';

        switch (type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'date':
            case 'password':
                fieldHtml = `
                    <input 
                        type="${type}" 
                        id="${name}" 
                        name="${name}" 
                        class="input" 
                        placeholder="${placeholder}"
                        value="${value}"
                        ${required ? 'required' : ''}
                        data-validators="${validators.join(',')}"
                    />
                `;
                break;

            case 'textarea':
                fieldHtml = `
                    <textarea 
                        id="${name}" 
                        name="${name}" 
                        class="textarea" 
                        placeholder="${placeholder}"
                        ${required ? 'required' : ''}
                        data-validators="${validators.join(',')}"
                    >${value}</textarea>
                `;
                break;

            case 'select':
                fieldHtml = `
                    <select 
                        id="${name}" 
                        name="${name}" 
                        class="select"
                        ${required ? 'required' : ''}
                        data-validators="${validators.join(',')}"
                    >
                        <option value="">Select ${label}</option>
                        ${options.map(option => 
                            `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`
                        ).join('')}
                    </select>
                `;
                break;

            case 'checkbox':
                fieldHtml = `
                    <label class="checkbox">
                        <input 
                            type="checkbox" 
                            id="${name}" 
                            name="${name}" 
                            value="1"
                            ${value ? 'checked' : ''}
                            data-validators="${validators.join(',')}"
                        />
                        <span class="checkmark"></span>
                        ${label}
                    </label>
                `;
                return `<div class="form-group">${fieldHtml}</div>`;

            case 'radio':
                fieldHtml = options.map(option => `
                    <label class="radio">
                        <input 
                            type="radio" 
                            name="${name}" 
                            value="${option.value}"
                            ${option.value === value ? 'checked' : ''}
                            data-validators="${validators.join(',')}"
                        />
                        <span class="radiomark"></span>
                        ${option.label}
                    </label>
                `).join('');
                break;

            case 'file':
                fieldHtml = `
                    <input 
                        type="file" 
                        id="${name}" 
                        name="${name}" 
                        class="input" 
                        ${field.accept ? `accept="${field.accept}"` : ''}
                        ${field.multiple ? 'multiple' : ''}
                        ${required ? 'required' : ''}
                        data-validators="${validators.join(',')}"
                    />
                `;
                break;
        }

        return `
            <div class="form-group">
                ${type !== 'checkbox' ? `<label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>` : ''}
                ${fieldHtml}
                <div class="form-error" id="${name}-error"></div>
            </div>
        `;
    }

    /**
     * Validate entire form
     */
    validateForm(form) {
        let isValid = true;
        const formData = new FormData(form);
        
        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
            el.parentElement.classList.remove('has-error');
        });

        // Validate each field
        form.querySelectorAll('[data-validators]').forEach(field => {
            const validators = field.dataset.validators.split(',').filter(Boolean);
            const value = formData.get(field.name) || field.value;
            
            for (const validatorName of validators) {
                const validator = this.validators.get(validatorName);
                if (validator) {
                    const result = validator(value);
                    if (!result.valid) {
                        this.showFieldError(field, result.message);
                        isValid = false;
                        break;
                    }
                }
            }
        });

        return isValid;
    }

    /**
     * Show field validation error
     */
    showFieldError(field, message) {
        const errorEl = document.getElementById(`${field.name}-error`);
        if (errorEl) {
            errorEl.textContent = message;
            field.closest('.form-group').classList.add('has-error');
        }
    }

    /**
     * Get form data as object
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Handle unchecked checkboxes
        form.querySelectorAll('input[type="checkbox"]:not(:checked)').forEach(checkbox => {
            if (!data[checkbox.name]) {
                data[checkbox.name] = false;
            }
        });

        return data;
    }

    /**
     * Create customer form
     */
    createCustomerForm(containerId, customer = null) {
        const formConfig = {
            title: customer ? 'Edit Customer' : 'Add Customer',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    label: 'Customer Name',
                    placeholder: 'Enter customer name',
                    required: true,
                    validators: ['required'],
                    value: customer?.name || ''
                },
                {
                    name: 'phone',
                    type: 'tel',
                    label: 'Phone Number',
                    placeholder: 'Enter phone number',
                    validators: ['phone'],
                    value: customer?.phone || ''
                },
                {
                    name: 'email',
                    type: 'email',
                    label: 'Email Address',
                    placeholder: 'Enter email address',
                    validators: ['email'],
                    value: customer?.email || ''
                },
                {
                    name: 'address',
                    type: 'textarea',
                    label: 'Address',
                    placeholder: 'Enter customer address',
                    value: customer?.address || ''
                },
                {
                    name: 'gstin',
                    type: 'text',
                    label: 'GSTIN',
                    placeholder: 'Enter GSTIN (optional)',
                    validators: ['gstin'],
                    value: customer?.gstin || ''
                }
            ],
            submitText: customer ? 'Update Customer' : 'Add Customer',
            onSubmit: (data) => {
                if (customer) {
                    this.updateCustomer(customer.id, data);
                } else {
                    this.createCustomer(data);
                }
            }
        };

        this.createForm(containerId, formConfig);
    }

    /**
     * Create product form
     */
    createProductForm(containerId, product = null) {
        const formConfig = {
            title: product ? 'Edit Product' : 'Add Product',
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    label: 'Product Name',
                    placeholder: 'Enter product name',
                    required: true,
                    validators: ['required'],
                    value: product?.name || ''
                },
                {
                    name: 'price',
                    type: 'number',
                    label: 'Price',
                    placeholder: 'Enter price',
                    required: true,
                    validators: ['required', 'number'],
                    value: product?.price || ''
                },
                {
                    name: 'stock',
                    type: 'number',
                    label: 'Stock Quantity',
                    placeholder: 'Enter stock quantity',
                    required: true,
                    validators: ['required', 'number'],
                    value: product?.stock || ''
                },
                {
                    name: 'unit',
                    type: 'select',
                    label: 'Unit',
                    required: true,
                    options: [
                        { value: 'pcs', label: 'Pieces' },
                        { value: 'kg', label: 'Kilograms' },
                        { value: 'gm', label: 'Grams' },
                        { value: 'ltr', label: 'Liters' },
                        { value: 'ml', label: 'Milliliters' }
                    ],
                    value: product?.unit || 'pcs'
                },
                {
                    name: 'taxRate',
                    type: 'select',
                    label: 'Tax Rate (%)',
                    required: true,
                    options: [
                        { value: '0', label: '0%' },
                        { value: '5', label: '5%' },
                        { value: '12', label: '12%' },
                        { value: '18', label: '18%' },
                        { value: '28', label: '28%' }
                    ],
                    value: product?.taxRate || '18'
                },
                {
                    name: 'category',
                    type: 'text',
                    label: 'Category',
                    placeholder: 'Enter product category',
                    value: product?.category || ''
                },
                {
                    name: 'hsn',
                    type: 'text',
                    label: 'HSN/SAC Code',
                    placeholder: 'Enter HSN/SAC code',
                    value: product?.hsn || ''
                },
                {
                    name: 'description',
                    type: 'textarea',
                    label: 'Description',
                    placeholder: 'Enter product description',
                    value: product?.description || ''
                }
            ],
            submitText: product ? 'Update Product' : 'Add Product',
            onSubmit: (data) => {
                if (product) {
                    this.updateProduct(product.id, data);
                } else {
                    this.createProduct(data);
                }
            }
        };

        this.createForm(containerId, formConfig);
    }

    /**
     * Handle customer creation
     */
    async createCustomer(data) {
        try {
            if (window.CustomerManager) {
                await window.CustomerManager.createCustomer(data);
                window.UIManager.showSuccess('Customer Added', 'Customer has been added successfully');
                
                // Close modal and refresh
                document.querySelector('.modal.active')?.classList.remove('active');
                if (window.UnifyXApp) {
                    window.UnifyXApp.loadTabContent('customers');
                }
            }
        } catch (error) {
            console.error('Failed to create customer:', error);
            window.UIManager.showError('Error', error.message);
        }
    }

    /**
     * Handle customer update
     */
    async updateCustomer(customerId, data) {
        try {
            if (window.CustomerManager) {
                await window.CustomerManager.updateCustomer(customerId, data);
                window.UIManager.showSuccess('Customer Updated', 'Customer has been updated successfully');
                
                // Close modal and refresh
                document.querySelector('.modal.active')?.classList.remove('active');
                if (window.UnifyXApp) {
                    window.UnifyXApp.loadTabContent('customers');
                }
            }
        } catch (error) {
            console.error('Failed to update customer:', error);
            window.UIManager.showError('Error', error.message);
        }
    }

    /**
     * Handle product creation
     */
    async createProduct(data) {
        try {
            if (window.ProductManager) {
                await window.ProductManager.createProduct(data);
                window.UIManager.showSuccess('Product Added', 'Product has been added successfully');
                
                // Close modal and refresh
                document.querySelector('.modal.active')?.classList.remove('active');
                if (window.UnifyXApp) {
                    window.UnifyXApp.loadTabContent('products');
                }
            }
        } catch (error) {
            console.error('Failed to create product:', error);
            window.UIManager.showError('Error', error.message);
        }
    }

    /**
     * Handle product update
     */
    async updateProduct(productId, data) {
        try {
            if (window.ProductManager) {
                await window.ProductManager.updateProduct(productId, data);
                window.UIManager.showSuccess('Product Updated', 'Product has been updated successfully');
                
                // Close modal and refresh
                document.querySelector('.modal.active')?.classList.remove('active');
                if (window.UnifyXApp) {
                    window.UnifyXApp.loadTabContent('products');
                }
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            window.UIManager.showError('Error', error.message);
        }
    }

    /**
     * Clear form
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            form.querySelectorAll('.form-error').forEach(el => {
                el.textContent = '';
                el.parentElement.classList.remove('has-error');
            });
        }
    }
}

window.FormComponents = new FormComponents();
