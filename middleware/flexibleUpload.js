const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper function to create user folder
const createUserFolder = (userIdentifier) => {
    const userFolder = path.join(uploadDir, userIdentifier);
    
    // Create folder (each folder is now unique with timestamp)
    if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
        console.log(`📁 Created unique folder: ${userIdentifier}`);
    } else {
        // This should rarely happen since we use timestamps, but handle it gracefully
        console.log(`📁 Folder already exists (rare): ${userIdentifier}`);
    }
    
    return userFolder;
};

// Helper function to generate user identifier from form data
const generateUserIdentifier = (req) => {
    // Create a unique identifier with timestamp and random component
    // Since req.body is not available during multer storage phase,
    // we'll use a timestamp-based approach that's still unique and readable
    
    const now = new Date();
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    // Create a more readable folder name with date
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    
    const uniqueIdentifier = `client_${dateStr}_${timeStr}_${randomComponent}`;
    
    console.log(`📁 Generated unique folder identifier: ${uniqueIdentifier}`);
    return uniqueIdentifier;
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            // Generate user identifier once per request and reuse it
            if (!req.userIdentifier) {
                req.userIdentifier = generateUserIdentifier(req);
            }

            // Create unique user folder
            const userFolder = createUserFolder(req.userIdentifier);
            req.userFolder = userFolder; // Store for later use
            
            cb(null, userFolder);
        } catch (error) {
            console.error('Error creating user folder:', error);
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp and original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        
        // Sanitize filename
        const sanitizedBaseName = baseName
            .replace(/[^\u0600-\u06FFa-zA-Z0-9\s\-_]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50); // Limit length
        
        cb(null, `${sanitizedBaseName}_${uniqueSuffix}${extension}`);
    }
});

// File filter with expanded support
const fileFilter = (req, file, cb) => {
    // Define allowed file types by field
    const allowedTypes = {
        'profile_image': {
            mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        },
        'cv_file': {
            mimes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            extensions: ['.pdf', '.doc', '.docx']
        },
        'portfolio_files': {
            mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
            extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
        },
        'testimonial_files': {
            mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
            extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
        },
        'additional_files': {
            mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
        }
    };

    const fieldType = file.fieldname;
    const allowedForField = allowedTypes[fieldType];

    if (!allowedForField) {
        return cb(new Error(`نوع الحقل ${fieldType} غير مدعوم`), false);
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isValidMime = allowedForField.mimes.includes(file.mimetype);
    const isValidExtension = allowedForField.extensions.includes(fileExtension);

    if (isValidMime && isValidExtension) {
        cb(null, true);
    } else {
        cb(new Error(`نوع الملف ${fileExtension} غير مدعوم للحقل ${fieldType}`), false);
    }
};

// Create flexible upload middleware that adapts to service type
const createFlexibleUpload = (serviceType) => {
    let fields = [];

    switch(serviceType) {
        case 'cv-to-website':
            fields = [
                { name: 'cv_file', maxCount: 1 },
                { name: 'profile_image', maxCount: 1 },
                { name: 'portfolio_files', maxCount: 10 },
                { name: 'additional_files', maxCount: 5 }
            ];
            break;
        case 'full-package':
            fields = [
                { name: 'profile_image', maxCount: 1 },
                { name: 'portfolio_files', maxCount: 10 },
                { name: 'testimonial_files', maxCount: 5 },
                { name: 'additional_files', maxCount: 5 }
            ];
            break;
        case 'cv-only':
            fields = [
                { name: 'profile_image', maxCount: 1 },
                { name: 'additional_files', maxCount: 3 }
            ];
            break;
        default:
            // Fallback - support all possible fields
            fields = [
                { name: 'profile_image', maxCount: 1 },
                { name: 'cv_file', maxCount: 1 },
                { name: 'portfolio_files', maxCount: 10 },
                { name: 'testimonial_files', maxCount: 5 },
                { name: 'additional_files', maxCount: 10 }
            ];
    }

    return multer({        storage: storage,        fileFilter: fileFilter,
        limits: {
            fileSize: 4 * 1024 * 1024, // 4MB per file (Vercel free plan compatible)
            files: 20 // Maximum files for complete CV submission
        }
    }).fields(fields);
};

// Generic upload middleware for all services
const upload = multer({    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024, // 4MB per file (Vercel free plan compatible)
        files: 20 // Maximum files for complete CV submission
    }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        let message = 'خطأ في تحميل الملف';
        
        switch(error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'عدد الملفات أكثر من المسموح';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'حقل ملف غير متوقع';
                break;
        }
        
        return res.status(400).json({
            success: false,
            message: message
        });
    }
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next();
};

module.exports = {
    upload,
    createFlexibleUpload,
    handleUploadError,
    createUserFolder,
    generateUserIdentifier
};
