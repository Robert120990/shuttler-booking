import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Loader2, MessageSquare, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { useLanguageStore } from '../../i18n';
import { shuttlesApi, reviewsApi } from '../../api/endpoints';
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
import type { Shuttle, Review, ReviewStats } from '../../types';

export const ShuttlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [shuttle, setShuttle] = useState<Shuttle | null>(null);
  const [loading, setLoading] = useState(true);
  const { setBookingData, setCurrentShuttle } = useBookingStore();
  const { isAuthenticated, user } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    user_email: '',
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchShuttle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await shuttlesApi.getBySlug(id);
        setShuttle(response.data);
        setCurrentShuttle(response.data);
        if (response.data?.id) {
          fetchReviews(response.data.id);
        }
      } catch (err) {
        console.error('Error fetching shuttle:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShuttle();
  }, [id]);

  useEffect(() => {
    if (user?.name && !reviewForm.user_name) {
      setReviewForm((prev) => ({
        ...prev,
        user_name: user.name,
        user_email: user.email || '',
      }));
    }
  }, [user]);

  const fetchReviews = async (shuttleId: string) => {
    try {
      setLoadingReviews(true);
      const res = await reviewsApi.getByShuttle(shuttleId);
      if (res.data) {
        setReviews(res.data.reviews || []);
        setReviewStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shuttle) return;

    if (!reviewForm.user_name.trim()) {
      setReviewFeedback({
        type: 'error',
        message: language === 'es' ? 'Por favor ingresa tu nombre de viajero.' : 'Please enter your name.',
      });
      return;
    }

    if (!reviewForm.comment.trim() || reviewForm.comment.trim().length < 5) {
      setReviewFeedback({
        type: 'error',
        message: language === 'es' ? 'Tu comentario debe tener al menos 5 caracteres.' : 'Your comment must be at least 5 characters.',
      });
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewFeedback(null);
      const res = await reviewsApi.create(shuttle.id, reviewForm);
      if (res.data?.review) {
        setReviews((prev) => [res.data.review, ...prev]);
        if (res.data.updatedStats) {
          setShuttle((prev) =>
            prev
              ? {
                  ...prev,
                  rating: res.data.updatedStats.rating,
                  review_count: res.data.updatedStats.review_count,
                }
              : null
          );
        }
        await fetchReviews(shuttle.id);
        setReviewFeedback({
          type: 'success',
          message: language === 'es' ? '¡Muchas gracias! Tu reseña ha sido publicada.' : 'Thank you! Your review has been published.',
        });
        setReviewForm({
          user_name: user?.name || '',
          user_email: user?.email || '',
          rating: 5,
          comment: '',
        });
        setShowReviewForm(false);
      }
    } catch (err: any) {
      console.error('Error creating review:', err);
      const msg = err.response?.data?.error || (language === 'es' ? 'Error al enviar la reseña. Intenta de nuevo.' : 'Failed to submit review.');
      setReviewFeedback({ type: 'error', message: msg });
    } finally {
      setSubmittingReview(false);
    }
  };

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
  const duration = Number(shuttle.duration_hours);
  const rating = Number(shuttle.rating) || 5.0;
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
      ratingValue: Number(shuttle.rating) || 5.0,
      reviewCount: Number(shuttle.review_count) || 0,
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
                  <a
                    href="#reviews-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 text-amber-500 hover:text-amber-600 transition-colors py-0.5 px-2 rounded-md hover:bg-amber-50 cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-slate-800">
                      {(Number(reviewStats?.averageRating) || rating).toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500 font-normal underline decoration-slate-300">
                      ({reviewStats?.reviewCount || reviews.length} {language === 'es' ? 'reseñas' : 'reviews'})
                    </span>
                  </a>
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

            {/* SECCIÓN DE RESEÑAS Y VALORACIONES */}
            <div id="reviews-section" className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">
                      {language === 'es' ? 'Reseñas y Valoraciones de Viajeros' : 'Traveler Reviews & Ratings'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'es'
                      ? 'Experiencias reales compartidas por pasajeros que han realizado esta ruta'
                      : 'Real experiences shared by travelers who booked this shuttle'}
                  </p>
                </div>

                <Button
                  onClick={() => setShowReviewForm((prev) => !prev)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 self-start sm:self-auto"
                >
                  <Star className="w-4 h-4 fill-current text-amber-300" />
                  <span>{showReviewForm ? (language === 'es' ? 'Cancelar Reseña' : 'Cancel Review') : (language === 'es' ? 'Escribir una Reseña' : 'Write a Review')}</span>
                </Button>
              </div>

              {/* Feedback Alert */}
              {reviewFeedback && (
                <div
                  className={`p-4 rounded-xl flex items-start gap-3 border text-xs font-medium transition-all ${
                    reviewFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {reviewFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <span>{reviewFeedback.message}</span>
                </div>
              )}

              {/* Formulario para Escribir Reseña */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-slate-50/80 border border-emerald-100 rounded-xl p-5 md:p-6 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'es' ? 'Comparte tu experiencia con otros viajeros' : 'Share your trip experience'}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {language === 'es' ? 'Puntuación obligatoria' : 'Rating required'}
                    </span>
                  </div>

                  {/* Selector de Estrellas Interactivo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'es' ? '¿Cómo calificarías este viaje?' : 'How would you rate this trip?'}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = (hoverRating || reviewForm.rating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                } transition-colors`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 ml-2">
                        {reviewForm.rating === 5 && (language === 'es' ? '¡Excelente servicio! (5/5)' : 'Excellent! (5/5)')}
                        {reviewForm.rating === 4 && (language === 'es' ? 'Muy bueno (4/5)' : 'Very Good (4/5)')}
                        {reviewForm.rating === 3 && (language === 'es' ? 'Promedio / Bueno (3/5)' : 'Good (3/5)')}
                        {reviewForm.rating === 2 && (language === 'es' ? 'Regular (2/5)' : 'Fair (2/5)')}
                        {reviewForm.rating === 1 && (language === 'es' ? 'Mala experiencia (1/5)' : 'Poor (1/5)')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'es' ? 'Tu Nombre o Apodo' : 'Your Name'} *
                      </label>
                      <Input
                        type="text"
                        placeholder={language === 'es' ? 'Ej. Sofía Méndez' : 'e.g. Sophia Mendez'}
                        value={reviewForm.user_name}
                        onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                        required
                        className="bg-white text-xs h-9"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {language === 'es' ? 'Tu Correo Electrónico' : 'Your Email'} ({language === 'es' ? 'Opcional / Privado' : 'Optional / Private'})
                      </label>
                      <Input
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        value={reviewForm.user_email}
                        onChange={(e) => setReviewForm({ ...reviewForm, user_email: e.target.value })}
                        className="bg-white text-xs h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'es' ? 'Tu Reseña o Comentario' : 'Your Review'} *
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        language === 'es'
                          ? 'Cuéntanos cómo fue el viaje, la puntualidad del chofer, la comodidad del vehículo, etc...'
                          : 'Tell us about the ride, punctuality, comfort, driver...'
                      }
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReviewForm(false)}
                      className="text-xs"
                    >
                      {language === 'es' ? 'Cancelar' : 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      {submittingReview ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{language === 'es' ? 'Publicando...' : 'Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'es' ? 'Publicar Reseña' : 'Submit Review'}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* Resumen de Calificación */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                {/* Puntuación Media */}
                <div className="flex flex-col items-center justify-center text-center p-2 md:border-r border-slate-200">
                  <div className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {(Number(reviewStats?.averageRating) || rating).toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 my-2">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const currentScore = Number(reviewStats?.averageRating) || rating;
                      return (
                        <Star
                          key={s}
                          className={`w-5 h-5 ${
                            currentScore >= s - 0.2
                              ? 'fill-current text-amber-400'
                              : currentScore >= s - 0.7
                              ? 'text-amber-400 fill-amber-400/50'
                              : 'text-slate-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {language === 'es' ? 'Basado en' : 'Based on'}{' '}
                    <strong>{reviewStats?.reviewCount || reviews.length}</strong>{' '}
                    {language === 'es' ? 'opiniones verificadas' : 'verified reviews'}
                  </div>
                </div>

                {/* Barras de Desglose de Estrellas */}
                <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = reviewStats?.distribution?.[starNum as 1 | 2 | 3 | 4 | 5] || 0;
                    const total = reviewStats?.reviewCount || reviews.length || 1;
                    const percent = Math.round((count / (total || 1)) * 100);

                    return (
                      <div key={starNum} className="flex items-center gap-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1 w-12 flex-shrink-0 font-medium">
                          <span>{starNum}</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        </div>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-slate-400 text-[11px] font-mono">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Reseñas de Clientes */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>{language === 'es' ? 'Opiniones Recientes' : 'Recent Traveler Reviews'}</span>
                  <span className="text-xs font-normal text-slate-500">
                    {reviews.length} {language === 'es' ? 'comentarios' : 'comments'}
                  </span>
                </h3>

                {loadingReviews ? (
                  <div className="p-8 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <Star className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-800">
                      {language === 'es' ? 'Aún no hay reseñas registradas para esta ruta' : 'No reviews recorded for this route yet'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {language === 'es'
                        ? '¿Viajaste con nosotros en este shuttle? Comparte tu opinión haciendo clic en "Escribir una Reseña".'
                        : 'Did you travel with us on this route? Share your experience with other travelers!'}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setShowReviewForm(true)}
                      className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                      {language === 'es' ? 'Sé el primero en calificar' : 'Be the first to review'}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((rev) => {
                      const firstInitial = (rev.user_name || 'V').charAt(0).toUpperCase();
                      const dateStr = rev.created_at
                        ? new Date(rev.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '';

                      return (
                        <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                                {firstInitial}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-900">{rev.user_name}</span>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{language === 'es' ? 'Viajero Verificado' : 'Verified Traveler'}</span>
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block">{dateStr}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400 bg-amber-50/70 border border-amber-200/60 px-2 py-1 rounded-md">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating ? 'fill-current text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-slate-700 ml-1">{rev.rating}.0</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed pl-11">
                            {rev.comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
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
