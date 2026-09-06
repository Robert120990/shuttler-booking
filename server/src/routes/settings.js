import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, sendTestEmail, DEFAULT_SETTINGS } from '../utils/mailer.js';

const router = express.Router();

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
        const strVal = value === undefined || value === null ? '' : String(value);
        const existing = await prepare('SELECT id FROM settings WHERE key = ?').get(key.trim());
        if (existing) {
          await prepare('UPDATE settings SET value = ? WHERE key = ?').run(strVal, key.trim());
        } else {
          await prepare('INSERT INTO settings (id, key, value) VALUES (?, ?, ?)').run(uuidv4(), key.trim(), strVal);
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

// POST /api/settings/test-smtp - Send test email
router.post('/test-smtp', async (req, res) => {
  try {
    const savedSettings = await getSettings();

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
    const emailToSend = rawEmail.split(',')[0].trim();

    const config = {
      smtp_host: host,
      smtp_port: port,
      smtp_secure: secure,
      smtp_user: user,
      smtp_pass: pass,
      smtp_from: from,
    };

    await sendTestEmail(config, emailToSend);
    res.json({ success: true, message: `Correo de prueba enviado exitosamente a ${emailToSend}` });
  } catch (error) {
    console.error('Error sending test email:', error);
    let errorMsg = error.message || error.response || 'Error de conexión con el servidor SMTP';
    
    if (errorMsg.includes('535') || errorMsg.includes('BadCredentials') || errorMsg.includes('Username and Password not accepted') || error.code === 'EAUTH') {
      errorMsg = 'Error de autenticación SMTP (535): Google rechazó las credenciales. Si estás usando una cuenta de Gmail (@gmail.com), Google NO permite usar tu contraseña personal de inicio de sesión. Debes generar una "Contraseña de Aplicación" de 16 letras en https://myaccount.google.com/apppasswords (requiere Verificación en 2 pasos activada).';
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || errorMsg.includes('timeout')) {
      errorMsg = 'Tiempo de espera agotado al conectar al servidor SMTP. Verifica que el Servidor (Host) y el Puerto (587 o 465) sean correctos.';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = `No se pudo encontrar el servidor SMTP (${req.body.smtp_host}). Verifica que el nombre del host sea correcto.`;
    }

    res.status(400).json({
      error: errorMsg,
    });
  }
});

export default router;
