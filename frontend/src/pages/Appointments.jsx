import { useState } from "react";
import axios from "axios";

function Appointments({ appointments = [], refreshAppointments }) {
  const [form, setForm] = useState({
    doctor_id: "",
    hospital_id: "",
    appointment_date: "",
    notes: "",
  });

  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      doctor_id: "",
      hospital_id: "",
      appointment_date: "",
      notes: "",
    });
  };

  // ✅ ADD / UPDATE
  const handleAddOrUpdate = async () => {
    try {
      if (!form.doctor_id || !form.hospital_id || !form.appointment_date) {
        alert("Fill all fields");
        return;
      }

      if (editId) {
        await axios.put(
          `http://localhost:5000/api/appointments/${editId}`,
          form
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/appointments",
          form
        );
      }

      refreshAppointments();   // 🔥 VERY IMPORTANT
      resetForm();
      setEditId(null);

    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ DELETE
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/${id}`
      );
      refreshAppointments();   // 🔥 VERY IMPORTANT
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ EDIT
  const handleEdit = (appt) => {
    setForm({
      doctor_id: appt.doctor_id,
      hospital_id: appt.hospital_id,
      appointment_date: appt.appointment_date.slice(0, 10),
      notes: appt.notes || "",
    });
    setEditId(appt.appointment_id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Appointments</h2>

      {/* FORM */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="number"
          name="doctor_id"
          placeholder="Doctor ID"
          value={form.doctor_id}
          onChange={handleChange}
        />

        <input
          type="date"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
        />

        <input
          type="number"
          name="hospital_id"
          placeholder="Hospital ID"
          value={form.hospital_id}
          onChange={handleChange}
        />

        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button onClick={handleAddOrUpdate}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* LIST */}
      <div style={{ marginTop: "20px" }}>
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            <div key={appt.appointment_id}>
              <p>Doctor: {appt.doctor_id}</p>
              <p>
                Date:{" "}
                {new Date(appt.appointment_date).toLocaleDateString()}
              </p>
              <p>Hospital: {appt.hospital_id}</p>
              <p>Notes: {appt.notes}</p>

              <button onClick={() => handleEdit(appt)}>Edit</button>
              <button
                onClick={() =>
                  handleDelete(appt.appointment_id)
                }
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No appointments yet</p>
        )}
      </div>
    </div>
  );
}

export default Appointments;