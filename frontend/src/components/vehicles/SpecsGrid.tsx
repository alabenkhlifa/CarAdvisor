import { useTranslation } from 'react-i18next';
import type { Vehicle } from '@shared/types';

interface SpecsGridProps {
  vehicle: Vehicle;
}

function formatMileage(km: number | null): string {
  if (km === null) return '--';
  return `${km.toLocaleString()} km`;
}

export default function SpecsGrid({ vehicle }: SpecsGridProps) {
  const { t } = useTranslation();

  const specs = [
    { label: t('vehicle.year'), value: vehicle.year ?? '--' },
    { label: t('vehicle.mileage'), value: formatMileage(vehicle.mileageKm) },
    { label: t('vehicle.fuel'), value: vehicle.fuelType },
    { label: t('vehicle.transmission'), value: vehicle.transmission },
    { label: t('vehicle.engine'), value: vehicle.engineSize ?? '--' },
    {
      label: t('vehicle.horsepower'),
      value: vehicle.horsepower ? `${vehicle.horsepower} HP` : '--',
    },
    { label: t('vehicle.color'), value: vehicle.color ?? '--' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {specs.map((spec) => (
        <div key={spec.label} className="space-y-1">
          <p className="text-sm font-medium text-warmgray font-body">
            {spec.label}
          </p>
          <p className="text-base font-semibold text-charcoal font-body capitalize">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
