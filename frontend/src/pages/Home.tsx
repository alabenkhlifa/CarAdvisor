import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../store/useMarket';
import { usePreferences } from '../store/usePreferences';
import type { BodyType } from '@shared/types';
import RangeSlider from '../components/ui/RangeSlider';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const bodyTypes: BodyType[] = ['sedan', 'suv', 'hatchback', 'minivan', 'coupe', 'wagon'];
const fuelTypes = ['petrol', 'diesel', 'hybrid', 'electric'] as const;
const conditions = ['new', 'used', 'both'] as const;
const transmissions = ['manual', 'automatic', 'any'] as const;

const marketConfig: Record<string, { min: number; max: number; step: number; currency: string; format: (v: number) => string }> = {
  tn: {
    min: 10000,
    max: 200000,
    step: 5000,
    currency: 'TND',
    format: (v: number) => `${v.toLocaleString('en')} TND`,
  },
  de: {
    min: 5000,
    max: 80000,
    step: 1000,
    currency: 'EUR',
    format: (v: number) => `${v.toLocaleString('en')} \u20AC`,
  },
};

const marketFlags: Record<string, string> = {
  tn: '\u{1F1F9}\u{1F1F3}',
  de: '\u{1F1E9}\u{1F1EA}',
};

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { market } = useMarket();
  const { preferences, setPreferences } = usePreferences();

  // Redirect to landing if no market
  useEffect(() => {
    if (!market) {
      navigate('/', { replace: true });
    }
  }, [market, navigate]);

  const config = marketConfig[market || 'tn'];

  // Local form state
  const [budget, setBudget] = useState<[number, number]>([
    preferences.budgetMin ?? config.min,
    preferences.budgetMax ?? config.max,
  ]);
  const [condition, setCondition] = useState<'new' | 'used' | 'both'>(
    preferences.condition ?? 'both',
  );
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<BodyType[]>(
    preferences.bodyType ? [preferences.bodyType] : [],
  );
  const [fuelType, setFuelType] = useState<string | null>(preferences.fuelType);
  const [transmission, setTransmission] = useState<'manual' | 'automatic' | null>(
    preferences.transmission,
  );

  const toggleBodyType = useCallback((bt: BodyType) => {
    setSelectedBodyTypes((prev) =>
      prev.includes(bt) ? prev.filter((b) => b !== bt) : [...prev, bt],
    );
  }, []);

  const handleSubmit = () => {
    setPreferences({
      budgetMin: budget[0],
      budgetMax: budget[1],
      condition,
      bodyType: selectedBodyTypes.length === 1 ? selectedBodyTypes[0] : null,
      fuelType,
      transmission: transmission === 'any' ? null : transmission,
    });
    navigate('/recommendations');
  };

  if (!market) return null;

  return (
    <div className="pb-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-display text-3xl sm:text-4xl text-charcoal">
            {t('home.title')}
          </h1>
          <span className="text-xl" title={market}>
            {marketFlags[market]}
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Budget */}
        <section>
          <h2 className="font-body font-semibold text-base text-charcoal mb-4">
            {t('home.budget')}
          </h2>
          <RangeSlider
            min={config.min}
            max={config.max}
            step={config.step}
            value={budget}
            onChange={setBudget}
            formatLabel={config.format}
          />
        </section>

        {/* Condition */}
        <section>
          <h2 className="font-body font-semibold text-base text-charcoal mb-3">
            {t('home.condition')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <button
                key={c}
                onClick={() => setCondition(c)}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium font-body
                  transition-all duration-150 border
                  ${
                    condition === c
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-surface text-charcoal border-warmgray-border hover:border-warmgray'
                  }
                `}
              >
                {t(`home.condition${c.charAt(0).toUpperCase() + c.slice(1)}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Body Type */}
        <section>
          <h2 className="font-body font-semibold text-base text-charcoal mb-3">
            {t('home.bodyType')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {bodyTypes.map((bt) => {
              const isSelected = selectedBodyTypes.includes(bt);
              return (
                <button
                  key={bt}
                  onClick={() => toggleBodyType(bt)}
                  className={`
                    rounded-xl border-2 px-4 py-3
                    text-sm font-medium font-body text-center
                    transition-all duration-150
                    ${
                      isSelected
                        ? 'border-terracotta bg-peach text-terracotta'
                        : 'border-warmgray-border bg-surface text-charcoal hover:border-warmgray'
                    }
                  `}
                >
                  {t(`bodyTypes.${bt}`)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Fuel Type */}
        <section>
          <h2 className="font-body font-semibold text-base text-charcoal mb-3">
            {t('home.fuelType')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {fuelTypes.map((ft) => (
              <button
                key={ft}
                onClick={() => setFuelType(fuelType === ft ? null : ft)}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium font-body
                  transition-all duration-150 border
                  ${
                    fuelType === ft
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-surface text-charcoal border-warmgray-border hover:border-warmgray'
                  }
                `}
              >
                {t(`fuelTypes.${ft}`)}
              </button>
            ))}
          </div>
        </section>

        {/* Transmission */}
        <section>
          <h2 className="font-body font-semibold text-base text-charcoal mb-3">
            {t('home.transmission')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {transmissions.map((tr) => {
              const isActive =
                tr === 'any'
                  ? transmission === null
                  : transmission === tr;
              return (
                <button
                  key={tr}
                  onClick={() => setTransmission(tr === 'any' ? null : tr)}
                  className={`
                    px-5 py-2 rounded-full text-sm font-medium font-body
                    transition-all duration-150 border
                    ${
                      isActive
                        ? 'bg-terracotta text-white border-terracotta'
                        : 'bg-surface text-charcoal border-warmgray-border hover:border-warmgray'
                    }
                  `}
                >
                  {t(`home.transmission${tr.charAt(0).toUpperCase() + tr.slice(1)}`)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
          >
            {t('home.findCars')}
          </Button>
        </div>
      </div>
    </div>
  );
}
