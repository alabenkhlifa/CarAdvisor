import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Badge from '../ui/Badge';
import { CATEGORIES, categorizeFeature } from '../../lib/featureCategory';
import type { Vehicle } from '@shared/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isCompareSelected: boolean;
  isAiSelected: boolean;
  isFavorite: boolean;
  onCompareToggle: (id: number) => void;
  onAiSelectToggle: (id: number) => void;
  onFavoriteToggle: (id: number) => void;
}

const currencyMap: Record<string, { currency: string; locale: string }> = {
  tn: { currency: 'TND', locale: 'fr-TN' },
  de: { currency: 'EUR', locale: 'de-DE' },
};

const gradients = [
  'from-terracotta/20 to-peach/30',
  'from-sage/20 to-cream/40',
  'from-peach/30 to-terracotta/10',
  'from-warmgray/10 to-sage/20',
];

const fuelStyles: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
  electric: {
    bg: 'bg-sage/15',
    text: 'text-sage',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.69 2.21L4.33 11.49c-.64.58-.28 1.65.58 1.73L13 14l-4.85 6.76c-.22.31-.19.74.08 1.01.3.3.77.31 1.08.02l10.36-9.28c.64-.58.28-1.65-.58-1.73L11 10l4.85-6.76c.22-.31.19-.74-.08-1.01-.3-.3-.77-.31-1.08-.02z" />
      </svg>
    ),
  },
  hybrid: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 4.5 10.5 8.5 11 .33.04.67.04 1 0 4-.5 8.5-5.75 8.5-11 0-4.97-4.03-9-9-9zm0 13a4 4 0 110-8 4 4 0 010 8z" />
      </svg>
    ),
  },
  diesel: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ),
  },
  petrol: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ),
  },
  gasoline: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
      </svg>
    ),
  },
};

const defaultFuel = {
  bg: 'bg-warmgray/10',
  text: 'text-warmgray',
  icon: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z" />
    </svg>
  ),
};

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const GaugeIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14l3.5-3.5" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <path d="M4 18a8 8 0 1116 0" />
  </svg>
);

const AutomaticIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8M12 8v8" />
  </svg>
);

const ManualIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 5v14M12 5v14M18 5v14" />
    <circle cx="6" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="18" cy="5" r="1.5" fill="currentColor" />
    <circle cx="6" cy="19" r="1.5" fill="currentColor" />
    <circle cx="18" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

