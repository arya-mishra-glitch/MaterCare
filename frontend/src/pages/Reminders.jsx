import { useState, useEffect } from "react";
import api from "../api";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ title: "", type: "general", reminder_date: "", reminder_time: "" });
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const fetchReminders = () => {
    setLoading(true);
    let query = "";
    if (filter === "today") query = "?filter=today";
    else if (filter === "upcoming") query = "?filter=upcoming";
    else if (filter === "past") query = "?filter=past";

    api.get(`/reminders${query}`)
      .then(res => setReminders(res.data.data || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/reminders/${editId}`, form);
      } else {
        await api.post("/reminders", form);
      }
      fetchReminders();
      resetForm();
    } catch {
      alert("Failed to save reminder.");
    } finally {
      setSubmitting(false);
    }
  };

  const markDone = async (id) => {
    try {
      await api.put(`/reminders/${id}/done`);
      fetchReminders();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch {}
  };

  const handleEdit = (rem) => {
    setForm({
       title: rem.title,
       type: rem.type || "general",
       reminder_date: rem.reminder_date ? new Date(rem.reminder_date).toISOString().split('T')[0] : "",
       reminder_time: rem.reminder_time || ""
    });
    setEditId(rem.reminder_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
     setForm({ title: "", type: "general", reminder_date: "", reminder_time: "" });
     setEditId(null);
  };

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Reminders</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Never miss an appointment or medication</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
         
         {/* List */}
         <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
               {[
                  { id: "all", label: "All" },
                  { id: "today", label: "Today" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "past", label: "Completed" }
               ].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{ border: "none", background: filter === f.id ? "var(--primary)" : "var(--card)", color: filter === f.id ? "white" : "var(--muted-foreground)", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                     {f.label}
                  </button>
               ))}
            </div>

            {loading ? (
               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2, 3].map(i => <div key={i} style={{ height: 75, borderRadius: 13, background: "var(--input-bg)", border: "1px solid var(--border)" }} />)}</div>
            ) : reminders.length === 0 ? (
               <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 13, padding: "36px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>🔔</div>
                  <p style={{ margin: 0, fontSize: 13.5 }}>No reminders found in this category.</p>
               </div>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {reminders.map(rem => (
                     <div key={rem.reminder_id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `4px solid ${rem.status === 'done' ? '#16a34a' : 'var(--primary)'}`, borderRadius: 12, padding: "16px", display: "flex", gap: 16, alignItems: "center", opacity: rem.status === 'done' ? 0.7 : 1 }}>
                        <div style={{ flex: 1 }}>
                           <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, textDecoration: rem.status === 'done' ? 'line-through' : 'none' }}>{rem.title}</h3>
                           <p style={{ margin: 0, fontSize: 12.5, color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ display: "inline-flex", background: "var(--input-bg)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{rem.type}</span>
                              📅 {new Date(rem.reminder_date).toLocaleDateString()} • ⏱ {rem.reminder_time?.slice(0,5)}
                           </p>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                           {rem.status !== 'done' && (
                              <button onClick={() => markDone(rem.reminder_id)} style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Done</button>
                           )}
                           <button onClick={() => handleEdit(rem)} style={{ background: "var(--input-bg)", color: "var(--foreground)", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                           <button onClick={() => handleDelete(rem.reminder_id)} style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>

         {/* Form */}
         <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", position: "sticky", top: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px" }}>{editId ? "Edit Reminder" : "New Reminder"}</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Required Action *</label>
                  <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Take medication, Doctor visit..." style={inputStyle} />
               </div>
               
               <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Type *</label>
                  <select name="type" value={form.type} onChange={handleChange} required style={inputStyle}>
                     <option value="general">General</option>
                     <option value="medication">Medication</option>
                     <option value="appointment">Appointment</option>
                     <option value="water">Hydration</option>
                  </select>
               </div>

               <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                     <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Date *</label>
                     <input type="date" name="reminder_date" value={form.reminder_date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                     <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Time *</label>
                     <input type="time" name="reminder_time" value={form.reminder_time} onChange={handleChange} required style={inputStyle} />
                  </div>
               </div>

               <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button type="submit" disabled={submitting} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", padding: "12px", borderRadius: 8, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer" }}>
                     {submitting ? "Saving..." : editId ? "Update" : "Create"}
                  </button>
                  {editId && (
                     <button type="button" onClick={resetForm} style={{ padding: "12px", border: "1px solid var(--border)", background: "transparent", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
                  )}
               </div>
            </form>
         </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)",
  border: "1.5px solid var(--input-border, #eef0f4)",
  padding: "10px 12px",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--foreground, #111827)",
  fontFamily: "inherit",
  outline: "none",
};
