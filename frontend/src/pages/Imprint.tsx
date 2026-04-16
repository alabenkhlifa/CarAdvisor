import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function Imprint() {
  const { t } = useTranslation();
  return (
    <article className="prose prose-sm md:prose max-w-none">
      <SEO title={t('legal.imprint.title')} description={t('legal.imprint.lead')} />
      <h1 className="font-display text-4xl text-charcoal mb-4">
        {t('legal.imprint.title')}
      </h1>
      <p className="text-warmgray mb-6">{t('legal.imprint.lead')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.imprint.operatorTitle')}
      </h2>
      <p className="text-charcoal mb-4 whitespace-pre-line">
        {t('legal.imprint.operatorBody')}
      </p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.imprint.contactTitle')}
      </h2>
      <p className="text-charcoal mb-4 whitespace-pre-line">
        {t('legal.imprint.contactBody')}
      </p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.imprint.liabilityTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.imprint.liabilityBody')}</p>
    </article>
  );
}
