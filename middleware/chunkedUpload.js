const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chunked upload strategy for large CV submissions
const createChunkedUpload = () => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const userFolder = req.body.submissionId || `temp_${Date.now()}`;
            const uploadPath = path.join(__dirname, '../public/uploads', userFolder);
            
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${file.fieldname}_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });

    return multer({
        storage: storage,
        limits: {
            fileSize: 4 * 1024 * 1024, // 4MB per chunk (Vercel compatible)
            files: 3 // Max 3 files per request
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('نوع الملف غير مدعوم. يُسمح بـ: JPG, PNG, PDF, DOC, DOCX'));
            }
        }
    });
};

module.exports = { createChunkedUpload };