export default function VehicleCard({
  vehicle,
  isCompareSelected,
  isAiSelected,
  isFavorite,
  onCompareToggle,
  onAiSelectToggle,
  onFavoriteToggle,
}: VehicleCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const marketCode = vehicle.market?.code ?? 'tn';
  const gradient = gradients[vehicle.id % gradients.length];

  const formattedPrice = useMemo(() => {
    const config = currencyMap[marketCode] ?? {
      currency: 'USD',
      locale: 'en-US',
    };
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(vehicle.price);
  }, [vehicle.price, marketCode]);

  const formattedMileage = vehicle.mileageKm
    ? `${vehicle.mileageKm.toLocaleString()} ${t('vehicle.km')}`
    : null;

  const brandName = vehicle.model?.brand?.name ?? '';
  const modelName = vehicle.model?.name ?? '';

  const featureKeys = vehicle.features
    ? Object.keys(vehicle.features).filter((k) => vehicle.features![k])
    : [];

  const isPopulaire = useMemo(() => {
    const haystack = `${brandName} ${modelName} ${vehicle.trimName ?? ''}`.toLowerCase();
    return haystack.includes('populaire');
  }, [brandName, modelName, vehicle.trimName]);

  const sourceInfo = useMemo(() => {
    const sid = vehicle.sourceId ?? '';
    if (sid.startsWith('tn-9annas')) return { label: '9annas.tn', color: 'bg-emerald-500/90 text-white' };
    if (sid.startsWith('tn-used') || sid.startsWith('tn-new')) return { label: 'automobile.tn', color: 'bg-blue-500/90 text-white' };
    if (sid.startsWith('de-')) return { label: 'autoscout24.de', color: 'bg-amber-500/90 text-white' };
    try {
      if (vehicle.sourceUrl) return { label: new URL(vehicle.sourceUrl).hostname.replace(/^www\./, ''), color: 'bg-charcoal/80 text-white' };
    } catch {}
    return null;
  }, [vehicle.sourceId, vehicle.sourceUrl]);

  const handleCardClick = () => {
    navigate(`/car/${vehicle.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-surface rounded-2xl shadow-warm transition-all duration-200 ease-out hover:shadow-warm-hover hover:-translate-y-1 overflow-hidden cursor-pointer h-full flex flex-col"
    >
      {/* Image */}
      <div className={`relative aspect-[16/10] ${vehicle.imageUrl ? 'bg-surface' : `bg-gradient-to-br ${gradient}`}`}>
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${brandName} ${modelName}`}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-charcoal/10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={vehicle.condition === 'new' ? 'success' : 'default'}>
            {vehicle.condition === 'new'
              ? t('vehicle.new')
              : t('vehicle.used')}
          </Badge>
        </div>

        {/* Bottom row: source badge (left) + populaire badge (right) */}
        {(sourceInfo || isPopulaire) && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            {sourceInfo ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide backdrop-blur-sm shadow-sm ${sourceInfo.color}`}
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {sourceInfo.label}
              </span>
            ) : (
              <span />
            )}
            {isPopulaire && (
              <span
                title="Voiture populaire — fiscalité réduite"
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-sm ring-1 ring-amber-300/60"
              >
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.39 6.95h7.31l-5.9 4.29 2.25 6.95L12 15.9l-6.05 4.29 2.25-6.95-5.9-4.29h7.31z" />
                </svg>
                Populaire
              </span>
            )}
          </div>
        )}

        {/* Top-right actions: favorite + AI select */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(vehicle.id); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface/80 hover:bg-surface transition-colors"
            aria-label={t('vehicle.favorite')}
          >
            <svg
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'text-terracotta fill-terracotta'
                  : 'text-warmgray hover:text-terracotta'
              }`}
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAiSelectToggle(vehicle.id); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isAiSelected
                ? 'bg-terracotta text-white shadow-warm'
                : 'bg-surface/80 text-warmgray hover:bg-surface hover:text-terracotta'
            }`}
            aria-label="Select for AI"
            title="Ask AI about this car"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 gap-3 flex-1 flex flex-col">
        {/* Title */}
        <div>
          <h3 className="font-display text-lg text-charcoal leading-tight">
            {brandName} {modelName}
          </h3>
          {vehicle.trimName && (
            <p className="text-sm text-warmgray font-body mt-0.5">
              {vehicle.trimName}
            </p>
          )}
        </div>

        {/* Price */}
        <p className="font-display text-2xl text-terracotta leading-none">{formattedPrice}</p>

        {/* Badges row: fuel + transmission + year */}
        <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
          {vehicle.fuelType && (() => {
            const style = fuelStyles[vehicle.fuelType.toLowerCase()] ?? defaultFuel;
            return (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap ${style.bg} ${style.text}`}>
                <span className="[&>svg]:w-3 [&>svg]:h-3">{style.icon}</span>
                {vehicle.fuelType}
              </span>
            );
          })()}
          {vehicle.transmission && (
            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/5 px-2 py-0.5 text-[11px] font-medium text-charcoal/80 capitalize whitespace-nowrap">
              <span className="[&>svg]:w-3 [&>svg]:h-3">
                {vehicle.transmission.toLowerCase() === 'automatic' ? <AutomaticIcon /> : <ManualIcon />}
              </span>
              {vehicle.transmission}
            </span>
          )}
          {vehicle.year && (
            <span className="inline-flex items-center gap-1 rounded-full bg-peach/40 px-2 py-0.5 text-[11px] font-medium text-terracotta whitespace-nowrap">
              <span className="[&>svg]:w-3 [&>svg]:h-3"><CalendarIcon /></span>
              {vehicle.year}
            </span>
          )}
        </div>

        {/* Mileage */}
        {formattedMileage && (
          <div className="flex items-center gap-1.5 text-sm text-charcoal/70 font-body">
            <GaugeIcon />
            {formattedMileage}
          </div>
        )}

        {/* Features — capped at 3 chips + always-visible "+N" */}
        {featureKeys.length > 0 && (() => {
          const visible = featureKeys.length > 3 ? featureKeys.slice(0, 3) : featureKeys;
          const remaining = featureKeys.length - visible.length;
          return (
            <div className="flex flex-wrap gap-1">
              {visible.map((feature) => {
                const cat = CATEGORIES[categorizeFeature(feature)];
                return (
                  <span
                    key={feature}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium font-body whitespace-nowrap ${cat.chip}`}
                  >
                    {cat.icon}
                    {feature.replace(/_/g, ' ')}
                  </span>
                );
              })}
              {remaining > 0 && (
                <span className="inline-flex items-center rounded-full bg-cream px-2 py-0.5 text-[11px] font-medium text-charcoal/70 font-body whitespace-nowrap">
                  +{remaining}
                </span>
              )}
            </div>
          );
        })()}

        {/* Actions row */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-warmgray-border">
          {/* Compare checkbox */}
          <label
            className="flex items-center gap-2 cursor-pointer text-sm font-body text-charcoal/70 hover:text-charcoal transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isCompareSelected}
              onChange={() => onCompareToggle(vehicle.id)}
              className="w-4 h-4 rounded border-warmgray-border text-terracotta focus:ring-terracotta/30"
            />
            {t('vehicle.compare')}
          </label>

          {/* View details */}
          <Link
            to={`/car/${vehicle.id}`}
            className="text-sm font-medium text-terracotta hover:text-terracotta-hover transition-colors font-body"
          >
            {t('vehicle.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
}
