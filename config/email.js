const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendNotificationEmail = async (formData) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `طلب جديد لتحويل السيرة الذاتية - ${formData.full_name}`,
            html: `
                <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
                    <h2>طلب جديد لتحويل السيرة الذاتية إلى موقع ويب</h2>
                    
                    <h3>البيانات الشخصية:</h3>
                    <p><strong>الاسم الكامل:</strong> ${formData.full_name}</p>
                    <p><strong>التخصص/الوظيفة:</strong> ${formData.profession}</p>
                    <p><strong>النبذة التعريفية:</strong> ${formData.bio || 'غير محدد'}</p>
                    
                    <h3>المؤهلات والخبرات:</h3>
                    <p><strong>المؤهلات الأكاديمية:</strong> ${formData.education || 'غير محدد'}</p>
                    <p><strong>الخبرات العملية:</strong> ${formData.experience || 'غير محدد'}</p>
                    <p><strong>المهارات:</strong> ${formData.skills || 'غير محدد'}</p>
                    <p><strong>اللغات:</strong> ${formData.languages || 'غير محدد'}</p>
                    
                    <h3>معلومات التواصل:</h3>
                    <p><strong>البريد الإلكتروني:</strong> ${formData.email}</p>
                    <p><strong>رقم الجوال:</strong> ${formData.phone || 'غير محدد'}</p>
                    <p><strong>وسائل التواصل الاجتماعي:</strong> ${formData.social_media || 'غير محدد'}</p>
                    
                    <h3>أهداف الموقع:</h3>
                    <p>${formData.website_goals ? formData.website_goals.join(', ') : 'غير محدد'}</p>
                    
                    <h3>تفضيلات الخدمة:</h3>
                    <p><strong>حجز نطاق:</strong> ${formData.domain_preference || 'غير محدد'}</p>
                    <p><strong>بريد رسمي:</strong> ${formData.email_hosting_preference || 'غير محدد'}</p>
                    
                    <p><strong>تاريخ التقديم:</strong> ${new Date().toLocaleString('ar-SA')}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully');
    } catch (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }
};

const sendConfirmationEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'تأكيد استلام طلبك لتحويل السيرة الذاتية',
            html: `
                <div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px;">
                    <h2>شكراً لك ${name}</h2>
                    <p>تم استلام طلبك لتحويل السيرة الذاتية إلى موقع ويب بنجاح.</p>
                    <p>سنقوم بمراجعة طلبك والتواصل معك قريباً لبدء العمل على موقعك الشخصي.</p>
                    
                    <h3>الخطوات التالية:</h3>
                    <ul>
                        <li>مراجعة البيانات المرسلة</li>
                        <li>تحضير تصميم أولي للموقع</li>
                        <li>التواصل معك لمناقشة التفاصيل</li>
                        <li>البدء في تطوير الموقع</li>
                    </ul>
                    
                    <p>في حالة وجود أي استفسارات، لا تتردد في التواصل معنا.</p>
                    <p>شكراً لثقتك بخدماتنا!</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        throw error;
    }
};

module.exports = {
    sendNotificationEmail,
    sendConfirmationEmail
};
