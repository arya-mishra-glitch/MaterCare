import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";

const T = {
  primary: "#e879a0",
  primaryLight: "rgba(232,121,160,0.10)",
  border: "var(--border, #eef0f4)",
  card: "var(--card, #ffffff)",
  rowBg: "var(--row-bg, #f9fafb)",
  text: "var(--foreground, #111827)",
  muted: "var(--muted-foreground, #9ca3af)",
  inputBg: "var(--muted, #f3f4f6)",
  success: { bg: "rgba(34,197,94,0.10)", text: "#16a34a" },
  warning: { bg: "rgba(234,179,8,0.12)", text: "#b45309" },
  danger: { bg: "rgba(239,68,68,0.10)", text: "#dc2626" },
  purple: { bg: "rgba(109,40,217,0.09)", text: "#6d28d9" },
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status }) {
  const map = {
    given: { ...T.success, label: "Given" },
    scheduled: { bg: T.primaryLight, text: T.primary, label: "Scheduled" },
    missed: { ...T.danger, label: "Missed" },
  };
  const s = map[status] || map.scheduled;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function VaccCard({ record }) {
  return (
    <div className="vacc-card"
      style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: "14px 18px", marginBottom: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>💉</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>{record.vaccine_name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: T.muted }}>
            {record.status === "given" ? `Given on ${fmt(record.vaccination_date)}` : `Recommended: ${record.recommended_age}`}
          </p>
          {record.baby_name && (
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.muted }}>👶 {record.baby_name}</p>
          )}
        </div>
        <StatusBadge status={record.status} />
      </div>
    </div>
  );
}

