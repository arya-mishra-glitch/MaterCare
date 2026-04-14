const db = require("../config/db");

// GET /api/reminders
// Filters: ?filter=today or ?filter=past
exports.getReminders = (req, res) => {
  const userId = req.user.user_id;
  const filter = req.query.filter;

  let sql = `SELECT * FROM reminder WHERE user_id = ?`;
  const params = [userId];

  if (filter === "today") {
    sql += ` AND status = 'pending' AND reminder_date <= CURDATE()`;
  } else if (filter === "past") {
    sql += ` AND status != 'pending'`;
  } else if (filter === "upcoming") {
    sql += ` AND status = 'pending'`;
  }

  sql += ` ORDER BY reminder_date ASC, reminder_time ASC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", error: err });
    res.json({ success: true, data: results });
  });
};

// POST /api/reminders
exports.createReminder = (req, res) => {
  const userId = req.user.user_id;
  const { title, type, reminder_date, reminder_time } = req.body;

  if (!title || !reminder_date || !reminder_time) {
    return res.status(400).json({ message: "title, reminder_date, and reminder_time are required" });
  }

  const sql = `
    INSERT INTO reminder (user_id, title, type, reminder_date, reminder_time) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [userId, title, type || "general", reminder_date, reminder_time];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Reminder created", id: result.insertId });
  });
};

// PUT /api/reminders/:id/done
exports.markDone = (req, res) => {
  const userId = req.user.user_id;
  const reminderId = req.params.id;

  const sql = `UPDATE reminder SET status = 'done' WHERE reminder_id = ? AND user_id = ?`;
  db.query(sql, [reminderId, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Reminder not found or unauthorized." });
    }
    res.json({ success: true, message: "Reminder marked as done." });
  });
};

// PUT /api/reminders/:id
exports.updateReminder = (req, res) => {
  const userId = req.user.user_id;
  const reminderId = req.params.id;
  const { title, type, reminder_date, reminder_time } = req.body;

  const sql = `UPDATE reminder SET title = ?, type = ?, reminder_date = ?, reminder_time = ? WHERE reminder_id = ? AND user_id = ?`;
  const params = [title, type || "general", reminder_date, reminder_time, reminderId, userId];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reminder not found." });
    res.json({ success: true, message: "Reminder updated." });
  });
};

// DELETE /api/reminders/:id
exports.deleteReminder = (req, res) => {
  const userId = req.user.user_id;
  const reminderId = req.params.id;

  const sql = `DELETE FROM reminder WHERE reminder_id = ? AND user_id = ?`;
  db.query(sql, [reminderId, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Reminder not found." });
    res.json({ success: true, message: "Reminder deleted." });
  });
};
