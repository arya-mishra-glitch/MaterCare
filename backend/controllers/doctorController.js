const db = require("../config/db");

/**
 * GET /api/doctors
 * Returns all doctors with their hospital info.
 * Supports optional ?specialization= query filter.
 */
exports.getDoctors = (req, res) => {
  const { specialization } = req.query;

  let sql = `
    SELECT
      d.doctor_id,
      d.first_name,
      d.last_name,
      CONCAT(d.first_name, ' ', d.last_name) AS full_name,
      d.specialization,
      d.contact_number,
      d.email,
      h.hospital_id,
      h.hospital_name,
      h.address AS hospital_address
    FROM doctor d
    JOIN hospital h ON d.hospital_id = h.hospital_id
  `;

  const params = [];

  if (specialization) {
    sql += ` WHERE d.specialization LIKE ?`;
    params.push(`%${specialization}%`);
  }

  sql += ` ORDER BY d.last_name, d.first_name`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

/**
 * GET /api/doctors/:id/availability
 * Returns available (unbooked) time slots for a specific doctor.
 * Supports optional ?date=YYYY-MM-DD to filter by a specific day.
 *
 * Returns ALL future available slots by default so the frontend
 * can show which dates have openings.
 */
exports.getDoctorAvailability = (req, res) => {
  const doctor_id = req.params.id;
  const { date } = req.query;

  // First verify the doctor exists
  db.query(
    `SELECT doctor_id, first_name, last_name, specialization
     FROM doctor WHERE doctor_id = ? LIMIT 1`,
    [doctor_id],
    (err, doctorRows) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      if (doctorRows.length === 0)
        return res.status(404).json({ message: "Doctor not found." });

      const doctor = doctorRows[0];

      let sql = `
        SELECT
          availability_id,
          available_date,
          time_slot,
          status
        FROM doctor_availability
        WHERE doctor_id = ?
          AND status = 'available'
          AND available_date >= CURDATE()
      `;

      const params = [doctor_id];

      if (date) {
        sql += ` AND available_date = ?`;
        params.push(date);
      }

      sql += ` ORDER BY available_date ASC, time_slot ASC`;

      db.query(sql, params, (err2, slots) => {
        if (err2)
          return res.status(500).json({ message: "Database error.", error: err2 });

        res.json({
          doctor: {
            doctor_id: doctor.doctor_id,
            name: `${doctor.first_name} ${doctor.last_name}`,
            specialization: doctor.specialization,
          },
          available_slots: slots,
          total: slots.length,
        });
      });
    }
  );
};