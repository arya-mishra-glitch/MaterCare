import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MaterCareLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed."); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* Light mode variables */
        .mc-login-right {
          --mc-bg: #f8f9fb;
          --mc-card: #ffffff;
          --mc-card-border: #eef0f4;
          --mc-text: #111827;
          --mc-muted: #6b7280;
          --mc-input-bg: #f3f4f6;
          --mc-input-border: #e5e7eb;
          --mc-toggle-bg: #f3f4f6;
          --mc-toggle-active: #ffffff;
          --mc-social-bg: #ffffff;
          --mc-social-border: #e5e7eb;
          --mc-social-text: #374151;
          --mc-divider: #eef0f4;
          --mc-divider-text: #9ca3af;
          background: var(--mc-bg);
        }

        /* Dark mode: applied when root has data-dark="true" or via CSS class */
        .mc-login-root.dark .mc-login-right {
          --mc-bg: #0f0f0f;
          --mc-card: #1a1a1a;
          --mc-card-border: #333333;
          --mc-text: #ffffff;
          --mc-muted: #9ca3af;
          --mc-input-bg: #2a2a2a;
          --mc-input-border: #444444;
          --mc-toggle-bg: #222222;
          --mc-toggle-active: #333333;
          --mc-social-bg: #2a2a2a;
          --mc-social-border: #444444;
          --mc-social-text: #e5e7eb;
          --mc-divider: #333;
          --mc-divider-text: #6b7280;
          background: var(--mc-bg);
        }

        /* Also respect :root CSS vars from Dashboard if login is embedded */
        @media (prefers-color-scheme: dark) {
          .mc-login-right {
            --mc-bg: #0f0f0f;
            --mc-card: #1a1a1a;
            --mc-card-border: #333333;
            --mc-text: #ffffff;
            --mc-muted: #9ca3af;
            --mc-input-bg: #2a2a2a;
            --mc-input-border: #444444;
            --mc-toggle-bg: #222222;
            --mc-toggle-active: #333333;
            --mc-social-bg: #2a2a2a;
            --mc-social-border: #444444;
            --mc-social-text: #e5e7eb;
            --mc-divider: #333;
            --mc-divider-text: #6b7280;
            background: var(--mc-bg);
          }
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
        .mc-social-btn {
          flex: 1;
          padding: 10px;
          border-radius: 9px;
          border: 1.5px solid var(--mc-social-border);
          background: var(--mc-social-bg);
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--mc-social-text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.15s;
          font-family: inherit;
        }
        .mc-social-btn:hover { opacity: 0.8; }
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

          <div style={{ fontSize: 96, marginBottom: 24, display: "block", animation: "float 4s ease-in-out infinite" }}>🤰</div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, lineHeight: 1.3, marginBottom: 12, fontWeight: 400 }}>
            Caring for You &<br /><em>Your Little One</em>
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, marginBottom: 28 }}>
            Expert guidance, compassionate care, and support throughout your pregnancy journey.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {["🔒 Secure & Private", "👩‍⚕️ Expert Doctors", "💬 24/7 Support", "👶 12,000+ Mothers"].map(p => (
              <span key={p} className="pill">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────── */}
      <div className="mc-login-right" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{
          width: "100%", maxWidth: 400,
          background: "var(--mc-card)",
          borderRadius: 22,
          padding: "36px 36px 32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
          border: "1px solid var(--mc-card-border)",
        }}>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.4px", color: "var(--mc-text)", margin: "0 0 5px" }}>Welcome Back!</h2>
            <p style={{ fontSize: 13.5, color: "var(--mc-muted)", margin: 0 }}>Sign in to your MaterCare account</p>
          </div>

          {/* Tab toggle (cosmetic) */}
          <div style={{ display: "flex", background: "var(--mc-toggle-bg)", borderRadius: 11, padding: 4, marginBottom: 24 }}>
            {["Sign In", "Create Account"].map((tab, i) => (
              <div key={tab} style={{
                flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: 13.5, fontWeight: 500,
                cursor: i === 0 ? "default" : "not-allowed",
                background: i === 0 ? "var(--mc-toggle-active)" : "transparent",
                color: i === 0 ? "var(--mc-text)" : "var(--mc-muted)",
                boxShadow: i === 0 ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
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

          {/* Email */}
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Email</label>
          <input
            type="email" placeholder="Enter your email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKeyDown}
            className="mc-field-input"
          />

          {/* Password */}
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--mc-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 5 }}>Password</label>
          <input
            type="password" placeholder="Enter your password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown}
            className="mc-field-input"
          />

          {/* Options */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, fontSize: 12.5, color: "var(--mc-muted)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "#e879a0" }} /> Remember me
            </label>
            <span style={{ color: "#e879a0", cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className="mc-submit-btn"
            style={{ width: "100%", padding: "13px", borderRadius: 999, border: "none", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", color: "#fff", fontWeight: 600, fontSize: 14.5, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 14px rgba(232,121,160,0.30)", marginBottom: 20 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "var(--mc-divider)" }} />
            <span style={{ fontSize: 12, color: "var(--mc-divider-text)", whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "var(--mc-divider)" }} />
          </div>

          {/* Social */}
          <div style={{ display: "flex", gap: 10 }}>
            {[["G", "Google"], ["🍎", "Apple"]].map(([icon, label]) => (
              <button key={label} className="mc-social-btn">
                <span style={{ fontWeight: 700 }}>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}