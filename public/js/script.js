// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceID: 'service_sh1mrgx',
    templateID: 'template_4s4z3jj',  // ⚠️ Verify this template ID is correct in your EmailJS dashboard
    publicKey: 'tZEOrhhlhX5r1mLK8'
};

// Initialize EmailJS when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for EmailJS to load
    setTimeout(function() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.publicKey);
            console.log('📧 EmailJS v4 initialized successfully');
        } else {
            console.error('❌ EmailJS library not loaded');
        }
    }, 100);
});

// DOM Elements - Handle different form IDs
const form = document.getElementById('cvForm') || 
             document.getElementById('uploadCvForm') || 
             document.getElementById('cvOnlyForm');
const submitBtn = document.getElementById('submitBtn');
const messageContainer = document.getElementById('messageContainer');
const message = document.getElementById('message');

// File upload elements - Handle different forms
const profileImageInput = document.getElementById('profile_image');
const portfolioFilesInput = document.getElementById('portfolio_files');
const testimonialFilesInput = document.getElementById('testimonial_files');
const cvFileInput = document.getElementById('cv_file');              // For upload-cv form
const additionalFilesInput = document.getElementById('additional_files'); // For additional files

// Other goal checkbox
const otherGoalCheckbox = document.getElementById('other_goal_checkbox');
const otherGoalInput = document.getElementById('other_goal_input');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script loaded and DOM ready');
    console.log('📄 Detected form type:', getFormType());
    console.log('🔧 Initializing form functionality...');
    
    initializeForm();
    setupFileUploads();
    setupOtherGoalToggle();
    setupFormValidation();
    
    console.log('✅ Form initialization complete');
});

// Get current form type for better logging
function getFormType() {
    if (document.getElementById('cvForm')) return 'Full Package Form (create-from-scratch)';
    if (document.getElementById('uploadCvForm')) return 'CV-to-Website Form (upload-cv)';
    if (document.getElementById('cvOnlyForm')) return 'CV-Only Form (create-cv-only)';
    return 'Unknown Form Type';
}

// Initialize form functionality
function initializeForm() {
    console.log('🔍 Looking for form elements...');
    
    // Add form submit event listener
    if (form) {
        console.log('✅ Form found:', form.id);
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('❌ Form element not found! Expected one of: cvForm, uploadCvForm, cvOnlyForm');
        return;
    }
    
    // Add real-time validation
    const inputs = form?.querySelectorAll('input[required], textarea[required]');
    if (inputs) {
        console.log(`📝 Setting up validation for ${inputs.length} required fields`);
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Setup file upload functionality
function setupFileUploads() {
    console.log('📁 Setting up file upload handlers...');
    
    const fileInputs = [
        { input: profileImageInput, previewId: 'profile_preview', multiple: false, name: 'Profile Image' },
        { input: portfolioFilesInput, previewId: 'portfolio_preview', multiple: true, name: 'Portfolio Files' },
        { input: testimonialFilesInput, previewId: 'testimonial_preview', multiple: true, name: 'Testimonial Files' },
        { input: cvFileInput, previewId: 'cv_preview', multiple: false, name: 'CV File' },
        { input: additionalFilesInput, previewId: 'additional_preview', multiple: true, name: 'Additional Files' }
    ];
    
    let setupCount = 0;
    fileInputs.forEach(({ input, previewId, multiple, name }) => {
        if (setupFileUpload(input, previewId, multiple, name)) {
            setupCount++;
        }
    });
    
    console.log(`✅ File upload setup complete: ${setupCount}/${fileInputs.length} handlers active`);
}

// Setup individual file upload
function setupFileUpload(input, previewId, multiple, inputName = 'Unknown') {
    // Check if input element exists
    if (!input) {
        console.log(`ℹ️  ${inputName} input not found (${previewId}) - skipping setup (normal for this form type)`);
        return false;
    }    console.log(`✅ ${inputName} upload handler configured (multiple: ${multiple})`);
    
    const previewContainer = document.getElementById(previewId);
    const uploadArea = input.parentNode.querySelector('.file-upload-area');
    
    // Check if required elements exist
    if (!previewContainer || !uploadArea) {
        console.log(`⚠️  Preview container or upload area not found for: ${inputName} (${previewId})`);
        return false;
    }
    
    // File input change event
    input.addEventListener('change', function() {
        console.log(`📤 ${inputName} files selected:`, this.files.length);
        handleFileSelect(this.files, previewContainer, multiple, inputName);
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#3498db';
        this.style.background = '#f0f8ff';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '#fafafa';
    });
      uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.background = '#fafafa';
        
        const files = e.dataTransfer.files;
        console.log(`🎯 ${inputName} files dropped:`, files.length);
        handleFileSelect(files, previewContainer, multiple, inputName);
        
        // Update the input
        input.files = files;
    });
    
    return true;
}

