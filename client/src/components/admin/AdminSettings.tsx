import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Server, Shield, Send, CheckCircle2, AlertCircle, Loader2, Save, Eye, EyeOff, Info, ExternalLink, Zap, PhoneCall, ArrowRight, Database, CreditCard, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { settingsApi } from '../../api/endpoints';

interface DbStatus {
  isPg: boolean;
  type: string;
  error: string | null;
  hasDbUrl: boolean;
}

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'email' | 'database'>('payments');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [showBrevoKey, setShowBrevoKey] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [showWompiSecret, setShowWompiSecret] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const [formData, setFormData] = useState({
    // Email settings
    email_provider: 'smtp',
    resend_api_key: '',
    brevo_api_key: '',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_secure: 'false',
    smtp_user: 'trailexplorersv@gmail.com',
    smtp_pass: 'nxwmwvjkpgdbofyw',
    smtp_from: 'Trail Explorer <reservas@trailexplorer.com>',
    notification_email: 'trailexplorersv@gmail.com',
    test_email: 'trailexplorersv@gmail.com',
    send_customer_email: 'true',
    // Payment Gateways
    paypal_enabled: 'false',
    paypal_client_id: '',
    paypal_secret_key: '',
    paypal_env: 'sandbox',
    wompi_enabled: 'false',
    wompi_public_key: '',
    wompi_private_key: '',
    wompi_env: 'sandbox',
    pay_on_arrival_enabled: 'true',
    pay_on_arrival_instructions: 'Paga en efectivo en USD o mediante transferencia local al momento de abordar la unidad.',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getAll();
      if (res.data) {
        const raw = res.data as any;
        if (raw._db_status) {
          setDbStatus(raw._db_status);
        }
        const smtpUser = raw.smtp_user?.trim() || 'trailexplorersv@gmail.com';
        const smtpPass = raw.smtp_pass?.trim() || 'nxwmwvjkpgdbofyw';
        const notifEmail = raw.notification_email?.trim() || 'trailexplorersv@gmail.com';
        const testMail = raw.test_email?.trim() || notifEmail;

        setFormData({
          email_provider: raw.email_provider || 'smtp',
          resend_api_key: raw.resend_api_key || '',
          brevo_api_key: raw.brevo_api_key || '',
          smtp_host: raw.smtp_host || 'smtp.gmail.com',
          smtp_port: raw.smtp_port || '587',
          smtp_secure: raw.smtp_secure || 'false',
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          smtp_from: raw.smtp_from || 'Trail Explorer <reservas@trailexplorer.com>',
          notification_email: notifEmail,
          test_email: testMail,
          send_customer_email: raw.send_customer_email !== undefined ? raw.send_customer_email : 'true',
          paypal_enabled: raw.paypal_enabled || 'false',
          paypal_client_id: raw.paypal_client_id || '',
          paypal_secret_key: raw.paypal_secret_key || '',
          paypal_env: raw.paypal_env || 'sandbox',
          wompi_enabled: raw.wompi_enabled || 'false',
          wompi_public_key: raw.wompi_public_key || '',
          wompi_private_key: raw.wompi_private_key || '',
          wompi_env: raw.wompi_env || 'sandbox',
          pay_on_arrival_enabled: raw.pay_on_arrival_enabled !== undefined ? raw.pay_on_arrival_enabled : 'true',
          pay_on_arrival_instructions: raw.pay_on_arrival_instructions || 'Paga en efectivo en USD o mediante transferencia local al momento de abordar la unidad.',
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
          brevo_api_key: s.brevo_api_key || '',
          smtp_host: s.smtp_host || 'smtp.gmail.com',
          smtp_port: s.smtp_port || '587',
          smtp_secure: s.smtp_secure || 'false',
          smtp_user: smtpUser,
          smtp_pass: smtpPass,
          smtp_from: s.smtp_from || 'Trail Explorer <reservas@trailexplorer.com>',
          notification_email: notifEmail,
          test_email: testMail,
          send_customer_email: s.send_customer_email !== undefined ? s.send_customer_email : 'true',
          paypal_enabled: s.paypal_enabled || formData.paypal_enabled || 'false',
          paypal_client_id: s.paypal_client_id || formData.paypal_client_id || '',
          paypal_secret_key: s.paypal_secret_key || formData.paypal_secret_key || '',
          paypal_env: s.paypal_env || formData.paypal_env || 'sandbox',
          wompi_enabled: s.wompi_enabled || formData.wompi_enabled || 'false',
          wompi_public_key: s.wompi_public_key || formData.wompi_public_key || '',
          wompi_private_key: s.wompi_private_key || formData.wompi_private_key || '',
          wompi_env: s.wompi_env || formData.wompi_env || 'sandbox',
          pay_on_arrival_enabled: s.pay_on_arrival_enabled !== undefined ? s.pay_on_arrival_enabled : 'true',
          pay_on_arrival_instructions: s.pay_on_arrival_instructions || formData.pay_on_arrival_instructions || 'Paga en efectivo en USD o mediante transferencia local al momento de abordar la unidad.',
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

  const handleSelectProvider = (provider: 'brevo' | 'resend' | 'smtp') => {
    setFormData((prev) => {
      let nextFrom = prev.smtp_from;
      if (provider === 'resend') {
        if (!nextFrom || nextFrom.includes('trailexplorer.com') || nextFrom.includes('gmail.com')) {
          nextFrom = 'Trail Explorer <onboarding@resend.dev>';
        }
      } else if (provider === 'brevo') {
        nextFrom = `Trail Explorer <${prev.smtp_user || 'trailexplorersv@gmail.com'}>`;
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

    if (formData.email_provider === 'brevo') {
      if (!formData.brevo_api_key?.trim()) {
        setFeedback({
          type: 'error',
          message: 'Debes ingresar tu Clave API de Brevo (comienza con xkeysib-) antes de enviar la prueba.',
        });
        return;
      }
    } else if (formData.email_provider === 'resend') {
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pasarelas de Pago</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'email'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Servidor de Correo (SMTP / APIs)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Base de Datos & Supabase</span>
          {dbStatus?.isPg && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" />
          )}
        </button>
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

      {/* Database Persistence Tab Panel */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {dbStatus && (
            dbStatus.isPg ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-3.5 text-emerald-900 shadow-sm">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm mt-0.5">
                  <Database className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-emerald-950">Base de Datos Persistente: Supabase (PostgreSQL)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      En Línea
                    </span>
                  </div>
                  <p className="text-emerald-800/90 text-xs leading-relaxed">
                    Tu sistema está conectado correctamente a Supabase en la nube. Todas las reservas, rutas y configuraciones de correo se guardan de forma permanente y <strong>no se perderán cuando Railway haga nuevos deploys</strong>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-5 flex items-start gap-3.5 text-amber-950 shadow-sm">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl mt-0.5 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-3 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-amber-950">
                        Alerta: Base de Datos Temporal SQLite (No conectada a Supabase)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                        Temporal
                      </span>
                    </div>
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    El servidor actualmente está guardando los datos en la memoria local temporal del contenedor de Railway. <strong>Por este motivo, cada vez que Railway compila o hace un deploy nuevo, los datos guardados se reinician a los valores por defecto</strong>.
                  </p>

                  {dbStatus.error && (
                    <div className="p-3 bg-amber-100/80 rounded-lg font-mono text-[11px] text-amber-950 border border-amber-300">
                      <span className="font-bold text-amber-900 font-sans block mb-1">Diagnóstico del error al conectar con Supabase:</span>
                      {dbStatus.error}
                    </div>
                  )}

                  <div className="bg-white/95 border border-amber-200 rounded-lg p-4 text-slate-800 space-y-2.5 shadow-sm">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>¿Cómo conectar Supabase a Railway para que los datos nunca se pierdan?</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-2 text-slate-700 text-xs leading-relaxed">
                      <li>
                        Entra a tu proyecto en <strong>Supabase</strong> &gt; icono de engranaje (<strong>Project Settings</strong>) &gt; <strong>Database</strong>.
                      </li>
                      <li>
                        Baja hasta la sección <strong>Connection Pooling (Supavisor)</strong>.
                        <p className="ml-4 text-[11px] text-slate-600 font-sans mt-0.5">
                          ⚠️ <em>Importante: No utilices la "Direct connection" (db.xxxx.supabase.co) porque Railway no tiene soporte para IPv6 y fallará. Debes usar el Connection Pooler (host aws-0-...pooler.supabase.com) que sí soporta IPv4.</em>
                        </p>
                      </li>
                      <li>
                        Copia la URL de conexión en modo <strong>Session</strong> o <strong>Transaction</strong> (puerto <strong>6543</strong> o <strong>5432</strong>).
                      </li>
                      <li>
                        En tu panel de <strong>Railway</strong> &gt; tu Servicio &gt; pestaña <strong>Variables</strong>, crea o edita la variable <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700 font-semibold">DATABASE_URL</code> y pega la URL reemplazando <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600">[YOUR-PASSWORD]</code> por la contraseña real de tu base de datos de Supabase.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Gateways Tab Panel */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Pago al Abordar */}
            <Card className="border-emerald-200/80 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50/70 to-teal-50/40 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-slate-900">Pago al Abordar</CardTitle>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Efectivo / Transferencia
                        </span>
                      </div>
                      <CardDescription>
                        Permite a los viajeros reservar de inmediato y pagar al momento del viaje directamente al chofer
                      </CardDescription>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pay_on_arrival_enabled === 'true'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pay_on_arrival_enabled: e.target.checked ? 'true' : 'false' }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      {formData.pay_on_arrival_enabled === 'true' ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instrucciones y condiciones para el pasajero
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Paga en efectivo en USD o mediante transferencia local al momento de abordar la unidad."
                    value={formData.pay_on_arrival_instructions}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pay_on_arrival_instructions: e.target.value }))}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Este mensaje se mostrará al cliente en el selector de pago, en el correo de confirmación y en el voucher digital.
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Control en el Manifiesto del Chofer:</span>
                    Las reservas con pago al abordar se marcarán automáticamente con el distintivo <strong>"Cobrar al abordar: $XX.XX USD"</strong> en la hoja de ruta del conductor para un cobro seguro y organizado.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wompi El Salvador */}
            <Card className="border-purple-200/80 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50/70 to-indigo-50/40 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-slate-900">Wompi El Salvador</CardTitle>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          Tarjetas de Crédito / Débito
                        </span>
                      </div>
                      <CardDescription>
                        Acepta pagos con Visa y Mastercard emitidas en El Salvador y el extranjero a través de Wompi (Banco Agrícola)
                      </CardDescription>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.wompi_enabled === 'true'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wompi_enabled: e.target.checked ? 'true' : 'false' }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      {formData.wompi_enabled === 'true' ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ambiente de Ejecución
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.wompi_env}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wompi_env: e.target.value }))}
                    >
                      <option value="sandbox">Sandbox (Pruebas / Test)</option>
                      <option value="production">Producción (Pagos Reales en Vivo)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Usa Sandbox para hacer compras de prueba sin cobros reales.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Llave Pública de Wompi (Public Key)
                    </label>
                    <Input
                      type="text"
                      placeholder="pub_test_... o pub_prod_..."
                      value={formData.wompi_public_key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wompi_public_key: e.target.value }))}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Identificador público utilizado para inicializar el checkout seguro de Wompi.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Llave Privada de Wompi (Private Secret Key)
                  </label>
                  <div className="relative">
                    <Input
                      type={showWompiSecret ? 'text' : 'password'}
                      placeholder="prv_test_... o prv_prod_..."
                      value={formData.wompi_private_key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, wompi_private_key: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWompiSecret(!showWompiSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showWompiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Se almacena cifrada en el servidor para verificar y capturar transacciones. Nunca se expone a los clientes.
                  </p>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-950 space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-purple-600" />
                    <span>¿Cómo obtener tus llaves en Wompi El Salvador?</span>
                  </div>
                  <p className="text-purple-900 leading-relaxed">
                    1. Regístrate o inicia sesión en el portal de comercios de <strong><a href="https://wompi.sv" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-purple-700 inline-flex items-center gap-0.5">wompi.sv <ExternalLink className="w-3 h-3" /></a></strong>.<br />
                    2. Ingresa a la sección <strong>Desarrolladores &gt; Llaves de API</strong>.<br />
                    3. Copia tu <strong>Llave Pública</strong> y tu <strong>Llave Privada</strong> y pégalas arriba.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card className="border-blue-200/80 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50/70 to-sky-50/40 border-b border-slate-100">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0079C1] text-white rounded-xl shadow-sm font-bold flex items-center justify-center w-10 h-10">
                      <span className="text-lg leading-none">P</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg text-slate-900">PayPal</CardTitle>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Tarjetas Internacionales / Saldo
                        </span>
                      </div>
                      <CardDescription>
                        Permite a viajeros internacionales pagar con saldo PayPal o tarjetas de crédito/débito de todo el mundo
                      </CardDescription>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.paypal_enabled === 'true'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paypal_enabled: e.target.checked ? 'true' : 'false' }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0079C1]"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700">
                      {formData.paypal_enabled === 'true' ? 'Habilitado' : 'Deshabilitado'}
                    </span>
                  </label>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ambiente de Ejecución
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.paypal_env}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paypal_env: e.target.value }))}
                    >
                      <option value="sandbox">Sandbox (Pruebas / Test)</option>
                      <option value="live">Live (Pagos Reales en Vivo)</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Selecciona Live para procesar cobros reales en USD en tu cuenta PayPal Business.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      PayPal Client ID
                    </label>
                    <Input
                      type="text"
                      placeholder="Client ID generado en developer.paypal.com"
                      value={formData.paypal_client_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paypal_client_id: e.target.value }))}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Identificador público para cargar los botones oficiales de PayPal Smart Buttons.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    PayPal Secret Key
                  </label>
                  <div className="relative">
                    <Input
                      type={showPaypalSecret ? 'text' : 'password'}
                      placeholder="Secret Key generado en developer.paypal.com"
                      value={formData.paypal_secret_key}
                      onChange={(e) => setFormData((prev) => ({ ...prev, paypal_secret_key: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPaypalSecret(!showPaypalSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPaypalSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Clave privada requerida en el servidor para verificar y liquidar los pedidos de PayPal.
                  </p>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>¿Cómo obtener tu Client ID y Secret en PayPal?</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    1. Entra a tu cuenta en <strong><a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" className="underline font-semibold hover:text-blue-700 inline-flex items-center gap-0.5">developer.paypal.com <ExternalLink className="w-3 h-3" /></a></strong>.<br />
                    2. Ve a <strong>Apps & Credentials</strong> &gt; Crea una nueva aplicación (tipo Merchant).<br />
                    3. Copia el <strong>Client ID</strong> y el <strong>Secret</strong> y pégalos arriba.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Settings Tab Panel */}
        {activeTab === 'email' && (
          <div className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Opción 1: Brevo API */}
              <div
                onClick={() => handleSelectProvider('brevo')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.email_provider === 'brevo'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-900">Brevo API (HTTPS)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    100% Gratis
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  <strong>300 correos/día gratis</strong> sin necesidad de dominio web propio. Funciona de inmediato en Railway mediante HTTPS.
                </p>
              </div>

              {/* Opción 2: Resend API */}
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
                    <span className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </span>
                    <span className="font-semibold text-slate-900">Resend API</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    Con Dominio
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  3,000 correos/mes gratis. Requiere vincular y verificar un dominio web propio en resend.com para enviar a clientes.
                </p>
              </div>

              {/* Opción 3: SMTP Clásico */}
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
                    <span className="font-semibold text-slate-900">Gmail / SMTP</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Puerto 587/465
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Conexión directa por socket TCP. En Railway requiere solicitar desbloqueo de puertos al soporte.
                </p>
              </div>
            </div>

            {/* Configuración Brevo API */}
            {formData.email_provider === 'brevo' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-900 text-sm">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>¿Cómo activar Brevo en 2 minutos (100% Gratis sin dominio)?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-emerald-900/90 pl-1">
                    <li>Entra a <a href="https://brevo.com" target="_blank" rel="noreferrer" className="underline font-semibold text-emerald-700">brevo.com</a> y crea una cuenta gratuita con tu correo Gmail (ej. <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">trailexplorersv@gmail.com</code>).</li>
                    <li>Confirma tu correo con el código/enlace que te enviará Brevo. Al hacerlo, tu dirección queda verificada automáticamente como remitente.</li>
                    <li>En tu cuenta de Brevo, abre la sección <strong>SMTP &amp; API</strong> &gt; <strong>API Keys</strong> y haz clic en <strong>Generate a new API key</strong>.</li>
                    <li>Copia la clave que empieza con <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono">xkeysib-...</code> y pégala aquí abajo.</li>
                  </ol>
                  <div className="pt-1">
                    <a
                      href="https://app.brevo.com/settings/keys/api"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
                    >
                      <span>Obtener API Key en Brevo.com</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Clave API de Brevo (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showBrevoKey ? 'text' : 'password'}
                      placeholder="xkeysib-123456789_abcdef..."
                      value={formData.brevo_api_key}
                      onChange={(e) => setFormData({ ...formData, brevo_api_key: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowBrevoKey((prev) => !prev);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer z-10"
                      title={showBrevoKey ? 'Ocultar API Key' : 'Ver API Key'}
                    >
                      {showBrevoKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Tu API key se guarda de forma segura y envía correos vía HTTPS (puerto 443) a cualquier cliente sin bloqueos.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Correo Remitente en Brevo (From)
                  </label>
                  <Input
                    placeholder="Trail Explorer <trailexplorersv@gmail.com>"
                    value={formData.smtp_from}
                    onChange={(e) => setFormData({ ...formData, smtp_from: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Debe ser el mismo correo con el que te registraste en Brevo.
                  </p>
                </div>
              </div>
            )}

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
      </div>
    )}

    {/* Action Buttons (visible on payments and email tabs) */}
    {activeTab !== 'database' && (
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
    )}
  </form>
    </div>
  );
};
