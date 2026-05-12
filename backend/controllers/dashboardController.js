const db = require("../config/db");

/**
 * GET /api/dashboard
 * Returns all data needed for the patient dashboard in a single request.
 * Requires: req.user.user_id (set by JWT auth middleware)
 */
exports.getDashboard = async (req, res) => {
  const user_id = req.user.user_id;
  const pool = db.promise();

  try {
    // ─────────────────────────────────────────────
    // 1. USER INFORMATION
    // ─────────────────────────────────────────────
    const [userRows] = await pool.query(
      `SELECT first_name, last_name, phone, email
       FROM user
       WHERE user_id = ?
       LIMIT 1`,
      [user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userRows[0];

    // ─────────────────────────────────────────────
    // 2. PREGNANCY INFORMATION
    // ─────────────────────────────────────────────
    const [pregnancyRows] = await pool.query(
      `SELECT pregnancy_id, start_date, due_date
       FROM pregnancy_profile
       WHERE user_id = ? AND pregnancy_status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [user_id]
    );

    let pregnancyData = null;
    let activePregnancyId = null;

    if (pregnancyRows.length > 0) {
      const { pregnancy_id, start_date, due_date } = pregnancyRows[0];
      activePregnancyId = pregnancy_id;

      const today = new Date();
      const start = new Date(start_date);
      const due = due_date ? new Date(due_date) : null;

      const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.max(1, Math.floor(diffDays / 7) + 1);
      const daysToDue = due
        ? Math.max(0, Math.ceil((due - today) / (1000 * 60 * 60 * 24)))
        : null;

      // Total pregnancies (all statuses) for this user
      const [[{ pregnancyCount }]] = await pool.query(
        `SELECT COUNT(*) AS pregnancyCount
         FROM pregnancy_profile
         WHERE user_id = ?`,
        [user_id]
      );

      pregnancyData = {
        pregnancy_id,
        week: currentWeek,
        daysToDue,
        start_date,
        due_date,
        pregnancyCount,
      };
    }

    // Latest pregnancy (active or completed)
    const [latestPregRows] = await pool.query(
      `SELECT pp.pregnancy_id, pp.start_date, pp.due_date, pp.pregnancy_status, b.baby_id
       FROM pregnancy_profile pp
       LEFT JOIN baby b ON pp.pregnancy_id = b.pregnancy_id
       WHERE pp.user_id = ?
       ORDER BY pp.created_at DESC
       LIMIT 1`,
      [user_id]
    );
    const latestPregnancy = latestPregRows[0] || null;

    // ─────────────────────────────────────────────
    // 2.5 BABY INFORMATION (if no active pregnancy or just to show baby details)
    // ─────────────────────────────────────────────
    const [babyRows] = await pool.query(
      `SELECT baby_id, name, date_of_birth, gender
       FROM baby
       WHERE user_id = ?
       ORDER BY date_of_birth DESC`,
      [user_id]
    );

    const hasBaby = babyRows.length > 0;
    let phase = "onboarding";

    if (latestPregnancy) {
      // PRIORITY 1: If the latest pregnancy already has a baby record, it's POSTNATAL
      if (latestPregnancy.baby_id) {
        phase = "postnatal";
      }
      // PRIORITY 2: If the pregnancy is marked completed but has no baby yet, it's LIMBO
      else if (latestPregnancy.pregnancy_status === 'completed') {
        phase = "completion_limbo";
      }
      // PRIORITY 3: Active pregnancy
      else if (latestPregnancy.pregnancy_status === 'active') {
        phase = "pregnancy";
      }
      // Fallback: If they have babies at all, they should likely be in postnatal
      else if (hasBaby) {
        phase = "postnatal";
      }
    } else if (hasBaby) {
      phase = "postnatal";
    }

    // ─────────────────────────────────────────────
    // 3. SUMMARY METRICS
    // ─────────────────────────────────────────────

    // 3a. Upcoming scheduled appointments (future dates)
    const [[{ appointmentCount }]] = await pool.query(
      `SELECT COUNT(*) AS appointmentCount
       FROM appointment a
       JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
       WHERE pp.user_id = ?
         AND a.status = 'scheduled'
         AND a.appointment_date >= CURDATE()`,
      [user_id]
    );

    // 3b. Pending tests (test_record rows with no result yet)
    const [[{ testCount }]] = await pool.query(
      `SELECT COUNT(*) AS testCount
       FROM test_record tr
       JOIN pregnancy_profile pp ON tr.pregnancy_id = pp.pregnancy_id
       WHERE pp.user_id = ?
         AND (tr.result IS NULL OR tr.result = '')`,
      [user_id]
    );

    // 3c. Active medications (end_date is NULL or in the future)
    const [[{ medicationCount }]] = await pool.query(
      `SELECT COUNT(*) AS medicationCount
       FROM medication_record mr
       JOIN pregnancy_profile pp ON mr.pregnancy_id = pp.pregnancy_id
       WHERE pp.user_id = ?
         AND (mr.end_date IS NULL OR mr.end_date >= CURDATE())`,
      [user_id]
    );

    // 3d. Pending reminders / alerts
    const [[{ alertCount }]] = await pool.query(
      `SELECT COUNT(*) AS alertCount
       FROM reminder
       WHERE user_id = ? AND status = 'pending'`,
      [user_id]
    );

    // 3e. Stale appointments (scheduled but in the past)
    const [staleAppointments] = await pool.query(
      `SELECT
         a.appointment_id,
         a.appointment_date,
         CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
         h.hospital_name
       FROM appointment a
       JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
       JOIN doctor            d  ON a.doctor_id    = d.doctor_id
       JOIN hospital          h  ON d.hospital_id  = h.hospital_id
       WHERE pp.user_id = ?
         AND a.status = 'scheduled'
         AND a.appointment_date < CURDATE()
       ORDER BY a.appointment_date DESC`,
      [user_id]
    );

    // 3f. Stale vaccinations (scheduled but in the past)
    const [staleVaccinations] = await pool.query(
      `SELECT
         vr.vacc_record_id,
         vr.vaccination_date,
         v.vaccine_name,
         b.name AS baby_name
       FROM vaccination_record vr
       JOIN vaccination v ON vr.vaccine_id = v.vaccine_id
       JOIN baby        b ON vr.baby_id    = b.baby_id
       WHERE b.user_id = ?
         AND vr.status = 'scheduled'
         AND vr.vaccination_date < CURDATE()
       ORDER BY vr.vaccination_date DESC`,
      [user_id]
    );

    // ─────────────────────────────────────────────
    // 4. UPCOMING APPOINTMENTS (next 3)
    // ─────────────────────────────────────────────
    const [upcomingAppointments] = await pool.query(
      `SELECT
         a.appointment_id,
         a.appointment_date,
         a.status,
         da.time_slot,
         CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
         d.specialization,
         h.hospital_name
       FROM appointment a
       JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
       JOIN doctor            d  ON a.doctor_id    = d.doctor_id
       JOIN hospital          h  ON d.hospital_id  = h.hospital_id
       LEFT JOIN doctor_availability da ON a.availability_id = da.availability_id
       WHERE pp.user_id = ?
         AND a.status = 'scheduled'
         AND a.appointment_date >= CURDATE()
       ORDER BY a.appointment_date ASC
       LIMIT 3`,
      [user_id]
    );

    // ─────────────────────────────────────────────
    // 5. ASSIGNED DOCTOR
    //    Based on the most recent upcoming appointment,
    //    falling back to the latest past appointment.
    // ─────────────────────────────────────────────
    let assignedDoctor = null;

    if (upcomingAppointments.length > 0) {
      const next = upcomingAppointments[0];
      assignedDoctor = {
        name: next.doctor_name,
        specialization: next.specialization,
      };
    } else {
      const [pastRows] = await pool.query(
        `SELECT
           CONCAT(d.first_name, ' ', d.last_name) AS doctor_name,
           d.specialization
         FROM appointment a
         JOIN pregnancy_profile pp ON a.pregnancy_id = pp.pregnancy_id
         JOIN doctor            d  ON a.doctor_id    = d.doctor_id
         WHERE pp.user_id = ?
         ORDER BY a.appointment_date DESC
         LIMIT 1`,
        [user_id]
      );
      if (pastRows.length > 0) {
        assignedDoctor = {
          name: pastRows[0].doctor_name,
          specialization: pastRows[0].specialization,
        };
      }
    }

    // ─────────────────────────────────────────────
    // 6. BUILD & RETURN RESPONSE
    // ─────────────────────────────────────────────
    return res.json({
    user: {
      name: `${user.first_name} ${user.last_name}`,
      phone: user.phone || null,
      city: null, // extend if city column is added to user table
      age: null,  // extend if date_of_birth column is available
    },

    pregnancy: pregnancyData
      ? {
        pregnancy_id: pregnancyData.pregnancy_id,
        week: pregnancyData.week,
        daysToDue: pregnancyData.daysToDue,
        pregnancyCount: pregnancyData.pregnancyCount,
        start_date: pregnancyData.start_date,
        due_date: pregnancyData.due_date,
      }
      : null,

    babies: babyRows,
    phase,

    summary: {
      appointments: appointmentCount,
      tests: testCount,
      medications: medicationCount,
      alerts: alertCount,
      staleAppointments: staleAppointments.length,
      staleVaccinations: staleVaccinations.length,
    },

    appointments: upcomingAppointments.map((appt) => ({
      appointment_id: appt.appointment_id,
      doctor: appt.doctor_name,
      hospital: appt.hospital_name,
      date: appt.appointment_date,
      time_slot: appt.time_slot || null,
      status: appt.status,
    })),

    staleAppointments: staleAppointments.map((appt) => ({
      appointment_id: appt.appointment_id,
      doctor: appt.doctor_name,
      hospital: appt.hospital_name,
      date: appt.appointment_date,
    })),

    staleVaccinations: staleVaccinations.map((v) => ({
      vacc_record_id: v.vacc_record_id,
      vaccine_name: v.vaccine_name,
      baby_name: v.baby_name,
      date: v.vaccination_date,
    })),

    latestPregnancy,
    assignedDoctor,
  });
} catch (err) {
  console.error("❌ Dashboard error:", err);
  return res.status(500).json({ message: "Server error.", error: err.message });
}
};