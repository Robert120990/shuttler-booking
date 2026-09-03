import { useState, useEffect } from 'react';
import { Search, Eye, Loader2, X, MapPin, Package, User } from 'lucide-react';
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
    const matchesSearch =
      passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      routeName.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'info';
      default: return 'default';
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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reservas</h1>
        <p className="text-slate-500 text-sm sm:text-base">Gestiona todas las reservas y pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente, ruta..."
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
        <CardContent>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Ruta</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Pasajeros</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Equipaje</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Pago</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{booking.passenger_name || 'N/A'}</p>
                        <p className="text-sm text-slate-500">{booking.passenger_email || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{booking.passenger_phone || ''}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-slate-600">{getShuttleName(booking.shuttle_id, booking)}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.pickup_location || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(booking.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {booking.seats || 1}
                    </td>
                    <td className="py-3 px-4">
                      {booking.extra_luggage && booking.extra_luggage > 0 ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Package className="w-4 h-4" />
                          <span>{booking.extra_luggage}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Ninguno</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">${booking.total_price}</td>
                    <td className="py-3 px-4">
                      {updatingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
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
                          className="min-w-[120px]"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getPaymentBadgeVariant(booking.payment_status || 'pending')}>
                        {booking.payment_status === 'paid' ? 'Pagado' : booking.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="w-4 h-4" />
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredBookings.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No se encontraron reservas</p>
            ) : filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{booking.passenger_name || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{booking.passenger_email || 'N/A'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-slate-700 font-medium">{getShuttleName(booking.shuttle_id, booking)}</p>
                  <p className="text-slate-500">{new Date(booking.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.pickup_location || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-bold text-slate-900">${booking.total_price}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getPaymentBadgeVariant(booking.payment_status || 'pending')}>
                      {booking.payment_status === 'paid' ? 'Pagado' : booking.payment_status === 'refunded' ? 'Reembolsado' : 'Pendiente'}
                    </Badge>
                    {updatingId === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
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
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-100">
              <h2 className="text-lg font-bold">Detalles de la Reserva</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Pasajero</p>
                  <p className="font-medium">{selectedBooking.passenger_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium break-all">{selectedBooking.passenger_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Teléfono</p>
                  <p className="font-medium">{selectedBooking.passenger_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fecha</p>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
              
              {(selectedBooking as any).pickup_person_name && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Persona a recoger</p>
                      <p className="font-medium">{(selectedBooking as any).pickup_person_name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="text-sm text-slate-500 mb-1">Ruta</p>
                <p className="font-medium">{getShuttleName(selectedBooking.shuttle_id, selectedBooking)}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">Recogida</p>
                      <p className="font-medium">{selectedBooking.pickup_location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-slate-500">Entrega</p>
                      <p className="font-medium">{selectedBooking.dropoff_location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Pasajeros</p>
                  <p className="font-medium">{selectedBooking.seats || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Equipaje</p>
                  <p className="font-medium">
                    {selectedBooking.extra_luggage && selectedBooking.extra_luggage > 0 
                      ? `${selectedBooking.extra_luggage} maletas`
                      : 'Sin equipaje extra'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">Total Pagado</p>
                  <p className="text-xl font-bold text-emerald-600">${selectedBooking.total_price}</p>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2 flex-wrap">
                <Badge variant={getStatusBadgeVariant(selectedBooking.status || 'pending')}>
                  {selectedBooking.status}
                </Badge>
                <Badge variant={getPaymentBadgeVariant(selectedBooking.payment_status || 'pending')}>
                  {selectedBooking.payment_status}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Creado: {new Date(selectedBooking.created_at).toLocaleString('es-ES')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
