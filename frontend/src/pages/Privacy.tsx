import { useTranslation, Trans } from 'react-i18next';
import SEO from '../components/SEO';

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <article className="prose prose-sm md:prose max-w-none">
      <SEO title={t('legal.privacy.title')} description={t('legal.privacy.lead')} />
      <h1 className="font-display text-4xl text-charcoal mb-4">
        {t('legal.privacy.title')}
      </h1>
      <p className="text-warmgray mb-6">{t('legal.privacy.lead')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.privacy.dataCollectedTitle')}
      </h2>
      <p className="text-charcoal mb-4">
        <Trans i18nKey="legal.privacy.dataCollectedBody" />
      </p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.privacy.thirdPartiesTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.privacy.thirdPartiesBody')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.privacy.retentionTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.privacy.retentionBody')}</p>

      <h2 className="font-display text-2xl text-charcoal mt-6 mb-2">
        {t('legal.privacy.rightsTitle')}
      </h2>
      <p className="text-charcoal mb-4">{t('legal.privacy.rightsBody')}</p>

      <p className="text-warmgray text-sm mt-8">
        {t('legal.privacy.lastUpdated', { date: '2026-04-16' })}
      </p>
    </article>
  );
}
