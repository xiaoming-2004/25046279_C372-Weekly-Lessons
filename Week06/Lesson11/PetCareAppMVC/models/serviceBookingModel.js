const db = require('../config/db');

function rollbackAndRelease(connection, callback) {
  connection.rollback(() => {
    connection.release();
    callback();
  });
}

function createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      return callback(connectionErr);
    }

    connection.beginTransaction((beginErr) => {
      if (beginErr) {
        connection.release();
        return callback(beginErr);
      }

      const petSql = 'SELECT id FROM pets WHERE id = ? AND owner_id = ?';
      connection.query(petSql, [petId, ownerId], (petErr, petRows) => {
        if (petErr) {
          return rollbackAndRelease(connection, () => callback(petErr));
        }

        if (!petRows || petRows.length === 0) {
          return rollbackAndRelease(connection, () => callback(null, null));
        }

        const serviceSql = 'SELECT id, price FROM services WHERE id = ? AND is_active = 1';
        connection.query(serviceSql, [serviceId], (serviceErr, serviceRows) => {
          if (serviceErr) {
            return rollbackAndRelease(connection, () => callback(serviceErr));
          }

          if (!serviceRows || serviceRows.length === 0) {
            return rollbackAndRelease(connection, () => callback(null, null));
          }

          const service = serviceRows[0];
          const bookingSql = 'INSERT INTO service_bookings (pet_id, service_id, booking_status, booked_price, booking_date) VALUES (?, ?, ?, ?, ?)';

          connection.query(
            bookingSql,
            [petId, serviceId, 'pending', service.price, bookingDate],
            (bookingErr, bookingResult) => {
              if (bookingErr) {
                return rollbackAndRelease(connection, () => callback(bookingErr));
              }

              const bookingId = bookingResult.insertId;
              const paymentSql = 'INSERT INTO payments (booking_id, amount, payment_status, payment_reference) VALUES (?, ?, ?, NULL)';

              connection.query(
                paymentSql,
                [bookingId, service.price, 'pending'],
                (paymentErr, paymentResult) => {
                  if (paymentErr) {
                    return rollbackAndRelease(connection, () => callback(paymentErr));
                  }

                  connection.commit((commitErr) => {
                    if (commitErr) {
                      return rollbackAndRelease(connection, () => callback(commitErr));
                    }

                    connection.release();
                    return callback(null, {
                      bookingId,
                      paymentId: paymentResult.insertId
                    });
                  });
                }
              );
            }
          );
        });
      });
    });
  });
}

function getBookingsByOwner(ownerId, callback) {
  const sql = `
    SELECT
      sb.id AS booking_id,
      DATE_FORMAT(sb.booking_date, '%Y-%m-%d') AS booking_date,
      p.name AS pet_name,
      s.name AS service_name,
      sb.booked_price,
      sb.booking_status,
      py.payment_status
    FROM service_bookings AS sb
    INNER JOIN pets AS p ON p.id = sb.pet_id
    INNER JOIN services AS s ON s.id = sb.service_id
    LEFT JOIN payments AS py ON py.booking_id = sb.id
    WHERE p.owner_id = ?
    ORDER BY sb.created_at DESC, sb.id DESC
  `;

  db.query(sql, [ownerId], callback);
}

module.exports = {
  createPendingBooking,
  getBookingsByOwner
};
