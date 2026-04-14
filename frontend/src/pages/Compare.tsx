import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { compareVehicles } from '../services/vehicles.api';
import ComparisonTable from '../components/vehicles/ComparisonTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Vehicle } from '@shared/types';

export default function Compare() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const ids = useMemo(() => {
    const raw = searchParams.get('ids') ?? '';
    return raw
      .split(',')
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
  }, [searchParams]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const data = await compareVehicles(ids);
        if (!cancelled) setVehicles(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : 'Failed to load comparison',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const handleRemove = useCallback(
    (id: number) => {
      const remaining = ids.filter((v) => v !== id);
      if (remaining.length < 2) {
        navigate('/recommendations');
        return;
      }
      setSearchParams({ ids: remaining.join(',') });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    },
    [ids, navigate, setSearchParams],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-warmgray font-body">{error}</p>
        <Link
          to="/recommendations"
          className="text-terracotta hover:text-terracotta-hover font-body font-medium transition-colors"
        >
          {t('compare.backToResults')}
        </Link>
      </div>
    );
  }

  if (ids.length < 2 || vehicles.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-warmgray font-body">
          {t('recommendations.noResults')}
        </p>
        <Link
          to="/recommendations"
          className="text-terracotta hover:text-terracotta-hover font-body font-medium transition-colors"
        >
          {t('compare.backToResults')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/recommendations"
          className="inline-flex items-center gap-1.5 text-sm text-warmgray hover:text-charcoal font-body transition-colors mb-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('compare.backToResults')}
        </Link>
        <h1 className="font-display text-3xl text-charcoal">
          {t('compare.title')}
        </h1>
      </div>

      {/* Comparison table */}
      <ComparisonTable vehicles={vehicles} onRemove={handleRemove} />
    </div>
  );
}
