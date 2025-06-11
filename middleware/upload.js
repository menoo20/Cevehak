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

// Helper function to generate user identifier from form data
const generateUserIdentifier = (req) => {
    // Create folder name using full name only
    const fullName = req.body.full_name || 'anonymous';
    const sanitizedName = fullName
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '') // Keep Arabic, English letters, numbers, and spaces
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim();
    
    return sanitizedName;
};

// Configure storage
const storage = multer.diskStorage({    destination: (req, file, cb) => {
        try {
            // Generate user identifier once per request and reuse it
            if (!req.userIdentifier) {
                const fullName = req.body.full_name || 'anonymous';
                const sanitizedName = fullName
                    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '') // Keep Arabic, English letters, numbers, and spaces
                    .replace(/\s+/g, '_') // Replace spaces with underscores
                    .trim();
                
                req.userIdentifier = sanitizedName;
            }
            
            // Create user-specific folder
            const userFolder = createUserFolder(req.userIdentifier);
            cb(null, userFolder);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${file.fieldname}_${sanitizedOriginalName}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('نوع الملف غير مدعوم. يُرجى رفع ملفات من نوع: صور (JPG, PNG) أو مستندات (PDF, DOC, DOCX)'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) // 5MB
    }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'حجم الملف كبير جداً. الحد الأقصى المسموح 5 ميجابايت'
            });
        }
    }
    
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next();
};

// Middleware to set user identifier before file processing
const setUserIdentifier = (req, res, next) => {
    if (!req.userIdentifier) {
        req.userIdentifier = generateUserIdentifier(req);
    }
    next();
};

module.exports = {
    upload,
    handleUploadError,
    createUserFolder,
    generateUserIdentifier,
    setUserIdentifier
};
