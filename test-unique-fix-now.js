// Quick test to verify unique folder generation is working
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUniqueFolder() {
    console.log('🧪 Testing unique folder generation...');
    
    // Check current folder structure
    const uploadsDir = path.join(__dirname, 'public', 'uploads');
    console.log('📁 Before submission:');
    const beforeFolders = fs.readdirSync(uploadsDir).filter(item => 
        fs.statSync(path.join(uploadsDir, item)).isDirectory()
    );
    console.log('   Folders:', beforeFolders);
    
    // Create test form data
    const form = new FormData();
    form.append('service_type', 'full-package');
    form.append('full_name', 'Mohammed amin');
    form.append('email', 'test@example.com');
    form.append('profession', 'Test');
    form.append('bio', 'Test bio');
    
    // Create a test file for upload
    const testImagePath = path.join(__dirname, 'test-image.png');
    if (fs.existsSync(testImagePath)) {
        form.append('profile_image', fs.createReadStream(testImagePath));
    }
    
    try {
        // Make the submission
        const response = await fetch('http://localhost:3000/submit', {
            method: 'POST',
            body: form
        });
        
        console.log('📤 Submission response:', response.status, response.statusText);
        
        // Check folder structure after submission
        console.log('📁 After submission:');
        const afterFolders = fs.readdirSync(uploadsDir).filter(item => 
            fs.statSync(path.join(uploadsDir, item)).isDirectory()
        );
        console.log('   Folders:', afterFolders);
        
        // Check if new unique folder was created
        const newFolders = afterFolders.filter(folder => !beforeFolders.includes(folder));
        
        if (newFolders.length > 0) {
            console.log('✅ SUCCESS: New unique folder(s) created:', newFolders);
            console.log('🎉 Unique folder generation is WORKING!');
        } else {
            console.log('❌ ISSUE: No new folders created - still using old folder');
            console.log('🔍 Need to investigate why unique generation isn\'t working');
        }
        
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testUniqueFolder();
