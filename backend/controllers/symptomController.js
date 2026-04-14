const db = require("../config/db");

// GET /api/symptoms
// Fetch all symptoms for the user's active pregnancy
exports.getSymptoms = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT sl.*, pp.pregnancy_id 
    FROM symptom_log sl
    JOIN pregnancy_profile pp ON sl.pregnancy_id = pp.pregnancy_id
    WHERE pp.user_id = ? AND pp.pregnancy_status = 'active'
    ORDER BY sl.logged_at DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
};

// POST /api/symptoms
// Body: { pregnancy_id, symptom_name, severity, notes, logged_at (optional) }
exports.logSymptom = (req, res) => {
  const { pregnancy_id, symptom_name, severity, notes, logged_at } = req.body;

  if (!pregnancy_id || !symptom_name || !severity) {
    return res.status(400).json({ message: "pregnancy_id, symptom_name, and severity are required" });
  }

  const sql = `
    INSERT INTO symptom_log (pregnancy_id, symptom_name, severity, notes, logged_at) 
    VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `;
  const params = [pregnancy_id, symptom_name, severity, notes || null, logged_at || null];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Symptom logged successfully", id: result.insertId });
  });
};
