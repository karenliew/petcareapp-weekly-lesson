const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidBookingDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsed >= today;
}

function listServices(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;

  petModel.getPetsByOwner(userId, (petErr, pets) => {
    if (petErr) {
      console.error('Error loading pets:', petErr);
      return res.status(500).send('Unable to load pets.');
    }

    serviceModel.getActiveServices((serviceErr, services) => {
      if (serviceErr) {
        console.error('Error loading services:', serviceErr);
        return res.status(500).send('Unable to load services.');
      }

      const rawPetId = req.query.petId;
      const selectedPetId = isPositiveInteger(rawPetId) && pets.some(pet => Number(pet.id) === Number(rawPetId))
        ? String(rawPetId)
        : '';

      return res.render('services', {
        pets,
        services,
        selectedPetId,
        today: getTodayString(),
        messages: req.flash('success'),
        errors: req.flash('error'),
        session: req.session
      });
    });
  });
}

function createBooking(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const userId = req.session.user.id;
  const petId = req.body.petId ?? req.body.pet_id;
  const serviceId = req.body.serviceId ?? req.body.service_id;
  const bookingDate = req.body.bookingDate ?? req.body.booking_date;

  if (!isPositiveInteger(petId) || !isPositiveInteger(serviceId) || !isValidBookingDate(bookingDate)) {
    req.flash('error', 'Choose a pet, service, and valid booking date.');
    return res.redirect('/services');
  }

  serviceBookingModel.createPendingBooking(userId, Number(petId), Number(serviceId), bookingDate, (err, result) => {
    if (err) {
      console.error('Error creating booking:', err);
      req.flash('error', 'Unable to create the booking. Please try again.');
      return res.redirect('/services');
    }

    if (!result) {
      req.flash('error', 'That pet or service is unavailable for booking.');
      return res.redirect('/services');
    }

    req.flash('success', 'Booking created. Payment is pending; no payment has been processed.');
    return res.redirect('/bookings');
  });
}

module.exports = {
  listServices,
  createBooking
};
