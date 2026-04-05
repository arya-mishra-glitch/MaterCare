import { useState, useEffect } from "react";
import api from "../api";

/* ─────────────────────────────────────────────
   Shared design tokens — all use CSS variables
───────────────────────────────────────────── */
const T = {
  primary: "var(--primary, #e879a0)",
  primaryLight: "var(--primary-light, rgba(232,121,160,0.10))",
  border: "var(--border, #eef0f4)",
  card: "var(--card, #ffffff)",
  bg: "var(--bg, #f8f9fb)",
  rowBg: "var(--row-bg, #f9fafb)",
  text: "var(--foreground, #111827)",
  muted: "var(--muted-foreground, #6b7280)",
  input: "var(--input-bg, #f3f4f6)",
  success: { bg: "var(--success-bg)", text: "var(--success-text)" },
  warning: { bg: "var(--warning-bg)", text: "var(--warning-text)" },
  danger: { bg: "var(--danger-bg)", text: "var(--danger-text)" },
  purple: { bg: "var(--purple-bg)", text: "var(--purple-text)" },
};

const statusStyle = (s) => {
  const m = {
    scheduled: { background: "var(--primary-light)", color: "var(--primary)" },
    confirmed: { background: "var(--success-bg)", color: "var(--success-text)" },
    completed: { background: "var(--purple-bg)", color: "var(--purple-text)" },
    cancelled: { background: "var(--danger-bg)", color: "var(--danger-text)" },
  };
  return m[(s || "").toLowerCase()] || { background: "var(--input-bg)", color: "var(--muted-foreground)" };
};

