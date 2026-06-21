import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext(null);

const AVAILABLE_LOCALES = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem('ecomirror_language');
      return stored || 'en';
    } catch {
      return 'en';
    }
  });

  const [loadedDicts, setLoadedDicts] = useState({});

  // Eagerly load English at first
  useEffect(() => {
    import('../data/locales/en.json').then((module) => {
      setLoadedDicts(prev => ({ ...prev, en: module.default }));
    }).catch(err => {
      console.error('Failed to load English translations', err);
    });
  }, []);

  // Load other languages when they become active
  useEffect(() => {
    const cleanLang = language ? language.toLowerCase() : 'en';
    if (AVAILABLE_LOCALES.includes(cleanLang) && !loadedDicts[cleanLang]) {
      import(`../data/locales/${cleanLang}.json`)
        .then((module) => {
          setLoadedDicts(prev => ({ ...prev, [cleanLang]: module.default }));
        })
        .catch((err) => {
          console.error(`Failed to load translation bundle for ${cleanLang}:`, err);
        });
    }
  }, [language, loadedDicts]);

  const setLanguage = useCallback((newLang) => {
    try {
      localStorage.setItem('ecomirror_language', newLang);
    } catch (e) {
      console.warn('Failed to save language to localStorage:', e);
    }
    setLanguageState(newLang);
  }, []);

  // t function resolved with dot-nested path keys (e.g., 'landing.title')
  const t = useCallback((key, defaultValue) => {
    const cleanLang = language ? language.toLowerCase() : 'en';
    const langDict = loadedDicts[cleanLang] || loadedDicts['en'];
    const englishDict = loadedDicts['en'];

    // If key matches exactly, return translation
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    
    // Fallback to English
    if (englishDict && englishDict[key] !== undefined) {
      return englishDict[key];
    }

    return defaultValue !== undefined ? defaultValue : key;
  }, [language, loadedDicts]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
