const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { createTables } = require('./config/database');

// Simple inline routes instead of external file
const setupRoutes = (app) => {
    // Serve the main form page
    app.get('/', (req, res) => {
        res.sendFile('index.html', { root: './views' });
    });

    // Serve admin dashboard
    app.get('/admin', (req, res) => {
        res.sendFile('admin.html', { root: './views' });
    });

    // Test endpoint for debugging
    app.get('/test', (req, res) => {
        res.json({ message: 'Test endpoint working!', timestamp: new Date().toISOString() });
    });

    // Simple test form submission
    app.post('/test-submit', express.json(), express.urlencoded({ extended: true }), (req, res) => {
        console.log('🧪 Test form submission received:', req.body);
        res.json({ success: true, message: 'Test submission successful!', data: req.body });
    });

    // Serve uploaded files with proper headers
    app.get('/uploads/:filename', (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, 'public', 'uploads', filename);
        
        // Check if file exists
        if (!require('fs').existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.sendFile(filePath);
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
                environment: process.env.NODE_ENV || 'development'
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
    });    // Complete form submission endpoint with file uploads
    const CVSubmission = require('./models/CVSubmission');
    const { upload, handleUploadError } = require('./middleware/upload');
    const { validateSubmission, sanitizeInput } = require('./middleware/validation');
    
    app.post('/submit', 
        upload.fields([
            { name: 'profile_image', maxCount: 1 },
            { name: 'portfolio_files', maxCount: 5 },
            { name: 'testimonial_files', maxCount: 3 }
        ]),
        handleUploadError,
        sanitizeInput,
        validateSubmission,
        async (req, res) => {
            try {
                // Prepare submission data
                const submissionData = {
                    ...req.body,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent')
                };                // Handle uploaded files with user folder structure
                if (req.files) {
                    const userFolder = req.userIdentifier || 'default';
                    
                    if (req.files.profile_image) {
                        submissionData.profile_image = `${userFolder}/${req.files.profile_image[0].filename}`;
                    }
                    
                    if (req.files.portfolio_files) {
                        submissionData.portfolio_files = req.files.portfolio_files
                            .map(file => `${userFolder}/${file.filename}`).join(',');
                    }
                    
                    if (req.files.testimonial_files) {
                        submissionData.testimonial_files = req.files.testimonial_files
                            .map(file => `${userFolder}/${file.filename}`).join(',');
                    }
                }

                console.log('📝 Form submission received:', {
                    name: submissionData.full_name,
                    email: submissionData.email,
                    profession: submissionData.profession
                });

                // Save to database
                const result = await CVSubmission.create(submissionData);

                // Send emails (optional - won't fail if not configured)
                try {
                    const { sendNotificationEmail, sendConfirmationEmail } = require('./config/email');
                    await sendNotificationEmail(submissionData);
                    await sendConfirmationEmail(submissionData.email, submissionData.full_name);
                } catch (emailError) {
                    console.error('Email error (continuing anyway):', emailError.message);
                }

                res.json({
                    success: true,
                    message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
                    submissionId: result.id
                });

            } catch (error) {
                console.error('Error processing submission:', error);
                res.status(500).json({
                    success: false,
                    message: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.'
                });
            }
        }
    );

    // Admin endpoints
    app.get('/admin/submissions', async (req, res) => {
        try {
            const CVSubmission = require('./models/CVSubmission');
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const submissions = await CVSubmission.getAll(limit, offset);
            const total = await CVSubmission.getCount();

            res.json({
                success: true,
                data: submissions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Error getting submissions:', error);
            res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء جلب البيانات'
            });
        }
    });

    app.get('/submission/:id', async (req, res) => {
        try {
            const CVSubmission = require('./models/CVSubmission');
            const submission = await CVSubmission.findById(req.params.id);
            
            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'الطلب غير موجود'
                });
            }

            res.json({
                success: true,
                data: submission
            });

        } catch (error) {
            console.error('Error getting submission:', error);
            res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء جلب البيانات'
            });
        }
    });

    // Admin route to reset database (for development)
    app.post('/admin/reset-database', async (req, res) => {
        try {
            const fs = require('fs');
            const path = require('path');
            
            console.log('🧹 Admin reset requested...');
            
            // Clear cv_submissions table
            const { pool } = require('./config/database');
            await pool.query('DELETE FROM cv_submissions');
            await pool.query('ALTER SEQUENCE cv_submissions_id_seq RESTART WITH 1');
            
            // Clear uploaded files
            const uploadsDir = path.join(__dirname, 'public', 'uploads');
            
            if (fs.existsSync(uploadsDir)) {
                const files = fs.readdirSync(uploadsDir);
                
                for (const file of files) {
                    if (file !== '.gitkeep') {
                        const filePath = path.join(uploadsDir, file);
                        const stat = fs.statSync(filePath);
                        
                        if (stat.isDirectory()) {
                            // Remove directory and its contents
                            fs.rmSync(filePath, { recursive: true, force: true });
                            console.log(`🗂️ Removed folder: ${file}`);
                        } else {
                            // Remove file
                            fs.unlinkSync(filePath);
                            console.log(`📄 Removed file: ${file}`);
                        }
                    }
                }
            }
            
            console.log('✅ Database and files reset successfully!');
            
            res.json({
                success: true,
                message: 'تم إعادة تعيين قاعدة البيانات والملفات بنجاح',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error resetting database:', error);
            res.status(500).json({
                success: false,
                message: 'حدث خطأ أثناء إعادة تعيين قاعدة البيانات',
                error: error.message
            });
        }
    });
};

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'البيانات المرسلة كبيرة جداً'
        });
    }
    
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في الخادم'
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
        // Initialize database tables
        await createTables();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Frontend: http://localhost:${PORT}`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server terminated');
    process.exit(0);
});

startServer();
