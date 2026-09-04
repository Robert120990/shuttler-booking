import { useState, useEffect } from 'react';
import { Mail, Server, Shield, Send, CheckCircle2, AlertCircle, Loader2, Save, Eye, EyeOff, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { settingsApi } from '../../api/endpoints';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: 'false',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    notification_email: '',
    test_email: '',
    send_customer_email: 'true',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAll();
      if (res.data) {
        const notifEmail = res.data.notification_email ?? res.data.smtp_user ?? '';
        const testMail = res.data.test_email || notifEmail || res.data.smtp_user || '';
        setFormData({
          smtp_host: res.data.smtp_host || '',
          smtp_port: res.data.smtp_port || '587',
          smtp_secure: res.data.smtp_secure || 'false',
          smtp_user: res.data.smtp_user || '',
          smtp_pass: res.data.smtp_pass || '',
          smtp_from: res.data.smtp_from || '',
          notification_email: notifEmail,
          test_email: testMail,
          send_customer_email: res.data.send_customer_email !== undefined ? res.data.send_customer_email : 'true',
        });
        setTestEmail(testMail);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setFeedback(null);
      const payload = {
        ...formData,
        test_email: testEmail || formData.test_email || formData.notification_email,
      };
      const res = await settingsApi.update(payload);
      if (res.data?.settings) {
        const s = res.data.settings;
        const notifEmail = s.notification_email ?? s.smtp_user ?? '';
        const testMail = s.test_email || notifEmail || s.smtp_user || '';
        setFormData({
          smtp_host: s.smtp_host || '',
          smtp_port: s.smtp_port || '587',
          smtp_secure: s.smtp_secure || 'false',
          smtp_user: s.smtp_user || '',
          smtp_pass: s.smtp_pass || '',
          smtp_from: s.smtp_from || '',
          notification_email: notifEmail,
          test_email: testMail,
          send_customer_email: s.send_customer_email !== undefined ? s.send_customer_email : 'true',
        });
        setTestEmail(testMail);
      }
      setFeedback({
        type: 'success',
        message: '¡Configuración guardada exitosamente!',
      });
    } catch (error: any) {
      console.error('Error al guardar configuración:', error);
      const msg = error.response?.data?.error || 'Error al guardar los ajustes. Por favor intenta de nuevo.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    const target = testEmail || formData.test_email || formData.notification_email || formData.smtp_user;
    if (!target) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa un correo de prueba o completa el correo de notificación.',
      });
      return;
    }

    if (!formData.smtp_host || !formData.smtp_user || !formData.smtp_pass) {
      setFeedback({
        type: 'error',
        message: 'Completa al menos el Servidor SMTP, Usuario y Contraseña para realizar la prueba.',
      });
      return;
    }

    try {
      setTesting(true);
      setFeedback(null);
      const res = await settingsApi.testSmtp({
        ...formData,
        target_email: target,
      });
      setFeedback({
        type: 'success',
        message: res.data.message || `¡Correo de prueba enviado con éxito a ${target}!`,
      });
    } catch (error: any) {
      console.error('Error al probar SMTP:', error);
      const msg = error.response?.data?.error || 'No se pudo conectar al servidor SMTP. Revisa las credenciales y puertos.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setTesting(false);
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
    <div className="space-y-6 max-w-4xl pb-12 relative">
      {/* Floating Toast Notification */}
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

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Configuración del Sistema</h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Configura el servidor de correo SMTP para el envío automático de notificaciones de reservas
        </p>
      </div>

      {/* In-page Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 border transition-all ${
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
        {/* Notificaciones de Reserva */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Correo de Destino para Notificaciones</CardTitle>
                <CardDescription>
                  Define a dónde se enviarán las alertas y detalles automáticos cuando un cliente realice una reserva
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Electrónico de Destino
              </label>
              <Input
                type="text"
                placeholder="reservas@trailexplorer.com"
                value={formData.notification_email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, notification_email: val }));
                  if (!testEmail || testEmail === formData.notification_email) {
                    setTestEmail(val);
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-1">
                Cada vez que se confirme o solicite una reserva en la web, se enviará un reporte completo a este correo asignado. Puedes ingresar uno o varios correos separados por comas.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="send_customer_email"
                checked={formData.send_customer_email === 'true'}
                onChange={(e) => setFormData({ ...formData, send_customer_email: e.target.checked ? 'true' : 'false' })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="send_customer_email" className="text-sm text-slate-700 select-none cursor-pointer">
                Enviar también un correo de confirmación de reserva al pasajero/cliente
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Configuración SMTP */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Configuración de Servidor SMTP</CardTitle>
                <CardDescription>
                  Ingresa las credenciales del servidor SMTP para el despacho de correos electrónicos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Servidor SMTP (Host)
                </label>
                <Input
                  placeholder="ej. smtp.gmail.com, smtp.mailgun.org, smtp.office365.com"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Puerto
                </label>
                <Input
                  placeholder="587 o 465"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Usuario / Correo SMTP
                </label>
                <Input
                  type="text"
                  placeholder="usuario@dominio.com"
                  value={formData.smtp_user}
                  onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña / App Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={formData.smtp_pass}
                    onChange={(e) => setFormData({ ...formData, smtp_pass: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer z-10"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre y Correo del Remitente (From)
                </label>
                <Input
                  placeholder="Trail Explorer <reservas@trailexplorer.com>"
                  value={formData.smtp_from}
                  onChange={(e) => setFormData({ ...formData, smtp_from: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">Opcional. Si se deja vacío se usará el Usuario SMTP.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cifrado de Conexión (Seguridad)
                </label>
                <select
                  value={formData.smtp_secure}
                  onChange={(e) => setFormData({ ...formData, smtp_secure: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="false">STARTTLS / Automático (Puerto 587)</option>
                  <option value="true">SSL / TLS Directo (Puerto 465)</option>
                </select>
              </div>
            </div>

            {/* Ayuda Gmail */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Nota para Gmail / Google Workspace:</strong> Debes usar una <em>Contraseña de Aplicación (App Password)</em> generada desde tu cuenta de Google con Verificación en 2 pasos activada.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prueba de Envío */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Prueba de Conexión SMTP</CardTitle>
                <CardDescription>
                  Envía un correo de prueba para verificar que la configuración y credenciales funcionen correctamente
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo Destinatario de Prueba
                </label>
                <Input
                  type="email"
                  placeholder="tu-correo@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestSmtp}
                disabled={testing}
                className="w-full sm:w-auto flex-shrink-0 border-purple-200 hover:bg-purple-50 text-purple-700"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Probando conexión...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Correo de Prueba
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
