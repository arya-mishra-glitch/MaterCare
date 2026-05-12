import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";

function fmtTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function Symptoms() {
  const { pregnancyInfo } = useOutletContext();
  const pregnancyId = pregnancyInfo?.pregnancy_id;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  
  const [form, setForm] = useState({ symptom_name: "", severity: "mild", notes: "", log_date: new Date().toISOString().slice(0, 10), log_time: new Date().toTimeString().slice(0, 5) });

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  const commonSymptoms = ["Nausea", "Fatigue", "Headache", "Heartburn", "Back Pain", "Cramping", "Spotting", "Swelling", "Shortness of Breath", "Insomnia"];

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = () => {
    setLoading(true);
    api.get("/symptoms")
      .then(r => setRecords(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitMsg("");
    if (!pId) { setSubmitMsg("⚠ No active pregnancy found."); return; }
    if (!form.symptom_name) { setSubmitMsg("⚠ Please select or enter a symptom."); return; }
    setSubmitting(true);
    
    // Combine date and time for logged_at
    const logged_at = `${form.log_date} ${form.log_time}:00`;
    
    try {
      await api.post("/symptoms", { 
        pregnancy_id: Number(pId), 
        symptom_name: form.symptom_name, 
        severity: form.severity, 
        notes: form.notes || undefined,
        logged_at 
      });
      setSubmitMsg("✓ Symptom logged successfully.");
      setForm({ symptom_name: "", severity: "mild", notes: "", log_date: form.log_date, log_time: form.log_time }); // Keep same time to allow fast logging
      fetchSymptoms();
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally { setSubmitting(false); }
  };

  // Group records by Date (YYYY-MM-DD)
  const groupedRecords = records.reduce((acc, rec) => {
    const d = new Date(rec.logged_at).toISOString().slice(0, 10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(rec);
    return acc;
  }, {});

  const dates = Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        .sym-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.06) !important; transform: translateY(-1px); }
        .sym-input { transition: border-color 0.15s, box-shadow 0.15s; background: var(--input-bg) !important; color: var(--foreground) !important; border-color: var(--input-border) !important; }
        .sym-input:focus { outline:none; border-color: var(--primary) !important; box-shadow:0 0 0 3px rgba(232,121,160,0.15); }
        .sym-input option { background: var(--card); color: var(--foreground); }
        .severity-btn { flex: 1; padding: 10px; border-radius: 9px; border: 1.5px solid var(--input-border); background: var(--input-bg); cursor: pointer; font-size: 13px; font-weight: 600; color: var(--muted-foreground); transition: all 0.15s; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 4px" }}>Symptom Log</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Track how you're feeling day-by-day</p>
      </div>

      {error && <div style={{ background: "var(--danger-bg)", color: "var(--danger-text)", border: "1px solid var(--danger-bg)", padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
        
        {/* LEFT COLUMN: HISTORY TIMELINE */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 16px", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Your History</h3>
          
          {loading ? (
             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1, 2, 3].map(i => <div key={i} style={{ height: 75, borderRadius: 13, background: "var(--input-bg)", border: "1px solid var(--border)" }} />)}</div>
          ) : records.length === 0 ? (
             <div style={{ background: "var(--card)", border: "1.5px dashed var(--border)", borderRadius: 13, padding: "36px 20px", textAlign: "center", color: "var(--muted-foreground)" }}>
               <div style={{ fontSize: 34, marginBottom: 10 }}>📝</div>
               <p style={{ margin: 0, fontSize: 13.5 }}>No symptoms logged yet. Start tracking on the right!</p>
             </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {dates.map(dateStr => (
                <div key={dateStr}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {fmtDate(dateStr)}
                    </div>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {groupedRecords[dateStr].map(rec => {
                      const severityMap = {
                        mild: { bg: "var(--success-bg)", text: "var(--success-text)", label: "Mild" },
                        moderate: { bg: "var(--warning-bg)", text: "var(--warning-text)", label: "Moderate" },
                        severe: { bg: "var(--danger-bg)", text: "var(--danger-text)", label: "Severe" },
                      };
                      const sevConfig = severityMap[(rec.severity || "").toLowerCase()] || { bg: "rgba(156,163,175,0.15)", text: "var(--muted-foreground)", label: rec.severity || "Unknown" };

                      return (
                        <div key={rec.symptom_id} className="sym-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, padding: "14px 16px", display: "flex", gap: 14 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", paddingTop: 2, minWidth: 50 }}>
                            {fmtTime(rec.logged_at)}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: rec.notes ? 6 : 0 }}>
                              <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--foreground)" }}>{rec.symptom_name}</span>
                              <span style={{ background: sevConfig.bg, color: sevConfig.text, padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>{sevConfig.label}</span>
                            </div>
                            
                            {rec.notes && (
                              <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)", background: "var(--input-bg)", padding: "8px 12px", borderRadius: 8, fontStyle: "italic" }}>
                                "{rec.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOG FORM */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px", position: "sticky", top: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ background: "var(--primary-light)", color: "var(--primary)", borderRadius: 7, padding: "3px 8px", fontSize: 11 }}>New</span>
            Log a Symptom
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Date</label>
                <input type="date" name="log_date" value={form.log_date} onChange={handleChange} required max={new Date().toISOString().slice(0, 10)} className="sym-input" style={inputStyle} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Time</label>
                <input type="time" name="log_time" value={form.log_time} onChange={handleChange} required className="sym-input" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Symptom *</label>
              <input type="text" name="symptom_name" value={form.symptom_name} onChange={handleChange} required placeholder="e.g. Nausea, Headache" list="common-symptoms" className="sym-input" style={inputStyle} />
              <datalist id="common-symptoms">
                {commonSymptoms.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Severity *</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "mild", label: "Mild", col: "var(--success-text)", bg: "var(--success-bg)" },
                  { id: "moderate", label: "Moderate", col: "var(--warning-text)", bg: "var(--warning-bg)" },
                  { id: "severe", label: "Severe", col: "var(--danger-text)", bg: "var(--danger-bg)" }
                ].map(sev => {
                  const sel = form.severity === sev.id;
                  return (
                    <button key={sev.id} type="button" onClick={() => setForm(p => ({ ...p, severity: sev.id }))} className="severity-btn"
                      style={{ 
                        background: sel ? sev.bg : "var(--input-bg)", 
                        color: sel ? sev.col : "var(--muted-foreground)",
                        borderColor: sel ? sev.col : "var(--input-border)"
                      }}>
                      {sev.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 18 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any triggers? Duration?" rows="3" className="sym-input" style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {submitMsg && <div style={{ background: submitMsg.startsWith("✓") ? "var(--success-bg)" : "var(--danger-bg)", color: submitMsg.startsWith("✓") ? "var(--success-text)" : "var(--danger-text)", border: `1px solid ${submitMsg.startsWith("✓") ? "var(--success-bg)" : "var(--danger-bg)"}`, padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{submitMsg}</div>}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 9, padding: "11px 22px", fontSize: 13.5, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.55 : 1, transition: "opacity 0.15s" }}>
              {submitting ? "Saving…" : "Save Symptom"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)", border: "1.5px solid var(--input-border, #eef0f4)",
  borderRadius: 9, padding: "10px 12px", color: "var(--foreground, #111827)",
  fontSize: 13.5, width: "100%", boxSizing: "border-box", fontFamily: "inherit"
};
