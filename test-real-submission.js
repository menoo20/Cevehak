// Real submission test to verify unique folders work with actual form data
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testRealSubmission() {
    console.log('🧪 Testing Real Submission with Same Names');
    console.log('==========================================\n');

    try {
        // Create test image file
        const testImagePath = path.join(__dirname, 'test-image.png');
        fs.writeFileSync(testImagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64'));

        // Test 1: First submission
        console.log('📤 Submitting first form (Mohammed Amin)...');
        const form1 = new FormData();
        form1.append('full_name', 'Mohammed Amin');
        form1.append('profession', 'Software Engineer');
        form1.append('bio', 'Experienced developer');
        form1.append('service_type', 'cv-only');
        form1.append('profile_image', fs.createReadStream(testImagePath), 'profile.png');

        const response1 = await fetch('http://localhost:3000/submit-cv', {
            method: 'POST',
            body: form1,
        });

        if (response1.ok) {
            console.log('✅ First submission successful');
        } else {
            console.log('❌ First submission failed:', response1.status);
        }

        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));

        // Test 2: Second submission with same name
        console.log('📤 Submitting second form (Mohammed Amin - same name)...');
        const form2 = new FormData();
        form2.append('full_name', 'Mohammed Amin');
        form2.append('profession', 'Graphic Designer');
        form2.append('bio', 'Creative professional');
        form2.append('service_type', 'cv-only');
        form2.append('profile_image', fs.createReadStream(testImagePath), 'profile2.png');

        const response2 = await fetch('http://localhost:3000/submit-cv', {
            method: 'POST',
            body: form2,
        });

        if (response2.ok) {
            console.log('✅ Second submission successful');
        } else {
            console.log('❌ Second submission failed:', response2.status);
        }

        // Check folder structure
        console.log('\n📁 Checking folder structure...');
        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        const folders = fs.readdirSync(uploadsDir).filter(item => {
            const itemPath = path.join(uploadsDir, item);
            return fs.statSync(itemPath).isDirectory() && item.startsWith('Mohammed_Amin');
        });

        console.log(`📊 Found ${folders.length} folders for Mohammed Amin:`);
        folders.forEach((folder, index) => {
            const folderPath = path.join(uploadsDir, folder);
            const files = fs.readdirSync(folderPath);
            console.log(`   ${index + 1}. ${folder}/ (${files.length} files)`);
            files.forEach(file => console.log(`      - ${file}`));
        });

        if (folders.length >= 2) {
            console.log('\n🎉 SUCCESS: Each submission created a unique folder!');
            console.log('✅ File separation working correctly');
        } else {
            console.log('\n⚠️  WARNING: Expected at least 2 folders for same-name clients');
        }

        // Cleanup
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testRealSubmission();
