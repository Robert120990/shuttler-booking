import nodemailer from 'nodemailer';
import { prepare } from '../db.js';

/**
 * Retrieves SMTP and notification settings from the database
 */
export async function getSettings() {
  try {
    const rows = await prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (error) {
    console.error('Error loading settings from DB:', error);
    return {};
  }
}

/**
 * Creates a Nodemailer transporter using DB settings or provided custom config
 */
export function createTransporter(config) {
  if (!config) return null;

  const host = config.smtp_host || process.env.SMTP_HOST;
  const port = Number(config.smtp_port || process.env.SMTP_PORT || 587);
  const secure = config.smtp_secure === 'true' || config.smtp_secure === true || port === 465;
  const user = config.smtp_user || process.env.SMTP_USER;
  const pass = config.smtp_pass || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Sends a test email to verify SMTP configuration
 */
export async function sendTestEmail(customConfig, targetEmail) {
  const transporter = createTransporter(customConfig);
  if (!transporter) {
    throw new Error('Configuración SMTP incompleta. Asegúrate de ingresar servidor, usuario y contraseña.');
  }

  // Verify connection configuration
  await transporter.verify();

  const from = customConfig.smtp_from || customConfig.smtp_user || 'Trail Explorer <no-reply@trailexplorer.com>';

  const mailOptions = {
    from,
    to: targetEmail,
    subject: '🧪 Correo de Prueba - Configuración SMTP Trail Explorer',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded-lg: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #059669; margin: 0;">¡Configuración SMTP Exitosa!</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Este es un correo de prueba del sistema Trail Explorer.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #059669; margin-bottom: 20px;">
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">
            Tu servidor SMTP está correctamente configurado. A partir de ahora, cada vez que un cliente realice una reserva, recibirás una notificación inmediata en el correo configurado.
          </p>
        </div>
        <div style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Trail Explorer Booking System &bull; ${new Date().toLocaleString('es-ES')}
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

/**
 * Sends a notification email when a new booking is created
 */
export async function sendBookingNotification(booking, shuttle = null) {
  try {
    const settings = await getSettings();
    const transporter = createTransporter(settings);

    if (!transporter) {
      console.log('SMTP no configurado: Omitiendo envío de correo de notificación de reserva.');
      return;
    }

    const recipientEmail = settings.notification_email || settings.smtp_user;
    if (!recipientEmail) {
      console.log('No se configuró un correo de notificación en los ajustes.');
      return;
    }

    const from = settings.smtp_from || settings.smtp_user || 'Trail Explorer <reservas@trailexplorer.com>';
    const shuttleName = shuttle?.name || booking.shuttle_name || 'Ruta de Shuttle';
    const bookingDate = new Date(booking.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">¡Nueva Reserva Recibida!</h1>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Reserva #${booking.id.slice(0, 8).toUpperCase()}</p>
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

    // 1. Send notification to admin / notification email
    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: `🚐 Nueva Reserva: ${shuttleName} - ${booking.passenger_name || 'Cliente'} ($${booking.total_price})`,
      html: emailHtml,
    });
    console.log(`✅ Notificación de reserva enviada exitosamente a ${recipientEmail}`);

    // 2. If configured, send confirmation copy to the customer
    if (settings.send_customer_email === 'true' && booking.passenger_email) {
      try {
        await transporter.sendMail({
          from,
          to: booking.passenger_email,
          subject: `✅ Confirmación de Reserva: ${shuttleName} - Trail Explorer`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 22px;">¡Gracias por tu reserva, ${booking.passenger_name || 'Viajero'}!</h1>
                <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Hemos recibido los detalles de tu viaje con éxito.</p>
              </div>
              <div style="padding: 24px;">
                <p style="color: #334155; font-size: 14px; line-height: 1.6;">
                  Tu solicitud para la ruta <strong>${shuttleName}</strong> el día <strong>${bookingDate}</strong> está siendo procesada. Nos pondremos en contacto contigo si requerimos información adicional.
                </p>
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px;">
                  <p style="margin: 0 0 8px;"><strong>Recogida:</strong> ${booking.pickup_location}</p>
                  <p style="margin: 0 0 8px;"><strong>Entrega:</strong> ${booking.dropoff_location}</p>
                  <p style="margin: 0 0 8px;"><strong>Pasajeros:</strong> ${booking.seats || 1}</p>
                  <p style="margin: 0;"><strong>Total:</strong> $${booking.total_price} USD</p>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
                Trail Explorer &bull; Soporte y Asistencia
              </div>
            </div>
          `,
        });
        console.log(`✅ Confirmación enviada al cliente: ${booking.passenger_email}`);
      } catch (custErr) {
        console.error('Error enviando correo al cliente:', custErr);
      }
    }
  } catch (error) {
    console.error('Error al enviar correo de notificación de reserva:', error);
  }
}
