const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
} = require('../controllers/reservationController');

const router = express.Router();

router.route('/')
  .post(protect, createReservation);

router.get('/host', protect, getReservationsByHost);
router.get('/user', protect, getReservationsByUser);
router.delete('/:id', protect, deleteReservation);

module.exports = router;
