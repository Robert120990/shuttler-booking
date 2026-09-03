import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Calendar, MapPin, Bus, Compass, Navigation, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { countriesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { SEO } from '../seo/SEO';
import type { Country, Shuttle } from '../../types';

interface ShuttleCardProps {
  shuttle: Shuttle;
}

const ShuttleCard = ({ shuttle }: ShuttleCardProps) => (
  <Link to={`/shuttles/${shuttle.slug}`} className="block h-full group">
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-slate-200/80 hover:border-emerald-500/50">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img 
          src={getImageUrl(shuttle.image_url)} 
          alt={shuttle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 right-3 z-10">
          <Badge variant={shuttle.service_type === 'international' ? 'warning' : 'success'}>
            {shuttle.service_type === 'international' ? 'Internacional' : 'Local'}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 text-xs text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-semibold">{shuttle.rating || 5.0}</span>
          <span className="text-white/70">({shuttle.review_count || 12})</span>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
            {shuttle.name}
          </h3>
          
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{shuttle.duration_hours}h de viaje</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{shuttle.schedule || 'Todos los días'}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <p className="text-xs text-slate-400 font-medium">Desde</p>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-emerald-600">${shuttle.price}</span>
              <span className="text-xs text-slate-500 font-medium">USD /pers</span>
            </div>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const CountryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [departureShuttles, setDepartureShuttles] = useState<Shuttle[]>([]);
  const [arrivalShuttles, setArrivalShuttles] = useState<Shuttle[]>([]);
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals' | 'cities'>('departures');
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
        setDepartureShuttles((response.data as any).departureShuttles || []);
        setArrivalShuttles((response.data as any).arrivalShuttles || []);
      } catch (err) {
        console.error('Error fetching country:', err);
        setError('País no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-slate-900">País no encontrado</h1>
          <p className="text-slate-500 mt-2">El destino solicitado no está disponible.</p>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block font-medium">
            Volver al Inicio
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
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://trailexplorer.com/' },
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
    <div className="bg-slate-50 min-h-screen pb-16">
      <SEO
        title={`Shuttles y Destinos en ${country.name} | Trail Explorer`}
        description={country.description || `Reserva shuttles y transporte hacia y desde ${country.name}. Encuentra las mejores tarifas y traslados seguros.`}
        path={`/countries/${country.slug}`}
        image={getImageUrl(country.image_url)}
        jsonLd={[breadcrumbSchema, ...citySchemas]}
      />

      {/* Hero Header */}
      <section className="relative h-72 md:h-96">
        <img
          src={getImageUrl(country.image_url)}
          alt={country.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Destino en Centroamérica
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{country.name}</h1>
            <p className="mt-2 text-base md:text-lg text-slate-200 max-w-3xl leading-relaxed">
              {country.description || 'Descubre los mejores destinos turísticos, traslados y rutas de shuttles disponibles.'}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setActiveTab('departures')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'departures'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Navigation className="w-4 h-4" />
              Destinos desde {country.name} ({departureShuttles.length})
            </button>

            <button
              onClick={() => setActiveTab('arrivals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'arrivals'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bus className="w-4 h-4" />
              Destinos hacia {country.name} ({arrivalShuttles.length})
            </button>

            <button
              onClick={() => setActiveTab('cities')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'cities'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Ciudades Principales ({cities.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: Salidas / Destinos desde este país */}
        {activeTab === 'departures' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Rutas y Destinos Saliendo desde {country.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Shuttles diarios locales e internacionales con punto de partida en {country.name}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
                {departureShuttles.length} rutas disponibles
              </span>
            </div>

            {departureShuttles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {departureShuttles.map((shuttle) => (
                  <ShuttleCard key={shuttle.id} shuttle={shuttle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
                <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800">No hay salidas programadas por el momento</h3>
                <p className="text-sm text-slate-500 mt-1">Pronto agregaremos nuevas rutas para {country.name}.</p>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: Llegadas / Destinos hacia este país */}
        {activeTab === 'arrivals' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Rutas y Shuttles para Viajar Hacia {country.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Conexiones desde otros países y ciudades con llegada a destinos en {country.name}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
                {arrivalShuttles.length} rutas de llegada
              </span>
            </div>

            {arrivalShuttles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {arrivalShuttles.map((shuttle) => (
                  <ShuttleCard key={shuttle.id} shuttle={shuttle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
                <Navigation className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800">No hay rutas de llegada registradas</h3>
                <p className="text-sm text-slate-500 mt-1">Estamos expandiendo nuestra red de shuttles internacionales.</p>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: Ciudades y Destinos Principales */}
        {activeTab === 'cities' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Ciudades y Destinos en {country.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Explora las principales ciudades turísticas y puntos de conexión
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
                {cities.length} ciudades
              </span>
            </div>

            {cities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cities.map((city: any) => (
                  <Link key={city.slug} to={`/cities/${city.slug}`} className="block group">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border border-slate-200/80 hover:border-emerald-500/50">
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={getImageUrl((city as any).image_url)}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-lg">{city.name}</h3>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-600 line-clamp-2">{city.description}</p>
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                          <span>Ver shuttles en {city.name}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-800">No hay ciudades disponibles</h3>
                <p className="text-sm text-slate-500 mt-1">Pronto añadiremos los principales destinos de este país.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