// Handle file selection with real-time validation
function handleFileSelect(files, previewContainer, multiple, inputName = 'Unknown') {
    console.log(`🔍 Processing ${files.length} files for ${inputName}...`);
    previewContainer.innerHTML = '';
    
    if (!multiple && files.length > 1) {
        console.warn(`⚠️  ${inputName} accepts only one file, but ${files.length} were selected`);
        showMessage('يمكنك رفع ملف واحد فقط لهذا القسم', 'error');
        return;
    }
    
    // Determine config key based on input name
    let configKey = 'cover_photo'; // default
    if (inputName.includes('CV') || inputName.includes('cv')) {
        configKey = 'cv_file';
    } else if (inputName.includes('Additional') || inputName.includes('additional')) {
        configKey = 'raw_cv';
    }
    
    let validFiles = 0;
    
    Array.from(files).forEach((file, index) => {
        console.log(`📁 File ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Validate file immediately
        const isValid = validateSingleFile(file, configKey);
        
        if (isValid) {
            validFiles++;
            createFilePreview(file, previewContainer, inputName, true);
            console.log(`✅ File validated: ${file.name}`);
        } else {
            createFilePreview(file, previewContainer, inputName, false);
            console.log(`❌ File rejected: ${file.name}`);
        }
    });
    
    if (validFiles > 0) {
        console.log(`✅ ${validFiles} valid files processed for ${inputName}`);
    } else {
        console.log(`❌ No valid files for ${inputName}`);    }
    Array.from(files).forEach((file, index) => {
        console.log(`📄 Validating file ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        if (validateFile(file, inputName)) {
            createFilePreview(file, previewContainer);
            validFiles++;
        }
    });
    
    console.log(`✅ ${inputName}: ${validFiles}/${files.length} files validated and previewed`);
}

// Validate file with specific config
function validateFile(file, inputName = null) {
    // Determine the file type based on input name or default
    let config = null;
    
    if (inputName) {
        if (inputName.includes('profile') || inputName.includes('cover')) {
            config = fileConfig.profile_image;
        } else if (inputName.includes('cv_file')) {
            config = fileConfig.cv_file;
        } else if (inputName.includes('additional')) {
            config = fileConfig.additional_files;
        }
    }
    
    // Use default config if no specific config found
    if (!config) {
        config = {
            maxSize: 5 * 1024 * 1024, // 5MB default
            allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            displayTypes: 'صور, PDF, Word',
            displayMaxSize: '5 ميجابايت'
        };
    }
    
    // Check file size
    if (file.size > config.maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        showMessage(`❌ الملف "${file.name}" كبير جداً (${sizeMB}MB). الحد الأقصى ${config.displayMaxSize}`, 'error');
        return false;
    }
    
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
        showMessage(`❌ نوع الملف "${file.name}" غير مدعوم. الأنواع المدعومة: ${config.displayTypes}`, 'error');
        return false;
    }
    
    return true;
}

