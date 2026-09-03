import { useState, useEffect } from 'react';
import { Loader2, X, Package, Building2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { bookingsApi, hostelsApi } from '../../api/endpoints';
import type { Shuttle, Hostel } from '../../types';

interface BookingModalProps {
  shuttle: Shuttle;
  dates: { value: string; label: string }[];
  luggageOptions: { name: string; price: number }[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal = ({ shuttle, dates, luggageOptions, onClose, onSuccess }: BookingModalProps) => {
  const { user } = useAuthStore();
  const { bookingData, setBookingData } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);
  
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
      alert('Por favor selecciona o ingresa el lugar de recogida (hostal/hotel).');
      return;
    }

    if (!dropoff) {
      alert('Por favor selecciona o ingresa el lugar de destino (hostal/hotel).');
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

    const passengerName = bookingData.passenger_name || user?.name || '';
    const passengerEmail = bookingData.passenger_email || user?.email || '';
    const passengerPhone = bookingData.passenger_phone || '';
    const pickupPersonName = bookingData.pickup_person_name || passengerName;

    try {
      setSubmitting(true);
      await bookingsApi.create({
        user_id: user?.id,
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
        status: 'pending',
      });
      setBookingData({ extra_luggage: [] });
      onSuccess();
    } catch (err: any) {
      console.error('Error al crear reserva:', err);
      const serverMsg = err.response?.data?.error || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.';
      alert(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Reservar Shuttle</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">{shuttle.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price banner */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Tarifa por persona</span>
                <p className="text-2xl font-black text-emerald-700">${shuttle.price} <span className="text-xs font-normal text-emerald-600">USD</span></p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{shuttle.duration_hours}h</span> de trayecto
              </div>
            </div>

            {/* Date selection */}
            <Select
              label="Fecha del Viaje"
              options={[{ value: '', label: 'Selecciona una fecha disponible' }, ...dates]}
              value={bookingData.date}
              onChange={(e) => setBookingData({ date: e.target.value })}
              required
            />

            {/* Passengers & Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre del Pasajero Principal"
                placeholder="Nombre y Apellido"
                value={bookingData.passenger_name || user?.name || ''}
                onChange={(e) => setBookingData({ passenger_name: e.target.value })}
                required
              />
              <Input
                label="Teléfono / WhatsApp"
                placeholder="+506 8888 8888"
                value={bookingData.passenger_phone || ''}
                onChange={(e) => setBookingData({ passenger_phone: e.target.value })}
                required
              />
            </div>

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu-correo@ejemplo.com"
              value={bookingData.passenger_email || user?.email || ''}
              onChange={(e) => setBookingData({ passenger_email: e.target.value })}
              required
            />

            <Input
              label="Persona a Recoger (si viaja otra persona)"
              placeholder="Nombre de la persona a recoger"
              value={bookingData.pickup_person_name || ''}
              onChange={(e) => setBookingData({ pickup_person_name: e.target.value })}
            />

            {/* ORIGIN PICKUP LOCATION (HOSTELS OF ORIGIN CITY) */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Lugar de Recogida (Hostal / Hotel en Origen)
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
                    {selectedPickupMode === 'hostel' ? '✍️ Ingresar otra dirección' : '🏢 Elegir de la lista'}
                  </button>
                )}
              </div>

              {loadingHostels ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Cargando hostales de la ciudad...
                </div>
              ) : selectedPickupMode === 'hostel' && originHostels.length > 0 ? (
                <select
                  value={bookingData.pickup_location}
                  onChange={(e) => handlePickupHostelChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">Selecciona tu hostal u hotel de recogida...</option>
                  {originHostels.map((h) => {
                    const fullVal = `${h.name}${h.address ? ' - ' + h.address : ''}`;
                    return (
                      <option key={h.id} value={fullVal}>
                        🏨 {h.name} {h.address ? `(${h.address})` : ''}
                      </option>
                    );
                  })}
                  <option value="__custom__">✍️ Otro hotel / Dirección personalizada...</option>
                </select>
              ) : (
                <Input
                  placeholder="Nombre del hotel, hostal o dirección exacta de recogida"
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
                  Lugar de Entrega (Hostal / Hotel en Destino)
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
                    {selectedDropoffMode === 'hostel' ? '✍️ Ingresar otra dirección' : '🏢 Elegir de la lista'}
                  </button>
                )}
              </div>

              {loadingHostels ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Cargando hostales de destino...
                </div>
              ) : selectedDropoffMode === 'hostel' && destHostels.length > 0 ? (
                <select
                  value={bookingData.dropoff_location}
                  onChange={(e) => handleDropoffHostelChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  <option value="">Selecciona tu hostal u hotel de destino...</option>
                  {destHostels.map((h) => {
                    const fullVal = `${h.name}${h.address ? ' - ' + h.address : ''}`;
                    return (
                      <option key={h.id} value={fullVal}>
                        🏨 {h.name} {h.address ? `(${h.address})` : ''}
                      </option>
                    );
                  })}
                  <option value="__custom__">✍️ Otro hotel / Dirección personalizada...</option>
                </select>
              ) : (
                <Input
                  placeholder="Nombre del hotel, hostal o dirección de destino"
                  value={customDropoff}
                  onChange={(e) => {
                    setCustomDropoff(e.target.value);
                    setBookingData({ dropoff_location: e.target.value });
                  }}
                  required
                />
              )}
            </div>

            {/* Passenger Count */}
            <Input
              type="number"
              label="Número de Pasajeros"
              min="1"
              max="15"
              value={String(bookingData.passengers)}
              onChange={(e) => setBookingData({ passengers: Number(e.target.value) || 1 })}
              required
            />

            {/* Extra Luggage */}
            {luggageOptions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    Equipaje Adicional
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLuggage}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    + Agregar equipaje
                  </button>
                </div>
                {bookingData.extra_luggage.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Select
                      label={index === 0 ? 'Tipo de Equipaje' : ''}
                      options={[
                        { value: '-1', label: 'Seleccionar tipo' },
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

            {/* Summary and Total */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">${shuttle.price} x {bookingData.passengers} pasajero(s)</span>
                <span className="font-semibold text-slate-900">${shuttle.price * bookingData.passengers} USD</span>
              </div>
              {bookingData.extra_luggage.map((item, index) => (
                luggageOptions[item.typeIndex] && item.quantity > 0 && (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {luggageOptions[item.typeIndex].name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      +${luggageOptions[item.typeIndex].price * item.quantity} USD
                    </span>
                  </div>
                )
              ))}
              <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-200 text-slate-900">
                <span>Total a Pagar</span>
                <span className="text-emerald-600">${total} USD</span>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-base shadow-md"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Procesando Reserva...
                </>
              ) : (
                'Confirmar y Reservar'
              )}
            </Button>
            <p className="text-xs text-center text-slate-400">
              Recibirás un correo con la confirmación y detalles de recogida de tu reserva.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
