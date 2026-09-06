import nodemailer from 'nodemailer';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Default fallback SMTP, notification and contact settings
 */
export const DEFAULT_SETTINGS = {
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
  // Contact and Social Information
  contact_email: 'info@trailexplorer.com',
  contact_phone: '+503 1234 5678',
  contact_whatsapp: '+503 1234 5678',
  contact_address: 'San Salvador, El Salvador',
  contact_hours: 'Lunes a Domingo: 24/7',
  social_facebook: '',
  social_instagram: '',
  social_tiktok: '',
};

/**
 * Retrieves SMTP, notification and contact settings from the database.
 * Only inserts default keys if they do not exist yet; never overwrites user values.
 */
export async function getSettings() {
  try {
    const rows = await prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    // Only seed default keys that have never been created in the database or are empty strings
    for (const [key, defaultValue] of Object.entries(DEFAULT_SETTINGS)) {
      if (settings[key] === undefined || settings[key] === null || (typeof settings[key] === 'string' && !settings[key].trim() && defaultValue)) {
        settings[key] = defaultValue;
        try {
          const existing = await prepare('SELECT id FROM settings WHERE key = ?').get(key);
          if (!existing) {
            await prepare('INSERT INTO settings (id, key, value) VALUES (?, ?, ?)').run(uuidv4(), key, defaultValue);
          } else {
            await prepare('UPDATE settings SET value = ? WHERE key = ?').run(defaultValue, key);
          }
        } catch (dbErr) {
          // Continue if written concurrently
        }
      }
    }

    return settings;
  } catch (error) {
    console.error('Error loading settings from DB:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Helper to get proper From and optional Reply-To address matching SMTP user
 */
export function getMailSenderOptions(config) {
  const user = (config?.smtp_user || process.env.SMTP_USER || '').trim();
  const rawFrom = (config?.smtp_from || '').trim();
  const isGmail = (config?.smtp_host || '').toLowerCase().includes('gmail') || user.toLowerCase().endsWith('@gmail.com');

  if (!rawFrom) {
    const address = user ? `Trail Explorer <${user}>` : 'Trail Explorer <no-reply@trailexplorer.com>';
    return { from: address };
  }

  // If user entered only a name like "Trail Explorer", attach user email
  if (!rawFrom.includes('@')) {
    return {
      from: user ? `"${rawFrom}" <${user}>` : `"${rawFrom}" <no-reply@trailexplorer.com>`,
    };
  }

  // If using Gmail SMTP and custom sender has a specific email domain:
  if (isGmail && user) {
    const nameMatch = rawFrom.match(/^"?([^"<]+)"?\s*<([^>]+)>/);
    const displayName = nameMatch ? nameMatch[1].trim() : 'Trail Explorer';
    const senderEmail = nameMatch ? nameMatch[2].trim() : rawFrom.trim();

    if (senderEmail.toLowerCase() !== user.toLowerCase()) {
      return {
        from: `"${displayName}" <${user}>`,
        replyTo: senderEmail,
      };
    }
  }

  return { from: rawFrom };
}

/**
 * Helper to get proper From address matching SMTP user (backwards compatibility)
 */
export function getFromAddress(config) {
  return getMailSenderOptions(config).from;
}

/**
 * Creates a Nodemailer transporter using DB settings or provided custom config
 */
export function createTransporter(config, forcePort = null) {
  if (!config) return null;

  const rawHost = (config.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPort = forcePort || (config.smtp_port || process.env.SMTP_PORT || '587').toString().trim();
  const port = Number(rawPort) || 587;
  const user = (config.smtp_user || process.env.SMTP_USER || '').trim();
  let pass = (config.smtp_pass || process.env.SMTP_PASS || '').trim();

  if (!rawHost || !user || !pass) {
    return null;
  }

  // If host is Gmail and pass has spaces (Google App Passwords format "xxxx xxxx xxxx xxxx"), remove spaces
  if ((rawHost.toLowerCase().includes('gmail') || rawHost.toLowerCase().includes('google')) && pass.includes(' ')) {
    pass = pass.replace(/\s+/g, '');
  }

  // Determine secure: port 465 is SSL direct (secure: true); port 587/25/2525 is STARTTLS (secure: false)
  let isSecure = port === 465;
  if (config.smtp_secure !== undefined && config.smtp_secure !== null) {
    if (config.smtp_secure === 'true' || config.smtp_secure === true) {
      isSecure = true;
    } else if (config.smtp_secure === 'false' || config.smtp_secure === false) {
      isSecure = false;
    }
  }

  return nodemailer.createTransport({
    host: rawHost,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    connectionTimeout: 9000,
    greetingTimeout: 6000,
    socketTimeout: 12000,
  });
}

/**
 * Sends an email using Resend's HTTPS REST API (Port 443 - never blocked by cloud firewalls like Railway)
 */
export async function sendViaResend(apiKey, options) {
  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    throw new Error('Debes ingresar una clave de API de Resend (comienza con re_).');
  }

  const recipients = Array.isArray(options.to)
    ? options.to
    : (options.to || '')
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);

  if (recipients.length === 0) {
    throw new Error('No se especificó ningún destinatario para el correo.');
  }

  let fromAddress = options.from || 'Trail Explorer <onboarding@resend.dev>';
  if (!fromAddress.includes('@')) {
    fromAddress = `"${fromAddress}" <onboarding@resend.dev>`;
  }

  const payload = {
    from: fromAddress,
    to: recipients,
    subject: options.subject,
    html: options.html,
  };

  if (options.text) {
    payload.text = options.text;
  }

  if (options.replyTo) {
    payload.reply_to = options.replyTo;
  }

  let res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let data = await res.json();
  if (!res.ok) {
    const errMessage = data.message || data.error?.message || '';

    // Auto-retry with onboarding@resend.dev if custom domain is unverified
    if (
      (errMessage.includes('domain_not_verified') ||
        errMessage.includes('from address') ||
        errMessage.includes('domain is not verified') ||
        errMessage.includes('validation_error') ||
        errMessage.includes('testing emails')) &&
      !payload.from.includes('onboarding@resend.dev')
    ) {
      console.log('Dominio de Resend no verificado, reintentando automáticamente con onboarding@resend.dev...');
      payload.from = 'Trail Explorer <onboarding@resend.dev>';
      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      data = await res.json();
    }

    if (!res.ok) {
      const finalMsg = data.message || data.error?.message || errMessage || 'Error desconocido al conectar con Resend API';
      if (finalMsg.includes('testing emails to your own email address') || finalMsg.includes('only send testing')) {
        throw new Error(
          `Resend (Modo Prueba gratuito): Al usar 'onboarding@resend.dev', Resend únicamente permite enviar correos a la dirección con la que te registraste en resend.com. Por favor ingresa esa dirección en el campo 'Correo Destinatario de Prueba'.`
        );
      }
      if (finalMsg.includes('API key') || finalMsg.includes('restricted') || finalMsg.includes('Unauthorized') || res.status === 401) {
        throw new Error('Clave API de Resend inválida o no autorizada. Verifica que comience con re_ y esté activa en tu cuenta de resend.com.');
      }
      throw new Error(`Error de Resend API: ${finalMsg}`);
    }
  }

  return data;
}

/**
 * HTML Template for Admin Booking Notification
 */
export function buildAdminBookingHtml(booking, shuttle, shuttleName, bookingDate) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">¡Nueva Reserva Recibida!</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Reserva #${(booking.id || '').slice(0, 8).toUpperCase()}</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <!-- Route & Total Box -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #166534; font-weight: 600; font-size: 16px;">${shuttleName}</span>
          </div>
          <div style="color: #15803d; font-size: 20px; font-weight: 700;">
            Total: $${booking.total_price} USD
          </div>
          <div style="color: #4b5563; font-size: 13px; margin-top: 4px;">
            Fecha del viaje: <strong>${bookingDate}</strong>
          </div>
        </div>

        <!-- Passenger Details -->
        <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
          👤 Datos del Pasajero
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Nombre:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.passenger_name || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Correo:</td>
            <td style="padding: 6px 0; color: #0f172a;"><a href="mailto:${booking.passenger_email}" style="color: #059669; text-decoration: none;">${booking.passenger_email || 'N/A'}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Teléfono:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.passenger_phone || 'N/A'}</td>
          </tr>
          ${booking.pickup_person_name ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Persona a recoger:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.pickup_person_name}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Pasajeros / Asientos:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${booking.seats || 1}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Equipaje extra:</td>
            <td style="padding: 6px 0; color: #0f172a;">${booking.extra_luggage > 0 ? `${booking.extra_luggage} maletas` : 'Sin equipaje extra'}</td>
          </tr>
        </table>

        <!-- Locations -->
        <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
          📍 Puntos de Encuentro
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 40%;">Lugar de recogida:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${booking.pickup_location || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Lugar de entrega:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${booking.dropoff_location || 'N/A'}</td>
          </tr>
        </table>

        <!-- Status & Payment -->
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 12px; font-size: 13px; color: #475569;">
          <span>Estado de reserva: <strong style="color: #0f172a; text-transform: uppercase;">${booking.status || 'pending'}</strong></span>
          <span style="margin: 0 8px;">&bull;</span>
          <span>Estado de pago: <strong style="color: #0f172a; text-transform: uppercase;">${booking.payment_status || 'pending'}</strong></span>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        Este correo fue generado automáticamente por el sistema de reservas de Trail Explorer.<br/>
        Recibido el ${new Date().toLocaleString('es-ES')}
      </div>
    </div>
  `;
}

/**
 * Plain-text Template for Admin Booking Notification
 */
export function buildAdminBookingText(booking, shuttle, shuttleName, bookingDate) {
  const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
  return `¡Nueva Reserva Recibida!
