/**
 * ⚡️ UnifyX Bill Maker - Modal Components
 * Modal dialogs and popups
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class ModalComponents {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        
        console.log('🪟 ModalComponents initialized');
    }

    /**
     * Show modal with content
     */
    showModal(config) {
        const {
            id = 'modal-' + Date.now(),
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            backdrop = true,
            buttons = []
        } = config;

        // Remove existing modal if any
        this.hideModal();

        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        modal.id = id;

        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = `
                <div class="modal-footer">
                    ${buttons.map(btn => `
                        <button class="btn btn-${btn.type || 'secondary'}" 
                                onclick="${btn.onClick}"
                                ${btn.disabled ? 'disabled' : ''}>
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="modal-backdrop" ${backdrop ? `onclick="window.ModalComponents.hideModal()"` : ''}></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${closable ? `
                        <button class="modal-close" onclick="window.ModalComponents.hideModal()">×</button>
                    ` : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttonsHtml}
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add to active modal
        this.activeModal = modal;
        this.modals.set(id, modal);

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            
            // Focus first input if any
            const firstInput = modal.querySelector('input, textarea, select, button');
            if (firstInput) {
                firstInput.focus();
            }
        }, 10);

        // Handle ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape' && closable) {
                this.hideModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        return id;
    }

    /**
     * Hide active modal
     */
    hideModal() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            setTimeout(() => {
                if (this.activeModal) {
                    this.activeModal.remove();
                    this.activeModal = null;
                }
            }, 300);
        }
    }

    /**
     * Show confirmation dialog
     */
    showConfirm(message, title = 'Confirm', onConfirm = null, onCancel = null) {
        return this.showModal({
            title: title,
            content: `<p>${message}</p>`,
            size: 'small',
            buttons: [
                {
                    text: 'Cancel',
                    type: 'secondary',
                    onClick: () => {
                        if (onCancel) onCancel();
                        this.hideModal();
                    }
                },
                {
                    text: 'Confirm',
                    type: 'primary',
                    onClick: () => {
                        if (onConfirm) onConfirm();
                        this.hideModal();
                    }
                }
            ]
        });
    }

    /**
     * Show alert dialog
     */
    showAlert(message, title = 'Alert', type = 'info') {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        return this.showModal({
            title: `${icons[type]} ${title}`,
            content: `<p>${message}</p>`,
            size: 'small',
            buttons: [
                {
                    text: 'OK',
                    type: 'primary',
                    onClick: () => this.hideModal()
                }
            ]
        });
    }

    /**
     * Show loading modal
     */
    showLoading(message = 'Loading...') {
        return this.showModal({
            title: 'Please wait',
            content: `
                <div style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                    <p>${message}</p>
                </div>
            `,
            size: 'small',
            closable: false,
            backdrop: false
        });
    }

    /**
     * Show form modal
     */
    showForm(formConfig) {
        const {
            title,
            fields = [],
            onSubmit,
            onCancel,
            submitText = 'Submit',
            cancelText = 'Cancel'
        } = formConfig;

        const formId = 'modal-form-' + Date.now();
        let formHtml = `<form id="${formId}">`;

        fields.forEach(field => {
            formHtml += `
                <div class="form-group">
                    <label class="form-label">${field.label}${field.required ? ' *' : ''}</label>
                    ${this.generateFormField(field)}
                </div>
            `;
        });

        formHtml += '</form>';

        const modalId = this.showModal({
            title: title,
            content: formHtml,
            size: 'medium',
            buttons: [
                {
                    text: cancelText,
                    type: 'secondary',
                    onClick: () => {
                        if (onCancel) onCancel();
                        this.hideModal();
                    }
                },
                {
                    text: submitText,
                    type: 'primary',
                    onClick: () => {
                        const formData = this.getFormData(formId);
                        if (onSubmit) {
                            const result = onSubmit(formData);
                            if (result !== false) {
                                this.hideModal();
                            }
                        } else {
                            this.hideModal();
                        }
                    }
                }
            ]
        });

        return modalId;
    }

    /**
     * Generate form field HTML
     */
    generateFormField(field) {
        const {
            type = 'text',
            name,
            placeholder = '',
            value = '',
            options = [],
            required = false
        } = field;

        switch (type) {
            case 'textarea':
                return `<textarea class="textarea" name="${name}" placeholder="${placeholder}" ${required ? 'required' : ''}>${value}</textarea>`;
            
            case 'select':
                return `
                    <select class="select" name="${name}" ${required ? 'required' : ''}>
                        <option value="">Select ${field.label}</option>
                        ${options.map(opt => `
                            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>
                        `).join('')}
                    </select>
                `;
            
            case 'checkbox':
                return `
                    <label class="checkbox">
                        <input type="checkbox" name="${name}" value="1" ${value ? 'checked' : ''}>
                        <span class="checkmark"></span>
                        ${field.checkboxLabel || field.label}
                    </label>
                `;
            
            default:
                return `<input type="${type}" class="input" name="${name}" placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''}>`;
        }
    }

    /**
     * Get form data from modal
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Handle unchecked checkboxes
        form.querySelectorAll('input[type="checkbox"]:not(:checked)').forEach(checkbox => {
            if (!data.hasOwnProperty(checkbox.name)) {
                data[checkbox.name] = false;
            }
        });

        return data;
    }
}

window.ModalComponents = new ModalComponents();
