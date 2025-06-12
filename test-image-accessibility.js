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

async function testImageAccessibility() {
    try {
        console.log('🔍 Testing image accessibility...');

        // Get the latest submission
        const result = await pool.query('SELECT * FROM cv_submissions ORDER BY id DESC LIMIT 1');
        
        if (result.rows.length === 0) {
            console.log('❌ No submissions found');
            return;
        }

        const submission = result.rows[0];
        console.log(`\n👤 Testing submission: ${submission.full_name} (ID: ${submission.id})`);
        console.log(`🏷️ Service Type: ${submission.service_type}`);

        // Test profile image
        if (submission.profile_image) {
            const imagePath = path.join(__dirname, 'public', 'uploads', submission.profile_image);
            const imageExists = fs.existsSync(imagePath);
            
            console.log(`\n📸 Profile Image:`);
            console.log(`   Path: ${submission.profile_image}`);
            console.log(`   Full Path: ${imagePath}`);
            console.log(`   Exists: ${imageExists ? '✅ YES' : '❌ NO'}`);
            
            if (imageExists) {
                const stats = fs.statSync(imagePath);
                console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
                console.log(`   URL: http://localhost:3000/uploads/${submission.profile_image}`);
            }
        } else {
            console.log('\n📸 No profile image set');
        }

        // Test portfolio files
        if (submission.portfolio_files) {
            console.log(`\n📁 Portfolio Files:`);
            const files = submission.portfolio_files.split(',').map(f => f.trim()).filter(f => f);
            
            files.forEach((file, index) => {
                const filePath = path.join(__dirname, 'public', 'uploads', file);
                const fileExists = fs.existsSync(filePath);
                
                console.log(`   ${index + 1}. ${file}`);
                console.log(`      Exists: ${fileExists ? '✅ YES' : '❌ NO'}`);
                
                if (fileExists) {
                    const stats = fs.statSync(filePath);
                    console.log(`      Size: ${(stats.size / 1024).toFixed(1)} KB`);
                    console.log(`      URL: http://localhost:3000/uploads/${file}`);
                }
            });
        } else {
            console.log('\n📁 No portfolio files');
        }

        console.log('\n🎯 Test URLs to verify in browser:');
        if (submission.profile_image && fs.existsSync(path.join(__dirname, 'public', 'uploads', submission.profile_image))) {
            console.log(`   Profile: http://localhost:3000/uploads/${submission.profile_image}`);
        }
        
        if (submission.portfolio_files) {
            const files = submission.portfolio_files.split(',').map(f => f.trim()).filter(f => f);
            files.forEach(file => {
                if (fs.existsSync(path.join(__dirname, 'public', 'uploads', file))) {
                    console.log(`   Portfolio: http://localhost:3000/uploads/${file}`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

testImageAccessibility();
