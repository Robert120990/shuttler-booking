import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendBookingNotification, sendBookingStatusNotification } from '../utils/mailer.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bookings = await prepare(`
      SELECT b.*, s.name as shuttle_name, u.name as user_name, u.email as user_email
      FROM bookings b
      LEFT JOIN shuttles s ON b.shuttle_id = s.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `).all();
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/manifest?date=YYYY-MM-DD[&shuttle_id=...]
router.get('/manifest', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = req.query.date || today;
    const shuttleId = req.query.shuttle_id;

    let query = `
      SELECT b.*,
             s.name as shuttle_name, s.schedule, s.duration_hours, s.operator,
             s.origin_city_id, s.destination_city_id,
             o.name as origin_name, d.name as destination_name
      FROM bookings b
      JOIN shuttles s ON b.shuttle_id = s.id
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE b.date = ? AND b.status != 'cancelled'
    `;
    const params = [targetDate];

    if (shuttleId) {
      query += ` AND b.shuttle_id = ?`;
      params.push(shuttleId);
    }

    query += ` ORDER BY s.schedule ASC, b.pickup_location ASC, b.created_at ASC`;

    const rawBookings = await prepare(query).all(...params);

    const routesMap = new Map();
    let totalPassengers = 0;
    let totalLuggage = 0;
    let boardedCount = 0;
    let pendingCount = 0;
    let noShowCount = 0;

    for (const b of rawBookings) {
      const seats = Number(b.seats) || 1;
      const luggage = Number(b.extra_luggage) || 0;
      const bStatus = b.boarding_status || 'pending';

      totalPassengers += seats;
      totalLuggage += luggage;

      if (bStatus === 'boarded') boardedCount += seats;
      else if (bStatus === 'no_show') noShowCount += seats;
      else pendingCount += seats;

      if (!routesMap.has(b.shuttle_id)) {
        routesMap.set(b.shuttle_id, {
          shuttle_id: b.shuttle_id,
          shuttle_name: b.shuttle_name,
          schedule: b.schedule,
          duration_hours: b.duration_hours,
          operator: b.operator,
          origin_name: b.origin_name,
          destination_name: b.destination_name,
          total_passengers: 0,
          total_luggage: 0,
          passengers: []
        });
      }

      const routeGroup = routesMap.get(b.shuttle_id);
      routeGroup.total_passengers += seats;
      routeGroup.total_luggage += luggage;
      routeGroup.passengers.push(b);
    }

    res.json({
      date: targetDate,
      summary: {
        total_bookings: rawBookings.length,
        total_passengers: totalPassengers,
        total_luggage: totalLuggage,
        boarded_count: boardedCount,
        pending_count: pendingCount,
        no_show_count: noShowCount,
        routes_count: routesMap.size
      },
      routes: Array.from(routesMap.values())
    });
  } catch (error) {
    console.error('Error fetching manifest:', error);
    res.status(500).json({ error: 'Failed to fetch manifest' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await prepare(`
      SELECT b.*, s.name as shuttle_name, s.schedule, s.duration_hours,
        o.name as origin_name, d.name as destination_name
      FROM bookings b
      JOIN shuttles s ON b.shuttle_id = s.id
      JOIN cities o ON s.origin_city_id = o.id
      JOIN cities d ON s.destination_city_id = d.id
      WHERE b.id = ?
    `).get(req.params.id);
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      shuttle_id,
      date,
      pickup_location,
      dropoff_location,
      passenger_name,
      passenger_email,
      passenger_phone,
      seats,
      extra_luggage,
      total_price,
      pickup_person_name
    } = req.body;

    if (!shuttle_id || !date || !pickup_location || !dropoff_location) {
      return res.status(400).json({ error: 'Missing required booking fields (shuttle_id, date, pickup_location, dropoff_location)' });
    }

    const id = uuidv4();

    await prepare(`
      INSERT INTO bookings (
        id, user_id, shuttle_id, date, pickup_location, dropoff_location,
        passenger_name, passenger_email, passenger_phone, seats,
        extra_luggage, total_price, status, payment_status, pickup_person_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)
    `).run(
      id,
      user_id || null,
      shuttle_id,
      date,
      pickup_location,
      dropoff_location,
      passenger_name || null,
      passenger_email || null,
      passenger_phone || null,
      seats || 1,
      extra_luggage || 0,
      total_price || 0,
      (pickup_person_name && pickup_person_name.trim()) || (passenger_name && passenger_name.trim()) || null
    );

    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    const shuttle = await prepare('SELECT * FROM shuttles WHERE id = ?').get(shuttle_id);

    // Send email notification asynchronously
    sendBookingNotification(booking, shuttle).catch((mailErr) => {
      console.error('Error enviando notificación de reserva:', mailErr);
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const oldBooking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!oldBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    
    const updatedBooking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    
    let mailResult = null;
    // Notify customer when status transitions to confirmed or cancelled
    if (oldBooking.status !== status && (status === 'confirmed' || status === 'cancelled')) {
      mailResult = await sendBookingStatusNotification(updatedBooking, status);
    }

    res.json({ ...updatedBooking, mailResult });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// POST /api/bookings/:id/notify - Manually resend notification email to customer
router.post('/:id/notify', async (req, res) => {
  try {
    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const targetStatus = req.body.status || booking.status || 'confirmed';
    const mailResult = await sendBookingStatusNotification(booking, targetStatus);
    res.json({ success: mailResult.success, mailResult, booking });
  } catch (error) {
    console.error('Error enviando notificación manual:', error);
    res.status(500).json({ error: error.message || 'Error al enviar notificación' });
  }
});

router.patch('/:id/payment', async (req, res) => {
  try {
    const { payment_status } = req.body;
    const oldBooking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!oldBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    await prepare('UPDATE bookings SET payment_status = ?, status = ? WHERE id = ?').run(payment_status, 'confirmed', req.params.id);
    
    const updatedBooking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);

    // Notify customer when marked confirmed via payment update
    if (oldBooking.status !== 'confirmed') {
      sendBookingStatusNotification(updatedBooking, 'confirmed').catch((mailErr) => {
        console.error('Error enviando notificación de confirmación al cliente:', mailErr);
      });
    }

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking payment:', error);
    res.status(500).json({ error: 'Failed to update booking payment' });
  }
});

// PATCH /api/bookings/:id/boarding - Update passenger boarding status
router.patch('/:id/boarding', async (req, res) => {
  try {
    const { boarding_status } = req.body;
    if (!['pending', 'boarded', 'no_show'].includes(boarding_status)) {
      return res.status(400).json({ error: 'Estado de abordaje inválido' });
    }

    const booking = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await prepare('UPDATE bookings SET boarding_status = ? WHERE id = ?').run(boarding_status, req.params.id);

    const updated = await prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error updating boarding status:', error);
    res.status(500).json({ error: 'Error al actualizar estado de abordaje' });
  }
});

export default router;
