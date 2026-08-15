import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getTranslation } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('makka-locale') || 'ar';
  });

  const setLocale = useCallback((l) => {
    setLocaleState(l);
    localStorage.setItem('makka-locale', l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const t = useCallback((key) => {
    const strings = getTranslation(locale);
    const keys = key.split('.');
    let v = strings;
    for (const k of keys) {
      v = v?.[k];
    }
    return v ?? key;
  }, [locale]);

  const value = useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
