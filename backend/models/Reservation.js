const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  accommodation: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalNights: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['confirmed', 'cancelled', 'pending'], default: 'confirmed' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
