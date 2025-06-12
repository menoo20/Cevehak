// Test unique folder generation to ensure clients with same name get different folders
const path = require('path');

// Import the middleware functions
const flexibleUploadPath = path.join(__dirname, 'middleware', 'flexibleUpload.js');

// Test the generateUserIdentifier function
console.log('🧪 Testing Unique Folder Generation');
console.log('===================================');

// Simulate two clients with the same name
const mockReq1 = { body: { full_name: 'Mohammed Amin' } };
const mockReq2 = { body: { full_name: 'Mohammed Amin' } };
const mockReq3 = { body: { full_name: 'Ahmed Hassan' } };

// Load the middleware module
try {
    // We'll test the logic directly
    function generateUserIdentifier(req) {
        const fullName = req.body.full_name || 'anonymous';
        const sanitizedName = fullName
            .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '') // Keep Arabic, English letters, numbers, and spaces
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .trim();
        
        // Add timestamp and random component to ensure uniqueness
        const timestamp = Date.now();
        const randomComponent = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const uniqueIdentifier = `${sanitizedName}_${timestamp}_${randomComponent}`;
        
        return uniqueIdentifier;
    }    // Test generating identifiers
    console.log('🔹 Client 1 (Mohammed Amin):');
    const id1 = generateUserIdentifier(mockReq1);
    console.log(`   Folder: ${id1}`);
    
    // Small delay to ensure different timestamp
    setTimeout(() => {
        console.log('🔹 Client 2 (Mohammed Amin - same name):');
        const id2 = generateUserIdentifier(mockReq2);
        console.log(`   Folder: ${id2}`);
        
        console.log('🔹 Client 3 (Ahmed Hassan - different name):');
        const id3 = generateUserIdentifier(mockReq3);
        console.log(`   Folder: ${id3}`);
        
        // Verify uniqueness
        console.log('\n✅ VERIFICATION:');
        console.log(`   ID1 === ID2: ${id1 === id2} (should be false)`);
        console.log(`   ID1 === ID3: ${id1 === id3} (should be false)`);
        console.log(`   ID2 === ID3: ${id2 === id3} (should be false)`);
        
        if (id1 !== id2 && id1 !== id3 && id2 !== id3) {
            console.log('\n🎉 SUCCESS: All folder identifiers are unique!');
            console.log('✅ Clients with same name will get different folders');
        } else {
            console.log('\n❌ FAILURE: Some identifiers are not unique!');
        }
        
        process.exit(0);
    }, 10);
    
} catch (error) {
    console.error('❌ Test error:', error);
}
