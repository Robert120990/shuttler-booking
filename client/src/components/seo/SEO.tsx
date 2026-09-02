import { Helmet } from 'react-helmet-async';
import { SITE_URL, SITE_NAME, DEFAULT_IMAGE } from './schema';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
  jsonLd?: object[];
  noindex?: boolean;
}

export const SEO = ({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd = [],
  noindex = false,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <link rel="canonical" href={url} />

      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="es" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="es_ES" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
