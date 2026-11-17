const connection = require('../config/db');

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function isValidLocalDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT
      sb.id AS booking_id,
      sb.pet_id,
      sb.service_id,
      sb.booking_date,
      sb.booked_price,
      sb.booking_status,
      p.name AS pet_name,
      s.name AS service_name,
      pay.payment_status,
      pay.payment_reference
    FROM service_bookings sb
    JOIN pets p ON p.id = sb.pet_id
    JOIN services s ON s.id = sb.service_id
    LEFT JOIN payments pay ON pay.booking_id = sb.id
    WHERE p.owner_id = ?
    ORDER BY sb.created_at DESC, sb.id DESC
  `;

  connection.query(sql, [ownerId], callback);
}

function getBookingById(bookingId, callback) {
  const sql = `
    SELECT
      sb.id AS booking_id,
      sb.pet_id,
      sb.service_id,
      sb.booking_date,
      sb.booked_price,
      sb.booking_status,
      p.name AS pet_name,
      p.owner_id,
      s.name AS service_name,
      pay.payment_status,
      pay.payment_reference
    FROM service_bookings sb
    JOIN pets p ON p.id = sb.pet_id
    JOIN services s ON s.id = sb.service_id
    LEFT JOIN payments pay ON pay.booking_id = sb.id
    WHERE sb.id = ?
    LIMIT 1
  `;

  connection.query(sql, [bookingId], callback);
}

function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  if (!isPositiveInteger(ownerId) || !isPositiveInteger(petId) || !isPositiveInteger(serviceId)) {
    return callback(null, null);
  }

  if (!isValidLocalDateString(bookingDate)) {
    return callback(null, null);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = bookingDate.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);

  if (selectedDate < today) {
    return callback(null, null);
  }

  connection.getConnection((connErr, connectionHandle) => {
    if (connErr) {
      return callback(connErr);
    }

    connectionHandle.beginTransaction((txErr) => {
      if (txErr) {
        connectionHandle.release();
        return callback(txErr);
      }

      connectionHandle.query(
        'SELECT id FROM pets WHERE id = ? AND owner_id = ?',
        [petId, ownerId],
        (petErr, petRows) => {
          if (petErr) {
            return connectionHandle.rollback(() => {
              connectionHandle.release();
              callback(petErr);
            });
          }

          if (!petRows || petRows.length === 0) {
            return connectionHandle.rollback(() => {
              connectionHandle.release();
              callback(null, null);
            });
          }

          connectionHandle.query(
            'SELECT id, price, is_active FROM services WHERE id = ? AND is_active = 1',
            [serviceId],
            (serviceErr, serviceRows) => {
              if (serviceErr) {
                return connectionHandle.rollback(() => {
                  connectionHandle.release();
                  callback(serviceErr);
                });
              }

              if (!serviceRows || serviceRows.length === 0) {
                return connectionHandle.rollback(() => {
                  connectionHandle.release();
                  callback(null, null);
                });
              }

              const service = serviceRows[0];
              const bookedPrice = Number(service.price);

              connectionHandle.query(
                `INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date)
                 VALUES (?, ?, 'pending', ?, ?)`,
                [petId, serviceId, bookedPrice, bookingDate],
                (bookingErr, bookingResult) => {
                  if (bookingErr) {
                    return connectionHandle.rollback(() => {
                      connectionHandle.release();
                      callback(bookingErr);
                    });
                  }

                  const bookingId = bookingResult.insertId;

                  connectionHandle.query(
                    `INSERT INTO payments (booking_id, amount, payment_status, payment_reference)
                     VALUES (?, ?, 'pending', NULL)`,
                    [bookingId, bookedPrice],
                    (paymentErr, paymentResult) => {
                      if (paymentErr) {
                        return connectionHandle.rollback(() => {
                          connectionHandle.release();
                          callback(paymentErr);
                        });
                      }

                      connectionHandle.commit((commitErr) => {
                        if (commitErr) {
                          return connectionHandle.rollback(() => {
                            connectionHandle.release();
                            callback(commitErr);
                          });
                        }

                        connectionHandle.release();
                    callback(null, { bookingId, paymentId: paymentResult.insertId });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
}

module.exports = {
  getBookingsByOwner,
  getBookingById,
  createPendingBooking
};
