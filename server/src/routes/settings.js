import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, sendTestEmail } from '../utils/mailer.js';

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
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, smtp_from, target_email, notification_email, test_email } = req.body;

    const emailToSend = target_email || test_email || notification_email || smtp_user;
    if (!emailToSend) {
      return res.status(400).json({ error: 'Debes especificar un correo destinatario para la prueba.' });
    }

    const config = {
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_user,
      smtp_pass,
      smtp_from,
    };

    await sendTestEmail(config, emailToSend);
    res.json({ success: true, message: `Correo de prueba enviado exitosamente a ${emailToSend}` });
  } catch (error) {
    console.error('Error sending test email:', error);
    let errorMsg = error.message || error.response || 'Error de conexión con el servidor SMTP';
    
    if (errorMsg.includes('535') || errorMsg.includes('BadCredentials') || errorMsg.includes('Username and Password not accepted') || error.code === 'EAUTH') {
      errorMsg = 'Error de autenticación SMTP: Usuario o contraseña incorrectos. Si usas Gmail/Google Workspace, debes usar una Contraseña de Aplicación de 16 caracteres (con Verificación en 2 pasos activada en tu cuenta de Google).';
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
