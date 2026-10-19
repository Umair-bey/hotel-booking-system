const express = require('express');
const router = express.Router();
const db = require('../models/database');

// GET all rooms
router.get('/', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms').all();
  res.json(rooms);
});

// POST a new room
router.post('/', (req, res) => {
  const { room_no, type, price } = req.body;

  if (!room_no || !type || price == null) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const info = db.prepare(
      'INSERT INTO rooms (room_no, type, price) VALUES (?, ?, ?)'
    ).run(room_no, type, price);
    res.status(201).json({ id: info.lastInsertRowid, room_no, type, price });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET available rooms by type + date range
router.get('/available', (req, res) => {
  const { type, check_in, check_out } = req.query;

  if (!check_in || !check_out) {
    return res.status(400).json({ error: 'check_in and check_out are required' });
  }

  // Find rooms of the type that have NO overlapping confirmed bookings
  const rooms = db.prepare(`
    SELECT * FROM rooms
    WHERE (? IS NULL OR type = ?)
      AND id NOT IN (
        SELECT room_id FROM bookings
        WHERE status = 'confirmed'
          AND check_in < ?
          AND check_out > ?
      )
  `).all(type || null, type || null, check_out, check_in);

  res.json(rooms);
});

module.exports = router;