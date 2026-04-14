import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api";
import { CalendarDays, TestTubes, Pill, Syringe, ClipboardList, FileUp, Baby } from "../components/SidebarLayout";

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

const statusBadgeStyle = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return { background: "rgba(34,197,94,0.12)", color: "#16a34a" };
  if (s === "scheduled") return { background: "rgba(232,121,160,0.10)", color: "#db2777" };
  if (s === "pending") return { background: "rgba(234,179,8,0.12)", color: "#b45309" };
  if (s === "completed") return { background: "rgba(109,40,217,0.10)", color: "#6d28d9" };
  return { background: "rgba(156,163,175,0.15)", color: "#6b7280" };
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { pregnancyInfo, profile } = useOutletContext();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ tests: 0, medications: 0, vaccinations: 0 });
  const [dashData, setDashData] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    api.get("/dashboard").then(r => setDashData(r.data)).catch(() => {});
    api.get("/appointments").then(r => setAppointments(r.data)).catch(() => {});
    Promise.all([api.get("/health/tests"), api.get("/health/medications"), api.get("/health/vaccinations")])
      .then(([t, m, v]) => setStats({ tests: t.data.length, medications: m.data.length, vaccinations: v.data.length }))
      .catch(() => {});
    api.get("/reminders?filter=today").then(r => {
        if(r.data?.data) {
            setReminders(r.data.data);
        } else {
            setReminders(r.data || []);
        }
    }).catch(() => {});
  };

  const markReminderDone = async (id) => {
    try {
      await api.put(`/reminders/${id}/done`);
      setReminders(prev => prev.filter(r => r.reminder_id !== id));
    } catch {}
  };

  const week = pregnancyInfo?.week || dashData?.pregnancy?.week || 0;
  const progress = Math.min((week / 40) * 100, 100);
  const trimester = week <= 13 ? "1st Trimester" : week <= 26 ? "2nd Trimester" : "3rd Trimester";
  const summary = dashData?.summary || {};
  const nextAppt = appointments[0];

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

  const quickActions = [
    { label: "Book Appointment", Icon: CalendarDays, onClick: () => navigate("/appointments") },
    { label: "Upload Document", Icon: FileUp, onClick: () => navigate("/documents") },
    { label: "View Medications", Icon: Pill, onClick: () => navigate("/medication") },
    { label: "Log Symptom", Icon: ClipboardList, onClick: () => navigate("/symptoms") },
  ];

  return (
    <>
      <style>{`
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .quick-btn { transition: all 0.15s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:16px 10px; border-radius:10px; border:1px solid var(--border); background:var(--row-bg); cursor:pointer; outline:none; width:100%; }
        .quick-btn:hover { border-color: var(--primary) !important; background: rgba(232,121,160,0.06) !important; }
        .dashboard-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
        .dashboard-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 1024px) {
            .dashboard-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
            .dashboard-grid-4 { grid-template-columns: 1fr; }
            .dashboard-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
      
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: "0 0 6px" }}>
          Hello, {profile.first_name || "there"} 👋
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Welcome back to your pregnancy journey</p>
          {week > 0 && (
            <Badge style={{ background: "rgba(232,121,160,0.10)", color: "var(--primary)" }}>
              <Baby size={12} color="var(--primary)" /> Week {week}
            </Badge>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid-4">
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
              <span key={t} style={{ fontSize: 11, color: t === trimester ? "var(--primary)" : "var(--muted-foreground)", fontWeight: t === trimester ? 600 : 400, display: window.innerWidth > 768 ? 'inline' : 'none' }}>{t}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Today's Reminders */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ padding: "18px 20px 6px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Today's Reminders</h3>
        </div>
        <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {reminders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "10px 0", color: "var(--muted-foreground)", fontSize: 13 }}>No pending reminders for today. You're all caught up!</div>
          ) : (
            reminders.map(rem => (
              <div key={rem.reminder_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, borderLeft: "4px solid var(--primary)", background: "var(--primary-light)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>{rem.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>
                    {rem.reminder_time.slice(0, 5)} • {rem.type || "General"}
                  </p>
                </div>
                <button onClick={() => markReminderDone(rem.reminder_id)} style={{ padding: "8px 14px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  Mark Done
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Bottom 2-col */}
      <div className="dashboard-grid-2">
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
  );
}