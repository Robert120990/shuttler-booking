import { useState } from 'react';
import { Loader2, X, User, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import { bookingsApi } from '../../api/endpoints';
import type { Shuttle } from '../../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        pickup_location: bookingData.pickup_location,
        dropoff_location: bookingData.dropoff_location,
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
      console.error('Error creating booking:', err);
      const serverMsg = err.response?.data?.error || 'Hubo un error al procesar tu reserva. Por favor intenta de nuevo.';
      alert(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Book Shuttle</CardTitle>
            <p className="text-sm text-slate-500 mt-1">{shuttle.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-emerald-800">${shuttle.price}</span>
                <span className="text-sm text-emerald-600">per person</span>
              </div>
            </div>

            <Select
              label="Select Date"
              options={[{ value: '', label: 'Choose a date' }, ...dates]}
              value={bookingData.date}
              onChange={(e) => setBookingData({ date: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Passenger Name"
                placeholder="Full name"
                value={bookingData.passenger_name || user?.name || ''}
                onChange={(e) => setBookingData({ passenger_name: e.target.value })}
                required
              />
              <Input
                label="Phone"
                placeholder="+1 234 567 8900"
                value={bookingData.passenger_phone || ''}
                onChange={(e) => setBookingData({ passenger_phone: e.target.value })}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={bookingData.passenger_email || user?.email || ''}
              onChange={(e) => setBookingData({ passenger_email: e.target.value })}
              required
            />

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Pickup Person (who will be picked up)
              </h3>
              <Input
                label="Pickup Person Name"
                placeholder="Name of person to pick up"
                value={bookingData.pickup_person_name || ''}
                onChange={(e) => setBookingData({ pickup_person_name: e.target.value })}
                required
              />
            </div>

            <Input
              label="Pickup Location"
              placeholder="Hotel name and address"
              value={bookingData.pickup_location}
              onChange={(e) => setBookingData({ pickup_location: e.target.value })}
              required
            />

            <Input
              label="Dropoff Location"
              placeholder="Destination hotel or address"
              value={bookingData.dropoff_location}
              onChange={(e) => setBookingData({ dropoff_location: e.target.value })}
              required
            />

            <Input
              type="number"
              label="Number of Passengers"
              min="1"
              max="15"
              value={String(bookingData.passengers)}
              onChange={(e) => setBookingData({ passengers: Number(e.target.value) || 1 })}
              required
            />

            {luggageOptions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Extra Luggage
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLuggage}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    + Add item
                  </button>
                </div>
                {bookingData.extra_luggage.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Select
                      label={index === 0 ? 'Type' : ''}
                      options={[
                        { value: '-1', label: 'Select type' },
                        ...luggageOptions.map((opt, i) => ({ 
                          value: String(i), 
                          label: `${opt.name} (+$${opt.price})` 
                        }))
                      ]}
                      value={String(item.typeIndex)}
                      onChange={(e) => handleLuggageChange(index, 'typeIndex', Number(e.target.value))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      label={index === 0 ? 'Qty' : ''}
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

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{shuttle.price} x {bookingData.passengers} passengers</span>
                <span className="font-medium">${shuttle.price * bookingData.passengers}</span>
              </div>
              {bookingData.extra_luggage.map((item, index) => (
                luggageOptions[item.typeIndex] && item.quantity > 0 && (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {luggageOptions[item.typeIndex].name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      +${luggageOptions[item.typeIndex].price * item.quantity}
                    </span>
                  </div>
                )
              ))}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-600">${total}</span>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Complete Booking'
              )}
            </Button>
            <p className="text-xs text-center text-slate-500">
              Demo mode - no payment will be processed
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
