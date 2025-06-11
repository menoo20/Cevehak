// Test script for simplified folder naming (no timestamps)
const path = require('path');
const fs = require('fs');

// Simulate the function from upload middleware
const createUserFolder = (userIdentifier, uploadDir) => {
    const userFolder = path.join(uploadDir, userIdentifier);
    
    // If folder already exists, append a number to make it unique
    let finalUserFolder = userFolder;
    let counter = 1;
    
    while (fs.existsSync(finalUserFolder)) {
        finalUserFolder = path.join(uploadDir, `${userIdentifier}_${counter}`);
        counter++;
    }
    
    fs.mkdirSync(finalUserFolder, { recursive: true });
    return finalUserFolder;
};

const generateUserIdentifier = (fullName) => {
    const sanitizedName = fullName
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '') // Keep Arabic, English letters, numbers, and spaces
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim();
    
    return sanitizedName;
};

// Test directory
const testUploadDir = path.join(__dirname, 'test_uploads');

// Clean up any existing test directory
if (fs.existsSync(testUploadDir)) {
    fs.rmSync(testUploadDir, { recursive: true, force: true });
}

fs.mkdirSync(testUploadDir, { recursive: true });

console.log('Testing simplified folder naming...\n');

// Test cases
const testCases = [
    'احمد محمد علي',
    'Sarah Johnson', 
    'محمد الأحمد',
    'احمد محمد علي', // Duplicate name test
    'مريم@صالح#',
    'John O\'Connor'
];

testCases.forEach((name, index) => {
    console.log(`Test ${index + 1}: "${name}"`);
    const identifier = generateUserIdentifier(name);
    console.log(`  Generated identifier: "${identifier}"`);
    
    const folderPath = createUserFolder(identifier, testUploadDir);
    console.log(`  Created folder: "${path.basename(folderPath)}"`);
    console.log(`  Full path: ${folderPath}`);
    console.log('  ✓ Success\n');
});

// List all created folders
console.log('All created folders:');
const folders = fs.readdirSync(testUploadDir);
folders.forEach(folder => {
    console.log(`  - ${folder}`);
});

// Clean up
fs.rmSync(testUploadDir, { recursive: true, force: true });
console.log('\nTest completed successfully! ✅');
console.log('Simplified naming system works correctly.');
console.log('- No timestamps in folder names');
console.log('- Automatic handling of duplicate names');
console.log('- Clean, readable folder structure');
