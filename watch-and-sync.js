const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('👁️ GitHub Pages Auto-Sync - Starting file watcher...');

// Files and directories to watch for changes
const watchPaths = [
    'views/',
    'public/css/',
    'public/js/',
    'public/images/'
];

// Function to rebuild GitHub Pages folder
function rebuildGitHubPages() {
    console.log('\n🔄 Change detected! Rebuilding GitHub Pages...');
    
    try {
        // Run the GitHub Pages build script
        if (process.platform === 'win32') {
            execSync('create-github-pages.bat', { stdio: 'inherit' });
        } else {
            execSync('bash create-github-pages.sh', { stdio: 'inherit' });
        }
        
        console.log('✅ GitHub Pages folder updated successfully!');
        console.log('📱 Ready for mobile testing on GitHub Pages');
        
    } catch (error) {
        console.error('❌ Error rebuilding GitHub Pages:', error.message);
    }
}

// Debounce function to prevent multiple rapid rebuilds
let rebuildTimeout = null;
function debouncedRebuild() {
    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(rebuildGitHubPages, 1000); // Wait 1 second after last change
}

// Watch function
function watchFiles() {
    watchPaths.forEach(watchPath => {
        if (fs.existsSync(watchPath)) {
            console.log(`👀 Watching: ${watchPath}`);
            
            fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                if (filename && (
                    filename.endsWith('.html') ||
                    filename.endsWith('.css') ||
                    filename.endsWith('.js') ||
                    filename.endsWith('.png') ||
                    filename.endsWith('.jpg') ||
                    filename.endsWith('.webp')
                )) {
                    console.log(`📝 File changed: ${watchPath}${filename}`);
                    debouncedRebuild();
                }
            });
        } else {
            console.log(`⚠️ Path not found: ${watchPath}`);
        }
    });
}

// Initial build
console.log('🏗️ Initial GitHub Pages build...');
rebuildGitHubPages();

// Start watching
watchFiles();

console.log('\n🎯 Auto-sync is active!');
console.log('📱 Make changes to your front-end files and they\'ll auto-sync to gh-pages/');
console.log('🌐 Perfect for mobile testing on GitHub Pages!');
console.log('⌨️ Press Ctrl+C to stop watching\n');

// Keep the process running
process.on('SIGINT', () => {
    console.log('\n👋 Stopping file watcher...');
    process.exit(0);
});
