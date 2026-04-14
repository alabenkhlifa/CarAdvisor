import { useState, useEffect } from 'react';
import { getVehicle } from '../services/vehicles.api';
import type { Vehicle } from '@shared/types';

export function useVehicle(id: number) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      try {
        const data = await getVehicle(id);
        if (!cancelled) {
          setVehicle(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch vehicle',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { vehicle, loading, error };
}
