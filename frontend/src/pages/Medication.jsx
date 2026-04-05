import { useState, useEffect } from "react";
import api from "../api";

function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span style={{
      fontSize: "11px",
      fontWeight: "600",
      padding: "4px 10px",
      borderRadius: "20px",
      letterSpacing: "0.3px",
      flexShrink: 0,
      background: isActive ? "#1A2D1A" : "#2D2D2D",
      color: isActive ? "#34D399" : "#888",
      border: isActive ? "1px solid #2D4D2D" : "1px solid #3D3D3D",
    }}>
      {isActive ? "Active" : "Completed"}
    </span>
  );
}

function MedCard({ record }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={styles.card} onClick={() => setOpen(!open)}>
      <div style={styles.cardTop}>
        <div style={styles.cardIcon}>💊</div>
        <div style={{ flex: 1 }}>
          <p style={styles.cardName}>{record.medication_name}</p>
          <p style={styles.cardDate}>
            {fmt(record.start_date)} → {record.end_date ? fmt(record.end_date) : "Ongoing"}
          </p>
        </div>
        <StatusBadge status={record.status} />
        <span style={styles.chevron}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={styles.cardBody}>
          {record.description && (
            <p style={styles.cardDesc}>{record.description}</p>
          )}
          <div style={{ display: "flex", gap: "24px" }}>
            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>Dosage</span>
              <span style={styles.detailValue}>
                {record.dosage || <em style={{ color: "#666" }}>Not specified</em>}
              </span>
            </div>
            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>Start Date</span>
              <span style={styles.detailValue}>{fmt(record.start_date)}</span>
            </div>
            <div style={styles.detailCol}>
              <span style={styles.detailLabel}>End Date</span>
              <span style={styles.detailValue}>
                {record.end_date ? fmt(record.end_date) : "Ongoing"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Medication({ pregnancyId }) {
  const [records, setRecords] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [form, setForm] = useState({
    medication_id: "",
    dosage: "",
    start_date: "",
    end_date: "",
  });

  const pId = pregnancyId || localStorage.getItem("pregnancy_id");

  // ── fetch on mount ──
  useEffect(() => {
    Promise.all([
      api.get("/medications"),
      api.get("/medications/catalogue"),
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
    if (!form.medication_id) {
      setSubmitMsg("⚠ Please select a medication.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/medications", {
        pregnancy_id: Number(pId),
        medication_id: Number(form.medication_id),
        dosage: form.dosage || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      });

      setSubmitMsg("✓ Medication record added successfully.");
      setForm({ medication_id: "", dosage: "", start_date: "", end_date: "" });

      const refreshed = await api.get("/medications");
      setRecords(refreshed.data);
    } catch (err) {
      setSubmitMsg(`⚠ ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const active = records.filter((r) => r.status === "active");
  const past = records.filter((r) => r.status === "past");

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Medication</h2>

      {/* ── Banner ── */}
      <div style={styles.banner}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>Your Medications</h3>
          <p style={{ margin: "6px 0 0", opacity: 0.85, fontSize: "14px" }}>
            Track prescriptions & supplements
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{active.length}</span>
            <span style={styles.statLabel}>Active</span>
          </div>
          <div style={styles.statBox}>
            <span style={styles.statNum}>{past.length}</span>
            <span style={styles.statLabel}>Past</span>
          </div>
        </div>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

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
              <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>💊</span>
              <p>No medication records yet. Add your first one →</p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={styles.groupLabel}>Active Medications ({active.length})</p>
                  {active.map((r) => <MedCard key={r.med_record_id} record={r} />)}
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <p style={styles.groupLabel}>Past Medications ({past.length})</p>
                  {past.map((r) => <MedCard key={r.med_record_id} record={r} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── RIGHT: Add Form ── */}
        <div style={styles.formWrap}>
          <h3 style={styles.formTitle}>➕ Add Medication</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Medication *</label>
              <select
                name="medication_id"
                value={form.medication_id}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="">— Select medication —</option>
                {catalogue.map((m) => (
                  <option key={m.medication_id} value={m.medication_id}>
                    {m.medication_name}
                  </option>
                ))}
              </select>
              {form.medication_id && (
                <p style={styles.hint}>
                  {catalogue.find((c) => c.medication_id === Number(form.medication_id))?.description}
                </p>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Dosage</label>
              <input
                type="text"
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. 1 tablet/day"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                End Date <span style={{ color: "#666", fontSize: "11px" }}>(leave blank for ongoing)</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
                style={styles.input}
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
              {submitting ? "Adding…" : "+ Add Medication"}
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
  detailCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  detailLabel: {
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#888",
  },
  detailValue: {
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
