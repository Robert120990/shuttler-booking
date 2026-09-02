import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowRight, Shield, CreditCard, Headphones, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { countriesApi, shuttlesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { SEO } from '../seo/SEO';
import type { Country, Shuttle } from '../../types';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Easy Planning',
    description: 'Change dates and schedules easily or switch to a different service.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Choose from a variety of secure payment methods.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Options',
    description: 'Credit/debit cards and digital wallets accepted.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Contact us anytime via chat or email.',
  },
];

export const HomePage = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [featuredShuttles, setFeaturedShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const location = useLocation();
  const isSearch = location.pathname === '/search';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, shuttlesRes] = await Promise.all([
          countriesApi.getAll(),
          shuttlesApi.getFeatured(),
        ]);
        setCountries(countriesRes.data);
        setFeaturedShuttles(shuttlesRes.data);
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
      <section className="relative text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80"
            alt="Central America"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Explore Central America
            </h1>
            <p className="mt-6 text-xl text-emerald-100">
              Book shuttles, transfers and transportation across 8 countries. Your adventure starts with a single booking.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/countries/costa-rica">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50">
                  Search Routes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/countries/costa-rica">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Explore Costa Rica
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Countries</h2>
              <p className="mt-1 text-slate-500">Explore Central America</p>
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
                      alt={country.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold text-white mb-1">{country.name}</h3>
                      <p className="text-sm text-white/80 line-clamp-2 mb-3">{country.description}</p>
                      <span className="inline-flex items-center text-sm font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors">
                        Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center sm:hidden">
            <p className="text-sm text-slate-500">Swipe to see more destinations</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Top Rated Routes</h2>
            <p className="mt-2 text-slate-600">Popular shuttles booked by travelers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredShuttles.map((shuttle) => (
              <Link key={shuttle.id} to={`/shuttles/${shuttle.slug}`} className="block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                  <div className="relative h-40">
                    <img
                      src={getImageUrl(shuttle.image_url)}
                      alt={shuttle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        shuttle.service_type === 'international'
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {shuttle.service_type === 'international' ? 'International' : 'Local'}
                      </span>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{shuttle.rating || 5.0}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{shuttle.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{shuttle.origin_name}</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>{shuttle.destination_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-emerald-600">${shuttle.price}</span>
                        <span className="text-sm text-slate-500">/person</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>{shuttle.duration_hours}h</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full">View Details & Book</Button>
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
            <h2 className="text-3xl font-bold text-slate-900">Why Book With Us?</h2>
            <p className="mt-2 text-slate-600">Everything you need for a stress-free trip</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature) => (
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
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Find and book your route in minutes. Your next adventure is just a click away.
          </p>
          <Link to="/countries/costa-rica">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
              Start Searching
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
