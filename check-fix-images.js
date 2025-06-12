const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function checkAndFixAllImages() {
    try {
        console.log('🔍 Checking all submissions for image issues...');

        // Get all submissions
        const result = await pool.query('SELECT * FROM cv_submissions ORDER BY id');
        console.log(`📋 Found ${result.rows.length} total submissions`);

        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        
        for (const submission of result.rows) {
            console.log(`\n👤 Checking: ${submission.full_name} (ID: ${submission.id})`);
            
            // Check profile image
            if (submission.profile_image) {
                const imagePath = path.join(uploadsDir, submission.profile_image);
                const imageExists = fs.existsSync(imagePath);
                
                console.log(`  📸 Profile image: ${submission.profile_image}`);
                console.log(`  📁 Full path: ${imagePath}`);
                console.log(`  ✅ Exists: ${imageExists}`);
                
                if (!imageExists) {
                    console.log(`  🔍 Searching for correct path...`);
                    const correctPath = await findImageInFolders(uploadsDir, submission.profile_image, submission.full_name);
                    
                    if (correctPath) {
                        console.log(`  🔧 Found correct path: ${correctPath}`);
                        await pool.query('UPDATE cv_submissions SET profile_image = $1 WHERE id = $2', [correctPath, submission.id]);
                        console.log(`  ✅ Updated database`);
                    } else {
                        console.log(`  ❌ Image not found anywhere`);
                        // Set to null if image doesn't exist
                        await pool.query('UPDATE cv_submissions SET profile_image = NULL WHERE id = $1', [submission.id]);
                        console.log(`  🗑️ Removed invalid image path from database`);
                    }
                }
            } else {
                console.log(`  📸 No profile image set`);
            }
            
            // Check other file fields
            const fileFields = ['portfolio_files', 'testimonial_files'];
            for (const field of fileFields) {
                if (submission[field]) {
                    console.log(`  📁 Checking ${field}: ${submission[field]}`);
                    const files = submission[field].split(',').map(f => f.trim()).filter(f => f);
                    const validFiles = [];
                    
                    for (const file of files) {
                        const filePath = path.join(uploadsDir, file);
                        if (fs.existsSync(filePath)) {
                            validFiles.push(file);
                        } else {
                            const correctPath = await findImageInFolders(uploadsDir, file, submission.full_name);
                            if (correctPath) {
                                validFiles.push(correctPath);
                                console.log(`    🔧 Fixed: ${file} → ${correctPath}`);
                            } else {
                                console.log(`    ❌ File not found: ${file}`);
                            }
                        }
                    }
                    
                    if (validFiles.length !== files.length || validFiles.join(',') !== submission[field]) {
                        const newValue = validFiles.length > 0 ? validFiles.join(',') : null;
                        await pool.query(`UPDATE cv_submissions SET ${field} = $1 WHERE id = $2`, [newValue, submission.id]);
                        console.log(`    ✅ Updated ${field} field`);
                    }
                }
            }
        }
        
        console.log('\n🎉 Image path check and fix completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

async function findImageInFolders(uploadsDir, originalPath, fullName) {
    // Extract filename
    const filename = path.basename(originalPath);
    
    // Generate possible folder names
    const sanitizedName = fullName
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
    
    // Check all numbered variations
    for (let i = 0; i <= 30; i++) {
        const folderName = i === 0 ? sanitizedName : `${sanitizedName}_${i}`;
        const folderPath = path.join(uploadsDir, folderName);
        const filePath = path.join(folderPath, filename);
        
        if (fs.existsSync(filePath)) {
            return `${folderName}/${filename}`;
        }
    }
    
    // If not found in expected folders, search all directories
    try {
        const allDirs = fs.readdirSync(uploadsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
            
        for (const dir of allDirs) {
            const filePath = path.join(uploadsDir, dir, filename);
            if (fs.existsSync(filePath)) {
                return `${dir}/${filename}`;
            }
        }
    } catch (error) {
        console.error('Error searching directories:', error);
    }
    
    return null;
}

checkAndFixAllImages();
