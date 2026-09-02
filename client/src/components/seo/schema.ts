const SITE_URL = (import.meta.env.VITE_SITE_URL as string) || 'https://trailexplorer.com';
export const SITE_NAME = 'Trail Explorer';
export const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&q=80';
export { SITE_URL };

export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  description: 'Book shuttles, transfers and transportation across Central America.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+503 1234 5678',
    contactType: 'customer service',
    email: 'info@trailexplorer.com',
    availableLanguage: ['English', 'Spanish'],
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Salvador',
    addressCountry: 'SV',
  },
  sameAs: [],
};
