import { useEffect, useState, useCallback } from 'react';
import i18n from '../i18n/config';

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

function normalize(value: string): Language {
  return value === 'fr' || value === 'de' ? value : 'en';
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(readFromStorage);

  useEffect(() => {
    const handler = (next: string) => setLanguageState(normalize(next));
    i18n.on('languageChanged', handler);
    return () => {
      i18n.off('languageChanged', handler);
    };
  }, []);

  const setLanguage = useCallback((value: Language) => {
    localStorage.setItem(STORAGE_KEY, value);
    i18n.changeLanguage(value);
    setLanguageState(value);
  }, []);

  return { language, setLanguage };
}
