const express = require('express');
const router = express.Router();
const CVSubmission = require('../models/CVSubmission');
const { sendNotificationEmail, sendConfirmationEmail } = require('../config/email');
const { upload, handleUploadError } = require('../middleware/upload');
const { validateSubmission, sanitizeInput } = require('../middleware/validation');

// Serve the main form page
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Serve admin dashboard
router.get('/admin', (req, res) => {
    res.sendFile('admin.html', { root: './views' });
});

// Handle form submission
router.post('/submit', 
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
            };

            // Handle uploaded files
            if (req.files) {
                if (req.files.profile_image) {
                    submissionData.profile_image = req.files.profile_image[0].filename;
                }
                
                if (req.files.portfolio_files) {
                    submissionData.portfolio_files = req.files.portfolio_files
                        .map(file => file.filename).join(',');
                }
                
                if (req.files.testimonial_files) {
                    submissionData.testimonial_files = req.files.testimonial_files
                        .map(file => file.filename).join(',');
                }
            }

            // Log submission for monitoring
            console.log('📝 Form submission received:', {
                name: submissionData.full_name,
                email: submissionData.email,
                profession: submissionData.profession
            });

            // Save to database
            const result = await CVSubmission.create(submissionData);

            // Send notification email (optional, won't fail if email is not configured)
            try {
                await sendNotificationEmail(submissionData);
            } catch (emailError) {
                console.error('Error sending notification email:', emailError);
            }

            // Send confirmation email to user (optional)
            try {
                await sendConfirmationEmail(submissionData.email, submissionData.full_name);
            } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
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

// Get submission by ID (for admin use)
router.get('/submission/:id', async (req, res) => {
    try {
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

// Get all submissions (for admin use)
router.get('/admin/submissions', async (req, res) => {
    try {
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

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        // Test database connection
        const { testConnection } = require('../config/database');
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
});

module.exports = router;
