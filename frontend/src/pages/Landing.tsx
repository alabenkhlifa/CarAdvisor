import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../store/useMarket';
import { useLanguage } from '../store/useLanguage';

const markets = [
  {
    id: 'tn',
    flag: '\u{1F1F9}\u{1F1F3}',
    nameKey: 'landing.tunisia',
    descKey: 'landing.tunisiaDesc',
    accent: 'border-l-terracotta',
  },
  {
    id: 'de',
    flag: '\u{1F1E9}\u{1F1EA}',
    nameKey: 'landing.germany',
    descKey: 'landing.germanyDesc',
    accent: 'border-l-sage',
  },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setMarket } = useMarket();
  const { language, setLanguage } = useLanguage();

  const handleSelectMarket = (marketId: string) => {
    setMarket(marketId);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cream relative overflow-hidden">
      {/* Decorative curved road SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
        viewBox="0 0 800 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-100 400 C100 350, 200 200, 400 250 S600 400, 900 200"
          stroke="#C4553A"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M-50 500 C150 420, 300 300, 450 350 S650 450, 850 300"
          stroke="#6B8F71"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Title section */}
      <div className="text-center mb-12 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
          <h1 className="font-display text-5xl sm:text-6xl text-charcoal">
            {t('landing.title')}
          </h1>
        </div>
        <p className="font-body text-lg sm:text-xl text-warmgray font-light tracking-wide">
          {t('landing.tagline')}
        </p>
      </div>

      {/* Market cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-xl relative z-10">
        {markets.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelectMarket(m.id)}
            className={`
              group bg-surface rounded-2xl shadow-warm
              border-l-4 ${m.accent}
              min-h-[12rem] p-8
              flex flex-col items-center justify-center gap-3
              text-center
              transition-all duration-200 ease-out
              hover:shadow-warm-hover hover:-translate-y-1
              active:scale-[0.98]
              cursor-pointer
            `}
          >
            <span className="text-5xl leading-none">{m.flag}</span>
            <h2 className="font-display text-2xl text-charcoal">
              {t(m.nameKey)}
            </h2>
            <p className="font-body text-sm text-warmgray">
              {t(m.descKey)}
            </p>
          </button>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
        <select
          value={language}
          onChange={(e) => {
            const next = e.target.value as 'en' | 'fr';
            setLanguage(next);
            i18n.changeLanguage(next);
          }}
          className="text-sm text-warmgray bg-surface border border-warmgray-border rounded-xl px-4 py-2 font-body cursor-pointer focus:outline-none focus:border-terracotta transition-colors appearance-none pr-8"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          <option value="en">🇬🇧 English</option>
          <option value="fr">🇫🇷 Français</option>
        </select>
        <p className="text-xs text-warmgray/60 font-body">
          {t('landing.poweredBy')}
        </p>
      </div>
    </div>
  );
}
