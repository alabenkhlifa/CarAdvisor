import { useTranslation } from 'react-i18next';

export default function StreamingDots() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <span className="text-xs text-warmgray font-body mr-1">{t('chat.thinking')}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-warmgray/60 animate-[pulse_1.4s_ease-in-out_infinite]" />
      <span className="w-1.5 h-1.5 rounded-full bg-warmgray/60 animate-[pulse_1.4s_ease-in-out_0.2s_infinite]" />
      <span className="w-1.5 h-1.5 rounded-full bg-warmgray/60 animate-[pulse_1.4s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}
