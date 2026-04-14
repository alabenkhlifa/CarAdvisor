import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ca_session';

function readFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useSession() {
  const [sessionToken, setSessionTokenState] = useState<string | null>(readFromStorage);

  const setSessionToken = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setSessionTokenState(value);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSessionTokenState(null);
  }, []);

  return { sessionToken, setSessionToken, clearSession };
}
