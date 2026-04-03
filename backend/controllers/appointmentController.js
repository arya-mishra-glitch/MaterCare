const db = require('../config/db');

// GET all appointments
exports.getAppointments = (req, res) => {
    db.query("SELECT * FROM Appointment", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// CREATE appointment
exports.createAppointment = (req, res) => {
    const { doctor_id, hospital_id, appointment_date, notes } = req.body;

    const sql = `
        INSERT INTO Appointment (doctor_id, hospital_id, appointment_date, notes)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [doctor_id, hospital_id, appointment_date, notes], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Inserted", id: result.insertId });
    });
};

// UPDATE appointment
exports.updateAppointment = (req, res) => {
    const id = req.params.id;
    const { doctor_id, hospital_id, appointment_date, notes } = req.body;

    const sql = `
        UPDATE Appointment
        SET doctor_id = ?, hospital_id = ?, appointment_date = ?, notes = ?
        WHERE appointment_id = ?
    `;

    db.query(sql, [doctor_id, hospital_id, appointment_date, notes, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Appointment updated" });
    });
};

// DELETE appointment
exports.deleteAppointment = (req, res) => {
    const id = req.params.id;

    const sql = `DELETE FROM Appointment WHERE appointment_id = ?`;

    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Appointment deleted" });
    });
};