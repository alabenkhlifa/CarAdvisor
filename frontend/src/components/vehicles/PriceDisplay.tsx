import { useMemo } from 'react';

interface PriceDisplayProps {
  price: number;
  market: string;
  className?: string;
}

const currencyMap: Record<string, { currency: string; locale: string }> = {
  tn: { currency: 'TND', locale: 'fr-TN' },
  de: { currency: 'EUR', locale: 'de-DE' },
};

export default function PriceDisplay({
  price,
  market,
  className = '',
}: PriceDisplayProps) {
  const formatted = useMemo(() => {
    const config = currencyMap[market] ?? { currency: 'USD', locale: 'en-US' };
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, [price, market]);

  return (
    <span className={`font-display text-2xl text-terracotta ${className}`}>
      {formatted}
    </span>
  );
}
