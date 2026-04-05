const db = require("../config/db");

// GET /api/pregnancy
// Returns the active pregnancy profile for the logged-in user
exports.getMyPregnancy = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT *
    FROM pregnancy_profile
    WHERE user_id = ? AND pregnancy_status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (results.length === 0) return res.status(404).json({ message: "No active pregnancy found." });
    res.json(results[0]);
  });
};

// POST /api/pregnancy
// Body: { start_date, due_date }
exports.createPregnancy = (req, res) => {
  const user_id = req.user.user_id;
  const { start_date, due_date } = req.body;

  if (!start_date) {
    return res.status(400).json({ message: "start_date is required." });
  }

  const sql = `
    INSERT INTO pregnancy_profile (user_id, start_date, due_date, pregnancy_status)
    VALUES (?, ?, ?, 'active')
  `;

  db.query(sql, [user_id, start_date, due_date || null], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.status(201).json({ message: "Pregnancy profile created.", pregnancy_id: result.insertId });
  });
};

// GET /api/pregnancy/week
// Calculates current gestational week from start_date
exports.getCurrentWeek = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT start_date, due_date, pregnancy_id
    FROM pregnancy_profile
    WHERE user_id = ? AND pregnancy_status = 'active'
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (results.length === 0) return res.status(404).json({ message: "No active pregnancy found." });

    const { start_date, due_date, pregnancy_id } = results[0];
    const start = new Date(start_date);
    const today = new Date();
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;

    res.json({ pregnancy_id, week, start_date, due_date });
  });
};
