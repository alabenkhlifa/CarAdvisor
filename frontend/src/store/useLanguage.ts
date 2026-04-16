import { useState, useCallback } from 'react';

export type Language = 'en' | 'fr' | 'de';

const STORAGE_KEY = 'ca_lang';

function readFromStorage(): Language {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'en' || value === 'fr' || value === 'de') {
      return value;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(readFromStorage);

  const setLanguage = useCallback((value: Language) => {
    localStorage.setItem(STORAGE_KEY, value);
    setLanguageState(value);
  }, []);

  return { language, setLanguage };
}
