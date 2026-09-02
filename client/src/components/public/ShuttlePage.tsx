import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { shuttlesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { BookingModal } from './BookingModal';
import type { Shuttle } from '../../types';

const generateDates = (availabilityDays: number[]) => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    if (availabilityDays.includes(dayOfWeek)) {
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
  }
  return dates;
};

export const ShuttlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shuttle, setShuttle] = useState<Shuttle | null>(null);
  const [loading, setLoading] = useState(true);
  const { setBookingData, setCurrentShuttle } = useBookingStore();
  const { isAuthenticated } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchShuttle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await shuttlesApi.getBySlug(id);
        setShuttle(response.data);
        setCurrentShuttle(response.data);
      } catch (err) {
        console.error('Error fetching shuttle:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShuttle();
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!shuttle) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Shuttle not found</h1>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  let availabilityDays = [0,1,2,3,4,5,6];
  try {
    availabilityDays = typeof (shuttle as any).availability_days === 'string' 
      ? JSON.parse((shuttle as any).availability_days) 
      : ((shuttle as any).availability_days || [0,1,2,3,4,5,6]);
  } catch { availabilityDays = [0,1,2,3,4,5,6]; }
  
  const dates = generateDates(availabilityDays);
  
  let luggageOptions: { name: string; price: number }[] = [];
  try {
    luggageOptions = typeof shuttle.luggage_options === 'string' 
      ? JSON.parse(shuttle.luggage_options) 
      : (shuttle.luggage_options || []);
  } catch {
    luggageOptions = [];
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/shuttles/${id}` } });
      return;
    }
    setBookingData({ extra_luggage: [] });
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    alert('Booking submitted successfully! You will receive a confirmation email shortly.');
    setBookingData({ extra_luggage: [] });
  };

  const included = shuttle.included ? shuttle.included.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const toBring = shuttle.to_bring ? shuttle.to_bring.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const serviceType = shuttle.service_type === 'international' ? 'International' : 'Local';
  const duration = shuttle.duration_hours;
  const rating = shuttle.rating || 5.0;
  const petsAllowed = shuttle.pets_allowed || false;
  const cancellationPolicy = shuttle.cancellation_policy || '';
  const operator = (shuttle as any).operator || '';
  const luggagePolicy = shuttle.luggage_policy || '';
  const pickupInfo = shuttle.pickup_info || '';

  const images = [
    shuttle.image_url,
    (shuttle as any).origin_image,
    (shuttle as any).destination_image,
  ].filter(Boolean);

  return (
    <div className="bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
              <div className="relative h-64 md:h-96">
                <img
                  src={getImageUrl(images[currentImageIndex])}
                  alt={shuttle.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                      onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={serviceType === 'International' ? 'warning' : 'success'}>
                    {serviceType} Service
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{rating}</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{shuttle.name}</h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{shuttle.schedule || 'Schedule not available'}</span>
                  </div>
                  {shuttle.availability && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{shuttle.availability}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 mb-6">{shuttle.description}</p>

                <div className="space-y-6">
                  {included.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">What's Included</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {included.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {toBring.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">What to Bring</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {toBring.map((item, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Luggage Policy</h3>
                    <p className="text-sm text-slate-600">{luggagePolicy}</p>
                  </div>

                  {luggageOptions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Extra Luggage Options</h3>
                      <ul className="space-y-2">
                        {luggageOptions.map((option, index) => (
                          <li key={index} className="flex items-center justify-between text-sm text-slate-600">
                            <span>{option.name}</span>
                            <span className="font-medium text-emerald-600">+${option.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pickupInfo && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Pickup Information</h3>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{pickupInfo}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Pets</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {petsAllowed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Pets allowed (in carrier)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Pets not allowed</span>
                        </>
                      )}
                    </div>
                  </div>

                  {cancellationPolicy && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Cancellation Policy</h3>
                      <p className="text-sm text-slate-600">{cancellationPolicy}</p>
                    </div>
                  )}

                  {operator && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Operated By</h3>
                      <p className="text-sm text-slate-600">{operator}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book This Shuttle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-emerald-600">${shuttle.price}</span>
                  <span className="text-slate-500">/person</span>
                </div>

                {pickupInfo && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 mb-1">Pickup Information</p>
                    <p className="text-xs text-amber-700 whitespace-pre-line">{pickupInfo}</p>
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{duration} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{dates.length} available dates</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBooking}>
                  Reserve Now
                </Button>
                <p className="text-xs text-center text-slate-500 mt-2">
                  Demo mode - no payment will be processed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          shuttle={shuttle}
          dates={dates}
          luggageOptions={luggageOptions}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
