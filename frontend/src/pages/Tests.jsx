import { useState, useEffect } from "react";
import api from "../api";

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ result }) {
  const pending = !result || result.trim() === "";
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap",
      background: pending ? "var(--warning-bg)" : "var(--success-bg)",
      color: pending ? "var(--warning-text)" : "var(--success-text)"
    }}>
      {pending ? "Pending" : "Result In"}
    </span>
  );
}

function TestCard({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} className="test-card"
      style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 18px", marginBottom: 10, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 40, height: 40, borderRadius: 9, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧪</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>{record.test_name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--muted-foreground)" }}>{fmt(record.test_date)}</p>
        </div>
        <StatusBadge result={record.result} />
        <span style={{ fontSize: 10, color: "var(--muted-foreground)", marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--border)" }}>
          {record.description && <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontStyle: "italic", margin: "0 0 10px" }}>{record.description}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--muted-foreground)" }}>Result</span>
            <span style={{ fontSize: 14, color: "var(--foreground)" }}>
              {record.result || <em style={{ color: "var(--muted-foreground)" }}>Awaiting result</em>}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tests({ pregnancyId }) {
  const [records, setRecords] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [form, setForm] = useState({ test_id: "", test_date: "", result: "" });

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  useEffect(() => {
    Promise.all([api.get("/tests"), api.get("/tests/catalogue")])
      .then(([r, c]) => { setRecords(r.data); setCatalogue(c.data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitMsg("");
    if (!pId) { setSubmitMsg("⚠ No active pregnancy found."); return; }
    if (!form.test_id || !form.test_date) { setSubmitMsg("⚠ Please select a test and date."); return; }
    setSubmitting(true);
    try {
      await api.post("/tests", { pregnancy_id: Number(pId), test_id: Number(form.test_id), test_date: form.test_date, result: form.result || undefined });
      setSubmitMsg("✓ Test record added successfully.");
      setForm({ test_id: "", test_date: "", result: "" });
      const r = await api.get("/tests"); setRecords(r.data);
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally { setSubmitting(false); }
  };

  const pending = records.filter(r => !r.result || r.result.trim() === "");
  const completed = records.filter(r => r.result && r.result.trim() !== "");

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .test-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important; transform: translateY(-1px); }
        .test-input { transition: border-color 0.15s, box-shadow 0.15s; background: var(--input-bg) !important; color: var(--foreground) !important; border-color: var(--input-border) !important; }
        .test-input:focus { outline:none; border-color: var(--primary) !important; box-shadow:0 0 0 3px rgba(232,121,160,0.15); }
        .test-input option { background: var(--card); color: var(--foreground); }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 4px" }}>Medical Tests</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Track lab results and prenatal screenings</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Tests", value: records.length, color: "var(--primary)", bg: "var(--primary-light)" },
          { label: "Pending Results", value: pending.length, color: "var(--warning-text)", bg: "var(--warning-bg)" },
          { label: "Completed", value: completed.length, color: "var(--success-text)", bg: "var(--success-bg)" },
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
            <Empty icon="🔬" text="No test records yet. Add your first one →" />
          ) : (
            <>
              {pending.length > 0 && <Group label={`Pending Results (${pending.length})`}>{pending.map(r => <TestCard key={r.test_record_id} record={r} />)}</Group>}
              {completed.length > 0 && <Group label={`Completed (${completed.length})`}>{completed.map(r => <TestCard key={r.test_record_id} record={r} />)}</Group>}
            </>
          )}
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px", position: "sticky", top: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>New</span>
            Add Test Record
          </h3>
          <form onSubmit={handleSubmit}>
            <Field label="Test Type *">
              <select name="test_id" value={form.test_id} onChange={handleChange} required className="test-input" style={inputStyle}>
                <option value="">— Select a test —</option>
                {catalogue.map(t => <option key={t.test_id} value={t.test_id}>{t.test_name}</option>)}
              </select>
              {form.test_id && <p style={hintStyle}>{catalogue.find(c => c.test_id === Number(form.test_id))?.description}</p>}
            </Field>

            <Field label="Test Date *">
              <input type="date" name="test_date" value={form.test_date} onChange={handleChange} required
                max={new Date().toISOString().slice(0, 10)} className="test-input" style={inputStyle} />
            </Field>

            <Field label="Result (optional)">
              <input type="text" name="result" value={form.result} onChange={handleChange}
                placeholder="e.g. Normal — 95 mg/dL" className="test-input" style={inputStyle} />
            </Field>

            {submitMsg && <Alert type={submitMsg.startsWith("✓") ? "success" : "error"}>{submitMsg}</Alert>}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", marginTop: 6, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.55 : 1, transition: "opacity 0.15s" }}>
              {submitting ? "Adding…" : "+ Add Record"}
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