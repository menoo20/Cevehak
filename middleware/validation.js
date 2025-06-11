const validateSubmission = (req, res, next) => {
    const { full_name, profession, email } = req.body;
    const errors = [];

    // Required field validation
    if (!full_name || full_name.trim().length === 0) {
        errors.push('الاسم الكامل مطلوب');
    }

    if (!profession || profession.trim().length === 0) {
        errors.push('التخصص أو الوظيفة مطلوب');
    }

    if (!email || email.trim().length === 0) {
        errors.push('البريد الإلكتروني مطلوب');
    } else {
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }
    }

    // Name validation (Arabic and English letters only)
    if (full_name && !/^[\u0600-\u06FFa-zA-Z\s]+$/.test(full_name)) {
        errors.push('الاسم يجب أن يحتوي على أحرف عربية أو إنجليزية فقط');
    }

    // Phone validation (optional but if provided should be valid)
    const { phone } = req.body;
    if (phone && phone.trim().length > 0) {
        const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            errors.push('رقم الجوال غير صحيح. يجب أن يكون رقم سعودي صحيح');
        }
    }

    // Bio length validation
    const { bio } = req.body;
    if (bio && bio.length > 1000) {
        errors.push('النبذة التعريفية طويلة جداً (الحد الأقصى 1000 حرف)');
    }

    // Skills validation
    const { skills } = req.body;
    if (skills && skills.length > 2000) {
        errors.push('قائمة المهارات طويلة جداً (الحد الأقصى 2000 حرف)');
    }

    // Website goals validation
    const { website_goals } = req.body;
    if (website_goals && Array.isArray(website_goals)) {
        const validGoals = ['تقديم على وظائف', 'تسويق خدماتك كفريلانسر', 'توثيق أعمالك', 'أخرى'];
        const invalidGoals = website_goals.filter(goal => !validGoals.includes(goal) && goal !== 'أخرى');
        if (invalidGoals.length > 0) {
            errors.push('بعض أهداف الموقع غير صحيحة');
        }
    }

    // Domain and email hosting preference validation
    const { domain_preference, email_hosting_preference } = req.body;
    const validPreferences = ['نعم', 'لا', 'غير متأكد', 'مو مهم الآن'];
    
    if (domain_preference && !validPreferences.includes(domain_preference)) {
        errors.push('تفضيل النطاق غير صحيح');
    }
    
    if (email_hosting_preference && !validPreferences.includes(email_hosting_preference)) {
        errors.push('تفضيل البريد الإلكتروني غير صحيح');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'يوجد أخطاء في البيانات المرسلة',
            errors: errors
        });
    }

    next();
};

const sanitizeInput = (req, res, next) => {
    // Sanitize string inputs
    const stringFields = ['full_name', 'profession', 'bio', 'education', 'experience', 'skills', 'languages', 'portfolio_links', 'testimonials', 'email', 'phone', 'social_media'];
    
    stringFields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = req.body[field].trim();
        }
    });

    // Convert website_goals to array if it's a string
    if (req.body.website_goals && typeof req.body.website_goals === 'string') {
        req.body.website_goals = [req.body.website_goals];
    }

    next();
};

module.exports = {
    validateSubmission,
    sanitizeInput
};
