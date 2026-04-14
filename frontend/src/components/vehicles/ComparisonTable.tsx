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

type CompareDirection = 'lower' | 'higher' | null;

type RowDef = {
  label: string;
  getValue: (v: Vehicle) => string;
  getNumeric?: (v: Vehicle) => number | null;
  // 'lower' = smaller value is better (price, mileage, cvFiscal)
  // 'higher' = bigger value is better (year, horsepower)
  // null = not comparable (body type, color, etc.)
  compare?: CompareDirection;
};

export default function ComparisonTable({
  vehicles,
  onRemove,
}: ComparisonTableProps) {
  const { t } = useTranslation();

  const rows: RowDef[] = [
    {
      label: t('vehicle.bodyType'),
      getValue: (v) => v.model?.bodyType ?? '--',
    },
    {
      label: t('vehicle.price'),
      getValue: (v) => formatPrice(v.price, v.market?.code ?? 'tn'),
      getNumeric: (v) => Number(v.price),
      compare: 'lower',
    },
    {
      label: t('vehicle.year'),
      getValue: (v) => (v.year ? String(v.year) : '--'),
      getNumeric: (v) => v.year,
      compare: 'higher',
    },
    {
      label: t('vehicle.condition'),
      getValue: (v) =>
        v.condition === 'new' ? t('vehicle.new') : t('vehicle.used'),
    },
    {
      label: t('vehicle.mileage'),
      getValue: (v) => formatMileage(v.mileageKm),
      getNumeric: (v) => v.mileageKm,
      compare: 'lower',
    },
    { label: t('vehicle.fuel'), getValue: (v) => v.fuelType },
    { label: t('vehicle.transmission'), getValue: (v) => v.transmission },
    { label: t('vehicle.engine'), getValue: (v) => v.engineSize ?? '--' },
    {
      label: t('vehicle.horsepower'),
      getValue: (v) => (v.horsepower ? `${v.horsepower} HP` : '--'),
      getNumeric: (v) => v.horsepower,
      compare: 'higher',
    },
    {
      label: t('vehicle.cvFiscal'),
      getValue: (v) => (v.cvFiscal ? `${v.cvFiscal} CV` : '--'),
      getNumeric: (v) => v.cvFiscal,
      compare: 'lower',
    },
    { label: t('vehicle.color'), getValue: (v) => v.color ?? '--' },
  ];

  function getBestIds(row: RowDef): Set<number> {
    const best = new Set<number>();
    if (!row.compare || !row.getNumeric || vehicles.length < 2) return best;

    const entries = vehicles
      .map((v) => ({ id: v.id, value: row.getNumeric!(v) }))
      .filter((e): e is { id: number; value: number } => e.value !== null);

    if (entries.length < 2) return best;

    const bestValue =
      row.compare === 'lower'
        ? Math.min(...entries.map((e) => e.value))
        : Math.max(...entries.map((e) => e.value));

    // Only highlight if there's actually a difference between values
    const allSame = entries.every((e) => e.value === entries[0].value);
    if (allSame) return best;

    entries.forEach((e) => {
      if (e.value === bestValue) best.add(e.id);
    });

    return best;
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
            const bestIds = getBestIds(row);
            return (
              <tr
                key={row.label}
                className="border-b border-warmgray-border/50 last:border-b-0"
              >
                <td className="p-4 text-sm font-medium text-warmgray font-body">
                  {row.label}
                </td>
                {vehicles.map((v) => {
                  const isBest = bestIds.has(v.id);
                  return (
                    <td
                      key={v.id}
                      className={`p-4 text-sm font-body capitalize ${
                        isBest
                          ? 'text-sage font-semibold bg-sage/5'
                          : 'text-charcoal'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {row.getValue(v)}
                        {isBest && (
                          <svg
                            className="w-3.5 h-3.5 text-sage"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
