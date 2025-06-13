const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./config/database');
const { serviceConfigs } = require('./config/services');

// Import flexible middleware
const { createFlexibleUpload, handleUploadError } = require('./middleware/flexibleUpload');
const { validateByService, sanitizeByService } = require('./middleware/flexibleValidation');
const CVSubmission = require('./models/CVSubmission');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/upload-cv', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'upload-cv.html'));
});

app.get('/create-from-scratch', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create-from-scratch.html'));
});

app.get('/create-cv-only', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create-cv-only.html'));
});

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Flexible CV Service Server is running!', 
        timestamp: new Date().toISOString(),
        services: Object.keys(serviceConfigs)
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const { testConnection } = require('./config/database');
        const dbConnected = await testConnection();
        
        res.json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            database: dbConnected ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development',
            services: Object.keys(serviceConfigs)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            timestamp: new Date().toISOString(),
            database: 'error',
            error: error.message
        });
    }
});

// Serve uploaded files
app.get('/uploads/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, 'public', 'uploads', folder, filename);
    
    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
});

// Flexible form submission endpoint
app.post('/submit', 
    // Middleware to detect service type early and create upload config
    (req, res, next) => {
        // Parse form data to get service_type
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
            // For multipart forms, we need to extract service_type from the form
            // We'll use a universal upload middleware that supports all fields
            const { upload } = require('./middleware/flexibleUpload');
            
            // Use universal upload middleware with all possible fields
            const universalUpload = upload.fields([
                { name: 'profile_image', maxCount: 1 },
                { name: 'cv_file', maxCount: 1 },
                { name: 'portfolio_files', maxCount: 10 },
                { name: 'testimonial_files', maxCount: 5 },
                { name: 'additional_files', maxCount: 10 }
            ]);
              universalUpload(req, res, (err) => {
                if (err) {
                    console.error('📎 File upload error:', err.message);
                    return handleUploadError(err, req, res, next);
                }
                
                // Now we can safely access req.body.service_type
                const serviceType = req.body.service_type || 'full-package';
                req.serviceType = serviceType;
                
                console.log(`📋 Processing ${serviceType} submission for:`, req.body.full_name || 'Unknown');
                
                // Log uploaded files
                if (req.files && Object.keys(req.files).length > 0) {
                    console.log('📁 Files received:');
                    Object.keys(req.files).forEach(fieldName => {
                        const files = req.files[fieldName];
                        console.log(`  - ${fieldName}: ${files.length} file(s)`);
                        files.forEach(file => {
                            console.log(`    📄 ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`);
                        });
                    });
                } else {
                    console.log('📁 No files uploaded');
                }
                
                next();
            });
        } else {
            // For JSON requests
            const serviceType = req.body.service_type || 'full-package';
            req.serviceType = serviceType;
            next();
        }
    },
      // Input sanitization
    sanitizeByService,
    
    // Service-specific validation
    validateByService,
    
    // Main submission processing
    async (req, res) => {
        try {
            // Prepare submission data
            const submissionData = {
                ...req.body,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                submission_date: new Date()            };
            
            // Define user folder for file organization
            const userFolder = req.userIdentifier || 'default';

            // Handle uploaded files with user folder structure
            if (req.files) {
                // Process each possible file field
                const fileFields = ['profile_image', 'cv_file', 'portfolio_files', 'testimonial_files', 'additional_files'];
                
                fileFields.forEach(fieldName => {
                    if (req.files[fieldName]) {
                        if (Array.isArray(req.files[fieldName])) {
                            // Multiple files
                            submissionData[fieldName] = req.files[fieldName]
                                .map(file => `${userFolder}/${file.filename}`)
                                .join(',');
                        } else {
                            // Single file
                            submissionData[fieldName] = `${userFolder}/${req.files[fieldName].filename}`;
                        }
                    }
                });
            }
            
            console.log(`💾 Processing submission data for ${req.serviceType}...`);
            console.log(`📂 User folder: ${userFolder}`);

            console.log(`✅ ${req.serviceType} submission processed:`, {
                name: submissionData.full_name,
                email: submissionData.email,
                service: req.serviceType,
                files: req.files ? Object.keys(req.files) : 'none'
            });

            // Save to database
            const result = await CVSubmission.create(submissionData);            // Send emails (optional - won't fail if not configured)
            try {
                const { sendNotificationEmail, sendConfirmationEmail } = require('./config/email');
                console.log('📧 Attempting to send notification email...');
                await sendNotificationEmail(submissionData);
                console.log('📧 Notification email sent successfully');
                
                console.log('📧 Attempting to send confirmation email...');
                await sendConfirmationEmail(submissionData.email, submissionData.full_name);
                console.log('📧 Confirmation email sent successfully');
            } catch (emailError) {
                console.error('📧 Email error details:', emailError);
                console.error('📧 Email error message:', emailError.message);
                console.error('📧 Email error stack:', emailError.stack);
            }

            // Success response with service-specific message
            const serviceNames = {
                'cv-to-website': 'تحويل السيرة إلى موقع',
                'full-package': 'الباقة الكاملة',
                'cv-only': 'إنشاء السيرة الذاتية'
            };

            res.json({
                success: true,
                message: `تم إرسال طلب ${serviceNames[req.serviceType] || req.serviceType} بنجاح! سنتواصل معك قريباً.`,
                submissionId: result.id,
                service_type: req.serviceType,
                price: req.serviceConfig?.price || 'غير محدد'
            });

        } catch (error) {
            console.error('❌ Error processing submission:', error);
            res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Admin endpoints
app.get('/api/submissions', async (req, res) => {
    try {
        console.log('📊 Admin panel requesting submissions...');
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const submissions = await CVSubmission.getAll(limit, offset);
        console.log(`✅ Retrieved ${submissions.length} submissions from database`);

        res.json({
            success: true,
            data: submissions,
            total: submissions.length
        });
    } catch (error) {
        console.error('❌ Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب البيانات'
        });
    }
});

// Reset database endpoint (admin only)
app.post('/api/reset-database', async (req, res) => {
    try {
        console.log('🗑️ Admin requesting database reset...');
        
        // Delete all submissions
        const { pool } = require('./config/database');
        const result = await pool.query('DELETE FROM cv_submissions');
        console.log(`✅ Deleted ${result.rowCount} submissions from database`);
        
        // Clean up uploaded files
        const fs = require('fs');
        const uploadsPath = path.join(__dirname, 'public', 'uploads');
        
        let deletedFiles = 0;
        let deletedFolders = 0;
        
        try {
            console.log('🧹 Cleaning up uploads folder...');
            
            // Read uploads directory
            const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
            
            for (const item of items) {
                // Skip .gitkeep file to preserve folder structure
                if (item.name === '.gitkeep') {
                    console.log('📁 Preserving .gitkeep file');
                    continue;
                }
                
                const itemPath = path.join(uploadsPath, item.name);
                
                if (item.isDirectory()) {
                    // Remove user directories and their contents
                    console.log(`🗂️ Removing folder: ${item.name}`);
                    const folderContents = fs.readdirSync(itemPath);
                    deletedFiles += folderContents.length;
                    fs.rmSync(itemPath, { recursive: true, force: true });
                    deletedFolders++;
                } else {
                    // Remove individual files (except .gitkeep)
                    console.log(`📄 Removing file: ${item.name}`);
                    fs.unlinkSync(itemPath);
                    deletedFiles++;
                }
            }
            
            console.log(`✅ Cleanup completed: ${deletedFiles} files and ${deletedFolders} folders removed`);
            
        } catch (uploadError) {
            console.error('⚠️ Error cleaning uploads folder:', uploadError);
            // Continue even if file cleanup fails
        }
        
        res.json({
            success: true,
            message: `تم حذف ${result.rowCount} طلب و ${deletedFiles} ملف بنجاح`,
            deletedCount: result.rowCount,
            deletedFiles: deletedFiles,
            deletedFolders: deletedFolders
        });
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إعادة تعيين قاعدة البيانات'
        });
    }
});

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Global error handler:', error);
    
    // Handle file upload errors specifically
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'حجم البيانات المرسلة كبير جداً. يرجى تقليل حجم الملفات.'
        });
    }
    
    // Handle other errors
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'خطأ داخلي في الخادم',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'الصفحة غير موجودة'
    });
});

// Start server
const startServer = async () => {
    try {
        // Try to create database tables
        try {
            await createTables();
            console.log('✅ Database tables created/verified');
        } catch (dbError) {
            console.error('⚠️  Database initialization failed:', dbError.message);
            console.log('🔄 Server will continue without database functionality');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Flexible CV Service Server running on port ${PORT}`);
            console.log(`📊 Available services:`, Object.keys(serviceConfigs));
            console.log(`🌐 Access the application at: http://localhost:${PORT}`);
            console.log(`⚙️  Admin panel at: http://localhost:${PORT}/admin`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
