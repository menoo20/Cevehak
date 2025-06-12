// Test script to verify unique folder generation is working
const FormData = require('form-data');
const fs = require('fs');
const http = require('http');
const path = require('path');

async function testUniqueFolder() {
    console.log('🧪 TESTING UNIQUE FOLDER GENERATION');
    console.log('===================================');
    
    // Check folders before submission
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    const foldersBefore = fs.readdirSync(uploadsDir).filter(item => {
        const itemPath = path.join(uploadsDir, item);
        return fs.statSync(itemPath).isDirectory();
    });
    
    console.log('📁 Folders BEFORE submission:', foldersBefore);
    
    // Create test form submission
    const form = new FormData();
    form.append('service_type', 'full-package');
    form.append('full_name', 'Mohammed amin'); // Same name as existing
    form.append('email', 'test@example.com');
    form.append('profession', 'Developer');
    form.append('bio', 'Test bio');
    form.append('phone', '1234567890');
    
    // Add a test file
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
        form.append('profile_image', fs.createReadStream(testImagePath));
    }
    
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/submit',
            method: 'POST',
            headers: form.getHeaders()
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log('📤 Response Status:', res.statusCode);
                console.log('📤 Response:', responseData);
                
                // Check folders after submission
                setTimeout(() => {
                    const foldersAfter = fs.readdirSync(uploadsDir).filter(item => {
                        const itemPath = path.join(uploadsDir, item);
                        return fs.statSync(itemPath).isDirectory();
                    });
                    
                    console.log('📁 Folders AFTER submission:', foldersAfter);
                    
                    // Check if new unique folder was created
                    const newFolders = foldersAfter.filter(folder => !foldersBefore.includes(folder));
                    console.log('✨ NEW unique folders created:', newFolders);
                    
                    if (newFolders.length > 0) {
                        console.log('✅ SUCCESS: Unique folder generation is working!');
                        newFolders.forEach(folder => {
                            console.log(`   📂 ${folder}`);
                            // List files in new folder
                            const folderPath = path.join(uploadsDir, folder);
                            const files = fs.readdirSync(folderPath);
                            files.forEach(file => console.log(`      - ${file}`));
                        });
                    } else {
                        console.log('❌ ISSUE: No unique folder was created');
                    }
                    
                    resolve();
                }, 1000);
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });
        
        form.pipe(req);
    });
}

// Run the test
testUniqueFolder().catch(console.error);
