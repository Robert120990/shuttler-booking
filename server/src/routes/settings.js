import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { getSettings, sendTestEmail } from '../utils/mailer.js';

const router = express.Router();

// GET /api/settings - Retrieve all settings
router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// POST /api/settings - Save / update settings
router.post('/', (req, res) => {
  try {
    const settingsData = req.body;
    if (typeof settingsData !== 'object' || settingsData === null) {
      return res.status(400).json({ error: 'Datos de configuración inválidos' });
    }

    const upsertStmt = prepare(`
      INSERT INTO settings (id, key, value)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(settingsData)) {
      if (typeof key === 'string' && key.trim()) {
        const strVal = value === undefined || value === null ? '' : String(value);
        upsertStmt.run(uuidv4(), key, strVal);
      }
    }

    const updatedSettings = getSettings();
    res.json({ message: 'Configuración guardada exitosamente', settings: updatedSettings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: error.message || 'Error al guardar la configuración' });
  }
});

// POST /api/settings/test-smtp - Send test email
router.post('/test-smtp', async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, smtp_from, target_email } = req.body;

    const emailToSend = target_email || req.body.notification_email || smtp_user;
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
    res.status(400).json({
      error: `Error al enviar correo de prueba: ${error.message || 'Verifica los datos SMTP'}`,
    });
  }
});

export default router;
