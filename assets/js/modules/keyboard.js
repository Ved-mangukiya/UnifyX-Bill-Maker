/**
 * ⚡️ UnifyX Bill Maker - Keyboard Shortcuts System
 * Complete keyboard navigation and shortcut management for efficiency
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class KeyboardManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.shortcuts = new Map();
        this.contexts = new Map();
        this.activeContext = 'global';
        this.isEnabled = true;
        this.showShortcutsPanel = false;
        this.currentFocusIndex = -1;
        this.focusableElements = [];
        
        // Shortcut categories
        this.categories = {
            GLOBAL: 'global',
            BILLING: 'billing',
            PRODUCT: 'product',
            CUSTOMER: 'customer',
            NAVIGATION: 'navigation',
            MODAL: 'modal'
        };
        
        // Initialize shortcuts
        this.initializeShortcuts();
        this.attachEventListeners();
        this.updateFocusableElements();
        
        console.log('⌨️ KeyboardManager initialized successfully!');
    }

    /**
     * Initialize all keyboard shortcuts
     */
    initializeShortcuts() {
        // Global shortcuts (available everywhere)
        this.addShortcut('F1', this.toggleShortcutsPanel.bind(this), 'Show/hide shortcuts panel', this.categories.GLOBAL);
        this.addShortcut('F2', this.openCalculator.bind(this), 'Open calculator', this.categories.GLOBAL);
        this.addShortcut('Ctrl+/', this.openQuickSearch.bind(this), 'Global search', this.categories.GLOBAL);
        this.addShortcut('Alt+D', this.toggleTheme.bind(this), 'Toggle dark mode', this.categories.GLOBAL);
        
        // Navigation shortcuts
        this.addShortcut('Ctrl+1', () => this.switchTab('dashboard'), 'Go to Dashboard', this.categories.NAVIGATION);
        this.addShortcut('Ctrl+2', () => this.switchTab('products'), 'Go to Products', this.categories.NAVIGATION);
        this.addShortcut('Ctrl+3', () => this.switchTab('customers'), 'Go to Customers', this.categories.NAVIGATION);
        this.addShortcut('Ctrl+4', () => this.switchTab('billing'), 'Go to Billing', this.categories.NAVIGATION);
        this.addShortcut('Ctrl+5', () => this.switchTab('analytics'), 'Go to Analytics', this.categories.NAVIGATION);
        this.addShortcut('Ctrl+6', () => this.switchTab('settings'), 'Go to Settings', this.categories.NAVIGATION);
        
        // Billing shortcuts
        this.addShortcut('Ctrl+N', this.createNewBill.bind(this), 'Create new bill', this.categories.BILLING);
        this.addShortcut('Ctrl+S', this.saveBill.bind(this), 'Save current bill', this.categories.BILLING);
        this.addShortcut('Ctrl+P', this.printBill.bind(this), 'Print/PDF bill', this.categories.BILLING);
        this.addShortcut('Ctrl+D', this.deleteSelectedRow.bind(this), 'Delete selected row', this.categories.BILLING);
        this.addShortcut('Ctrl+B', this.toggleBulkEntry.bind(this), 'Toggle bulk entry mode', this.categories.BILLING);
        this.addShortcut('Ctrl+M', this.toggleMultiBill.bind(this), 'Toggle multi-bill mode', this.categories.BILLING);
        this.addShortcut('Ctrl+G', this.generateBill.bind(this), 'Generate bill', this.categories.BILLING);
        
        // Product shortcuts
        this.addShortcut('F3', this.focusProductSearch.bind(this), 'Focus product search', this.categories.PRODUCT);
        this.addShortcut('Ctrl+Shift+P', this.addNewProduct.bind(this), 'Add new product', this.categories.PRODUCT);
        this.addShortcut('Ctrl+U', this.updateStock.bind(this), 'Update stock', this.categories.PRODUCT);
        
        // Customer shortcuts
        this.addShortcut('F4', this.focusCustomerSearch.bind(this), 'Focus customer search', this.categories.CUSTOMER);
        this.addShortcut('Ctrl+Shift+C', this.addNewCustomer.bind(this), 'Add new customer', this.categories.CUSTOMER);
        
        // Modal shortcuts
        this.addShortcut('Escape', this.closeTopModal.bind(this), 'Close modal/panel', this.categories.MODAL);
        this.addShortcut('Ctrl+Enter', this.confirmModalAction.bind(this), 'Confirm modal action', this.categories.MODAL);
        
        // Form navigation shortcuts
        this.addShortcut('Enter', this.focusNextField.bind(this), 'Move to next field', this.categories.GLOBAL);
        this.addShortcut('Shift+Enter', this.focusPrevField.bind(this), 'Move to previous field', this.categories.GLOBAL);
        this.addShortcut('Tab', this.focusNextField.bind(this), 'Move to next field', this.categories.GLOBAL);
        this.addShortcut('Shift+Tab', this.focusPrevField.bind(this), 'Move to previous field', this.categories.GLOBAL);
        
        // Quick actions
        this.addShortcut('Ctrl+Z', this.undo.bind(this), 'Undo last action', this.categories.GLOBAL);
        this.addShortcut('Ctrl+Y', this.redo.bind(this), 'Redo last action', this.categories.GLOBAL);
        this.addShortcut('Ctrl+R', this.refreshData.bind(this), 'Refresh data', this.categories.GLOBAL);
        
        // Advanced shortcuts
        this.addShortcut('Alt+B', this.openBackup.bind(this), 'Open backup manager', this.categories.GLOBAL);
        this.addShortcut('Alt+E', this.exportData.bind(this), 'Export data', this.categories.GLOBAL);
        this.addShortcut('Alt+I', this.importData.bind(this), 'Import data', this.categories.GLOBAL);
    }

    /**
     * Add a keyboard shortcut
     * @param {string} key - Key combination
     * @param {Function} action - Action to execute
     * @param {string} description - Description of the shortcut
     * @param {string} category - Shortcut category
     */
    addShortcut(key, action, description, category = 'global') {
        this.shortcuts.set(key, {
            action,
            description,
            category,
            enabled: true
        });
    }

    /**
     * Remove a keyboard shortcut
     * @param {string} key - Key combination to remove
     */
    removeShortcut(key) {
        this.shortcuts.delete(key);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Main keydown event listener
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            const keyCombo = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(keyCombo);
            
            if (shortcut && shortcut.enabled && this.canExecuteShortcut(e)) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    shortcut.action(e);
                    this.trackShortcutUsage(keyCombo);
                } catch (error) {
                    console.error(`Failed to execute shortcut ${keyCombo}:`, error);
                }
            }
        });

        // Update focusable elements when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Focus management
        document.addEventListener('focusin', (e) => {
            this.updateCurrentFocusIndex(e.target);
        });
    }

    /**
     * Get key combination string from event
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Key combination
     */
    getKeyCombo(event) {
        const parts = [];
        
        // Add modifier keys
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.shiftKey) parts.push('Shift');
        if (event.altKey) parts.push('Alt');
        if (event.metaKey) parts.push('Meta');
        
        // Add main key
        let key = event.key;
        
        // Handle special keys
        const keyMap = {
            ' ': 'Space',
            'ArrowUp': 'Up',
            'ArrowDown': 'Down',
            'ArrowLeft': 'Left',
            'ArrowRight': 'Right'
        };
        
        key = keyMap[key] || key;
        
        // Capitalize single letters
        if (key.length === 1 && key.match(/[a-z]/i)) {
            key = key.toUpperCase();
        }
        
        parts.push(key);
        
        return parts.join('+');
    }

    /**
     * Check if shortcut can be executed in current context
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {boolean} Can execute
     */
    canExecuteShortcut(event) {
        // Don't execute shortcuts in input fields (except specific ones)
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        const isInput = ['input', 'textarea', 'select'].includes(tagName);
        const isContentEditable = target.contentEditable === 'true';
        
        if (isInput || isContentEditable) {
            // Allow navigation shortcuts in input fields
            const allowedInInputs = ['Tab', 'Shift+Tab', 'Enter', 'Escape', 'F1', 'F2', 'Ctrl+S'];
            const keyCombo = this.getKeyCombo(event);
            
            return allowedInInputs.includes(keyCombo);
        }
        
        // Check if modals are open (some shortcuts should work in modals)
        const modalOpen = document.querySelector('.modal.active') !== null;
        if (modalOpen) {
            const allowedInModals = ['Escape', 'Ctrl+Enter', 'Tab', 'Shift+Tab', 'Enter', 'F1'];
            const keyCombo = this.getKeyCombo(event);
            
            return allowedInModals.includes(keyCombo);
        }
        
        return true;
    }

    /**
     * Update list of focusable elements
     */
    updateFocusableElements() {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');
        
        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });
    }

    /**
     * Update current focus index
     * @param {Element} element - Currently focused element
     */
    updateCurrentFocusIndex(element) {
        this.currentFocusIndex = this.focusableElements.indexOf(element);
    }

    /**
     * Focus next field
     */
    focusNextField() {
        if (this.focusableElements.length === 0) return;
        
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
        this.focusableElements[this.currentFocusIndex]?.focus();
    }

    /**
     * Focus previous field
     */
    focusPrevField() {
        if (this.focusableElements.length === 0) return;
        
        this.currentFocusIndex = this.currentFocusIndex <= 0 
            ? this.focusableElements.length - 1 
            : this.currentFocusIndex - 1;
            
        this.focusableElements[this.currentFocusIndex]?.focus();
    }

    /**
     * Toggle shortcuts panel
     */
    toggleShortcutsPanel() {
        this.showShortcutsPanel = !this.showShortcutsPanel;
        
        if (this.showShortcutsPanel) {
            this.showShortcuts();
        } else {
            this.hideShortcuts();
        }
    }

    /**
     * Show shortcuts panel
     */
    showShortcuts() {
        // Remove existing panel
        const existingPanel = document.getElementById('shortcuts-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        // Create shortcuts panel
        const panel = document.createElement('div');
        panel.id = 'shortcuts-panel';
        panel.className = 'shortcuts-panel active';
        
        const groupedShortcuts = this.groupShortcutsByCategory();
        
        panel.innerHTML = `
            <div class="shortcuts-header">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <button class="shortcuts-close" onclick="window.KeyboardManager.hideShortcuts()">×</button>
            </div>
            <div class="shortcuts-content">
                ${Object.entries(groupedShortcuts).map(([category, shortcuts]) => `
                    <div class="shortcuts-category">
                        <h4>${this.getCategoryDisplayName(category)}</h4>
                        <div class="shortcuts-list">
                            ${shortcuts.map(shortcut => `
                                <div class="shortcut-item">
                                    <kbd class="shortcut-key">${shortcut.key}</kbd>
                                    <span class="shortcut-desc">${shortcut.description}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="shortcuts-footer">
                <small>Press F1 to toggle this panel</small>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', this.handleShortcutsPanelClick.bind(this));
        }, 100);
    }

    /**
     * Hide shortcuts panel
     */
    hideShortcuts() {
        const panel = document.getElementById('shortcuts-panel');
        if (panel) {
            panel.remove();
            this.showShortcutsPanel = false;
            document.removeEventListener('click', this.handleShortcutsPanelClick.bind(this));
        }
    }

    /**
     * Handle shortcuts panel click
     * @param {Event} event - Click event
     */
    handleShortcutsPanelClick(event) {
        const panel = document.getElementById('shortcuts-panel');
        if (panel && !panel.contains(event.target)) {
            this.hideShortcuts();
        }
    }

    /**
     * Group shortcuts by category
     * @returns {Object} Grouped shortcuts
     */
    groupShortcutsByCategory() {
        const grouped = {};
        
        for (const [key, shortcut] of this.shortcuts.entries()) {
            const category = shortcut.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            
            grouped[category].push({
                key,
                description: shortcut.description,
                enabled: shortcut.enabled
            });
        }
        
        // Sort within each category
        Object.keys(grouped).forEach(category => {
            grouped[category].sort((a, b) => a.key.localeCompare(b.key));
        });
        
        return grouped;
    }

    /**
     * Get category display name
     * @param {string} category - Category key
     * @returns {string} Display name
     */
    getCategoryDisplayName(category) {
        const names = {
            global: '🌐 Global',
            billing: '🧾 Billing',
            product: '📦 Products',
            customer: '👥 Customers',
            navigation: '🧭 Navigation',
            modal: '📋 Modals'
        };
        
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Shortcut action implementations
     */

    switchTab(tabName) {
        if (window.UnifyXApp) {
            window.UnifyXApp.switchTab(tabName);
        }
    }

    createNewBill() {
        if (window.BillingEngine) {
            window.BillingEngine.createNewInvoice();
            this.showNotification('New bill created', 'success');
        }
    }

    saveBill() {
        if (window.BillingEngine && window.BillingEngine.currentInvoice) {
            window.BillingEngine.saveCurrentInvoice();
            this.showNotification('Bill saved', 'success');
        }
    }

    printBill() {
        if (window.PDFGenerator && window.BillingEngine?.currentInvoice) {
            window.PDFGenerator.generateInvoicePDF(window.BillingEngine.currentInvoice)
                .then(pdf => {
                    window.PDFGenerator.printPDF(pdf);
                    this.showNotification('Bill sent to printer', 'success');
                })
                .catch(error => {
                    console.error('Failed to print bill:', error);
                    this.showNotification('Failed to print bill', 'error');
                });
        }
    }

    generateBill() {
        if (window.BillingEngine && window.BillingEngine.currentInvoice) {
            window.BillingEngine.generateInvoice();
            this.showNotification('Bill generated successfully', 'success');
        }
    }

    deleteSelectedRow() {
        // Implementation depends on current context
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('.item-row')) {
            const itemRow = activeElement.closest('.item-row');
            const itemId = itemRow.dataset.itemId;
            
            if (itemId && window.BillingEngine) {
                window.BillingEngine.removeItem(itemId);
                this.showNotification('Item deleted', 'success');
            }
        }
    }

    toggleBulkEntry() {
        if (window.BillingEngine) {
            window.BillingEngine.bulkEntryMode = !window.BillingEngine.bulkEntryMode;
            const status = window.BillingEngine.bulkEntryMode ? 'enabled' : 'disabled';
            this.showNotification(`Bulk entry ${status}`, 'info');
        }
    }

    toggleMultiBill() {
        if (window.BillingEngine) {
            if (window.BillingEngine.multiBillMode) {
                window.BillingEngine.disableMultiBillMode();
                this.showNotification('Multi-bill mode disabled', 'info');
            } else {
                window.BillingEngine.enableMultiBillMode();
                this.showNotification('Multi-bill mode enabled', 'info');
            }
        }
    }

    focusProductSearch() {
        const searchInput = document.getElementById('product-search') || 
                           document.querySelector('input[placeholder*="product"]') ||
                           document.querySelector('input[data-search="product"]');
        
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    focusCustomerSearch() {
        const searchInput = document.getElementById('customer-search') || 
                           document.querySelector('input[placeholder*="customer"]') ||
                           document.querySelector('input[data-search="customer"]');
        
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    addNewProduct() {
        // Trigger new product modal/form
        const addProductBtn = document.getElementById('add-product-btn') ||
                             document.querySelector('button[data-action="add-product"]');
        
        if (addProductBtn) {
            addProductBtn.click();
        }
    }

    addNewCustomer() {
        // Trigger new customer modal/form
        const addCustomerBtn = document.getElementById('add-customer-btn') ||
                              document.querySelector('button[data-action="add-customer"]');
        
        if (addCustomerBtn) {
            addCustomerBtn.click();
        }
    }

    closeTopModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const closeBtn = activeModal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
        }
        
        // Also close shortcuts panel
        if (this.showShortcutsPanel) {
            this.hideShortcuts();
        }
    }

    confirmModalAction() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            const confirmBtn = activeModal.querySelector('.btn-primary') ||
                              activeModal.querySelector('button[type="submit"]');
            
            if (confirmBtn) {
                confirmBtn.click();
            }
        }
    }

    openCalculator() {
        // Implementation for calculator
        this.showNotification('Calculator opened', 'info');
        console.log('Calculator shortcut triggered');
    }

    openQuickSearch() {
        // Implementation for quick search
        this.showNotification('Quick search opened', 'info');
        console.log('Quick search shortcut triggered');
    }

    toggleTheme() {
        if (window.UnifyXApp) {
            window.UnifyXApp.toggleTheme();
        }
    }

    undo() {
        // Implementation for undo
        this.showNotification('Undo', 'info');
        console.log('Undo shortcut triggered');
    }

    redo() {
        // Implementation for redo
        this.showNotification('Redo', 'info');
        console.log('Redo shortcut triggered');
    }

    refreshData() {
        // Refresh current tab data
        if (window.UnifyXApp) {
            window.UnifyXApp.loadTabContent(window.UnifyXApp.activeTab);
            this.showNotification('Data refreshed', 'success');
        }
    }

    updateStock() {
        // Implementation for stock update
        this.showNotification('Stock update mode', 'info');
        console.log('Update stock shortcut triggered');
    }

    openBackup() {
        // Implementation for backup manager
        this.showNotification('Backup manager opened', 'info');
        console.log('Backup shortcut triggered');
    }

    exportData() {
        // Implementation for data export
        this.showNotification('Data export started', 'info');
        console.log('Export data shortcut triggered');
    }

    importData() {
        // Implementation for data import
        this.showNotification('Data import dialog opened', 'info');
        console.log('Import data shortcut triggered');
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        if (window.UnifyXApp) {
            window.UnifyXApp.showNotification(type, 'Keyboard Shortcut', message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Track shortcut usage for analytics
     * @param {string} keyCombo - Key combination used
     */
    trackShortcutUsage(keyCombo) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent('shortcut_used', { 
                    shortcut: keyCombo,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.warn('Failed to track shortcut usage:', error);
        }
    }

    /**
     * Enable keyboard shortcuts
     */
    enable() {
        this.isEnabled = true;
        console.log('Keyboard shortcuts enabled');
    }

    /**
     * Disable keyboard shortcuts
     */
    disable() {
        this.isEnabled = false;
        console.log('Keyboard shortcuts disabled');
    }

    /**
     * Get all shortcuts for a category
     * @param {string} category - Category name
     * @returns {Array} Shortcuts in category
     */
    getShortcutsForCategory(category) {
        return Array.from(this.shortcuts.entries())
            .filter(([key, shortcut]) => shortcut.category === category)
            .map(([key, shortcut]) => ({ key, ...shortcut }));
    }

    /**
     * Export shortcuts configuration
     * @returns {Object} Shortcuts configuration
     */
    exportConfig() {
        const config = {};
        
        for (const [key, shortcut] of this.shortcuts.entries()) {
            config[key] = {
                description: shortcut.description,
                category: shortcut.category,
                enabled: shortcut.enabled
            };
        }
        
        return config;
    }

    /**
     * Get keyboard shortcuts help HTML
     * @returns {string} HTML for shortcuts help
     */
    getHelpHTML() {
        const groupedShortcuts = this.groupShortcutsByCategory();
        
        return `
            <div class="keyboard-help">
                <h2>⌨️ Keyboard Shortcuts</h2>
                ${Object.entries(groupedShortcuts).map(([category, shortcuts]) => `
                    <section class="help-section">
                        <h3>${this.getCategoryDisplayName(category)}</h3>
                        <table class="shortcuts-table">
                            ${shortcuts.map(shortcut => `
                                <tr>
                                    <td><kbd>${shortcut.key}</kbd></td>
                                    <td>${shortcut.description}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </section>
                `).join('')}
            </div>
        `;
    }
}

// Create and export global KeyboardManager instance
window.KeyboardManager = new KeyboardManager();

console.log('⌨️ UnifyX Bill Maker KeyboardManager Loaded Successfully!');
