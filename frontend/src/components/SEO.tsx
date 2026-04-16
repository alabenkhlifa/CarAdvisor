import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
}

const DEFAULT_TITLE = 'CarAdvisor — find your perfect car';
const DEFAULT_DESCRIPTION =
  'Find and compare new and used cars in Tunisia and Germany with AI-powered recommendations.';

export default function SEO({ title, description }: SEOProps) {
  const fullTitle = title ? `${title} · CarAdvisor` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
    </Helmet>
  );
}
