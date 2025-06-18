/**
 * Cevehak Internationalization (i18n) Module
 * Handles language switching and content translation for three variants:
 * - Khaleeji/Saudi Arabic (ar-SA) - Local dialect (default)
 * - Standard Arabic (ar) - Formal Arabic for all Arabic speakers
 * - English (en) - International support
 */

class CevehakI18n {    constructor() {
        this.currentLanguage = 'ar'; // Default to Standard Arabic for unknown locations
        this.currentCurrency = 'USD'; // Default to USD for unknown locations
        this.userLocation = null;
        this.languages = {
            'ar-SA': null, // Khaleeji/Saudi Arabic
            'ar': null,    // Standard Arabic  
            'en': null     // English
        };
        this.currencies = {
            'SAR': { symbol: 'ر.س', name: 'Saudi Riyal', rate: 1 },
            'USD': { symbol: '$', name: 'US Dollar', rate: 0.27 },
            'EGP': { symbol: 'ج.م', name: 'Egyptian Pound', rate: 12.5 }
        };        this.locationLanguageMap = {
            // Saudi Arabia (Khaleeji Arabic + SAR)
            'SA': { lang: 'ar-SA', currency: 'SAR' },
            
            // Egypt (Standard Arabic + EGP)
            'EG': { lang: 'ar', currency: 'EGP' },
            
            // Gulf Countries (Khaleeji Arabic + USD)
            'AE': { lang: 'ar-SA', currency: 'USD' }, // UAE
            'KW': { lang: 'ar-SA', currency: 'USD' }, // Kuwait
            'QA': { lang: 'ar-SA', currency: 'USD' }, // Qatar
            'BH': { lang: 'ar-SA', currency: 'USD' }, // Bahrain
            'OM': { lang: 'ar-SA', currency: 'USD' }, // Oman
            
            // Other Arabic countries (Standard Arabic + USD)
            'JO': { lang: 'ar', currency: 'USD' }, // Jordan
            'LB': { lang: 'ar', currency: 'USD' }, // Lebanon
            'SY': { lang: 'ar', currency: 'USD' }, // Syria
            'IQ': { lang: 'ar', currency: 'USD' }, // Iraq
            'MA': { lang: 'ar', currency: 'USD' }, // Morocco
            'TN': { lang: 'ar', currency: 'USD' }, // Tunisia
            'DZ': { lang: 'ar', currency: 'USD' }, // Algeria
            'LY': { lang: 'ar', currency: 'USD' }, // Libya
            'SD': { lang: 'ar', currency: 'USD' }, // Sudan
            'YE': { lang: 'ar', currency: 'USD' }, // Yemen
            
            // English-speaking countries
            'US': { lang: 'en', currency: 'USD' },
            'GB': { lang: 'en', currency: 'USD' },
            'CA': { lang: 'en', currency: 'USD' },
            'AU': { lang: 'en', currency: 'USD' },
            'NZ': { lang: 'en', currency: 'USD' },
            'IE': { lang: 'en', currency: 'USD' },
            'ZA': { lang: 'en', currency: 'USD' }
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
    }    async detectUserLocation() {
        try {
            console.log('📍 Detecting user location...');
            
            // Try to get location from IP
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const locationData = await response.json();
                this.userLocation = {
                    country: locationData.country_code,
                    countryName: locationData.country_name,
                    city: locationData.city,
                    region: locationData.region
                };
                console.log(`✅ Location detected: ${this.userLocation.countryName} (${this.userLocation.country})`);
            } else {
                throw new Error('IP location service failed');
            }
        } catch (error) {
            console.log('⚠️ Could not detect location, using defaults:', error.message);
            this.userLocation = null;
        }
    }

