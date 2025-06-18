/**
 * Cevehak Internationalization (i18n) Module
 * Handles language switching and content translation for three variants:
 * - Khaleeji/Saudi Arabic (ar-SA) - Local dialect (default)
 * - Standard Arabic (ar) - Formal Arabic for all Arabic speakers
 * - English (en) - International support
 */

class CevehakI18n {
    constructor() {
        this.currentLanguage = 'ar-SA'; // Default to Khaleeji/Saudi
        this.languages = {
            'ar-SA': null, // Khaleeji/Saudi Arabic
            'ar': null,    // Standard Arabic  
            'en': null     // English
        };
        this.isLoading = false;
        
        // Initialize language system
        this.init();
    }

    async init() {
        console.log('🌍 Initializing Cevehak i18n system...');
        
        // Detect user's preferred language
        this.detectLanguage();
        
        // Load initial language
        await this.switchLanguage(this.currentLanguage);
        
        // Set up language switcher UI
        this.setupLanguageSwitcher();
        
        console.log(`✅ i18n initialized with language: ${this.currentLanguage}`);
    }

    detectLanguage() {
        // Check localStorage first
        const savedLang = localStorage.getItem('cevehak-language');
        if (savedLang && this.languages.hasOwnProperty(savedLang)) {
            this.currentLanguage = savedLang;
            return;
        }

        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        if (browserLang.startsWith('ar')) {
            // Arabic browser - default to Khaleeji/Saudi
            this.currentLanguage = 'ar-SA';
        } else if (browserLang.startsWith('en')) {
            this.currentLanguage = 'en';
        } else {
            // Default to Khaleeji/Saudi for any other language
            this.currentLanguage = 'ar-SA';
        }
    }

    async loadLanguage(langCode) {
        if (this.languages[langCode]) {
            return this.languages[langCode]; // Already cached
        }

        try {
            console.log(`📥 Loading language: ${langCode}`);
            const response = await fetch(`/js/lang/${langCode}.json`);
            
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
    }

    getNestedTranslation(data, key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], data);
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
    }

    updateLanguageSwitcherUI() {
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
