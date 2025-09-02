/**
 * ⚡️ UnifyX Bill Maker - Chart Components
 * Chart rendering and data visualization components
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

class ChartComponents {
    constructor() {
        this.charts = new Map();
        this.colors = [
            '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
            '#f59e0b', '#ef4444', '#84cc16', '#f97316'
        ];
        
        console.log('📊 ChartComponents initialized');
    }

    /**
     * Create a simple bar chart using CSS
     */
    createBarChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            title = 'Chart',
            height = 300,
            showValues = true
        } = options;

        const maxValue = Math.max(...data.map(d => d.value));
        
        let html = `
            <div class="chart-container">
                <h4 class="chart-title">${title}</h4>
                <div class="chart-bars" style="height: ${height}px;">
        `;

        data.forEach((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const color = this.colors[index % this.colors.length];
            
            html += `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" 
                         style="height: ${percentage}%; background-color: ${color};"
                         title="${item.label}: ${item.value}">
                        ${showValues ? `<span class="chart-value">${item.value}</span>` : ''}
                    </div>
                    <div class="chart-label">${item.label}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <style>
                .chart-container { padding: 1rem; }
                .chart-title { text-align: center; margin-bottom: 1rem; }
                .chart-bars { 
                    display: flex; 
                    align-items: end; 
                    justify-content: space-around;
                    border-bottom: 2px solid var(--border-primary);
                    padding: 1rem 0;
                }
                .chart-bar-wrapper { display: flex; flex-direction: column; align-items: center; flex: 1; margin: 0 4px; }
                .chart-bar { 
                    width: 100%; 
                    min-height: 10px;
                    border-radius: 4px 4px 0 0;
                    display: flex;
                    align-items: start;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .chart-bar:hover { opacity: 0.8; }
                .chart-value { 
                    color: white; 
                    font-size: 0.75rem; 
                    font-weight: bold;
                    margin-top: 4px;
                }
                .chart-label { 
                    margin-top: 8px; 
                    font-size: 0.75rem;
                    text-align: center;
                    color: var(--text-secondary);
                }
            </style>
        `;

        container.innerHTML = html;
        this.charts.set(containerId, { type: 'bar', data, options });
    }

    /**
     * Create a donut chart using CSS
     */
    createDonutChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { title = 'Chart' } = options;
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        let html = `
            <div class="donut-chart-container">
                <h4 class="chart-title">${title}</h4>
                <div class="donut-chart">
                    <svg width="200" height="200" viewBox="0 0 200 200">
        `;

        let currentAngle = 0;
        const radius = 70;
        const centerX = 100;
        const centerY = 100;

        data.forEach((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const color = this.colors[index % this.colors.length];
            
            const x1 = centerX + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y1 = centerY + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            currentAngle += angle;
            
            const x2 = centerX + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = centerY + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            html += `
                <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                      fill="${color}" 
                      opacity="0.8"
                      stroke="white" 
                      stroke-width="2">
                    <title>${item.label}: ${item.value} (${percentage.toFixed(1)}%)</title>
                </path>
            `;
        });

        html += `
                    </svg>
                    <div class="donut-center">
                        <div class="donut-total">${total}</div>
                        <div class="donut-label">Total</div>
                    </div>
                </div>
                <div class="donut-legend">
        `;

        data.forEach((item, index) => {
            const color = this.colors[index % this.colors.length];
            const percentage = ((item.value / total) * 100).toFixed(1);
            
            html += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${color};"></div>
                    <span class="legend-text">${item.label}: ${item.value} (${percentage}%)</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <style>
                .donut-chart-container { padding: 1rem; text-align: center; }
                .donut-chart { position: relative; display: inline-block; }
                .donut-center {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }
                .donut-total { font-size: 1.5rem; font-weight: bold; color: var(--text-primary); }
                .donut-label { font-size: 0.75rem; color: var(--text-secondary); }
                .donut-legend { margin-top: 1rem; }
                .legend-item { 
                    display: flex; 
                    align-items: center; 
                    margin: 0.25rem 0;
                    justify-content: center;
                }
                .legend-color { 
                    width: 12px; 
                    height: 12px; 
                    border-radius: 2px; 
                    margin-right: 8px; 
                }
                .legend-text { font-size: 0.875rem; color: var(--text-primary); }
            </style>
        `;

        container.innerHTML = html;
        this.charts.set(containerId, { type: 'donut', data, options });
    }

    /**
     * Create a line chart using CSS and SVG
     */
    createLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const {
            title = 'Chart',
            width = 400,
            height = 200
        } = options;

        const maxValue = Math.max(...data.map(d => d.value));
        const minValue = Math.min(...data.map(d => d.value));
        const range = maxValue - minValue || 1;

        let html = `
            <div class="line-chart-container">
                <h4 class="chart-title">${title}</h4>
                <svg class="line-chart" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0" />
                        </linearGradient>
                    </defs>
        `;

        // Create path
        let path = '';
        let fillPath = '';
        
        data.forEach((point, index) => {
            const x = (index / (data.length - 1)) * (width - 40) + 20;
            const y = height - 40 - ((point.value - minValue) / range) * (height - 80);
            
            if (index === 0) {
                path += `M ${x} ${y}`;
                fillPath += `M ${x} ${height - 20} L ${x} ${y}`;
            } else {
                path += ` L ${x} ${y}`;
                fillPath += ` L ${x} ${y}`;
            }
            
            // Add points
            html += `
                <circle cx="${x}" cy="${y}" r="3" fill="#6366f1" stroke="white" stroke-width="2">
                    <title>${point.label}: ${point.value}</title>
                </circle>
            `;
        });

        fillPath += ` L ${(data.length - 1) / (data.length - 1) * (width - 40) + 20} ${height - 20} Z`;

        html += `
                    <path d="${fillPath}" fill="url(#lineGradient)" />
                    <path d="${path}" fill="none" stroke="#6366f1" stroke-width="2" />
                </svg>
            </div>
            <style>
                .line-chart-container { padding: 1rem; }
                .line-chart { border: 1px solid var(--border-primary); border-radius: 8px; }
            </style>
        `;

        container.innerHTML = html;
        this.charts.set(containerId, { type: 'line', data, options });
    }

    /**
     * Update existing chart with new data
     */
    updateChart(containerId, newData) {
        const chart = this.charts.get(containerId);
        if (!chart) return;

        switch (chart.type) {
            case 'bar':
                this.createBarChart(containerId, newData, chart.options);
                break;
            case 'donut':
                this.createDonutChart(containerId, newData, chart.options);
                break;
            case 'line':
                this.createLineChart(containerId, newData, chart.options);
                break;
        }
    }
}

window.ChartComponents = new ChartComponents();
