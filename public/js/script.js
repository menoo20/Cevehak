// DOM Elements
const form = document.getElementById('cvForm');
const submitBtn = document.getElementById('submitBtn');
const messageContainer = document.getElementById('messageContainer');
const message = document.getElementById('message');

// File upload elements
const profileImageInput = document.getElementById('profile_image');
const portfolioFilesInput = document.getElementById('portfolio_files');
const testimonialFilesInput = document.getElementById('testimonial_files');

// Other goal checkbox
const otherGoalCheckbox = document.getElementById('other_goal_checkbox');
const otherGoalInput = document.getElementById('other_goal_input');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Script loaded and DOM ready');
    
    initializeForm();
    setupFileUploads();
    setupOtherGoalToggle();
    setupFormValidation();
});

// Initialize form functionality
function initializeForm() {
    // Add form submit event listener
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('❌ Form element not found!');
    }
    
    // Add real-time validation
    const inputs = form?.querySelectorAll('input[required], textarea[required]');
    if (inputs) {
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }
}

// Setup file upload functionality
function setupFileUploads() {
    setupFileUpload(profileImageInput, 'profile_preview', false);
    setupFileUpload(portfolioFilesInput, 'portfolio_preview', true);
    setupFileUpload(testimonialFilesInput, 'testimonial_preview', true);
}

// Setup individual file upload
function setupFileUpload(input, previewId, multiple) {
    const previewContainer = document.getElementById(previewId);
    const uploadArea = input.parentNode.querySelector('.file-upload-area');
    
    // File input change event
    input.addEventListener('change', function() {
        handleFileSelect(this.files, previewContainer, multiple);
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
        handleFileSelect(files, previewContainer, multiple);
        
        // Update the input
        input.files = files;
    });
}

// Handle file selection
function handleFileSelect(files, previewContainer, multiple) {
    previewContainer.innerHTML = '';
    
    if (!multiple && files.length > 1) {
        showMessage('يمكنك رفع ملف واحد فقط لهذا القسم', 'error');
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        if (validateFile(file)) {
            createFilePreview(file, previewContainer);
        }
    });
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
    otherGoalCheckbox.addEventListener('change', function() {
        if (this.checked) {
            otherGoalInput.style.display = 'block';
            otherGoalInput.querySelector('input').focus();
        } else {
            otherGoalInput.style.display = 'none';
            otherGoalInput.querySelector('input').value = '';
        }
    });
}

// Setup form validation
function setupFormValidation() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    emailInput.addEventListener('blur', validateEmail);
    phoneInput.addEventListener('blur', validatePhone);
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
    
    // Validate form
    if (!validateForm()) {
        showMessage('يرجى تصحيح الأخطاء قبل الإرسال', 'error');
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    try {
        const formData = new FormData(form);
        
        // Handle website goals
        const websiteGoals = [];
        const goalCheckboxes = form.querySelectorAll('input[name="website_goals"]:checked');
        goalCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'أخرى') {
                const otherGoalText = form.querySelector('input[name="other_goal_text"]').value.trim();
                if (otherGoalText) {
                    websiteGoals.push(`أخرى: ${otherGoalText}`);
                }
            } else {
                websiteGoals.push(checkbox.value);
            }
        });
        
        // Update form data with processed goals
        formData.delete('website_goals');
        formData.delete('other_goal_text');
        websiteGoals.forEach(goal => {
            formData.append('website_goals', goal);
        });
        
        // Submit form
        const response = await fetch('/submit', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(result.message, 'success');
            form.reset();
            clearAllPreviews();
            scrollToTop();
        } else {
            showMessage(result.message || 'حدث خطأ أثناء الإرسال', 'error');
            
            // Show field-specific errors if available
            if (result.errors) {
                result.errors.forEach(error => {
                    console.error('Validation error:', error);
                });
            }
        }
    } catch (error) {
        console.error('Submit error:', error);
        showMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
        setSubmitButtonLoading(false);
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
    document.getElementById('profile_preview').innerHTML = '';
    document.getElementById('portfolio_preview').innerHTML = '';
    document.getElementById('testimonial_preview').innerHTML = '';
    
    // Hide other goal input
    otherGoalInput.style.display = 'none';
    
    // Clear all form group states
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
    });
    
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
