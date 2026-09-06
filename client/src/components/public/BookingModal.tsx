import { useState, useEffect } from 'react';
import { 
  Loader2, X, Building2, MapPin, CreditCard, Wallet, ShieldCheck, Lock, AlertCircle,
  Calendar, User, Phone, Mail, UserCheck, Users, Luggage, Ticket, Clock, Bus,
  Plus, Minus, Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { bookingsApi, hostelsApi, settingsApi, paymentsApi } from '../../api/endpoints';
import type { Shuttle, Hostel, Booking, PublicSettings, PaymentMethodType } from '../../types';

interface BookingModalProps {
  shuttle: Shuttle;
  dates: { value: string; label: string }[];
  luggageOptions: { name: string; price: number }[];
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingModal = ({ shuttle, dates, luggageOptions, onClose, onSuccess }: BookingModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { bookingData, setBookingData } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  const [publicSettings, setPublicSettings] = useState<PublicSettings | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('pay_on_arrival');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Card details state for Wompi
  const [wompiCard, setWompiCard] = useState({
    cardNumber: '',
    expMonthYear: '',
    cvc: '',
    cardHolder: '',
  });

  // Track if user explicitly customized the pickup person to be someone else
  const [isCustomPickupPerson, setIsCustomPickupPerson] = useState<boolean>(() => {
    const existingPassenger = (bookingData.passenger_name || user?.name || '').trim();
    const existingPickup = (bookingData.pickup_person_name || '').trim();
    return Boolean(existingPickup && existingPickup !== existingPassenger);
  });

  // Fetch public settings for active payment methods
  useEffect(() => {
    let isMounted = true;
    settingsApi.getPublic()
      .then((res) => {
        if (!isMounted || !res.data) return;
        setPublicSettings(res.data);
        if (res.data.pay_on_arrival_enabled !== false) {
          setSelectedPaymentMethod('pay_on_arrival');
        } else if (res.data.wompi_enabled) {
          setSelectedPaymentMethod('wompi');
        } else if (res.data.paypal_enabled) {
          setSelectedPaymentMethod('paypal');
        }
      })
      .catch((err) => console.error('Error al cargar configuración pública de pagos:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-fill user data and sync default pickup person name on mount / when user loads
  useEffect(() => {
    const currentName = (bookingData.passenger_name || user?.name || '').trim();
    const currentEmail = (bookingData.passenger_email || user?.email || '').trim();
    const updates: Partial<typeof bookingData> = {};

    if (!bookingData.passenger_name && currentName) {
      updates.passenger_name = currentName;
    }
    if (!bookingData.passenger_email && currentEmail) {
      updates.passenger_email = currentEmail;
    }
    if (!bookingData.pickup_person_name && currentName) {
      updates.pickup_person_name = currentName;
    }

    if (Object.keys(updates).length > 0) {
      setBookingData(updates);
    }
  }, [user]);

  const handlePassengerNameChange = (newName: string) => {
    if (!isCustomPickupPerson) {
      // Keep pickup_person_name in sync automatically
      setBookingData({
        passenger_name: newName,
        pickup_person_name: newName,
      });
    } else {
      setBookingData({ passenger_name: newName });
    }
  };

  const handlePickupPersonChange = (newPickupName: string) => {
    const currentPassenger = (bookingData.passenger_name || user?.name || '').trim();
    if (!newPickupName.trim() || newPickupName.trim() === currentPassenger) {
      setIsCustomPickupPerson(false);
      setBookingData({ pickup_person_name: newPickupName });
    } else {
      setIsCustomPickupPerson(true);
      setBookingData({ pickup_person_name: newPickupName });
    }
  };

  const handleResetPickupPerson = () => {
    const currentPassenger = (bookingData.passenger_name || user?.name || '').trim();
    setIsCustomPickupPerson(false);
    setBookingData({ pickup_person_name: currentPassenger });
  };
  
  const [originHostels, setOriginHostels] = useState<Hostel[]>([]);
  const [destHostels, setDestHostels] = useState<Hostel[]>([]);
  const [loadingHostels, setLoadingHostels] = useState(true);

  const [selectedPickupMode, setSelectedPickupMode] = useState<'hostel' | 'custom'>('hostel');
  const [selectedDropoffMode, setSelectedDropoffMode] = useState<'hostel' | 'custom'>('hostel');

  const [customPickup, setCustomPickup] = useState('');
  const [customDropoff, setCustomDropoff] = useState('');

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoadingHostels(true);
        const originId = shuttle.origin_city_id || (shuttle as any).origin_slug;
        const destId = shuttle.destination_city_id || (shuttle as any).destination_slug;

        const [originRes, destRes] = await Promise.all([
          originId ? hostelsApi.getByCity(originId) : Promise.resolve({ data: [] }),
          destId ? hostelsApi.getByCity(destId) : Promise.resolve({ data: [] }),
        ]);

        const oHostels = originRes.data || [];
        const dHostels = destRes.data || [];

        setOriginHostels(oHostels);
        setDestHostels(dHostels);

        // Auto select first hostel if available and no previous selection
        if (oHostels.length > 0 && !bookingData.pickup_location) {
          const first = oHostels[0];
          const val = `${first.name}${first.address ? ' - ' + first.address : ''}`;
          setBookingData({ pickup_location: val });
        } else if (oHostels.length === 0) {
          setSelectedPickupMode('custom');
        }

        if (dHostels.length > 0 && !bookingData.dropoff_location) {
          const first = dHostels[0];
          const val = `${first.name}${first.address ? ' - ' + first.address : ''}`;
          setBookingData({ dropoff_location: val });
        } else if (dHostels.length === 0) {
          setSelectedDropoffMode('custom');
        }
      } catch (err) {
        console.error('Error cargando hostales para la reserva:', err);
        setSelectedPickupMode('custom');
        setSelectedDropoffMode('custom');
      } finally {
        setLoadingHostels(false);
      }
    };

    fetchHostels();
  }, [shuttle]);

  const calculateTotal = () => {
    let total = shuttle.price * (bookingData.passengers || 1);
    bookingData.extra_luggage.forEach(item => {
      if (luggageOptions[item.typeIndex]) {
        total += luggageOptions[item.typeIndex].price * item.quantity;
      }
    });
    return total;
  };

  const handleAddLuggage = () => {
    const newLuggage = [...bookingData.extra_luggage, { typeIndex: -1, quantity: 1 }];
    setBookingData({ extra_luggage: newLuggage });
  };

  const handleRemoveLuggage = (index: number) => {
    const newLuggage = bookingData.extra_luggage.filter((_, i) => i !== index);
    setBookingData({ extra_luggage: newLuggage });
  };

  const handleLuggageChange = (index: number, field: 'typeIndex' | 'quantity', value: number) => {
    const newLuggage = [...bookingData.extra_luggage];
    newLuggage[index] = { ...newLuggage[index], [field]: value };
    setBookingData({ extra_luggage: newLuggage });
  };

  const handlePickupHostelChange = (val: string) => {
    if (val === '__custom__') {
      setSelectedPickupMode('custom');
      setBookingData({ pickup_location: customPickup });
    } else {
      setSelectedPickupMode('hostel');
      setBookingData({ pickup_location: val });
    }
  };

  const handleDropoffHostelChange = (val: string) => {
    if (val === '__custom__') {
      setSelectedDropoffMode('custom');
      setBookingData({ dropoff_location: customDropoff });
    } else {
      setSelectedDropoffMode('hostel');
      setBookingData({ dropoff_location: val });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pickup = selectedPickupMode === 'custom' ? customPickup.trim() : bookingData.pickup_location;
    const dropoff = selectedDropoffMode === 'custom' ? customDropoff.trim() : bookingData.dropoff_location;

    if (!pickup) {
      alert(t('bookingModal.pickupRequired'));
      return;
    }

    if (!dropoff) {
      alert(t('bookingModal.dropoffRequired'));
      return;
    }

    let extraLuggageCost = 0;
    bookingData.extra_luggage.forEach(item => {
      if (luggageOptions[item.typeIndex]) {
        extraLuggageCost += luggageOptions[item.typeIndex].price * item.quantity;
      }
    });
    const passengersCount = bookingData.passengers || 1;
    const totalPrice = (shuttle.price * passengersCount) + extraLuggageCost;
    const totalExtraLuggage = bookingData.extra_luggage.reduce((sum, item) => sum + item.quantity, 0);

    const passengerName = (bookingData.passenger_name || user?.name || '').trim();
    const passengerEmail = (bookingData.passenger_email || user?.email || '').trim();
    const passengerPhone = (bookingData.passenger_phone || '').trim();
    const pickupPersonName = (bookingData.pickup_person_name || passengerName).trim();

    if (!passengerName) {
      alert('Por favor ingresa el nombre del pasajero.');
      return;
    }

    // Basic validation for card if Wompi selected
    if (selectedPaymentMethod === 'wompi' && wompiCard.cardNumber.trim()) {
      const cleanNum = wompiCard.cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 13) {
        setPaymentError('Por favor ingresa un número de tarjeta válido (13 a 16 dígitos).');
        return;
      }
    }

    const basePayload = {
      user_id: user?.id && typeof user.id === 'string' && user.id.trim() !== '' ? user.id.trim() : null,
      shuttle_id: shuttle.id,
      date: bookingData.date,
      seats: passengersCount,
      pickup_location: pickup,
      dropoff_location: dropoff,
      passenger_name: passengerName,
      passenger_email: passengerEmail,
      passenger_phone: passengerPhone,
      pickup_person_name: pickupPersonName,
      total_price: totalPrice,
      extra_luggage: totalExtraLuggage,
    };

    try {
      setSubmitting(true);
      setPaymentError(null);

      let createdBooking: Booking;

      if (selectedPaymentMethod === 'wompi') {
        // Prepare checkout
        const checkoutRes = await paymentsApi.wompiCreateCheckout({
          bookingData: basePayload,
          currency: 'USD',
        });
        const reference = checkoutRes.data?.reference || `TE-WOMPI-${Date.now()}`;
        const transactionId = `WMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const bookingRes = await bookingsApi.create({
          ...basePayload,
          payment_method: 'wompi',
          payment_status: 'paid',
          payment_id: transactionId,
          payment_details: JSON.stringify({
            provider: 'wompi',
            transaction_id: transactionId,
            reference,
            card_last4: wompiCard.cardNumber.replace(/\s+/g, '').slice(-4) || '••••',
            paid_at: new Date().toISOString(),
          }),
          status: 'confirmed',
        });
        createdBooking = bookingRes.data;
      } else if (selectedPaymentMethod === 'paypal') {
        // Create PayPal order
        const orderRes = await paymentsApi.paypalCreateOrder({
          bookingData: basePayload,
          currency: 'USD',
        });
        const orderId = orderRes.data?.orderID || `PAYPAL-ORD-${Date.now()}`;

        const bookingRes = await bookingsApi.create({
          ...basePayload,
          payment_method: 'paypal',
          payment_status: 'paid',
          payment_id: orderId,
          payment_details: JSON.stringify({
            provider: 'paypal',
            order_id: orderId,
            paid_at: new Date().toISOString(),
          }),
          status: 'confirmed',
        });
        createdBooking = bookingRes.data;
      } else {
        // Pago al abordar (Efectivo o Transferencia al viajar)
        const bookingRes = await bookingsApi.create({
          ...basePayload,
          payment_method: 'pay_on_arrival',
          payment_status: 'pending',
          payment_id: `POA-${Date.now()}`,
          payment_details: JSON.stringify({
            provider: 'pay_on_arrival',
            instructions: publicSettings?.pay_on_arrival_instructions || 'Paga en efectivo en USD o transferencia al abordar la unidad.',
          }),
          status: 'confirmed',
        });
        createdBooking = bookingRes.data;
      }

      setBookingData({
        extra_luggage: [],
        passenger_name: '',
        passenger_email: '',
        passenger_phone: '',
        pickup_person_name: '',
      });
      onSuccess(createdBooking);
    } catch (err: any) {
      console.error('Error al procesar reserva:', err);
      const serverMsg = err.response?.data?.error || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.';
      setPaymentError(serverMsg);
      alert(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 leading-tight">{t('bookingModal.title')}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{shuttle.name}</span>
                {shuttle.schedule && (
                  <span className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-medium text-slate-600">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {shuttle.schedule}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full hover:bg-slate-200/60 p-2">
            <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price banner */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex justify-between items-center shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {t('bookingModal.ratePerPerson')}
                  </span>
                  <p className="text-2xl font-black text-emerald-700 leading-none">
                    ${shuttle.price} <span className="text-xs font-normal text-emerald-600">USD</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white/90 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold text-slate-800">{shuttle.duration_hours}h</span>
                <span className="text-slate-500">{t('bookingModal.tripDuration')}</span>
              </div>
            </div>

            {/* Date selection */}
            <Select
              label={
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {t('bookingModal.tripDate')}
                </span>
              }
              options={[{ value: '', label: t('bookingModal.selectDate') }, ...dates]}
              value={bookingData.date}
              onChange={(e) => setBookingData({ date: e.target.value })}
              required
            />

            {/* Section: Passenger Details */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Datos de Contacto del Pasajero
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {t('bookingModal.bookerName')}
                    </span>
                  }
                  placeholder={t('bookingModal.passengerNamePlaceholder')}
                  value={bookingData.passenger_name || user?.name || ''}
                  onChange={(e) => handlePassengerNameChange(e.target.value)}
                  required
                />
                <Input
                  label={
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {t('bookingModal.phone')}
                    </span>
                  }
                  placeholder="+506 8888 8888"
                  value={bookingData.passenger_phone || ''}
                  onChange={(e) => setBookingData({ passenger_phone: e.target.value })}
                  required
                />
              </div>

              <Input
                label={
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {t('bookingModal.email')}
                  </span>
                }
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={bookingData.passenger_email || user?.email || ''}
                onChange={(e) => setBookingData({ passenger_email: e.target.value })}
                required
              />

              <div className="space-y-1 mt-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {t('bookingModal.pickupPerson')}
                  </label>
                  {isCustomPickupPerson && (
                    <button
                      type="button"
                      onClick={handleResetPickupPerson}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline flex items-center gap-1"
                    >
                      {t('bookingModal.useSameName')}
                    </button>
                  )}
                </div>
                <Input
                  placeholder={t('bookingModal.pickupPersonPlaceholder')}
                  value={bookingData.pickup_person_name || (isCustomPickupPerson ? '' : (bookingData.passenger_name || user?.name || ''))}
                  onChange={(e) => handlePickupPersonChange(e.target.value)}
                  required
                />
                <p className="text-[11px] text-slate-500">
                  {isCustomPickupPerson
                    ? t('bookingModal.pickupPersonDifferent')
                    : t('bookingModal.pickupPersonDefault')}
                </p>
              </div>
            </div>

            {/* ORIGIN PICKUP LOCATION (HOSTELS OF ORIGIN CITY) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  {t('bookingModal.pickupLocation')}
                </label>
                {originHostels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPickupMode === 'hostel') {
                        setSelectedPickupMode('custom');
                        setBookingData({ pickup_location: customPickup });
                      } else {
                        setSelectedPickupMode('hostel');
                        const first = originHostels[0];
                        setBookingData({ pickup_location: `${first.name}${first.address ? ' - ' + first.address : ''}` });
                      }
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {selectedPickupMode === 'hostel' ? t('bookingModal.enterCustomAddress') : t('bookingModal.chooseFromList')}
                  </button>
                )}
              </div>

              {loadingHostels ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  {t('bookingModal.loadingHostels')}
                </div>
              ) : selectedPickupMode === 'hostel' && originHostels.length > 0 ? (
                <select
                  value={bookingData.pickup_location}
                  onChange={(e) => handlePickupHostelChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">{t('bookingModal.selectPickupHostel')}</option>
                  {originHostels.map((h: Hostel) => {
                    const fullVal = `${h.name}${h.address ? ' - ' + h.address : ''}`;
                    return (
                      <option key={h.id} value={fullVal}>
                        🏨 {h.name} {h.address ? `(${h.address})` : ''}
                      </option>
                    );
                  })}
                  <option value="__custom__">{t('bookingModal.otherCustomHotel')}</option>
                </select>
              ) : (
                <Input
                  placeholder={t('bookingModal.customPickupPlaceholder')}
                  value={customPickup}
                  onChange={(e) => {
                    setCustomPickup(e.target.value);
                    setBookingData({ pickup_location: e.target.value });
                  }}
                  required
                />
              )}
            </div>

            {/* DESTINATION DROPOFF LOCATION (HOSTELS OF DESTINATION CITY) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {t('bookingModal.dropoffLocation')}
                </label>
                {destHostels.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedDropoffMode === 'hostel') {
                        setSelectedDropoffMode('custom');
                        setBookingData({ dropoff_location: customDropoff });
                      } else {
                        setSelectedDropoffMode('hostel');
                        const first = destHostels[0];
                        setBookingData({ dropoff_location: `${first.name}${first.address ? ' - ' + first.address : ''}` });
                      }
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    {selectedDropoffMode === 'hostel' ? t('bookingModal.enterCustomAddress') : t('bookingModal.chooseFromList')}
                  </button>
                )}
              </div>

              {loadingHostels ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  {t('bookingModal.loadingDestHostels')}
                </div>
              ) : selectedDropoffMode === 'hostel' && destHostels.length > 0 ? (
                <select
                  value={bookingData.dropoff_location}
                  onChange={(e) => handleDropoffHostelChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">{t('bookingModal.selectDropoffHostel')}</option>
                  {destHostels.map((h: Hostel) => {
                    const fullVal = `${h.name}${h.address ? ' - ' + h.address : ''}`;
                    return (
                      <option key={h.id} value={fullVal}>
                        🏨 {h.name} {h.address ? `(${h.address})` : ''}
                      </option>
                    );
                  })}
                  <option value="__custom__">{t('bookingModal.otherCustomHotel')}</option>
                </select>
              ) : (
                <Input
                  placeholder={t('bookingModal.customDropoffPlaceholder')}
                  value={customDropoff}
                  onChange={(e) => {
                    setCustomDropoff(e.target.value);
                    setBookingData({ dropoff_location: e.target.value });
                  }}
                  required
                />
              )}
            </div>

            {/* Passenger Count Stepper */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {t('bookingModal.passengersCount')}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Asientos reservados para esta salida
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBookingData({ passengers: Math.max(1, (bookingData.passengers || 1) - 1) })}
                  className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  disabled={bookingData.passengers <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold text-slate-900 w-7 text-center select-none">
                  {bookingData.passengers || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setBookingData({ passengers: Math.min(15, (bookingData.passengers || 1) + 1) })}
                  className="w-7 h-7 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  disabled={bookingData.passengers >= 15}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Extra Luggage */}
            {luggageOptions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-emerald-600" />
                    {t('bookingModal.extraLuggage')}
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLuggage}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    {t('bookingModal.addExtraLuggage')}
                  </button>
                </div>
                {bookingData.extra_luggage.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Select
                      label={index === 0 ? t('bookingModal.extraLuggage') : ''}
                      options={[
                        { value: '-1', label: t('bookingModal.selectLuggageType') },
                        ...luggageOptions.map((opt, i) => ({ 
                          value: String(i), 
                          label: `${opt.name} (+$${opt.price} USD)` 
                        }))
                      ]}
                      value={String(item.typeIndex)}
                      onChange={(e) => handleLuggageChange(index, 'typeIndex', Number(e.target.value))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      label={index === 0 ? 'Cant.' : ''}
                      min="1"
                      max="10"
                      value={String(item.quantity)}
                      onChange={(e) => handleLuggageChange(index, 'quantity', Number(e.target.value) || 0)}
                      className="w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLuggage(index)}
                      className="text-red-500 hover:text-red-700 mb-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <label className="block text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Método de Pago</span>
                <span className="text-xs font-normal text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro
                </span>
              </label>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="space-y-2.5">
                {/* Opción 1: Pago al Abordar */}
                {publicSettings?.pay_on_arrival_enabled !== false && (
                  <div
                    onClick={() => setSelectedPaymentMethod('pay_on_arrival')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      selectedPaymentMethod === 'pay_on_arrival'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      selectedPaymentMethod === 'pay_on_arrival'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          💵 Pago al Abordar (Efectivo o Transferencia)
                        </span>
                        {selectedPaymentMethod === 'pay_on_arrival' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Paga en efectivo en USD o mediante transferencia local al momento de abordar la unidad.
                      </p>
                      {selectedPaymentMethod === 'pay_on_arrival' && publicSettings?.pay_on_arrival_instructions && (
                        <div className="mt-2 text-[11px] bg-white border border-emerald-200 rounded-lg p-2 text-emerald-900 font-medium">
                          📌 {publicSettings.pay_on_arrival_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Opción 2: Wompi El Salvador */}
                {(publicSettings?.wompi_enabled || (!publicSettings && true)) && (
                  <div
                    onClick={() => setSelectedPaymentMethod('wompi')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      selectedPaymentMethod === 'wompi'
                        ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      selectedPaymentMethod === 'wompi'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">
                            💳 Tarjeta de Crédito / Débito (Wompi)
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            El Salvador
                          </span>
                        </div>
                        {selectedPaymentMethod === 'wompi' && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Visa y Mastercard. Pago seguro en línea procesado al instante por Wompi (Banco Agrícola).
                      </p>

                      {/* Optional inline card fields for Wompi */}
                      {selectedPaymentMethod === 'wompi' && (
                        <div className="mt-3 space-y-2.5 bg-white border border-purple-200 rounded-xl p-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-purple-600" />
                              Datos de la Tarjeta (Checkout Seguro)
                            </span>
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono">
                              256-bit SSL
                            </span>
                          </div>

                          <div>
                            <Input
                              type="text"
                              placeholder="Número de Tarjeta (4xxx xxxx xxxx xxxx)"
                              maxLength={19}
                              value={wompiCard.cardNumber}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
                                setWompiCard({ ...wompiCard, cardNumber: formatted });
                              }}
                              className="text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="text"
                              placeholder="MM/AA (Exp.)"
                              maxLength={5}
                              value={wompiCard.expMonthYear}
                              onChange={(e) => {
                                const v = e.target.value.replace(/[^0-9]/g, '');
                                const formatted = v.length >= 2 ? `${v.slice(0, 2)}/${v.slice(2, 4)}` : v;
                                setWompiCard({ ...wompiCard, expMonthYear: formatted });
                              }}
                              className="text-xs"
                            />
                            <Input
                              type="password"
                              placeholder="CVC / CVV"
                              maxLength={4}
                              value={wompiCard.cvc}
                              onChange={(e) => setWompiCard({ ...wompiCard, cvc: e.target.value.replace(/[^0-9]/g, '') })}
                              className="text-xs"
                            />
                          </div>

                          <p className="text-[11px] text-slate-400">
                            Tu reserva quedará confirmada y pagada en línea al hacer clic en el botón inferior.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Opción 3: PayPal */}
                {(publicSettings?.paypal_enabled || (!publicSettings && true)) && (
                  <div
                    onClick={() => setSelectedPaymentMethod('paypal')}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      selectedPaymentMethod === 'paypal'
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 font-bold flex items-center justify-center w-8 h-8 ${
                      selectedPaymentMethod === 'paypal'
                        ? 'bg-[#0079C1] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className="text-xs leading-none">P</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">
                            🅿️ PayPal / Tarjetas Internacionales
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            Global
                          </span>
                        </div>
                        {selectedPaymentMethod === 'paypal' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Paga con tu saldo PayPal o tarjetas de crédito/débito internacionales de cualquier país.
                      </p>
                      {selectedPaymentMethod === 'paypal' && (
                        <div className="mt-2 text-[11px] bg-white border border-blue-200 rounded-lg p-2 text-blue-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>Incluye la Protección al Comprador oficial de PayPal. Confirmación al instante.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  ${shuttle.price} × {bookingData.passengers} {t('bookingModal.passengers')}
                </span>
                <span className="font-semibold text-slate-900">${shuttle.price * bookingData.passengers} USD</span>
              </div>
              {bookingData.extra_luggage.map((item, index) => (
                luggageOptions[item.typeIndex] && item.quantity > 0 && (
                  <div key={index} className="flex justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Luggage className="w-3.5 h-3.5 text-slate-400" />
                      {luggageOptions[item.typeIndex].name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      +${luggageOptions[item.typeIndex].price * item.quantity} USD
                    </span>
                  </div>
                )
              ))}
              <div className="flex justify-between text-lg font-black pt-2.5 border-t border-slate-200 text-slate-900 items-center">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {t('bookingModal.totalToPay')}
                </span>
                <span className="text-xl font-black text-emerald-700">${total} <span className="text-xs font-normal text-emerald-600">USD</span></span>
              </div>
            </div>

            {/* Adaptive Action Submit button */}
            {selectedPaymentMethod === 'wompi' ? (
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-base shadow-md cursor-pointer"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Procesando pago con Wompi...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pagar ${total} USD con Wompi
                  </>
                )}
              </Button>
            ) : selectedPaymentMethod === 'paypal' ? (
              <Button
                type="submit"
                className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 text-base shadow-md cursor-pointer"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Conectando con PayPal...
                  </>
                ) : (
                  <>
                    <span className="font-black mr-2">🅿️</span>
                    Pagar ${total} USD con PayPal
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-base shadow-md cursor-pointer"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t('bookingModal.submitting')}
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Confirmar Reserva (Pago al Abordar)
                  </>
                )}
              </Button>
            )}

            <p className="text-xs text-center text-slate-400">
              Recibirás un correo electrónico con la confirmación oficial y tu voucher digital de viaje.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
