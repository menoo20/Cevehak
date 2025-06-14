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
    
    // Initialize touch gestures for mobile
    initTouchGestures();
    
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
    
    // Preload next images in sequence for smooth transitions
    initImagePreloading();
    
    // Monitor optimization results
    logOptimizationResults();
    
    console.log('✅ Performance optimizations initialized');
}

function initSmartImageLoading() {
    // Check WebP support
    const supportsWebP = checkWebPSupport();
    console.log(`🖼️ WebP support detected: ${supportsWebP ? 'YES' : 'NO'}`);
    
    // Get all CV images (non-invasive approach)
    const cvImages = document.querySelectorAll('.cv-image');
    console.log(`📊 Found ${cvImages.length} CV images to optimize`);
    
    cvImages.forEach((img, index) => {
        if (img.classList.contains('active') || index === 0) {
            // Immediately optimize active/first image for instant benefit
            console.log(`🎯 Immediately optimizing image ${index + 1} (priority)`);
            preloadOptimizedImage(img, supportsWebP);
        } else {
            // Delay optimization for non-visible images to prioritize loading
            setTimeout(() => {
                console.log(`⏰ Optimizing image ${index + 1} (delayed)`);
                preloadOptimizedImage(img, supportsWebP);
            }, 500 + (index * 300));
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
    const isMobile = isMobileDevice();
    
    if (supportsWebP) {
        // Choose mobile or desktop WebP based on device
        const webpFileName = isMobile ? `${fileName}-mobile.webp` : `${fileName}.webp`;
        const webpSrc = originalSrc.replace('images/', 'images/optimized/').replace(`${fileName}.png`, webpFileName);
        
        console.log(`📱 Device type: ${isMobile ? 'Mobile' : 'Desktop'} - Using: ${webpFileName}`);
        
        // Create new image to test WebP loading
        const testImg = new Image();
        testImg.onload = function() {
            // WebP loaded successfully - replace the original PNG with WebP
            console.log(`✅ Replacing ${fileName}.png with optimized ${webpFileName}`);
            imgElement.src = webpSrc;
            imgElement.dataset.optimized = 'webp';
            imgElement.dataset.version = isMobile ? 'mobile' : 'desktop';
        };
        testImg.onerror = function() {
            // WebP failed to load - keep original PNG as fallback
            console.log(`⚠️ WebP failed for ${webpFileName}, keeping PNG fallback`);
            imgElement.dataset.optimized = 'png-fallback';
        };
        testImg.src = webpSrc;
        
        // Also preload it for faster loading
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = webpSrc;
        link.type = 'image/webp';
        document.head.appendChild(link);
    } else {
        console.log(`ℹ️ WebP not supported, keeping PNG for ${fileName}`);
        imgElement.dataset.optimized = 'png-no-webp-support';
    }
}

function preloadNextImages(currentIndex) {
    const cvImages = document.querySelectorAll('.cv-image');
    const supportsWebP = checkWebPSupport();
    
    // Preload and optimize next 2-3 images for smooth experience
    for (let i = 1; i <= 3; i++) {
        const nextIndex = (currentIndex + i) % cvImages.length;
        const nextImage = cvImages[nextIndex];
        
        if (nextImage && !nextImage.dataset.optimized) {
            console.log(`🔄 Preloading and optimizing next image: ${nextIndex + 1}`);
            preloadOptimizedImage(nextImage, supportsWebP);
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

// Performance monitoring for image optimization
function logOptimizationResults() {
    setTimeout(() => {
        const cvImages = document.querySelectorAll('.cv-image');
        let webpCount = 0;
        let pngCount = 0;
        let failedCount = 0;
        
        cvImages.forEach(img => {
            const optimized = img.dataset.optimized;
            if (optimized === 'webp') webpCount++;
            else if (optimized === 'png-fallback' || optimized === 'png-no-webp-support') pngCount++;
            else failedCount++;
        });
        
        console.log('📊 Image Optimization Results:');
        console.log(`✅ WebP optimized: ${webpCount}/${cvImages.length} images`);
        console.log(`📄 PNG fallback: ${pngCount}/${cvImages.length} images`);
        console.log(`❌ Failed: ${failedCount}/${cvImages.length} images`);
        
        if (webpCount > 0) {
            const savings = Math.round((webpCount / cvImages.length) * 75.3);
            console.log(`🚀 Estimated bandwidth savings: ~${savings}% for optimized images`);
        }
        
    }, 3000); // Check after 3 seconds to allow all images to process
}

// Mobile device detection for optimized image selection
function isMobileDevice() {
    // Check viewport width and user agent for mobile detection
    const isMobileViewport = window.innerWidth <= 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return isMobileViewport || isMobileUserAgent || isTouchDevice;
}

// Phase 2: Touch Gesture Support for CV Image Navigation
function initTouchGestures() {
    const cvDisplay = document.querySelector('.cv-display');
    const cvImages = document.querySelectorAll('.cv-image');
    
    if (!cvDisplay || cvImages.length === 0 || !isMobileDevice()) {
        console.log('📱 Touch gestures: Not applicable (desktop or no images found)');
        return;
    }
    
    console.log('📱 Initializing touch gestures for CV image navigation...');
    
    let touchStartX = 0;
    let touchEndX = 0;
    let currentImageIndex = 0;
    let isGestureEnabled = true;
    
    // Find current active image index
    function updateCurrentIndex() {
        cvImages.forEach((img, index) => {
            if (img.classList.contains('active')) {
                currentImageIndex = index;
            }
        });
    }
    
    // Navigate to specific image
    function navigateToImage(targetIndex) {
        if (targetIndex < 0 || targetIndex >= cvImages.length || !isGestureEnabled) return;
        
        // Remove active class from current image
        cvImages[currentImageIndex].classList.remove('active');
        
        // Add active class to target image
        cvImages[targetIndex].classList.add('active');
        currentImageIndex = targetIndex;
        
        console.log(`👆 Touch navigation: Switched to image ${targetIndex + 1}/${cvImages.length}`);
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Temporarily disable gestures to prevent rapid firing
        isGestureEnabled = false;
        setTimeout(() => {
            isGestureEnabled = true;
        }, 300);
    }
    
    // Handle touch start
    cvDisplay.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        updateCurrentIndex();
    }, { passive: true });
    
    // Handle touch end
    cvDisplay.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Determine swipe direction and navigate
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) < swipeThreshold) return;
        
        if (swipeDistance > 0) {
            // Swipe right - go to previous image
            const prevIndex = currentImageIndex === 0 ? cvImages.length - 1 : currentImageIndex - 1;
            navigateToImage(prevIndex);
            console.log('👉 Swipe right detected - Previous image');
        } else {
            // Swipe left - go to next image
            const nextIndex = (currentImageIndex + 1) % cvImages.length;
            navigateToImage(nextIndex);
            console.log('👈 Swipe left detected - Next image');
        }
    }
    
    // Add visual indicators for swipe capability
    addSwipeIndicators();
    
    console.log('✅ Touch gestures initialized for CV navigation');
    console.log('📱 Swipe left/right to browse CV images on mobile');
}

// Add visual indicators to show swipe capability
function addSwipeIndicators() {
    const cvDisplay = document.querySelector('.cv-display');
    if (!cvDisplay || !isMobileDevice()) return;
    
    // Create swipe hint overlay
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    swipeHint.innerHTML = `
        <div class="swipe-hint-content">
            <span class="swipe-arrow left">‹</span>
            <span class="swipe-text">Swipe to browse</span>
            <span class="swipe-arrow right">›</span>
        </div>
    `;
    
    // Add hint styles
    swipeHint.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        z-index: 15;
        pointer-events: none;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    `;
    
    // Style the content
    const hintContent = swipeHint.querySelector('.swipe-hint-content');
    hintContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    // Style arrows
    swipeHint.querySelectorAll('.swipe-arrow').forEach(arrow => {
        arrow.style.cssText = `
            font-size: 1.2rem;
            font-weight: bold;
            opacity: 0.7;
        `;
    });
    
    cvDisplay.appendChild(swipeHint);
    
    // Auto-hide hint after 3 seconds
    setTimeout(() => {
        swipeHint.style.opacity = '0';
        setTimeout(() => {
            if (swipeHint.parentNode) {
                swipeHint.parentNode.removeChild(swipeHint);
            }
        }, 300);
    }, 3000);
}

// Export functions for global access
window.selectService = selectService;
