import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin, Bus, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { countriesApi, citiesApi, shuttlesApi, bookingsApi } from '../../api/endpoints';
import type { Booking } from '../../types';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ countries: 0, cities: 0, shuttles: 0, bookings: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, citiesRes, shuttlesRes, bookingsRes] = await Promise.all([
          countriesApi.getAll(),
          citiesApi.getAll(),
          shuttlesApi.getAll(),
          bookingsApi.getAll(),
        ]);
        setStats({
          countries: countriesRes.data.length,
          cities: citiesRes.data.length,
          shuttles: shuttlesRes.data.length,
          bookings: bookingsRes.data.length,
        });
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statsData = [
    { label: 'Total Countries', value: stats.countries.toString(), icon: Globe, change: 'Total available', positive: true },
    { label: 'Total Cities', value: stats.cities.toString(), icon: MapPin, change: 'All destinations', positive: true },
    { label: 'Active Shuttles', value: stats.shuttles.toString(), icon: Bus, change: 'All routes', positive: true },
    { label: 'Total Bookings', value: stats.bookings.toString(), icon: Calendar, change: 'All reservations', positive: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <stat.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Bookings
              <Link to="/admin/bookings" className="text-sm font-normal text-emerald-600 hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{booking.passenger_name || 'N/A'}</p>
                    <p className="text-sm text-slate-500">{booking.passenger_email || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">${booking.total_price}</p>
                    <p className="text-sm text-slate-500">{new Date(booking.date).toLocaleDateString()}</p>
                    <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : booking.status === 'completed' ? 'info' : 'default'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-center py-4">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Routes
              <Link to="/admin/shuttles" className="text-sm font-normal text-emerald-600 hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-slate-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <p>View all shuttles to see route statistics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Revenue chart will be implemented with a charting library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
