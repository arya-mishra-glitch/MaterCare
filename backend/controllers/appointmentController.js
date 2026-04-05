const db = require("../config/db");

// ─────────────────────────────────────────────────────────────
// GET /api/appointments
// Returns all appointments for the logged-in user (all pregnancies)
// ─────────────────────────────────────────────────────────────
exports.getAppointments = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      a.appointment_id,
      a.appointment_date,
      a.status,
      a.created_at,
      d.doctor_id,
      CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
      d.first_name  AS doctor_first_name,
      d.last_name   AS doctor_last_name,
      d.specialization,
      h.hospital_name,
      da.time_slot,
      pp.pregnancy_id
    FROM appointment a
    JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
    JOIN doctor            d  ON a.doctor_id    = d.doctor_id
    JOIN hospital          h  ON d.hospital_id  = h.hospital_id
    LEFT JOIN doctor_availability da ON a.availability_id = da.availability_id
    WHERE pp.user_id = ?
    ORDER BY a.appointment_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// ─────────────────────────────────────────────────────────────
// POST /api/appointments
// Body: { pregnancy_id, doctor_id, availability_id?, appointment_date }
// ─────────────────────────────────────────────────────────────
exports.createAppointment = (req, res) => {
  const user_id = req.user.user_id;
  const { pregnancy_id, doctor_id, availability_id, appointment_date } = req.body;

  if (!pregnancy_id || !doctor_id || !appointment_date) {
    return res.status(400).json({
      message: "pregnancy_id, doctor_id, and appointment_date are required.",
    });
  }

  // Security: verify the pregnancy_id belongs to this user
  db.query(
    `SELECT pregnancy_id FROM pregnancy_profile WHERE pregnancy_id = ? AND user_id = ? LIMIT 1`,
    [pregnancy_id, user_id],
    (err, ppRows) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      if (ppRows.length === 0)
        return res.status(403).json({ message: "Invalid pregnancy profile." });

      const insertSql = `
        INSERT INTO appointment (pregnancy_id, doctor_id, availability_id, appointment_date, status)
        VALUES (?, ?, ?, ?, 'scheduled')
      `;

      db.query(
        insertSql,
        [pregnancy_id, doctor_id, availability_id || null, appointment_date],
        (err2, result) => {
          if (err2)
            return res.status(500).json({ message: "Database error.", error: err2 });

          // Mark the chosen slot as booked
          if (availability_id) {
            db.query(
              `UPDATE doctor_availability SET status = 'booked' WHERE availability_id = ?`,
              [availability_id]
            );
          }

          res.status(201).json({
            message: "Appointment created.",
            appointment_id: result.insertId,
          });
        }
      );
    }
  );
};

// ─────────────────────────────────────────────────────────────
// PUT /api/appointments/:id
// Body: { doctor_id, availability_id?, appointment_date, status }
// ─────────────────────────────────────────────────────────────
exports.updateAppointment = (req, res) => {
  const user_id = req.user.user_id;
  const appointment_id = req.params.id;
  const { doctor_id, availability_id, appointment_date, status } = req.body;

  // Verify the appointment belongs to this user before updating
  const checkSql = `
    SELECT a.appointment_id, a.availability_id AS old_availability_id
    FROM appointment a
    JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
    WHERE a.appointment_id = ? AND pp.user_id = ?
    LIMIT 1
  `;

  db.query(checkSql, [appointment_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (rows.length === 0)
      return res.status(404).json({ message: "Appointment not found." });

    const oldAvailabilityId = rows[0].old_availability_id;

    const updateSql = `
      UPDATE appointment
      SET doctor_id        = ?,
          availability_id  = ?,
          appointment_date = ?,
          status           = ?
      WHERE appointment_id = ?
    `;

    db.query(
      updateSql,
      [
        doctor_id,
        availability_id || null,
        appointment_date,
        status || "scheduled",
        appointment_id,
      ],
      (err2, result) => {
        if (err2)
          return res.status(500).json({ message: "Database error.", error: err2 });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Appointment not found." });

        // Free old slot if slot changed
        if (oldAvailabilityId && oldAvailabilityId !== availability_id) {
          db.query(
            `UPDATE doctor_availability SET status = 'available' WHERE availability_id = ?`,
            [oldAvailabilityId]
          );
        }
        // Mark new slot as booked
        if (availability_id) {
          db.query(
            `UPDATE doctor_availability SET status = 'booked' WHERE availability_id = ?`,
            [availability_id]
          );
        }

        res.json({ message: "Appointment updated." });
      }
    );
  });
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id
// ─────────────────────────────────────────────────────────────
exports.deleteAppointment = (req, res) => {
  const user_id = req.user.user_id;
  const appointment_id = req.params.id;

  // Verify ownership and grab the slot id in one query
  const checkSql = `
    SELECT a.appointment_id, a.availability_id
    FROM appointment a
    JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
    WHERE a.appointment_id = ? AND pp.user_id = ?
    LIMIT 1
  `;

  db.query(checkSql, [appointment_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (rows.length === 0)
      return res.status(404).json({ message: "Appointment not found." });

    const avId = rows[0].availability_id;

    db.query(
      `DELETE FROM appointment WHERE appointment_id = ?`,
      [appointment_id],
      (err2, result) => {
        if (err2)
          return res.status(500).json({ message: "Database error.", error: err2 });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Appointment not found." });

        // Free the slot
        if (avId) {
          db.query(
            `UPDATE doctor_availability SET status = 'available' WHERE availability_id = ?`,
            [avId]
          );
        }

        res.json({ message: "Appointment deleted." });
      }
    );
  });
};