export default function Appointments({ appointments = [], refreshAppointments, pregnancy_id }) {
  const [doctors, setDoctors] = useState([]);
  const [allDoctorSlots, setAllDoctorSlots] = useState([]);
  const [form, setForm] = useState({ doctor_id: "", hospital_id: "", appointment_date: "", availability_id: "", notes: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    api.get("/doctors").then(r => setDoctors(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.doctor_id) {
      api.get(`/doctors/${form.doctor_id}/availability`)
        .then(r => setAllDoctorSlots(r.data.available_slots || []))
        .catch(() => setAllDoctorSlots([]));
    } else setAllDoctorSlots([]);
  }, [form.doctor_id]);

  const slotDate = (v) => v ? (typeof v === "string" ? v.slice(0, 10) : new Date(v).toISOString().slice(0, 10)) : "";
  const availableDates = [...new Set(allDoctorSlots.map(s => slotDate(s.available_date)))].sort();
  const slotsForDate = allDoctorSlots.filter(s => slotDate(s.available_date) === form.appointment_date);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const resetForm = () => { setForm({ doctor_id: "", hospital_id: "", appointment_date: "", availability_id: "", notes: "" }); setAllDoctorSlots([]); setEditId(null); };

  const handleDoctorChange = e => {
    const d = doctors.find(x => String(x.doctor_id) === e.target.value);
    setForm(p => ({ ...p, doctor_id: e.target.value, hospital_id: d?.hospital_id || "", appointment_date: "", availability_id: "" }));
  };

  const handleAddOrUpdate = async () => {
    if (!form.doctor_id || !form.hospital_id || !form.appointment_date) { alert("Please fill all required fields"); return; }
    setLoading(true);
    try {
      editId
        ? await api.put(`/appointments/${editId}`, { ...form, pregnancy_id })
        : await api.post("/appointments", { ...form, pregnancy_id });
      refreshAppointments(); resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save appointment");
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try { await api.delete(`/appointments/${id}`); refreshAppointments(); }
    catch { alert("Failed to delete appointment"); }
  };

  const handleEdit = (a) => {
    setForm({ doctor_id: a.doctor_id, hospital_id: a.hospital_id, appointment_date: a.appointment_date.slice(0, 10), availability_id: a.availability_id || "", notes: a.notes || "" });
    setEditId(a.appointment_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .appt-input {
          transition: border-color 0.15s, box-shadow 0.15s;
          background: var(--input-bg, #f3f4f6) !important;
          color: var(--foreground, #111827) !important;
          border-color: var(--input-border, #eef0f4) !important;
        }
        .appt-input:focus { outline: none; border-color: var(--primary) !important; box-shadow: 0 0 0 3px rgba(232,121,160,0.15); }
        .appt-input option { background: var(--card); color: var(--foreground); }
        .appt-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
        .appt-card { transition: all 0.2s; }
        .btn-edit:hover { background: var(--primary-light) !important; border-color: var(--primary) !important; color: var(--primary) !important; }
        .btn-delete:hover { opacity: 0.8; }
        .tab-pill { border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; padding: 7px 18px; border-radius: 999px; transition: all 0.18s; }
        .tab-pill:hover { opacity: 0.85; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 4px" }}>Appointments</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Manage your prenatal checkups and doctor visits</p>
      </div>

      {/* FORM CARD */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 24px", marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 7, padding: "4px 8px", fontSize: 12 }}>
            {editId ? "Edit" : "New"}
          </span>
          {editId ? "Update Appointment" : "Book an Appointment"}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Doctor *">
            <select name="doctor_id" value={form.doctor_id} onChange={handleDoctorChange} className="appt-input" style={inputStyle}>
              <option value="">Select Doctor</option>
              {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.full_name} — {d.specialization}</option>)}
            </select>
          </Field>

          <Field label="Hospital">
            <input className="appt-input" style={{ ...inputStyle, cursor: "not-allowed", opacity: 0.65 }}
              value={doctors.find(d => String(d.doctor_id) === String(form.doctor_id))?.hospital_name || ""}
              readOnly placeholder="Auto-filled from doctor" />
          </Field>

          <Field label="Date *">
            <select name="appointment_date" value={form.appointment_date} onChange={handleChange}
              disabled={!form.doctor_id || !availableDates.length} className="appt-input" style={inputStyle}>
              <option value="">{!form.doctor_id ? "Select a doctor first" : !availableDates.length ? "No dates available" : "Select date"}</option>
              {availableDates.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</option>
              ))}
            </select>
          </Field>

          <Field label="Time Slot *">
            <select name="availability_id" value={form.availability_id} onChange={handleChange}
              disabled={!slotsForDate.length} className="appt-input" style={inputStyle}>
              <option value="">{form.doctor_id && form.appointment_date ? (!slotsForDate.length ? "No slots" : "Select slot") : "Choose doctor & date first"}</option>
              {slotsForDate.map(s => <option key={s.availability_id} value={s.availability_id}>{s.time_slot}</option>)}
            </select>
          </Field>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Notes">
              <input type="text" name="notes" value={form.notes} onChange={handleChange}
                placeholder="Reason for visit or any notes" className="appt-input" style={inputStyle} />
            </Field>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={handleAddOrUpdate}
            disabled={loading || !form.doctor_id || !form.appointment_date || !form.availability_id}
            style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 9, padding: "10px 22px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", opacity: (loading || !form.doctor_id || !form.appointment_date || !form.availability_id) ? 0.5 : 1, transition: "opacity 0.15s" }}>
            {loading ? "Saving…" : editId ? "Update Appointment" : "Book Appointment"}
          </button>
          {editId && (
            <button onClick={resetForm}
              style={{ background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px 18px", fontSize: 13.5, cursor: "pointer" }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── TABS + LIST ── */}
      <div>
        {/* Tab toggle row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          {[
            { key: "upcoming", label: "Upcoming", count: appointments.filter(a => isUpcoming(a)).length },
            { key: "past",     label: "Past",     count: appointments.filter(a => isPast(a)).length },
            { key: "cancelled",label: "Cancelled", count: appointments.filter(a => isCancelled(a)).length },
          ].map(({ key, label, count }) => {
            const active = activeTab === key;
            return (
              <button key={key} className="tab-pill"
                onClick={() => setActiveTab(key)}
                style={{
                  background: active ? "var(--primary)" : "var(--card)",
                  color: active ? "#fff" : "var(--muted-foreground)",
                  border: active ? "none" : "1px solid var(--border)",
                  boxShadow: active ? "0 2px 10px rgba(232,121,160,0.30)" : "none",
                }}>
                {label}
                {count > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: active ? "rgba(255,255,255,0.25)" : "var(--primary-light)",
                    color: active ? "#fff" : "var(--primary)",
                    fontSize: 11, fontWeight: 700,
                    padding: "1px 7px", borderRadius: 999,
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filtered list */}
        {(() => {
          const filtered = appointments.filter(a =>
            activeTab === "upcoming"  ? isUpcoming(a) :
            activeTab === "past"      ? isPast(a) :
            isCancelled(a)
          );

          if (filtered.length === 0) return (
            <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 14, padding: "40px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <p style={{ margin: 0, fontSize: 14 }}>
                {activeTab === "upcoming"  ? "No upcoming appointments. Book one above!" :
                 activeTab === "past"      ? "No past appointments yet." :
                                            "No cancelled appointments."}
              </p>
            </div>
          );

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(appt => {
                const dateObj = new Date(appt.appointment_date);
                return (
                  <div key={appt.appointment_id} className="appt-card"
                    style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

                    {/* Date box */}
                    <div style={{ background: "var(--primary-light)", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 52, flexShrink: 0 }}>
                      <span style={{ display: "block", fontSize: 20, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                        {dateObj.getDate()}
                      </span>
                      <span style={{ display: "block", fontSize: 10, color: "var(--primary)", textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>
                        {dateObj.toLocaleString("default", { month: "short" })}
                      </span>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>
                        Dr. {appt.doctor_name || appt.doctor_id}
                      </p>
                      {appt.specialization && (
                        <p style={{ margin: "1px 0 0", fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                          {appt.specialization}
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 5 }}>
                        {(appt.time_slot || appt.start_time) && (
                          <span style={{ fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
                            <ClockIcon /> {appt.time_slot || appt.start_time}
                          </span>
                        )}
                        {appt.hospital_name && (
                          <span style={{ fontSize: 12, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 4 }}>
                            <PinIcon /> {appt.hospital_name}
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <span style={{ display: "inline-block", marginTop: 6, background: "var(--primary-light)", color: "var(--primary)", fontSize: 11, fontWeight: 500, padding: "2px 9px", borderRadius: 20 }}>
                          {appt.notes}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <span style={{ ...statusStyle(appt.status), fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : "Scheduled"}
                    </span>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                      <button className="btn-edit" onClick={() => handleEdit(appt)}
                        style={{ background: "var(--row-bg)", color: "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 13px", cursor: "pointer", fontSize: 12.5, fontWeight: 500, transition: "all 0.15s" }}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(appt.appointment_id)}
                        style={{ background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-bg)", borderRadius: 7, padding: "6px 13px", cursor: "pointer", fontSize: 12.5, fontWeight: 500, transition: "all 0.15s" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

/* ── Helpers to classify appointments ── */
const isUpcoming   = a => (a.status || "").toLowerCase() !== "cancelled" && (a.status || "").toLowerCase() !== "completed" && new Date(a.appointment_date) >= new Date(new Date().toDateString());
const isPast       = a => (a.status || "").toLowerCase() === "completed"  || ((a.status || "").toLowerCase() !== "cancelled" && new Date(a.appointment_date) < new Date(new Date().toDateString()));
const isCancelled  = a => (a.status || "").toLowerCase() === "cancelled";

/* ── Tiny inline SVG icons ── */
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);
const PinIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)",
  border: "1.5px solid var(--input-border, #eef0f4)",
  borderRadius: 9,
  padding: "10px 12px",
  color: "var(--foreground, #111827)",
  fontSize: 13.5,
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};