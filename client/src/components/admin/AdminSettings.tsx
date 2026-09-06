import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Server, Shield, Send, CheckCircle2, AlertCircle, Loader2, Save, Eye, EyeOff, Info, ExternalLink, Zap, PhoneCall, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { settingsApi } from '../../api/endpoints';

export const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    email_provider: 'smtp',
    resend_api_key: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_secure: 'false',
    smtp_user: 'trailexplorersv@gmail.com',
    smtp_pass: 'nxwmwvjkpgdbofyw',
    smtp_from: 'Trail Explorer <reservas@trailexplorer.com>',
    notification_email: 'trailexplorersv@gmail.com',
    test_email: 'trailexplorersv@gmail.com',
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
        const raw = res.data;
        const smtpUser = raw.smtp_user?.trim() || 'trailexplorersv@gmail.com';
        const smtpPass = raw.smtp_pass?.trim() || 'nxwmwvjkpgdbofyw';
        const notifEmail = raw.notification_email?.trim() || 'trailexplorersv@gmail.com';
        const testMail = raw.test_email?.trim() || notifEmail;

        setFormData({
          email_provider: raw.email_provider || 'smtp',
          resend_api_key: raw.resend_api_key || '',
          smtp_host: raw.smtp_host || 'smtp.gmail.com',
          smtp_port: raw.smtp_port || '587',
          smtp_secure: raw.smtp_secure || 'false',
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          smtp_from: raw.smtp_from || 'Trail Explorer <reservas@trailexplorer.com>',
          notification_email: notifEmail,
          test_email: testMail,
          send_customer_email: raw.send_customer_email !== undefined ? raw.send_customer_email : 'true',
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
        const smtpUser = s.smtp_user?.trim() || formData.smtp_user || 'trailexplorersv@gmail.com';
        const smtpPass = s.smtp_pass?.trim() || formData.smtp_pass || 'nxwmwvjkpgdbofyw';
        const notifEmail = s.notification_email?.trim() || formData.notification_email || 'trailexplorersv@gmail.com';
        const testMail = s.test_email?.trim() || notifEmail;

        setFormData({
          email_provider: s.email_provider || 'smtp',
          resend_api_key: s.resend_api_key || '',
          smtp_host: s.smtp_host || 'smtp.gmail.com',
          smtp_port: s.smtp_port || '587',
          smtp_secure: s.smtp_secure || 'false',
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          smtp_from: s.smtp_from || 'Trail Explorer <reservas@trailexplorer.com>',
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

  const handleSelectProvider = (provider: 'resend' | 'smtp') => {
    setFormData((prev) => {
      let nextFrom = prev.smtp_from;
      if (provider === 'resend') {
        if (!nextFrom || nextFrom.includes('trailexplorer.com')) {
          nextFrom = 'Trail Explorer <onboarding@resend.dev>';
        }
      } else {
        if (!nextFrom || nextFrom.includes('onboarding@resend.dev')) {
          nextFrom = 'Trail Explorer <reservas@trailexplorer.com>';
        }
      }
      return {
        ...prev,
        email_provider: provider,
        smtp_from: nextFrom,
      };
    });
  };

  const handleTestSmtp = async () => {
    const rawTarget = testEmail || formData.test_email || formData.notification_email || formData.smtp_user || 'trailexplorersv@gmail.com';
    const target = rawTarget.split(',')[0].trim();

    if (!target || !target.includes('@')) {
      setFeedback({
        type: 'error',
        message: 'Por favor ingresa un correo destinatario de prueba válido (ejemplo: tu-correo@gmail.com).',
      });
      return;
    }

    if (formData.email_provider === 'resend') {
      if (!formData.resend_api_key?.trim()) {
        setFeedback({
          type: 'error',
          message: 'Debes ingresar tu Clave API de Resend (comienza con re_) antes de enviar la prueba.',
        });
        return;
      }
    } else {
      if (!formData.smtp_user?.trim() || !formData.smtp_pass?.trim()) {
        setFeedback({
          type: 'error',
          message: 'Debes completar el usuario y la contraseña SMTP antes de realizar la prueba de envío.',
        });
        return;
      }
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
      console.error('Error al probar servicio de correo:', error);
      let msg = error.response?.data?.error || error.message || 'No se pudo conectar al servicio de correo. Revisa las credenciales o proveedor.';
      if (error.code === 'ECONNABORTED' || msg.includes('timeout') || msg.includes('Tiempo de espera') || msg.includes('Network Error')) {
        msg = 'Tiempo de espera agotado: El servidor en la nube (Railway) tiene bloqueados los puertos SMTP 587 y 465 por políticas de red. Para enviar correos en Railway sin bloqueos, selecciona la opción "Resend API (HTTPS)" en la parte superior e ingresa tu clave API gratuita de resend.com.';
      }
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
          Configura el método de envío y el servidor de correo para las notificaciones automáticas de reservas
        </p>
      </div>

      {/* Quick link to Contact Information */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Información de Contacto y Redes de la Página</h3>
            <p className="text-xs text-slate-600">
              Edita los teléfonos, WhatsApp, correo de atención al cliente, dirección física y enlaces a redes sociales.
            </p>
          </div>
        </div>
        <Link
          to="/admin/contact"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        >
          <span>Editar Contacto</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
                Correo Electrónico de Notificación (Admin)
              </label>
              <Input
                type="text"
                placeholder="reservas@trailexplorer.com"
                value={formData.notification_email}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, notification_email: val }));
                  if (!testEmail || testEmail === formData.notification_email) {
                    const firstEmail = val.split(',')[0].trim();
                    setTestEmail(firstEmail);
                  }
                }}
              />
              <p className="text-xs text-slate-500 mt-1">
                Cada vez que se reciba una reserva en la web, se enviará el detalle completo a este correo. Puedes ingresar varios separados por coma.
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

        {/* Selector de Método de Envío */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Método de Envío de Correos</CardTitle>
                <CardDescription>
                  Selecciona cómo tu aplicación enviará los correos electrónicos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opción 1: Resend API */}
              <div
                onClick={() => handleSelectProvider('resend')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.email_provider === 'resend'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-900">Resend API (HTTPS)</span>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Recomendado Railway
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Envía correos mediante API Web por puerto 443 (HTTPS). <strong>Inmune al bloqueo de puertos de Railway</strong>. 3,000 correos gratis al mes.
                </p>
              </div>

              {/* Opción 2: SMTP Clásico */}
              <div
                onClick={() => handleSelectProvider('smtp')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.email_provider === 'smtp'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                      <Server className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-900">Gmail / SMTP Directo</span>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Puerto 587/465
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Conexión directa por socket TCP a servidores SMTP. Ideal para pruebas locales o servidores con puertos SMTP abiertos.
                </p>
              </div>
            </div>

            {/* Configuración Resend API */}
            {formData.email_provider === 'resend' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-900 text-sm">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>¿Cómo activar Resend en 1 minuto?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-emerald-900/90 pl-1">
                    <li>Entra a <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline font-semibold text-emerald-700">resend.com</a> e inicia sesión con tu cuenta de Google.</li>
                    <li>Haz clic en <strong>API Keys</strong> en la barra lateral y presiona <strong>Create API Key</strong>.</li>
                    <li>Copia la clave que empieza con <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">re_...</code> y pégala aquí abajo.</li>
                  </ol>
                  <div className="pt-1">
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                    >
                      <span>Abrir Resend.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Clave API de Resend (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showResendKey ? 'text' : 'password'}
                      placeholder="re_123456789_abcdef..."
                      value={formData.resend_api_key}
                      onChange={(e) => setFormData({ ...formData, resend_api_key: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowResendKey((prev) => !prev);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer z-10"
                      title={showResendKey ? 'Ocultar API Key' : 'Ver API Key'}
                    >
                      {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tu API key se guarda de forma segura en tu base de datos y se utiliza para enviar notificaciones vía HTTPS.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Nombre y Correo Remitente (From)
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, smtp_from: 'Trail Explorer <onboarding@resend.dev>' }))}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                    >
                      Restaurar onboarding@resend.dev
                    </button>
                  </div>
                  <Input
                    placeholder="Trail Explorer <onboarding@resend.dev>"
                    value={formData.smtp_from}
                    onChange={(e) => setFormData({ ...formData, smtp_from: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Usa <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Trail Explorer &lt;onboarding@resend.dev&gt;</code> para pruebas inmediatas gratuitas. Si tienes tu propio dominio verificado en Resend, puedes colocar ej. <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Trail Explorer &lt;reservas@tudominio.com&gt;</code>.
                  </p>
                </div>
              </div>
            )}

            {/* Configuración SMTP Directo */}
            {formData.email_provider === 'smtp' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Advertencia Railway */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-800 text-sm">
                    <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
                    <span>Aviso importante para despliegues en Railway</span>
                  </div>
                  <p className="text-amber-800/90 leading-relaxed">
                    <strong>Railway bloquea los puertos SMTP salientes (587, 465, 25)</strong> por defecto en todos los planes para evitar abusos de spam. Si al probar SMTP obtienes el error <em>"Tiempo de espera agotado (ETIMEDOUT)"</em>, selecciona la opción <strong>Resend API</strong> de arriba, que funciona por HTTPS puerto 443 sin bloqueos.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Servidor SMTP (Host)
                    </label>
                    <Input
                      placeholder="smtp.gmail.com"
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
                      placeholder="trailexplorersv@gmail.com"
                      value={formData.smtp_user}
                      onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contraseña de Aplicación Google (16 letras)
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

                {/* Guía Contraseñas de Aplicación Google */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                    <Info className="w-4 h-4 flex-shrink-0 text-slate-600" />
                    <span>Cómo generar una Contraseña de Aplicación en Google</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Activa la <strong>Verificación en 2 pasos</strong> en tu cuenta de Google.</li>
                    <li>Ingresa a <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-semibold">myaccount.google.com/apppasswords</a>.</li>
                    <li>Crea una clave para "Trail Explorer" y pega las 16 letras en el campo de contraseña.</li>
                  </ol>
                </div>
              </div>
            )}
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
                <CardTitle className="text-lg">Prueba de Envío</CardTitle>
                <CardDescription>
                  Envía un correo de prueba para verificar que {formData.email_provider === 'resend' ? 'Resend API' : 'el servidor SMTP'} funcione correctamente
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
                  type="text"
                  placeholder="tu-correo@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                {formData.email_provider === 'resend' ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1.5 leading-relaxed">
                    💡 <strong>Prueba con Resend gratuito:</strong> Al usar <code className="font-mono bg-amber-100 px-1 py-0.2 rounded">onboarding@resend.dev</code> sin dominio propio verificado, Resend requiere que el destinatario sea el <strong>correo con el que te registraste en resend.com</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Se enviará un correo de prueba para verificar la conexión SMTP ({formData.smtp_host || 'smtp.gmail.com'}).
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleTestSmtp}
                disabled={testing}
                className="w-full sm:w-auto flex-shrink-0 border-purple-200 hover:bg-purple-50 text-purple-700 cursor-pointer"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando prueba...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Correo de Prueba ({formData.email_provider === 'resend' ? 'Resend API' : 'SMTP'})
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
