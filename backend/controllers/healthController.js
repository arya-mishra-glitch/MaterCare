const db = require("../config/db");

// ============================================================
// TESTS
// ============================================================

// GET /api/tests
exports.getTestRecords = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      tr.test_record_id,
      tr.test_date,
      tr.result,
      mt.test_name,
      mt.description
    FROM test_record tr
    JOIN medical_test mt       ON tr.test_id      = mt.test_id
    JOIN pregnancy_profile pp  ON tr.pregnancy_id = pp.pregnancy_id
    WHERE pp.user_id = ?
    ORDER BY tr.test_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// GET /api/tests/catalogue  — list of all available medical test types
exports.getTestCatalogue = (req, res) => {
  db.query(`SELECT * FROM medical_test ORDER BY test_name`, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// POST /api/tests
// Body: { pregnancy_id, test_id, test_date, result }
exports.addTestRecord = (req, res) => {
  const { pregnancy_id, test_id, test_date, result } = req.body;

  if (!pregnancy_id || !test_id || !test_date) {
    return res.status(400).json({ message: "pregnancy_id, test_id, and test_date are required." });
  }

  db.query(
    `INSERT INTO test_record (pregnancy_id, test_id, test_date, result) VALUES (?, ?, ?, ?)`,
    [pregnancy_id, test_id, test_date, result || null],
    (err, result_) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.status(201).json({ message: "Test record added.", test_record_id: result_.insertId });
    }
  );
};

// ============================================================
// MEDICATIONS
// ============================================================

// GET /api/medications
exports.getMedicationRecords = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      mr.med_record_id,
      mr.medication_id,
      mr.dosage,
      mr.start_date,
      mr.end_date,
      m.medication_name,
      m.description,
      CASE
        WHEN mr.end_date IS NULL OR mr.end_date >= CURDATE() THEN 'active'
        ELSE 'past'
      END AS status
    FROM medication_record mr
    JOIN medication        m   ON mr.medication_id = m.medication_id
    JOIN pregnancy_profile pp  ON mr.pregnancy_id  = pp.pregnancy_id
    WHERE pp.user_id = ?
    ORDER BY mr.start_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// GET /api/medications/catalogue
exports.getMedicationCatalogue = (req, res) => {
  db.query(`SELECT * FROM medication ORDER BY medication_name`, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// POST /api/medications
// Body: { pregnancy_id, medication_id, dosage, start_date, end_date }
exports.addMedicationRecord = (req, res) => {
  const { pregnancy_id, medication_id, dosage, start_date, end_date } = req.body;

  if (!pregnancy_id || !medication_id) {
    return res.status(400).json({ message: "pregnancy_id and medication_id are required." });
  }

  db.query(
    `INSERT INTO medication_record (pregnancy_id, medication_id, dosage, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
    [pregnancy_id, medication_id, dosage || null, start_date || null, end_date || null],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.status(201).json({ message: "Medication record added.", med_record_id: result.insertId });
    }
  );
};

// ============================================================
// VACCINATIONS
// ============================================================

// GET /api/vaccinations
// Returns all vaccination records for the logged-in user,
// grouped into "completed" (status = 'given') and "upcoming"
// (status = 'scheduled' or 'missed').
exports.getVaccinationRecords = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      vr.vacc_record_id,
      vr.vaccination_date,
      vr.status,
      v.vaccine_id,
      v.vaccine_name,
      v.recommended_age,
      b.baby_id,
      b.name AS baby_name
    FROM vaccination_record vr
    JOIN vaccination v  ON vr.vaccine_id = v.vaccine_id
    JOIN baby        b  ON vr.baby_id    = b.baby_id
    WHERE b.user_id = ?
    ORDER BY vr.vaccination_date DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });

    const completed = results.filter((r) => r.status === "given");
    const upcoming  = results.filter((r) => r.status !== "given");

    res.json({ completed, upcoming, all: results });
  });
};

// GET /api/vaccinations/catalogue
exports.getVaccineCatalogue = (req, res) => {
  db.query(`SELECT * FROM vaccination ORDER BY vaccine_name`, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });
    res.json(results);
  });
};

// POST /api/vaccinations
// Body: { baby_id, vaccine_id, vaccination_date (optional), status }
exports.addVaccinationRecord = (req, res) => {
  const { baby_id, vaccine_id, vaccination_date, status } = req.body;

  if (!baby_id || !vaccine_id) {
    return res.status(400).json({ message: "baby_id and vaccine_id are required." });
  }

  const date = vaccination_date || new Date().toISOString().split("T")[0];

  db.query(
    `INSERT INTO vaccination_record (baby_id, vaccine_id, vaccination_date, status) VALUES (?, ?, ?, ?)`,
    [baby_id, vaccine_id, date, status || "scheduled"],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.status(201).json({ message: "Vaccination record added.", vacc_record_id: result.insertId });
    }
  );
};

// ============================================================
// BABIES
// ============================================================

// GET /api/babies  — returns all babies belonging to the logged-in user
exports.getBabies = (req, res) => {
  const user_id = req.user.user_id;

  db.query(
    `SELECT baby_id, name, date_of_birth, gender FROM baby WHERE user_id = ? ORDER BY date_of_birth DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error.", error: err });
      res.json(results);
    }
  );
};