// Create file preview
function createFilePreview(file, container, inputName = 'Unknown', isValid = true) {
    const fileItem = document.createElement('div');
    fileItem.className = isValid ? 'file-item file-valid' : 'file-item file-invalid';
    
    const statusIcon = document.createElement('span');
    statusIcon.className = 'file-status';
    statusIcon.textContent = isValid ? '✅' : '❌';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileIcon = document.createElement('span');
    fileIcon.className = 'file-icon';
    fileIcon.textContent = getFileIcon(file.type);
    
    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = file.name;
    
    const fileSize = document.createElement('span');
    fileSize.className = 'file-size';
    fileSize.textContent = formatFileSize(file.size);
    
    const fileStatus = document.createElement('div');
    fileStatus.className = 'file-validation-status';
    fileStatus.textContent = isValid ? 
        '✅ الملف صالح للرفع' : 
        '❌ الملف لا يلبي المتطلبات';
    fileStatus.style.color = isValid ? '#10b981' : '#ef4444';
    fileStatus.style.fontSize = '0.85rem';
    fileStatus.style.marginTop = '4px';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.textContent = '×';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', function() {
        fileItem.remove();
        // Clear any related errors
        if (!isValid) {
            const inputElement = document.querySelector(`input[type="file"]`);
            if (inputElement) {
                clearFieldError(inputElement.id);
            }
        }
    });
    
    fileInfo.appendChild(statusIcon);
    fileInfo.appendChild(fileIcon);
    fileInfo.appendChild(fileName);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileSize);
    fileItem.appendChild(fileStatus);
    fileItem.appendChild(removeBtn);
    
    container.appendChild(fileItem);
}

// Get file icon based on type
function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    return '📁';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Setup other goal toggle
function setupOtherGoalToggle() {
    console.log('🎯 Setting up website goals functionality...');
    
    // Check if elements exist (only on forms that have website goals)
    if (!otherGoalCheckbox || !otherGoalInput) {
        console.log('ℹ️  Website goal elements not found - skipping setup (normal for CV-only forms)');
        return;
    }
    
    console.log('✅ Website goals "Other" toggle configured');
    
    otherGoalCheckbox.addEventListener('change', function() {
        console.log('🔄 Website goal "Other" toggled:', this.checked);
        if (this.checked) {
            otherGoalInput.style.display = 'block';
            otherGoalInput.querySelector('input').focus();
            console.log('📝 Custom website goal input activated');
        } else {
            otherGoalInput.style.display = 'none';
            otherGoalInput.querySelector('input').value = '';
            console.log('❌ Custom website goal input hidden');
        }
    });
}

// Setup form validation
function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', validatePhone);
    }
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'هذا الحقل مطلوب');
        return false;
    }
    
    clearFieldError({ target: field });
    return true;
}

// Validate email
function validateEmail(e) {
    const email = e.target.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(e.target, 'البريد الإلكتروني غير صحيح');
        return false;
    }
    
    clearFieldError({ target: e.target });
    return true;
}

// Validate phone
function validatePhone(e) {
    const phone = e.target.value.trim();
    const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    
    if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
        showFieldError(e.target, 'رقم الجوال غير صحيح');
        return false;
    }
    
    clearFieldError({ target: e.target });
    return true;
}

// Show field error
function showFieldError(field, errorMessage) {
    const formGroup = field.closest('.form-group');
    
    if (!formGroup) {
        console.warn('Form group not found for field:', field);
        return;
    }
    
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.add('error');
    formGroup.classList.remove('success');
    
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
}

