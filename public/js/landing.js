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
    
    // Initialize mobile menu
    initMobileMenu();
    
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
    
    // Smart image loading with actual WebP replacement
    initSmartImageLoading();
    
    // Preload next images in sequence for smooth transitions    initImagePreloading();
    
    console.log('✅ Performance optimizations initialized');
}

function initSmartImageLoading() {
    console.log('� Using WebP-only images for maximum performance (modern browsers)');
    
    // Get all CV images for preloading next images
    const cvImages = document.querySelectorAll('.cv-image');
    console.log(`📊 Found ${cvImages.length} WebP images`);
    
    // Preload next few images for smooth transitions
    cvImages.forEach((img, index) => {
        if (index > 0 && index <= 3) { // Preload first few non-active images
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src;
            link.type = 'image/webp';
            document.head.appendChild(link);
            console.log(`🔄 Preloaded WebP image: ${index + 1}`);
        }
    });
}

function initImagePreloading() {
    console.log('� WebP-only optimization active - maximum performance for modern browsers');
}

// Image optimization is now handled natively by <picture> elements
// This provides better performance and browser compatibility

// Mobile Menu functionality
function initMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (!hamburgerBtn || !mobileMenuOverlay || !closeBtn) {
        console.log('📱 Mobile menu elements not found');
        return;
    }
    
    console.log('📱 Initializing mobile menu...');
    
    // Open mobile menu
    function openMobileMenu() {
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        console.log('📱 Mobile menu opened');
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scroll
        console.log('📱 Mobile menu closed');
    }
    
    // Event listeners
    hamburgerBtn.addEventListener('click', openMobileMenu);
    closeBtn.addEventListener('click', closeMobileMenu);
    
    // Close menu when clicking on nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    console.log('✅ Mobile menu initialized successfully');
}
