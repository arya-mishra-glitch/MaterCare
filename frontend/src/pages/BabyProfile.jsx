import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import api from "../api";

export default function BabyProfile() {
  const { babies, setBabies } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeBabyIndex, setActiveBabyIndex] = useState(0);

  useEffect(() => {
    if (babies && babies.length > 0) {
      setActiveBabyIndex(index => Math.min(index, babies.length - 1));
    }
  }, [babies]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) {
      return `${years} yr${years > 1 ? "s" : ""}${months > 0 ? ` ${months} mo` : ""}`;
    }
    if (months > 0) {
      return `${months} mo${months > 1 ? "s" : ""}${days > 0 ? ` ${days} d` : ""}`;
    }
    return `${days} d`;
  };

  const formatWeight = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return `${Number(value).toFixed(2)} kg`;
  };

  // If no babies yet, redirect to add baby
  useEffect(() => {
    if (babies && babies.length === 0) {
      navigate("/baby/add");
    }
  }, [babies, navigate]);

  if (!babies || babies.length === 0) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading baby profile...</div>;
  }

  const baby = babies[activeBabyIndex] || babies[0];
  const ageText = calculateAge(baby?.date_of_birth) || "Unknown";
  const currentWeightText = formatWeight(baby?.current_weight);
  const birthWeightText = formatWeight(baby?.birth_weight);
  const weightGainValue = baby?.current_weight != null && baby?.birth_weight != null ? Number(baby.current_weight) - Number(baby.birth_weight) : null;
  const weightGainText = weightGainValue != null ? `${weightGainValue >= 0 ? "+" : ""}${weightGainValue.toFixed(2)} kg` : "—";
  const bloodGroupText = baby?.blood_group || "—";
  const healthStatusText = baby?.health_status || "Healthy";
  const deliveryTypeText = baby?.delivery_type ? baby.delivery_type.replace("c-section", "C-Section") : "—";

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 1000, margin: "0 auto" }}>
      <style>{`
        .baby-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .baby-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
        .stat-dot { width: 8px; height: 8px; borderRadius: 50%; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      {/* Header Section */}
      <div className="fade-in" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px", margin: "0 0 6px", color: "var(--foreground)" }}>
              Baby Profile
            </h1>
            <p style={{ fontSize: 15, color: "var(--muted-foreground)", margin: 0 }}>
              Manage and view your baby's growth and care details.
            </p>
          </div>
          <button 
            onClick={() => navigate("/baby/add")}
            style={{ background: "var(--row-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--foreground)" }}>
            + Add Another Baby
          </button>
        </div>

        {babies.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
            {babies.map((babyItem, index) => (
              <button
                key={babyItem.baby_id}
                type="button"
                onClick={() => setActiveBabyIndex(index)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: index === activeBabyIndex ? "1px solid #16a34a" : "1px solid var(--border)",
                  background: index === activeBabyIndex ? "rgba(22,163,74,0.12)" : "var(--card)",
                  color: index === activeBabyIndex ? "#166534" : "var(--foreground)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}>
                {babyItem.name || `Baby ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Main Profile Card */}
        <div className="baby-card fade-in" style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ width: 120, height: 120, borderRadius: 40, background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
              {baby.gender === "female" ? "👧" : "👦"}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: -5, background: "#16a34a", color: "white", padding: "4px 10px", borderRadius: 10, fontSize: 11, fontWeight: 800, border: "3px solid var(--card)" }}>
              ACTIVE
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: "var(--card-foreground)" }}>{baby.name}</h2>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", margin: "0 0 24px" }}>
            {baby.date_of_birth ? `Born on ${new Date(baby.date_of_birth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : "Birth date not set"}
          </p>

          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Age", value: ageText },
              { label: "Gender", value: baby.gender ? baby.gender.charAt(0).toUpperCase() + baby.gender.slice(1) : "—" },
              { label: "Current Weight", value: currentWeightText },
            ].map(item => (
              <div key={item.label} style={{ background: "var(--row-bg)", padding: "12px 8px", borderRadius: 16, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)" }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 24 }} />

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Birth Weight</span>
              <span style={{ fontWeight: 600 }}>{birthWeightText}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Blood Group</span>
              <span style={{ fontWeight: 600 }}>{bloodGroupText}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Health Status</span>
              <span style={{ color: healthStatusText === "Healthy" ? "#16a34a" : "var(--foreground)", fontWeight: 700 }}>{healthStatusText}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--muted-foreground)" }}>Delivery Type</span>
              <span style={{ fontWeight: 600 }}>{deliveryTypeText}</span>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Growth Tracker Preview */}
          <div className="baby-card fade-in" style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 24, animationDelay: "0.1s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Growth Summary</h3>
              <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>View History →</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Birth Weight", value: birthWeightText },
                { label: "Current Weight", value: currentWeightText },
                { label: "Weight Gain", value: weightGainText },
                { label: "Age", value: ageText },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 14, background: "var(--row-bg)", border: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "var(--card-foreground)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Vaccination */}
          <div className="baby-card fade-in" style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 24, animationDelay: "0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Vaccinations</h3>
              <span 
                onClick={() => navigate("/vaccination")}
                style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>Open Tracker →</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 12, background: "var(--row-bg)" }}>
                <div style={{ width: 36, height: 36, background: "rgba(232,121,160,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💉</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>DPT Booster</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>Due in 4 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notes */}
          <div className="baby-card fade-in" style={{ background: "var(--card)", borderRadius: 24, border: "1px solid var(--border)", padding: 24, animationDelay: "0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Care Notes</h3>
              <button style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 18, cursor: "pointer", fontWeight: 700 }}>+</button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", padding: "10px 0", border: "1.5px dashed var(--border)", borderRadius: 12 }}>
              No notes for today. Click + to add one.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
