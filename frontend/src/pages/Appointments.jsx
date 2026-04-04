import { useState, useEffect } from "react";
import api from "../api";

function Appointments({ appointments = [], refreshAppointments, pregnancy_id }) {
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [form, setForm] = useState({
    doctor_id: "",
    hospital_id: "",
    appointment_date: "",
    availability_id: "",
    notes: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Load doctor list on mount
  useEffect(() => {
    api
      .get("/doctors")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Doctors fetch error:", err));
  }, []);

  // ✅ Load availability slots when doctor + date are both chosen
  useEffect(() => {
    if (form.doctor_id && form.appointment_date) {
      api
        .get(`/doctors/${form.doctor_id}/availability?date=${form.appointment_date}`)
        .then((res) => setAvailableSlots(res.data.available_slots || []))
        .catch(() => setAvailableSlots([]));
    } else {
      setAvailableSlots([]);
    }
  }, [form.doctor_id, form.appointment_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      doctor_id: "",
      hospital_id: "",
      appointment_date: "",
      availability_id: "",
      notes: "",
    });
    setAvailableSlots([]);
    setEditId(null);
  };

  // ✅ Auto-fill hospital when doctor is selected
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const selected = doctors.find((d) => String(d.doctor_id) === String(doctorId));
    setForm((prev) => ({
      ...prev,
      doctor_id: doctorId,
      hospital_id: selected?.hospital_id || "",
      availability_id: "",
    }));
  };

  const handleAddOrUpdate = async () => {
    if (!form.doctor_id || !form.hospital_id || !form.appointment_date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await api.put(`/appointments/${editId}`, { ...form, pregnancy_id });
      } else {
        await api.post("/appointments", { ...form, pregnancy_id });
      }
      refreshAppointments();
      resetForm();
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert(err.response?.data?.message || "Failed to save appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      refreshAppointments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete appointment");
    }
  };

  const handleEdit = (appt) => {
    setForm({
      doctor_id: appt.doctor_id,
      hospital_id: appt.hospital_id,
      appointment_date: appt.appointment_date.slice(0, 10),
      availability_id: appt.availability_id || "",
      notes: appt.notes || "",
    });
    setEditId(appt.appointment_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Appointments</h2>

      {/* ── FORM ── */}
      <div style={styles.form}>
        <h3 style={styles.formTitle}>
          {editId ? "✏️ Update Appointment" : "➕ New Appointment"}
        </h3>

        <div style={styles.formGrid}>
          {/* Doctor Dropdown */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Doctor *</label>
            <select
              name="doctor_id"
              value={form.doctor_id}
              onChange={handleDoctorChange}
              style={styles.input}
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  Dr. {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital (auto-filled, read-only) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hospital *</label>
            <input
              style={{ ...styles.input, color: "#999", cursor: "not-allowed" }}
              value={
                doctors.find((d) => String(d.doctor_id) === String(form.doctor_id))
                  ?.hospital_name || ""
              }
              readOnly
              placeholder="Auto-filled from doctor"
            />
          </div>

          {/* Date */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Date *</label>
            <input
              type="date"
              name="appointment_date"
              value={form.appointment_date}
              onChange={handleChange}
              style={styles.input}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Available Time Slot */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Time Slot</label>
            <select
              name="availability_id"
              value={form.availability_id}
              onChange={handleChange}
              style={styles.input}
              disabled={availableSlots.length === 0}
            >
              <option value="">
                {form.doctor_id && form.appointment_date
                  ? availableSlots.length === 0
                    ? "No slots available"
                    : "Select a slot"
                  : "Choose doctor & date first"}
              </option>
              {availableSlots.map((slot) => (
                <option key={slot.availability_id} value={slot.availability_id}>
                  {slot.start_time} – {slot.end_time}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div style={{ ...styles.fieldGroup, gridColumn: "1 / -1" }}>
            <label style={styles.label}>Notes</label>
            <input
              type="text"
              name="notes"
              placeholder="Any notes or reason for visit"
              value={form.notes}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            style={styles.primaryBtn}
            onClick={handleAddOrUpdate}
            disabled={loading}
          >
            {loading ? "Saving..." : editId ? "Update" : "Add Appointment"}
          </button>
          {editId && (
            <button style={styles.cancelBtn} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── LIST ── */}
      <div style={{ marginTop: "30px" }}>
        <h3 style={{ color: "#A78BFA", marginBottom: "14px" }}>
          All Appointments ({appointments.length})
        </h3>

        {appointments.length === 0 ? (
          <div style={styles.empty}>No appointments yet. Add one above!</div>
        ) : (
          <div style={styles.list}>
            {appointments.map((appt) => (
              <div key={appt.appointment_id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <div style={styles.dateBox}>
                    <span style={styles.dateDay}>
                      {new Date(appt.appointment_date).getDate()}
                    </span>
                    <span style={styles.dateMonth}>
                      {new Date(appt.appointment_date).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDoctor}>
                    Dr. {appt.doctor_name || appt.doctor_id}
                  </p>
                  <p style={styles.cardSub}>
                    {appt.hospital_name || `Hospital #${appt.hospital_id}`}
                    {appt.start_time && ` · ${appt.start_time}`}
                  </p>
                  {appt.notes && (
                    <span style={styles.noteBadge}>{appt.notes}</span>
                  )}
                </div>
                <div style={styles.cardActions}>
                  <button
                    style={styles.editBtn}
                    onClick={() => handleEdit(appt)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(appt.appointment_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "4px 0",
    color: "white",
    fontFamily: "sans-serif",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
    color: "#fff",
  },
  form: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "24px",
  },
  formTitle: {
    margin: "0 0 18px",
    fontSize: "16px",
    color: "#A78BFA",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    background: "#2A2A2A",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "white",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  primaryBtn: {
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 22px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  cancelBtn: {
    background: "transparent",
    color: "#888",
    border: "1px solid #3A3A3A",
    borderRadius: "8px",
    padding: "10px 22px",
    cursor: "pointer",
    fontSize: "14px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  cardLeft: {},
  dateBox: {
    background: "#2D2070",
    borderRadius: "10px",
    padding: "8px 12px",
    textAlign: "center",
    minWidth: "48px",
  },
  dateDay: {
    display: "block",
    fontSize: "22px",
    fontWeight: "800",
    color: "#A78BFA",
    lineHeight: 1,
  },
  dateMonth: {
    display: "block",
    fontSize: "11px",
    color: "#7C6FCF",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  cardBody: {
    flex: 1,
  },
  cardDoctor: {
    margin: 0,
    fontWeight: "700",
    fontSize: "15px",
  },
  cardSub: {
    margin: "3px 0 6px",
    color: "#888",
    fontSize: "13px",
  },
  noteBadge: {
    background: "#2D2D2D",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#A78BFA",
  },
  cardActions: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    background: "#2D2D2D",
    color: "#A78BFA",
    border: "1px solid #3D3D3D",
    borderRadius: "7px",
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: "13px",
  },
  deleteBtn: {
    background: "#2D1515",
    color: "#F87171",
    border: "1px solid #4D2020",
    borderRadius: "7px",
    padding: "7px 14px",
    cursor: "pointer",
    fontSize: "13px",
  },
  empty: {
    color: "#555",
    background: "#1A1A1A",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    border: "1px dashed #2D2D2D",
  },
};

export default Appointments;
