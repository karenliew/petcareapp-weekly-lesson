const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

router.get('/bookings', isLoggedIn, bookingController.listBookings);
router.get('/bookings/:id', isLoggedIn, bookingController.viewBooking);

module.exports = router;
