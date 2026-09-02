import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowRight, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { citiesApi, shuttlesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import type { City, Shuttle } from '../../types';

interface ShuttleCardProps {
  shuttle: Shuttle;
}

const ShuttleCard = ({ shuttle }: ShuttleCardProps) => (
  <Link to={`/shuttles/${shuttle.slug}`} className="block">
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
      <div className="relative h-36">
        <img 
          src={getImageUrl(shuttle.image_url)} 
          alt={shuttle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute top-3 right-3">
          <Badge variant={shuttle.service_type === 'international' ? 'warning' : 'success'}>
            {shuttle.service_type === 'international' ? 'International' : 'Local'}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-4">
        <div className="flex items-center gap-1 text-sm text-amber-500 mb-2">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium">{shuttle.rating || 5.0}</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{shuttle.name}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{shuttle.duration_hours}h</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span className="truncate">{shuttle.schedule || 'Daily'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-emerald-600">${shuttle.price}</span>
            <span className="text-sm text-slate-500">/person</span>
          </div>
          <Button size="sm">Book Now</Button>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export const CityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [departureShuttles, setDepartureShuttles] = useState<Shuttle[]>([]);
  const [arrivalShuttles, setArrivalShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const [cityRes, shuttlesRes] = await Promise.all([
          citiesApi.getBySlug(slug),
          shuttlesApi.getByCity(slug),
        ]);
        setCity(cityRes.data);
        setDepartureShuttles(shuttlesRes.data.departure || []);
        setArrivalShuttles(shuttlesRes.data.arrival || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('City not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">City not found</h1>
          <p className="text-slate-500 mt-2">Try selecting a country from the home page.</p>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const countryName = (city as any).country?.name || (city as any).country || '';

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">City not found</h1>
          <p className="text-slate-500 mt-2">Try selecting a country from the home page.</p>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <section className="relative h-64 md:h-80">
        <img src={getImageUrl(city.image_url)} alt={city.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <MapPin className="w-4 h-4" />
              <span>{countryName}</span>
            </div>
            <h1 className="text-4xl font-bold text-white">{city.name}</h1>
            <p className="mt-2 text-lg text-white/90">{city.description}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {departureShuttles.length > 0 && (
            <div className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-emerald-600" />
                  Departure Shuttles
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {departureShuttles.map((shuttle) => (
                  <ShuttleCard key={shuttle.id} shuttle={shuttle} />
                ))}
              </div>
            </div>
          )}

          {arrivalShuttles.length > 0 && (
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Arrival Shuttles
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {arrivalShuttles.map((shuttle) => (
                  <ShuttleCard key={shuttle.id} shuttle={shuttle} />
                ))}
              </div>
            </div>
          )}

          {departureShuttles.length === 0 && arrivalShuttles.length === 0 && (
            <p className="text-slate-500 text-center py-8">No shuttles available for this city yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
