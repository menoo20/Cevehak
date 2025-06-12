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

async function consolidateClientFolders() {
    try {
        console.log('🔧 Consolidating client folders...');

        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        console.log(`📁 Uploads directory: ${uploadsDir}`);
        
        // Get current folder structure
        const allDirs = fs.readdirSync(uploadsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name !== '.gitkeep');

        console.log(`📁 Current folders: ${allDirs.join(', ')}`);

        // Process Mohammed_amin folders specifically
        const mohammedFolders = allDirs.filter(name => name.startsWith('Mohammed_amin'));
        console.log(`👤 Mohammed_amin folders: ${mohammedFolders.join(', ')}`);

        if (mohammedFolders.length <= 1) {
            console.log('✅ Only one Mohammed_amin folder exists');
            return;
        }

        // Create main Mohammed_amin folder
        const mainFolder = path.join(uploadsDir, 'Mohammed_amin');
        if (!fs.existsSync(mainFolder)) {
            fs.mkdirSync(mainFolder, { recursive: true });
            console.log('📁 Created main Mohammed_amin folder');
        }

        // Move files from numbered folders
        const pathUpdates = {};
        let totalMoved = 0;

        for (const folderName of mohammedFolders) {
            if (folderName === 'Mohammed_amin') continue;
            
            const sourceFolder = path.join(uploadsDir, folderName);
            console.log(`🔄 Processing folder: ${folderName}`);
            
            const files = fs.readdirSync(sourceFolder);
            console.log(`  📄 Files: ${files.join(', ')}`);
            
            for (const file of files) {
                const sourcePath = path.join(sourceFolder, file);
                const destPath = path.join(mainFolder, file);
                
                // Handle conflicts by adding timestamp
                let finalDestPath = destPath;
                if (fs.existsSync(destPath)) {
                    const ext = path.extname(file);
                    const nameWithoutExt = path.basename(file, ext);
                    const timestamp = Date.now();
                    finalDestPath = path.join(mainFolder, `${nameWithoutExt}_${timestamp}${ext}`);
                }
                
                fs.copyFileSync(sourcePath, finalDestPath);
                totalMoved++;
                
                // Track path changes
                const oldPath = `${folderName}/${file}`;
                const newPath = `Mohammed_amin/${path.basename(finalDestPath)}`;
                pathUpdates[oldPath] = newPath;
                
                console.log(`    ✅ Moved: ${file} → ${path.basename(finalDestPath)}`);
            }
            
            // Remove old folder
            fs.rmSync(sourceFolder, { recursive: true, force: true });
            console.log(`  🗑️ Removed folder: ${folderName}`);
        }

        console.log(`\n📊 Summary: Moved ${totalMoved} files`);
        console.log(`🔧 Path updates needed:`, pathUpdates);

        // Update database
        if (Object.keys(pathUpdates).length > 0) {
            console.log('\n💾 Updating database...');
            
            const submissions = await pool.query('SELECT * FROM cv_submissions');
            
            for (const submission of submissions.rows) {
                const updates = {};
                let hasUpdates = false;

                // Check profile_image
                if (submission.profile_image && pathUpdates[submission.profile_image]) {
                    updates.profile_image = pathUpdates[submission.profile_image];
                    hasUpdates = true;
                }

                // Check portfolio_files
                if (submission.portfolio_files) {
                    const files = submission.portfolio_files.split(',').map(f => f.trim());
                    const updatedFiles = files.map(file => pathUpdates[file] || file);
                    const newValue = updatedFiles.join(',');
                    
                    if (newValue !== submission.portfolio_files) {
                        updates.portfolio_files = newValue;
                        hasUpdates = true;
                    }
                }

                if (hasUpdates) {
                    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
                    const values = [submission.id, ...Object.values(updates)];
                    
                    await pool.query(`UPDATE cv_submissions SET ${setClause} WHERE id = $1`, values);
                    console.log(`✅ Updated submission ${submission.id}`);
                }
            }
        }

        console.log('\n🎉 Consolidation completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

consolidateClientFolders();
