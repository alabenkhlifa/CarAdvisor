import { useState, useCallback } from 'react';

type Language = 'en' | 'fr';

const STORAGE_KEY = 'ca_lang';

function readFromStorage(): Language {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'en' || value === 'fr') {
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
