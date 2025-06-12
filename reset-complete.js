const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function resetDatabaseAndFiles() {
    try {
        console.log('🗑️ Starting complete database and file reset...');
        
        // 1. Delete all submissions from database
        console.log('\n📋 Clearing database...');
        const result = await pool.query('DELETE FROM cv_submissions');
        console.log(`✅ Deleted ${result.rowCount} submissions from database`);
        
        // Reset the auto-increment counter
        await pool.query('ALTER SEQUENCE cv_submissions_id_seq RESTART WITH 1');
        console.log('✅ Reset ID sequence to start from 1');
        
        // 2. Clean up uploaded files
        console.log('\n🧹 Cleaning up uploads folder...');
        
        const uploadsPath = path.join(__dirname, 'public', 'uploads');
        let deletedFiles = 0;
        let deletedFolders = 0;
        
        try {
            // Read uploads directory
            const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
            
            for (const item of items) {
                // Skip .gitkeep file to preserve folder structure
                if (item.name === '.gitkeep') {
                    console.log('📁 Preserving .gitkeep file');
                    continue;
                }
                
                const itemPath = path.join(uploadsPath, item.name);
                
                if (item.isDirectory()) {
                    // Count files in directory before deletion
                    try {
                        const folderContents = fs.readdirSync(itemPath);
                        deletedFiles += folderContents.length;
                        console.log(`🗂️ Removing folder: ${item.name} (${folderContents.length} files)`);
                    } catch (err) {
                        console.log(`🗂️ Removing folder: ${item.name} (unable to count files)`);
                    }
                    
                    // Remove user directories and their contents
                    fs.rmSync(itemPath, { recursive: true, force: true });
                    deletedFolders++;
                } else {
                    // Remove individual files (except .gitkeep)
                    console.log(`📄 Removing file: ${item.name}`);
                    fs.unlinkSync(itemPath);
                    deletedFiles++;
                }
            }
            
            console.log(`\n✅ File cleanup completed:`);
            console.log(`   📄 Files deleted: ${deletedFiles}`);
            console.log(`   📁 Folders deleted: ${deletedFolders}`);
            
        } catch (uploadError) {
            console.error('⚠️ Error cleaning uploads folder:', uploadError);
        }
        
        // 3. Verify the cleanup
        console.log('\n🔍 Verifying cleanup...');
        
        // Check database
        const countResult = await pool.query('SELECT COUNT(*) FROM cv_submissions');
        const dbCount = parseInt(countResult.rows[0].count);
        console.log(`📊 Database submissions: ${dbCount}`);
        
        // Check uploads folder
        const remainingItems = fs.readdirSync(uploadsPath, { withFileTypes: true })
            .filter(item => item.name !== '.gitkeep');
        console.log(`📂 Remaining upload items: ${remainingItems.length}`);
        
        if (remainingItems.length > 0) {
            console.log('📝 Remaining items:');
            remainingItems.forEach(item => {
                console.log(`   ${item.isDirectory() ? '📁' : '📄'} ${item.name}`);
            });
        }
        
        console.log('\n🎉 Complete reset finished!');
        console.log('📋 Database: Clean');
        console.log('📂 Uploads: Clean (except .gitkeep)');
        
    } catch (error) {
        console.error('❌ Error during reset:', error);
    } finally {
        await pool.end();
    }
}

// Show confirmation before running
console.log('⚠️  IMPORTANT: This will delete ALL submissions and uploaded files!');
console.log('This action cannot be undone.');
console.log('Press Ctrl+C to cancel, or press Enter to continue...');

// Wait for user input
process.stdin.on('data', () => {
    resetDatabaseAndFiles();
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n❌ Reset cancelled by user');
    process.exit(0);
});
