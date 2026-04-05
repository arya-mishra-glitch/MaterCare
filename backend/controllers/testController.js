const db = require("../config/db");

// ============================================================
// TESTS
// ============================================================

/**
 * GET /api/tests
 * Returns all test records for the logged-in user across all pregnancies.
 * Joins test_record → medical_test → pregnancy_profile.
 *
 * Example response:
 * [
 *   {
 *     "test_record_id": 1,
 *     "test_date": "2025-02-15",
 *     "result": "Normal — 95 mg/dL",
 *     "test_name": "Blood Sugar Test",
 *     "description": "Measures blood glucose levels during pregnancy",
 *     "pregnancy_id": 1
 *   }
 * ]
 */
exports.getTestRecords = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      tr.test_record_id,
      tr.test_date,
      tr.result,
      mt.test_name,
      mt.description,
      pp.pregnancy_id
    FROM test_record tr
    JOIN medical_test      mt ON tr.test_id      = mt.test_id
    JOIN pregnancy_profile pp ON tr.pregnancy_id = pp.pregnancy_id
    WHERE pp.user_id = ?
    ORDER BY tr.test_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

/**
 * GET /api/tests/catalogue
 * Returns all available medical test types from the medical_test table.
 *
 * Example response:
 * [
 *   { "test_id": 1, "test_name": "Blood Sugar Test", "description": "..." },
 *   { "test_id": 2, "test_name": "Anomaly Scan",     "description": "..." }
 * ]
 */
exports.getTestCatalogue = (req, res) => {
  db.query(
    `SELECT test_id, test_name, description FROM medical_test ORDER BY test_name`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.json(results);
    }
  );
};

/**
 * POST /api/tests
 * Adds a new test record linked to the user's pregnancy.
 *
 * Request body:
 * {
 *   "pregnancy_id": 1,      -- required
 *   "test_id":      2,      -- required
 *   "test_date":    "2025-05-10",  -- required (YYYY-MM-DD)
 *   "result":       "Normal"       -- optional
 * }
 *
 * Example response:
 * { "message": "Test record added.", "test_record_id": 5 }
 */
exports.addTestRecord = (req, res) => {
  const user_id = req.user.user_id;
  const { pregnancy_id, test_id, test_date, result } = req.body;

  if (!pregnancy_id || !test_id || !test_date) {
    return res.status(400).json({
      message: "pregnancy_id, test_id, and test_date are required.",
    });
  }

  // Security: verify the pregnancy_id belongs to the logged-in user
  db.query(
    `SELECT pregnancy_id FROM pregnancy_profile
     WHERE pregnancy_id = ? AND user_id = ? LIMIT 1`,
    [pregnancy_id, user_id],
    (err, ppRows) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      if (ppRows.length === 0)
        return res.status(403).json({ message: "Invalid pregnancy profile." });

      db.query(
        `INSERT INTO test_record (pregnancy_id, test_id, test_date, result)
         VALUES (?, ?, ?, ?)`,
        [pregnancy_id, test_id, test_date, result || null],
        (err2, result_) => {
          if (err2)
            return res.status(500).json({ message: "Database error.", error: err2 });
          res.status(201).json({
            message: "Test record added.",
            test_record_id: result_.insertId,
          });
        }
      );
    }
  );
};
