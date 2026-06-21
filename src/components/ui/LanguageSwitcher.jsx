/**
 * @fileoverview Floating language-switcher dropdown.
 * Supports full keyboard navigation (Arrow, Enter, Escape) and 20 languages.
 * @module components/ui/LanguageSwitcher
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import './LanguageSwitcher.css';

/** All supported languages (matches translations.js entries). */
const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English' },
  { code: 'hi', label: 'Hindi',      native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil',      native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',     native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada',    native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam',  native: 'മലയാളം' },
  { code: 'bn', label: 'Bengali',    native: 'বাংলা' },
  { code: 'mr', label: 'Marathi',    native: 'मराठी' },
  { code: 'gu', label: 'Gujarati',   native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi',    native: 'ਪੰਜਾਬੀ' },
  { code: 'es', label: 'Spanish',    native: 'Español' },
  { code: 'fr', label: 'French',     native: 'Français' },
  { code: 'de', label: 'German',     native: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'zh', label: 'Chinese',    native: '中文' },
  { code: 'ar', label: 'Arabic',     native: 'العربية' },
  { code: 'ja', label: 'Japanese',   native: '日本語' },
  { code: 'ko', label: 'Korean',     native: '한국어' },
  { code: 'ru', label: 'Russian',    native: 'Русский' },
  { code: 'it', label: 'Italian',    native: 'Italiano' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef(null);
  const optionRefs = useRef([]);

  /** Close on outside click. */
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Scroll focused option into view. */
  useEffect(() => {
    if (focusedIdx >= 0 && optionRefs.current[focusedIdx]) {
      optionRefs.current[focusedIdx].scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIdx]);

  const activeLang = LANGUAGES.find(l => l.code === language) ?? LANGUAGES[0];

  const selectLanguage = useCallback((code) => {
    setLanguage(code);
    setIsOpen(false);
    setFocusedIdx(-1);
  }, [setLanguage]);

  /** Full keyboard navigation: Arrow Up/Down, Enter, Escape, Home, End. */
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIdx(LANGUAGES.findIndex(l => l.code === language));
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setFocusedIdx(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIdx(prev => (prev + 1) % LANGUAGES.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIdx(prev => (prev - 1 + LANGUAGES.length) % LANGUAGES.length);
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIdx(LANGUAGES.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIdx >= 0) selectLanguage(LANGUAGES[focusedIdx].code);
        break;
      default:
        break;
    }
  }, [isOpen, focusedIdx, language, selectLanguage]);

  return (
    <div
      className="lang-switcher"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className={`lang-switcher__btn ${isOpen ? 'lang-switcher__btn--open' : ''}`}
        onClick={() => { setIsOpen(prev => !prev); setFocusedIdx(-1); }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('aria.select_language', 'Select language')}
        id="language-switcher-button"
      >
        <Globe size={18} aria-hidden="true" />
        <span className="lang-switcher__active-code">{activeLang.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="lang-switcher__dropdown"
            role="listbox"
            aria-label={t('aria.languages', 'Languages')}
            aria-activedescendant={focusedIdx >= 0 ? `lang-option-${LANGUAGES[focusedIdx].code}` : undefined}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {LANGUAGES.map((lang, idx) => (
              <li
                key={lang.code}
                ref={el => { optionRefs.current[idx] = el; }}
                role="option"
                aria-selected={language === lang.code}
                tabIndex={0}
                className={[
                  'lang-switcher__option',
                  language === lang.code ? 'lang-switcher__option--selected' : '',
                  focusedIdx === idx ? 'lang-switcher__option--focused' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectLanguage(lang.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectLanguage(lang.code);
                  }
                }}
                id={`lang-option-${lang.code}`}
              >
                <div className="lang-switcher__option-label">
                  <span className="lang-switcher__native-text">{lang.native}</span>
                  {lang.code !== 'en' && (
                    <span className="lang-switcher__english-text">({lang.label})</span>
                  )}
                </div>
                {language === lang.code && (
                  <Check size={14} className="lang-switcher__check" aria-hidden="true" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