// Clear field error
function clearFieldError(e) {
    let field;
    if (e && e.target) {
        field = e.target;
    } else if (e && e.nodeType) {
        // Direct element passed
        field = e;
    } else {
        return;
    }
    
    if (!field) return;
    const formGroup = field.closest('.form-group');
    
    if (!formGroup) {
        console.warn('Form group not found for field:', field);
        return;
    }
    
    const errorElement = formGroup.querySelector('.error-message');
    
    formGroup.classList.remove('error');
    
    if (field.value.trim()) {
        formGroup.classList.add('success');
    } else {
        formGroup.classList.remove('success');
    }
    
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('📤 Form submission initiated');
      // Validate form using new user-friendly system
    console.log('🔍 Validating form data...');
    if (!validateFormNew()) {
        console.warn('❌ Form validation failed');
        return;
    }
    console.log('✅ Form validation passed');
    
    // Show loading state
    setSubmitButtonLoading(true);
    console.log('⏳ Submit button set to loading state');
    
    try {
        console.log('📋 Preparing form data...');
        const formData = new FormData(form);
        
        // Log basic form info
        const serviceType = formData.get('service_type') || 'Not specified';
        const fullName = formData.get('full_name') || 'Anonymous';
        console.log(`👤 Submitting ${serviceType} for: ${fullName}`);
        
        // Handle website goals
        console.log('🎯 Processing website goals...');
        const websiteGoals = [];
        const goalCheckboxes = form.querySelectorAll('input[name="website_goals"]:checked');
        goalCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'أخرى') {
                const otherGoalText = form.querySelector('input[name="other_goal_text"]')?.value.trim();
                if (otherGoalText) {
                    websiteGoals.push(`أخرى: ${otherGoalText}`);
                }
            } else {
                websiteGoals.push(checkbox.value);
            }
        });
        
        console.log(`🎯 Website goals processed: ${websiteGoals.length} goals selected`);
        
        // Update form data with processed goals
        formData.delete('website_goals');
        formData.delete('other_goal_text');
        websiteGoals.forEach(goal => {
            formData.append('website_goals', goal);
        });
          // Handle file information (don't send actual files - only file info)
        console.log('📁 Processing file information...');
        const fileFields = ['profile_image', 'cv_file', 'portfolio_files', 'testimonial_files', 'additional_files'];
        let totalFiles = 0;
        let fileInfoText = '';
        
        fileFields.forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
            if (input && input.files && input.files.length > 0) {
                const files = Array.from(input.files);
                totalFiles += files.length;
                console.log(`📁 ${fieldName}: ${files.length} file(s)`);
                
                // Create file info text
                const fileNames = files.map(file => `${file.name} (${(file.size / 1024).toFixed(1)}KB)`).join(', ');
                fileInfoText += `${fieldName}: ${fileNames}\n`;
                
                // Remove file inputs from form data and replace with file info
                formData.delete(fieldName);
                formData.append(`${fieldName}_info`, fileNames);
            }
        });
        
        console.log(`📎 Total files: ${totalFiles}`);
        if (fileInfoText.trim()) {
            formData.append('files_summary', fileInfoText.trim());
            console.log('📋 File info summary created');
        }

        console.log(`📎 Total files being uploaded: ${totalFiles}`);        // Submit form using EmailJS sendForm (better for forms with files)
        console.log('📧 Sending form via EmailJS sendForm...');
        console.log('🔧 EmailJS Config:', {
            serviceID: EMAILJS_CONFIG.serviceID,
            templateID: EMAILJS_CONFIG.templateID,
            publicKey: EMAILJS_CONFIG.publicKey ? 'Set' : 'Missing'
        });          // Convert FormData to plain object for EmailJS.send (no file data)
        const emailData = {};
        for (let [key, value] of formData.entries()) {
            if (emailData[key]) {
                // Handle multiple values (like website_goals)
                if (Array.isArray(emailData[key])) {
                    emailData[key].push(value);
                } else {
                    emailData[key] = [emailData[key], value];
                }
            } else {
                emailData[key] = value;
            }
        }
        
        // Use emailjs.send for processed data without files
        const emailResult = await emailjs.send(
            EMAILJS_CONFIG.serviceID,
            EMAILJS_CONFIG.templateID,
            emailData,
            EMAILJS_CONFIG.publicKey
        );
        
        console.log('📧 EmailJS sendForm response:', emailResult);
        
        // Check if email was sent successfully
        if (emailResult.status === 200) {
            console.log('🎉 Email sent successfully!');
            console.log(`📋 Service: ${serviceType}`);
            console.log(`💰 Price: ${getServicePrice(serviceType)} SAR`);
            console.log(`🆔 Submission ID: CV${Date.now()}`);
            
            // Redirect to success page
            console.log('� Redirecting to success page...');
            window.location.href = './success.html';
            
        } else {
            throw new Error('EmailJS failed with status: ' + emailResult.status);
        }        } catch (error) {
        console.error('💥 Network/Submit error:', error);
        
        // Get error message safely
        const errorMessage = error?.message || error?.toString() || 'Unknown error';
        console.error('📋 Error message:', errorMessage);
        
        // Handle specific HTTP status codes
        if (errorMessage.includes('413') || errorMessage.includes('Request Entity Too Large')) {
            showMessage('حجم الملفات كبير جداً. يرجى تقليل حجم الملفات إلى أقل من 1.5 ميجابايت لكل ملف.', 'error');
        } else if (errorMessage.includes('Request failed') || errorMessage.includes('Failed to fetch')) {
            showMessage('فشل في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.', 'error');
        } else if (errorMessage.includes('400') || errorMessage.includes('Template ID')) {
            showMessage('خطأ في إعدادات النظام. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.', 'error');
        } else {
            showMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
        }
    } finally {
        setSubmitButtonLoading(false);
        console.log('🔓 Submit button loading state cleared');
    }
}

