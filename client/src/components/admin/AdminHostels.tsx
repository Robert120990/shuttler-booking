import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, X, Building2, MapPin, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { hostelsApi, citiesApi, countriesApi } from '../../api/endpoints';
import type { Hostel, City, Country } from '../../types';

export const AdminHostels = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country_id: '',
    city_id: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, citiesRes, countriesRes] = await Promise.all([
        hostelsApi.getAll(),
        citiesApi.getAll(),
        countriesApi.getAll(),
      ]);
      setHostels(hostelsRes.data || []);
      setCities(citiesRes.data || []);
      setCountries(countriesRes.data || []);
    } catch (error) {
      console.error('Error cargando datos de hostales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hostel?: Hostel) => {
    if (hostel) {
      setEditingHostel(hostel);
      const foundCity = cities.find(c => c.id === hostel.city_id);
      setFormData({
        name: hostel.name,
        country_id: foundCity?.country_id || '',
        city_id: hostel.city_id,
        address: hostel.address || '',
        phone: hostel.phone || '',
      });
    } else {
      setEditingHostel(null);
      const defaultCountry = countries[0]?.id || '';
      const availableCities = cities.filter(c => !defaultCountry || c.country_id === defaultCountry);
      setFormData({
        name: '',
        country_id: defaultCountry,
        city_id: availableCities[0]?.id || '',
        address: '',
        phone: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHostel(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city_id) {
      alert('Por favor ingresa el nombre del hostal y selecciona una ciudad.');
      return;
    }

    try {
      setSaving(true);
      if (editingHostel) {
        await hostelsApi.update(editingHostel.id, {
          name: formData.name,
          city_id: formData.city_id,
          address: formData.address,
          phone: formData.phone,
        });
      } else {
        await hostelsApi.create({
          name: formData.name,
          city_id: formData.city_id,
          address: formData.address,
          phone: formData.phone,
        });
      }
      await fetchData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error al guardar hostal:', error);
      const msg = error.response?.data?.error || 'Error al guardar el hostal. Intenta de nuevo.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el hostal "${name}"?`)) {
      try {
        await hostelsApi.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error al eliminar hostal:', error);
        alert('Error al eliminar el hostal. Intenta de nuevo.');
      }
    }
  };

  // Filter available cities in modal when country changes
  const modalAvailableCities = cities.filter(
    c => !formData.country_id || c.country_id === formData.country_id
  );

  // Filter available cities for table filter
  const filterAvailableCities = cities.filter(
    c => !selectedCountryFilter || c.country_id === selectedCountryFilter
  );

  const filteredHostels = hostels.filter((hostel) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      hostel.name.toLowerCase().includes(query) ||
      (hostel.city_name || '').toLowerCase().includes(query) ||
      (hostel.country_name || '').toLowerCase().includes(query) ||
      (hostel.address || '').toLowerCase().includes(query);

    const matchesCity = !selectedCityFilter || hostel.city_id === selectedCityFilter;
    const matchesCountry = !selectedCountryFilter || (() => {
      const city = cities.find(c => c.id === hostel.city_id);
      return city?.country_id === selectedCountryFilter;
    })();

    return matchesSearch && matchesCity && matchesCountry;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Hostales y Hoteles</h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Administra los puntos de recogida y entrega para las reservas por cada ciudad
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Hostal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Hostales</p>
              <p className="text-2xl font-bold text-slate-900">{hostels.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ciudades con Puntos</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(hostels.map(h => h.city_id)).size}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Países Cubiertos</p>
              <p className="text-2xl font-bold text-slate-900">
                {new Set(hostels.map(h => h.country_name).filter(Boolean)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por hostal, ciudad, dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCountryFilter}
                onChange={(e) => {
                  setSelectedCountryFilter(e.target.value);
                  setSelectedCityFilter('');
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Todos los Países</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedCityFilter}
                onChange={(e) => setSelectedCityFilter(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">Todas las Ciudades</option>
                {filterAvailableCities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-medium border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3">Hostal / Hotel</th>
                  <th className="px-6 py-3">Ciudad / Destino</th>
                  <th className="px-6 py-3">País</th>
                  <th className="px-6 py-3">Dirección</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHostels.map((hostel) => (
                  <tr key={hostel.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{hostel.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default">
                        {hostel.city_name || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {hostel.country_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {hostel.address || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {hostel.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(hostel)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(hostel.id, hostel.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHostels.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron hostales con los filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {filteredHostels.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No se encontraron hostales</p>
            ) : filteredHostels.map((hostel) => (
              <div key={hostel.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{hostel.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-xs">
                        {hostel.city_name || 'N/A'}
                      </Badge>
                      <span className="text-xs text-slate-500">{hostel.country_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(hostel)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(hostel.id, hostel.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {hostel.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{hostel.address}</span>
                  </p>
                )}
                {hostel.phone && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span>{hostel.phone}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingHostel ? 'Editar Hostal' : 'Agregar Nuevo Hostal'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSave}>
              <CardContent className="space-y-4">
                <Input
                  label="Nombre del Hostal / Hotel"
                  placeholder="ej. Selina La Fortuna, Hotel Casa Santo Domingo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      País
                    </label>
                    <select
                      value={formData.country_id}
                      onChange={(e) => {
                        const newCountryId = e.target.value;
                        const available = cities.filter(c => !newCountryId || c.country_id === newCountryId);
                        setFormData({
                          ...formData,
                          country_id: newCountryId,
                          city_id: available[0]?.id || '',
                        });
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ciudad / Destino <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.city_id}
                      onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      required
                    >
                      {modalAvailableCities.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Dirección / Punto de Referencia"
                  placeholder="ej. Avenida Central, Frente a la plaza"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />

                <Input
                  label="Teléfono / Contacto"
                  placeholder="ej. +506 2479 7249"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={saving || !formData.name || !formData.city_id}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
