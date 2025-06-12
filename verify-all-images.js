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

async function verifyAllImages() {
    try {
        console.log('🔍 Comprehensive verification of all image paths...');

        // Get all submissions
        const result = await pool.query('SELECT * FROM cv_submissions ORDER BY id');
        console.log(`📋 Found ${result.rows.length} total submissions\n`);

        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        let totalIssues = 0;
        let fixedIssues = 0;

        for (const submission of result.rows) {
            console.log(`\n👤 ${submission.full_name} (ID: ${submission.id})`);
            let hasIssues = false;

            // Check profile image
            if (submission.profile_image) {
                const imagePath = path.join(uploadsDir, submission.profile_image);
                const imageExists = fs.existsSync(imagePath);
                
                console.log(`  📸 Profile: ${submission.profile_image}`);
                console.log(`  ✅ Status: ${imageExists ? 'EXISTS' : 'MISSING'}`);
                
                if (!imageExists) {
                    hasIssues = true;
                    totalIssues++;
                    console.log(`  🔍 Searching for file...`);
                    
                    const correctPath = await findImageAnywhere(uploadsDir, submission.profile_image, submission.full_name);
                    if (correctPath) {
                        console.log(`  🔧 Found at: ${correctPath}`);
                        await pool.query('UPDATE cv_submissions SET profile_image = $1 WHERE id = $2', [correctPath, submission.id]);
                        console.log(`  ✅ Fixed in database`);
                        fixedIssues++;
                    } else {
                        console.log(`  ❌ File not found anywhere - removing from database`);
                        await pool.query('UPDATE cv_submissions SET profile_image = NULL WHERE id = $1', [submission.id]);
                        fixedIssues++;
                    }
                }
            }

            // Check portfolio files
            if (submission.portfolio_files) {
                console.log(`  📁 Portfolio files:`);
                const files = submission.portfolio_files.split(',').map(f => f.trim()).filter(f => f);
                const fixedFiles = [];
                let portfolioChanged = false;

                for (const file of files) {
                    const filePath = path.join(uploadsDir, file);
                    const fileExists = fs.existsSync(filePath);
                    console.log(`    📄 ${file} - ${fileExists ? 'EXISTS' : 'MISSING'}`);
                    
                    if (!fileExists) {
                        hasIssues = true;
                        totalIssues++;
                        const correctPath = await findImageAnywhere(uploadsDir, file, submission.full_name);
                        if (correctPath) {
                            console.log(`    🔧 Fixed: ${file} → ${correctPath}`);
                            fixedFiles.push(correctPath);
                            portfolioChanged = true;
                            fixedIssues++;
                        } else {
                            console.log(`    ❌ File not found - removing`);
                            portfolioChanged = true;
                            fixedIssues++;
                        }
                    } else {
                        fixedFiles.push(file);
                    }
                }

                if (portfolioChanged) {
                    const newValue = fixedFiles.join(',');
                    await pool.query('UPDATE cv_submissions SET portfolio_files = $1 WHERE id = $2', [newValue || null, submission.id]);
                    console.log(`    ✅ Updated portfolio files in database`);
                }
            }

            // Check testimonial files
            if (submission.testimonial_files) {
                console.log(`  ⭐ Testimonial files:`);
                const files = submission.testimonial_files.split(',').map(f => f.trim()).filter(f => f);
                const fixedFiles = [];
                let testimonialChanged = false;

                for (const file of files) {
                    const filePath = path.join(uploadsDir, file);
                    const fileExists = fs.existsSync(filePath);
                    console.log(`    📄 ${file} - ${fileExists ? 'EXISTS' : 'MISSING'}`);
                    
                    if (!fileExists) {
                        hasIssues = true;
                        totalIssues++;
                        const correctPath = await findImageAnywhere(uploadsDir, file, submission.full_name);
                        if (correctPath) {
                            console.log(`    🔧 Fixed: ${file} → ${correctPath}`);
                            fixedFiles.push(correctPath);
                            testimonialChanged = true;
                            fixedIssues++;
                        } else {
                            console.log(`    ❌ File not found - removing`);
                            testimonialChanged = true;
                            fixedIssues++;
                        }
                    } else {
                        fixedFiles.push(file);
                    }
                }

                if (testimonialChanged) {
                    const newValue = fixedFiles.join(',');
                    await pool.query('UPDATE cv_submissions SET testimonial_files = $1 WHERE id = $2', [newValue || null, submission.id]);
                    console.log(`    ✅ Updated testimonial files in database`);
                }
            }

            // Check additional files
            if (submission.additional_files) {
                console.log(`  📎 Additional files:`);
                const files = submission.additional_files.split(',').map(f => f.trim()).filter(f => f);
                const fixedFiles = [];
                let additionalChanged = false;

                for (const file of files) {
                    const filePath = path.join(uploadsDir, file);
                    const fileExists = fs.existsSync(filePath);
                    console.log(`    📄 ${file} - ${fileExists ? 'EXISTS' : 'MISSING'}`);
                    
                    if (!fileExists) {
                        hasIssues = true;
                        totalIssues++;
                        const correctPath = await findImageAnywhere(uploadsDir, file, submission.full_name);
                        if (correctPath) {
                            console.log(`    🔧 Fixed: ${file} → ${correctPath}`);
                            fixedFiles.push(correctPath);
                            additionalChanged = true;
                            fixedIssues++;
                        } else {
                            console.log(`    ❌ File not found - removing`);
                            additionalChanged = true;
                            fixedIssues++;
                        }
                    } else {
                        fixedFiles.push(file);
                    }
                }

                if (additionalChanged) {
                    const newValue = fixedFiles.join(',');
                    await pool.query('UPDATE cv_submissions SET additional_files = $1 WHERE id = $2', [newValue || null, submission.id]);
                    console.log(`    ✅ Updated additional files in database`);
                }
            }

            if (!hasIssues) {
                console.log(`  ✅ All files verified successfully`);
            }
        }

        console.log(`\n🎉 Verification completed!`);
        console.log(`📊 Summary:`);
        console.log(`   - Total issues found: ${totalIssues}`);
        console.log(`   - Issues fixed: ${fixedIssues}`);
        console.log(`   - Status: ${totalIssues === 0 ? 'All files verified ✅' : fixedIssues === totalIssues ? 'All issues fixed ✅' : 'Some issues remain ⚠️'}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

async function findImageAnywhere(uploadsDir, originalPath, fullName) {
    // Extract filename
    const filename = path.basename(originalPath);
    
    // Generate possible folder names
    const sanitizedName = fullName
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();
    
    // Check numbered variations first
    for (let i = 0; i <= 50; i++) {
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

verifyAllImages();
