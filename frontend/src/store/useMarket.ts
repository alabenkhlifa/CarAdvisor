import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ca_market';

function readFromStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useMarket() {
  const [market, setMarketState] = useState<string | null>(readFromStorage);

  const setMarket = useCallback((value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setMarketState(value);
  }, []);

  const clearMarket = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setMarketState(null);
  }, []);

  return { market, setMarket, clearMarket };
}
