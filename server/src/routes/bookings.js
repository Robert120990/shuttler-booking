import express from 'express';
import { prepare } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendBookingNotification } from '../utils/mailer.js';

const router = express.Router();

router.get('/', (req, res) => {
  const bookings = prepare(`
    SELECT b.*, s.name as shuttle_name, u.name as user_name, u.email as user_email
    FROM bookings b
    LEFT JOIN shuttles s ON b.shuttle_id = s.id
    LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bookings);
});

router.get('/:id', (req, res) => {
  const booking = prepare(`
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
});

router.post('/', (req, res) => {
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

    prepare(`
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
      pickup_person_name || passenger_name || null
    );

    const booking = prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    const shuttle = prepare('SELECT * FROM shuttles WHERE id = ?').get(shuttle_id);

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

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  
  prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  
  const booking = prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  res.json(booking);
});

router.patch('/:id/payment', (req, res) => {
  const { payment_status } = req.body;
  
  prepare('UPDATE bookings SET payment_status = ?, status = ? WHERE id = ?').run(payment_status, 'confirmed', req.params.id);
  
  const booking = prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  res.json(booking);
});

export default router;
