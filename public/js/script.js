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

// Handle file selection
function handleFileSelect(files, previewContainer, multiple, inputName = 'Unknown') {
    console.log(`🔍 Processing ${files.length} files for ${inputName}...`);
    previewContainer.innerHTML = '';
    
    if (!multiple && files.length > 1) {
        console.warn(`⚠️  ${inputName} accepts only one file, but ${files.length} were selected`);
        showMessage('يمكنك رفع ملف واحد فقط لهذا القسم', 'error');
        return;
    }
    
    let validFiles = 0;
    Array.from(files).forEach((file, index) => {
        console.log(`📄 Validating file ${index + 1}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        if (validateFile(file)) {
            createFilePreview(file, previewContainer);
            validFiles++;
        }
    });
    
    console.log(`✅ ${inputName}: ${validFiles}/${files.length} files validated and previewed`);
}

// Validate file
function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
        showMessage(`الملف "${file.name}" كبير جداً. الحد الأقصى 5 ميجابايت`, 'error');
        return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
        showMessage(`نوع الملف "${file.name}" غير مدعوم`, 'error');
        return false;
    }
    
    return true;
}

// Create file preview
function createFilePreview(file, container) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
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
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file';
    removeBtn.textContent = '×';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', function() {
        fileItem.remove();
    });
    
    fileInfo.appendChild(fileIcon);
    fileInfo.appendChild(fileName);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileSize);
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
    const field = e.target;
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
    
    // Validate form
    console.log('🔍 Validating form data...');
    if (!validateForm()) {
        console.warn('❌ Form validation failed');
        showMessage('يرجى تصحيح الأخطاء قبل الإرسال', 'error');
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
        
        // Log file uploads
        const fileFields = ['profile_image', 'cv_file', 'portfolio_files', 'testimonial_files', 'additional_files'];
        let totalFiles = 0;
        fileFields.forEach(fieldName => {
            const files = formData.getAll(fieldName);
            if (files.length > 0 && files[0].name) {
                totalFiles += files.length;
                console.log(`📁 ${fieldName}: ${files.length} file(s)`);
            }
        });
        console.log(`📎 Total files being uploaded: ${totalFiles}`);
        
        // Submit form
        console.log('🌐 Sending request to server...');
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
          if (result.success) {
            console.log('🎉 Form submitted successfully!');
            console.log(`📋 Service: ${result.service_type}`);
            console.log(`💰 Price: ${result.price} SAR`);
            console.log(`🆔 Submission ID: ${result.submissionId}`);
            
            showMessage(result.message, 'success');
            
            // Reset form after successful submission
            console.log('🔄 Resetting form...');
            form.reset();
            clearAllPreviews();
            scrollToTop();
            console.log('✅ Form reset complete');
            
        } else {
            console.error('❌ Server responded with error:', response.status);
            console.error('Error details:', result);
            
            showMessage(result.message || 'حدث خطأ أثناء الإرسال', 'error');
            
            // Show field-specific errors if available
            if (result.errors) {
                console.error('📋 Validation errors:');
                result.errors.forEach((error, index) => {
                    console.error(`  ${index + 1}. ${error}`);
                });
            }
        }
    } catch (error) {
        console.error('💥 Network/Submit error:', error);
        showMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        setSubmitButtonLoading(false);
        console.log('🔓 Submit button loading state cleared');
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('input[required], textarea[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'هذا الحقل مطلوب');
            isValid = false;
        }
    });
    
    // Validate email
    const email = document.getElementById('email');
    if (!validateEmail({ target: email })) {
        isValid = false;
    }
    
    // Validate phone if provided
    const phone = document.getElementById('phone');
    if (phone.value.trim() && !validatePhone({ target: phone })) {
        isValid = false;
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
