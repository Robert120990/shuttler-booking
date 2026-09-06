import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, sendTestEmail, DEFAULT_SETTINGS } from '../utils/mailer.js';

const router = express.Router();

// GET /api/settings/public - Public contact and branding info
router.get('/public', async (req, res) => {
  try {
    const settings = await getSettings();
    const publicSettings = {
      contact_email: settings.contact_email || 'info@trailexplorer.com',
      contact_phone: settings.contact_phone || '+503 1234 5678',
      contact_whatsapp: settings.contact_whatsapp || '+503 1234 5678',
      contact_address: settings.contact_address || 'San Salvador, El Salvador',
      contact_hours: settings.contact_hours || 'Lunes a Domingo: 24/7',
      social_facebook: settings.social_facebook || '',
      social_instagram: settings.social_instagram || '',
      social_tiktok: settings.social_tiktok || '',
    };
    res.json(publicSettings);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ error: 'Error al obtener información pública' });
  }
});

// GET /api/settings - Retrieve all settings
router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// POST /api/settings - Save / update settings
router.post('/', async (req, res) => {
  try {
    const settingsData = req.body;
    if (typeof settingsData !== 'object' || settingsData === null) {
      return res.status(400).json({ error: 'Datos de configuración inválidos' });
    }

    for (const [key, value] of Object.entries(settingsData)) {
      if (typeof key === 'string' && key.trim()) {
        const cleanKey = key.trim();
        const strVal = value === undefined || value === null ? '' : String(value).trim();

        // Do not wipe out existing password or user credentials with empty string
        if ((cleanKey === 'smtp_pass' || cleanKey === 'smtp_user') && !strVal) {
          continue;
        }

        const existing = await prepare('SELECT id FROM settings WHERE key = ?').get(cleanKey);
        if (existing) {
          await prepare('UPDATE settings SET value = ? WHERE key = ?').run(strVal, cleanKey);
        } else {
          await prepare('INSERT INTO settings (id, key, value) VALUES (?, ?, ?)').run(uuidv4(), cleanKey, strVal);
        }
      }
    }

    const updatedSettings = await getSettings();
    res.json({ message: 'Configuración guardada exitosamente', settings: updatedSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la configuración' });
  }
});

// POST /api/settings/test-smtp - Send test email (supports both Resend API and Nodemailer SMTP)
router.post('/test-smtp', async (req, res) => {
  try {
    const savedSettings = await getSettings();

    const provider = req.body.email_provider || savedSettings.email_provider || 'smtp';
    const resendApiKey = (provider === 'resend' ? (req.body.resend_api_key || savedSettings.resend_api_key || '') : '').trim();
    const brevoApiKey = (provider === 'brevo' ? (req.body.brevo_api_key || savedSettings.brevo_api_key || '') : '').trim();

    let host = (req.body.smtp_host || savedSettings.smtp_host || DEFAULT_SETTINGS.smtp_host).trim();
    let port = (req.body.smtp_port || savedSettings.smtp_port || DEFAULT_SETTINGS.smtp_port).toString().trim();
    let secure = req.body.smtp_secure !== undefined ? req.body.smtp_secure : savedSettings.smtp_secure;
    let user = (req.body.smtp_user || savedSettings.smtp_user || DEFAULT_SETTINGS.smtp_user).trim();
    let pass = (req.body.smtp_pass || savedSettings.smtp_pass || DEFAULT_SETTINGS.smtp_pass).trim();
    let from = (req.body.smtp_from || savedSettings.smtp_from || DEFAULT_SETTINGS.smtp_from).trim();

    // Sanitize any legacy placeholder values
    if (user === 'smtp_account@gmail.com' || !user) {
      user = DEFAULT_SETTINGS.smtp_user;
    }
    if (pass === 'secretpassword' || !pass) {
      pass = DEFAULT_SETTINGS.smtp_pass;
    }

    const rawEmail = req.body.target_email || req.body.test_email || req.body.notification_email || user;
    const emailToSend = (rawEmail || '').split(',')[0].trim();

    if (!emailToSend || !emailToSend.includes('@')) {
      return res.status(400).json({ error: 'Debes ingresar un correo destinatario de prueba válido (ejemplo: tu-correo@gmail.com).' });
    }

    if (provider === 'resend' && !resendApiKey) {
      return res.status(400).json({ error: 'Debes ingresar tu Clave API de Resend (comienza con re_) para realizar la prueba.' });
    }

    if (provider === 'brevo' && !brevoApiKey) {
      return res.status(400).json({ error: 'Debes ingresar tu Clave API de Brevo (comienza con xkeysib-) para realizar la prueba.' });
    }

    const config = {
      email_provider: provider,
      resend_api_key: resendApiKey,
      brevo_api_key: brevoApiKey,
      smtp_host: host,
      smtp_port: port,
      smtp_secure: secure,
      smtp_user: user,
      smtp_pass: pass,
      smtp_from: from,
    };

    await sendTestEmail(config, emailToSend);
    const methodDesc = provider === 'brevo' ? 'vía Brevo API (HTTPS)' : provider === 'resend' ? 'vía Resend API (HTTPS)' : 'vía Servidor SMTP';
    res.json({ success: true, message: `¡Correo de prueba enviado exitosamente a ${emailToSend} (${methodDesc})!` });
  } catch (error) {
    console.error('Error sending test email:', error);
    let errorMsg = error.message || error.response || 'Error de conexión con el servicio de correo';

    if (errorMsg.includes('535') || errorMsg.includes('BadCredentials') || errorMsg.includes('Username and Password not accepted') || error.code === 'EAUTH') {
      errorMsg = 'Error de autenticación SMTP (535): Google rechazó las credenciales. Si estás usando una cuenta de Gmail (@gmail.com), debes generar una "Contraseña de Aplicación" de 16 letras en https://myaccount.google.com/apppasswords.';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED' || errorMsg.includes('timeout')) {
      errorMsg = 'Tiempo de espera agotado: El servidor en la nube (Railway) bloquea por cortafuegos las conexiones salientes por los puertos SMTP 587 y 465. Para solucionarlo sin costo, selecciona la opción "Resend API (HTTPS)" en la parte superior e ingresa tu clave API gratuita de resend.com (funciona por puerto HTTPS 443 sin bloqueos).';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = `No se pudo encontrar el servidor SMTP (${req.body.smtp_host}). Verifica que el nombre del host sea correcto.`;
    }

    res.status(400).json({
      error: errorMsg,
    });
  }
});

export default router;
