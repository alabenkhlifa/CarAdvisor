import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecommendations } from '../hooks/useRecommendations';
import { useCompare } from '../hooks/useCompare';
import { useMarket } from '../store/useMarket';
import VehicleGrid from '../components/vehicles/VehicleGrid';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import ChatPanel from '../components/chat/ChatPanel';
import { getBrands, getModels } from '../services/brands.api';
import { usePreferences } from '../store/usePreferences';
import type { Brand, Model } from '@shared/types';

const sortOptions = [
  { value: '', labelKey: 'recommendations.sortRelevance' },
  { value: 'price_asc', labelKey: 'recommendations.sortPriceAsc' },
  { value: 'price_desc', labelKey: 'recommendations.sortPriceDesc' },
  { value: 'year_desc', labelKey: 'recommendations.sortYearDesc' },
  { value: 'year_asc', labelKey: 'recommendations.sortYearAsc' },
];

export default function Recommendations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [brandId, setBrandId] = useState<number | undefined>();
  const [modelId, setModelId] = useState<number | undefined>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const { market } = useMarket();
  const { preferences } = usePreferences();
  const prefsKey = JSON.stringify(preferences);
  const { vehicles, loading, error, total, totalPages } = useRecommendations(
    sort || undefined,
    page,
    brandId,
    modelId,
  );
  const { selectedIds, toggleCompare } = useCompare();
  const [aiSelectedIds, setAiSelectedIds] = useState<number[]>([]);

  const toggleAiSelect = useCallback((id: number) => {
    setAiSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  useEffect(() => {
    if (!market) return;
    let cancelled = false;
    const prefs = JSON.parse(prefsKey);
    getBrands(market, {
      condition: prefs.condition === 'both' ? undefined : (prefs.condition ?? undefined),
      minPrice: prefs.budgetMin ?? undefined,
      maxPrice: prefs.budgetMax ?? undefined,
      bodyType: prefs.bodyType ?? undefined,
      fuelType: prefs.fuelType ?? undefined,
      transmission: prefs.transmission ?? undefined,
    }).then((data) => {
      if (!cancelled) setBrands(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [market, prefsKey]);

  useEffect(() => {
    setModelId(undefined);
    if (!brandId || !market) {
      setModels([]);
      return;
    }
    let cancelled = false;
    const prefs = JSON.parse(prefsKey);
    getModels(brandId, {
      market,
      condition: prefs.condition === 'both' ? undefined : (prefs.condition ?? undefined),
      minPrice: prefs.budgetMin ?? undefined,
      maxPrice: prefs.budgetMax ?? undefined,
      bodyType: prefs.bodyType ?? undefined,
      fuelType: prefs.fuelType ?? undefined,
      transmission: prefs.transmission ?? undefined,
    }).then((data) => {
      if (!cancelled) setModels(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [brandId, market, prefsKey]);

  const handleBrandChange = (value: string) => {
    setBrandId(value ? Number(value) : undefined);
    setPage(1);
  };

  const handleModelChange = (value: string) => {
    setModelId(value ? Number(value) : undefined);
    setPage(1);
  };

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
          to="/home"
          className="text-terracotta hover:text-terracotta-hover font-body font-medium transition-colors"
        >
          {t('recommendations.backToPreferences')}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-sm text-warmgray hover:text-charcoal font-body transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('recommendations.backToPreferences')}
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="font-display text-3xl text-charcoal">
            {t('recommendations.title')}
            <span className="text-warmgray text-lg font-body font-normal ml-3">
              {total} {total === 1 ? 'car' : 'cars'}
            </span>
          </h1>
        </div>
      </div>

      {/* Sort + filter controls */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="text-sm font-body bg-surface border border-warmgray-border rounded-xl px-4 py-2 text-charcoal cursor-pointer focus:outline-none focus:border-terracotta transition-colors"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>

        <select
          value={brandId ?? ''}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="w-44 max-w-[11rem] text-sm font-body bg-surface border border-warmgray-border rounded-xl px-4 py-2 text-charcoal cursor-pointer focus:outline-none focus:border-terracotta transition-colors truncate"
        >
          <option value="">{t('recommendations.allBrands')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name.length > 30 ? b.name.slice(0, 30) + '…' : b.name}</option>
          ))}
        </select>

        <select
          value={modelId ?? ''}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!brandId || models.length === 0}
          className="w-44 max-w-[11rem] text-sm font-body bg-surface border border-warmgray-border rounded-xl px-4 py-2 text-charcoal cursor-pointer focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50 disabled:cursor-not-allowed truncate"
        >
          <option value="">{t('recommendations.allModels')}</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name.length > 30 ? m.name.slice(0, 30) + '…' : m.name}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <svg
            className="w-16 h-16 text-warmgray/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="text-lg font-display text-charcoal">
            {t('recommendations.noResults')}
          </p>
          <p className="text-warmgray font-body text-sm">
            {t('recommendations.noResultsDesc')}
          </p>
          <Link to="/home">
            <Button variant="secondary" size="sm">
              {t('recommendations.backToPreferences')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <VehicleGrid
            vehicles={vehicles}
            compareIds={selectedIds}
            aiSelectedIds={aiSelectedIds}
            onCompareToggle={toggleCompare}
            onAiSelectToggle={toggleAiSelect}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-warmgray-border text-sm font-body text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:border-terracotta hover:text-terracotta transition-colors"
              >
                {t('recommendations.prev')}
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="text-warmgray px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-body font-medium transition-colors ${
                          p === page
                            ? 'bg-terracotta text-white'
                            : 'border border-warmgray-border text-charcoal hover:border-terracotta hover:text-terracotta'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-warmgray-border text-sm font-body text-charcoal disabled:opacity-30 disabled:cursor-not-allowed hover:border-terracotta hover:text-terracotta transition-colors"
              >
                {t('recommendations.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating compare button */}
      {selectedIds.length >= 2 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            size="lg"
            onClick={() =>
              navigate(`/compare?ids=${selectedIds.join(',')}`)
            }
          >
            {t('recommendations.compareButton')} ({selectedIds.length})
          </Button>
        </div>
      )}

      {/* Chat — always floating overlay, never takes grid space */}
      <ChatPanel
        currentResultIds={vehicles.map((v) => v.id)}
        aiSelectedCars={vehicles.filter((v) => aiSelectedIds.includes(v.id))}
      />
    </div>
  );
}
