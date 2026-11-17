const petModel = require('../models/petModel');
const serviceBookingModel = require('../models/serviceBookingModel');

function listBookings(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;

  petModel.getPetsByOwner(userId, (petErr, pets) => {
    if (petErr) {
      console.error('Error loading pets:', petErr);
      return res.status(500).send('Unable to load pets.');
    }

    serviceBookingModel.getBookingsByOwner(userId, (bookingErr, bookings) => {
      if (bookingErr) {
        console.error('Error loading booking history:', bookingErr);
        return res.status(500).send('Unable to load booking history.');
      }

      const selectedPetId = req.query.petId || '';
      const filteredBookings = selectedPetId
        ? bookings.filter(booking => String(booking.pet_id || booking.petId) === String(selectedPetId))
        : bookings;

      return res.render('bookings', {
        bookings: filteredBookings,
        pets,
        selectedPetId,
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
}

function viewBooking(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;
  const bookingId = req.params.id;

  serviceBookingModel.getBookingById(bookingId, (err, rows) => {
    if (err) {
      console.error('Error loading booking details:', err);
      return res.status(500).send('Unable to load booking details.');
    }

    const booking = rows && rows.length > 0 ? rows[0] : null;
    if (!booking) {
      return res.status(404).send('Booking not found.');
    }

    if (Number(booking.owner_id) !== Number(userId)) {
      return res.status(403).send('You do not have access to this booking.');
    }

    return res.render('booking-detail', {
      booking,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = {
  listBookings,
  viewBooking
};
