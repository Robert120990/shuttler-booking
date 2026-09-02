import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { countriesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { SEO } from '../seo/SEO';
import type { Country } from '../../types';

export const CountryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCountry = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const response = await countriesApi.getBySlug(slug);
        setCountry(response.data);
      } catch (err) {
        console.error('Error fetching country:', err);
        setError('Country not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [slug]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Country not found</h1>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const cities = (country as any).cities || [];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trailexplorer.com/' },
      { '@type': 'ListItem', position: 2, name: country.name, item: `https://trailexplorer.com/countries/${country.slug}` },
    ],
  };

  const citySchemas = cities.map((city: any) => ({
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${city.name}, ${country.name}`,
    description: city.description,
    image: getImageUrl((city as any).image_url),
    url: `https://trailexplorer.com/cities/${city.slug}`,
  }));

  return (
    <div>
      <SEO
        title={`Shuttles in ${country.name}`}
        description={country.description || `Book shuttles and transfers in ${country.name}. Find the best rates for transport within ${country.name} and to nearby countries.`}
        path={`/countries/${country.slug}`}
        image={getImageUrl(country.image_url)}
        jsonLd={[breadcrumbSchema, ...citySchemas]}
      />
      <section className="relative h-64 md:h-80">
        <img
          src={getImageUrl(country.image_url)}
          alt={country.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white">{country.name}</h1>
            <p className="mt-2 text-lg text-white/90">{country.description}</p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Main Cities</h2>
          {cities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city: any) => (
                <Link key={city.slug} to={`/cities/${city.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={getImageUrl((city as any).image_url)}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{city.name}</h3>
                          <p className="text-sm text-slate-500 mt-1">{city.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No cities available for this country yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
