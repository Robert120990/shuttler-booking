import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../i18n';
import { shuttlesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import { BookingModal } from './BookingModal';
import { SEO } from '../seo/SEO';
import {
  translateRouteName,
  translateList,
  translateLuggagePolicy,
  translateLuggageOptions,
  translatePickupInfo,
  translateCancellationPolicy,
  translateDescription,
  translateAvailability,
  generateLocalizedDates,
} from '../../utils/shuttleTranslator';
import type { Shuttle } from '../../types';

export const ShuttlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
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
          <h1 className="text-2xl font-bold text-slate-900">{t('common.notFound')}</h1>
          <Link to="/" className="text-emerald-600 hover:underline mt-4 inline-block">
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  let availabilityDays = [0, 1, 2, 3, 4, 5, 6];
  try {
    availabilityDays = typeof (shuttle as any).availability_days === 'string'
      ? JSON.parse((shuttle as any).availability_days)
      : ((shuttle as any).availability_days || [0, 1, 2, 3, 4, 5, 6]);
  } catch {
    availabilityDays = [0, 1, 2, 3, 4, 5, 6];
  }

  const dates = generateLocalizedDates(availabilityDays, language);

  let rawLuggageOptions: { name: string; price: number }[] = [];
  try {
    rawLuggageOptions = typeof shuttle.luggage_options === 'string'
      ? JSON.parse(shuttle.luggage_options)
      : (shuttle.luggage_options || []);
  } catch {
    rawLuggageOptions = [];
  }
  const luggageOptions = translateLuggageOptions(rawLuggageOptions, language);

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
    alert(t('bookingModal.bookingSuccess'));
    setBookingData({ extra_luggage: [] });
  };

  const originName = (shuttle as any).origin_name || '';
  const destName = (shuttle as any).destination_name || '';
  const baseRouteName = originName && destName ? `${originName} to ${destName}` : shuttle.name;
  const routeName = translateRouteName(baseRouteName, language);

  const included = translateList(shuttle.included, language);
  const toBring = translateList(shuttle.to_bring, language);
  const serviceTypeLabel = shuttle.service_type === 'international' ? t('shuttle.internationalService') : t('shuttle.localService');
  const duration = shuttle.duration_hours;
  const rating = shuttle.rating || 5.0;
  const petsAllowed = shuttle.pets_allowed || false;
  const cancellationPolicy = translateCancellationPolicy(shuttle.cancellation_policy, language);
  const operator = (shuttle as any).operator || 'Trail Explorer';
  const luggagePolicy = translateLuggagePolicy(shuttle.luggage_policy, language);
  const pickupInfo = translatePickupInfo(shuttle.pickup_info, language);
  const availability = translateAvailability(shuttle.availability, language);
  const description = translateDescription(shuttle.description, routeName, language);

  const images = [
    shuttle.image_url,
    (shuttle as any).origin_image,
    (shuttle as any).destination_image,
  ].filter(Boolean);

  const tripSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${routeName} Shuttle`,
    description: shuttle.description || `Book a shuttle from ${originName} to ${destName}.`,
    image: getImageUrl(shuttle.image_url),
    sku: `shuttle-${shuttle.slug}`,
    brand: {
      '@type': 'Organization',
      name: (shuttle as any).operator || 'Trail Explorer',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: shuttle.rating || 5.0,
      reviewCount: shuttle.review_count || 0,
    },
    offers: {
      '@type': 'Offer',
      price: shuttle.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `https://trailexplorer.com/shuttles/${shuttle.slug}`,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trailexplorer.com/' },
      { '@type': 'ListItem', position: 2, name: originName, item: `https://trailexplorer.com/cities/${(shuttle as any).origin_slug || ''}` },
      { '@type': 'ListItem', position: 3, name: routeName, item: `https://trailexplorer.com/shuttles/${shuttle.slug}` },
    ],
  };

  const transferSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Shuttle Transfer',
    name: `${routeName} Shuttle`,
    description: shuttle.description || `Shuttle transfer from ${originName} to ${destName}.`,
    provider: {
      '@type': 'Organization',
      name: (shuttle as any).operator || 'Trail Explorer',
    },
    areaServed: [originName, destName],
    offers: {
      '@type': 'Offer',
      price: shuttle.price,
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="bg-slate-50">
      <SEO
        title={`${routeName} Shuttle - From $${shuttle.price}/person`}
        description={shuttle.description || `Book a ${routeName} shuttle. ${shuttle.duration_hours} hours, $${shuttle.price} per person. ${shuttle.luggage_policy || 'Check luggage policy and included amenities.'}`}
        path={`/shuttles/${shuttle.slug}`}
        image={getImageUrl(shuttle.image_url)}
        type="product"
        jsonLd={[tripSchema, breadcrumbSchema, transferSchema]}
      />
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
                  <Badge variant={shuttle.service_type === 'international' ? 'warning' : 'success'}>
                    {serviceTypeLabel}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{rating}</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{routeName}</h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{duration} {t('shuttle.hours')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{shuttle.schedule || availability}</span>
                  </div>
                  {availability && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{availability}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 mb-6">{description}</p>

                <div className="space-y-6">
                  {included.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.whatsIncluded')}</h3>
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
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.whatToBring')}</h3>
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
                    <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.luggagePolicy')}</h3>
                    <p className="text-sm text-slate-600">{luggagePolicy}</p>
                  </div>

                  {luggageOptions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.extraLuggageOptions')}</h3>
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
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.pickupInformation')}</h3>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{pickupInfo}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.pets')}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {petsAllowed ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>{t('shuttle.petsAllowed')}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>{t('shuttle.petsNotAllowed')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {cancellationPolicy && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.cancellationPolicy')}</h3>
                      <p className="text-sm text-slate-600">{cancellationPolicy}</p>
                    </div>
                  )}

                  {operator && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{t('shuttle.operatedBy')}</h3>
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
                <CardTitle>{t('shuttle.bookThisShuttle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-emerald-600">${shuttle.price}</span>
                  <span className="text-slate-500"> {t('shuttle.perPerson')}</span>
                </div>

                {pickupInfo && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-800 mb-1">{t('shuttle.pickupInformation')}</p>
                    <p className="text-xs text-amber-700 whitespace-pre-line">{pickupInfo}</p>
                  </div>
                )}

                <div className="space-y-3 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{duration} {t('shuttle.hours')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{dates.length} {language === 'es' ? 'fechas disponibles' : 'available dates'}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBooking}>
                  {t('shuttle.reserveNow')}
                </Button>
                <p className="text-xs text-center text-slate-500 mt-2">
                  {t('shuttle.demoMode')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          shuttle={{ ...shuttle, name: routeName }}
          dates={dates}
          luggageOptions={luggageOptions}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};
