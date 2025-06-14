const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImagesSafely() {
    const inputDir = path.join(__dirname, 'public', 'images');
    const outputDir = path.join(__dirname, 'public', 'images', 'optimized');
    
    // Create optimized directory (won't affect existing CSS)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🖼️  Starting CSS-safe image optimization...');
    console.log('📁 Original images remain untouched for CSS compatibility');
    
    // Get all PNG files (exclude quality badge to avoid breaking CSS)
    const files = fs.readdirSync(inputDir)
        .filter(file => file.endsWith('.png') && !file.includes('quality-badge'))
        .sort();
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputName = file.replace('.png', '');
        
        console.log(`📸 Processing ${file}...`);
        
        try {
            // Get original file size
            const originalStats = fs.statSync(inputPath);
            const originalSize = originalStats.size;
            totalOriginalSize += originalSize;
            
            // Create WebP version (best compression, modern browsers)
            const webpPath = path.join(outputDir, `${outputName}.webp`);
            await sharp(inputPath)
                .webp({ 
                    quality: 85,
                    effort: 6 
                })
                .toFile(webpPath);
            
            // Create optimized PNG (fallback for older browsers)
            const pngPath = path.join(outputDir, `${outputName}.png`);
            await sharp(inputPath)
                .png({ 
                    quality: 85,
                    compressionLevel: 9,
                    adaptiveFiltering: true
                })
                .toFile(pngPath);
            
            // Create mobile-optimized versions
            const webpMobilePath = path.join(outputDir, `${outputName}-mobile.webp`);
            await sharp(inputPath)
                .resize(300, null, { 
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                .webp({ 
                    quality: 80,
                    effort: 6 
                })
                .toFile(webpMobilePath);
            
            // Get optimized file sizes
            const webpStats = fs.statSync(webpPath);
            const optimizedSize = webpStats.size;
            totalOptimizedSize += optimizedSize;
            
            const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
            
            console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KB`);
            console.log(`   WebP: ${(optimizedSize / 1024).toFixed(2)} KB (${savings}% smaller)`);
            console.log(`   Mobile WebP: ${(fs.statSync(webpMobilePath).size / 1024).toFixed(2)} KB`);
            console.log('');
            
        } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message);
        }
    }
    
    const totalSavings = (((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1);
    console.log('✅ CSS-safe image optimization complete!');
    console.log(`📊 Total savings: ${totalSavings}% (${(totalOriginalSize/1024/1024).toFixed(2)}MB → ${(totalOptimizedSize/1024/1024).toFixed(2)}MB)`);
    console.log('🔒 Original images preserved - CSS remains unaffected');
    console.log('🚀 Optimized images ready for progressive enhancement');
}

// Run optimization
optimizeImagesSafely().catch(console.error);
