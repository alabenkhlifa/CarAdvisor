import { useTranslation } from 'react-i18next';
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
      <div className="mx-auto max-w-4xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleClear}
          className="text-sm text-warmgray hover:text-terracotta transition-colors font-body"
        >
          {t('footer.clearData')}
        </button>

        <p className="text-xs text-warmgray font-body">
          &copy; {new Date().getFullYear()} CarAdvisor
        </p>
      </div>
    </footer>
  );
}
