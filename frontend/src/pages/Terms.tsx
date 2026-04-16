import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function Terms() {
  const { t } = useTranslation();
  return (
    <article className="prose prose-sm md:prose max-w-none">
      <SEO title={t('legal.terms.title')} description={t('legal.terms.lead')} />
      <h1 className="font-display text-4xl text-charcoal mb-4">
        {t('legal.terms.title')}
      </h1>
      <p className="text-warmgray mb-6">{t('legal.terms.lead')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.terms.useTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.terms.useBody')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.terms.accuracyTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.terms.accuracyBody')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.terms.liabilityTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.terms.liabilityBody')}</p>

      <p className="text-warmgray text-sm mt-8">
        {t('legal.terms.lastUpdated', { date: '2026-04-16' })}
      </p>
    </article>
  );
}
