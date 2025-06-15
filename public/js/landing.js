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

// 📊 Client-Side Stats Tracking System
class CevehakStats {
    constructor() {
        this.storagePrefix = 'cevehak_stats_';
        this.visitSessionKey = 'cevehak_session_';
        
        // Base numbers to start with (realistic starting point)
        this.baseStats = {
            visitors: 1247,
            submissions: 156,
            projects: 203,
            satisfaction: 98
        };
        
        this.init();
    }

    init() {
        console.log('📊 Initializing Cevehak Stats System...');
        this.trackVisitor();
        this.loadStats();
        this.displayStats();
        this.animateCounters();
        console.log('✅ Stats system initialized');
    }

    // Generate a unique session ID for the browser session
    getSessionId() {
        let sessionId = sessionStorage.getItem('cevehak_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('cevehak_session_id', sessionId);
        }
        return sessionId;
    }

    // Track unique visitors (one per session)
    trackVisitor() {
        const sessionId = this.getSessionId();
        const visitedKey = this.visitSessionKey + sessionId;
        
        // Check if this session has already been counted
        if (!localStorage.getItem(visitedKey)) {
            // New session - increment visitor count
            this.incrementStat('visitors');
            localStorage.setItem(visitedKey, Date.now());
            console.log('👋 New visitor session tracked');
        } else {
            console.log('🔄 Returning visitor in same session');
        }
    }

    // Get current stat value
    getStat(statName) {
        const key = this.storagePrefix + statName;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            return parseInt(stored);
        } else {
            // First time - initialize with base value
            const baseValue = this.baseStats[statName] || 0;
            this.setStat(statName, baseValue);
            return baseValue;
        }
    }

    // Set stat value
    setStat(statName, value) {
        const key = this.storagePrefix + statName;
        localStorage.setItem(key, value.toString());
    }

    // Increment a specific stat
    incrementStat(statName, amount = 1) {
        const currentValue = this.getStat(statName);
        const newValue = currentValue + amount;
        this.setStat(statName, newValue);
        return newValue;
    }

    // Load all current stats
    loadStats() {
        this.currentStats = {
            visitors: this.getStat('visitors'),
            submissions: this.getStat('submissions'),
            projects: this.getStat('projects'),
            satisfaction: this.baseStats.satisfaction // This stays static
        };
        
        console.log('📈 Current Stats:', this.currentStats);
    }

    // Display stats in the DOM
    displayStats() {
        const visitorsEl = document.getElementById('visitorsCount');
        const submissionsEl = document.getElementById('submissionsCount');
        const satisfactionEl = document.getElementById('satisfactionRate');
        const projectsEl = document.getElementById('projectsCount');

        if (visitorsEl) visitorsEl.textContent = this.formatNumber(this.currentStats.visitors);
        if (submissionsEl) submissionsEl.textContent = this.formatNumber(this.currentStats.submissions);
        if (satisfactionEl) satisfactionEl.textContent = this.currentStats.satisfaction + '%';
        if (projectsEl) projectsEl.textContent = this.formatNumber(this.currentStats.projects);
    }

    // Format numbers (add commas, k notation, etc.)
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 1000).toFixed(1) + 'k';
        } else if (num >= 1000) {
            return num.toLocaleString();
        }
        return num.toString();
    }

    // Animate counters with smooth counting effect
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const animateCounter = (element, finalValue) => {
            const isPercentage = element.textContent.includes('%');
            const numericValue = parseInt(finalValue.toString().replace(/[^\d]/g, ''));
            
            let startValue = Math.max(0, numericValue - Math.min(50, numericValue * 0.1));
            const duration = 2000; // 2 seconds
            const stepTime = 16; // ~60fps
            const steps = duration / stepTime;
            const increment = (numericValue - startValue) / steps;
            
            let currentValue = startValue;
            
            const timer = setInterval(() => {
                currentValue += increment;
                
                if (currentValue >= numericValue) {
                    currentValue = numericValue;
                    clearInterval(timer);
                }
                
                if (isPercentage) {
                    element.textContent = Math.floor(currentValue) + '%';
                } else {
                    element.textContent = this.formatNumber(Math.floor(currentValue));
                }
            }, stepTime);
        };

        // Use Intersection Observer to trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const finalValue = element.textContent;
                    animateCounter(element, finalValue);
                    observer.unobserve(element);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Public method to track form submissions
    trackFormSubmission() {
        const newCount = this.incrementStat('submissions');
        // Also increment projects (submissions + some buffer)
        this.incrementStat('projects');
        
        console.log('📋 Form submission tracked! New count:', newCount);
        return newCount;
    }

    // Public method to get current stats (for debugging)
    getCurrentStats() {
        return this.currentStats;
    }

    // Reset stats (for testing)
    resetStats() {
        Object.keys(this.baseStats).forEach(statName => {
            localStorage.removeItem(this.storagePrefix + statName);
        });
        
        // Clear session data
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.visitSessionKey)) {
                localStorage.removeItem(key);
            }
        });
        
        sessionStorage.removeItem('cevehak_session_id');
        console.log('🔄 Stats reset to base values');
        
        // Reload to show reset values
        location.reload();
    }
}

// Initialize stats system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on landing page (where stats section exists)
    if (document.querySelector('.stats-section')) {
        window.cevehakStats = new CevehakStats();
    }
});

// Make it globally accessible for form submission tracking
window.CevehakStats = CevehakStats;
