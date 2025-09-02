/**
 * ⚡️ UnifyX Bill Maker - Build Tool
 * Build and bundle the application for production
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

class UnifyXBuilder {
    constructor() {
        this.srcDir = path.join(__dirname, '../');
        this.distDir = path.join(__dirname, '../dist');
        this.version = '1.0.0';
        
        this.cssFiles = [
            'assets/css/reset.css',
            'assets/css/themes.css',
            'assets/css/components.css',
            'assets/css/mobile.css',
            'assets/css/desktop.css',
            'assets/css/animations.css',
            'assets/css/templates.css'
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
            'assets/js/modules/ui.js',
            'assets/js/components/charts.js',
            'assets/js/components/dashboard.js',
            'assets/js/components/forms.js',
            'assets/js/components/modals.js',
            'assets/js/components/notifications.js',
            'assets/js/components/tables.js',
            'assets/js/templates/modern.js',
            'assets/js/templates/classic.js',
            'assets/js/templates/corporate.js',
            'assets/js/templates/creative.js',
            'assets/js/templates/minimal.js',
            'assets/js/utils/calculator.js',
            'assets/js/utils/currency.js',
            'assets/js/utils/formatting.js',
            'assets/js/utils/helpers.js'
        ];
    }

    /**
     * Build the application
     */
    async build() {
        console.log('🚀 Starting UnifyX Bill Maker build...');
        
        // Create dist directory
        this.createDistDirectory();
        
        // Build CSS
        await this.buildCSS();
        
        // Build JavaScript
        await this.buildJS();
        
        // Build HTML
        await this.buildHTML();
        
        // Copy assets
        this.copyAssets();
        
        // Generate manifest
        this.generateManifest();
        
        console.log('✅ Build completed successfully!');
    }

    /**
     * Create distribution directory
     */
    createDistDirectory() {
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true });
        }
        fs.mkdirSync(this.distDir, { recursive: true });
        console.log('📁 Created dist directory');
    }

    /**
     * Build CSS files
     */
    async buildCSS() {
        console.log('🎨 Building CSS...');
        
        let combinedCSS = '';
        
        for (const file of this.cssFiles) {
            const filePath = path.join(this.srcDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedCSS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        // Minify CSS
        const minified = new CleanCSS({
            level: 2,
            returnPromise: true
        }).minify(combinedCSS);
        
        const result = await minified;
        
        // Write minified CSS
        fs.writeFileSync(
            path.join(this.distDir, 'unifyX.min.css'),
            result.styles
        );
        
        console.log(`  ✅ CSS built: ${this.formatSize(result.styles.length)}`);
    }

    /**
     * Build JavaScript files
     */
    async buildJS() {
        console.log('⚡ Building JavaScript...');
        
        let combinedJS = '';
        
        for (const file of this.jsFiles) {
            const filePath = path.join(this.srcDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedJS += `/* ${file} */\n${content}\n\n`;
            }
        }
        
        // Minify JavaScript
        const minified = await minify(combinedJS, {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.warn']
            },
            mangle: {
                reserved: ['window', 'document', 'UnifyX']
            },
            format: {
                comments: false
            }
        });
        
        // Write minified JS
        fs.writeFileSync(
            path.join(this.distDir, 'unifyX.min.js'),
            minified.code
        );
        
        console.log(`  ✅ JavaScript built: ${this.formatSize(minified.code.length)}`);
    }

    /**
     * Build HTML file
     */
    async buildHTML() {
        console.log('📄 Building HTML...');
        
        const htmlPath = path.join(this.srcDir, 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace CSS includes with single minified file
        html = html.replace(
            /<link rel="stylesheet" href="assets\/css\/[^"]*">/g,
            ''
        );
        html = html.replace(
            '</head>',
            '    <link rel="stylesheet" href="unifyX.min.css">\n</head>'
        );
        
        // Replace JS includes with single minified file
        html = html.replace(
            /<script src="assets\/js\/[^"]*"><\/script>/g,
            ''
        );
        html = html.replace(
            '</body>',
            '    <script src="unifyX.min.js"></script>\n</body>'
        );
        
        // Add version and build info
        html = html.replace(
            '<title>',
            `<!-- UnifyX Bill Maker v${this.version} - Built on ${new Date().toISOString()} -->\n    <title>`
        );
        
        // Write built HTML
        fs.writeFileSync(
            path.join(this.distDir, 'index.html'),
            html
        );
        
        console.log('  ✅ HTML built');
    }

    /**
     * Copy static assets
     */
    copyAssets() {
        console.log('📋 Copying assets...');
        
        const assetDirs = ['fonts', 'images'];
        
        for (const dir of assetDirs) {
            const srcPath = path.join(this.srcDir, 'assets', dir);
            const distPath = path.join(this.distDir, 'assets', dir);
            
            if (fs.existsSync(srcPath)) {
                fs.mkdirSync(path.dirname(distPath), { recursive: true });
                this.copyDirectory(srcPath, distPath);
                console.log(`  ✅ Copied ${dir}`);
            }
        }
        
        // Copy other important files
        const filesToCopy = ['README.md', 'LICENSE'];
        
        for (const file of filesToCopy) {
            const srcPath = path.join(this.srcDir, file);
            const distPath = path.join(this.distDir, file);
            
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, distPath);
                console.log(`  ✅ Copied ${file}`);
            }
        }
    }

    /**
     * Copy directory recursively
     */
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        
        for (const file of files) {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    /**
     * Generate build manifest
     */
    generateManifest() {
        console.log('📋 Generating manifest...');
        
        const manifest = {
            name: 'UnifyX Bill Maker',
            version: this.version,
            buildDate: new Date().toISOString(),
            files: {
                html: 'index.html',
                css: 'unifyX.min.css',
                js: 'unifyX.min.js'
            },
            stats: this.getBuildStats()
        };
        
        fs.writeFileSync(
            path.join(this.distDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log('  ✅ Manifest generated');
    }

    /**
     * Get build statistics
     */
    getBuildStats() {
        const stats = {
            totalFiles: 0,
            totalSize: 0,
            files: {}
        };
        
        const files = fs.readdirSync(this.distDir);
        
        for (const file of files) {
            const filePath = path.join(this.distDir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile()) {
                stats.totalFiles++;
                stats.totalSize += stat.size;
                stats.files[file] = {
                    size: stat.size,
                    sizeFormatted: this.formatSize(stat.size)
                };
            }
        }
        
        stats.totalSizeFormatted = this.formatSize(stats.totalSize);
        
        return stats;
    }

    /**
     * Format file size
     */
    formatSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, i)).toFixed(2);
        
        return `${size} ${sizes[i]}`;
    }

    /**
     * Watch mode for development
     */
    watch() {
        console.log('👀 Watching for changes...');
        
        const watchPaths = [
            path.join(this.srcDir, 'assets'),
            path.join(this.srcDir, 'index.html')
        ];
        
        watchPaths.forEach(watchPath => {
            if (fs.existsSync(watchPath)) {
                fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                    console.log(`📝 ${filename} changed, rebuilding...`);
                    this.build().catch(console.error);
                });
            }
        });
    }
}

// CLI interface
if (require.main === module) {
    const builder = new UnifyXBuilder();
    
    const command = process.argv[2] || 'build';
    
    switch (command) {
        case 'build':
            builder.build().catch(console.error);
            break;
        case 'watch':
            builder.build().then(() => {
                builder.watch();
            }).catch(console.error);
            break;
        default:
            console.log('Usage: node build.js [build|watch]');
    }
}

module.exports = UnifyXBuilder;
