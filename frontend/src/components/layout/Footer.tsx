import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useClearAll } from '../../store/useClearAll';

export default function Footer() {
  const { t } = useTranslation();
  const { clearAll } = useClearAll();

  const handleClear = () => {
    if (window.confirm(t('common.clearConfirm'))) {
      clearAll();
    }
  };

  return (
    <footer className="bg-warmgray-border/40 border-t border-warmgray-border">
      <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <button
          onClick={handleClear}
          className="text-sm text-warmgray hover:text-terracotta transition-colors font-body"
        >
          {t('footer.clearData')}
        </button>

        <nav className="flex items-center gap-4 text-xs text-warmgray font-body">
          <Link to="/privacy" className="hover:text-terracotta transition-colors">
            {t('footer.privacy')}
          </Link>
          <Link to="/terms" className="hover:text-terracotta transition-colors">
            {t('footer.terms')}
          </Link>
          <Link to="/imprint" className="hover:text-terracotta transition-colors">
            {t('footer.imprint')}
          </Link>
        </nav>

        <p className="text-xs text-warmgray font-body">
          &copy; {new Date().getFullYear()} CarAdvisor
        </p>
      </div>
    </footer>
  );
}
