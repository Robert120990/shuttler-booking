import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { shuttlesApi, citiesApi } from '../../api/endpoints';
import { getImageUrl } from '../../api/client';
import type { Shuttle, City, LuggageOption } from '../../types';
import { TripServicesSelector } from './TripServicesSelector';
import { TripToBringSelector } from './TripToBringSelector';
import { TripPickupDropoffSelector } from './TripPickupDropoffSelector';

export const CONVENTIONAL_SHUTTLE_DEFAULTS = {
  schedule: '8:00 AM',
  duration_hours: '4',
  availability_days: [0, 1, 2, 3, 4, 5, 6],
  availability: 'Todos los días',
  service_type: 'local' as 'local' | 'international',
  included: 'A/C, Parada de Servicio, Asientos Reclinables, Enchufe de Carga, Wifi, Alimentos y Bebidas',
  to_bring: 'Pasaporte / Identificación, Agua, Chaqueta o Suéter, Audífonos, Ropa Cómoda, Cargador de Celular, Dinero en Efectivo',
  luggage_policy: '1 mochila o maleta principal y 1 bolso de mano por persona',
  pickup_info: 'Recogida: Puerta a Puerta (Hoteles y Hostales) - Recogida directa en el lobby de tu hotel u hostal (estar listo 15 min antes).\nEntrega: Entrega Puerta a Puerta (Hoteles y Hostales) - Desembarque directo en la puerta de tu hotel, hostal o alojamiento.',
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
  const [isGeneratingFusion, setIsGeneratingFusion] = useState(false);
  const [batchRegenerating, setBatchRegenerating] = useState(false);
  const [rowRegeneratingId, setRowRegeneratingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    origin_city_id: '',
    destination_city_id: '',
    image_url: '',
    regenerate_image: true,
    image_mode: 'fusion' as 'fusion' | 'custom',
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

      const currentImg = shuttle.image_url || '';
      const isFusion = currentImg.includes('/images/shuttles/');

      setFormData({
        name: shuttle.name,
        origin_city_id: (shuttle as any).origin_city_id || '',
        destination_city_id: (shuttle as any).destination_city_id || '',
        image_url: currentImg,
        regenerate_image: !isFusion, // Default to true if not yet a fusion image
        image_mode: isFusion || !currentImg ? 'fusion' : 'custom',
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
        image_url: '',
        regenerate_image: true,
        image_mode: 'fusion',
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

  const handleGenerateFusionNow = async () => {
    if (!formData.origin_city_id || !formData.destination_city_id) {
      alert('Por favor selecciona primero la Ciudad de Origen y la Ciudad de Destino.');
      return;
    }
    try {
      setIsGeneratingFusion(true);
      const res = await shuttlesApi.generateFusion({
        origin_city_id: formData.origin_city_id,
        destination_city_id: formData.destination_city_id,
        shuttle_id: editingShuttle ? editingShuttle.id : undefined,
      });
      if (res.data?.image_url) {
        setFormData(prev => ({
          ...prev,
          image_url: res.data.image_url,
          regenerate_image: false, // already generated right now
        }));
        setActionMessage({
          text: '✨ ¡Portada de fusión (800×400 WebP) generada exitosamente!',
          type: 'success',
        });
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (error) {
      console.error('Error generando portada de fusión:', error);
      alert('Error al generar la portada combinada. Verifica que las ciudades tengan imágenes asociadas.');
    } finally {
      setIsGeneratingFusion(false);
    }
  };

  const handleRegenerateRowFusion = async (shuttle: Shuttle) => {
    const originId = (shuttle as any).origin_city_id;
    const destId = (shuttle as any).destination_city_id;
    if (!originId || !destId) {
      alert('Este viaje no tiene ciudades de origen y destino válidas asignadas.');
      return;
    }
    try {
      setRowRegeneratingId(shuttle.id);
      await shuttlesApi.generateFusion({
        origin_city_id: originId,
        destination_city_id: destId,
        shuttle_id: shuttle.id,
      });
      await fetchData();
      setActionMessage({
        text: `✨ ¡Portada combinada regenerada para "${shuttle.name}"!`,
        type: 'success',
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (error) {
      console.error('Error regenerando fila:', error);
      alert('Error al regenerar la portada combinada de este viaje.');
    } finally {
      setRowRegeneratingId(null);
    }
  };

  const handleRegenerateAllFusion = async () => {
    if (!confirm('¿Deseas regenerar la portada inteligente combinada para TODOS los viajes del sistema? Esto creará una portada optimizada de 800×400 WebP para cada ruta activa.')) {
      return;
    }
    try {
      setBatchRegenerating(true);
      const res = await shuttlesApi.regenerateAllFusion();
      await fetchData();
      setActionMessage({
        text: `✨ ¡Se han generado y actualizado ${res.data.updated} portadas de fusión exitosamente!`,
        type: 'success',
      });
      setTimeout(() => setActionMessage(null), 5000);
    } catch (error) {
      console.error('Error regenerando todas las fusiones:', error);
      alert('Error al regenerar las portadas de todos los viajes.');
    } finally {
      setBatchRegenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const isCustom = formData.image_mode === 'custom';
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
        image_url: isCustom ? formData.image_url : (formData.regenerate_image ? '' : formData.image_url),
        regenerate_image: !isCustom ? formData.regenerate_image : false,
      };
      if (editingShuttle) {
        await shuttlesApi.update(editingShuttle.id, data);
      } else {
        await shuttlesApi.create(data);
      }
      await fetchData();
      handleCloseModal();
      setActionMessage({
        text: '✨ ¡Viaje guardado exitosamente con su portada optimizada!',
        type: 'success',
      });
      setTimeout(() => setActionMessage(null), 4000);
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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleRegenerateAllFusion}
            disabled={batchRegenerating}
            className="w-full sm:w-auto border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold shadow-sm"
          >
            {batchRegenerating ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin text-emerald-600" />
            ) : (
              <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
            )}
            {batchRegenerating ? 'Regenerando Portadas...' : '⚡ Regenerar Portadas de Fusión'}
          </Button>
          <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Shuttle
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between shadow-sm animate-fade-in ${
          actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'
        }`}>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img 
                          src={getImageUrl(shuttle.image_url || (shuttle as any).destination_image || (shuttle as any).origin_image)} 
                          alt={shuttle.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                        {shuttle.image_url?.includes('/images/shuttles/') ? (
                          <span className="absolute bottom-0 right-0 bg-emerald-600/90 text-white text-[8px] font-bold px-1 py-0.5 rounded-tl shadow">
                            Fusión
                          </span>
                        ) : (
                          <span className="absolute bottom-0 right-0 bg-slate-700/80 text-white text-[8px] font-medium px-1 py-0.5 rounded-tl shadow">
                            Simple
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Regenerar Portada de Fusión Inteligente"
                          onClick={() => handleRegenerateRowFusion(shuttle)}
                          disabled={rowRegeneratingId === shuttle.id}
                          className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                        >
                          {rowRegeneratingId === shuttle.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                          )}
                        </Button>
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
              <div key={shuttle.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative w-full h-32 bg-slate-100">
                  <img 
                    src={getImageUrl(shuttle.image_url || (shuttle as any).destination_image || (shuttle as any).origin_image)} 
                    alt={shuttle.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                  {shuttle.image_url?.includes('/images/shuttles/') ? (
                    <span className="absolute bottom-2 right-2 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      ✨ Fusión Activa
                    </span>
                  ) : (
                    <span className="absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded shadow">
                      Foto Simple
                    </span>
                  )}
                </div>
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
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">${shuttle.price}</span>
                      <span>{shuttle.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Regenerar Portada"
                        onClick={() => handleRegenerateRowFusion(shuttle)}
                        disabled={rowRegeneratingId === shuttle.id}
                        className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                      >
                        {rowRegeneratingId === shuttle.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                        )}
                      </Button>
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

              {/* Sección de Gestión de Portada y Fusión Inteligente */}
              {(() => {
                const origin = cities.find(c => c.id === formData.origin_city_id);
                const dest = cities.find(c => c.id === formData.destination_city_id);
                const hasCities = Boolean(origin && dest);
                const isFusionMode = formData.image_mode === 'fusion';
                const hasSavedFusionBanner = Boolean(formData.image_url && formData.image_url.includes('/images/shuttles/'));

                return (
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Portada de Ruta (800×400 WebP)
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Fusión visual de ciudades optimizada para web y redes sociales (OpenGraph)
                          </p>
                        </div>
                      </div>

                      {/* Selector de Modo */}
                      <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_mode: 'fusion' })}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                            isFusionMode
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ✨ Fusión Automática
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_mode: 'custom' })}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                            !isFusionMode
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🔗 URL Personalizada
                        </button>
                      </div>
                    </div>

                    {isFusionMode ? (
                      <div className="space-y-3">
                        {hasCities ? (
                          <>
                            {/* Preview visual */}
                            <div className="relative h-32 sm:h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group">
                              {hasSavedFusionBanner && !formData.regenerate_image ? (
                                <>
                                  <img
                                    src={getImageUrl(formData.image_url)}
                                    alt="Portada de fusión generada"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-2 right-2 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Fusión Generada y Lista
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="w-full h-full flex">
                                    <div className="w-1/2 h-full relative border-r border-white/20">
                                      <img
                                        src={getImageUrl(origin?.image_url)}
                                        alt={origin?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                                        <span className="text-white text-xs font-bold truncate drop-shadow">{origin?.name}</span>
                                      </div>
                                    </div>
                                    <div className="w-1/2 h-full relative">
                                      <img
                                        src={getImageUrl(dest?.image_url)}
                                        alt={dest?.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2.5">
                                        <span className="text-white text-xs font-bold truncate drop-shadow">{dest?.name}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Divisor e insignia central */}
                                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/75 flex items-center justify-center pointer-events-none">
                                    <div className="w-7 h-7 bg-white rounded-full p-0.5 shadow-xl flex items-center justify-center">
                                      <div className="w-full h-full bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                                        ➔
                                      </div>
                                    </div>
                                  </div>

                                  <div className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Se generará al guardar
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Controles de Fusión */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={formData.regenerate_image}
                                  onChange={(e) => setFormData({ ...formData, regenerate_image: e.target.checked })}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800"
                                />
                                <span className="text-xs text-slate-300">
                                  {hasSavedFusionBanner 
                                    ? 'Regenerar portada al guardar' 
                                    : 'Fusionar automáticamente fotos al guardar (Recomendado)'}
                                </span>
                              </label>

                              <button
                                type="button"
                                onClick={handleGenerateFusionNow}
                                disabled={isGeneratingFusion}
                                className="text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5 shadow-sm self-end sm:self-auto disabled:opacity-50"
                              >
                                {isGeneratingFusion ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                                {isGeneratingFusion ? 'Generando 800×400 WebP...' : '⚡ Generar Fusión Ahora'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-4 bg-slate-950/60 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-400">
                            👈 Selecciona una <strong>Ciudad de Origen</strong> y una <strong>Ciudad de Destino</strong> para activar la fusión inteligente de portada.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            URL Directa de la Imagen
                          </label>
                          <Input
                            placeholder="https://images.unsplash.com/... o /images/..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="bg-slate-950 text-white border-slate-800 text-xs"
                          />
                        </div>
                        {formData.image_url && (
                          <div className="relative h-28 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                            <img
                              src={getImageUrl(formData.image_url)}
                              alt="Vista previa personalizada"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                            />
                          </div>
                        )}
                      </div>
                    )}
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
                <TripServicesSelector
                  value={formData.included}
                  onChange={(newIncluded) => setFormData({ ...formData, included: newIncluded })}
                />
              </div>

              <div className="border-t pt-4">
                <TripToBringSelector
                  value={formData.to_bring}
                  onChange={(newToBring) => setFormData({ ...formData, to_bring: newToBring })}
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
              
              <div className="border-t pt-4">
                <TripPickupDropoffSelector
                  value={formData.pickup_info}
                  onChange={(newPickupInfo) => setFormData({ ...formData, pickup_info: newPickupInfo })}
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
