const express = require('express');
const router = express.Router();
// const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth')

// const Booking = require('../models/booking');
// const Car = require('../models/car');

const BookingController = require('../controllers/bookings')


router.get('/', checkAuth, BookingController.getAllBookings);

router.post('/', checkAuth, BookingController.bookingCar);

router.get('/:bookId', checkAuth, BookingController.getBookingById);

router.delete('/:bookId', checkAuth, BookingController.deleteBooking);




module.exports = router;