export default function Vaccination() {
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [babies, setBabies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [form, setForm] = useState({ baby_id: "", vaccine_id: "", vaccination_date: "", status: "scheduled" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get("/vaccinations"), api.get("/vaccinations/catalogue"), api.get("/babies")])
      .then(([r, c, b]) => {
        setCompleted(r.data.completed || []);
        setUpcoming(r.data.upcoming || []);
        setCatalogue(c.data);
        setBabies(b.data);
        if (b.data.length === 1) setForm(p => ({ ...p, baby_id: String(b.data[0].baby_id) }));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitMsg("");
    if (!form.baby_id) { setSubmitMsg("⚠ Please select a baby."); return; }
    if (!form.vaccine_id) { setSubmitMsg("⚠ Please select a vaccine."); return; }
    setSubmitting(true);
    try {
      await api.post("/vaccinations", {
        baby_id: Number(form.baby_id),
        vaccination_id: Number(form.vaccine_id),
        vaccine_id: Number(form.vaccine_id),
        vaccination_date: form.vaccination_date || undefined,
        status: form.status,
      });
      setSubmitMsg("✓ Vaccination record added.");
      setForm(p => ({ ...p, vaccine_id: "", vaccination_date: "", status: "scheduled" }));
      const r = await api.get("/vaccinations");
      setCompleted(r.data.completed || []);
      setUpcoming(r.data.upcoming || []);
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ color: T.text, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .vacc-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .vacc-input:focus { outline:none; border-color:${T.primary}!important; box-shadow:0 0 0 3px rgba(232,121,160,0.15); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Vaccination</h1>
        <p style={{ fontSize: 13.5, color: T.muted, margin: 0 }}>Track immunisation schedules and records</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: upcoming.length + completed.length, color: T.primary, bg: T.primaryLight },
          { label: "Given", value: completed.length, color: T.success.text, bg: T.success.bg },
          { label: "Upcoming", value: upcoming.length, color: T.warning.text, bg: T.warning.bg },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 13, padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: T.muted }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, alignItems: "start" }}>
        {/* ── Left: Records ── */}
        <div>
          <SectionTitle>Vaccination Records</SectionTitle>
          {loading ? <Skeletons /> : upcoming.length === 0 && completed.length === 0 ? (
            <Empty icon="💉" text="No vaccination records yet. Add your first one →" />
          ) : (
            <>
              {upcoming.length > 0 && <Group label={`Upcoming (${upcoming.length})`}>{upcoming.map(r => <VaccCard key={r.vacc_record_id} record={r} />)}</Group>}
              {completed.length > 0 && <Group label={`Completed (${completed.length})`}>{completed.map(r => <VaccCard key={r.vacc_record_id} record={r} />)}</Group>}
            </>
          )}
        </div>

        {/* ── Right: Form ── */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px", position: "sticky", top: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ background: T.primaryLight, color: T.primary, borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>New</span>
            Add Vaccination
          </h3>
          <form onSubmit={handleSubmit}>
            <Field label="Baby *">
              <select name="baby_id" value={form.baby_id} onChange={handleChange} required className="vacc-input" style={inputStyle}>
                <option value="">— Select baby —</option>
                {babies.map(b => <option key={b.baby_id} value={b.baby_id}>{b.name || `Baby #${b.baby_id}`}{b.date_of_birth ? ` (DOB: ${fmt(b.date_of_birth)})` : ""}</option>)}
              </select>
            </Field>

            <Field label="Vaccine *">
              <select name="vaccine_id" value={form.vaccine_id} onChange={handleChange} required className="vacc-input" style={inputStyle}>
                <option value="">— Select vaccine —</option>
                {catalogue.map(v => <option key={v.vaccine_id} value={v.vaccine_id}>{v.vaccine_name} — {v.recommended_age}</option>)}
              </select>
              {form.vaccine_id && <p style={hintStyle}>Recommended age: {catalogue.find(c => c.vaccine_id === Number(form.vaccine_id))?.recommended_age}</p>}
            </Field>

            <Field label="Vaccination Date (optional for scheduled)">
              <input type="date" name="vaccination_date" value={form.vaccination_date} onChange={handleChange} className="vacc-input" style={inputStyle} />
            </Field>

            <Field label="Status *">
              <select name="status" value={form.status} onChange={handleChange} className="vacc-input" style={inputStyle}>
                <option value="scheduled">Scheduled</option>
                <option value="given">Given</option>
              </select>
            </Field>

            {submitMsg && <Alert type={submitMsg.startsWith("✓") ? "success" : "error"}>{submitMsg}</Alert>}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", marginTop: 6, background: T.primary, color: "#fff", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.55 : 1, transition: "opacity 0.15s" }}>
              {submitting ? "Adding…" : "+ Add Vaccination"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ── shared helpers ── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground,#9ca3af)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}
function SectionTitle({ children }) {
  return <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground,#111827)", margin: "0 0 14px", paddingBottom: 10, borderBottom: `1px solid var(--border,#eef0f4)` }}>{children}</h3>;
}
function Group({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground,#9ca3af)", margin: "0 0 8px" }}>{label}</p>
      {children}
    </div>
  );
}
function Alert({ type, children }) {
  const s = type === "success"
    ? { background: "rgba(34,197,94,0.10)", color: "#16a34a", border: "1px solid #bbf7d0" }
    : { background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid #fca5a5" };
  return <div style={{ ...s, padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{children}</div>;
}
function Empty({ icon, text }) {
  return (
    <div style={{ background: "var(--card,#fff)", border: `1.5px dashed var(--border,#eef0f4)`, borderRadius: 13, padding: "36px 20px", textAlign: "center", color: "var(--muted-foreground,#9ca3af)" }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 13.5 }}>{text}</p>
    </div>
  );
}
function Skeletons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map(i => <div key={i} style={{ height: 68, borderRadius: 13, background: "var(--muted,#f3f4f6)", border: `1px solid var(--border,#eef0f4)` }} />)}
    </div>
  );
}

const inputStyle = {
  background: "var(--muted,#f3f4f6)",
  border: "1.5px solid var(--border,#eef0f4)",
  borderRadius: 9, padding: "10px 12px",
  color: "var(--foreground,#111827)",
  fontSize: 13.5, width: "100%", boxSizing: "border-box",
  fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s",
};
const hintStyle = { fontSize: 12, color: "var(--muted-foreground,#9ca3af)", fontStyle: "italic", margin: "3px 0 0" };