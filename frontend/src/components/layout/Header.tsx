import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../store/useLanguage';
import { useMarket } from '../../store/useMarket';

const marketFlags: Record<string, string> = {
  tn: '\u{1F1F9}\u{1F1F3}',
  de: '\u{1F1E9}\u{1F1EA}',
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { market } = useMarket();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-warmgray-border">
      <div className="mx-auto max-w-4xl px-4 flex items-center justify-between h-14">
        {/* Left: App name */}
        <a href="/" className="flex items-center gap-1.5 group">
          <span className="w-2 h-2 rounded-full bg-terracotta inline-block group-hover:scale-125 transition-transform" />
          <span className="font-display text-xl text-charcoal">
            {t('header.appName')}
          </span>
        </a>

        {/* Right: Language toggle + market badge */}
        <div className="flex items-center gap-3">
          {/* Language dropdown */}
          <select
            value={language}
            onChange={(e) => {
              const next = e.target.value as 'en' | 'fr';
              setLanguage(next);
              i18n.changeLanguage(next);
            }}
            className="text-xs font-medium font-body bg-transparent border border-warmgray-border rounded-lg px-2 py-1.5 text-charcoal cursor-pointer focus:outline-none focus:border-terracotta transition-colors"
            aria-label="Select language"
          >
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
          </select>

          {/* Market badge */}
          {market && (
            <span className="text-lg leading-none" title={market}>
              {marketFlags[market] || market}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
