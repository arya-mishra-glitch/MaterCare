const db = require("../config/db");

/**
 * GET /api/vaccinations
 * Returns vaccination records for all babies belonging to the logged-in user.
 * Response: { upcoming: [...], completed: [...] }
 */
exports.getVaccinations = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      vr.vacc_record_id,
      vr.vaccination_date,
      vr.status,
      v.vaccine_name,
      v.recommended_age,
      b.name  AS baby_name,
      b.baby_id
    FROM vaccination_record vr
    JOIN vaccination v ON vr.vaccine_id = v.vaccine_id
    JOIN baby        b ON vr.baby_id    = b.baby_id
    WHERE b.user_id = ?
    ORDER BY vr.vaccination_date ASC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });

    const upcoming = results.filter(r => r.status === "scheduled");
    const completed = results.filter(r => r.status !== "scheduled");
    res.json({ upcoming, completed });
  });
};

/**
 * GET /api/vaccinations/catalogue
 * Returns all available vaccines from the vaccination table.
 */
exports.getVaccineCatalogue = (req, res) => {
  db.query(
    `SELECT vaccine_id, vaccine_name, recommended_age FROM vaccination ORDER BY vaccine_name`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.json(results);
    }
  );
};

/**
 * POST /api/vaccinations
 * Adds a new vaccination record for a baby.
 * Body: { baby_id, vaccine_id, vaccination_date?, status }
 */
exports.addVaccination = (req, res) => {
  const user_id = req.user.user_id;
  const { baby_id, vaccine_id, vaccination_date, status } = req.body;

  if (!baby_id || !vaccine_id) {
    return res.status(400).json({ message: "baby_id and vaccine_id are required." });
  }

  // Security: verify the baby belongs to the logged-in user
  db.query(
    `SELECT baby_id FROM baby WHERE baby_id = ? AND user_id = ? LIMIT 1`,
    [baby_id, user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      if (rows.length === 0)
        return res.status(403).json({ message: "Invalid baby — not found or not yours." });

      db.query(
        `INSERT INTO vaccination_record (baby_id, vaccine_id, vaccination_date, status)
         VALUES (?, ?, ?, ?)`,
        [baby_id, vaccine_id, vaccination_date || null, status || "scheduled"],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "Database error.", error: err2 });
          res.status(201).json({ message: "Vaccination record added.", vacc_record_id: result.insertId });
        }
      );
    }
  );
};

/**
 * GET /api/babies
 * Returns all babies belonging to the logged-in user.
 */
exports.getBabies = (req, res) => {
  const user_id = req.user.user_id;
  db.query(
    `SELECT baby_id, pregnancy_id, name, date_of_birth, gender, birth_weight, current_weight, blood_group, health_status, delivery_type
     FROM baby WHERE user_id = ? ORDER BY baby_id ASC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.json(results);
    }
  );
};

/**
 * POST /api/babies
 * Adds a new baby record for the logged-in user.
 * Body: { name, date_of_birth?, gender?, birth_weight?, current_weight?, blood_group?, health_status?, delivery_type?, pregnancy_id? }
 */
exports.addBaby = (req, res) => {
  const user_id = req.user.user_id;
  const {
    name,
    date_of_birth,
    gender,
    birth_weight,
    current_weight,
    blood_group,
    health_status,
    delivery_type,
    pregnancy_id,
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Baby name is required." });
  }

  const parsedBirthWeight = birth_weight !== undefined && birth_weight !== null && String(birth_weight).trim() !== "" ? Number(birth_weight) : null;
  const parsedCurrentWeight = current_weight !== undefined && current_weight !== null && String(current_weight).trim() !== "" ? Number(current_weight) : null;

  if (parsedBirthWeight !== null && Number.isNaN(parsedBirthWeight)) {
    return res.status(400).json({ message: "Birth weight must be a valid number." });
  }
  if (parsedCurrentWeight !== null && Number.isNaN(parsedCurrentWeight)) {
    return res.status(400).json({ message: "Current weight must be a valid number." });
  }

  const babyPregnancyId = pregnancy_id ? Number(pregnancy_id) : null;

  const insertBaby = (resolvedPregnancyId) => {
    db.query(
      `INSERT INTO baby (user_id, pregnancy_id, name, date_of_birth, gender, birth_weight, current_weight, blood_group, health_status, delivery_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        resolvedPregnancyId,
        name.trim(),
        date_of_birth || null,
        gender || null,
        parsedBirthWeight,
        parsedCurrentWeight,
        blood_group || null,
        health_status || "Healthy",
        delivery_type || null,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error.", error: err });

        if (!resolvedPregnancyId) {
          return res.status(201).json({
            message: "Baby record added successfully.",
            baby_id: result.insertId,
          });
        }

        db.query(
          `UPDATE pregnancy_profile SET pregnancy_status = 'completed' WHERE pregnancy_id = ? AND user_id = ?`,
          [resolvedPregnancyId, user_id],
          (err2) => {
            if (err2) console.error("Failed to complete pregnancy:", err2);
            res.status(201).json({
              message: "Baby record added and pregnancy marked as completed.",
              baby_id: result.insertId,
            });
          }
        );
      }
    );
  };

  if (babyPregnancyId) {
    db.query(
      `SELECT pregnancy_id FROM pregnancy_profile WHERE pregnancy_id = ? AND user_id = ? LIMIT 1`,
      [babyPregnancyId, user_id],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error.", error: err });
        if (!rows.length) {
          return res.status(400).json({ message: "Invalid pregnancy_id." });
        }
        insertBaby(babyPregnancyId);
      }
    );
  } else {
    db.query(
      `SELECT pregnancy_id FROM pregnancy_profile WHERE user_id = ? AND pregnancy_status = 'active' ORDER BY created_at DESC LIMIT 1`,
      [user_id],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error.", error: err });
        insertBaby(rows.length ? rows[0].pregnancy_id : null);
      }
    );
  }
};

/**
 * PUT /api/vaccinations/:id
 * Updates a vaccination record status.
 * Body: { status }
 */
exports.updateVaccination = (req, res) => {
  const user_id = req.user.user_id;
  const vacc_record_id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  // Verify ownership via baby
  const sql = `
    SELECT vr.vacc_record_id
    FROM vaccination_record vr
    JOIN baby b ON vr.baby_id = b.baby_id
    WHERE vr.vacc_record_id = ? AND b.user_id = ?
    LIMIT 1
  `;

  db.query(sql, [vacc_record_id, user_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    if (rows.length === 0) {
      return res.status(404).json({ message: "Vaccination record not found." });
    }

    db.query(
      `UPDATE vaccination_record SET status = ? WHERE vacc_record_id = ?`,
      [status, vacc_record_id],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Database error.", error: err2 });
        res.json({ message: "Vaccination updated successfully." });
      }
    );
  });
};