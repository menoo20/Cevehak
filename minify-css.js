// Phase 2: CSS Minification Script
const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');

console.log('⚡ Phase 2: CSS Minification Starting...');

// Configuration
const cssFiles = [
    'public/css/landing.css',
    'public/css/style.css'
];

const minifier = new CleanCSS({
    level: 2, // Advanced optimizations
    returnPromise: true,
    sourceMap: false // Disable source maps for production
});

async function minifyCSS() {
    let totalOriginalSize = 0;
    let totalMinifiedSize = 0;
    
    for (const cssFile of cssFiles) {
        const fullPath = path.join(__dirname, cssFile);
        
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️ File not found: ${cssFile}`);
            continue;
        }
        
        try {
            // Read original CSS
            const originalCSS = fs.readFileSync(fullPath, 'utf8');
            const originalSize = Buffer.byteLength(originalCSS, 'utf8');
            
            // Minify CSS
            const result = await minifier.minify(originalCSS);
            
            if (result.errors.length > 0) {
                console.error(`❌ Errors minifying ${cssFile}:`, result.errors);
                continue;
            }
            
            const minifiedSize = Buffer.byteLength(result.styles, 'utf8');
            const compressionRatio = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
            
            // Create minified version
            const minifiedPath = fullPath.replace('.css', '.min.css');
            fs.writeFileSync(minifiedPath, result.styles);
            
            // Update totals
            totalOriginalSize += originalSize;
            totalMinifiedSize += minifiedSize;
            
            console.log(`✅ ${cssFile}:`);
            console.log(`   Original: ${(originalSize / 1024).toFixed(1)} KB`);
            console.log(`   Minified: ${(minifiedSize / 1024).toFixed(1)} KB`);
            console.log(`   Saved: ${compressionRatio}%`);
            
            if (result.warnings.length > 0) {
                console.log(`   ⚠️ Warnings: ${result.warnings.length}`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${cssFile}:`, error.message);
        }
    }
    
    // Summary
    if (totalOriginalSize > 0) {
        const totalCompressionRatio = ((totalOriginalSize - totalMinifiedSize) / totalOriginalSize * 100).toFixed(1);
        console.log('\n📊 CSS Minification Summary:');
        console.log(`   Total Original: ${(totalOriginalSize / 1024).toFixed(1)} KB`);
        console.log(`   Total Minified: ${(totalMinifiedSize / 1024).toFixed(1)} KB`);
        console.log(`   Total Saved: ${totalCompressionRatio}% (${((totalOriginalSize - totalMinifiedSize) / 1024).toFixed(1)} KB)`);
        console.log('\n🚀 Minified CSS files created with .min.css extension');
        console.log('💡 Update HTML files to use .min.css for production');
    }
}

// Run minification
minifyCSS().catch(console.error);
