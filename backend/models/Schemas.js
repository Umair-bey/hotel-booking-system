const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_no: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  price: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
  room_id: { type: String, required: true },
  guest_name: { type: String, required: true },
  check_in: { type: String, required: true },
  check_out: { type: String, required: true },
  status: { type: String, default: 'confirmed' }
});

module.exports = {
  Room: mongoose.model('Room', roomSchema),
  Booking: mongoose.model('Booking', bookingSchema)
};