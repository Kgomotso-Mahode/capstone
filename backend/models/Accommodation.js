const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true, enum: ['Entire apartment', 'Private room', 'Shared room', 'Entire house', 'Entire villa'] },
  bedrooms: { type: Number, required: true, min: 1 },
  bathrooms: { type: Number, required: true, min: 1 },
  guests: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  weeklyDiscount: { type: Number, default: 0, min: 0 },
  cleaningFee: { type: Number, default: 0, min: 0 },
  serviceFee: { type: Number, default: 0, min: 0 },
  occupancyTaxes: { type: Number, default: 0, min: 0 },
  amenities: [{ type: String }],
  images: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  host: { type: String },
  host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  enhancedCleaning: { type: Boolean, default: false },
  selfCheckIn: { type: Boolean, default: false },
  specificRatings: {
    cleanliness: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    checkIn: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);
