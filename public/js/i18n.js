/**
 * Cevehak Internationalization (i18n) Module
 * Handles language switching and content translation for three variants:
 * - Khaleeji/Saudi Arabic (ar-SA) - Local dialect (default)
 * - Standard Arabic (ar) - Formal Arabic for all Arabic speakers
 * - English (en) - International support
 */

class CevehakI18n {
    constructor() {
        this.currentLanguage = 'ar'; // Default to Arabic (formal)
        this.currentCurrency = 'SAR'; // Default to Saudi Riyal
        this.userLocation = null;
        this.languages = {
            'ar': null,    // Arabic (formal)
            'en': null     // English
        };        this.currencies = {
            'SAR': { 
                symbol: { ar: 'SAR', en: 'SAR' }, 
                name: 'Saudi Riyal', 
                rate: 1 
            },
            'USD': { 
                symbol: { ar: '$', en: '$' }, 
                name: 'US Dollar', 
                rate: 0.27 
            },
            'EGP': { 
                symbol: { ar: 'LE', en: 'LE' }, 
                name: 'Egyptian Pound', 
                rate: 8.25 
            }
        };
        this.isLoading = false;
        
        // Initialize language system
        this.init();
    }async init() {
        console.log('🌍 Initializing Cevehak i18n system...');
        
        // Detect user's location first
        await this.detectUserLocation();
        
        // Detect user's preferred language based on location
        this.detectLanguage();
        
        // Detect user's preferred currency based on location
        this.detectCurrency();
        
        // Load initial language
        await this.switchLanguage(this.currentLanguage);
        
        // Set up language switcher UI
        this.setupLanguageSwitcher();
        
        // Set up currency switcher UI
        this.setupCurrencySwitcher();
        
        console.log(`✅ i18n initialized with language: ${this.currentLanguage}, currency: ${this.currentCurrency}`);
    }    detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('cevehak-language');
        if (savedLang && this.languages.hasOwnProperty(savedLang)) {
            this.currentLanguage = savedLang;
            return;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('ar')) {
            // Arabic browser - use Arabic
            this.currentLanguage = 'ar';
        } else if (browserLang.startsWith('en')) {
            this.currentLanguage = 'en';
        } else {
            // Default to Arabic for any other language
            this.currentLanguage = 'ar';
        }

