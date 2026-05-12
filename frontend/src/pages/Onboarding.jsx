import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Onboarding() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    start_date: "",
    due_date: "",
    blood_group: "",
    emergency_name: "",
    emergency_phone: "",
    emergency_relation: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDueDate = (start) => {
    if (!start) return "";
    // Parse the YYYY-MM-DD string into a local Date object
    const [year, month, day] = start.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    
    // Add 280 days (40 weeks) for estimated due date
    date.setDate(date.getDate() + 280);
    
    // Format back to YYYY-MM-DD in local time
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayStr();

  const [isDueDateManual, setIsDueDateManual] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "start_date") {
      setForm(prev => {
        const next = { ...prev, start_date: value };
        if (!isDueDateManual) {
          next.due_date = calculateDueDate(value);
        }
        return next;
      });
    } else if (name === "due_date") {
      setIsDueDateManual(!!value);
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_date) {
        setError("Last menstrual period (LMP) start date is required.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/pregnancy/onboard", {
        start_date: form.start_date,
        due_date: form.due_date || undefined,
        blood_group: form.blood_group || undefined,
        emergency_contact: (form.emergency_name && form.emergency_phone) ? {
            name: form.emergency_name,
            phone_number: form.emergency_phone,
            relation: form.emergency_relation || undefined
        } : undefined
      });
      // Once onboarded, reload page to hit App.js router logic which will now see pregnancy checked
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to complete onboarding.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg, #f8f9fb)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
       {/* Left side visual */}
       <div style={{ flex: 1, background: "linear-gradient(135deg, #f9a8c9, #e879a0)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px", color: "white", position: "relative", overflow: "hidden" }}>
          
          <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "auto" }}>
            <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 16px", lineHeight: 1.1 }}>Welcome to MaterCare</h1>
            <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
               Let's get started on your pregnancy journey. We need a few details to personalize your experience.
            </p>
          </div>

          {/* Abstract circles */}
          <div style={{ position: "absolute", top: "-10%", right: "-10%", width: 300, height: 300, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: "-5%", left: "-10%", width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
       </div>

       {/* Right side form */}
       <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
         <div style={{ width: "100%", maxWidth: 480, background: "var(--card, #fff)", border: "1px solid var(--border, #eef0f4)", borderRadius: 16, padding: "32px 40px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground, #111827)", margin: "0 0 24px" }}>Pregnancy Profile Setup</h2>
            
            {error && (
               <div style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626", padding: "12px 16px", borderRadius: 8, fontSize: 13.5, fontWeight: 500, marginBottom: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
                 {error}
               </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
               {/* PREGNANCY DATES */}
               <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-foreground, #6b7280)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, borderBottom: "1px solid var(--border, #eef0f4)", paddingBottom: 6 }}>Pregnancy Details</h3>
                  
                  <div style={{ display: "flex", gap: 12 }}>
                     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Last Menstrual Period (LMP) *</label>
                        <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required max={todayStr} style={inputStyle} />
                     </div>
                     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Expected Date of Birth (EDD)</label>
                        <input type="date" name="due_date" value={form.due_date} onChange={handleChange} style={inputStyle} />
                     </div>
                  </div>
               </div>

               {/* HEALTH INFO */}
               <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-foreground, #6b7280)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, borderBottom: "1px solid var(--border, #eef0f4)", paddingBottom: 6 }}>Health Profile</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                     <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Blood Group</label>
                     <select name="blood_group" value={form.blood_group} onChange={handleChange} style={inputStyle}>
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                     </select>
                  </div>
               </div>

               {/* EMERGENCY CONTACT */}
               <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--muted-foreground, #6b7280)", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, borderBottom: "1px solid var(--border, #eef0f4)", paddingBottom: 6 }}>Emergency Contact</h3>
                  
                  <div style={{ display: "flex", gap: 12 }}>
                     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Name</label>
                        <input type="text" name="emergency_name" value={form.emergency_name} onChange={handleChange} placeholder="Full Name" style={inputStyle} />
                     </div>
                     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Relation</label>
                        <input type="text" name="emergency_relation" value={form.emergency_relation} onChange={handleChange} placeholder="e.g. Spouse" style={inputStyle} />
                     </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                     <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground, #111827)" }}>Phone Number</label>
                     <input type="tel" name="emergency_phone" value={form.emergency_phone} onChange={handleChange} placeholder="+1 234 567 8900" style={inputStyle} />
                  </div>
               </div>

               <button type="submit" disabled={loading || !form.start_date} style={{ marginTop: 16, background: "var(--primary, #e879a0)", color: "white", border: "none", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (loading || !form.start_date) ? "not-allowed" : "pointer", opacity: (loading || !form.start_date) ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {loading ? "Saving Profile..." : "Complete Setup"}
               </button>
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
   fontSize: 14,
   color: "var(--foreground, #111827)",
   fontFamily: "inherit",
   outline: "none",
   transition: "border-color 0.15s"
};
