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

async function fixFilePathsAndFolders() {
    try {
        console.log('🔧 Fixing file paths and consolidating user folders...');

        // Get all submissions
        const result = await pool.query('SELECT * FROM cv_submissions ORDER BY id');
        console.log(`📋 Found ${result.rows.length} submissions\n`);

        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        
        // Create a map of users and their files
        const userFiles = new Map();
        
        for (const submission of result.rows) {
            const sanitizedName = submission.full_name
                .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
                .replace(/\s+/g, '_')
                .trim();
            
            console.log(`👤 Processing: ${submission.full_name} (ID: ${submission.id})`);
            console.log(`📁 Target folder: ${sanitizedName}`);
            
            if (!userFiles.has(sanitizedName)) {
                userFiles.set(sanitizedName, {
                    targetFolder: sanitizedName,
                    files: [],
                    submissions: []
                });
            }
            
            const userData = userFiles.get(sanitizedName);
            userData.submissions.push(submission);
            
            // Collect all files for this user
            const fileFields = ['profile_image', 'portfolio_files', 'testimonial_files', 'additional_files'];
            
            fileFields.forEach(field => {
                if (submission[field]) {
                    if (field.includes('files') && field !== 'profile_image') {
                        // Multiple files field
                        const files = submission[field].split(',').map(f => f.trim()).filter(f => f);
                        files.forEach(file => {
                            userData.files.push({
                                originalPath: file,
                                field: field,
                                submissionId: submission.id
                            });
                        });
                    } else {
                        // Single file field
                        userData.files.push({
                            originalPath: submission[field],
                            field: field,
                            submissionId: submission.id
                        });
                    }
                }
            });
        }
        
        console.log(`\n📊 Found ${userFiles.size} unique users\n`);
        
        // Process each user
        for (const [userName, userData] of userFiles.entries()) {
            console.log(`🔄 Processing user: ${userName}`);
            console.log(`   📄 ${userData.submissions.length} submission(s)`);
            console.log(`   📎 ${userData.files.length} file(s)`);
            
            const targetFolder = path.join(uploadsDir, userData.targetFolder);
            
            // Create target folder if it doesn't exist
            if (!fs.existsSync(targetFolder)) {
                fs.mkdirSync(targetFolder, { recursive: true });
                console.log(`   📁 Created folder: ${userData.targetFolder}`);
            } else {
                console.log(`   📁 Using existing folder: ${userData.targetFolder}`);
            }
            
            // Move files to the target folder and update database
            const updatedSubmissions = new Map();
            
            for (const fileInfo of userData.files) {
                const originalPath = fileInfo.originalPath;
                const fileName = path.basename(originalPath);
                const sourceFile = path.join(uploadsDir, originalPath);
                const targetFile = path.join(targetFolder, fileName);
                const newDbPath = `${userData.targetFolder}/${fileName}`;
                
                console.log(`     📄 ${fileName}`);
                
                // Check if source file exists
                if (fs.existsSync(sourceFile)) {
                    // Move file if not already in target location
                    if (sourceFile !== targetFile) {
                        console.log(`       📦 Moving: ${originalPath} → ${newDbPath}`);
                        fs.copyFileSync(sourceFile, targetFile);
                        
                        // Remove original if it's in a different folder
                        const sourceDir = path.dirname(sourceFile);
                        const targetDir = path.dirname(targetFile);
                        if (sourceDir !== targetDir) {
                            fs.unlinkSync(sourceFile);
                        }
                    } else {
                        console.log(`       ✅ Already in correct location`);
                    }
                    
                    // Update database path
                    if (originalPath !== newDbPath) {
                        if (!updatedSubmissions.has(fileInfo.submissionId)) {
                            updatedSubmissions.set(fileInfo.submissionId, {});
                        }
                        
                        const updates = updatedSubmissions.get(fileInfo.submissionId);
                        if (fileInfo.field.includes('files') && fileInfo.field !== 'profile_image') {
                            // Handle comma-separated files
                            if (!updates[fileInfo.field]) {
                                const submission = userData.submissions.find(s => s.id === fileInfo.submissionId);
                                updates[fileInfo.field] = submission[fileInfo.field];
                            }
                            updates[fileInfo.field] = updates[fileInfo.field].replace(originalPath, newDbPath);
                        } else {
                            // Single file
                            updates[fileInfo.field] = newDbPath;
                        }
                    }
                } else {
                    console.log(`       ❌ Source file not found: ${sourceFile}`);
                }
            }
            
            // Update database for this user's submissions
            for (const [submissionId, updates] of updatedSubmissions.entries()) {
                const updateFields = [];
                const updateValues = [];
                let paramIndex = 1;
                
                for (const [field, value] of Object.entries(updates)) {
                    updateFields.push(`${field} = $${paramIndex}`);
                    updateValues.push(value);
                    paramIndex++;
                }
                
                if (updateFields.length > 0) {
                    updateValues.push(submissionId);
                    const updateQuery = `UPDATE cv_submissions SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
                    await pool.query(updateQuery, updateValues);
                    console.log(`       💾 Updated database for submission ${submissionId}`);
                }
            }
            
            // Clean up empty source folders
            for (const fileInfo of userData.files) {
                const sourceDir = path.dirname(path.join(uploadsDir, fileInfo.originalPath));
                if (fs.existsSync(sourceDir) && sourceDir !== targetFolder) {
                    try {
                        const files = fs.readdirSync(sourceDir);
                        if (files.length === 0) {
                            fs.rmdirSync(sourceDir);
                            console.log(`   🗑️ Removed empty folder: ${path.basename(sourceDir)}`);
                        }
                    } catch (error) {
                        console.log(`   ⚠️ Could not remove folder: ${path.basename(sourceDir)}`);
                    }
                }
            }
            
            console.log(`   ✅ Completed processing for ${userName}\n`);
        }
        
        console.log('🎉 File path and folder consolidation completed!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixFilePathsAndFolders();
