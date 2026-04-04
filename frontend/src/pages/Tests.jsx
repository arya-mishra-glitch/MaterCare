import { useState, useEffect } from "react";
import api from "../api";

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatusBadge({ result }) {
  const pending = !result || result.trim() === "";
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: "600",
      padding: "4px 10px",
      borderRadius: "20px",
      letterSpacing: "0.3px",
      flexShrink: 0,
      background: pending ? "#2D2D00" : "#1A2D1A",
      color: pending ? "#F59E0B" : "#34D399",
      border: pending ? "1px solid #3D3D00" : "1px solid #2D4D2D",
    }}>
      {pending ? "Pending" : "Result In"}
    </span>
  );
}

function TestCard({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={styles.card}
      onClick={() => setOpen(!open)}
    >
      <div style={styles.cardTop}>
        <div style={styles.cardIcon}>🧪</div>
        <div style={{ flex: 1 }}>
          <p style={styles.cardName}>{record.test_name}</p>
          <p style={styles.cardDate}>{fmt(record.test_date)}</p>
        </div>
        <StatusBadge result={record.result} />
        <span style={styles.chevron}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={styles.cardBody}>
          {record.description && (
            <p style={styles.cardDesc}>{record.description}</p>
          )}
          <div style={styles.resultRow}>
            <span style={styles.resultLabel}>Result</span>
            <span style={styles.resultValue}>
              {record.result || <em style={{ color: "#666" }}>Awaiting result</em>}
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

  const [form, setForm] = useState({
    test_id: "",
    test_date: "",
    result: "",
  });

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  useEffect(() => {
    Promise.all([
      api.get("/tests"),
      api.get("/tests/catalogue"),
    ])
      .then(([rRecords, rCat]) => {
        setRecords(rRecords.data);
        setCatalogue(rCat.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg("");

    if (!pId) {
      setSubmitMsg("⚠ No active pregnancy found. Please create a pregnancy profile first.");
      return;
    }
    if (!form.test_id || !form.test_date) {
      setSubmitMsg("⚠ Please select a test type and date.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/tests", {
        pregnancy_id: Number(pId),
        test_id: Number(form.test_id),
        test_date: form.test_date,
        result: form.result || undefined,
      });

      setSubmitMsg("✓ Test record added successfully.");
      setForm({ test_id: "", test_date: "", result: "" });

      const refreshed = await api.get("/tests");
      setRecords(refreshed.data);
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const upcoming = records.filter((r) => !r.result || r.result.trim() === "");
  const completed = records.filter((r) => r.result && r.result.trim() !== "");

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Medical Tests</h2>

      {/* ── Header Banner ── */}
      <div style={styles.banner}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>Track Your Prenatal Tests</h3>
          <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: "14px" }}>
            Lab results & upcoming screenings
          </p>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statNum}>{records.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
      </div>

      {error && (
        <div style={styles.alertError}>{error}</div>
      )}

      <div style={styles.layout}>

        {/* ── LEFT: Records ── */}
        <div>
          <h3 style={styles.sectionTitle}>Your Records</h3>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={styles.skeleton} />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🔬</span>
              <p>No test records yet. Add your first one →</p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={styles.groupLabel}>Pending Results ({upcoming.length})</p>
                  {upcoming.map((r) => <TestCard key={r.test_record_id} record={r} />)}
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <p style={styles.groupLabel}>Completed ({completed.length})</p>
                  {completed.map((r) => <TestCard key={r.test_record_id} record={r} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Add Form ── */}
        <div style={styles.formWrap}>
          <h3 style={styles.formTitle}>➕ Add Test Record</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Test Type *</label>
              <select
                name="test_id"
                value={form.test_id}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">— Select a test —</option>
                {catalogue.map((t) => (
                  <option key={t.test_id} value={t.test_id}>
                    {t.test_name}
                  </option>
                ))}
              </select>
              {form.test_id && (
                <p style={styles.hint}>
                  {catalogue.find((c) => c.test_id === Number(form.test_id))?.description}
                </p>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Test Date *</label>
              <input
                type="date"
                name="test_date"
                value={form.test_date}
                onChange={handleChange}
                style={styles.input}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Result <span style={{ color: "#666", fontSize: "11px" }}>(optional)</span>
              </label>
              <input
                type="text"
                name="result"
                value={form.result}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Normal — 95 mg/dL"
              />
            </div>

            {submitMsg && (
              <div style={submitMsg.startsWith("✓") ? styles.alertSuccess : styles.alertError}>
                {submitMsg}
              </div>
            )}

            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: submitting ? 0.55 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
              disabled={submitting}
            >
              {submitting ? "Adding…" : "+ Add Record"}
            </button>
          </form>
        </div>
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
  banner: {
    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  statBox: {
    background: "rgba(255,255,255,0.2)",
    padding: "10px 18px",
    borderRadius: "10px",
    textAlign: "center",
    backdropFilter: "blur(4px)",
  },
  statNum: {
    display: "block",
    fontSize: "28px",
    fontWeight: "800",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    opacity: 0.8,
    letterSpacing: "0.5px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: "24px",
    alignItems: "start",
  },
  sectionTitle: {
    fontSize: "16px",
    color: "#A78BFA",
    marginBottom: "14px",
    paddingBottom: "10px",
    borderBottom: "1px solid #2A2A2A",
  },
  groupLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#888",
    marginBottom: "8px",
  },

  // ── cards ──
  card: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "14px",
    padding: "16px 20px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  cardIcon: {
    fontSize: "22px",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2D2070",
    borderRadius: "10px",
    flexShrink: 0,
  },
  cardName: {
    margin: 0,
    fontWeight: "700",
    fontSize: "15px",
    color: "#fff",
  },
  cardDate: {
    margin: "2px 0 0",
    fontSize: "13px",
    color: "#888",
  },
  chevron: {
    fontSize: "10px",
    color: "#666",
    marginLeft: "4px",
  },
  cardBody: {
    marginTop: "14px",
    paddingTop: "14px",
    borderTop: "1px dashed #2A2A2A",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#888",
    fontStyle: "italic",
    marginBottom: "10px",
  },
  resultRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  resultLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#888",
  },
  resultValue: {
    fontSize: "14px",
    color: "#fff",
  },

  // ── form ──
  formWrap: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "24px",
    position: "sticky",
    top: "24px",
  },
  formTitle: {
    margin: "0 0 18px",
    fontSize: "16px",
    color: "#A78BFA",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
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
    fontFamily: "sans-serif",
  },
  hint: {
    fontSize: "12px",
    color: "#666",
    fontStyle: "italic",
    marginTop: "2px",
  },
  primaryBtn: {
    width: "100%",
    marginTop: "6px",
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 22px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  // ── alerts ──
  alertError: {
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    background: "#2D1515",
    color: "#F87171",
    border: "1px solid #4D2020",
    marginBottom: "10px",
  },
  alertSuccess: {
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    background: "#1A2D1A",
    color: "#34D399",
    border: "1px solid #2D4D2D",
    marginBottom: "10px",
  },

  // ── empty & skeleton ──
  empty: {
    color: "#555",
    background: "#1A1A1A",
    borderRadius: "12px",
    padding: "30px",
    textAlign: "center",
    border: "1px dashed #2D2D2D",
  },
  skeleton: {
    height: "72px",
    borderRadius: "14px",
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
  },
};