// Get service price based on service type
function getServicePrice(serviceType) {
    const prices = {
        'cv-to-website': 75,    // تحويل السيرة الذاتية إلى موقع
        'full-package': 100,    // الباقة الكاملة 
        'cv-only': 25          // إنشاء سيرة ذاتية فقط
    };
    return prices[serviceType] || 100;
}

// Get service type display name in Arabic
function getServiceTypeDisplay(serviceType) {
    const serviceNames = {
        'cv-to-website': 'تحويل السيرة الذاتية إلى موقع ويب',
        'full-package': 'إنشاء سيرة ذاتية + موقع ويب (الباقة الكاملة)',
        'cv-only': 'إنشاء سيرة ذاتية فقط'
    };
    return serviceNames[serviceType] || serviceType;
}

// NEW USER-FRIENDLY VALIDATION SYSTEM
// ====================================

// Clear, helpful error messages in Arabic
const validationMessages = {
    required: '⚠️ هذا الحقل مطلوب',
    email: '📧 يرجى إدخال بريد إلكتروني صحيح',
    phone: '📱 يرجى إدخال رقم واتساب صحيح (مثال: +966501234567)',
    fileTooBig: '📁 حجم الملف كبير جداً. الحد الأقصى: {maxSize}',
    fileWrongType: '🚫 نوع الملف غير مدعوم. الأنواع المسموحة: {allowedTypes}',
    success: '✅ تم بنجاح!'
};

// File size limits and allowed types
const fileConfig = {
    profile_image: {
        maxSize: 2 * 1024 * 1024, // 2MB for cover photos
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        displayTypes: 'JPEG, PNG, WebP',
        displayMaxSize: '2 ميجابايت'
    },
    cv_file: {
        maxSize: 4 * 1024 * 1024, // 4MB for CV files
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        displayTypes: 'PDF, Word, صور',
        displayMaxSize: '4 ميجابايت'
    },
    additional_files: {
        maxSize: 4 * 1024 * 1024, // 4MB for raw CV/documents
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        displayTypes: 'PDF, Word, صور, نص',
        displayMaxSize: '4 ميجابايت'
    }
};

// Show user-friendly error message
function showFieldError(fieldName, messageKey, params = {}) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + '_error');
    
    if (!field || !errorElement) return;
    
    // Get message template
    let message = validationMessages[messageKey] || messageKey;
    
    // Replace parameters in message
    Object.keys(params).forEach(key => {
        message = message.replace(`{${key}}`, params[key]);
    });
    
    // Show error
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    field.classList.add('error');
    
    // Hide error after user starts typing
    field.addEventListener('input', () => clearFieldError(fieldName), { once: true });
}

// Clear error message
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + '_error');
    
    if (field) field.classList.remove('error');
    if (errorElement) {
        errorElement.style.display = 'none';
        errorElement.textContent = '';
    }
}

// Show success message for field
function showFieldSuccess(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + '_error');
    
    if (!field || !errorElement) return;
    
    errorElement.textContent = validationMessages.success;
    errorElement.style.display = 'block';
    errorElement.style.color = '#10b981'; // Green color
    field.classList.remove('error');
    field.classList.add('success');
}

// NEW COMPREHENSIVE FORM VALIDATION
// ==================================

// Validate required fields based on form type
function validateRequiredFields() {
    const formType = getFormType();
    let isValid = true;
    
    // Required fields for all forms
    const commonRequired = ['full_name', 'profession', 'email', 'phone'];
    
    commonRequired.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            showFieldError(fieldName, 'required');
            isValid = false;
        } else if (field && field.value.trim()) {
            // Validate specific field types
            if (fieldName === 'email' && !validateEmailFormat(field.value)) {
                showFieldError(fieldName, 'email');
                isValid = false;
            } else if (fieldName === 'phone' && !validatePhoneFormat(field.value)) {
                showFieldError(fieldName, 'phone');
                isValid = false;
            } else {
                showFieldSuccess(fieldName);
            }
        }
    });
    
    return isValid;
}

