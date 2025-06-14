// Landing page JavaScript for Cevehak

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cevehak landing page loaded');
    console.log('🎨 Initializing landing page features...');
    
    // Initialize service selection
    initServiceSelection();
    
    // Add smooth scrolling for anchor links
    addSmoothScrolling();
    
    // Add animation on scroll
    addScrollAnimations();
    
    // Initialize CV image fade loop
    initCVImageLoop();
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    console.log('✅ Landing page initialization complete');
});

// Service selection functions
function selectService(serviceType) {
    console.log('🎯 Service selected:', serviceType);
      // Define service routes (direct file paths for frontend-only)
    const serviceRoutes = {
        'cv-to-website': './upload-cv.html',        // Simple upload form (75 SAR)
        'full-package': './create-from-scratch.html', // Full detailed form (100 SAR)  
        'cv-only': './create-cv-only.html'          // CV-only form (25 SAR)
    };
    
    // Get the route for the selected service
    const route = serviceRoutes[serviceType];
    
    if (route) {
        console.log(`📍 Redirecting to: ${route}`);
        // Add visual feedback before redirect
        const clickedButton = event.target;
        clickedButton.style.transform = 'scale(0.95)';
        
        // Redirect to the appropriate form page
        setTimeout(() => {
            window.location.href = route;
        }, 100);
    } else {
        console.error('❌ Unknown service type:', serviceType);
        console.log('🔄 Fallback: redirecting to full package form');
        // Fallback to full package
        window.location.href = '/create-from-scratch';
    }
}

// Initialize service selection buttons
function initServiceSelection() {
    console.log('🔘 Setting up service selection buttons...');
    
    const serviceButtons = document.querySelectorAll('.service-btn');
    console.log(`📊 Found ${serviceButtons.length} service buttons`);
    
    serviceButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            console.log(`🖱️  Service button ${index + 1} clicked`);
            // The onclick attribute will handle the redirection
            // This adds visual feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
    
    // Also handle CTA button
    const ctaButton = document.querySelector('.cta-btn');
    if (ctaButton) {
        console.log('✅ CTA button found and configured');
        ctaButton.addEventListener('click', function(e) {
            console.log('🎯 CTA button clicked');
            ctaButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                ctaButton.style.transform = '';
            }, 150);
        });
    }
    
    console.log('✅ Service selection setup complete');
}

// Add smooth scrolling for internal links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe service cards and process steps
    const animatedElements = document.querySelectorAll('.service-card, .step');
    
    animatedElements.forEach((el, index) => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        observer.observe(el);
    });
}

// Add some interactive effects
function addInteractiveEffects() {
    // Service card hover effects
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = this.classList.contains('popular') ? 'scale(1.02)' : 'translateY(0) scale(1)';
        });
    });
}

// Initialize interactive effects when DOM is loaded
document.addEventListener('DOMContentLoaded', addInteractiveEffects);

// CV Image Fade Loop
function initCVImageLoop() {
    const cvImages = document.querySelectorAll('.cv-fade-image');
    
    if (cvImages.length === 0) {
        console.log('⚠️ No CV images found for fade loop');
        return;
    }
    
    console.log(`🖼️ Found ${cvImages.length} CV images for fade loop`);
    console.log('📋 Images loaded:');
    cvImages.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.src.split('/').pop()}`);
    });
    
    let currentIndex = 0;
    
    function fadeToNextImage() {
        // Remove active class from current image
        cvImages[currentIndex].classList.remove('active');
        
        // Move to next image (loop back to 0 if at end)
        currentIndex = (currentIndex + 1) % cvImages.length;
        
        // Add active class to new image
        cvImages[currentIndex].classList.add('active');
        
        const imageName = cvImages[currentIndex].src.split('/').pop();
        console.log(`🔄 Faded to image ${currentIndex + 1}/${cvImages.length}: ${imageName}`);
    }
    
    // Start the fade loop - with 9 images, 4 seconds each = 36 second full cycle
    setInterval(fadeToNextImage, 4000);
    
    console.log('✅ CV image fade loop initialized');
    console.log(`⏱️ 4 second intervals → Full cycle: ${cvImages.length * 4} seconds`);
    console.log(`🎨 All ${cvImages.length} images are the same size for smooth transitions`);
}

// CSS-Safe Performance Enhancement
function initPerformanceOptimizations() {
    console.log('⚡ Initializing CSS-safe performance optimizations...');
    
    // Smart image loading without affecting CSS layout
    initSmartImageLoading();
    
    // Preload next images in sequence for smooth transitions
    initImagePreloading();
    
    console.log('✅ Performance optimizations initialized');
}

function initSmartImageLoading() {
    // Check WebP support
    const supportsWebP = checkWebPSupport();
    
    // Get all CV images (non-invasive approach)
    const cvImages = document.querySelectorAll('.cv-image');
    
    cvImages.forEach((img, index) => {
        // For non-active images, delay loading slightly
        if (!img.classList.contains('active') && index > 1) {
            // Small delay to prioritize visible content
            setTimeout(() => {
                preloadOptimizedImage(img, supportsWebP);
            }, 1000 + (index * 500));
        }
    });
}

function initImagePreloading() {
    const cvImages = document.querySelectorAll('.cv-image');
    let currentIndex = 0;
    
    // Track which image is currently active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active') && target.classList.contains('cv-image')) {
                    currentIndex = Array.from(cvImages).indexOf(target);
                    preloadNextImages(currentIndex);
                }
            }
        });
    });
    
    cvImages.forEach(img => {
        observer.observe(img, { attributes: true, attributeFilter: ['class'] });
    });
    
    // Initial preload of next few images
    preloadNextImages(0);
}

function preloadOptimizedImage(imgElement, supportsWebP) {
    const originalSrc = imgElement.src;
    const fileName = originalSrc.split('/').pop().replace('.png', '');
    
    if (supportsWebP) {
        const webpSrc = originalSrc.replace('/images/', '/images/optimized/').replace('.png', '.webp');
        
        // Create preload link for optimized image
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = webpSrc;
        link.type = 'image/webp';
        document.head.appendChild(link);
    }
}

function preloadNextImages(currentIndex) {
    const cvImages = document.querySelectorAll('.cv-image');
    const supportsWebP = checkWebPSupport();
    
    // Preload next 2-3 images for smooth experience
    for (let i = 1; i <= 3; i++) {
        const nextIndex = (currentIndex + i) % cvImages.length;
        const nextImage = cvImages[nextIndex];
        
        if (nextImage && !nextImage.dataset.preloaded) {
            preloadOptimizedImage(nextImage, supportsWebP);
            nextImage.dataset.preloaded = 'true';
        }
    }
}

function checkWebPSupport() {
    // Simple WebP support detection
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Export functions for global access
window.selectService = selectService;
