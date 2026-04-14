import { useState, useCallback } from 'react';
import { compareVehicles } from '../services/vehicles.api';
import type { Vehicle } from '@shared/types';

const MAX_COMPARE = 4;

export function useCompare() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCompare = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((v) => v !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => {
    setSelectedIds([]);
    setVehicles([]);
  }, []);

  const fetchComparison = useCallback(async (ids: number[]) => {
    if (ids.length < 2) return;

    setLoading(true);
    setError(null);

    try {
      const data = await compareVehicles(ids);
      setVehicles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch comparison',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    selectedIds,
    vehicles,
    loading,
    error,
    toggleCompare,
    clearCompare,
    fetchComparison,
  };
}
