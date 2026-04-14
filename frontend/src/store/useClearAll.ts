import { useCallback } from 'react';

const CA_PREFIX = 'ca_';

export function useClearAll() {
  const clearAll = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CA_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  }, []);

  return { clearAll };
}
