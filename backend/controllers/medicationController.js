const db = require("../config/db");

/**
 * GET /api/medications
 * Returns all medication records for the logged-in user across all pregnancies.
 * Adds a computed `status` field: 'active' if ongoing, 'completed' if end_date passed.
 */
exports.getMedications = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      mr.med_record_id,
      mr.dosage,
      mr.start_date,
      mr.end_date,
      m.medication_name,
      m.description,
      pp.pregnancy_id,
      CASE
        WHEN mr.end_date IS NULL OR mr.end_date >= CURDATE() THEN 'active'
        ELSE 'completed'
      END AS status
    FROM medication_record mr
    JOIN medication        m  ON mr.medication_id = m.medication_id
    JOIN pregnancy_profile pp ON mr.pregnancy_id  = pp.pregnancy_id
    WHERE pp.user_id = ?
    ORDER BY mr.start_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

/**
 * GET /api/medications/catalogue
 * Returns all available medications from the medication table.
 */
exports.getMedicationCatalogue = (req, res) => {
  db.query(
    `SELECT medication_id, medication_name, description FROM medication ORDER BY medication_name`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.json(results);
    }
  );
};

/**
 * POST /api/medications
 * Adds a new medication record linked to the user's pregnancy.
 * Body: { pregnancy_id, medication_id, dosage?, start_date?, end_date? }
 */
exports.addMedication = (req, res) => {
  const user_id = req.user.user_id;
  const { pregnancy_id, medication_id, dosage, start_date, end_date } = req.body;

  if (!pregnancy_id || !medication_id) {
    return res.status(400).json({ message: "pregnancy_id and medication_id are required." });
  }

  // Security: verify the pregnancy belongs to the logged-in user
  db.query(
    `SELECT pregnancy_id FROM pregnancy_profile WHERE pregnancy_id = ? AND user_id = ? LIMIT 1`,
    [pregnancy_id, user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      if (rows.length === 0)
        return res.status(403).json({ message: "Invalid pregnancy — not found or not yours." });

      db.query(
        `INSERT INTO medication_record (pregnancy_id, medication_id, dosage, start_date, end_date)
         VALUES (?, ?, ?, ?, ?)`,
        [pregnancy_id, medication_id, dosage || null, start_date || null, end_date || null],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "Database error.", error: err2 });
          res.status(201).json({ message: "Medication record added.", med_record_id: result.insertId });
        }
      );
    }
  );
};