Reserva #${bookingCode}

Detalles del Viaje:
- Ruta: ${shuttleName}
- Total: $${booking.total_price} USD
- Fecha del viaje: ${bookingDate}

Datos del Pasajero:
- Nombre: ${booking.passenger_name || 'N/A'}
- Correo: ${booking.passenger_email || 'N/A'}
- Teléfono: ${booking.passenger_phone || 'N/A'}
${booking.pickup_person_name ? `- Persona a recoger: ${booking.pickup_person_name}\n` : ''}- Asientos: ${booking.seats || 1}
- Equipaje extra: ${booking.extra_luggage > 0 ? `${booking.extra_luggage} maletas` : 'Sin equipaje extra'}

Puntos de Encuentro:
- Recogida: ${booking.pickup_location || 'N/A'}
- Entrega: ${booking.dropoff_location || 'N/A'}

Estado de reserva: ${booking.status || 'pending'}
Estado de pago: ${booking.payment_status || 'pending'}
`;
}

/**
 * HTML Template for Customer Booking Confirmation
 */
export function buildCustomerConfirmationHtml(booking, shuttle, shuttleName, bookingDate) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px;">¡Gracias por tu reserva, ${booking.passenger_name || 'Viajero'}!</h1>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Hemos recibido los detalles de tu viaje con éxito.</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Tu solicitud para la ruta <strong>${shuttleName}</strong> el día <strong>${bookingDate}</strong> está siendo procesada. Nos pondremos en contacto contigo si requerimos información adicional.
        </p>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px;">
          <p style="margin: 0 0 8px;"><strong>Punto de Recogida:</strong> ${booking.pickup_location}</p>
          ${booking.pickup_person_name ? `<p style="margin: 0 0 8px;"><strong>Persona a Recoger:</strong> ${booking.pickup_person_name}</p>` : ''}
          <p style="margin: 0 0 8px;"><strong>Punto de Entrega:</strong> ${booking.dropoff_location}</p>
          <p style="margin: 0 0 8px;"><strong>Número de Pasajeros:</strong> ${booking.seats || 1}</p>
          <p style="margin: 0;"><strong>Total Pagado/Estimado:</strong> $${booking.total_price} USD</p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        Trail Explorer &bull; Soporte y Asistencia de Viaje
      </div>
    </div>
  `;
}

