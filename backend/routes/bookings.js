const express = require('express');
const router = express.Router();
const db = require('../models/database');

// POST: Book a room
router.post('/', (req, res) => {
  const { room_id, guest_name, check_in, check_out } = req.body;

  // 1. Required fields
  if (!room_id || !guest_name || !check_in || !check_out) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // 2. Date order check
  if (new Date(check_in) >= new Date(check_out)) {
    return res.status(400).json({ error: 'Check-out must be after check-in' });
  }

  // 3. Room must exist
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  // 4. OVERLAP CHECK — the core logic
  const overlap = db.prepare(`
    SELECT * FROM bookings
    WHERE room_id = ?
      AND status = 'confirmed'
      AND check_in < ?
      AND check_out > ?
  `).get(room_id, check_out, check_in);

  if (overlap) {
    return res.status(409).json({ error: 'Room is already booked for these dates' });
  }

  // 5. Insert
  const info = db.prepare(
    'INSERT INTO bookings (room_id, guest_name, check_in, check_out) VALUES (?, ?, ?, ?)'
  ).run(room_id, guest_name, check_in, check_out);

  res.status(201).json({ id: info.lastInsertRowid, message: 'Booking successful' });
});

// GET all bookings
router.get('/', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, r.room_no, r.type, r.price
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.status = 'confirmed'
  `).all();
  res.json(bookings);
});

// DELETE (cancel) a booking
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', id);
  res.json({ message: 'Booking cancelled' });
});

module.exports = router;