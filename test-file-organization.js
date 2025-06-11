// Test script to verify the new file organization system
const { generateUserIdentifier, createUserFolder } = require('./middleware/upload');
const path = require('path');

// Test the user identifier generation
const testReq = {
    body: {
        full_name: 'أحمد محمد العلي',
        email: 'ahmed.ali@example.com'
    }
};

// Test the user identifier generation
const testReq1 = {
    body: {
        full_name: 'أحمد محمد العلي',
        email: 'ahmed.ali@example.com'
    }
};

const testReq2 = {
    body: {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com'
    }
};

console.log('🧪 Testing File Organization System');
console.log('================================');

// Test Arabic name
const userIdentifier1 = generateUserIdentifier(testReq1);
console.log('✅ Arabic Name Identifier:', userIdentifier1);

// Test English name
const userIdentifier2 = generateUserIdentifier(testReq2);
console.log('✅ English Name Identifier:', userIdentifier2);

// Test expected folder structure
const uploadDir = path.join(__dirname, 'public/uploads');
console.log('\n📁 Upload Directory:', uploadDir);
console.log('📁 Arabic User Folder:', path.join(uploadDir, userIdentifier1));
console.log('📁 English User Folder:', path.join(uploadDir, userIdentifier2));

// Test file path construction (using Arabic example)
const userIdentifier = userIdentifier1;
const testFiles = {
    profile_image: 'profile_image_headshot.jpg',
    portfolio_files: ['portfolio_files_project1.pdf', 'portfolio_files_design.jpg'],
    testimonial_files: ['testimonial_files_recommendation.pdf']
};

console.log('\n📋 Expected File Paths:');
console.log('Profile Image:', `${userIdentifier}/${testFiles.profile_image}`);
console.log('Portfolio Files:', testFiles.portfolio_files.map(f => `${userIdentifier}/${f}`).join(', '));
console.log('Testimonial Files:', testFiles.testimonial_files.map(f => `${userIdentifier}/${f}`).join(', '));

console.log('\n🌐 Expected URLs:');
console.log('Profile Image URL:', `http://localhost:3000/uploads/${userIdentifier}/${testFiles.profile_image}`);
console.log('Portfolio File URL:', `http://localhost:3000/uploads/${userIdentifier}/${testFiles.portfolio_files[0]}`);

console.log('\n✨ File organization system is ready for testing!');