/**
 * Plain-text Template for Customer Booking Confirmation
 */
export function buildCustomerConfirmationText(booking, shuttle, shuttleName, bookingDate) {
  return `¡Gracias por tu reserva, ${booking.passenger_name || 'Viajero'}!

Hemos recibido los detalles de tu viaje con éxito. Tu solicitud para la ruta ${shuttleName} el día ${bookingDate} está siendo procesada.

Detalles:
- Punto de Recogida: ${booking.pickup_location}
${booking.pickup_person_name ? `- Persona a Recoger: ${booking.pickup_person_name}\n` : ''}- Punto de Entrega: ${booking.dropoff_location}
- Número de Pasajeros: ${booking.seats || 1}
- Total Pagado/Estimado: $${booking.total_price} USD

Trail Explorer • Soporte y Asistencia de Viaje
`;
}

/**
 * Sends a test email to verify SMTP or Resend configuration
 */
export async function sendTestEmail(customConfig, targetEmail) {
  // Only use Resend if provider is 'resend' or if provider is not 'smtp' and a resend key exists
  const isResend =
    customConfig?.email_provider === 'resend' ||
    (customConfig?.email_provider !== 'smtp' && (
      Boolean(customConfig?.resend_api_key?.trim()) ||
      Boolean(customConfig?.smtp_pass && customConfig.smtp_pass.trim().startsWith('re_'))
    ));

  const senderOptions = getMailSenderOptions(customConfig);
  const providerLabel = isResend ? 'Resend API HTTPS' : 'Servidor SMTP';

  const mailOptions = {
    ...senderOptions,
    to: targetEmail,
    subject: '🧪 Correo de Prueba - Configuración Trail Explorer',
    text: `¡Configuración de Correo Exitosa!\n\nEste es un correo de prueba del sistema Trail Explorer.\nTu servicio de correo (${providerLabel}) está correctamente configurado y listo para enviar notificaciones automáticas de reservas.\n\nTrail Explorer Booking System • ${new Date().toLocaleString('es-ES')}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0;">¡Configuración de Correo Exitosa!</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Este es un correo de prueba del sistema Trail Explorer.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 20px;">
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
            Tu servicio de correo (${providerLabel}) está correctamente configurado y listo para enviar notificaciones automáticas de reservas.
          </p>
        </div>
        <div style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Trail Explorer Booking System &bull; ${new Date().toLocaleString('es-ES')}
        </div>
      </div>
    `,
  };

  if (isResend) {
    const apiKey = (customConfig.resend_api_key || customConfig.smtp_pass || '').trim();
    let resendFrom = customConfig.smtp_from?.trim() || 'Trail Explorer <onboarding@resend.dev>';
    return await sendViaResend(apiKey, {
      ...mailOptions,
      from: resendFrom,
      replyTo: customConfig.smtp_user || undefined,
    });
  }

  let transporter = createTransporter(customConfig);
  if (!transporter) {
    throw new Error('Configuración SMTP incompleta. Asegúrate de ingresar servidor, usuario y contraseña.');
  }

  // Verify connection configuration with automatic port fallback (587 <-> 465) if timeout
  try {
    await transporter.verify();
  } catch (verifyErr) {
    const currentPort = Number(customConfig?.smtp_port || 587);
    const alternatePort = currentPort === 465 ? 587 : 465;
    const isTimeout =
      verifyErr.code === 'ETIMEDOUT' ||
      verifyErr.code === 'ESOCKET' ||
      verifyErr.code === 'ECONNRESET' ||
      verifyErr.code === 'ECONNREFUSED' ||
      verifyErr.message?.includes('timeout');

    if (isTimeout) {
      console.log(`Timeout en puerto ${currentPort}, intentando automáticamente con puerto alternativo ${alternatePort}...`);
      try {
        const fallbackTransporter = createTransporter(customConfig, alternatePort);
        await fallbackTransporter.verify();
        transporter = fallbackTransporter;
      } catch (fallbackErr) {
        throw verifyErr; // Throw original error so client gets clear cloud firewall diagnostic
      }
    } else {
      throw verifyErr;
    }
  }

  return await transporter.sendMail(mailOptions);
}

