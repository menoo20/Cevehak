// Test Email Configuration
require('dotenv').config();
const { sendNotificationEmail } = require('./config/email');

const testEmailNotification = async () => {
    console.log('🧪 Testing email notification system...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('📬 Notification Email:', process.env.NOTIFICATION_EMAIL);
    
    // Test data
    const testData = {
        full_name: 'اختبار النظام',
        profession: 'مطور ويب',
        email: 'test@example.com',
        phone: '0501234567',
        bio: 'هذا اختبار لنظام الإشعارات عبر البريد الإلكتروني',
        service_type: 'full-package',
        submission_date: new Date().toISOString()
    };
    
    try {
        await sendNotificationEmail(testData);
        console.log('✅ Email sent successfully!');
        console.log('📨 Check your email:', process.env.NOTIFICATION_EMAIL);
    } catch (error) {
        console.error('❌ Email failed to send:');
        console.error('Error message:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('🔑 Check your EMAIL_USER and EMAIL_PASSWORD in .env file');
            console.log('💡 Make sure you\'re using an App Password for Gmail');
        }
        
        if (error.message.includes('authentication')) {
            console.log('🔐 Authentication failed - verify your credentials');
        }
    }
};

testEmailNotification();