        console.log('🌐 Language detected:', this.currentLanguage);
    }

    async loadLanguage(langCode) {
        if (this.languages[langCode]) {
            return this.languages[langCode]; // Already cached
        }        try {
            console.log(`📥 Loading language: ${langCode}`);
            
            // Try multiple paths for GitHub Pages compatibility
            const possiblePaths = [
                `/public/js/lang/${langCode}.json`,        // Absolute path
                `./public/js/lang/${langCode}.json`,       // Relative from root
                `../public/js/lang/${langCode}.json`,      // Relative from views
                `public/js/lang/${langCode}.json`          // Direct path
            ];
            
            let response = null;
            let error = null;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`🔍 Trying path: ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`✅ Successfully loaded from: ${path}`);
                        break;
                    }
                } catch (e) {
                    error = e;
                    console.log(`❌ Failed path: ${path}`);
                }
            }
            
            if (!response || !response.ok) {
                throw new Error(`Failed to load language ${langCode} from all paths: ${response?.status || 'no response'}`);
            }
            
            const langData = await response.json();
            this.languages[langCode] = langData;
            console.log(`✅ Language ${langCode} loaded successfully`);
            
            return langData;
        } catch (error) {
            console.error(`❌ Error loading language ${langCode}:`, error);
            
            // Fallback to Khaleeji/Saudi if available
            if (langCode !== 'ar-SA' && this.languages['ar-SA']) {
                console.log('📋 Falling back to Khaleeji/Saudi Arabic');
                return this.languages['ar-SA'];
            }
            
            throw error;
        }
    }

    async switchLanguage(langCode) {
        if (this.isLoading) {
            console.log('⏳ Language switch already in progress...');
            return;
        }

        this.isLoading = true;

        try {
            console.log(`🔄 Switching to language: ${langCode}`);
            
            // Load language data
            const langData = await this.loadLanguage(langCode);
            
            // Update current language
            this.currentLanguage = langCode;
            
            // Save to localStorage
            localStorage.setItem('cevehak-language', langCode);
            
            // Update document attributes
            this.updateDocumentAttributes(langData);
            
            // Translate all content
            this.translateContent(langData);
            
            // Update language switcher UI
            this.updateLanguageSwitcherUI();
            
            console.log(`✅ Successfully switched to ${langCode}`);
            
            // Trigger custom event for other modules
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: langCode, data: langData }
            }));
            
        } catch (error) {
            console.error('❌ Error switching language:', error);
        } finally {
            this.isLoading = false;
        }
    }

    updateDocumentAttributes(langData) {
        const html = document.documentElement;
        
        // Update language and direction
        html.setAttribute('lang', langData.meta.code);
        html.setAttribute('dir', langData.meta.dir);
        
        // Update page title
        const titleElement = document.querySelector('title');
        if (titleElement && langData.hero) {
            const siteName = 'Cevehak';
            titleElement.textContent = `${langData.hero.title} - ${siteName}`;
        }
    }    translateContent(langData) {
        console.log('🔤 Translating page content...');
        
        // Translate elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getNestedTranslation(langData, key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Translate placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getNestedTranslation(langData, key);
            
            if (translation) {
                element.placeholder = translation;
            }
        });

        // Translate elements with data-i18n-html attributes (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getNestedTranslation(langData, key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });

        console.log('✅ Content translation complete');
    }

    getNestedTranslation(data, key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], data);
    }    setupLanguageSwitcher() {
        // Only set up event listeners for existing footer language buttons
        const languageButtons = document.querySelectorAll('.lang-btn');
        
        console.log(`🔗 Setting up language switcher - found ${languageButtons.length} buttons`);
        
        if (languageButtons.length === 0) {
            console.warn('⚠️ No language buttons found, retrying in 500ms...');
            setTimeout(() => this.setupLanguageSwitcher(), 500);
            return;
        }
        
        languageButtons.forEach((btn, index) => {
            console.log(`🔘 Setting up button ${index + 1}: ${btn.dataset.lang}`);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.dataset.lang;
                console.log(`🖱️ Language button clicked: ${lang}`);
                if (lang && lang !== this.currentLanguage) {
                    console.log(`🔄 Switching from ${this.currentLanguage} to ${lang}`);
                    this.switchLanguage(lang);
                } else {
                    console.log(`ℹ️ Already using language: ${lang}`);
                }
            });
        });

        // Update initial UI
        this.updateLanguageSwitcherUI();
    }

    // Removed createLanguageSwitcher method - now using footer buttons only    // Removed addSwitcherEventListeners method - now using footer buttons only

    updateLanguageSwitcherUI() {
        // Update active state for footer language buttons
        const languageButtons = document.querySelectorAll('.lang-btn');
        
        languageButtons.forEach(btn => {
            if (btn.dataset.lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    async detectUserLocation() {
        try {
            // Try to get user's location via IP geolocation (fallback approach)
            console.log('🌍 Detecting user location...');
            
            // For now, we'll use a simple approach - you can enhance this later
            // with actual geolocation APIs like ipapi.co or similar
            this.userLocation = {
                country: 'SA', // Default to Saudi Arabia
                currency: 'SAR'
            };
            
            console.log('📍 Location detected:', this.userLocation);
        } catch (error) {
            console.warn('⚠️ Could not detect location, using defaults:', error);
            this.userLocation = {
                country: 'SA',
                currency: 'SAR'
            };
        }
    }

    detectCurrency() {
        // Check localStorage first
        const savedCurrency = localStorage.getItem('cevehak-currency');
        if (savedCurrency && this.currencies.hasOwnProperty(savedCurrency)) {
            this.currentCurrency = savedCurrency;
            return;
        }

        // Based on detected location or defaults
        if (this.userLocation) {
            switch (this.userLocation.country) {
                case 'SA':
                    this.currentCurrency = 'SAR';
                    break;
                case 'EG':
                    this.currentCurrency = 'EGP';
                    break;
                default:
                    this.currentCurrency = 'USD';
            }
        } else {
            // Default to USD if no location detected
            this.currentCurrency = 'USD';
        }

        console.log('💰 Currency detected:', this.currentCurrency);
    }    setupCurrencySwitcher() {
        const currencyButtons = document.querySelectorAll('.currency-btn');
        
        console.log(`💰 Setting up currency switcher - found ${currencyButtons.length} buttons`);
        
        if (currencyButtons.length === 0) {
            console.warn('⚠️ No currency buttons found, retrying in 500ms...');
            setTimeout(() => this.setupCurrencySwitcher(), 500);
            return;
        }
        
        currencyButtons.forEach((btn, index) => {
            console.log(`💵 Setting up currency button ${index + 1}: ${btn.dataset.currency}`);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const currency = btn.dataset.currency;
                console.log(`🖱️ Currency button clicked: ${currency}`);
                if (currency && currency !== this.currentCurrency) {
                    console.log(`💱 Switching from ${this.currentCurrency} to ${currency}`);
                    this.switchCurrency(currency);
                } else {
                    console.log(`ℹ️ Already using currency: ${currency}`);
                }
            });
        });

        // Update initial UI
        this.updateCurrencySwitcherUI();
    }

    switchCurrency(currency) {
        if (!this.currencies.hasOwnProperty(currency)) {
            console.warn('⚠️ Invalid currency:', currency);
            return;
        }

        this.currentCurrency = currency;
        localStorage.setItem('cevehak-currency', currency);
        
        console.log('💰 Currency switched to:', currency);
        
        // Update UI
        this.updateCurrencySwitcherUI();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('currencyChanged', {
            detail: { currency: currency }
        }));
    }

    updateCurrencySwitcherUI() {
        const currencyButtons = document.querySelectorAll('.currency-btn');
        
        currencyButtons.forEach(btn => {
            if (btn.dataset.currency === this.currentCurrency) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }    formatPrice(basePrice, includeStartingAt = true) {
        const currency = this.currencies[this.currentCurrency];
        if (!currency) {
            console.warn('⚠️ Invalid currency for formatting:', this.currentCurrency);
            return `${basePrice} USD`;
        }

        const convertedPrice = Math.round(basePrice * currency.rate);
        
        // Get the appropriate symbol based on current language
        let symbol;
        if (typeof currency.symbol === 'object') {
            // Use current language, default to Arabic if language not found
            symbol = currency.symbol[this.currentLanguage] || currency.symbol['ar'];
        } else {
            symbol = currency.symbol;
        }
        
        // Get "starting at" text in current language
        let formattedPrice = `${convertedPrice} ${symbol}`;
        
        if (includeStartingAt) {
            const currentLangData = this.languages[this.currentLanguage];
            const startingAtText = currentLangData?.pricing?.startingAt || 'Starting at';
            formattedPrice = `${startingAtText} ${convertedPrice} ${symbol}`;
        }
        
        console.log(`💰 Formatting price: ${basePrice} -> ${formattedPrice} (lang: ${this.currentLanguage})`);
        return formattedPrice;
    }

    getCurrentCurrency() {
        return this.currentCurrency;
    }

    getPricing() {
        return {
            cvToWebsite: this.formatPrice(75),
            fullPackage: this.formatPrice(100),
            cvOnly: this.formatPrice(25)
        };
    }

    // Utility methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.currentLanguage.startsWith('ar');
    }

    translate(key) {
        const currentLangData = this.languages[this.currentLanguage];
        if (!currentLangData) return key;
        
        return this.getNestedTranslation(currentLangData, key) || key;
    }
}

// Initialize i18n system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cevehakI18n = new CevehakI18n();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CevehakI18n;
}
