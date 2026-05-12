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

    // Safeguard: if insertId is 0 (misconfigured AUTO_INCREMENT), fetch the actual pregnancy_id
    let pregnancyId = result.insertId;
    if (!pregnancyId || pregnancyId === 0) {
      db.query(`SELECT pregnancy_id FROM pregnancy_profile WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`, [user_id], (err2, rows) => {
        if (err2 || rows.length === 0) {
          return res.status(500).json({ message: "Pregnancy created but failed to retrieve ID." });
        }
        return res.status(201).json({ message: "Pregnancy profile created.", pregnancy_id: rows[0].pregnancy_id });
      });
    } else {
      res.status(201).json({ message: "Pregnancy profile created.", pregnancy_id: pregnancyId });
    }
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

// POST /api/pregnancy/onboard
// Handles first-time setup: pregnancy details + basic user health details
exports.onboardPregnancy = async (req, res) => {
  const user_id = req.user.user_id;
  const { start_date, due_date, blood_group, emergency_contact } = req.body;

  if (!start_date) {
    return res.status(400).json({ success: false, message: "start_date is required." });
  }

  const pool = db.promise();

  try {
    // Check if user already has an active pregnancy
    const [activeRows] = await pool.query(
      `SELECT pregnancy_id FROM pregnancy_profile WHERE user_id = ? AND pregnancy_status = 'active'`,
      [user_id]
    );

    if (activeRows.length > 0) {
      return res.status(400).json({ success: false, message: "You already have an active pregnancy profile." });
    }

    // 1. Create pregnancy profile
    const [pregResult] = await pool.query(
      `INSERT INTO pregnancy_profile (user_id, start_date, due_date, pregnancy_status) VALUES (?, ?, ?, 'active')`,
      [user_id, start_date, due_date || null]
    );

    // Safeguard: if insertId is 0 (misconfigured AUTO_INCREMENT), fetch the actual pregnancy_id
    let pregnancyId = pregResult.insertId;
    if (!pregnancyId || pregnancyId === 0) {
      const [rows] = await pool.query(
        `SELECT pregnancy_id FROM pregnancy_profile WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [user_id]
      );
      pregnancyId = rows.length > 0 ? rows[0].pregnancy_id : null;
    }

    // 2. Update user blood group
    if (blood_group) {
        await pool.query(`UPDATE user SET blood_group = ? WHERE user_id = ?`, [blood_group, user_id]);
    }

    // 3. Add emergency contact
    if (emergency_contact && emergency_contact.name && emergency_contact.phone_number) {
        await pool.query(
            `INSERT INTO emergency_contact (user_id, name, phone_number, relation) VALUES (?, ?, ?, ?)`,
            [user_id, emergency_contact.name, emergency_contact.phone_number, emergency_contact.relation || null]
        );
    }

    res.status(201).json({ success: true, message: "Onboarding completed successfully.", pregnancy_id: pregnancyId });
  } catch (err) {
    console.error("Onboard error:", err);
    res.status(500).json({ success: false, message: "Server error during onboarding.", error: err.message });
  }
};

// POST /api/pregnancy/complete
// Marks the current active pregnancy as completed
exports.completePregnancy = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    UPDATE pregnancy_profile
    SET pregnancy_status = 'completed'
    WHERE user_id = ? AND pregnancy_status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: "No active pregnancy found to complete." });
    res.json({ message: "Pregnancy marked as completed." });
  });
};

// GET /api/pregnancy/status
// Determines the user's current stage (onboarding, pregnancy, postnatal, or completion_limbo)
exports.getPregnancyStatus = async (req, res) => {
  const user_id = req.user.user_id;
  const pool = db.promise();

  try {
    // 1. Get all pregnancy profiles to check history and current status
    const [pregnancyRows] = await pool.query(
      `SELECT pregnancy_id, pregnancy_status 
       FROM pregnancy_profile 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );

    // 2. Check for baby records
    const [babyRows] = await pool.query(
      `SELECT baby_id FROM baby WHERE user_id = ? LIMIT 1`,
      [user_id]
    );

    const hasPregnancy = pregnancyRows.length > 0;
    const hasActivePregnancy = pregnancyRows.some(p => p.pregnancy_status === 'active');
    const hasBaby = babyRows.length > 0;

    let phase = "onboarding"; // Default for new users

    if (hasActivePregnancy) {
      phase = "pregnancy";
    } else if (hasPregnancy) {
      // User has history but no active pregnancy
      if (hasBaby) {
        phase = "postnatal";
      } else {
        // This is the "limbo" state: pregnancy finished but no baby record yet
        phase = "completion_limbo";
      }
    }

    res.json({
      phase,
      hasPregnancy,
      hasActivePregnancy,
      hasBaby,
      latestPregnancy: pregnancyRows[0] || null
    });
  } catch (err) {
    console.error("❌ Status Error:", err);
    res.status(500).json({ message: "Server error.", error: err.message });
  }
};