// Validate email format
function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// Validate phone format
function validatePhoneFormat(phone) {
    const phoneRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Validate file uploads
function validateFileUploads() {
    const formType = getFormType();
    let isValid = true;
    
    // Check cover photo if uploaded
    const coverPhoto = document.getElementById('profile_image');
    if (coverPhoto && coverPhoto.files.length > 0) {
        if (!validateSingleFile(coverPhoto.files[0], 'cover_photo')) {
            isValid = false;
        }
    }
    
    // Check CV file for CV-to-Website and CV-Only forms
    if (formType.includes('CV-to-Website') || formType.includes('CV-Only')) {
        const cvInput = document.getElementById('cv_file') || document.getElementById('additional_files');
        if (cvInput && cvInput.files.length > 0) {
            const configKey = formType.includes('CV-Only') ? 'raw_cv' : 'cv_file';
            if (!validateSingleFile(cvInput.files[0], configKey)) {
                isValid = false;
            }
        }
    }
    
    return isValid;
}

// Validate a single file
function validateSingleFile(file, configKey) {
    const config = fileConfig[configKey];
    if (!config) return true;
    
    // Check file size
    if (file.size > config.maxSize) {
        const fieldName = configKey === 'cover_photo' ? 'profile_image' : 
                         configKey === 'cv_file' ? 'cv_file' : 'additional_files';
        showFieldError(fieldName, 'fileTooBig', {
            maxSize: config.displayMaxSize
        });
        return false;
    }
    
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
        const fieldName = configKey === 'cover_photo' ? 'profile_image' : 
                         configKey === 'cv_file' ? 'cv_file' : 'additional_files';
        showFieldError(fieldName, 'fileWrongType', {
            allowedTypes: config.displayTypes
        });
        return false;
    }
    
    return true;
}

// Main validation function
function validateFormNew() {
    console.log('🔍 Starting new user-friendly validation...');
    
    let isValid = true;
    
    // Clear all previous errors
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    
    // Remove error classes
    const fields = document.querySelectorAll('.error, .success');
    fields.forEach(field => {
        field.classList.remove('error', 'success');
    });
    
    // Validate required fields
    if (!validateRequiredFields()) {
        isValid = false;
    }
    
    // Validate file uploads
    if (!validateFileUploads()) {
        isValid = false;
    }
    
    if (isValid) {
        console.log('✅ All validation passed!');
        showMessage('✅ جميع البيانات صحيحة! جاري الإرسال...', 'success');
    } else {
        console.log('❌ Validation failed - showing user-friendly errors');
        showMessage('⚠️ يرجى تصحيح الأخطاء المظللة باللون الأحمر', 'error');
        
        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    return isValid;
}

// Set submit button loading state
function setSubmitButtonLoading(loading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Show message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
    messageContainer.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
    
    // Scroll to top to ensure message is visible
    scrollToTop();
}

// Clear all file previews
function clearAllPreviews() {
    console.log('🧹 Clearing all previews...');
    
    // List of possible preview elements
    const previewElements = [
        'profile_preview',
        'portfolio_preview', 
        'testimonial_preview',
        'cv_preview'
    ];
    
    // Clear each preview element if it exists
    previewElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`🗑️ Clearing ${elementId}`);
            element.innerHTML = '';
        }
    });
    
    // Hide other goal input if it exists
    const otherGoalInput = document.getElementById('other_goal_input');
    if (otherGoalInput) {
        console.log('🔍 Hiding other goal input');
        otherGoalInput.style.display = 'none';
    }
    
    // Clear all form group states
    if (form) {
        const formGroups = form.querySelectorAll('.form-group');
        console.log(`🎨 Clearing ${formGroups.length} form group states`);
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
    
    console.log('✅ All previews cleared successfully');
    
    // Clear all error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.textContent = '';
    });
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Character counter for textareas
document.querySelectorAll('textarea').forEach(textarea => {
    const maxLength = parseInt(textarea.getAttribute('maxlength'));
    if (maxLength) {
        const counter = document.createElement('small');
        counter.className = 'char-counter';
        counter.style.display = 'block';
        counter.style.textAlign = 'left';
        counter.style.marginTop = '5px';
        counter.style.color = '#666';
        
        textarea.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} حرف متبقي`;
            
            if (remaining < 50) {
                counter.style.color = '#e74c3c';
            } else {
                counter.style.color = '#666';
            }
        }
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
});
