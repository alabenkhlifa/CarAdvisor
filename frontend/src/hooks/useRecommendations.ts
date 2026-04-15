import { useState, useEffect, useRef } from 'react';
import { recommendVehicles } from '../services/vehicles.api';
import { usePreferences } from '../store/usePreferences';
import { useMarket } from '../store/useMarket';
import type { Vehicle } from '@shared/types';

export function useRecommendations(
  sort?: string,
  page: number = 1,
  brandId?: number,
  modelId?: number,
) {
  const { preferences } = usePreferences();
  const { market } = useMarket();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize preferences to a stable string to avoid infinite loops
  const prefsKey = JSON.stringify(preferences);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!market) {
      setLoading(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const prefs = JSON.parse(prefsKey);
        const result = await recommendVehicles({
          market,
          minPrice: prefs.budgetMin ?? undefined,
          maxPrice: prefs.budgetMax ?? undefined,
          condition:
            prefs.condition === 'both'
              ? undefined
              : (prefs.condition ?? undefined),
          bodyType: prefs.bodyType ?? undefined,
          fuelType: prefs.fuelType ?? undefined,
          transmission: prefs.transmission ?? undefined,
          brandId,
          modelId,
          sort: sort || undefined,
          page,
          limit: 9,
        });
        if (!cancelled) {
          setVehicles(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetch();

    return () => {
      cancelled = true;
    };
  }, [market, prefsKey, sort, page, brandId, modelId]);

  return { vehicles, loading, error, total, totalPages };
}
