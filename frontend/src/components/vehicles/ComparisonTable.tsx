import { useTranslation } from 'react-i18next';
import type { Vehicle } from '@shared/types';

interface ComparisonTableProps {
  vehicles: Vehicle[];
  onRemove?: (id: number) => void;
}

const currencyMap: Record<string, { currency: string; locale: string }> = {
  tn: { currency: 'TND', locale: 'fr-TN' },
  de: { currency: 'EUR', locale: 'de-DE' },
};

function formatPrice(price: number, marketCode: string): string {
  const config = currencyMap[marketCode] ?? { currency: 'USD', locale: 'en-US' };
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatMileage(km: number | null): string {
  if (km === null) return '--';
  return `${km.toLocaleString()} km`;
}

export default function ComparisonTable({
  vehicles,
  onRemove,
}: ComparisonTableProps) {
  const { t } = useTranslation();

  type RowDef = {
    label: string;
    getValue: (v: Vehicle) => string;
  };

  const rows: RowDef[] = [
    {
      label: `${t('vehicle.bodyType')}`,
      getValue: (v) => v.model?.bodyType ?? '--',
    },
    {
      label: t('vehicle.price'),
      getValue: (v) => formatPrice(v.price, v.market?.code ?? 'tn'),
    },
    { label: t('vehicle.year'), getValue: (v) => String(v.year) },
    {
      label: t('vehicle.condition'),
      getValue: (v) =>
        v.condition === 'new' ? t('vehicle.new') : t('vehicle.used'),
    },
    {
      label: t('vehicle.mileage'),
      getValue: (v) => formatMileage(v.mileageKm),
    },
    { label: t('vehicle.fuel'), getValue: (v) => v.fuelType },
    { label: t('vehicle.transmission'), getValue: (v) => v.transmission },
    {
      label: t('vehicle.engine'),
      getValue: (v) => v.engineSize ?? '--',
    },
    {
      label: t('vehicle.horsepower'),
      getValue: (v) => (v.horsepower ? `${v.horsepower} HP` : '--'),
    },
    { label: t('vehicle.color'), getValue: (v) => v.color ?? '--' },
  ];

  function isDifferent(row: RowDef): boolean {
    if (vehicles.length < 2) return false;
    const values = vehicles.map((v) => row.getValue(v));
    return values.some((val) => val !== values[0]);
  }

  return (
    <div className="overflow-x-auto rounded-2xl shadow-warm bg-surface">
      <table className="w-full text-left">
        {/* Header: vehicle names + remove buttons */}
        <thead>
          <tr className="border-b border-warmgray-border">
            <th className="p-4 font-body font-medium text-warmgray text-sm min-w-[140px]">
              {t('compare.vs')}
            </th>
            {vehicles.map((v) => (
              <th key={v.id} className="p-4 min-w-[180px]">
                <div className="space-y-1">
                  <p className="font-display text-base text-charcoal">
                    {v.model?.brand?.name} {v.model?.name}
                  </p>
                  {v.trimName && (
                    <p className="text-xs text-warmgray font-body">
                      {v.trimName}
                    </p>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(v.id)}
                      className="text-xs text-terracotta hover:text-terracotta-hover font-body mt-1 transition-colors"
                    >
                      {t('compare.remove')}
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const highlight = isDifferent(row);
            return (
              <tr
                key={row.label}
                className="border-b border-warmgray-border/50 last:border-b-0"
              >
                <td className="p-4 text-sm font-medium text-warmgray font-body">
                  {row.label}
                </td>
                {vehicles.map((v) => (
                  <td
                    key={v.id}
                    className={`p-4 text-sm font-body capitalize ${
                      highlight
                        ? 'text-terracotta font-semibold'
                        : 'text-charcoal'
                    }`}
                  >
                    {row.getValue(v)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
