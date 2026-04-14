import { useState, useCallback } from 'react';
import type { BodyType } from '@shared/types';

export interface Preferences {
  budgetMin: number | null;
  budgetMax: number | null;
  condition: 'new' | 'used' | 'both' | null;
  bodyType: BodyType | null;
  fuelType: string | null;
  transmission: 'manual' | 'automatic' | null;
}

const STORAGE_KEY = 'ca_preferences';

const defaultPreferences: Preferences = {
  budgetMin: null,
  budgetMax: null,
  condition: null,
  bodyType: null,
  fuelType: null,
  transmission: null,
};

function readFromStorage(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultPreferences, ...JSON.parse(raw) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultPreferences;
}

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<Preferences>(readFromStorage);

  const setPreferences = useCallback((value: Partial<Preferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPreferencesState(defaultPreferences);
  }, []);

  return { preferences, setPreferences, clearPreferences };
}
