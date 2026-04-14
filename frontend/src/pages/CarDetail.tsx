import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVehicle } from '../hooks/useVehicle';
import PriceDisplay from '../components/vehicles/PriceDisplay';
import SpecsGrid from '../components/vehicles/SpecsGrid';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const gradients = [
  'from-terracotta/20 to-peach/30',
  'from-sage/20 to-cream/40',
  'from-peach/30 to-terracotta/10',
  'from-warmgray/10 to-sage/20',
];

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { vehicle, loading, error } = useVehicle(Number(id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-warmgray font-body">
          {error ?? 'Vehicle not found'}
        </p>
        <Link
          to="/recommendations"
          className="text-terracotta hover:text-terracotta-hover font-body font-medium transition-colors"
        >
          {t('carDetail.backToResults')}
        </Link>
      </div>
    );
  }

  const brandName = vehicle.model?.brand?.name ?? '';
  const modelName = vehicle.model?.name ?? '';
  const marketCode = vehicle.market?.code ?? 'tn';
  const gradient = gradients[vehicle.id % gradients.length];

  const featureKeys = vehicle.features
    ? Object.keys(vehicle.features).filter((k) => vehicle.features![k])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/recommendations"
        className="inline-flex items-center gap-1.5 text-sm text-warmgray hover:text-charcoal font-body transition-colors"
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
        {t('carDetail.backToResults')}
      </Link>

      {/* Hero image */}
      <div
        className={`relative w-full h-64 sm:h-96 rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden`}
      >
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${brandName} ${modelName}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-24 h-24 text-charcoal/10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-4 left-4">
          <Badge variant={vehicle.condition === 'new' ? 'success' : 'default'}>
            {vehicle.condition === 'new'
              ? t('vehicle.new')
              : t('vehicle.used')}
          </Badge>
        </div>
      </div>

      {/* Title + Price */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl text-charcoal">
          {brandName} {modelName}
          {vehicle.trimName && (
            <span className="text-warmgray"> {vehicle.trimName}</span>
          )}
        </h1>
        <PriceDisplay price={vehicle.price} market={marketCode} />
      </div>

      {/* Specs */}
      <div className="space-y-3">
        <h2 className="font-display text-xl text-charcoal">
          {t('carDetail.specs')}
        </h2>
        <div className="bg-surface rounded-2xl p-6 shadow-warm">
          <SpecsGrid vehicle={vehicle} />
        </div>
      </div>

      {/* Features */}
      {featureKeys.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-xl text-charcoal">
            {t('carDetail.features')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {featureKeys.map((feature) => (
              <Badge key={feature}>
                {feature.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* View original listing */}
      {vehicle.sourceUrl && (
        <div>
          <a
            href={vehicle.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary">
              {t('carDetail.viewListing')}
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
