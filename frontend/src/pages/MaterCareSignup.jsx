import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MaterCareSignup() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSocialLogin = (provider) => {
    alert(`${provider} sign-in would open OAuth popup here in production. Please use the email/password sign in for local development.`);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    const { first_name, last_name, email, password, phone } = formData;
    
    if (!first_name || !last_name || !email || !password) { 
      setError("Please fill in all required fields (First Name, Last Name, Email, Password)."); 
      return; 
    }
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { 
        setError(data.message || "Signup failed."); 
        return; 
      }
      
      // Navigate to login after successful signup
      navigate("/login");
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally { 
      setLoading(false); 
    }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mc-signup-right {
          --mc-bg: #f8f9fb;
          --mc-card: #ffffff;
          --mc-card-border: #eef0f4;
          --mc-text: #111827;
          --mc-muted: #6b7280;
          --mc-input-bg: #f3f4f6;
          --mc-input-border: #e5e7eb;
          --mc-toggle-bg: #f3f4f6;
          --mc-toggle-active: #ffffff;
          background: var(--mc-bg);
        }



        .mc-field-input {
          width: 100%;
          padding: 11px 13px;
          border-radius: 9px;
          border: 1.5px solid var(--mc-input-border);
          background: var(--mc-input-bg);
          color: var(--mc-text);
          font-size: 13.5px;
          margin-bottom: 14px;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .mc-field-input::placeholder { color: var(--mc-muted); }
        .mc-field-input:focus {
          outline: none;
          border-color: #e879a0 !important;
          box-shadow: 0 0 0 3px rgba(232,121,160,0.15);
        }
        .mc-submit-btn { transition: all 0.2s; }
        .mc-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(232,121,160,0.35) !important;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px);
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* ── LEFT PANEL ───────────────────────────────── */}
      <div style={{ flex: 1, background: "linear-gradient(145deg, #f472b6 0%, #a855f7 50%, #818cf8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", right: "-10%", width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "-8%", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        <div style={{ textAlign: "center", color: "#fff", maxWidth: 400, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 12, padding: 9, backdropFilter: "blur(6px)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px" }}>MaterCare</span>
          </div>

          <div style={{ fontSize: 96, marginBottom: 24, display: "block", animation: "float 4s ease-in-out infinite" }}>👶</div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, lineHeight: 1.3, marginBottom: 12, fontWeight: 400 }}>
            Join MaterCare <br /><em>Today</em>
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 28 }}>
            Start your journey with personalized insights and gentle reminders throughout your pregnancy.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["🔒 Secure", "👩‍⚕️ Approved", "💡 Smart Reminders"].map(p => (
              <span key={p} className="pill">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────── */}
      <div className="mc-signup-right" style={{ flex: 1, display: "flex", flexFlow: "column", alignItems: "center", justifyContent: "center", padding: "20px 40px", overflowY: "auto" }}>
        <div style={{
          width: "100%", maxWidth: 440,
          background: "var(--mc-card)",
          borderRadius: 22,
          padding: "36px 36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
          border: "1px solid var(--mc-card-border)",
          margin: "auto"
        }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color: "var(--mc-text)", margin: "0 0 5px" }}>Create Account</h2>
            <p style={{ fontSize: 13.5, color: "var(--mc-muted)", margin: 0 }}>Join the MaterCare community</p>
          </div>

          {/* Tab toggle (cosmetic) */}
          <div style={{ display: "flex", background: "var(--mc-toggle-bg)", borderRadius: 11, padding: 4, marginBottom: 24 }}>
            {["Sign In", "Create Account"].map((tab, i) => (
              <div key={tab} 
                onClick={() => i === 0 ? navigate("/login") : null}
                style={{
                  flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                  cursor: i === 0 ? "pointer" : "default",
                  background: i === 1 ? "var(--mc-toggle-active)" : "transparent",
                  color: i === 1 ? "var(--mc-text)" : "var(--mc-muted)",
                  boxShadow: i === 1 ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                }}>
                {tab}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.10)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 9, padding: "9px 13px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>First Name *</label>
              <input type="text" name="first_name" placeholder="Priya" value={formData.first_name} onChange={handleChange} onKeyDown={handleKeyDown} className="mc-field-input" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Last Name *</label>
              <input type="text" name="last_name" placeholder="Sharma" value={formData.last_name} onChange={handleChange} onKeyDown={handleKeyDown} className="mc-field-input" />
            </div>
          </div>

          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Email *</label>
          <input type="email" name="email" placeholder="priya@example.com" value={formData.email} onChange={handleChange} onKeyDown={handleKeyDown} className="mc-field-input" />

          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Phone (Optional)</label>
          <input type="tel" name="phone" placeholder="Your phone number" value={formData.phone} onChange={handleChange} onKeyDown={handleKeyDown} className="mc-field-input" />

          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Password *</label>
          <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} onKeyDown={handleKeyDown} className="mc-field-input" />

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className="mc-submit-btn"
            style={{ width: "100%", padding: "13px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14.5, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(232,121,160,0.30)", marginTop: 10 }}>
            {loading ? "Creating Account…" : "Create Account"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--mc-card-border)" }} />
            <span style={{ fontSize: 12, color: "var(--mc-muted)", whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--mc-card-border)" }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 10 }}>
            {[["G", "Google"], ["🍎", "Apple"]].map(([icon, label]) => (
              <button 
                key={label} 
                className="mc-social-btn" 
                onClick={() => handleSocialLogin(label)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid var(--mc-card-border)", 
                  background: "var(--mc-card)", cursor: "pointer", fontSize: 13, fontWeight: 500, 
                  color: "var(--mc-text)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 
                }}
              >
                <span style={{ fontWeight: 700 }}>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
