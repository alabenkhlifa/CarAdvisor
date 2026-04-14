import { useState, useCallback } from 'react';

const STORAGE_KEY = 'ca_favorites';

function readFromStorage(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export function useFavorites() {
  const [favorites, setFavoritesState] = useState<number[]>(readFromStorage);

  const toggleFavorite = useCallback((id: number) => {
    setFavoritesState((prev) => {
      const next = prev.includes(id)
        ? prev.filter((fav) => fav !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites],
  );

  const clearFavorites = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFavoritesState([]);
  }, []);

  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}
