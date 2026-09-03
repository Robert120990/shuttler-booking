import { useState, useEffect } from 'react';
import { Search, Eye, Loader2, X, MapPin, Package, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { bookingsApi, shuttlesApi } from '../../api/endpoints';
import type { Booking, Shuttle } from '../../types';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, shuttlesRes] = await Promise.all([
        bookingsApi.getAll(),
        shuttlesApi.getAll(),
      ]);
      setBookings(bookingsRes.data);
      setShuttles(shuttlesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getShuttleName = (shuttleId: string, booking?: any) => {
    if (booking && booking.shuttle_name) return booking.shuttle_name;
    const shuttle = shuttles.find(s => s.id === shuttleId);
    return shuttle?.name || 'Ruta no especificada';
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingsApi.updateStatus(bookingId, newStatus);
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado. Por favor intenta de nuevo.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const routeName = getShuttleName(booking.shuttle_id, booking);
    const passengerName = booking.passenger_name || '';
    const passengerEmail = booking.passenger_email || '';
    const pickupLoc = booking.pickup_location || '';
    const dropoffLoc = booking.dropoff_location || '';

    const matchesSearch =
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickupLoc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dropoffLoc.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'refunded': return 'warning';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendiente';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reservas de Shuttles</h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Consulta y gestiona las reservas, pasajeros y puntos de recogida / entrega en hostales
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente, hostal, ruta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'confirmed', label: 'Confirmado' },
                { value: 'completed', label: 'Completado' },
                { value: 'cancelled', label: 'Cancelado' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-medium border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Pasajero</th>
                  <th className="py-3 px-4">Ruta del Shuttle</th>
                  <th className="py-3 px-4">Hostal Recogida / Entrega</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Pax / Equipaje</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Pago</th>
                  <th className="py-3 px-4 text-right">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    {/* Passenger */}
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{booking.passenger_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{booking.passenger_email || '—'}</p>
                        <p className="text-xs text-slate-400">{booking.passenger_phone || ''}</p>
                      </div>
                    </td>

                    {/* Shuttle Route */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{getShuttleName(booking.shuttle_id, booking)}</p>
                    </td>

                    {/* Hostels Info */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="text-emerald-700">Recogida:</strong> {booking.pickup_location || 'No especificado'}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="truncate">
                            <strong className="text-blue-700">Entrega:</strong> {booking.dropoff_location || 'No especificado'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Passengers & Luggage */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="text-slate-800 font-medium">{booking.seats || 1} pax</p>
                      {booking.extra_luggage && booking.extra_luggage > 0 ? (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          +{booking.extra_luggage} equipaje
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Sin extra</p>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-slate-900">${booking.total_price}</td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {updatingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <Select
                          options={[
                            { value: 'pending', label: 'Pendiente' },
                            { value: 'confirmed', label: 'Confirmado' },
                            { value: 'completed', label: 'Completado' },
                            { value: 'cancelled', label: 'Cancelado' },
                          ]}
                          value={booking.status || 'pending'}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="min-w-[125px] text-xs py-1"
                        />
                      )}
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4">
                      <Badge variant={getPaymentBadgeVariant(booking.payment_status || 'pending')}>
                        {booking.payment_status === 'paid' ? 'Pagado' : booking.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)} title="Ver detalles completos">
                        <Eye className="w-4 h-4 text-slate-600 hover:text-emerald-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (
              <p className="text-center py-8 text-slate-500">No se encontraron reservas</p>
            )}
          </div>

          {/* Mobile & Tablet cards (< lg) */}
          <div className="lg:hidden divide-y divide-slate-200">
            {filteredBookings.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No se encontraron reservas</p>
            ) : filteredBookings.map((booking) => (
              <div key={booking.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-base">{booking.passenger_name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{booking.passenger_email || '—'} {booking.passenger_phone ? `• ${booking.passenger_phone}` : ''}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                    <Eye className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800 text-sm">{getShuttleName(booking.shuttle_id, booking)}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(booking.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="pt-1 border-t border-slate-200 space-y-1">
                    <p className="flex items-start gap-1 text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Recogida:</strong> {booking.pickup_location || 'No especificado'}</span>
                    </p>
                    <p className="flex items-start gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Entrega:</strong> {booking.dropoff_location || 'No especificado'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <div>
                    <span className="text-xs text-slate-400">Total ({booking.seats || 1} pax)</span>
                    <p className="font-black text-slate-900 text-lg">${booking.total_price} USD</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getPaymentBadgeVariant(booking.payment_status || 'pending')}>
                      {booking.payment_status === 'paid' ? 'Pagado' : booking.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                    </Badge>

                    {updatingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <Select
                        options={[
                          { value: 'pending', label: 'Pendiente' },
                          { value: 'confirmed', label: 'Confirmado' },
                          { value: 'completed', label: 'Completado' },
                          { value: 'cancelled', label: 'Cancelado' },
                        ]}
                        value={booking.status || 'pending'}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="text-xs py-1"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DETAIL MODAL WITH FULL HOSTEL & PASSENGER INFO */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Detalles de la Reserva</h2>
                <p className="text-xs text-slate-400">ID: {selectedBooking.id}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Shuttle Route Banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Ruta del Shuttle</p>
                <h3 className="text-lg font-bold text-emerald-950 mt-0.5">
                  {getShuttleName(selectedBooking.shuttle_id, selectedBooking)}
                </h3>
                <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha de viaje: <strong>{new Date(selectedBooking.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </p>
              </div>

              {/* HOSTELS SECTION (PICKUP & DROPOFF) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Puntos de Traslado (Hostales / Hoteles)</h4>
                
                {/* Pickup Hostel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-emerald-800 uppercase">Lugar / Hostal de Recogida (Origen)</p>
                    <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                      {selectedBooking.pickup_location || 'No especificado'}
                    </p>
                  </div>
                </div>

                {/* Dropoff Hostel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-blue-800 uppercase">Lugar / Hostal de Entrega (Destino)</p>
                    <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                      {selectedBooking.dropoff_location || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos del Pasajero</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <p className="text-xs text-slate-500">Nombre</p>
                    <p className="font-semibold text-slate-900">{selectedBooking.passenger_name || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <p className="text-xs text-slate-500">Teléfono / WhatsApp</p>
                    <p className="font-semibold text-slate-900">{selectedBooking.passenger_phone || '—'}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg sm:col-span-2">
                    <p className="text-xs text-slate-500">Correo Electrónico</p>
                    <p className="font-semibold text-slate-900 break-all">{selectedBooking.passenger_email || '—'}</p>
                  </div>
                  {(selectedBooking as any).pickup_person_name && (
                    <div className="bg-slate-50 p-2.5 rounded-lg sm:col-span-2">
                      <p className="text-xs text-slate-500">Persona a Recoger</p>
                      <p className="font-semibold text-slate-900">{(selectedBooking as any).pickup_person_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <p className="text-xs text-slate-500">Pasajeros</p>
                  <p className="font-bold text-slate-900">{selectedBooking.seats || 1} persona(s)</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <p className="text-xs text-slate-500">Equipaje Extra</p>
                  <p className="font-bold text-slate-900">
                    {selectedBooking.extra_luggage && selectedBooking.extra_luggage > 0
                      ? `${selectedBooking.extra_luggage} pieza(s)`
                      : 'Ninguno'}
                  </p>
                </div>
              </div>

              {/* Price & Status */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400">Total de la Reserva</p>
                  <p className="text-2xl font-black text-emerald-400">${selectedBooking.total_price} USD</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={getStatusBadgeVariant(selectedBooking.status || 'pending')}>
                    Estado: {translateStatus(selectedBooking.status || 'pending')}
                  </Badge>
                  <Badge variant={getPaymentBadgeVariant(selectedBooking.payment_status || 'pending')}>
                    Pago: {selectedBooking.payment_status === 'paid' ? 'Pagado' : selectedBooking.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center pt-2">
                Fecha de creación: {new Date(selectedBooking.created_at).toLocaleString('es-ES')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
