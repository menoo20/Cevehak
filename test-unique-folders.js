// TEST UNIQUE FOLDER GENERATION - Same Client Names
// This script tests that clients with identical names get separate folders

const { generateUserIdentifier } = require('./middleware/flexibleUpload');
const path = require('path');
const fs = require('fs');

async function testUniqueFolder() {
    console.log('🧪 TESTING UNIQUE FOLDER GENERATION');
    console.log('=====================================\n');

    // Simulate two identical clients submitting forms
    const client1Request = {
        body: {
            full_name: 'Mohammed Amin',
            email: 'mohammed1@example.com',
            service_type: 'cv-only'
        }
    };

    const client2Request = {
        body: {
            full_name: 'Mohammed Amin', // Same name!
            email: 'mohammed2@example.com', // Different email
            service_type: 'full-package'
        }
    };

    console.log('👤 Client 1: Mohammed Amin (mohammed1@example.com)');
    console.log('👤 Client 2: Mohammed Amin (mohammed2@example.com)');
    console.log('📂 Both clients have identical names - testing folder separation...\n');

    // Test folder generation
    console.log('1️⃣ GENERATING FOLDER FOR CLIENT 1:');
    const folder1 = generateUserIdentifier(client1Request);
    console.log(`   Generated: ${folder1}`);

    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    console.log('\n2️⃣ GENERATING FOLDER FOR CLIENT 2:');
    const folder2 = generateUserIdentifier(client2Request);
    console.log(`   Generated: ${folder2}`);

    console.log('\n3️⃣ VERIFICATION:');
    console.log(`   Client 1 folder: ${folder1}`);
    console.log(`   Client 2 folder: ${folder2}`);
    console.log(`   Are folders different? ${folder1 !== folder2 ? '✅ YES' : '❌ NO'}`);

    if (folder1 !== folder2) {
        console.log('\n🎉 SUCCESS: Each client gets a unique folder!');
        console.log('✅ File separation security implemented');
        console.log('✅ No risk of file mixing between clients');
    } else {
        console.log('\n❌ FAILURE: Folders are identical!');
        console.log('⚠️  Files could be mixed between clients');
    }

    // Test multiple submissions rapidly
    console.log('\n4️⃣ RAPID SUBMISSION TEST:');
    const folders = [];
    for (let i = 0; i < 5; i++) {
        const request = {
            body: {
                full_name: 'Ahmed Mohammed',
                email: `ahmed${i}@example.com`,
                service_type: 'cv-only'
            }
        };
        const folder = generateUserIdentifier(request);
        folders.push(folder);
        console.log(`   Submission ${i + 1}: ${folder}`);
    }

    const uniqueFolders = new Set(folders);
    console.log(`\n   Generated ${folders.length} folders, ${uniqueFolders.size} unique`);
    console.log(`   All unique? ${folders.length === uniqueFolders.size ? '✅ YES' : '❌ NO'}`);

    return {
        basicTest: folder1 !== folder2,
        rapidTest: folders.length === uniqueFolders.size,
        folders: { folder1, folder2, rapidFolders: folders }
    };
}

// Run the test
testUniqueFolder()
    .then(results => {
        console.log('\n📊 FINAL RESULTS:');
        console.log('==================');
        console.log(`Basic Test (Same Names): ${results.basicTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Rapid Submission Test: ${results.rapidTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Overall Status: ${results.basicTest && results.rapidTest ? '🟢 ALL TESTS PASSED' : '🔴 TESTS FAILED'}`);
        
        if (results.basicTest && results.rapidTest) {
            console.log('\n🛡️  SECURITY ACHIEVED:');
            console.log('   • Each submission gets unique folder');
            console.log('   • No file mixing between clients');
            console.log('   • Timestamp-based uniqueness ensures separation');
            console.log('   • Works even for rapid submissions');
        }
    })
    .catch(error => {
        console.error('❌ Test failed:', error);
    });
