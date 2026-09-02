import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { shuttlesApi, citiesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import type { Shuttle, City, LuggageOption } from '../../types';

export const AdminShuttles = () => {
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShuttle, setEditingShuttle] = useState<Shuttle | null>(null);
  const [formData, setFormData] = useState({
    name: '', origin_city_id: '', destination_city_id: '', price: '', duration_hours: '',
    schedule: '', availability: '', availability_days: [0,1,2,3,4,5,6] as number[],
    service_type: 'local', description: '',
    included: '', to_bring: '', luggage_policy: '', pickup_info: '',
    cancellation_policy: '', operator: '', pets_allowed: false,
    luggage_options: [] as LuggageOption[]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shuttlesRes, citiesRes] = await Promise.all([
        shuttlesApi.getAll(),
        citiesApi.getAll(),
      ]);
      setShuttles(shuttlesRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (shuttle?: Shuttle) => {
    if (shuttle) {
      setEditingShuttle(shuttle);
      let luggageOptions: LuggageOption[] = [];
      try {
        luggageOptions = typeof shuttle.luggage_options === 'string' 
          ? JSON.parse(shuttle.luggage_options) 
          : (shuttle.luggage_options || []);
      } catch {
        luggageOptions = [];
      }
      let availabilityDays = [0,1,2,3,4,5,6];
      try {
        availabilityDays = typeof (shuttle as any).availability_days === 'string' 
          ? JSON.parse((shuttle as any).availability_days) 
          : ((shuttle as any).availability_days || [0,1,2,3,4,5,6]);
      } catch { availabilityDays = [0,1,2,3,4,5,6]; }
      setFormData({
        name: shuttle.name,
        origin_city_id: (shuttle as any).origin_city_id || '',
        destination_city_id: (shuttle as any).destination_city_id || '',
        price: String(shuttle.price),
        duration_hours: String(shuttle.duration_hours),
        schedule: shuttle.schedule || '',
        availability: shuttle.availability || '',
        availability_days: availabilityDays,
        service_type: shuttle.service_type || 'local',
        description: shuttle.description || '',
        included: shuttle.included || '',
        to_bring: shuttle.to_bring || '',
        luggage_policy: shuttle.luggage_policy || '',
        pickup_info: shuttle.pickup_info || '',
        cancellation_policy: shuttle.cancellation_policy || '',
        operator: (shuttle as any).operator || '',
        pets_allowed: shuttle.pets_allowed || false,
        luggage_options: luggageOptions,
      });
    } else {
      setEditingShuttle(null);
      setFormData({
        name: '', origin_city_id: '', destination_city_id: '', price: '', duration_hours: '',
        schedule: '', availability: '', availability_days: [0,1,2,3,4,5,6],
        service_type: 'local', description: '',
        included: '', to_bring: '', luggage_policy: '', pickup_info: '',
        cancellation_policy: '', operator: '', pets_allowed: false,
        luggage_options: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShuttle(null);
  };

  const handleAddLuggageOption = () => {
    setFormData({
      ...formData,
      luggage_options: [...formData.luggage_options, { name: '', price: 0 }]
    });
  };

  const handleRemoveLuggageOption = (index: number) => {
    const newOptions = formData.luggage_options.filter((_, i) => i !== index);
    setFormData({ ...formData, luggage_options: newOptions });
  };

  const handleLuggageOptionChange = (index: number, field: 'name' | 'price', value: string | number) => {
    const newOptions = [...formData.luggage_options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, luggage_options: newOptions });
  };

  const toggleDay = (day: number) => {
    const days = formData.availability_days.includes(day)
      ? formData.availability_days.filter(d => d !== day)
      : [...formData.availability_days, day].sort();
    setFormData({ ...formData, availability_days: days });
  };

  const generateAvailabilityText = (days: number[]): string => {
    if (days.length === 0) return 'No days available';
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Monday to Friday';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Friday to Saturday';
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (days.length <= 3) {
      return days.sort((a, b) => a - b).map(d => shortDays[d]).join(', ');
    }
    
    const sorted = days.sort((a, b) => a - b);
    return `${shortDays[sorted[0]]} to ${shortDays[sorted[sorted.length - 1]]}`;
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const allDaysSelected = formData.availability_days.length === 7;
  const autoAvailability = generateAvailabilityText(formData.availability_days);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        name: formData.name,
        origin_city_id: formData.origin_city_id,
        destination_city_id: formData.destination_city_id,
        price: Number(formData.price),
        duration_hours: Number(formData.duration_hours),
        schedule: formData.schedule,
        availability: autoAvailability,
        availability_days: JSON.stringify(formData.availability_days),
        service_type: formData.service_type as 'local' | 'international',
        description: formData.description,
        included: formData.included,
        to_bring: formData.to_bring,
        luggage_policy: formData.luggage_policy,
        pickup_info: formData.pickup_info,
        cancellation_policy: formData.cancellation_policy,
        operator: formData.operator,
        pets_allowed: formData.pets_allowed,
        luggage_options: JSON.stringify(formData.luggage_options),
      };
      if (editingShuttle) {
        await shuttlesApi.update(editingShuttle.id, data);
      } else {
        await shuttlesApi.create(data);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving shuttle:', error);
      alert('Error saving shuttle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this shuttle?')) {
      try {
        await shuttlesApi.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting shuttle:', error);
        alert('Error deleting shuttle. Please try again.');
      }
    }
  };

  const filteredShuttles = shuttles.filter((shuttle) => {
    const matchesSearch = shuttle.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || shuttle.service_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const cityOptions = cities.map(c => ({ value: c.id, label: c.name }));

  const getCityName = (id: string) => cities.find(c => c.id === id)?.name || id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shuttles</h1>
          <p className="text-slate-500">Manage shuttle routes and services</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shuttle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search shuttles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Types' },
                { value: 'local', label: 'Local' },
                { value: 'international', label: 'International' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Image</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Route</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShuttles.map((shuttle) => (
                  <tr key={shuttle.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <img src={getImageUrl(shuttle.image_url)} alt={shuttle.name} className="w-16 h-10 rounded-lg object-cover" />
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{shuttle.name}</p>
                        <p className="text-sm text-slate-500">{getCityName((shuttle as any).origin_city_id)} → {getCityName((shuttle as any).destination_city_id)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={shuttle.service_type === 'international' ? 'warning' : 'success'}>
                        {shuttle.service_type === 'international' ? 'International' : 'Local'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-900">${shuttle.price}</td>
                    <td className="py-3 px-4 text-slate-600">{shuttle.duration_hours}h</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">active</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(shuttle)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(shuttle.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredShuttles.length === 0 && (
              <p className="text-center py-8 text-slate-500">No shuttles found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingShuttle ? 'Edit Shuttle' : 'Add New Shuttle'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Shuttle Name" placeholder="e.g., La Fortuna to Monteverde" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Select label="Origin City" options={[{ value: '', label: 'Select city' }, ...cityOptions]} value={formData.origin_city_id} onChange={(e) => setFormData({ ...formData, origin_city_id: e.target.value })} />
                <Select label="Destination City" options={[{ value: '', label: 'Select city' }, ...cityOptions]} value={formData.destination_city_id} onChange={(e) => setFormData({ ...formData, destination_city_id: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price ($)" type="number" placeholder="59" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                <Input label="Duration (hours)" type="number" placeholder="4" value={formData.duration_hours} onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })} />
              </div>
              <Input label="Schedule" placeholder="e.g., 8:00 AM" value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Days</label>
                <div className="flex gap-2 mb-2">
                  {dayLabels.map((label, day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        formData.availability_days.includes(day)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    availability_days: allDaysSelected ? [] : [0,1,2,3,4,5,6] 
                  })}
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  {allDaysSelected ? 'Clear all' : 'Select all'}
                </button>
                <span className="ml-4 text-sm text-slate-500">
                  Auto-generated: <span className="font-medium text-slate-700">{autoAvailability}</span>
                </span>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Included Services (comma separated)</label>
                <Input 
                  placeholder="Air conditioning, Door-to-door service, WiFi" 
                  value={formData.included} 
                  onChange={(e) => setFormData({ ...formData, included: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What to Bring (comma separated)</label>
                <Input 
                  placeholder="Book or Kindle, Headphones, Water" 
                  value={formData.to_bring} 
                  onChange={(e) => setFormData({ ...formData, to_bring: e.target.value })} 
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Luggage Options</label>
                <p className="text-xs text-slate-500 mb-3">Add extra luggage options with their prices</p>
                {formData.luggage_options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Option name (e.g., Surfboard)"
                      value={option.name}
                      onChange={(e) => handleLuggageOptionChange(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={option.price}
                      onChange={(e) => handleLuggageOptionChange(index, 'price', Number(e.target.value))}
                      className="w-24"
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveLuggageOption(index)} className="text-red-500">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddLuggageOption}>
                  <Plus className="w-4 h-4 mr-1" /> Add Option
                </Button>
              </div>

              <Input label="Luggage Policy" placeholder="e.g., 1 backpack and 1 carry-on per person" value={formData.luggage_policy} onChange={(e) => setFormData({ ...formData, luggage_policy: e.target.value })} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Information</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Enter pickup locations and details..."
                  value={formData.pickup_info}
                  onChange={(e) => setFormData({ ...formData, pickup_info: e.target.value })}
                />
              </div>

              <Input label="Operator" placeholder="e.g., Local third-party operator" value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value })} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Policy</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="e.g., Free cancellation up to 24 hours before departure."
                  value={formData.cancellation_policy}
                  onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pets_allowed"
                  checked={formData.pets_allowed}
                  onChange={(e) => setFormData({ ...formData, pets_allowed: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="pets_allowed" className="text-sm text-slate-700">Pets Allowed</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving || !formData.name || !formData.origin_city_id || !formData.destination_city_id}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
