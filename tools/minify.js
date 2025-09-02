/**
 * ⚡️ UnifyX Bill Maker - Minification Tool
 * Minify CSS and JavaScript files
 * Author: Ved Mangukiya
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

class UnifyXMinifier {
    constructor() {
        this.srcDir = path.join(__dirname, '../');
        this.options = {
            js: {
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
            },
            css: {
                level: 2,
                returnPromise: true
            }
        };
    }

    /**
     * Minify single JavaScript file
     */
    async minifyJS(inputFile, outputFile = null) {
        console.log(`📦 Minifying JavaScript: ${inputFile}`);
        
        const inputPath = path.join(this.srcDir, inputFile);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`File not found: ${inputPath}`);
        }
        
        const code = fs.readFileSync(inputPath, 'utf8');
        const result = await minify(code, this.options.js);
        
        const outputPath = outputFile 
            ? path.join(this.srcDir, outputFile)
            : inputPath.replace('.js', '.min.js');
            
        fs.writeFileSync(outputPath, result.code);
        
        const originalSize = code.length;
        const minifiedSize = result.code.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ ${this.formatSize(originalSize)} → ${this.formatSize(minifiedSize)} (${savings}% smaller)`);
        
        return {
            inputFile,
            outputFile: outputPath,
            originalSize,
            minifiedSize,
            savings: parseFloat(savings)
        };
    }

    /**
     * Minify single CSS file
     */
    async minifyCSS(inputFile, outputFile = null) {
        console.log(`🎨 Minifying CSS: ${inputFile}`);
        
        const inputPath = path.join(this.srcDir, inputFile);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`File not found: ${inputPath}`);
        }
        
        const css = fs.readFileSync(inputPath, 'utf8');
        const result = await new CleanCSS(this.options.css).minify(css);
        
        if (result.errors.length > 0) {
            throw new Error(`CSS minification errors: ${result.errors.join(', ')}`);
        }
        
        const outputPath = outputFile 
            ? path.join(this.srcDir, outputFile)
            : inputPath.replace('.css', '.min.css');
            
        fs.writeFileSync(outputPath, result.styles);
        
        const originalSize = css.length;
        const minifiedSize = result.styles.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`  ✅ ${this.formatSize(originalSize)} → ${this.formatSize(minifiedSize)} (${savings}% smaller)`);
        
        return {
            inputFile,
            outputFile: outputPath,
            originalSize,
            minifiedSize,
            savings: parseFloat(savings)
        };
    }

    /**
     * Minify all JavaScript files in directory
     */
    async minifyJSDirectory(directory) {
        console.log(`📦 Minifying all JS files in: ${directory}`);
        
        const dirPath = path.join(this.srcDir, directory);
        const results = [];
        
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory not found: ${dirPath}`);
        }
        
        const files = this.getJSFiles(dirPath);
        
        for (const file of files) {
            const relativePath = path.relative(this.srcDir, file);
            const result = await this.minifyJS(relativePath);
            results.push(result);
        }
        
        this.printSummary(results);
        return results;
    }

    /**
     * Minify all CSS files in directory
     */
    async minifyCSSDirectory(directory) {
        console.log(`🎨 Minifying all CSS files in: ${directory}`);
        
        const dirPath = path.join(this.srcDir, directory);
        const results = [];
        
        if (!fs.existsSync(dirPath)) {
            throw new Error(`Directory not found: ${dirPath}`);
        }
        
        const files = this.getCSSFiles(dirPath);
        
        for (const file of files) {
            const relativePath = path.relative(this.srcDir, file);
            const result = await this.minifyCSS(relativePath);
            results.push(result);
        }
        
        this.printSummary(results);
        return results;
    }

    /**
     * Get all JavaScript files recursively
     */
    getJSFiles(directory) {
        const files = [];
        
        const scan = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.js') && !item.endsWith('.min.js')) {
                    files.push(fullPath);
                }
            }
        };
        
        scan(directory);
        return files;
    }

    /**
     * Get all CSS files recursively
     */
    getCSSFiles(directory) {
        const files = [];
        
        const scan = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.css') && !item.endsWith('.min.css')) {
                    files.push(fullPath);
                }
            }
        };
        
        scan(directory);
        return files;
    }

    /**
     * Print minification summary
     */
    printSummary(results) {
        if (results.length === 0) return;
        
        const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
        const totalMinified = results.reduce((sum, r) => sum + r.minifiedSize, 0);
        const totalSavings = ((totalOriginal - totalMinified) / totalOriginal * 100).toFixed(1);
        
        console.log('\n📊 Minification Summary:');
        console.log(`  Files processed: ${results.length}`);
        console.log(`  Total size before: ${this.formatSize(totalOriginal)}`);
        console.log(`  Total size after: ${this.formatSize(totalMinified)}`);
        console.log(`  Total savings: ${this.formatSize(totalOriginal - totalMinified)} (${totalSavings}%)`);
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
     * Clean minified files
     */
    cleanMinified() {
        console.log('🧹 Cleaning minified files...');
        
        const directories = [
            'assets/css',
            'assets/js'
        ];
        
        let cleaned = 0;
        
        for (const dir of directories) {
            const dirPath = path.join(this.srcDir, dir);
            if (fs.existsSync(dirPath)) {
                cleaned += this.cleanMinifiedInDirectory(dirPath);
            }
        }
        
        console.log(`  ✅ Cleaned ${cleaned} minified files`);
    }

    /**
     * Clean minified files in directory
     */
    cleanMinifiedInDirectory(directory) {
        let cleaned = 0;
        
        const scan = (dir) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.min.js') || item.endsWith('.min.css')) {
                    fs.unlinkSync(fullPath);
                    cleaned++;
                }
            }
        };
        
        scan(directory);
        return cleaned;
    }
}

// CLI interface
if (require.main === module) {
    const minifier = new UnifyXMinifier();
    
    const command = process.argv[2] || 'help';
    const target = process.argv[3];
    
    switch (command) {
        case 'js':
            if (!target) {
                console.error('Usage: node minify.js js <file>');
                process.exit(1);
            }
            minifier.minifyJS(target).catch(console.error);
            break;
            
        case 'css':
            if (!target) {
                console.error('Usage: node minify.js css <file>');
                process.exit(1);
            }
            minifier.minifyCSS(target).catch(console.error);
            break;
            
        case 'all-js':
            minifier.minifyJSDirectory('assets/js').catch(console.error);
            break;
            
        case 'all-css':
            minifier.minifyCSSDirectory('assets/css').catch(console.error);
            break;
            
        case 'all':
            (async () => {
                await minifier.minifyCSSDirectory('assets/css');
                await minifier.minifyJSDirectory('assets/js');
                console.log('🎉 All files minified!');
            })().catch(console.error);
            break;
            
        case 'clean':
            minifier.cleanMinified();
            break;
            
        default:
            console.log('UnifyX Minifier');
            console.log('Usage:');
            console.log('  node minify.js js <file>      - Minify single JS file');
            console.log('  node minify.js css <file>     - Minify single CSS file');
            console.log('  node minify.js all-js         - Minify all JS files');
            console.log('  node minify.js all-css        - Minify all CSS files');
            console.log('  node minify.js all            - Minify all files');
            console.log('  node minify.js clean          - Clean minified files');
    }
}

module.exports = UnifyXMinifier;