/**
 * Sends a notification email when a new booking is created
 */
export async function sendBookingNotification(booking, shuttle = null) {
  try {
    const settings = await getSettings();
    const isResend =
      settings.email_provider === 'resend' ||
      (settings.email_provider !== 'smtp' && (
        Boolean(settings.resend_api_key?.trim()) ||
        Boolean(settings.smtp_pass && settings.smtp_pass.trim().startsWith('re_'))
      ));

    const rawRecipient = settings.notification_email || settings.smtp_user;
    if (!rawRecipient) {
      console.log('No se configuró un correo de notificación en los ajustes.');
      return;
    }

    const recipientEmails = rawRecipient
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipientEmails.length === 0) {
      console.log('No hay destinatarios válidos para la notificación.');
      return;
    }

    const shuttleName = shuttle?.name || booking.shuttle_name || 'Ruta de Shuttle';
    const bookingDate = new Date(booking.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailHtml = buildAdminBookingHtml(booking, shuttle, shuttleName, bookingDate);
    const emailText = buildAdminBookingText(booking, shuttle, shuttleName, bookingDate);
    const adminSubject = `🚐 Nueva Reserva: ${shuttleName} - ${booking.passenger_name || 'Cliente'} ($${booking.total_price} USD)`;

    if (isResend) {
      const apiKey = (settings.resend_api_key || settings.smtp_pass || '').trim();
      let resendFrom = settings.smtp_from?.trim() || 'Trail Explorer <onboarding@resend.dev>';

      // 1. Send admin notification
      try {
        await sendViaResend(apiKey, {
          from: resendFrom,
          to: recipientEmails,
          subject: adminSubject,
          text: emailText,
          html: emailHtml,
          replyTo: booking.passenger_email || undefined,
        });
        console.log(`✅ [Resend] Notificación de reserva enviada a ${recipientEmails.join(', ')}`);
      } catch (adminErr) {
        console.error('Error enviando notificación admin vía Resend:', adminErr);
      }

      // 2. Send customer confirmation
      if (settings.send_customer_email === 'true' && booking.passenger_email) {
        try {
          const customerHtml = buildCustomerConfirmationHtml(booking, shuttle, shuttleName, bookingDate);
          const customerText = buildCustomerConfirmationText(booking, shuttle, shuttleName, bookingDate);
          await sendViaResend(apiKey, {
            from: resendFrom,
            to: booking.passenger_email,
            subject: `✅ Confirmación de Reserva: ${shuttleName} - Trail Explorer`,
            text: customerText,
            html: customerHtml,
            replyTo: settings.notification_email || settings.smtp_user || undefined,
          });
          console.log(`✅ [Resend] Confirmación enviada al cliente: ${booking.passenger_email}`);
        } catch (custErr) {
          console.error('Error enviando correo al cliente vía Resend:', custErr);
        }
      }
      return;
    }

    // SMTP path:
    const transporter = createTransporter(settings);
    if (!transporter) {
      console.log('SMTP no configurado: Omitiendo envío de correo de notificación de reserva.');
      return;
    }

    const senderOptions = getMailSenderOptions(settings);
    const primaryRecipients = recipientEmails.join(', ');

    // 1. Send notification to admin
    await transporter.sendMail({
      ...senderOptions,
      to: primaryRecipients,
      subject: adminSubject,
      text: emailText,
      html: emailHtml,
    });
    console.log(`✅ [SMTP] Notificación de reserva enviada exitosamente a ${primaryRecipients}`);

    // 2. Send confirmation to customer
    if (settings.send_customer_email === 'true' && booking.passenger_email) {
      try {
        const customerHtml = buildCustomerConfirmationHtml(booking, shuttle, shuttleName, bookingDate);
        const customerText = buildCustomerConfirmationText(booking, shuttle, shuttleName, bookingDate);
        await transporter.sendMail({
          ...senderOptions,
          to: booking.passenger_email,
          subject: `✅ Confirmación de Reserva: ${shuttleName} - Trail Explorer`,
          text: customerText,
          html: customerHtml,
        });
        console.log(`✅ [SMTP] Confirmación enviada al cliente: ${booking.passenger_email}`);
      } catch (custErr) {
        console.error('Error enviando correo al cliente vía SMTP:', custErr);
      }
    }
  } catch (error) {
    console.error('Error al procesar envío de notificación de reserva:', error);
  }
}

