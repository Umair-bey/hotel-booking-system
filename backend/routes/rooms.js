const express = require('express');
const router = express.Router();
const { Room, Booking } = require('../models/Schemas');

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new room
router.post('/', async (req, res) => {
  try {
    const newRoom = await Room.create(req.body);
    res.status(201).json(newRoom);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Room number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET available rooms
router.get('/available', async (req, res) => {
  const { type, check_in, check_out } = req.query;
  if (!check_in || !check_out) return res.status(400).json({ error: 'Dates required' });

  try {
    const overlapping = await Booking.find({
      status: 'confirmed',
      check_in: { $lt: check_out },
      check_out: { $gt: check_in }
    });

    const bookedIds = overlapping.map(b => b.room_id);
    const query = { _id: { $nin: bookedIds } };
    if (type) query.type = type;

    const available = await Room.find(query);
    res.json(available);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;