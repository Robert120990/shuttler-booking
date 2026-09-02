import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ImageUploader } from '../ui/ImageUploader';

import { citiesApi, countriesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import type { City, Country } from '../../types';

export const AdminCities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image_url: '', country_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesRes, countriesRes] = await Promise.all([
        citiesApi.getAll(),
        countriesApi.getAll(),
      ]);
      setCities(citiesRes.data);
      setCountries(countriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (city?: City) => {
    if (city) {
      setEditingCity(city);
      setFormData({ 
        name: city.name, 
        slug: city.slug, 
        description: (city as any).description || '', 
        image_url: (city as any).image_url || '',
        country_id: (city as any).country_id || (city as any).country?.id || ''
      });
    } else {
      setEditingCity(null);
      setFormData({ name: '', slug: '', description: '', image_url: '', country_id: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCity(null);
    setFormData({ name: '', slug: '', description: '', image_url: '', country_id: '' });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingCity) {
        await citiesApi.update(editingCity.id, formData);
      } else {
        await citiesApi.create(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving city:', error);
      alert('Error saving city. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this city?')) {
      try {
        await citiesApi.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting city:', error);
        alert('Error deleting city. Please try again.');
      }
    }
  };

  const countryOptions = countries.map(c => ({ value: c.id, label: c.name }));
  
  const filteredCities = cities.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cityCountryId = (city as any).country_id || (city as any).country?.id || '';
    const matchesCountry = !countryFilter || cityCountryId === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const getCountryName = (city: City) => {
    const countryId = (city as any).country_id || (city as any).country?.id;
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'Unknown';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cities</h1>
          <p className="text-slate-500">Manage cities and locations</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add City
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              options={[{ value: '', label: 'All Countries' }, ...countryOptions]}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">City</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Country</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Slug</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCities.map((city) => (
                  <tr key={city.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl((city as any).image_url) || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80'} alt={city.name} className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-slate-900">{city.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{getCountryName(city)}</td>
                    <td className="py-3 px-4 text-slate-600">{city.slug}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(city)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(city.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCities.length === 0 && (
              <p className="text-center py-8 text-slate-500">No cities found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCity ? 'Edit City' : 'Add New City'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="City Name" 
                placeholder="e.g., San José" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Select 
                label="Country" 
                options={[{ value: '', label: 'Select Country' }, ...countryOptions]}
                value={formData.country_id}
                onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
              />
              <Input 
                label="Slug" 
                placeholder="e.g., san-jose" 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
              <Input 
                label="Description" 
                placeholder="Brief description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <ImageUploader 
                label="Image"
                type="city"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
              />
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving || !formData.name || !formData.country_id}>
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
