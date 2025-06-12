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
    
    console.log('✅ Landing page initialization complete');
});

// Service selection functions
function selectService(serviceType) {
    console.log('🎯 Service selected:', serviceType);
    
    // Define service routes
    const serviceRoutes = {
        'cv-to-website': '/upload-cv',        // Simple upload form (75 SAR)
        'full-package': '/create-from-scratch', // Full detailed form (100 SAR)  
        'cv-only': '/create-cv-only'          // CV-only form (25 SAR)
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

// Export functions for global access
window.selectService = selectService;
