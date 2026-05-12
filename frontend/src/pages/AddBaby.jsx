import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api";

export default function AddBaby() {
  const navigate = useNavigate();
  const { setBabies, setPhase, pregnancyInfo, latestPregnancy } = useOutletContext();

  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    if (!date) return getTodayStr();

    const d = new Date(date);
    const today = new Date();
    // Use local comparison for capping
    const todayStr = getTodayStr();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return dateStr > todayStr ? todayStr : dateStr;
  };

  const [form, setForm] = useState({
    name: "",
    date_of_birth: formatDate(pregnancyInfo?.due_date),
    gender: "",
    birth_weight: "",
    current_weight: "",
    blood_group: "",
    health_status: "Healthy",
    delivery_type: "",
  });

  useEffect(() => {
    const defaultDate = pregnancyInfo?.due_date;
    if (defaultDate) {
        setForm(p => ({ ...p, date_of_birth: formatDate(defaultDate) }));
    }
  }, [pregnancyInfo]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Baby's name is required."); return; }

    const birthWeight = form.birth_weight !== "" ? parseFloat(form.birth_weight) : null;
    const currentWeight = form.current_weight !== "" ? parseFloat(form.current_weight) : null;

    if (form.birth_weight !== "" && Number.isNaN(birthWeight)) {
      setError("Birth weight must be a valid number.");
      return;
    }
    if (form.current_weight !== "" && Number.isNaN(currentWeight)) {
      setError("Current weight must be a valid number.");
      return;
    }

    const pregnancyId = latestPregnancy?.pregnancy_id || pregnancyInfo?.pregnancy_id || null;

    setSubmitting(true);
    try {
      await api.post("/babies", {
        name: form.name.trim(),
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        birth_weight: birthWeight,
        current_weight: currentWeight,
        blood_group: form.blood_group || null,
        health_status: form.health_status || "Healthy",
        delivery_type: form.delivery_type || null,
        pregnancy_id: pregnancyId,
      });

      // Refresh baby list and switch phase globally
      const r = await api.get("/babies");
      const babyList = r.data || [];
      setBabies(babyList);
      setPhase("postnatal");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add baby. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 560, margin: "0 auto" }}>
      <style>{`
        .add-baby-input { transition: border-color 0.15s, box-shadow 0.15s; }
        .add-baby-input:focus { outline:none; border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .add-baby-card { animation: fadeUp 0.5s ease; }
      `}</style>

      {/* Hero header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 8px", color: "var(--foreground)" }}>
          Congratulations!
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted-foreground)", margin: 0, lineHeight: 1.6 }}>
          Your pregnancy journey is complete. Add your baby's details to unlock<br />personalised baby care features.
        </p>
      </div>

      {/* Form card */}
      <div className="add-baby-card" style={{
        background: "var(--card)", border: "1.5px solid rgba(34,197,94,0.25)",
        borderRadius: 18, padding: "32px 28px",
        boxShadow: "0 4px 24px rgba(34,197,94,0.07)"
      }}>
        {/* Phase transition indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg, rgba(232,121,160,0.08), rgba(34,197,94,0.08))", border: "1px solid rgba(34,197,94,0.15)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>🤰</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#e879a0", textTransform: "uppercase", marginTop: 3 }}>Pregnancy</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, #f9a8c9, #86efac)", borderRadius: 2 }} />
            <span style={{ fontSize: 16 }}>→</span>
            <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, #86efac, #16a34a)", borderRadius: 2 }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>👶</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginTop: 3 }}>Baby Care</div>
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 20px", color: "var(--card-foreground)" }}>
          Baby Details
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            <label style={labelStyle}>Baby's Name *</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              required placeholder="e.g. Aarav, Aanya…"
              className="add-baby-input"
              style={inputStyle}
            />
          </div>

          {/* DOB */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
              max={getTodayStr()}
              className="add-baby-input"
              style={inputStyle}
            />
          </div>

          {/* Gender */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            <label style={labelStyle}>Gender (optional)</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { value: "male",   label: "👦 Boy" },
                { value: "female", label: "👧 Girl" },
                { value: "",       label: "⭕ Skip" },
              ].map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => setForm(p => ({ ...p, gender: opt.value }))}
                  style={{
                    flex: 1, padding: "10px 6px", borderRadius: 9, fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                    border: form.gender === opt.value ? "2px solid #16a34a" : "1.5px solid var(--border)",
                    background: form.gender === opt.value ? "rgba(34,197,94,0.10)" : "var(--row-bg)",
                    color: form.gender === opt.value ? "#15803d" : "var(--muted-foreground)",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Birth Weight (kg)</label>
              <input
                type="number" name="birth_weight" value={form.birth_weight} onChange={handleChange}
                step="0.01" min="0" placeholder="e.g. 3.45"
                className="add-baby-input"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Current Weight (kg)</label>
              <input
                type="number" name="current_weight" value={form.current_weight} onChange={handleChange}
                step="0.01" min="0" placeholder="e.g. 4.00"
                className="add-baby-input"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Blood Group</label>
              <select name="blood_group" value={form.blood_group} onChange={handleChange} style={inputStyle}>
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Delivery Type</label>
              <select name="delivery_type" value={form.delivery_type} onChange={handleChange} style={inputStyle}>
                <option value="">Select delivery type</option>
                <option value="normal">Normal</option>
                <option value="c-section">C-Section</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
            <label style={labelStyle}>Health Status</label>
            <select name="health_status" value={form.health_status} onChange={handleChange} style={inputStyle}>
              <option value="Healthy">Healthy</option>
              <option value="Recovering">Recovering</option>
              <option value="Needs follow-up">Needs follow-up</option>
            </select>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.2)", padding: "10px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit" disabled={submitting}
            style={{
              width: "100%", background: submitting ? "#86efac" : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#fff", border: "none", borderRadius: 10, padding: "13px 22px",
              fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.2s", boxShadow: "0 4px 12px rgba(34,197,94,0.25)"
            }}>
            {submitting ? "Adding baby…" : "🚀 Enter Baby Care Phase"}
          </button>

          <button
            type="button" onClick={() => navigate("/dashboard")}
            style={{ width: "100%", marginTop: 10, background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", padding: "8px" }}>
            Skip for now — I'll add baby details later
          </button>
        </form>
      </div>

      {/* What unlocks */}
      <div style={{ marginTop: 24, padding: "18px 20px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>What unlocks in Baby Care Phase</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: "💉", label: "Vaccination tracking" },
            { icon: "👶", label: "Baby profile & growth" },
            { icon: "🔔", label: "Baby reminders" },
            { icon: "📋", label: "Postnatal care notes" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted-foreground)" }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px"
};
const inputStyle = {
  background: "var(--input-bg, #f3f4f6)", border: "1.5px solid var(--input-border, #eef0f4)",
  borderRadius: 9, padding: "11px 13px", color: "var(--foreground)", fontSize: 14,
  width: "100%", boxSizing: "border-box", fontFamily: "inherit"
};
