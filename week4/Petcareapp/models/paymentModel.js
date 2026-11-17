const connection = require('../config/db');

function createPaymentForBooking(bookingId, amount, paymentReference, callback) {
  const sql = `
    INSERT INTO payments (booking_id, amount, payment_status, payment_reference)
    VALUES (?, ?, 'pending', ?)
  `;
  connection.query(sql, [bookingId, amount, paymentReference], callback);
}

function getPaymentsForBooking(bookingId, callback) {
  const sql = `
    SELECT * FROM payments
    WHERE booking_id = ?
    ORDER BY created_at DESC
  `;
  connection.query(sql, [bookingId], callback);
}

module.exports = {
  createPaymentForBooking,
  getPaymentsForBooking
};
