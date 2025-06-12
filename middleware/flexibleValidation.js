const { serviceConfigs } = require('../config/services');

// Dynamic validation based on service type
const validateByService = (req, res, next) => {
    const { service_type } = req.body;
    const errors = [];

    // Check if service type is valid
    if (!service_type || !serviceConfigs[service_type]) {
        return res.status(400).json({
            success: false,
            message: 'نوع الخدمة غير صحيح',
            errors: ['نوع الخدمة مطلوب وصحيح']
        });
    }

    const config = serviceConfigs[service_type];
    
    // Validate required fields dynamically
    config.requiredFields.forEach(field => {
        if (!req.body[field] || req.body[field].trim().length === 0) {
            const fieldNames = {
                'full_name': 'الاسم الكامل',
                'profession': 'التخصص أو الوظيفة',
                'email': 'البريد الإلكتروني',
                'phone': 'رقم الجوال'
            };
            errors.push(`${fieldNames[field] || field} مطلوب`);
        }
    });

    // Email format validation
    if (req.body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }
    }

    // Phone validation (if required by service)
    if (config.validationRules?.phone?.required || req.body.phone) {
        const { phone } = req.body;
        if (phone && phone.trim().length > 0) {
            const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                errors.push('رقم الجوال غير صحيح. يجب أن يكون رقم سعودي صحيح');
            }
        } else if (config.validationRules?.phone?.required) {
            errors.push('رقم الجوال مطلوب');
        }
    }

    // File validation
    config.requiredFiles.forEach(fileField => {
        if (!req.files || !req.files[fileField] || req.files[fileField].length === 0) {
            const fileNames = {
                'cv_file': 'ملف السيرة الذاتية',
                'profile_image': 'الصورة الشخصية'
            };
            errors.push(`${fileNames[fileField] || fileField} مطلوب`);
        }
    });

    // Custom validation rules
    if (config.validationRules) {
        Object.keys(config.validationRules).forEach(field => {
            const rule = config.validationRules[field];
            const value = req.body[field];

            if (rule.maxLength && value && value.length > rule.maxLength) {
                errors.push(`${field} طويل جداً (الحد الأقصى ${rule.maxLength} حرف)`);
            }
        });
    }

    // Common validations
    const { full_name } = req.body;
    if (full_name && !/^[\u0600-\u06FFa-zA-Z\s]+$/.test(full_name)) {
        errors.push('الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'يوجد أخطاء في البيانات المرسلة',
            errors: errors
        });
    }

    // Add service config to request for later use
    req.serviceConfig = config;
    next();
};

// Dynamic input sanitization
const sanitizeByService = (req, res, next) => {
    const { service_type } = req.body;
    
    if (!serviceConfigs[service_type]) {
        return next();
    }

    // Sanitize all text fields
    const textFields = ['full_name', 'profession', 'bio', 'education', 'experience', 'skills', 'languages', 'portfolio_links', 'testimonials', 'email', 'phone', 'social_media', 'special_requests'];
    
    textFields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = req.body[field].trim();
        }
    });

    // Handle arrays
    if (req.body.website_goals && typeof req.body.website_goals === 'string') {
        req.body.website_goals = [req.body.website_goals];
    }

    if (req.body.cv_purpose && typeof req.body.cv_purpose === 'string') {
        req.body.cv_purpose = [req.body.cv_purpose];
    }

    next();
};

module.exports = {
    validateByService,
    sanitizeByService
};
