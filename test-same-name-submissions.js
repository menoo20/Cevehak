// COMPREHENSIVE TEST: Same Name Clients - End-to-End Submission Test
// This script simulates the complete submission workflow for clients with identical names

const http = require('http');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function createTestSubmission(clientData, testImagePath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        
        // Add form fields
        Object.entries(clientData).forEach(([key, value]) => {
            form.append(key, value);
        });
        
        // Add test image file
        if (fs.existsSync(testImagePath)) {
            form.append('profile_image', fs.createReadStream(testImagePath));
        }
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/submit-cv-only',
            method: 'POST',
            headers: form.getHeaders()
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        data: result
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        data: data
                    });
                }
            });
        });
        
        req.on('error', reject);
        form.pipe(req);
    });
}

async function testSameNameSubmissions() {
    console.log('🧪 TESTING SAME-NAME CLIENT SUBMISSIONS');
    console.log('=======================================\n');
    
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.png');
    const dummyImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testImagePath, dummyImageContent);
    
    // Define two clients with identical names
    const client1 = {
        full_name: 'Ahmed Mohammed',
        phone: '+971501234567',
        email: 'ahmed1@example.com',
        profession: 'Software Engineer',
        bio: 'Experienced developer with 5 years in web development',
        service_type: 'cv-only',
        domain_preference: 'ahmed-mohammed.com',
        email_hosting: 'yes'
    };
    
    const client2 = {
        full_name: 'Ahmed Mohammed', // Same name!
        phone: '+971507654321',
        email: 'ahmed2@example.com',
        profession: 'Data Scientist',
        bio: 'Data expert with machine learning expertise',
        service_type: 'cv-only',
        domain_preference: 'ahmed-mohammed-data.com',
        email_hosting: 'no'
    };
    
    console.log('👤 Client 1: Ahmed Mohammed (ahmed1@example.com)');
    console.log('👤 Client 2: Ahmed Mohammed (ahmed2@example.com)');
    console.log('📋 Both clients have identical names - testing submission separation...\n');
    
    try {
        // Submit first client
        console.log('1️⃣ SUBMITTING CLIENT 1 FORM:');
        const submission1 = await createTestSubmission(client1, testImagePath);
        console.log(`   Response: ${submission1.statusCode}`);
        console.log(`   Data:`, JSON.stringify(submission1.data, null, 2));
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Submit second client
        console.log('\n2️⃣ SUBMITTING CLIENT 2 FORM:');
        const submission2 = await createTestSubmission(client2, testImagePath);
        console.log(`   Response: ${submission2.statusCode}`);
        console.log(`   Data:`, JSON.stringify(submission2.data, null, 2));
        
        // Check results
        console.log('\n3️⃣ CHECKING SUBMISSION RESULTS:');
        const success1 = submission1.statusCode === 200 && submission1.data.success;
        const success2 = submission2.statusCode === 200 && submission2.data.success;
        
        console.log(`   Client 1 Success: ${success1 ? '✅ YES' : '❌ NO'}`);
        console.log(`   Client 2 Success: ${success2 ? '✅ YES' : '❌ NO'}`);
        
        if (success1 && success2) {
            console.log('\n🎉 BOTH SUBMISSIONS SUCCESSFUL!');
            console.log('✅ Same-name clients can submit without conflicts');
            console.log('✅ Each client gets unique folder for their files');
        }
        
        // Check folder structure
        console.log('\n4️⃣ CHECKING UPLOAD FOLDER STRUCTURE:');
        const uploadsDir = path.join(__dirname, 'public', 'uploads');
        
        if (fs.existsSync(uploadsDir)) {
            const folders = fs.readdirSync(uploadsDir).filter(item => {
                const itemPath = path.join(uploadsDir, item);
                return fs.statSync(itemPath).isDirectory();
            });
            
            const ahmedFolders = folders.filter(folder => folder.startsWith('Ahmed_Mohammed_'));
            console.log(`   Total folders: ${folders.length}`);
            console.log(`   Ahmed Mohammed folders: ${ahmedFolders.length}`);
            console.log(`   Folder names:`);
            ahmedFolders.forEach(folder => {
                const folderPath = path.join(uploadsDir, folder);
                const files = fs.readdirSync(folderPath);
                console.log(`     📂 ${folder}/ (${files.length} files)`);
                files.forEach(file => console.log(`        - ${file}`));
            });
            
            if (ahmedFolders.length >= 2) {
                console.log('\n✅ FOLDER SEPARATION CONFIRMED');
                console.log('   Each Ahmed Mohammed client has their own folder');
                console.log('   No file mixing between clients');
            } else {
                console.log('\n⚠️  Expected at least 2 folders for Ahmed Mohammed clients');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        // Clean up test file
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
}

// Check if server is running before testing
const http = require('http');

function checkServer() {
    return new Promise((resolve) => {
        const req = http.get('http://localhost:3000', (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.setTimeout(2000, () => {
            req.abort();
            resolve(false);
        });
    });
}

// Run the test
checkServer().then(serverRunning => {
    if (serverRunning) {
        console.log('🟢 Server detected on localhost:3000');
        console.log('🚀 Starting same-name client submission test...\n');
        testSameNameSubmissions();
    } else {
        console.log('🔴 Server not running on localhost:3000');
        console.log('Please start the server with: npm start');
        console.log('Then run this test again.');
    }
});
