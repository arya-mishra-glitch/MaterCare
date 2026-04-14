import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import api from "../api";

// ── Icons ───────────────────────────────────────────────────────────────
export const CalendarDays = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
export const TestTubes = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v10l-4 5a2 2 0 001.6 3.2h10.8A2 2 0 0019 17L15 12V2" /><line x1="9" y1="2" x2="15" y2="2" />
  </svg>
);
export const Pill = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4" /><circle cx="17" cy="17" r="5" /><path d="M14.5 17h5" />
  </svg>
);
export const Syringe = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2l4 4-10 10-4-4z" /><path d="M8 16l-4 4" /><path d="M15 6l3 3" /><path d="M10 11l3 3" />
  </svg>
);
export const FileUp = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9,15 12,12 15,15" />
  </svg>
);
export const ClipboardList = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);
export const Baby = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" /><path d="M8 14s-4 1-4 5h16c0-4-4-5-4-5" />
  </svg>
);
export const LayoutGrid = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
export const Moon = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
export const Sun = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);
export const LogOutIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
export const DocIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);
export const SettingsIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);
export const UserIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
export const Bell = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
export const Menu = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
     <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
export const X = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function SidebarLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pregnancyInfo, setPregnancyInfo] = useState(null);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load profile and pregnancy info to show side profile
    api.get("/pregnancy/week").then(r => setPregnancyInfo(r.data)).catch(() => {});
    api.get("/user/profile").then(r => {
      if(r.data?.data) {
        setProfile(r.data.data);
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", Icon: LayoutGrid, path: "/dashboard" },
    { label: "Appointments", Icon: CalendarDays, path: "/appointments" },
    { label: "Symptoms", Icon: ClipboardList, path: "/symptoms" },
    { label: "Tests", Icon: TestTubes, path: "/tests" },
    { label: "Medication", Icon: Pill, path: "/medication" },
    { label: "Vaccination", Icon: Syringe, path: "/vaccination" },
    { label: "Documents", Icon: DocIcon, path: "/documents" },
    { label: "Reminders", Icon: Bell, path: "/reminders" },
    { label: "Profile", Icon: UserIcon, path: "/profile" },
    { label: "Settings", Icon: SettingsIcon, path: "/settings" },
  ];

  const week = pregnancyInfo?.week || 0;
  const userName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "User";
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "MC";
  
  const vars = darkMode
    ? `--bg:#0f0f0f;--card:#1a1a1a;--border:#333333;--foreground:#ffffff;--card-foreground:#ffffff;--muted-foreground:#9ca3af;--muted:#2a2a2a;--primary:#f472b6;--sidebar:#111111;--nav-active-bg:rgba(244,114,182,0.15);--nav-hover:rgba(255,255,255,0.06);--progress-track:#2a2a2a;--row-bg:#222222;--input-bg:#2a2a2a;--input-border:#444444;--primary-light:rgba(244,114,182,0.15);--success-bg:rgba(34,197,94,0.15);--success-text:#4ade80;--warning-bg:rgba(234,179,8,0.15);--warning-text:#fbbf24;--danger-bg:rgba(239,68,68,0.15);--danger-text:#f87171;--purple-bg:rgba(167,139,250,0.15);--purple-text:#a78bfa;`
    : `--bg:#f8f9fb;--card:#ffffff;--border:#eef0f4;--foreground:#111827;--card-foreground:#111827;--muted-foreground:#6b7280;--muted:#f3f4f6;--primary:#e879a0;--sidebar:#ffffff;--nav-active-bg:rgba(232,121,160,0.08);--nav-hover:rgba(0,0,0,0.03);--progress-track:#f3f4f6;--row-bg:#f9fafb;--input-bg:#f3f4f6;--input-border:#eef0f4;--primary-light:rgba(232,121,160,0.10);--success-bg:rgba(34,197,94,0.10);--success-text:#16a34a;--warning-bg:rgba(234,179,8,0.12);--warning-text:#b45309;--danger-bg:rgba(239,68,68,0.08);--danger-text:#dc2626;--purple-bg:rgba(109,40,217,0.09);--purple-text:#6d28d9;`;

  return (
    <div className="layout-container" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        :root { ${vars} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .nav-link { border-radius: 8px; cursor: pointer; transition: background 0.15s; display:flex; align-items:center; gap:10px; padding:9px 12px; margin-bottom:2px; font-size:13.5px; text-decoration: none; }
        .nav-link:hover { background: var(--nav-hover) !important; }
        .nav-link.active { background: var(--nav-active-bg) !important; font-weight:600; color: var(--primary) !important; }
        .mobile-header { display: none; }
        @media(max-width: 768px) {
          .layout-sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transform: translateX(${menuOpen ? "0%" : "-100%"}); transition: transform 0.3s; width: 260px !important; }
          .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; background: var(--card); border-bottom: 1px solid var(--border); }
          .layout-main { flex-direction: column; }
          .layout-main-content { padding: 15px !important; }
        }
      `}</style>

      {/* Overlay for mobile modal */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:99, display: window.innerWidth > 768 ? "none" : "block" }} />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="layout-sidebar" style={{ width: 220, flexShrink: 0, background: "var(--sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px", overflowY: "auto" }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "linear-gradient(135deg,#f9a8c9,#e879a0)", borderRadius: 10, padding: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px", color: "var(--foreground)" }}>MaterCare</span>
          </div>
          <button className="mobile-only" onClick={() => setMenuOpen(false)} style={{ background:"none", border:"none", color:"var(--muted-foreground)", display: window.innerWidth <= 768 ? "block" : "none" }}>
             <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(({ label, Icon, path }) => {
            const active = location.pathname.startsWith(path);
            return (
              <div key={label} className={`nav-link${active ? " active" : ""}`} onClick={() => { navigate(path); setMenuOpen(false); }}
                style={{ color: active ? "var(--primary)" : "var(--muted-foreground)", fontWeight: active ? 600 : 400 }}>
                <Icon size={17} color={active ? "var(--primary)" : "var(--muted-foreground)"} />
                {label}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div>
          <div className="nav-link" onClick={() => setDarkMode(!darkMode)}
            style={{ color: "var(--muted-foreground)", marginBottom: 12 }}>
            {darkMode ? <Sun size={17} color="var(--muted-foreground)" /> : <Moon size={17} color="var(--muted-foreground)" />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 11px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}>
            {profile?.profile_photo ? (
                <img src={`http://localhost:5000${profile.profile_photo}`} alt="dp" style={{ width: 32, height: 32, borderRadius: "50%", objectFit:"cover", flexShrink: 0 }} />
            ) : (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f9a8c9,#e879a0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>
                {initials}
                </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--card-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{userName}</p>
              {week > 0 && <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 500 }}>Week {week}</span>}
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout" style={{ background:"none", border:"none", cursor:"pointer" }}>
              <LogOutIcon size={15} color="var(--muted-foreground)" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <div className="layout-main" style={{ display:"flex", flexDirection:"column", flex: 1, overflow: "hidden", background: "var(--bg)" }}>
        
        {/* Mobile Header */}
        <div className="mobile-header">
           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setMenuOpen(true)} style={{ background:"none", border:"none", color:"var(--foreground)"}}>
                 <Menu />
              </button>
              <span style={{ fontWeight: 700, fontSize: 16 }}>MaterCare</span>
           </div>
           
           <button onClick={() => setNotificationsOpen(!notificationsOpen)} style={{ background:"none", border:"none", color:"var(--primary)", position:"relative" }}>
               <Bell />
               <div style={{ position:"absolute", top:-2, right:-2, width:8, height:8, background:"#ef4444", borderRadius:"50%" }} />
           </button>
        </div>

        <main className="layout-main-content" style={{ flex: 1, overflowY: "auto", padding: "28px 30px" }}>
           <Outlet context={{ pregnancyInfo, profile, setProfile }} />
        </main>
      </div>

      {notificationsOpen && window.innerWidth <= 768 && (
          <div style={{ position:"absolute", top:60, right:20, width:300, background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:15, zIndex:102, boxShadow:"0 5px 15px rgba(0,0,0,0.1)" }}>
              <h4 style={{ margin:"0 0 10px", fontSize:14 }}>Notifications</h4>
              <p style={{ margin:0, fontSize:13, color:"var(--muted-foreground)" }}>Check your Reminders page for details.</p>
          </div>
      )}
    </div>
  );
}
