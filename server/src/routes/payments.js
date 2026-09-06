import express from 'express';
import { prepare } from '../db.js';
import { getSettings, sendBookingStatusNotification } from '../utils/mailer.js';

const router = express.Router();

// Helper to get PayPal access token if secret is configured
async function getPayPalAccessToken(clientId, clientSecret, isLive) {
  const host = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${host}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || 'Failed to authenticate with PayPal');
  }
  return { token: data.access_token, host };
}

// POST /api/payments/paypal/create-order
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { booking_id, amount } = req.body;
    const settings = await getSettings();

    const clientId = settings.paypal_client_id;
    const clientSecret = settings.paypal_secret_key;
    const isLive = settings.paypal_env === 'live';

    // If full server-side PayPal credentials configured, create real PayPal order
    if (clientId && clientSecret) {
      try {
        const { token, host } = await getPayPalAccessToken(clientId, clientSecret, isLive);

        const orderRes = await fetch(`${host}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
              {
                reference_id: booking_id,
                description: `Reserva Trail Explorer #${(booking_id || '').slice(0, 8)}`,
                amount: {
                  currency_code: 'USD',
                  value: Number(amount).toFixed(2),
                },
              },
            ],
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.message || 'PayPal error creating order');
        }

        return res.json({ id: orderData.id, status: orderData.status });
      } catch (paypalErr) {
        console.warn('PayPal direct API creation error, using client-side order flow:', paypalErr.message);
      }
    }

    // Fallback: Return simulated or client-approved order reference
    const orderId = `PAYPAL-ORD-${Date.now()}-${(booking_id || '').slice(0, 6)}`;
    res.json({ id: orderId, status: 'CREATED', simulated: true });
  } catch (error) {
    console.error('Error in paypal create-order:', error);
    res.status(500).json({ error: error.message || 'Error al crear orden de PayPal' });
  }
});

// POST /api/payments/paypal/capture-order
router.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Falta booking_id requerido' });
    }

    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const details = JSON.stringify({
      provider: 'paypal',
      orderID: orderID || `PAYPAL-CAPTURED-${Date.now()}`,
      captured_at: new Date().toISOString(),
    });

    await prepare(`
      UPDATE bookings 
      SET payment_status = 'paid', 
          status = 'confirmed', 
          payment_method = 'paypal', 
          payment_id = ?, 
          payment_details = ? 
      WHERE id = ?
    `).run(orderID || `PAYPAL-${Date.now()}`, details, booking_id);

    const updated = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);

    // Send confirmation email
    sendBookingStatusNotification(updated, 'confirmed').catch((err) => {
      console.error('Error enviando notificación tras pago PayPal:', err);
    });

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message || 'Error al capturar pago de PayPal' });
  }
});

// POST /api/payments/wompi/create-checkout
router.post('/wompi/create-checkout', async (req, res) => {
  try {
    const { booking_id, amount, customer_email, customer_name } = req.body;
    const settings = await getSettings();

    const publicKey = settings.wompi_public_key;
    const isProd = settings.wompi_env === 'production';
    const reference = `TE-WOMPI-${(booking_id || '').slice(0, 8)}-${Date.now()}`;

    // Wompi uses cents for COP or standard format for SV (El Salvador in USD)
    res.json({
      publicKey: publicKey || 'pub_test_placeholder',
      reference,
      currency: 'USD',
      amountInCents: Math.round(Number(amount) * 100),
      amount: Number(amount).toFixed(2),
      customerEmail: customer_email || '',
      customerName: customer_name || '',
      isProd,
    });
  } catch (error) {
    console.error('Error in wompi create-checkout:', error);
    res.status(500).json({ error: error.message || 'Error al preparar cobro Wompi' });
  }
});

// POST /api/payments/wompi/confirm
router.post('/wompi/confirm', async (req, res) => {
  try {
    const { transaction_id, booking_id, reference } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Falta booking_id requerido' });
    }

    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const paymentId = transaction_id || reference || `WOMPI-${Date.now()}`;
    const details = JSON.stringify({
      provider: 'wompi',
      transaction_id: paymentId,
      reference: reference || null,
      confirmed_at: new Date().toISOString(),
    });

    await prepare(`
      UPDATE bookings 
      SET payment_status = 'paid', 
          status = 'confirmed', 
          payment_method = 'wompi', 
          payment_id = ?, 
          payment_details = ? 
      WHERE id = ?
    `).run(paymentId, details, booking_id);

    const updated = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);

    // Send confirmation email
    sendBookingStatusNotification(updated, 'confirmed').catch((err) => {
      console.error('Error enviando notificación tras pago Wompi:', err);
    });

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error confirming Wompi payment:', error);
    res.status(500).json({ error: error.message || 'Error al confirmar pago Wompi' });
  }
});

// POST /api/payments/pay-on-arrival
router.post('/pay-on-arrival', async (req, res) => {
  try {
    const { booking_id } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Falta booking_id requerido' });
    }

    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await prepare(`
      UPDATE bookings 
      SET payment_status = 'pending', 
          status = 'confirmed', 
          payment_method = 'pay_on_arrival' 
      WHERE id = ?
    `).run(booking_id);

    const updated = await prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);

    sendBookingStatusNotification(updated, 'confirmed').catch((err) => {
      console.error('Error enviando notificación pago al abordar:', err);
    });

    res.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Error updating pay-on-arrival:', error);
    res.status(500).json({ error: error.message || 'Error al registrar pago al abordar' });
  }
});

export default router;
