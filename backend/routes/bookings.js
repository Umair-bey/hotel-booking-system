const express = require('express');
const router = express.Router();
const { Booking } = require('../models/Schemas');

// POST: Book a room
router.post('/', async (req, res) => {
  const { room_id, guest_name, check_in, check_out } = req.body;

  try {
    const overlap = await Booking.findOne({
      room_id: room_id, 
      status: 'confirmed',
      check_in: { $lt: check_out },
      check_out: { $gt: check_in }
    });

    if (overlap) {
      return res.status(409).json({ error: 'Room is already booked for these dates' });
    }

    const newBooking = await Booking.create({ room_id, guest_name, check_in, check_out });
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (cancel) a booking
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;