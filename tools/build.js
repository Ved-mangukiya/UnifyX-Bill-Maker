const fs = require('fs');
const path = require('path');

class UnifyXBuilder {
    constructor() {
        this.cssFiles = [
            'assets/css/reset.css',
            'assets/css/mobile.css', 
            'assets/css/desktop.css',
            'assets/css/components.css',
            'assets/css/themes.css',
            'assets/css/templates.css',
            'assets/css/animations.css'
        ];
        
        this.jsFiles = [
            'assets/js/core/config.js',
            'assets/js/core/constants.js',
            'assets/js/core/app.js',
            'assets/js/modules/dataManager.js',
            'assets/js/modules/businessManager.js',
            'assets/js/modules/productManager.js',
            'assets/js/modules/customerManager.js',
            'assets/js/modules/billingEngine.js',
            'assets/js/modules/pdfGenerator.js',
            'assets/js/modules/analytics.js',
            'assets/js/modules/keyboard.js',
            'assets/js/modules/backup.js',
            'assets/js/modules/ui.js'
        ];
    }
    
    build() {
        console.log('🚀 Building UnifyX Bill Maker...');
        
        // Read base HTML
        let html = fs.readFileSync('index.html', 'utf8');
        
        // Combine CSS
        const css = this.cssFiles
            .map(file => fs.readFileSync(file, 'utf8'))
            .join('\n');
            
        // Combine JS
        const js = this.jsFiles
            .map(file => fs.readFileSync(file, 'utf8'))
            .join('\n');
        
        // Embed fonts as base64
        const fonts = this.embedFonts();
        
        // Create single file
        html = html.replace('<!-- CSS_PLACEHOLDER -->', `<style>${css}${fonts}</style>`);
        html = html.replace('<!-- JS_PLACEHOLDER -->', `<script>${js}</script>`);
        
        // Write output
        fs.writeFileSync('dist/unifyX-bill-maker.html', html);
        console.log('✅ Build complete! Output: dist/unifyX-bill-maker.html');
    }
}

new UnifyXBuilder().build();
