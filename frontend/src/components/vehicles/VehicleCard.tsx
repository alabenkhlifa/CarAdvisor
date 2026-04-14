import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Badge from '../ui/Badge';
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

  const handleCardClick = () => {
    navigate(`/car/${vehicle.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-surface rounded-2xl shadow-warm transition-all duration-200 ease-out hover:shadow-warm-hover hover:-translate-y-1 overflow-hidden cursor-pointer"
    >
      {/* Image */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient}`}>
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${brandName} ${modelName}`}
            className="absolute inset-0 w-full h-full object-cover"
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

        {/* AI select checkbox — top right */}
        <button
          onClick={(e) => { e.stopPropagation(); onAiSelectToggle(vehicle.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
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

      {/* Content */}
      <div className="p-5 space-y-3">
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
        <p className="font-display text-xl text-terracotta">{formattedPrice}</p>

        {/* Specs row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal/70 font-body">
          {vehicle.year && <span>{vehicle.year}</span>}
          {formattedMileage && <span>{formattedMileage}</span>}
          <span className="capitalize">{vehicle.fuelType}</span>
          <span className="capitalize">{vehicle.transmission}</span>
        </div>

        {/* Features */}
        {featureKeys.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {featureKeys.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="inline-block rounded-full bg-cream px-2.5 py-0.5 text-xs font-medium text-charcoal/70 font-body capitalize"
              >
                {feature.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2 border-t border-warmgray-border">
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

          <div className="flex items-center gap-3">
            {/* Favorite button */}
            <button
              onClick={(e) => { e.stopPropagation(); onFavoriteToggle(vehicle.id); }}
              className="p-1.5 rounded-full transition-colors hover:bg-peach/20"
              aria-label={t('vehicle.favorite')}
            >
              <svg
                className={`w-5 h-5 transition-colors ${
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
    </div>
  );
}
