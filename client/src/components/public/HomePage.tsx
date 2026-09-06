import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, Clock, MapPin, Shield, CreditCard, Headphones, Calendar, Loader2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { countriesApi, shuttlesApi, citiesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { SEO } from '../seo/SEO';
import { useLanguageStore } from '../../i18n';
import { translateRouteName, translateCountryName, translateCountryDescription, translateCityDescription } from '../../utils/shuttleTranslator';
import type { Country, Shuttle, City } from '../../types';

export const HomePage = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const features = [
    {
      icon: Calendar,
      title: t('home.easyPlanning'),
      description: t('home.easyPlanningDesc'),
    },
    {
      icon: Shield,
      title: t('home.securePayments'),
      description: t('home.securePaymentsDesc'),
    },
    {
      icon: CreditCard,
      title: t('home.flexibleOptions'),
      description: t('home.flexibleOptionsDesc'),
    },
    {
      icon: Headphones,
      title: t('home.support247'),
      description: t('home.support247Desc'),
    },
  ];

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [featuredShuttles, setFeaturedShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const citiesCarouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const location = useLocation();
  const isSearch = location.pathname === '/search';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, shuttlesRes, citiesRes] = await Promise.all([
          countriesApi.getAll(),
          shuttlesApi.getFeatured(),
          citiesApi.getAll(),
        ]);
        setCountries(countriesRes.data);
        setFeaturedShuttles(shuttlesRes.data);
        setCities(citiesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isPaused || !carouselRef.current) return;
    
    intervalRef.current = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollCities = (direction: 'left' | 'right') => {
    if (citiesCarouselRef.current) {
      const scrollAmount = 320;
      citiesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <SEO
        title="Book Shuttles Across Central America"
        description="Reserva shuttles, traslados y transporte en Centroamérica. Book the best shuttle transfers across Mexico, Guatemala, Costa Rica and more. Secure booking in minutes."
        path={isSearch ? '/search' : '/'}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trailexplorer.com/' },
            ],
          },
        ]}
      />
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80"
            alt="Central America"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/10" />
        </div>

        {/* Small logo badge in top right corner */}
        <div className="absolute top-3 right-3 sm:top-6 sm:right-6 lg:top-6 lg:right-8 z-10">
          <div className="bg-white/95 p-1.5 sm:p-2.5 rounded-2xl shadow-xl border border-white/50 ring-2 ring-black/5 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/logo.jpeg"
              alt="Trail Explorer Logo"
              className="w-16 sm:w-24 md:w-28 h-auto object-contain rounded-xl"
            />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 flex items-center justify-between">
          <div className="max-w-2xl text-left pr-24 sm:pr-32 md:pr-36 lg:pr-0">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight drop-shadow-lg break-words">
              {t('home.title')}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg lg:text-xl text-slate-100 drop-shadow-md max-w-xl">
              {t('home.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">{t('home.countries')}</h2>
              <p className="mt-1 text-slate-500">{t('home.countriesSubtitle')}</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 rounded-full border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 rounded-full border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {countries.map((country) => (
                <Link
                  key={country.slug}
                  to={`/countries/${country.slug}`}
                  className="flex-shrink-0 w-72 group"
                >
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={getImageUrl(country.image_url)}
                      alt={translateCountryName(country.name, language)}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold text-white mb-1">{translateCountryName(country.name, language)}</h3>
                      <p className="text-sm text-white/80 line-clamp-2 mb-3">{translateCountryDescription(country.description, country.name, language)}</p>
                      <span className="inline-flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        {t('home.explore')} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center sm:hidden">
            <p className="text-sm text-slate-500">{t('home.swipeMore')}</p>
          </div>
        </div>
      </section>

      {/* Sección de Ciudades y Destinos Populares */}
      {cities.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {language === 'es' ? 'Ciudades y Destinos Populares' : 'Popular Cities & Destinations'}
                </h2>
                <p className="mt-1 text-slate-500">
                  {language === 'es' ? 'Explora las principales ciudades conectadas por nuestras rutas de shuttle' : 'Discover top cities connected by our daily shuttle routes'}
                </p>
              </div>
              <div className="hidden sm:flex gap-2">
                <button
                  onClick={() => scrollCities('left')}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm"
                  aria-label="Previous cities"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollCities('right')}
                  className="p-2 rounded-full border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm"
                  aria-label="Next cities"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={citiesCarouselRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-4 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/cities/${city.slug}`}
                  className="flex-shrink-0 w-64 sm:w-72 group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 border border-slate-200/80 group-hover:border-emerald-500/50 flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={getImageUrl(city.image_url)}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                          {city.country_name || 'Centroamérica'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold text-lg leading-snug">{city.name}</h3>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {translateCityDescription(city.description, language)}
                      </p>
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700 pt-2 border-t border-slate-100">
                        <span>{language === 'es' ? 'Ver shuttles' : 'View shuttles'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 text-center sm:hidden">
              <p className="text-xs text-slate-500">{t('home.swipeMore')}</p>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">{t('home.topRoutes')}</h2>
            <p className="mt-2 text-slate-600">{t('home.topRoutesSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredShuttles.map((shuttle) => (
              <Link key={shuttle.id} to={`/shuttles/${shuttle.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                  <div className="relative h-40">
                    <img
                      src={getImageUrl(shuttle.image_url || (shuttle as any).destination_image || (shuttle as any).origin_image)}
                      alt={translateRouteName(shuttle.name, language)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const fallback = (shuttle as any).destination_image || (shuttle as any).origin_image;
                        if (fallback && target.src !== fallback) {
                          target.src = getImageUrl(fallback);
                        } else {
                          target.src = '/placeholder.jpg';
                        }
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        shuttle.service_type === 'international'
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {shuttle.service_type === 'international' ? t('shuttle.internationalService') : t('shuttle.localService')}
                      </span>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-1.5 text-sm text-amber-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-slate-800">{(Number(shuttle.rating) || 5.0).toFixed(1)}</span>
                      {Number(shuttle.review_count) > 0 && (
                        <span className="text-xs text-slate-400 font-normal">
                          ({shuttle.review_count} {language === 'es' ? 'reseñas' : 'reviews'})
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{translateRouteName(shuttle.name, language)}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{shuttle.origin_name}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{shuttle.destination_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">${shuttle.price}</span>
                        <span className="text-sm text-slate-500">{t('shuttle.perPerson')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{shuttle.duration_hours}h</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full">{t('home.viewDetailsAndBook')}</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">{t('home.whyBook')}</h2>
            <p className="mt-2 text-slate-600">{t('home.whyBookSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.readyToExplore')}</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            {t('home.readyToExploreSubtitle')}
          </p>
          <Link to="/countries/costa-rica">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
              {t('home.startSearching')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
