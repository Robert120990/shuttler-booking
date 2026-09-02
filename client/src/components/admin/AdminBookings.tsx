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

  const getShuttleName = (shuttleId: string) => {
    const shuttle = shuttles.find(s => s.id === shuttleId);
    return shuttle?.name || 'Unknown Route';
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingId(bookingId);
      await bookingsApi.updateStatus(bookingId, newStatus);
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating booking status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getShuttleName(booking.shuttle_id).toLowerCase().includes(searchTerm.toLowerCase());
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
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-slate-500">Manage all reservations and bookings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by customer, route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Passengers</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Luggage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Payment</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
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
                        <p className="text-slate-600">{getShuttleName(booking.shuttle_id)}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {booking.pickup_location || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(booking.date).toLocaleDateString('en-US', { 
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
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">${booking.total_price}</td>
                    <td className="py-3 px-4">
                      {updatingId === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Select
                          options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                          ]}
                          value={booking.status || 'pending'}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="min-w-[120px]"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getPaymentBadgeVariant(booking.payment_status || 'pending')}>
                        {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'refunded' ? 'Refunded' : 'Pending'}
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
              <p className="text-center py-8 text-slate-500">No bookings found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-bold">Booking Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Passenger</p>
                  <p className="font-medium">{selectedBooking.passenger_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedBooking.passenger_email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{selectedBooking.passenger_phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {(selectedBooking as any).pickup_person_name && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-500">Person to Pick Up</p>
                      <p className="font-medium">{(selectedBooking as any).pickup_person_name}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <p className="text-sm text-slate-500 mb-1">Route</p>
                <p className="font-medium">{getShuttleName(selectedBooking.shuttle_id)}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Pickup</p>
                      <p className="font-medium">{selectedBooking.pickup_location || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Dropoff</p>
                      <p className="font-medium">{selectedBooking.dropoff_location || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-8">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Passengers</p>
                  <p className="font-medium">{selectedBooking.seats || 1}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Luggage</p>
                  <p className="font-medium">
                    {selectedBooking.extra_luggage && selectedBooking.extra_luggage > 0 
                      ? `${selectedBooking.extra_luggage} bags`
                      : 'No extra luggage'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">Total Paid</p>
                  <p className="text-xl font-bold text-emerald-600">${selectedBooking.total_price}</p>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-2">
                <Badge variant={getStatusBadgeVariant(selectedBooking.status || 'pending')}>
                  {selectedBooking.status}
                </Badge>
                <Badge variant={getPaymentBadgeVariant(selectedBooking.payment_status || 'pending')}>
                  {selectedBooking.payment_status}
                </Badge>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Created: {new Date(selectedBooking.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
