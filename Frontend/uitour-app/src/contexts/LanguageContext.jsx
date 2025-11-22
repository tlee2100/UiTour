import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt'
  }
};

export function LanguageProvider({ children }) {
  // Get initial language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('uitour_language');
    return saved && (saved === 'en' || saved === 'vi') ? saved : 'en';
  });

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem('uitour_language', language);
  }, [language]);

  const changeLanguage = (langCode) => {
    if (langCode === 'en' || langCode === 'vi') {
      setLanguage(langCode);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        languages: LANGUAGES,
        currentLanguage: LANGUAGES[language]
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