/**
 * HTML Template for Booking Confirmed Status Notification
 */
export function buildCustomerBookingConfirmedHtml(booking, shuttle, shuttleName, bookingDate) {
  const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background-color: #059669; padding: 26px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">¡Tu Reserva está Confirmada! 🚐</h1>
        <p style="margin: 6px 0 0; opacity: 0.95; font-size: 15px; font-family: monospace; font-weight: 600;">Reserva #${bookingCode}</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0;">
          Hola <strong>${booking.passenger_name || 'Viajero'}</strong>, nos complace informarte que tu viaje en shuttle ha sido <strong>CONFIRMADO</strong> oficialmente. Tu conductor y el operador de transporte tienen programado tu servicio.
        </p>

        <!-- Route & Status Summary Card -->
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="color: #14532d; font-weight: 700; font-size: 17px;">${shuttleName}</span>
          </div>
          <div style="color: #15803d; font-size: 22px; font-weight: 800; margin-bottom: 6px;">
            Total: $${booking.total_price} USD
          </div>
          <div style="color: #374151; font-size: 14px; margin-bottom: 10px;">
            📅 Fecha del viaje: <strong>${bookingDate}</strong>
            ${shuttle?.schedule ? `<br/>⏰ Horario establecido: <strong>${shuttle.schedule}</strong>` : ''}
          </div>
          <div style="display: inline-block; background-color: #059669; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ✓ Confirmado
          </div>
        </div>

        <!-- Meeting Points -->
        <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
          📍 Puntos de Recogida y Entrega
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 38%;">Lugar de recogida:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${booking.pickup_location}</td>
          </tr>
          ${booking.pickup_person_name ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Persona a recoger:</td>
            <td style="padding: 8px 0; color: #047857; font-weight: 700;">${booking.pickup_person_name}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Lugar de entrega:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${booking.dropoff_location}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Pasajeros / Asientos:</td>
            <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${booking.seats || 1} persona(s)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Equipaje extra:</td>
            <td style="padding: 8px 0; color: #0f172a;">${booking.extra_luggage > 0 ? `${booking.extra_luggage} pieza(s) extra` : 'Sin equipaje extra'}</td>
          </tr>
        </table>

        <!-- Travel Recommendations -->
        <div style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          <strong style="color: #0f172a;">Recomendaciones para el día del viaje:</strong>
          <ul style="margin: 6px 0 0; padding-left: 18px;">
            <li>Por favor preséntate en la recepción o lobby del hostal/hotel <strong>15 minutos antes</strong> de la hora acordada.</li>
            <li>Ten listo tu pasaporte o documento de identidad oficial si tu viaje cruza fronteras.</li>
            <li>En caso de requerir coordinar el acceso, el conductor se comunicará al teléfono/WhatsApp: <strong>${booking.passenger_phone || 'registrado en tu reserva'}</strong>.</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
        Trail Explorer &bull; Servicio al Cliente y Soporte de Viaje<br/>
        ¿Necesitas cambios o ayuda urgente? Responde directamente a este correo.
      </div>
    </div>
  `;
}

/**
 * HTML Template for Booking Cancelled Status Notification
 */
export function buildCustomerBookingCancelledHtml(booking, shuttle, shuttleName, bookingDate) {
  const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <!-- Header -->
      <div style="background-color: #dc2626; padding: 26px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Reserva Cancelada ❌</h1>
        <p style="margin: 6px 0 0; opacity: 0.95; font-size: 15px; font-family: monospace; font-weight: 600;">Reserva #${bookingCode}</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-top: 0;">
          Hola <strong>${booking.passenger_name || 'Viajero'}</strong>, te informamos que tu reserva <strong>#${bookingCode}</strong> para la ruta <strong>${shuttleName}</strong> programada para el día <strong>${bookingDate}</strong> ha sido <strong>CANCELADA</strong>.
        </p>

        <!-- Route & Status Summary Card -->
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <div style="color: #991b1b; font-weight: 700; font-size: 17px; margin-bottom: 4px;">
            ${shuttleName}
          </div>
          <div style="color: #7f1d1d; font-size: 14px; margin-bottom: 10px;">
            📅 Fecha original del viaje: <strong>${bookingDate}</strong>
          </div>
          <div style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ✕ Cancelado
          </div>
        </div>

        <!-- Cancellation & Refund Details -->
        <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
          <strong style="color: #0f172a;">Política de Cancelación y Reembolso:</strong>
          <p style="margin: 6px 0 0;">
            Si tu cancelación cumple con las condiciones aplicables (solicitada con al menos 24 horas de anticipación a la salida), cualquier reembolso correspondiente será procesado a tu método de pago original en un plazo de <strong>3 a 5 días hábiles</strong>.
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          ¿Deseas reprogramar tu viaje en otra fecha o necesitas asistencia personalizada? Responde directamente a este correo y nuestro equipo te ayudará con gusto.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
        Trail Explorer &bull; Soporte y Asistencia de Viaje
      </div>
    </div>
  `;
}

/**
 * Plain-text Template for Booking Confirmed Status Notification
 */
export function buildCustomerBookingConfirmedText(booking, shuttle, shuttleName, bookingDate) {
  const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
  return `¡Tu Reserva está Confirmada! #${bookingCode} - ${shuttleName}

Hola ${booking.passenger_name || 'Viajero'},
Nos complace informarte que tu viaje en shuttle ha sido CONFIRMADO oficialmente. Tu conductor y el operador de transporte tienen programado tu servicio.

Detalles del Viaje:
- Código de Reserva: #${bookingCode}
- Ruta: ${shuttleName}
- Total: $${booking.total_price} USD
- Fecha del viaje: ${bookingDate}
${shuttle?.schedule ? `- Horario programado: ${shuttle.schedule}\n` : ''}- Estado: Confirmado

Puntos de Recogida y Entrega:
- Lugar de recogida: ${booking.pickup_location}
${booking.pickup_person_name ? `- Persona a recoger: ${booking.pickup_person_name}\n` : ''}- Lugar de entrega: ${booking.dropoff_location}
- Pasajeros / Asientos: ${booking.seats || 1} persona(s)
- Equipaje extra: ${booking.extra_luggage > 0 ? `${booking.extra_luggage} pieza(s) extra` : 'Sin equipaje extra'}

Recomendaciones para el día del viaje:
1. Por favor preséntate en la recepción o lobby del hostal/hotel 15 minutos antes de la hora acordada.
2. Ten listo tu pasaporte o documento de identidad oficial si tu viaje cruza fronteras.
3. En caso de requerir coordinar el acceso, el conductor se comunicará al teléfono/WhatsApp: ${booking.passenger_phone || 'registrado en tu reserva'}.

Trail Explorer • Servicio al Cliente y Soporte de Viaje
¿Necesitas cambios o ayuda urgente? Responde directamente a este correo.
`;
}

/**
 * Plain-text Template for Booking Cancelled Status Notification
 */
export function buildCustomerBookingCancelledText(booking, shuttle, shuttleName, bookingDate) {
  const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
  return `Reserva Cancelada #${bookingCode} - ${shuttleName}

Hola ${booking.passenger_name || 'Viajero'},
Te informamos que tu reserva #${bookingCode} para la ruta ${shuttleName} programada para el día ${bookingDate} ha sido CANCELADA.

Detalles:
- Código de Reserva: #${bookingCode}
- Ruta: ${shuttleName}
- Fecha original: ${bookingDate}
- Estado: CANCELADO

Política de Cancelación y Reembolso:
Si tu cancelación cumple con las condiciones aplicables (solicitada con al menos 24 horas de anticipación a la salida), cualquier reembolso correspondiente será procesado a tu método de pago original en un plazo de 3 a 5 días hábiles.

¿Deseas reprogramar tu viaje en otra fecha o necesitas asistencia personalizada? Responde directamente a este correo y nuestro equipo te ayudará con gusto.

Trail Explorer • Soporte y Asistencia de Viaje
`;
}

/**
 * Sends an email notification to the customer when the booking status changes (confirmed or cancelled)
 */
export async function sendBookingStatusNotification(booking, newStatus, shuttle = null) {
  try {
    if (!booking || !booking.passenger_email) {
      console.log('No se puede enviar notificación de estado: No hay correo de pasajero registrado.');
      return { success: false, error: 'No hay correo de pasajero registrado en la reserva.' };
    }

    const settings = await getSettings();
    const isResend =
      settings.email_provider === 'resend' ||
      (settings.email_provider !== 'smtp' && (
        Boolean(settings.resend_api_key?.trim()) ||
        Boolean(settings.smtp_pass && settings.smtp_pass.trim().startsWith('re_'))
      ));

    // Resolve shuttle info if not passed
    let resolvedShuttle = shuttle;
    if (!resolvedShuttle && booking.shuttle_id) {
      try {
        resolvedShuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(booking.shuttle_id);
      } catch (dbErr) {
        // fallback to booking properties
      }
    }

    const shuttleName = resolvedShuttle?.name || booking.shuttle_name || 'Ruta de Shuttle';
    const bookingCode = (booking.id || '').slice(0, 8).toUpperCase();
    const bookingDate = new Date(booking.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let subject = '';
    let emailHtml = '';
    let emailText = '';

    if (newStatus === 'confirmed') {
      subject = `🚐 ¡Tu Reserva está Confirmada! #${bookingCode} - ${shuttleName}`;
      emailHtml = buildCustomerBookingConfirmedHtml(booking, resolvedShuttle, shuttleName, bookingDate);
      emailText = buildCustomerBookingConfirmedText(booking, resolvedShuttle, shuttleName, bookingDate);
    } else if (newStatus === 'cancelled') {
      subject = `❌ Reserva Cancelada: #${bookingCode} - ${shuttleName}`;
      emailHtml = buildCustomerBookingCancelledHtml(booking, resolvedShuttle, shuttleName, bookingDate);
      emailText = buildCustomerBookingCancelledText(booking, resolvedShuttle, shuttleName, bookingDate);
    } else {
      console.log(`No hay plantilla de notificación configurada para el estado: ${newStatus}`);
      return { success: false, error: `No hay plantilla para el estado ${newStatus}` };
    }

    if (isResend) {
      const apiKey = (settings.resend_api_key || settings.smtp_pass || '').trim();
      let resendFrom = settings.smtp_from?.trim() || 'Trail Explorer <onboarding@resend.dev>';

      await sendViaResend(apiKey, {
        from: resendFrom,
        to: booking.passenger_email,
        subject,
        text: emailText,
        html: emailHtml,
        replyTo: settings.notification_email || settings.smtp_user || undefined,
      });
      console.log(`✅ [Resend] Notificación de estado (${newStatus}) enviada al cliente: ${booking.passenger_email}`);
      return { success: true, method: 'resend', email: booking.passenger_email };
    }

    // SMTP path:
    const transporter = createTransporter(settings);
    if (!transporter) {
      console.log('SMTP no configurado: Omitiendo envío de notificación de cambio de estado.');
      return { success: false, error: 'Servicio SMTP no configurado en el sistema.' };
    }

    const senderOptions = getMailSenderOptions(settings);
    await transporter.sendMail({
      ...senderOptions,
      to: booking.passenger_email,
      subject,
      text: emailText,
      html: emailHtml,
    });
    console.log(`✅ [SMTP] Notificación de estado (${newStatus}) enviada al cliente: ${booking.passenger_email}`);
    return { success: true, method: 'smtp', email: booking.passenger_email };
  } catch (error) {
    console.error(`Error enviando notificación de estado (${newStatus}) al cliente:`, error);
    let errMsg = error.message || 'Error al enviar correo';
    if (errMsg.includes('ETIMEDOUT') || errMsg.includes('timeout') || error.code === 'ETIMEDOUT') {
      errMsg = 'Tiempo de espera agotado (ETIMEDOUT): Railway bloquea los puertos SMTP salientes (587, 465). Ve a Configuración y selecciona Resend API (HTTPS) para enviar correos sin bloqueos.';
    } else if (errMsg.includes('testing emails to your own email address') || errMsg.includes('only send testing')) {
      errMsg = `Resend en modo de prueba gratuito solo permite enviar correos a la dirección con la que te registraste en resend.com. Para enviar a clientes (${booking.passenger_email}), debes verificar un dominio propio en resend.com/domains.`;
    }
    return { success: false, error: errMsg, email: booking.passenger_email };
  }
}

