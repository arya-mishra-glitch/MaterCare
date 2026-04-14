import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import api from "../api";

export default function Settings() {
  const { profile, setProfile } = useOutletContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    email_notifications: profile.email_notifications ?? true,
    sms_notifications: profile.sms_notifications ?? false,
  });

  useEffect(() => {
     setSettings({
        email_notifications: profile.email_notifications ?? true,
        sms_notifications: profile.sms_notifications ?? false,
     });
  }, [profile]);

  const handleToggle = async (key) => {
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    
    try {
      setLoading(true);
      await api.put("/user/settings", { [key]: newValue });
      setProfile(prev => ({ ...prev, [key]: newValue }));
      setMessage({ type: "success", text: "Settings saved successfully." });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch {
      setSettings({ ...settings, [key]: !newValue }); // revert
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = () => {
     // A pseudo-action for a settings page
     localStorage.removeItem("token");
     localStorage.removeItem("user");
     navigate("/");
  };

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Manage your account preferences and notifications</p>
      </div>

      {message.text && (
        <div style={{ background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: message.type === "success" ? "#16a34a" : "#dc2626", border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 500, marginBottom: 20 }}>
          {message.text}
        </div>
      )}

      {/* Notifications */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", marginBottom: 24 }}>
         <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--row-bg)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Notifications</h2>
         </div>
         <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Email Notifications</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>Receive appointment reminders and weekly summaries via email.</p>
               </div>
               <Toggle checked={settings.email_notifications} onChange={() => handleToggle('email_notifications')} disabled={loading} />
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>SMS Notifications</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>Receive urgent alerts and medication reminders via texting.</p>
               </div>
               <Toggle checked={settings.sms_notifications} onChange={() => handleToggle('sms_notifications')} disabled={loading} />
            </div>

         </div>
      </div>

      {/* Account Security */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
         <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", background: "var(--row-bg)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Security & Sessions</h2>
         </div>
         <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Log out everywhere</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>Sign out of all other devices except this one.</p>
               </div>
               <button onClick={handleLogoutAll} style={{ background: "var(--input-bg)", border: "1px solid var(--border)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "var(--foreground)" }}>
                  Log out all
               </button>
            </div>
            
            <div style={{ height: 1, background: "var(--border)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#dc2626" }}>Deactivate Account</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>Permanently delete your account and all data.</p>
               </div>
               <button style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#dc2626" }} onClick={() => alert("Contact support to delete account.")}>
                  Deactivate
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
   return (
      <div 
         onClick={() => !disabled && onChange()} 
         style={{ width: 44, height: 24, borderRadius: 12, background: checked ? "var(--primary)" : "var(--border)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, transition: "background 0.2s" }}
      >
         <div style={{ position: "absolute", top: 2, left: checked ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
   );
}
