// Service-based validation and processing system
const serviceConfigs = {    'cv-to-website': {
        name: 'CV to Website',
        price: 75,
        timeline: '3-5 days',
        requiredFields: ['full_name', 'profession', 'email', 'phone'],
        fileFields: ['cv_file', 'profile_image', 'portfolio_files', 'additional_files'],
        requiredFiles: ['cv_file'],
        validationRules: {
            profession: { required: true },
            phone: { required: true },
            cv_file: { required: true, types: ['.pdf', '.doc', '.docx'] }
        }
    },
    'full-package': {
        name: 'Full Package',
        price: 100,
        timeline: '3-5 days',
        requiredFields: ['full_name', 'profession', 'email'],
        fileFields: ['profile_image', 'portfolio_files', 'testimonial_files'],
        requiredFiles: [],
        validationRules: {
            profession: { required: true },
            bio: { maxLength: 1000 }
        }
    },
    'cv-only': {
        name: 'CV Only',
        price: 25,
        timeline: '3 days',
        requiredFields: ['full_name', 'profession', 'email'],
        fileFields: ['profile_image', 'portfolio_files'],
        requiredFiles: [],
        validationRules: {
            profession: { required: true }
        }
    }
};

module.exports = { serviceConfigs };
