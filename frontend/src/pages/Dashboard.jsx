import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Appointments from "./Appointments";
import Tests from "./Tests";
import Medication from "./Medication";
import Vaccination from "./Vaccination";
import Documents from "./Documents";

// ── Inline SVG icons (matches lucide style from reference) ────────────────
const CalendarDays = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TestTubes = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 2v10l-4 5a2 2 0 001.6 3.2h10.8A2 2 0 0019 17L15 12V2" /><line x1="9" y1="2" x2="15" y2="2" />
  </svg>
);
const Pill = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v4" /><circle cx="17" cy="17" r="5" /><path d="M14.5 17h5" />
  </svg>
);
const Syringe = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2l4 4-10 10-4-4z" /><path d="M8 16l-4 4" /><path d="M15 6l3 3" /><path d="M10 11l3 3" />
  </svg>
);
const FileUp = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9,15 12,12 15,15" />
  </svg>
);
const ClipboardList = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);
const Baby = ({ size = 13, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" /><path d="M8 14s-4 1-4 5h16c0-4-4-5-4-5" />
  </svg>
);
const LayoutGrid = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const Moon = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);
const Sun = ({ size = 17, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
  </svg>
);
const LogOut = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const DocIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" />
  </svg>
);

// ── Tiny reusable components ──────────────────────────────────────────────
const Badge = ({ children, style = {} }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", ...style }}>
    {children}
  </span>
);

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>
    {children}
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────
const statusBadgeStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return { background: "rgba(34,197,94,0.12)", color: "#16a34a" };
  if (s === "scheduled") return { background: "rgba(232,121,160,0.10)", color: "#db2777" };
  if (s === "pending") return { background: "rgba(234,179,8,0.12)", color: "#b45309" };
  if (s === "completed") return { background: "rgba(109,40,217,0.10)", color: "#6d28d9" };
  return { background: "rgba(156,163,175,0.15)", color: "#6b7280" };
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [pregnancyInfo, setPregnancyInfo] = useState(null);
  const [stats, setStats] = useState({ tests: 0, medications: 0, vaccinations: 0 });
  const [dashData, setDashData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "MC";

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    api.get("/dashboard")
      .then(r => { setDashData(r.data); if (r.data.pregnancy) setPregnancyInfo(r.data.pregnancy); })
      .catch(() => api.get("/pregnancy/week").then(r => setPregnancyInfo(r.data)).catch(() => { }));
    api.get("/appointments").then(r => setAppointments(r.data)).catch(() => { });
    Promise.all([api.get("/health/tests"), api.get("/health/medications"), api.get("/health/vaccinations")])
      .then(([t, m, v]) => setStats({ tests: t.data.length, medications: m.data.length, vaccinations: v.data.length }))
      .catch(() => { });
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/"); };

  const week = pregnancyInfo?.week || dashData?.pregnancy?.week || 0;
  const progress = Math.min((week / 40) * 100, 100);
  const trimester = week <= 13 ? "1st Trimester" : week <= 26 ? "2nd Trimester" : "3rd Trimester";
  const summary = dashData?.summary || {};
  const nextAppt = appointments[0];

  // ── Nav ──────────────────────────────────────────────────────────────
  const navItems = [
    { label: "Dashboard", Icon: LayoutGrid },
    { label: "Appointments", Icon: CalendarDays },
    { label: "Tests", Icon: TestTubes },
    { label: "Medication", Icon: Pill },
    { label: "Vaccination", Icon: Syringe },
    { label: "Documents", Icon: DocIcon },
  ];

  // ── Stat cards data ───────────────────────────────────────────────────
  const statCards = [
    {
      label: "Next Appointment",
      value: nextAppt ? new Date(nextAppt.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
      sub: nextAppt ? `Dr. ${nextAppt.doctor_name || nextAppt.doctor_id} — ${nextAppt.specialization || "OB-GYN"}` : "No upcoming",
      Icon: CalendarDays, iconBg: "rgba(232,121,160,0.10)", iconColor: "#db2777",
    },
    {
      label: "Upcoming Test",
      value: String(stats.tests),
      sub: "Pending test records",
      Icon: TestTubes, iconBg: "rgba(234,179,8,0.12)", iconColor: "#b45309",
    },
    {
      label: "Active Medications",
      value: String(summary.medications ?? stats.medications),
      sub: "Active prescriptions",
      Icon: Pill, iconBg: "rgba(34,197,94,0.12)", iconColor: "#16a34a",
    },
    {
      label: "Vaccinations",
      value: String(stats.vaccinations),
      sub: "Total vaccinations",
      Icon: Syringe, iconBg: "rgba(239,68,68,0.10)", iconColor: "#dc2626",
    },
  ];

  // ── Quick actions ─────────────────────────────────────────────────────
  const quickActions = [
    { label: "Book Appointment", Icon: CalendarDays, onClick: () => setActiveNav("Appointments") },
    { label: "Upload Document", Icon: FileUp, onClick: () => setActiveNav("Documents") },
    { label: "View Medications", Icon: Pill, onClick: () => setActiveNav("Medication") },
    { label: "Log Symptom", Icon: ClipboardList, onClick: () => { } },
  ];

  // ── CSS variables (light / dark) ──────────────────────────────────────
  const vars = darkMode
    ? `--bg:#0f0f0f;--card:#1a1a1a;--border:#333333;--foreground:#ffffff;--card-foreground:#ffffff;--muted-foreground:#9ca3af;--muted:#2a2a2a;--primary:#f472b6;--sidebar:#111111;--nav-active-bg:rgba(244,114,182,0.15);--nav-hover:rgba(255,255,255,0.06);--progress-track:#2a2a2a;--row-bg:#222222;--input-bg:#2a2a2a;--input-border:#444444;--primary-light:rgba(244,114,182,0.15);--success-bg:rgba(34,197,94,0.15);--success-text:#4ade80;--warning-bg:rgba(234,179,8,0.15);--warning-text:#fbbf24;--danger-bg:rgba(239,68,68,0.15);--danger-text:#f87171;--purple-bg:rgba(167,139,250,0.15);--purple-text:#a78bfa;`
    : `--bg:#f8f9fb;--card:#ffffff;--border:#eef0f4;--foreground:#111827;--card-foreground:#111827;--muted-foreground:#6b7280;--muted:#f3f4f6;--primary:#e879a0;--sidebar:#ffffff;--nav-active-bg:rgba(232,121,160,0.08);--nav-hover:rgba(0,0,0,0.03);--progress-track:#f3f4f6;--row-bg:#f9fafb;--input-bg:#f3f4f6;--input-border:#eef0f4;--primary-light:rgba(232,121,160,0.10);--success-bg:rgba(34,197,94,0.10);--success-text:#16a34a;--warning-bg:rgba(234,179,8,0.12);--warning-text:#b45309;--danger-bg:rgba(239,68,68,0.08);--danger-text:#dc2626;--purple-bg:rgba(109,40,217,0.09);--purple-text:#6d28d9;`;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)", color: "var(--foreground)", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        :root { ${vars} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        .nav-link { border-radius: 8px; cursor: pointer; transition: background 0.15s; display:flex; align-items:center; gap:10px; padding:9px 12px; margin-bottom:2px; font-size:13.5px; }
        .nav-link:hover { background: var(--nav-hover) !important; }
        .nav-link.active { background: var(--nav-active-bg) !important; font-weight:600; color: var(--primary) !important; }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .quick-btn { transition: all 0.15s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:16px 10px; border-radius:10px; border:1px solid var(--border); background:var(--row-bg); cursor:pointer; outline:none; width:100%; }
        .quick-btn:hover { border-color: var(--primary) !important; background: rgba(232,121,160,0.06) !important; }
        .logout-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:6px; display:flex; align-items:center; transition:background 0.15s; }
        .logout-btn:hover { background: var(--muted) !important; }
      `}</style>

      {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
      <aside style={{ width: 220, flexShrink: 0, background: "var(--sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px", overflowY: "auto" }}>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 22px" }}>
          <div style={{ background: "linear-gradient(135deg,#f9a8c9,#e879a0)", borderRadius: 10, padding: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px", color: "var(--foreground)" }}>MaterCare</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(({ label, Icon }) => {
            const active = activeNav === label;
            return (
              <div key={label} className={`nav-link${active ? " active" : ""}`} onClick={() => setActiveNav(label)}
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
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f9a8c9,#e879a0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "var(--card-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{user.name || "User"}</p>
              {week > 0 && <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 500 }}>Week {week}</span>}
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={15} color="var(--muted-foreground)" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 30px", background: "var(--bg)" }}>

        {/* ── DASHBOARD ──────────────────────────────────────────────── */}
        {activeNav === "Dashboard" && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 6px" }}>
                Hello, {user.name?.split(" ")[0] || "there"} 👋
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Welcome back to your pregnancy journey</p>
                {week > 0 && (
                  <Badge style={{ background: "rgba(232,121,160,0.10)", color: "var(--primary)" }}>
                    <Baby size={12} color="var(--primary)" /> Week {week}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stat Cards — 4 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
              {statCards.map(({ label, value, sub, Icon, iconBg, iconColor }) => (
                <Card key={label} className="stat-card">
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div>
                        <p style={{ fontSize: 10.5, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 6px" }}>{label}</p>
                        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--card-foreground)", margin: "0 0 4px" }}>{value}</p>
                        <p style={{ fontSize: 11.5, color: "var(--muted-foreground)", margin: 0 }}>{sub}</p>
                      </div>
                      <div style={{ background: iconBg, borderRadius: 9, padding: 8, flexShrink: 0 }}>
                        <Icon size={18} color={iconColor} />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pregnancy Progress */}
            <Card style={{ marginBottom: 18 }}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Pregnancy Progress</h3>
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Week {week} of 40</span>
                </div>
                {/* Track */}
                <div style={{ background: "var(--progress-track)", borderRadius: 999, height: 10, marginBottom: 10, position: "relative", overflow: "visible" }}>
                  <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg,#f9a8c9,#e879a0)", borderRadius: 999, position: "relative", transition: "width 1s ease" }}>
                    <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, background: "#e879a0", borderRadius: "50%", border: "2px solid white", boxShadow: "0 0 0 2px #e879a0" }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  {["1st Trimester", "2nd Trimester", "3rd Trimester"].map(t => (
                    <span key={t} style={{ fontSize: 11, color: t === trimester ? "var(--primary)" : "var(--muted-foreground)", fontWeight: t === trimester ? 600 : 400 }}>{t}</span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Bottom 2-col */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Upcoming Events */}
              <Card>
                <div style={{ padding: "18px 20px 6px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Upcoming Events</h3>
                </div>
                <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {appointments.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)", fontSize: 13 }}>No upcoming events</div>
                  )}
                  {appointments.slice(0, 3).map((appt, i) => {
                    const palette = [
                      { bg: "rgba(232,121,160,0.10)", color: "#db2777", I: CalendarDays },
                      { bg: "rgba(234,179,8,0.12)", color: "#b45309", I: TestTubes },
                      { bg: "rgba(239,68,68,0.10)", color: "#dc2626", I: Syringe },
                    ][i % 3];
                    return (
                      <div key={appt.appointment_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--row-bg)" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 9, background: palette.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <palette.I size={15} color={palette.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--card-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {appt.hospital_name ? `${appt.hospital_name} Visit` : `Dr. ${appt.doctor_name || appt.doctor_id}`}
                          </p>
                          <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                            {new Date(appt.appointment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <Badge style={statusBadgeStyle(appt.status)}>
                          {appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : "Scheduled"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <div style={{ padding: "18px 20px 6px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Quick Actions</h3>
                </div>
                <div style={{ padding: "12px 20px 20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {quickActions.map(({ label, Icon, onClick }) => (
                      <button key={label} className="quick-btn" onClick={onClick}>
                        <Icon size={19} color="var(--primary)" />
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeNav === "Appointments" && (
          <Appointments appointments={appointments} refreshAppointments={() => api.get("/appointments").then(r => setAppointments(r.data))} pregnancy_id={pregnancyInfo?.pregnancy_id} />
        )}
        {activeNav === "Tests" && <Tests pregnancyId={pregnancyInfo?.pregnancy_id} />}
        {activeNav === "Medication" && <Medication pregnancyId={pregnancyInfo?.pregnancy_id} />}
        {activeNav === "Vaccination" && <Vaccination />}
        {activeNav === "Documents" && <Documents pregnancyId={pregnancyInfo?.pregnancy_id} />}
      </main>
    </div>
  );
}