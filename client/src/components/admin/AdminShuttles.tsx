import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { shuttlesApi, citiesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import type { Shuttle, City, LuggageOption } from '../../types';

export const CONVENTIONAL_SHUTTLE_DEFAULTS = {
  schedule: '8:00 AM',
  duration_hours: '4',
  availability_days: [0, 1, 2, 3, 4, 5, 6],
  availability: 'Todos los días',
  service_type: 'local' as 'local' | 'international',
  included: 'Aire acondicionado, Servicio puerta a puerta, WiFi gratuito',
  to_bring: 'Agua, Pasaporte / Documento de identidad, Audífonos, Ropa cómoda',
  luggage_policy: '1 mochila o maleta principal y 1 bolso de mano por persona',
  pickup_info: 'Recogida directa en el lobby de tu hotel u hostal. Por favor estar listo 15 minutos antes de la hora indicada.',
  cancellation_policy: 'Cancelación gratuita hasta 24 horas antes de la salida.',
  operator: 'Trail Explorer Partner',
  pets_allowed: false,
  luggage_options: [
    { name: 'Maleta adicional', price: 15 },
    { name: 'Tabla de surf', price: 25 },
  ] as LuggageOption[],
};

export const AdminShuttles = () => {
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShuttle, setEditingShuttle] = useState<Shuttle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    origin_city_id: '',
    destination_city_id: '',
    price: '55',
    duration_hours: CONVENTIONAL_SHUTTLE_DEFAULTS.duration_hours,
    schedule: CONVENTIONAL_SHUTTLE_DEFAULTS.schedule,
    availability: CONVENTIONAL_SHUTTLE_DEFAULTS.availability,
    availability_days: CONVENTIONAL_SHUTTLE_DEFAULTS.availability_days as number[],
    service_type: CONVENTIONAL_SHUTTLE_DEFAULTS.service_type,
    description: '',
    included: CONVENTIONAL_SHUTTLE_DEFAULTS.included,
    to_bring: CONVENTIONAL_SHUTTLE_DEFAULTS.to_bring,
    luggage_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_policy,
    pickup_info: CONVENTIONAL_SHUTTLE_DEFAULTS.pickup_info,
    cancellation_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.cancellation_policy,
    operator: CONVENTIONAL_SHUTTLE_DEFAULTS.operator,
    pets_allowed: CONVENTIONAL_SHUTTLE_DEFAULTS.pets_allowed,
    luggage_options: [...CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_options] as LuggageOption[],
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
        name: '',
        origin_city_id: '',
        destination_city_id: '',
        price: '55',
        duration_hours: CONVENTIONAL_SHUTTLE_DEFAULTS.duration_hours,
        schedule: CONVENTIONAL_SHUTTLE_DEFAULTS.schedule,
        availability: CONVENTIONAL_SHUTTLE_DEFAULTS.availability,
        availability_days: CONVENTIONAL_SHUTTLE_DEFAULTS.availability_days,
        service_type: CONVENTIONAL_SHUTTLE_DEFAULTS.service_type,
        description: '',
        included: CONVENTIONAL_SHUTTLE_DEFAULTS.included,
        to_bring: CONVENTIONAL_SHUTTLE_DEFAULTS.to_bring,
        luggage_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_policy,
        pickup_info: CONVENTIONAL_SHUTTLE_DEFAULTS.pickup_info,
        cancellation_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.cancellation_policy,
        operator: CONVENTIONAL_SHUTTLE_DEFAULTS.operator,
        pets_allowed: CONVENTIONAL_SHUTTLE_DEFAULTS.pets_allowed,
        luggage_options: [...CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_options],
      });
    }
    setShowModal(true);
  };

  const handleOriginChange = (originId: string) => {
    const origin = cities.find(c => c.id === originId);
    const dest = cities.find(c => c.id === formData.destination_city_id);

    let nextServiceType = formData.service_type;
    if (origin && dest && origin.country_id && dest.country_id) {
      nextServiceType = origin.country_id === dest.country_id ? 'local' : 'international';
    }

    const currentOrigin = cities.find(c => c.id === formData.origin_city_id);
    const prevSuggested = currentOrigin && dest ? `${currentOrigin.name} a ${dest.name}` : '';
    let nextName = formData.name;
    if (!formData.name || formData.name === prevSuggested || formData.name.endsWith(' a ...')) {
      nextName = origin && dest ? `${origin.name} a ${dest.name}` : (origin ? `${origin.name} a ...` : '');
    }

    let nextDesc = formData.description;
    if (!formData.description && origin && dest) {
      nextDesc = `Transporte compartido cómodo y seguro de ${origin.name} a ${dest.name}. Servicio puerta a puerta entre hostales y hoteles con aire acondicionado.`;
    }

    setFormData(prev => ({
      ...prev,
      origin_city_id: originId,
      service_type: nextServiceType,
      name: nextName,
      description: nextDesc,
    }));
  };

  const handleDestinationChange = (destId: string) => {
    const origin = cities.find(c => c.id === formData.origin_city_id);
    const dest = cities.find(c => c.id === destId);

    let nextServiceType = formData.service_type;
    if (origin && dest && origin.country_id && dest.country_id) {
      nextServiceType = origin.country_id === dest.country_id ? 'local' : 'international';
    }

    const currentDest = cities.find(c => c.id === formData.destination_city_id);
    const prevSuggested = origin && currentDest ? `${origin.name} a ${currentDest.name}` : '';
    let nextName = formData.name;
    if (!formData.name || formData.name === prevSuggested || formData.name.endsWith(' a ...')) {
      nextName = origin && dest ? `${origin.name} a ${dest.name}` : '';
    }

    let nextDesc = formData.description;
    if (!formData.description && origin && dest) {
      nextDesc = `Transporte compartido cómodo y seguro de ${origin.name} a ${dest.name}. Servicio puerta a puerta entre hostales y hoteles con aire acondicionado.`;
    }

    setFormData(prev => ({
      ...prev,
      destination_city_id: destId,
      service_type: nextServiceType,
      name: nextName,
      description: nextDesc,
    }));
  };

  const handleApplyDefaults = () => {
    const origin = cities.find(c => c.id === formData.origin_city_id);
    const dest = cities.find(c => c.id === formData.destination_city_id);
    const suggestedName = origin && dest ? `${origin.name} a ${dest.name}` : formData.name;
    const suggestedDesc = origin && dest 
      ? `Transporte compartido cómodo y seguro de ${origin.name} a ${dest.name}. Servicio puerta a puerta entre hostales y hoteles con aire acondicionado.`
      : formData.description;

    let nextServiceType = formData.service_type;
    if (origin && dest && origin.country_id && dest.country_id) {
      nextServiceType = origin.country_id === dest.country_id ? 'local' : 'international';
    }

    setFormData(prev => ({
      ...prev,
      name: prev.name || suggestedName,
      description: prev.description || suggestedDesc,
      price: prev.price || '55',
      duration_hours: prev.duration_hours || CONVENTIONAL_SHUTTLE_DEFAULTS.duration_hours,
      schedule: prev.schedule || CONVENTIONAL_SHUTTLE_DEFAULTS.schedule,
      availability_days: prev.availability_days?.length ? prev.availability_days : CONVENTIONAL_SHUTTLE_DEFAULTS.availability_days,
      service_type: nextServiceType,
      included: CONVENTIONAL_SHUTTLE_DEFAULTS.included,
      to_bring: CONVENTIONAL_SHUTTLE_DEFAULTS.to_bring,
      luggage_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_policy,
      pickup_info: CONVENTIONAL_SHUTTLE_DEFAULTS.pickup_info,
      cancellation_policy: CONVENTIONAL_SHUTTLE_DEFAULTS.cancellation_policy,
      operator: CONVENTIONAL_SHUTTLE_DEFAULTS.operator,
      luggage_options: prev.luggage_options.length ? prev.luggage_options : [...CONVENTIONAL_SHUTTLE_DEFAULTS.luggage_options],
    }));
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
    if (days.length === 0) return 'Sin días disponibles';
    if (days.length === 7) return 'Todos los días';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Lunes a Viernes';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Fines de semana';
    if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Viernes a Sábado';
    
    const shortDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    if (days.length <= 3) {
      return days.sort((a, b) => a - b).map(d => shortDays[d]).join(', ');
    }
    
    const sorted = days.sort((a, b) => a - b);
    return `${shortDays[sorted[0]]} a ${shortDays[sorted[sorted.length - 1]]}`;
  };

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
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
      alert('Error al guardar el shuttle. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este shuttle?')) {
      try {
        await shuttlesApi.delete(id);
        await fetchData();
      } catch (error) {
        console.error('Error deleting shuttle:', error);
        alert('Error al eliminar el shuttle. Por favor intenta de nuevo.');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Shuttles</h1>
          <p className="text-slate-500 text-sm sm:text-base">Gestiona rutas y servicios de shuttle</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Shuttle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar shuttles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'Todos los tipos' },
                { value: 'local', label: 'Local' },
                { value: 'international', label: 'Internacional' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Imagen</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Ruta</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Precio</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Duración</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Acciones</th>
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
                        {shuttle.service_type === 'international' ? 'Internacional' : 'Local'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-900">${shuttle.price}</td>
                    <td className="py-3 px-4 text-slate-600">{shuttle.duration_hours}h</td>
                    <td className="py-3 px-4">
                      <Badge variant="success">activo</Badge>
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
              <p className="text-center py-8 text-slate-500">No se encontraron shuttles</p>
            )}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filteredShuttles.length === 0 ? (
              <p className="text-center py-8 text-slate-500">No se encontraron shuttles</p>
            ) : filteredShuttles.map((shuttle) => (
              <div key={shuttle.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <img src={getImageUrl(shuttle.image_url)} alt={shuttle.name} className="w-full h-32 object-cover" />
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{shuttle.name}</p>
                      <p className="text-sm text-slate-500">{getCityName((shuttle as any).origin_city_id)} → {getCityName((shuttle as any).destination_city_id)}</p>
                    </div>
                    <Badge variant={shuttle.service_type === 'international' ? 'warning' : 'success'}>
                      {shuttle.service_type === 'international' ? 'Intl.' : 'Local'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">${shuttle.price}</span>
                      <span>{shuttle.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(shuttle)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(shuttle.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
          <Card className="w-full max-w-2xl my-4">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 border-b border-slate-100">
              <CardTitle>{editingShuttle ? 'Editar Shuttle' : 'Agregar Nuevo Shuttle'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conventional defaults banner and quick-apply button */}
              <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-xs text-emerald-950 font-medium leading-tight">
                    Prellenado con la información convencional establecida de Trail Explorer.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyDefaults}
                  className="text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap self-end sm:self-auto"
                >
                  ⚡ Reaplicar valores convencionales
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Ciudad de Origen"
                  options={[{ value: '', label: 'Seleccionar ciudad' }, ...cityOptions]}
                  value={formData.origin_city_id}
                  onChange={(e) => handleOriginChange(e.target.value)}
                  required
                />
                <Select
                  label="Ciudad de Destino"
                  options={[{ value: '', label: 'Seleccionar ciudad' }, ...cityOptions]}
                  value={formData.destination_city_id}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  required
                />
              </div>

              {/* Vista Previa de Fusión Inteligente de Portada */}
              {(() => {
                const origin = cities.find(c => c.id === formData.origin_city_id);
                const dest = cities.find(c => c.id === formData.destination_city_id);
                if (!origin || !dest) return null;
                return (
                  <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 text-white space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Fusión Inteligente de Portada (800×400 WebP)
                      </span>
                      <span className="text-slate-400 text-[11px]">Se optimizará y creará automáticamente al guardar</span>
                    </div>
                    <div className="relative h-28 rounded-lg overflow-hidden flex border border-slate-700/80 bg-slate-950">
                      <div className="w-1/2 h-full relative">
                        <img src={getImageUrl(origin.image_url)} alt={origin.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                          <span className="text-white text-xs font-bold truncate">{origin.name}</span>
                        </div>
                      </div>
                      <div className="w-1/2 h-full relative">
                        <img src={getImageUrl(dest.image_url)} alt={dest.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
                          <span className="text-white text-xs font-bold truncate">{dest.name}</span>
                        </div>
                      </div>
                      {/* Divisor e insignia central */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/75 flex items-center justify-center pointer-events-none">
                        <div className="w-7 h-7 bg-white rounded-full p-0.5 shadow-lg flex items-center justify-center">
                          <div className="w-full h-full bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                            ➔
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <Input
                label="Nombre del Shuttle / Viaje"
                placeholder="ej., La Fortuna a Monteverde"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Viaje</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="Breve descripción del trayecto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Precio ($ USD)"
                  type="number"
                  placeholder="55"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Duración (horas)"
                  type="number"
                  placeholder="4"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                  required
                />
                <Select
                  label="Tipo de Servicio"
                  options={[
                    { value: 'local', label: 'Local (Nacional)' },
                    { value: 'international', label: 'Internacional (Fronterizo)' },
                  ]}
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value as any })}
                />
              </div>

              <Input
                label="Horario de Salida"
                placeholder="ej., 8:00 AM"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Días Disponibles</label>
                <div className="flex flex-wrap gap-2 mb-2">
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
                  {allDaysSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                </button>
                <span className="ml-4 text-sm text-slate-500">
                  Auto: <span className="font-medium text-slate-700">{autoAvailability}</span>
                </span>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Servicios Incluidos (separados por coma)</label>
                <Input 
                  placeholder="Aire acondicionado, Servicio puerta a puerta, WiFi" 
                  value={formData.included} 
                  onChange={(e) => setFormData({ ...formData, included: e.target.value })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Qué Traer (separados por coma)</label>
                <Input 
                  placeholder="Libro, Audífonos, Agua" 
                  value={formData.to_bring} 
                  onChange={(e) => setFormData({ ...formData, to_bring: e.target.value })} 
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Opciones de Equipaje</label>
                <p className="text-xs text-slate-500 mb-3">Agrega opciones de equipaje extra con sus precios</p>
                {formData.luggage_options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Nombre (ej., Tabla de surf)"
                      value={option.name}
                      onChange={(e) => handleLuggageOptionChange(index, 'name', e.target.value)}
                      className="flex-1 min-w-0"
                    />
                    <Input
                      type="number"
                      placeholder="Precio"
                      value={option.price}
                      onChange={(e) => handleLuggageOptionChange(index, 'price', Number(e.target.value))}
                      className="w-20 sm:w-24"
                    />
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveLuggageOption(index)} className="text-red-500 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddLuggageOption}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar Opción
                </Button>
              </div>

              <Input label="Política de Equipaje" placeholder="ej., 1 mochila y 1 bolso de mano por persona" value={formData.luggage_policy} onChange={(e) => setFormData({ ...formData, luggage_policy: e.target.value })} />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Información de Recogida</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Ingresa los lugares y detalles de recogida..."
                  value={formData.pickup_info}
                  onChange={(e) => setFormData({ ...formData, pickup_info: e.target.value })}
                />
              </div>

              <Input label="Operador" placeholder="ej., Operador tercero local" value={formData.operator} onChange={(e) => setFormData({ ...formData, operator: e.target.value })} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Política de Cancelación</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                  placeholder="ej., Cancelación gratuita hasta 24 horas antes de la salida."
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
                <label htmlFor="pets_allowed" className="text-sm text-slate-700">Se permiten mascotas</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleCloseModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving || !formData.name || !formData.origin_city_id || !formData.destination_city_id}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
