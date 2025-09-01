/**
 * ⚡️ UnifyX Bill Maker - Backup & Restore System
 * Complete data backup, restore, import/export, and data management system
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class BackupManager {
    constructor() {
        this.dataManager = window.DataManager;
        this.businessManager = window.BusinessManager;
        this.backupHistory = [];
        this.maxBackups = 10;
        this.autoBackupEnabled = true;
        this.autoBackupInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.compressionEnabled = true;
        
        // Backup file formats
        this.formats = {
            JSON: 'json',
            CSV: 'csv',
            EXCEL: 'xlsx'
        };
        
        // Data types to backup
        this.dataTypes = {
            ALL: 'all',
            BUSINESSES: 'businesses',
            CUSTOMERS: 'customers',
            PRODUCTS: 'products',
            INVOICES: 'invoices',
            SETTINGS: 'settings'
        };
        
        // Initialize backup system
        this.loadBackupHistory();
        this.setupAutoBackup();
        
        console.log('💾 BackupManager initialized successfully!');
    }

    /**
     * Load backup history from storage
     */
    loadBackupHistory() {
        try {
            this.backupHistory = this.dataManager.getItem('backupHistory') || [];
            console.log(`Loaded ${this.backupHistory.length} backup records`);
        } catch (error) {
            console.error('Failed to load backup history:', error);
            this.backupHistory = [];
        }
    }

    /**
     * Save backup history to storage
     */
    saveBackupHistory() {
        try {
            this.dataManager.setItem('backupHistory', this.backupHistory);
        } catch (error) {
            console.error('Failed to save backup history:', error);
        }
    }

    /**
     * Create full system backup
     * @param {Object} options - Backup options
     * @returns {Promise<Object>} Backup data
     */
    async createFullBackup(options = {}) {
        try {
            const {
                includeImages = false,
                compress = this.compressionEnabled,
                password = null,
                description = 'Full system backup'
            } = options;

            console.log('Creating full system backup...');

            // Collect all data
            const backupData = {
                metadata: {
                    version: '1.0.0',
                    type: 'full_backup',
                    description: description,
                    createdAt: new Date().toISOString(),
                    createdBy: 'UnifyX Bill Maker',
                    appVersion: window.AppConfig?.version || '1.0.0',
                    totalSize: 0,
                    compressed: compress,
                    encrypted: !!password
                },
                data: {
                    businesses: this.dataManager.getItem('businesses') || [],
                    customers: this.dataManager.getItem('customers') || [],
                    products: this.dataManager.getItem('products') || [],
                    invoices: this.dataManager.getItem('invoices') || [],
                    drafts: this.dataManager.getItem('drafts') || [],
                    templates: this.dataManager.getItem('templates') || [],
                    settings: this.dataManager.getItem('settings') || {},
                    counters: this.dataManager.getItem('counters') || {},
                    analytics: this.dataManager.getItem('analytics') || []
                }
            };

            // Remove images if not included to reduce size
            if (!includeImages) {
                this.removeImagesFromBackup(backupData.data);
            }

            // Calculate size
            const dataStr = JSON.stringify(backupData);
            backupData.metadata.totalSize = new Blob([dataStr]).size;

            // Compress if enabled
            if (compress) {
                backupData.data = this.compressData(backupData.data);
            }

            // Encrypt if password provided
            if (password) {
                backupData.data = await this.encryptData(backupData.data, password);
            }

            // Save backup record
            const backupRecord = {
                id: this.generateBackupId(),
                metadata: backupData.metadata,
                size: backupData.metadata.totalSize,
                createdAt: backupData.metadata.createdAt
            };

            this.backupHistory.push(backupRecord);
            this.maintainBackupHistory();
            this.saveBackupHistory();

            // Track backup creation
            this.trackBackupEvent('backup_created', {
                type: 'full',
                size: backupData.metadata.totalSize,
                compressed: compress,
                encrypted: !!password
            });

            console.log(`Full backup created successfully (${this.formatBytes(backupData.metadata.totalSize)})`);
            return backupData;

        } catch (error) {
            console.error('Failed to create full backup:', error);
            throw error;
        }
    }

    /**
     * Create selective backup
     * @param {Array} dataTypes - Types of data to backup
     * @param {Object} options - Backup options
     * @returns {Promise<Object>} Backup data
     */
    async createSelectiveBackup(dataTypes, options = {}) {
        try {
            const {
                compress = this.compressionEnabled,
                description = 'Selective backup'
            } = options;

            console.log(`Creating selective backup for: ${dataTypes.join(', ')}`);

            const backupData = {
                metadata: {
                    version: '1.0.0',
                    type: 'selective_backup',
                    description: description,
                    dataTypes: dataTypes,
                    createdAt: new Date().toISOString(),
                    createdBy: 'UnifyX Bill Maker',
                    compressed: compress
                },
                data: {}
            };

            // Collect selected data types
            dataTypes.forEach(type => {
                switch (type) {
                    case this.dataTypes.BUSINESSES:
                        backupData.data.businesses = this.dataManager.getItem('businesses') || [];
                        break;
                    case this.dataTypes.CUSTOMERS:
                        backupData.data.customers = this.dataManager.getItem('customers') || [];
                        break;
                    case this.dataTypes.PRODUCTS:
                        backupData.data.products = this.dataManager.getItem('products') || [];
                        break;
                    case this.dataTypes.INVOICES:
                        backupData.data.invoices = this.dataManager.getItem('invoices') || [];
                        break;
                    case this.dataTypes.SETTINGS:
                        backupData.data.settings = this.dataManager.getItem('settings') || {};
                        break;
                }
            });

            // Calculate size and compress if needed
            const dataStr = JSON.stringify(backupData);
            backupData.metadata.totalSize = new Blob([dataStr]).size;

            if (compress) {
                backupData.data = this.compressData(backupData.data);
            }

            // Save backup record
            const backupRecord = {
                id: this.generateBackupId(),
                metadata: backupData.metadata,
                size: backupData.metadata.totalSize,
                createdAt: backupData.metadata.createdAt
            };

            this.backupHistory.push(backupRecord);
            this.saveBackupHistory();

            console.log(`Selective backup created successfully (${this.formatBytes(backupData.metadata.totalSize)})`);
            return backupData;

        } catch (error) {
            console.error('Failed to create selective backup:', error);
            throw error;
        }
    }

    /**
     * Restore from backup data
     * @param {Object} backupData - Backup data to restore
     * @param {Object} options - Restore options
     * @returns {Promise<boolean>} Success status
     */
    async restoreFromBackup(backupData, options = {}) {
        try {
            const {
                mergeData = false,
                password = null,
                confirmOverwrite = true
            } = options;

            console.log('Starting data restore...');

            // Validate backup data
            if (!this.validateBackupData(backupData)) {
                throw new Error('Invalid backup data format');
            }

            // Create current state backup before restore
            if (confirmOverwrite) {
                await this.createFullBackup({
                    description: 'Pre-restore backup',
                    compress: true
                });
            }

            let data = backupData.data;

            // Decrypt if needed
            if (backupData.metadata.encrypted && password) {
                data = await this.decryptData(data, password);
            }

            // Decompress if needed
            if (backupData.metadata.compressed) {
                data = this.decompressData(data);
            }

            // Restore data
            const restoreResults = {
                successful: [],
                failed: [],
                skipped: []
            };

            for (const [dataType, dataValue] of Object.entries(data)) {
                try {
                    if (mergeData && dataType !== 'settings' && dataType !== 'counters') {
                        // Merge with existing data
                        const existingData = this.dataManager.getItem(dataType) || [];
                        const mergedData = this.mergeDataArrays(existingData, dataValue, dataType);
                        this.dataManager.setItem(dataType, mergedData);
                    } else {
                        // Replace existing data
                        this.dataManager.setItem(dataType, dataValue);
                    }
                    
                    restoreResults.successful.push(dataType);
                    console.log(`Restored ${dataType}: ${Array.isArray(dataValue) ? dataValue.length : 1} items`);
                    
                } catch (error) {
                    console.error(`Failed to restore ${dataType}:`, error);
                    restoreResults.failed.push({ dataType, error: error.message });
                }
            }

            // Update managers
            this.refreshManagers();

            // Track restore operation
            this.trackBackupEvent('data_restored', {
                backupType: backupData.metadata.type,
                successful: restoreResults.successful.length,
                failed: restoreResults.failed.length,
                mergeMode: mergeData
            });

            console.log(`Restore completed: ${restoreResults.successful.length} successful, ${restoreResults.failed.length} failed`);
            return restoreResults.failed.length === 0;

        } catch (error) {
            console.error('Failed to restore backup:', error);
            throw error;
        }
    }

    /**
     * Export data to file
     * @param {string} format - Export format (json, csv, xlsx)
     * @param {Array} dataTypes - Data types to export
     * @param {string} filename - Export filename
     * @returns {Promise<void>}
     */
    async exportData(format, dataTypes = [this.dataTypes.ALL], filename = null) {
        try {
            let data;
            let exportFilename = filename;

            if (dataTypes.includes(this.dataTypes.ALL)) {
                // Export all data
                data = await this.createFullBackup({ includeImages: false });
                exportFilename = exportFilename || `unifyX_full_backup_${this.getDateString()}.${format}`;
            } else {
                // Export selected data
                data = await this.createSelectiveBackup(dataTypes);
                exportFilename = exportFilename || `unifyX_selective_backup_${this.getDateString()}.${format}`;
            }

            let exportContent;

            switch (format.toLowerCase()) {
                case this.formats.JSON:
                    exportContent = JSON.stringify(data, null, 2);
                    break;
                case this.formats.CSV:
                    exportContent = this.convertToCSV(data);
                    break;
                case this.formats.EXCEL:
                    exportContent = await this.convertToExcel(data);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            // Download file
            this.downloadFile(exportContent, exportFilename, this.getMimeType(format));

            // Track export
            this.trackBackupEvent('data_exported', {
                format: format,
                dataTypes: dataTypes,
                filename: exportFilename,
                size: new Blob([exportContent]).size
            });

            console.log(`Data exported successfully: ${exportFilename}`);

        } catch (error) {
            console.error('Failed to export data:', error);
            throw error;
        }
    }

    /**
     * Import data from file
     * @param {File} file - File to import
     * @param {Object} options - Import options
     * @returns {Promise<Object>} Import result
     */
    async importData(file, options = {}) {
        try {
            const {
                mergeData = false,
                validateData = true
            } = options;

            console.log(`Importing data from: ${file.name}`);

            // Read file content
            const fileContent = await this.readFile(file);
            let importData;

            // Parse based on file extension
            const fileExtension = file.name.split('.').pop().toLowerCase();

            switch (fileExtension) {
                case 'json':
                    importData = JSON.parse(fileContent);
                    break;
                case 'csv':
                    importData = this.parseCSV(fileContent);
                    break;
                default:
                    throw new Error(`Unsupported file format: ${fileExtension}`);
            }

            // Validate import data
            if (validateData && !this.validateBackupData(importData)) {
                throw new Error('Invalid backup file format');
            }

            // Restore data
            const restoreResult = await this.restoreFromBackup(importData, { mergeData });

            // Track import
            this.trackBackupEvent('data_imported', {
                filename: file.name,
                fileSize: file.size,
                format: fileExtension,
                successful: restoreResult
            });

            console.log(`Data imported successfully from: ${file.name}`);
            return { success: restoreResult, filename: file.name };

        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }

    /**
     * Setup automatic backup system
     */
    setupAutoBackup() {
        if (!this.autoBackupEnabled) return;

        // Create backup every 24 hours
        setInterval(async () => {
            try {
                console.log('Running automatic backup...');
                
                await this.createFullBackup({
                    description: 'Automatic backup',
                    compress: true,
                    includeImages: false
                });

                this.showNotification('Automatic backup completed', 'success');
                
            } catch (error) {
                console.error('Auto-backup failed:', error);
                this.showNotification('Automatic backup failed', 'error');
            }
        }, this.autoBackupInterval);

        console.log('Auto-backup scheduled every 24 hours');
    }

    /**
     * Get backup history
     * @returns {Array} Backup history
     */
    getBackupHistory() {
        return [...this.backupHistory].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Delete backup record
     * @param {string} backupId - Backup ID to delete
     * @returns {boolean} Success status
     */
    deleteBackup(backupId) {
        try {
            const index = this.backupHistory.findIndex(backup => backup.id === backupId);
            
            if (index !== -1) {
                this.backupHistory.splice(index, 1);
                this.saveBackupHistory();
                
                this.trackBackupEvent('backup_deleted', { backupId });
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Failed to delete backup:', error);
            return false;
        }
    }

    /**
     * Clear all backup history
     */
    clearBackupHistory() {
        try {
            this.backupHistory = [];
            this.saveBackupHistory();
            
            this.trackBackupEvent('backup_history_cleared');
            console.log('Backup history cleared');
            
        } catch (error) {
            console.error('Failed to clear backup history:', error);
        }
    }

    /**
     * Utility Methods
     */

    /**
     * Generate unique backup ID
     * @returns {string} Backup ID
     */
    generateBackupId() {
        return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get formatted date string
     * @returns {string} Date string
     */
    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0].replace(/-/g, '');
    }

    /**
     * Validate backup data structure
     * @param {Object} backupData - Backup data to validate
     * @returns {boolean} Is valid
     */
    validateBackupData(backupData) {
        return backupData && 
               backupData.metadata && 
               backupData.data && 
               backupData.metadata.version &&
               typeof backupData.data === 'object';
    }

    /**
     * Remove images from backup data to reduce size
     * @param {Object} data - Backup data
     */
    removeImagesFromBackup(data) {
        // Remove business logos and signatures
        if (data.businesses) {
            data.businesses.forEach(business => {
                delete business.logo;
                delete business.signature;
            });
        }

        // Remove product images
        if (data.products) {
            data.products.forEach(product => {
                delete product.image;
            });
        }
    }

    /**
     * Simple data compression (placeholder)
     * @param {Object} data - Data to compress
     * @returns {string} Compressed data
     */
    compressData(data) {
        // In production, use proper compression library like pako
        return btoa(JSON.stringify(data));
    }

    /**
     * Simple data decompression (placeholder)
     * @param {string} compressedData - Compressed data
     * @returns {Object} Decompressed data
     */
    decompressData(compressedData) {
        // In production, use proper compression library like pako
        return JSON.parse(atob(compressedData));
    }

    /**
     * Encrypt data (placeholder for future implementation)
     * @param {Object} data - Data to encrypt
     * @param {string} password - Encryption password
     * @returns {Promise<string>} Encrypted data
     */
    async encryptData(data, password) {
        // Placeholder for encryption - implement with crypto library
        console.warn('Encryption not implemented - data stored as plain text');
        return JSON.stringify(data);
    }

    /**
     * Decrypt data (placeholder for future implementation)
     * @param {string} encryptedData - Encrypted data
     * @param {string} password - Decryption password
     * @returns {Promise<Object>} Decrypted data
     */
    async decryptData(encryptedData, password) {
        // Placeholder for decryption - implement with crypto library
        console.warn('Decryption not implemented - assuming plain text');
        return JSON.parse(encryptedData);
    }

    /**
     * Merge data arrays avoiding duplicates
     * @param {Array} existingData - Existing data array
     * @param {Array} newData - New data array
     * @param {string} dataType - Type of data being merged
     * @returns {Array} Merged data
     */
    mergeDataArrays(existingData, newData, dataType) {
        if (!Array.isArray(existingData) || !Array.isArray(newData)) {
            return newData;
        }

        const merged = [...existingData];
        const existingIds = new Set(existingData.map(item => item.id));

        newData.forEach(newItem => {
            if (!existingIds.has(newItem.id)) {
                merged.push(newItem);
            }
        });

        return merged;
    }

    /**
     * Convert data to CSV format
     * @param {Object} data - Data to convert
     * @returns {string} CSV content
     */
    convertToCSV(data) {
        let csv = '';
        
        // Add metadata as comments
        csv += `# UnifyX Bill Maker Data Export\n`;
        csv += `# Created: ${data.metadata.createdAt}\n`;
        csv += `# Type: ${data.metadata.type}\n\n`;

        // Convert each data type to CSV
        Object.entries(data.data).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                csv += `# ${key.toUpperCase()}\n`;
                
                const headers = Object.keys(value[0]);
                csv += headers.join(',') + '\n';
                
                value.forEach(item => {
                    const row = headers.map(header => {
                        const val = item[header];
                        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
                    });
                    csv += row.join(',') + '\n';
                });
                
                csv += '\n';
            }
        });

        return csv;
    }

    /**
     * Convert data to Excel format (placeholder)
     * @param {Object} data - Data to convert
     * @returns {Promise<Blob>} Excel blob
     */
    async convertToExcel(data) {
        // Placeholder for Excel conversion - implement with library like xlsx
        throw new Error('Excel export not implemented yet');
    }

    /**
     * Parse CSV content
     * @param {string} csvContent - CSV content
     * @returns {Object} Parsed data
     */
    parseCSV(csvContent) {
        // Simplified CSV parser - implement proper CSV parsing library for production
        const lines = csvContent.split('\n').filter(line => !line.startsWith('#') && line.trim());
        
        if (lines.length < 2) {
            throw new Error('Invalid CSV format');
        }

        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            
            data.push(obj);
        }

        return {
            metadata: {
                type: 'csv_import',
                createdAt: new Date().toISOString(),
                version: '1.0.0'
            },
            data: { imported: data }
        };
    }

    /**
     * Read file content
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            
            reader.readAsText(file);
        });
    }

    /**
     * Download file
     * @param {string|Blob} content - File content
     * @param {string} filename - Filename
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Get MIME type for format
     * @param {string} format - File format
     * @returns {string} MIME type
     */
    getMimeType(format) {
        const types = {
            json: 'application/json',
            csv: 'text/csv',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        
        return types[format.toLowerCase()] || 'text/plain';
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes
     * @returns {string} Formatted size
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Maintain backup history (keep only max backups)
     */
    maintainBackupHistory() {
        if (this.backupHistory.length > this.maxBackups) {
            this.backupHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.backupHistory = this.backupHistory.slice(0, this.maxBackups);
        }
    }

    /**
     * Refresh all managers after restore
     */
    refreshManagers() {
        try {
            if (this.businessManager) this.businessManager.loadBusinesses();
            if (window.ProductManager) window.ProductManager.loadProducts();
            if (window.CustomerManager) window.CustomerManager.loadCustomers();
            if (window.Analytics) window.Analytics.loadAnalyticsData();
            
            console.log('All managers refreshed after restore');
        } catch (error) {
            console.error('Failed to refresh managers:', error);
        }
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        if (window.UnifyXApp) {
            window.UnifyXApp.showNotification(type, 'Backup Manager', message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Track backup events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    trackBackupEvent(event, data = {}) {
        try {
            if (window.UnifyXApp) {
                window.UnifyXApp.trackEvent(event, {
                    module: 'backupManager',
                    ...data
                });
            }
        } catch (error) {
            console.warn('Failed to track backup event:', error);
        }
    }

    /**
     * Get backup statistics
     * @returns {Object} Backup statistics
     */
    getBackupStatistics() {
        const now = new Date();
        const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const recent = this.backupHistory.filter(backup => 
            new Date(backup.createdAt) >= last30Days
        );

        const totalSize = this.backupHistory.reduce((sum, backup) => sum + backup.size, 0);

        return {
            totalBackups: this.backupHistory.length,
            recentBackups: recent.length,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            oldestBackup: this.backupHistory.length > 0 ? 
                this.backupHistory.reduce((oldest, backup) => 
                    new Date(backup.createdAt) < new Date(oldest.createdAt) ? backup : oldest
                ).createdAt : null,
            newestBackup: this.backupHistory.length > 0 ? 
                this.backupHistory.reduce((newest, backup) => 
                    new Date(backup.createdAt) > new Date(newest.createdAt) ? backup : newest
                ).createdAt : null,
            autoBackupEnabled: this.autoBackupEnabled
        };
    }
}

// Create and export global BackupManager instance
window.BackupManager = new BackupManager();

console.log('💾 UnifyX Bill Maker BackupManager Loaded Successfully!');
