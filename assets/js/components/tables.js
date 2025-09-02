/**
 * ⚡️ UnifyX Bill Maker - Table Components
 * Data table with sorting, filtering, and pagination
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class TableComponents {
    constructor() {
        this.tables = new Map();
        
        console.log('📋 TableComponents initialized');
    }

    /**
     * Create data table
     */
    createTable(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            title = 'Data Table',
            columns = [],
            data = [],
            sortable = true,
            searchable = true,
            pagination = true,
            pageSize = 10,
            actions = []
        } = config;

        const tableId = `table-${containerId}`;
        
        let html = `
            <div class="data-table-container">
                <div class="data-table-header">
                    <h3 class="data-table-title">${title}</h3>
                    <div class="data-table-actions">
                        ${searchable ? `
                            <input type="text" 
                                   class="table-search" 
                                   placeholder="Search..." 
                                   onkeyup="window.TableComponents.handleSearch('${tableId}', this.value)">
                        ` : ''}
                        ${actions.map(action => `
                            <button class="btn btn-sm btn-${action.type || 'secondary'}" 
                                    onclick="${action.onClick}">
                                ${action.icon ? `${action.icon} ` : ''}${action.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="table-wrapper">
                    <table class="data-table" id="${tableId}">
                        <thead>
                            <tr>
                                ${columns.map(col => `
                                    <th class="${sortable ? 'sortable' : ''}" 
                                        data-column="${col.key}"
                                        onclick="${sortable ? `window.TableComponents.handleSort('${tableId}', '${col.key}')` : ''}">
                                        ${col.label}
                                        ${sortable ? '<span class="sort-indicator"></span>' : ''}
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody id="${tableId}-body">
                            ${this.generateRows(data, columns)}
                        </tbody>
                    </table>
                </div>
                ${pagination ? `
                    <div class="table-pagination" id="${tableId}-pagination">
                        <!-- Pagination will be generated dynamically -->
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;

        // Store table configuration
        this.tables.set(tableId, {
            ...config,
            originalData: [...data],
            filteredData: [...data],
            currentPage: 1,
            sortColumn: null,
            sortDirection: 'asc'
        });

        // Initialize pagination
        if (pagination) {
            this.updatePagination(tableId);
        }
    }

    /**
     * Generate table rows
     */
    generateRows(data, columns) {
        if (data.length === 0) {
            return `
                <tr class="no-data-row">
                    <td colspan="${columns.length}" class="text-center text-secondary">
                        No data available
                    </td>
                </tr>
            `;
        }

        return data.map(row => `
            <tr>
                ${columns.map(col => {
                    let value = this.getNestedValue(row, col.key);
                    
                    // Apply formatter if provided
                    if (col.formatter) {
                        value = col.formatter(value, row);
                    }
                    
                    return `<td data-label="${col.label}">${value}</td>`;
                }).join('')}
            </tr>
        `).join('');
    }

    /**
     * Get nested object value
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj) || '';
    }

    /**
     * Handle table search
     */
    handleSearch(tableId, query) {
        const table = this.tables.get(tableId);
        if (!table) return;

        if (!query.trim()) {
            table.filteredData = [...table.originalData];
        } else {
            table.filteredData = table.originalData.filter(row => {
                return table.columns.some(col => {
                    const value = this.getNestedValue(row, col.key);
                    return value.toString().toLowerCase().includes(query.toLowerCase());
                });
            });
        }

        table.currentPage = 1;
        this.updateTable(tableId);
    }

    /**
     * Handle column sorting
     */
    handleSort(tableId, column) {
        const table = this.tables.get(tableId);
        if (!table) return;

        // Toggle sort direction
        if (table.sortColumn === column) {
            table.sortDirection = table.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            table.sortColumn = column;
            table.sortDirection = 'asc';
        }

        // Sort data
        table.filteredData.sort((a, b) => {
            const aVal = this.getNestedValue(a, column);
            const bVal = this.getNestedValue(b, column);
            
            let result;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                result = aVal - bVal;
            } else {
                result = aVal.toString().localeCompare(bVal.toString());
            }
            
            return table.sortDirection === 'desc' ? -result : result;
        });

        // Update sort indicators
        const tableElement = document.getElementById(tableId);
        tableElement.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            th.querySelector('.sort-indicator').textContent = '';
        });

        const currentTh = tableElement.querySelector(`th[data-column="${column}"]`);
        if (currentTh) {
            currentTh.classList.add(`sort-${table.sortDirection}`);
            currentTh.querySelector('.sort-indicator').textContent = table.sortDirection === 'asc' ? '↑' : '↓';
        }

        this.updateTable(tableId);
    }

    /**
     * Update table display
     */
    updateTable(tableId) {
        const table = this.tables.get(tableId);
        if (!table) return;

        let displayData = table.filteredData;
        
        // Apply pagination
        if (table.pagination) {
            const startIndex = (table.currentPage - 1) * table.pageSize;
            const endIndex = startIndex + table.pageSize;
            displayData = displayData.slice(startIndex, endIndex);
        }

        // Update table body
        const tbody = document.getElementById(`${tableId}-body`);
        if (tbody) {
            tbody.innerHTML = this.generateRows(displayData, table.columns);
        }

        // Update pagination
        if (table.pagination) {
            this.updatePagination(tableId);
        }
    }

    /**
     * Update pagination
     */
    updatePagination(tableId) {
        const table = this.tables.get(tableId);
        if (!table) return;

        const totalItems = table.filteredData.length;
        const totalPages = Math.ceil(totalItems / table.pageSize);
        const currentPage = table.currentPage;

        const paginationContainer = document.getElementById(`${tableId}-pagination`);
        if (!paginationContainer) return;

        let html = `
            <div class="pagination-info">
                Showing ${Math.min((currentPage - 1) * table.pageSize + 1, totalItems)} to ${Math.min(currentPage * table.pageSize, totalItems)} of ${totalItems} entries
            </div>
            <div class="pagination-controls">
        `;

        // Previous button
        html += `
            <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.TableComponents.goToPage('${tableId}', ${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += `
                <button class="pagination-btn page-number" 
                        onclick="window.TableComponents.goToPage('${tableId}', 1)">1</button>
            `;
            if (startPage > 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn page-number ${i === currentPage ? 'active' : ''}" 
                        onclick="window.TableComponents.goToPage('${tableId}', ${i})">${i}</button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
            html += `
                <button class="pagination-btn page-number" 
                        onclick="window.TableComponents.goToPage('${tableId}', ${totalPages})">${totalPages}</button>
            `;
        }

        // Next button
        html += `
            <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.TableComponents.goToPage('${tableId}', ${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;

        html += '</div>';
        paginationContainer.innerHTML = html;
    }

    /**
     * Go to specific page
     */
    goToPage(tableId, page) {
        const table = this.tables.get(tableId);
        if (!table) return;

        const totalPages = Math.ceil(table.filteredData.length / table.pageSize);
        
        if (page >= 1 && page <= totalPages) {
            table.currentPage = page;
            this.updateTable(tableId);
        }
    }

    /**
     * Refresh table data
     */
    refreshTable(tableId, newData) {
        const table = this.tables.get(tableId);
        if (!table) return;

        table.originalData = [...newData];
        table.filteredData = [...newData];
        table.currentPage = 1;
        
        this.updateTable(tableId);
    }

    /**
     * Export table data to CSV
     */
    exportToCSV(tableId, filename = 'table-export.csv') {
        const table = this.tables.get(tableId);
        if (!table) return;

        const headers = table.columns.map(col => col.label);
        const rows = table.filteredData.map(row => 
            table.columns.map(col => {
                const value = this.getNestedValue(row, col.key);
                // Escape quotes and wrap in quotes if contains comma
                return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            })
        );

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

window.TableComponents = new TableComponents();
