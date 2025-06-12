// Simple test to submit form and check for unique folders
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Test data
const formData = querystring.stringify({
    service_type: 'full-package',
    full_name: 'Mohammed amin',
    email: 'test@example.com', 
    profession: 'Developer',
    bio: 'Test bio for unique folder testing',
    phone: '123456789'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/submit',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData)
    }
};

console.log('🧪 Testing unique folder creation...');
console.log('📡 Submitting form data for: Mohammed amin');

// Check folders before
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const foldersBefore = fs.readdirSync(uploadsDir).filter(item => {
    const itemPath = path.join(uploadsDir, item);
    return fs.statSync(itemPath).isDirectory();
});
console.log('📁 Folders BEFORE:', foldersBefore);

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('📤 Response Status:', res.statusCode);
        console.log('📤 Response Body:', responseData);
        
        // Check folders after submission
        setTimeout(() => {
            const foldersAfter = fs.readdirSync(uploadsDir).filter(item => {
                const itemPath = path.join(uploadsDir, item);
                return fs.statSync(itemPath).isDirectory();
            });
            
            console.log('📁 Folders AFTER:', foldersAfter);
            
            const newFolders = foldersAfter.filter(f => !foldersBefore.includes(f));
            if (newFolders.length > 0) {
                console.log('✅ SUCCESS: New unique folders created:', newFolders);
            } else {
                console.log('❌ No new folders created - check if fix is working');
            }
        }, 1000);
    });
});

req.on('error', (error) => {
    console.error('❌ Request error:', error);
});

req.write(formData);
req.end();
