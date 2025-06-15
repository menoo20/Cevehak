// Configuration for Frontend-Only File Upload Solutions
// This works perfectly with GitHub Pages!

// Cloudinary Configuration (Free tier: 25 credits/month, 100MB per file)
// Sign up at: https://cloudinary.com
// Create an "unsigned upload preset" for frontend uploads
window.CLOUDINARY_CONFIG = {
    enabled: false, // ✅ Set to true when you configure Cloudinary
    cloudName: 'your-cloud-name', // Replace with your Cloudinary cloud name
    uploadPreset: 'cv_uploads', // Create this preset in Cloudinary dashboard
    folder: 'cv-submissions', // Optional: organize uploads in folders
    
    // File size limits (Free tier)
    maxFileSize: 100 * 1024 * 1024, // 100MB per file
    maxTotalSize: 500 * 1024 * 1024, // 500MB total per submission
    allowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov']
};

// Google Drive Shared Folder Configuration
// Create a public folder and set permissions to "Anyone with link can edit"
window.GOOGLE_DRIVE_CONFIG = {
    enabled: false, // ❌ DISABLE manual Google Drive uploads
    sharedFolderId: '1eIQ9MlA8wldnHmysIkS4FSzkeLtZz1bc', // Keep for backup
    folderUrl: 'https://drive.google.com/drive/folders/1eIQ9MlA8wldnHmysIkS4FSzkeLtZz1bc' // Keep for backup
};

// Alternative Upload Services (All frontend-only)
window.UPLOAD_SERVICES = {
    // Uploadcare (Free tier: 3000 uploads/month)
    uploadcare: {
        enabled: false,
        publicKey: 'your-uploadcare-public-key'
    },
    
    // FilePond with cloud storage
    filepond: {
        enabled: false,
        server: 'https://your-upload-endpoint.com'
    },
    
    // DropzoneJS with cloud storage
    dropzone: {
        enabled: false,
        url: 'https://your-upload-endpoint.com'
    }
};

// Email Instructions Template - Optimized for WhatsApp Workflow
window.EMAIL_TEMPLATES = {
    uploadInstructions: `
� خطوات استكمال طلبك - Cevehak:

✅ تم استلام طلبك بنجاح!

📞 التواصل التالي:
سنتواصل معك عبر الواتساب خلال 24 ساعة لاستلام الملفات المطلوبة.

📂 الملفات المطلوبة:
{{FILE_LIST}}

⏰ مدة التسليم:
• تحويل السيرة الذاتية: 3-5 أيام
• الباقة الكاملة: 5-7 أيام  
• السيرة الذاتية فقط: 2-3 أيام

💡 نصائح مهمة:
• احتفظ بالملفات جاهزة على جهازك
• تأكد من جودة الصور (عالية الدقة)
• ملفات PDF للسيرة الذاتية مفضلة

📧 تواصل بديل: cevehak@gmail.com
🌐 موقعنا: cevehak.com

شكراً لثقتك في خدماتنا! 🎉
    `
};

// Enable/Disable Features
window.FEATURE_FLAGS = {
    cloudinaryUpload: false, // Set to true for automatic Cloudinary upload
    googleDriveInstructions: false, // ❌ DISABLE Google Drive manual upload
    whatsappBackup: true, // ✅ MAIN METHOD - WhatsApp file sharing
    emailAttachments: false // EmailJS doesn't support large attachments
};
