const connection = require('../config/db');

function getActiveServices(callback) {
  const sql = 'SELECT id, name, price, is_active FROM services WHERE is_active = 1 ORDER BY name';
  connection.query(sql, callback);
}

function getServiceById(serviceId, callback) {
  const sql = 'SELECT id, name, price, is_active FROM services WHERE id = ?';
  connection.query(sql, [serviceId], callback);
}

function createBooking(petId, serviceId, bookingDate, bookedPrice, callback) {
  const sql = `
    INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
    VALUES (?, ?, 'pending', ?, ?)
  `;
  connection.query(sql, [petId, serviceId, bookedPrice, bookingDate], callback);
}

function getBookingsByOwner(userId, callback) {
  const sql = `
    SELECT sb.*, s.name AS service_name, p.name AS pet_name, p.species, p.breed
    FROM service_bookings sb
    JOIN pets p ON p.id = sb.pet_id
    JOIN services s ON s.id = sb.service_id
    WHERE p.owner_id = ?
    ORDER BY sb.booking_date DESC, sb.id DESC
  `;
  connection.query(sql, [userId], callback);
}

function getBookingsByPet(petId, callback) {
  const sql = `
    SELECT sb.*, s.name AS service_name, p.name AS pet_name
    FROM service_bookings sb
    JOIN pets p ON p.id = sb.pet_id
    JOIN services s ON s.id = sb.service_id
    WHERE sb.pet_id = ?
    ORDER BY sb.booking_date DESC, sb.id DESC
  `;
  connection.query(sql, [petId], callback);
}

function getBookingById(bookingId, callback) {
  const sql = `
    SELECT sb.*, s.name AS service_name, p.name AS pet_name, p.owner_id
    FROM service_bookings sb
    JOIN pets p ON p.id = sb.pet_id
    JOIN services s ON s.id = sb.service_id
    WHERE sb.id = ?
  `;
  connection.query(sql, [bookingId], callback);
}

module.exports = {
  getActiveServices,
  getServiceById,
  createBooking,
  getBookingsByOwner,
  getBookingsByPet,
  getBookingById
};
