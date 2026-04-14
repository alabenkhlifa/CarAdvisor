import { useCallback, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (value: number) => string;
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatLabel = (v) => String(v),
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const minVal = value[0];
  const maxVal = value[1];

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), maxVal - step);
      onChange([newMin, maxVal]);
    },
    [maxVal, step, onChange],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), minVal + step);
      onChange([minVal, newMax]);
    },
    [minVal, step, onChange],
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-charcoal bg-peach px-3 py-1 rounded-full">
          {formatLabel(minVal)}
        </span>
        <span className="text-sm font-medium text-charcoal bg-peach px-3 py-1 rounded-full">
          {formatLabel(maxVal)}
        </span>
      </div>

      <div className="relative h-6" ref={trackRef}>
        {/* Base track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-warmgray-border" />

        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-terracotta"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="range-thumb absolute top-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: minVal > max - step * 2 ? 5 : 3 }}
        />

        {/* Max range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-thumb absolute top-0 w-full h-6 appearance-none bg-transparent pointer-events-none"
          style={{ zIndex: 4 }}
        />
      </div>

      <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #C4553A;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(26, 26, 26, 0.15);
          cursor: pointer;
          pointer-events: all;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .range-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 3px 8px rgba(26, 26, 26, 0.25);
        }
        .range-thumb::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        .range-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #C4553A;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(26, 26, 26, 0.15);
          cursor: pointer;
          pointer-events: all;
        }
      `}</style>
    </div>
  );
}
