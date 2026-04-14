import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api";
import { UserIcon } from "../components/SidebarLayout";

export default function Profile() {
  const { profile, setProfile } = useOutletContext();
  const [form, setForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    blood_group: profile.blood_group || "",
    emergency_contact_name: profile.emergency_contact_name || "",
    emergency_contact_phone: profile.emergency_contact_phone || "",
    emergency_contact_relation: profile.emergency_contact_relation || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/user/profile/photo", fd, { headers: { "Content-Type": "multipart/form-data" }});
      setProfile(prev => ({ ...prev, profile_photo: res.data.profile_photo }));
      setMessage({ type: "success", text: "Profile photo updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile photo." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.put("/user/profile", form);
      setProfile(prev => ({ ...prev, ...form }));
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const initials = (profile.first_name?.[0] || "") + (profile.last_name?.[0] || "");

  return (
    <div style={{ color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", margin: "0 0 4px" }}>My Profile</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Manage your personal and medical information</p>
      </div>

      {message.text && (
        <div style={{ background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: message.type === "success" ? "#16a34a" : "#dc2626", border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 500, marginBottom: 20 }}>
          {message.text}
        </div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        
        {/* Profile Header */}
        <div style={{ padding: "30px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 24 }}>
           <div style={{ position: "relative" }}>
             {profile.profile_photo ? (
               <img src={`http://localhost:5000${profile.profile_photo}`} alt="Profile" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary-light)" }} />
             ) : (
               <div style={{ width: 90, height: 90, borderRadius: "50%", background: "linear-gradient(135deg, #f9a8c9, #e879a0)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 28, fontWeight: 700 }}>
                 {initials || "MC"}
               </div>
             )}
             <button onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 32, height: 32, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
               📷
             </button>
             <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" style={{ display: "none" }} />
           </div>
           <div>
             <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{profile.first_name} {profile.last_name}</h2>
             <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: 14 }}>{profile.email}</p>
           </div>
        </div>

        {/* Profile Form */}
        <div style={{ padding: "30px" }}>
           <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>First Name</label>
                   <input type="text" name="first_name" value={form.first_name} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Last Name</label>
                   <input type="text" name="last_name" value={form.last_name} onChange={handleChange} style={inputStyle} required />
                </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Blood Group</label>
                   <select name="blood_group" value={form.blood_group} onChange={handleChange} style={inputStyle}>
                      <option value="">Select</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                   </select>
                </div>
                {/* Email is read only since it's the identifier */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Email Address</label>
                   <input type="email" value={profile.email} disabled style={{...inputStyle, opacity: 0.6, cursor: "not-allowed"}} />
                </div>
             </div>

             <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 10, marginBottom: 0, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Emergency Contact</h3>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Contact Name</label>
                   <input type="text" name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Relation</label>
                   <input type="text" name="emergency_contact_relation" value={form.emergency_contact_relation} onChange={handleChange} style={inputStyle} />
                </div>
             </div>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                   <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Phone Number</label>
                   <input type="tel" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange} style={inputStyle} />
                </div>
             </div>

             <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button type="submit" disabled={loading} style={{ background: "var(--primary)", color: "white", border: "none", padding: "10px 24px", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
             </div>
           </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "var(--input-bg, #f3f4f6)",
  border: "1.5px solid var(--input-border, #eef0f4)",
  padding: "10px 14px",
  borderRadius: 9,
  fontSize: 14,
  color: "var(--foreground, #111827)",
  fontFamily: "inherit",
  outline: "none",
};
