import { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Share2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  MessageCircle,
  Eye,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { settingsApi } from '../../api/endpoints';
import { useContactStore } from '../../stores/contactStore';

export const AdminContact = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { updateContactState } = useContactStore();

  const [formData, setFormData] = useState({
    contact_email: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_address: '',
    contact_hours: '',
    social_facebook: '',
    social_instagram: '',
    social_tiktok: '',
  });

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAll();
      if (res.data) {
        const raw = res.data;
        const data = {
          contact_email: raw.contact_email ?? 'info@trailexplorer.com',
          contact_phone: raw.contact_phone ?? '+503 1234 5678',
          contact_whatsapp: raw.contact_whatsapp ?? '+503 1234 5678',
          contact_address: raw.contact_address ?? 'San Salvador, El Salvador',
          contact_hours: raw.contact_hours ?? 'Lunes a Domingo: 24/7',
          social_facebook: raw.social_facebook ?? '',
          social_instagram: raw.social_instagram ?? '',
          social_tiktok: raw.social_tiktok ?? '',
        };
        setFormData(data);
        updateContactState(data);
      }
    } catch (error) {
      console.error('Error cargando información de contacto:', error);
      setFeedback({ type: 'error', message: 'No se pudo cargar la información de contacto.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      const res = await settingsApi.update(formData);
      if (res.data?.settings) {
        const s = res.data.settings;
        const updated = {
          contact_email: s.contact_email ?? formData.contact_email,
          contact_phone: s.contact_phone ?? formData.contact_phone,
          contact_whatsapp: s.contact_whatsapp ?? formData.contact_whatsapp,
          contact_address: s.contact_address ?? formData.contact_address,
          contact_hours: s.contact_hours ?? formData.contact_hours,
          social_facebook: s.social_facebook ?? formData.social_facebook,
          social_instagram: s.social_instagram ?? formData.social_instagram,
          social_tiktok: s.social_tiktok ?? formData.social_tiktok,
        };
        setFormData(updated);
        updateContactState(updated);
      }
      setFeedback({
        type: 'success',
        message: '¡Información de contacto actualizada exitosamente!',
      });
    } catch (error: any) {
      console.error('Error guardando información de contacto:', error);
      const msg = error.response?.data?.error || 'Error al guardar los datos de contacto.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Clean WhatsApp number for direct link (remove +, spaces, hyphens)
  const cleanWhatsappNumber = (formData.contact_whatsapp || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanWhatsappNumber ? `https://wa.me/${cleanWhatsappNumber}` : '';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-16 relative">
      {/* Floating Feedback Toast */}
      {feedback && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-xl shadow-xl flex items-start gap-3 border ${
              feedback.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-900/20'
                : 'bg-red-600 text-white border-red-700 shadow-red-900/20'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white" />
            )}
            <div className="flex-1 text-sm font-medium">{feedback.message}</div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-white/80 hover:text-white text-xs px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Información de Contacto y Redes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configura los canales oficiales de atención que se muestran en el pie de página y las páginas públicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/contact"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <span>Ver Página Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* In-page Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="text-sm font-medium">{feedback.message}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Form (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Canales Principales */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Canales Oficiales de Atención</CardTitle>
                    <CardDescription>
                      Teléfono, WhatsApp y correo principal para responder consultas de viajeros
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Electrónico de Contacto
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      placeholder="info@trailexplorer.com"
                      className="pl-9"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Se muestra en el Footer, la página de Contacto y Acerca de Nosotros con enlace directo a correo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono Principal de Contacto
                    </label>
                    <div className="relative">
                      <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="+503 1234 5678"
                        className="pl-9"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-slate-700">
                        WhatsApp de Reservas / Soporte
                      </label>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                        >
                          <span>Probar enlace</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="+503 1234 5678"
                        className="pl-9"
                        value={formData.contact_whatsapp}
                        onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Ubicación y Horarios */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ubicación y Horario de Atención</CardTitle>
                    <CardDescription>
                      Dirección física de operaciones y disponibilidad para atención al cliente
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección Física / Oficina Principal
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="San Salvador, El Salvador"
                      className="pl-9"
                      value={formData.contact_address}
                      onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horario de Atención
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Lunes a Domingo: 24/7"
                      className="pl-9"
                      value={formData.contact_hours}
                      onChange={(e) => setFormData({ ...formData, contact_hours: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Visible en la página de Contacto para indicar la disponibilidad a los clientes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Redes Sociales */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Redes Sociales Oficiales</CardTitle>
                    <CardDescription>
                      Enlaces directos a tus perfiles oficiales (deja en blanco los que no uses)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Facebook
                  </label>
                  <Input
                    type="url"
                    placeholder="https://facebook.com/trailexplorersv"
                    value={formData.social_facebook}
                    onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instagram
                  </label>
                  <Input
                    type="url"
                    placeholder="https://instagram.com/trailexplorersv"
                    value={formData.social_instagram}
                    onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    TikTok
                  </label>
                  <Input
                    type="url"
                    placeholder="https://tiktok.com/@trailexplorersv"
                    value={formData.social_tiktok}
                    onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview Sidebar (1 column) */}
          <div className="space-y-6">
            <Card className="border-emerald-200 bg-gradient-to-b from-white to-slate-50/50 shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2 text-emerald-800">
                  <Eye className="w-4 h-4" />
                  <CardTitle className="text-base">Vista Previa para el Viajero</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Así se visualizarán estos datos en el pie de página y la página de contacto pública
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {/* Contact Card Sample */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm border-b border-slate-800 pb-2">
                    <img src="/logo.jpeg" alt="Logo" className="w-6 h-6 object-contain rounded" />
                    <span>Trail Explorer</span>
                  </div>

                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{formData.contact_address || 'Sin dirección configurada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{formData.contact_email || 'Sin correo configurado'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{formData.contact_phone || 'Sin teléfono configurado'}</span>
                    </div>
                    {formData.contact_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{formData.contact_hours}</span>
                      </div>
                    )}
                  </div>

                  {whatsappUrl && (
                    <div className="pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links Badge List */}
                <div className="p-3 bg-slate-100 rounded-lg space-y-1.5">
                  <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider">
                    Redes Sociales Activas
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.social_facebook ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-medium">
                        Facebook ✓
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Facebook (inactivo)</span>
                    )}
                    {formData.social_instagram ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-medium">
                        Instagram ✓
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Instagram (inactivo)</span>
                    )}
                    {formData.social_tiktok ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-medium">
                        TikTok ✓
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">TikTok (inactivo)</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Save Action for Mobile / Ease of Access */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 shadow-md"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Información de Contacto
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