    detectLanguage() {
        // Check localStorage first (user preference override)
        const savedLang = localStorage.getItem('cevehak-language');
        if (savedLang && this.languages.hasOwnProperty(savedLang)) {
            this.currentLanguage = savedLang;
            console.log(`🎯 Using saved language preference: ${savedLang}`);
            return;
        }

        // Use location-based detection if available
        if (this.userLocation && this.locationLanguageMap[this.userLocation.country]) {
            this.currentLanguage = this.locationLanguageMap[this.userLocation.country].lang;
            console.log(`🌍 Language auto-detected from location: ${this.currentLanguage}`);
            return;
        }

        // Fallback to browser language detection
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('ar')) {
            // Arabic browser - default to Standard Arabic
            this.currentLanguage = 'ar';
            console.log('🗣️ Arabic browser detected, using Standard Arabic');
        } else if (browserLang.startsWith('en')) {
            this.currentLanguage = 'en';
            console.log('🗣️ English browser detected');
        } else {
            // Default to Standard Arabic for unknown languages
            this.currentLanguage = 'ar';
            console.log('🗣️ Unknown browser language, defaulting to Standard Arabic');
        }
    }

    detectCurrency() {
        // Check localStorage first (user preference override)
        const savedCurrency = localStorage.getItem('cevehak-currency');
        if (savedCurrency && this.currencies.hasOwnProperty(savedCurrency)) {
            this.currentCurrency = savedCurrency;
            console.log(`💰 Using saved currency preference: ${savedCurrency}`);
            return;
        }

        // Use location-based detection if available
        if (this.userLocation && this.locationLanguageMap[this.userLocation.country]) {
            this.currentCurrency = this.locationLanguageMap[this.userLocation.country].currency;
            console.log(`🌍 Currency auto-detected from location: ${this.currentCurrency}`);
            return;
        }

        // Default to USD for unknown locations
        this.currentCurrency = 'USD';
        console.log('💵 Unknown location, defaulting to USD');
    }

    async loadLanguage(langCode) {
        if (this.languages[langCode]) {
            return this.languages[langCode]; // Already cached
        }

        try {
            console.log(`📥 Loading language: ${langCode}`);
            const response = await fetch(`public/js/lang/${langCode}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language ${langCode}: ${response.status}`);
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
    }

    translateContent(langData) {
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

        // Translate elements with data-i18n-html attributes (for HTML content)
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.getNestedTranslation(langData, key);
            
            if (translation) {
                element.innerHTML = translation;
            }
        });

        console.log('✅ Content translation complete');
    }    getNestedTranslation(data, key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], data);
    }

    // Currency Management Methods
    switchCurrency(currencyCode) {
        if (this.currencies.hasOwnProperty(currencyCode)) {
            this.currentCurrency = currencyCode;
            localStorage.setItem('cevehak-currency', currencyCode);
            
            console.log(`💰 Currency switched to: ${currencyCode}`);
            
            // Update all prices on the page
            this.updatePricesDisplay();
            
            // Update currency switcher UI
            this.updateCurrencySwitcherUI();
            
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('currencyChanged', {
                detail: { currency: currencyCode, data: this.currencies[currencyCode] }
            }));
        } else {
            console.error(`❌ Unknown currency: ${currencyCode}`);
        }
    }

    convertPrice(basePrice, targetCurrency = null) {
        const currency = targetCurrency || this.currentCurrency;
        const rate = this.currencies[currency]?.rate || 1;
        
        // Base price is in SAR, convert to target currency
        return Math.round(basePrice * rate);
    }

    formatPrice(price, currencyCode = null) {
        const currency = currencyCode || this.currentCurrency;
        const currencyInfo = this.currencies[currency];
        
        if (!currencyInfo) return `${price}`;
        
        // Format based on currency
        if (currency === 'SAR' || currency === 'EGP') {
            return `${price} ${currencyInfo.symbol}`;
        } else {
            return `${currencyInfo.symbol}${price}`;
        }
    }

    updatePricesDisplay() {
        // Update elements with data-price attributes
        document.querySelectorAll('[data-price]').forEach(element => {
            const basePrice = parseFloat(element.getAttribute('data-price'));
            if (!isNaN(basePrice)) {
                const convertedPrice = this.convertPrice(basePrice);
                const formattedPrice = this.formatPrice(convertedPrice);
                element.textContent = formattedPrice;
            }
        });

        // Update elements with data-price-html attributes (for complex price displays)
        document.querySelectorAll('[data-price-html]').forEach(element => {
            const basePrice = parseFloat(element.getAttribute('data-price-html'));
            if (!isNaN(basePrice)) {
                const convertedPrice = this.convertPrice(basePrice);
                const formattedPrice = this.formatPrice(convertedPrice);
                element.innerHTML = formattedPrice;
            }
        });
    }

    setupLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        let switcher = document.getElementById('language-switcher');
        
        if (!switcher) {
            switcher = this.createLanguageSwitcher();
            
            // Add to header or appropriate location
            const header = document.querySelector('header') || document.querySelector('.hero');
            if (header) {
                header.appendChild(switcher);
            }
        }
    }

    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'language-switcher';
        switcher.className = 'language-switcher';
        
        const langOptions = [
            { code: 'ar-SA', name: 'خليجي', flag: '🇸🇦' },
            { code: 'ar', name: 'عربي', flag: '🔤' },
            { code: 'en', name: 'English', flag: '🇺🇸' }
        ];

        switcher.innerHTML = `
            <div class="lang-dropdown">
                <button class="lang-current" id="current-lang">
                    <span class="lang-flag">${langOptions.find(l => l.code === this.currentLanguage)?.flag || '🇸🇦'}</span>
                    <span class="lang-name">${langOptions.find(l => l.code === this.currentLanguage)?.name || 'خليجي'}</span>
                    <span class="lang-arrow">▼</span>
                </button>
                <div class="lang-options" id="lang-options">
                    ${langOptions.map(lang => `
                        <button class="lang-option ${lang.code === this.currentLanguage ? 'active' : ''}" 
                                data-lang="${lang.code}">
                            <span class="lang-flag">${lang.flag}</span>
                            <span class="lang-name">${lang.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        this.addSwitcherEventListeners(switcher);
        
        return switcher;
    }

    addSwitcherEventListeners(switcher) {
        const currentLang = switcher.querySelector('#current-lang');
        const langOptions = switcher.querySelector('#lang-options');
        
        // Toggle dropdown
        currentLang.addEventListener('click', (e) => {
            e.stopPropagation();
            langOptions.classList.toggle('show');
        });

        // Language selection
        switcher.addEventListener('click', (e) => {
            if (e.target.closest('.lang-option')) {
                const langCode = e.target.closest('.lang-option').dataset.lang;
                if (langCode !== this.currentLanguage) {
                    this.switchLanguage(langCode);
                }
                langOptions.classList.remove('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            langOptions.classList.remove('show');
        });
    }    updateLanguageSwitcherUI() {
        const currentLang = document.querySelector('#current-lang');
        const langOptions = document.querySelectorAll('.lang-option');
        
        if (currentLang) {
            const langData = {
                'ar-SA': { name: 'خليجي', flag: '🇸🇦' },
                'ar': { name: 'عربي', flag: '🔤' },
                'en': { name: 'English', flag: '🇺🇸' }
            };
            
            const current = langData[this.currentLanguage];
            currentLang.innerHTML = `
                <span class="lang-flag">${current.flag}</span>
                <span class="lang-name">${current.name}</span>
                <span class="lang-arrow">▼</span>
            `;
        }

        // Update active state
        langOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
        });
    }

    // Currency Switcher Methods
    setupCurrencySwitcher() {
        // Create currency switcher if it doesn't exist
        let switcher = document.getElementById('currency-switcher');
        
        if (!switcher) {
            switcher = this.createCurrencySwitcher();
            
            // Add to header or appropriate location
            const header = document.querySelector('header') || document.querySelector('.hero');
            if (header) {
                header.appendChild(switcher);
            }
        }
    }

    createCurrencySwitcher() {
        const switcher = document.createElement('div');
        switcher.id = 'currency-switcher';
        switcher.className = 'currency-switcher';
        
        const currencyOptions = [
            { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦' },
            { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
            { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬' }
        ];

        const currentCurrency = currencyOptions.find(c => c.code === this.currentCurrency);

        switcher.innerHTML = `
            <div class="currency-dropdown">
                <button class="currency-current" id="current-currency">
                    <span class="currency-flag">${currentCurrency?.flag || '🇺🇸'}</span>
                    <span class="currency-symbol">${currentCurrency?.symbol || '$'}</span>
                    <span class="currency-arrow">▼</span>
                </button>
                <div class="currency-options" id="currency-options">
                    ${currencyOptions.map(currency => `
                        <button class="currency-option ${currency.code === this.currentCurrency ? 'active' : ''}" 
                                data-currency="${currency.code}">
                            <span class="currency-flag">${currency.flag}</span>
                            <span class="currency-symbol">${currency.symbol}</span>
                            <span class="currency-name">${currency.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        this.addCurrencySwitcherEventListeners(switcher);
        
        return switcher;
    }

    addCurrencySwitcherEventListeners(switcher) {
        const currentCurrency = switcher.querySelector('#current-currency');
        const currencyOptions = switcher.querySelector('#currency-options');
        
        // Toggle dropdown
        currentCurrency.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyOptions.classList.toggle('show');
        });

        // Currency selection
        switcher.addEventListener('click', (e) => {
            if (e.target.closest('.currency-option')) {
                const currencyCode = e.target.closest('.currency-option').dataset.currency;
                if (currencyCode !== this.currentCurrency) {
                    this.switchCurrency(currencyCode);
                }
                currencyOptions.classList.remove('show');
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            currencyOptions.classList.remove('show');
        });
    }

    updateCurrencySwitcherUI() {
        const currentCurrency = document.querySelector('#current-currency');
        const currencyOptions = document.querySelectorAll('.currency-option');
        
        if (currentCurrency) {
            const currencyData = {
                'SAR': { symbol: 'ر.س', flag: '🇸🇦' },
                'USD': { symbol: '$', flag: '🇺🇸' },
                'EGP': { symbol: 'ج.م', flag: '🇪🇬' }
            };
            
            const current = currencyData[this.currentCurrency];
            currentCurrency.innerHTML = `
                <span class="currency-flag">${current.flag}</span>
                <span class="currency-symbol">${current.symbol}</span>
                <span class="currency-arrow">▼</span>
            `;
        }

        // Update active state
        currencyOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.currency === this.currentCurrency);
        });
    }    // Utility methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getCurrentCurrency() {
        return this.currentCurrency;
    }

    isRTL() {
        return this.currentLanguage.startsWith('ar');
    }

    translate(key) {
        const currentLangData = this.languages[this.currentLanguage];
        if (!currentLangData) return key;
        
        return this.getNestedTranslation(currentLangData, key) || key;
    }

    // Currency utility methods
    getCurrentCurrencyInfo() {
        return this.currencies[this.currentCurrency];
    }    getAllCurrencies() {
        return this.currencies;
    }

    getLocationInfo() {
        return this.userLocation;
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
