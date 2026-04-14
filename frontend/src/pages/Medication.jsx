import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
      background: active ? "var(--success-bg)" : "var(--input-bg)",
      color: active ? "var(--success-text)" : "var(--muted-foreground)"
    }}>
      {active ? "Active" : "Completed"}
    </span>
  );
}

function MedCard({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} className="med-card"
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 18px", marginBottom: 10, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💊</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>{record.medication_name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--muted-foreground)" }}>
            {fmt(record.start_date)} → {record.end_date ? fmt(record.end_date) : "Ongoing"}
          </p>
        </div>
        <StatusBadge status={record.status} />
        <span style={{ fontSize: 10, color: "var(--muted-foreground)", marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
          {record.description && <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontStyle: "italic", margin: "0 0 12px" }}>{record.description}</p>}
          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "Dosage", value: record.dosage || "Not specified" },
              { label: "Start Date", value: fmt(record.start_date) },
              { label: "End Date", value: record.end_date ? fmt(record.end_date) : "Ongoing" },
            ].map(d => (
              <div key={d.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground)" }}>{d.label}</span>
                <span style={{ fontSize: 13.5, color: "var(--foreground)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Medication() {
  const { pregnancyInfo } = useOutletContext();
  const pregnancyId = pregnancyInfo?.pregnancy_id;
  const [records, setRecords] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [form, setForm] = useState({ medication_id: "", dosage: "", start_date: "", end_date: "" });

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  useEffect(() => {
    Promise.all([api.get("/medications"), api.get("/medications/catalogue")])
      .then(([r, c]) => { setRecords(r.data); setCatalogue(c.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitMsg("");
    if (!pId) { setSubmitMsg("⚠ No active pregnancy found."); return; }
    if (!form.medication_id) { setSubmitMsg("⚠ Please select a medication."); return; }
    setSubmitting(true);
    try {
      await api.post("/medications", {
        pregnancy_id: Number(pId), medication_id: Number(form.medication_id),
        dosage: form.dosage || undefined, start_date: form.start_date || undefined, end_date: form.end_date || undefined,
      });
      setSubmitMsg("✓ Medication record added.");
      setForm({ medication_id: "", dosage: "", start_date: "", end_date: "" });
      const r = await api.get("/medications"); setRecords(r.data);
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally { setSubmitting(false); }
  };

  const active = records.filter(r => r.status === "active");
  const past = records.filter(r => r.status !== "active");

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .med-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
        .med-input { transition: border-color 0.15s, box-shadow 0.15s; background: var(--input-bg) !important; color: var(--foreground) !important; border-color: var(--input-border) !important; }
        .med-input:focus { outline:none; border-color: var(--primary) !important; box-shadow:0 0 0 3px rgba(232,121,160,0.15); }
        .med-input option { background: var(--card); color: var(--foreground); }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 4px" }}>Medication</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Track prescriptions and supplements</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: records.length, color: "var(--primary)", bg: "var(--primary-light)" },
          { label: "Active", value: active.length, color: "var(--success-text)", bg: "var(--success-bg)" },
          { label: "Past", value: past.length, color: "var(--muted-foreground)", bg: "var(--input-bg)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground)" }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, alignItems: "start" }}>
        <div>
          <SectionTitle>Your Records</SectionTitle>
          {loading ? <Skeletons /> : records.length === 0 ? (
            <Empty icon="💊" text="No medication records yet. Add your first one →" />
          ) : (
            <>
              {active.length > 0 && <Group label={`Active Medications (${active.length})`}>{active.map(r => <MedCard key={r.med_record_id} record={r} />)}</Group>}
              {past.length > 0 && <Group label={`Past Medications (${past.length})`}>{past.map(r => <MedCard key={r.med_record_id} record={r} />)}</Group>}
            </>
          )}
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px", position: "sticky", top: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>New</span>
            Add Medication
          </h3>
          <form onSubmit={handleSubmit}>
            <Field label="Medication *">
              <select name="medication_id" value={form.medication_id} onChange={handleChange} required className="med-input" style={inputStyle}>
                <option value="">— Select medication —</option>
                {catalogue.map(m => <option key={m.medication_id} value={m.medication_id}>{m.medication_name}</option>)}
              </select>
              {form.medication_id && <p style={hintStyle}>{catalogue.find(c => c.medication_id === Number(form.medication_id))?.description}</p>}
            </Field>

            <Field label="Dosage">
              <input type="text" name="dosage" value={form.dosage} onChange={handleChange}
                placeholder="e.g. 1 tablet/day" className="med-input" style={inputStyle} />
            </Field>

            <Field label="Start Date">
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="med-input" style={inputStyle} />
            </Field>

            <Field label="End Date (blank = ongoing)">
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="med-input" style={inputStyle} />
            </Field>

            {submitMsg && <Alert type={submitMsg.startsWith("✓") ? "success" : "error"}>{submitMsg}</Alert>}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", marginTop: 6, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.55 : 1, transition: "opacity 0.15s" }}>
              {submitting ? "Adding…" : "+ Add Medication"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}
function SectionTitle({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 14px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{children}</h3>;
}
function Group({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground)", margin: "0 0 8px" }}>{label}</p>
      {children}
    </div>
  );
}
function Alert({ type, children }) {
  const s = type === "success"
    ? { background: "var(--success-bg)", color: "var(--success-text)", border: "1px solid var(--success-bg)" }
    : { background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-bg)" };
  return <div style={{ ...s, padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{children}</div>;
}
function Empty({ icon, text }) {
  return (
    <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 13, padding: "36px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 13.5 }}>{text}</p>
    </div>
  );
}
function Skeletons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map(i => <div key={i} style={{ height: 68, borderRadius: 13, background: "var(--input-bg)", border: "1px solid var(--border)" }} />)}
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)",
  border: "1.5px solid var(--input-border, #eef0f4)",
  borderRadius: 9, padding: "10px 12px",
  color: "var(--foreground, #111827)",
  fontSize: 13.5, width: "100%", boxSizing: "border-box",
  fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s",
};
const hintStyle = { fontSize: 12, color: "var(--muted-foreground)", fontStyle: "italic", margin: "3px 0 0" };