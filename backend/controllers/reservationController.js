const Reservation = require('../models/Reservation');
const Accommodation = require('../models/Accommodation');

const createReservation = async (req, res) => {
  try {
    const { accommodation, checkIn, checkOut, guests } = req.body;

    const listing = await Accommodation.findById(accommodation);
    if (!listing) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    if (guests > listing.guests) {
      return res.status(400).json({ message: `Maximum ${listing.guests} guests allowed` });
    }

    // Prevent double booking - check for overlapping confirmed reservations
    const overlapping = await Reservation.find({
      accommodation,
      status: { $ne: 'cancelled' },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
      ],
    });

    if (overlapping.length > 0) {
      return res.status(409).json({ message: 'This property is already booked for the selected dates' });
    }

    let totalPrice = listing.price * totalNights;

    if (listing.weeklyDiscount > 0 && totalNights >= 7) {
      totalPrice -= totalPrice * (listing.weeklyDiscount / 100);
    }

    totalPrice += listing.cleaningFee + listing.serviceFee + listing.occupancyTaxes;

    const reservation = await Reservation.create({
      accommodation,
      user: req.user._id,
      host: listing.host_id,
      checkIn,
      checkOut,
      guests,
      totalNights,
      totalPrice,
    });

    const populated = await Reservation.findById(reservation._id)
      .populate('accommodation')
      .populate('user', 'username email');

    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('createReservation error:', error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
};

const getReservationsByHost = async (req, res) => {
  try {
    const reservations = await Reservation.find({ host: req.user._id })
      .populate('accommodation')
      .populate('user', 'username email')
      .sort('-createdAt');
    res.json(reservations);
  } catch (error) {
    console.error('getReservationsByHost error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getReservationsByUser = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('accommodation')
      .sort('-createdAt');
    res.json(reservations);
  } catch (error) {
    console.error('getReservationsByUser error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled' });
  } catch (error) {
    console.error('deleteReservation error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
