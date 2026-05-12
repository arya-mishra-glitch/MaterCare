import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api";
import { CalendarDays, TestTubes, Pill, Syringe, ClipboardList, FileUp, Baby, PHASES } from "../components/SidebarLayout";

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
  if (s === "pending")   return { background: "rgba(234,179,8,0.12)", color: "#b45309" };
  if (s === "completed") return { background: "rgba(109,40,217,0.10)", color: "#6d28d9" };
  if (s === "missed")    return { background: "rgba(239,68,68,0.10)", color: "#dc2626" };
  if (s === "cancelled") return { background: "rgba(156,163,175,0.15)", color: "#6b7280" };
  return { background: "rgba(156,163,175,0.15)", color: "#6b7280" };
};

// ── Postnatal Dashboard ──────────────────────────────────────────────────────
function PostnatalDashboard({ profile, babies, navigate }) {
  const [reminders, setReminders] = useState([]);
  const [vaccinations, setVaccinations] = useState({ upcoming: [], completed: [] });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    api.get("/reminders?filter=today").then(r => setReminders(r.data?.data || r.data || [])).catch(() => {});
    api.get("/vaccinations").then(r => setVaccinations(r.data || { upcoming: [], completed: [] })).catch(() => {});
    api.get("/appointments").then(r => setAppointments(r.data || [])).catch(() => {});
    api.get("/dashboard").then(r => setDashData(r.data)).catch(() => {});
  }, []);

  const [dashData, setDashData] = useState(null);

  const handleStaleAppointment = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      const [dr, ar] = await Promise.all([api.get("/dashboard"), api.get("/appointments")]);
      setDashData(dr.data);
      setAppointments(ar.data);
    } catch (err) { console.error("Failed to update appointment:", err); }
  };

  const handleStaleVaccination = async (id, status) => {
    try {
      await api.put(`/vaccinations/${id}`, { status });
      const [dr, vr] = await Promise.all([api.get("/dashboard"), api.get("/vaccinations")]);
      setDashData(dr.data);
      setVaccinations(vr.data);
    } catch (err) { console.error("Failed to update vaccination:", err); }
  };

  const markReminderDone = async (id) => {
    try { await api.put(`/reminders/${id}/done`); setReminders(p => p.filter(r => r.reminder_id !== id)); } catch {}
  };

  const primaryBaby = babies?.[0];

  const statsCards = [
    {
      label: "Upcoming Vaccinations",
      value: String(vaccinations.upcoming.length),
      sub: "Scheduled doses",
      Icon: Syringe, iconBg: "rgba(232,121,160,0.10)", iconColor: "#db2777",
    },
    {
      label: "Vaccinations Given",
      value: String(vaccinations.completed.length),
      sub: "Completed doses",
      Icon: Syringe, iconBg: "rgba(34,197,94,0.12)", iconColor: "#16a34a",
    },
    {
      label: "Next Appointment",
      value: dashData?.appointments?.[0] 
        ? new Date(dashData.appointments[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
        : "—",
      sub: dashData?.appointments?.[0] 
        ? `Dr. ${dashData.appointments[0].doctor || ""}` 
        : "No upcoming",
      Icon: CalendarDays, iconBg: "rgba(234,179,8,0.12)", iconColor: "#b45309",
    },
    {
      label: "Reminders Today",
      value: String(reminders.length),
      sub: "Pending today",
      Icon: ClipboardList, iconBg: "rgba(109,40,217,0.09)", iconColor: "#6d28d9",
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: 0 }}>
            Hello, {profile.first_name || "there"} 👋
          </h1>
          <Badge style={{ background: "rgba(34,197,94,0.12)", color: "#16a34a", border: "1px solid rgba(34,197,94,0.2)" }}>
            👶 Baby Care Phase
          </Badge>
          <button 
            onClick={() => navigate("/onboard")}
            style={{ marginLeft: "auto", background: "var(--primary)", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>+</span> New Pregnancy
          </button>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>
          {primaryBaby ? `Caring for ${primaryBaby.name} — your postnatal journey` : "Your postnatal care journey"}
        </p>
      </div>

      {/* Stale Appointments & Vaccinations Prompt */}
      {(dashData?.staleAppointments?.length > 0 || dashData?.staleVaccinations?.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {dashData?.staleAppointments?.map(appt => (
            <Card key={`stale-appt-${appt.appointment_id}`} style={{ border: "1.5px solid var(--warning-text)", background: "var(--warning-bg)" }}>
              <div style={{ padding: "16px 20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--warning-text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  📅 Did this appointment happen?
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{appt.doctor} at {appt.hospital}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                      {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "completed")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--success-text)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "missed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: "none", color: "var(--muted-foreground)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Missed</button>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "cancelled")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {dashData?.staleVaccinations?.map(v => (
            <Card key={`stale-vacc-${v.vacc_record_id}`} style={{ border: "1.5px solid var(--warning-text)", background: "var(--warning-bg)" }}>
              <div style={{ padding: "16px 20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--warning-text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  💉 Was the vaccination given?
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{v.vaccine_name} for {v.baby_name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                      Scheduled for {new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleStaleVaccination(v.vacc_record_id, "completed")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--success-text)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                    <button onClick={() => handleStaleVaccination(v.vacc_record_id, "missed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: "none", color: "var(--muted-foreground)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Missed</button>
                    <button onClick={() => handleStaleVaccination(v.vacc_record_id, "cancelled")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Baby Profile Card */}
      {primaryBaby && (
        <Card style={{ marginBottom: 18, background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))", borderColor: "rgba(34,197,94,0.2)" }}>
          <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              👶
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 3px", color: "var(--card-foreground)" }}>{primaryBaby.name}</h3>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
                {primaryBaby.date_of_birth
                  ? `Born ${new Date(primaryBaby.date_of_birth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                  : "Baby details recorded"}
                {primaryBaby.gender ? ` · ${primaryBaby.gender}` : ""}
              </p>
            </div>
            <button onClick={() => navigate("/baby")} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              View Profile
            </button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="dashboard-grid-4" style={{ marginBottom: 18 }}>
        {statsCards.map(({ label, value, sub, Icon, iconBg, iconColor }) => (
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

      {/* Upcoming Vaccinations */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ padding: "18px 20px 6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Upcoming Vaccinations</h3>
          <button onClick={() => navigate("/vaccination")} style={{ background: "none", border: "none", fontSize: 13, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>View all →</button>
        </div>
        <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {vaccinations.upcoming.length === 0 ? (
            <div style={{ textAlign: "center", padding: "12px 0", color: "var(--muted-foreground)", fontSize: 13 }}>No upcoming vaccinations scheduled.</div>
          ) : (
            vaccinations.upcoming.slice(0, 3).map(v => (
              <div key={v.vacc_record_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: "var(--row-bg)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(232,121,160,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>💉</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--card-foreground)" }}>{v.vaccine_name}</p>
                  <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>Recommended: {v.recommended_age}</p>
                </div>
                <Badge style={{ background: "rgba(232,121,160,0.10)", color: "#db2777" }}>Scheduled</Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Bottom 2-col */}
      <div className="dashboard-grid-2">
        {/* Today's Reminders */}
        <Card>
          <div style={{ padding: "18px 20px 6px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Today's Reminders</h3>
          </div>
          <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            {reminders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "10px 0", color: "var(--muted-foreground)", fontSize: 13 }}>All caught up for today!</div>
            ) : (
              reminders.slice(0, 3).map(rem => (
                <div key={rem.reminder_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, borderLeft: "4px solid var(--primary)", background: "var(--primary-light)" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{rem.title}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--primary)", fontWeight: 500 }}>{rem.reminder_time?.slice(0,5)}</p>
                  </div>
                  <button onClick={() => markReminderDone(rem.reminder_id)} style={{ padding: "6px 10px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Done</button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions (postnatal) */}
        <Card>
          <div style={{ padding: "18px 20px 6px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Quick Actions</h3>
          </div>
          <div style={{ padding: "12px 20px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Add Vaccination", Icon: Syringe, onClick: () => navigate("/vaccination") },
                { label: "Book Appointment", Icon: CalendarDays, onClick: () => navigate("/appointments") },
                { label: "View Medications", Icon: Pill, onClick: () => navigate("/medication") },
                { label: "Upload Document", Icon: FileUp, onClick: () => navigate("/documents") },
                { label: "New Pregnancy", Icon: Baby, onClick: () => navigate("/onboard") },
              ].map(({ label, Icon, onClick }) => (
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

// ── Pregnancy Dashboard ──────────────────────────────────────────────────────
function PregnancyDashboard({ profile, pregnancyInfo, navigate, phase }) {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ tests: 0, medications: 0 });
  const [dashData, setDashData] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    api.get("/dashboard").then(r => setDashData(r.data)).catch(() => {});
    api.get("/appointments").then(r => setAppointments(r.data)).catch(() => {});
    Promise.all([api.get("/health/tests"), api.get("/health/medications")])
      .then(([t, m]) => setStats({ tests: t.data.length, medications: m.data.length }))
      .catch(() => {});
    api.get("/reminders?filter=today").then(r => {
      setReminders(r.data?.data || r.data || []);
    }).catch(() => {});
  }, []);

  const handleStaleAppointment = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      const [dr, ar] = await Promise.all([api.get("/dashboard"), api.get("/appointments")]);
      setDashData(dr.data);
      setAppointments(ar.data);
    } catch (err) { console.error("Failed to update appointment:", err); }
  };

  const handleStaleVaccination = async (id, status) => {
    try {
      await api.put(`/vaccinations/${id}`, { status });
      const dr = await api.get("/dashboard");
      setDashData(dr.data);
    } catch (err) { console.error("Failed to update vaccination:", err); }
  };

  const markReminderDone = async (id) => {
    try { await api.put(`/reminders/${id}/done`); setReminders(p => p.filter(r => r.reminder_id !== id)); } catch {}
  };

  const week = pregnancyInfo?.week || dashData?.pregnancy?.week || 0;
  const progress = Math.min((week / 40) * 100, 100);
  const trimester = week <= 13 ? "1st Trimester" : week <= 26 ? "2nd Trimester" : "3rd Trimester";
  const summary = dashData?.summary || {};
  const nextAppt = appointments[0];

  const statCards = [
    {
      label: "Next Appointment",
      value: dashData?.appointments?.[0] 
        ? new Date(dashData.appointments[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
        : "—",
      sub: dashData?.appointments?.[0] 
        ? `Dr. ${dashData.appointments[0].doctor || ""}` 
        : "No upcoming",
      Icon: CalendarDays, iconBg: "rgba(232,121,160,0.10)", iconColor: "#db2777",
    },
    {
      label: "Upcoming Tests",
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
      label: "Alerts",
      value: String(summary.alerts ?? 0),
      sub: "Pending reminders",
      Icon: ClipboardList, iconBg: "rgba(109,40,217,0.09)", iconColor: "#6d28d9",
    },
  ];

  const quickActions = [
    { label: "Book Appointment", Icon: CalendarDays, onClick: () => navigate("/appointments") },
    { label: "Upload Document",  Icon: FileUp,       onClick: () => navigate("/documents") },
    { label: "View Medications", Icon: Pill,         onClick: () => navigate("/medication") },
    { label: "Log Symptom",      Icon: ClipboardList,onClick: () => navigate("/symptoms") },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--foreground)", margin: 0 }}>
            Hello, {profile.first_name || "there"} 👋
          </h1>
          {week > 0 && (
            <Badge style={{ background: "rgba(232,121,160,0.10)", color: "var(--primary)", border: "1px solid rgba(232,121,160,0.2)" }}>
              <Baby size={12} color="var(--primary)" /> Week {week}
            </Badge>
          )}
          <Badge style={{ background: "rgba(232,121,160,0.08)", color: "#e879a0", border: "1px solid rgba(232,121,160,0.15)" }}>
            🤰 Pregnancy Phase
          </Badge>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: 0 }}>Welcome back to your pregnancy journey</p>
      </div>

      {/* Stale Appointments Prompt (Pregnancy Phase only shows Appointments) */}
      {dashData?.staleAppointments?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {dashData?.staleAppointments?.map(appt => (
            <Card key={`stale-appt-${appt.appointment_id}`} style={{ border: "1.5px solid var(--warning-text)", background: "var(--warning-bg)" }}>
              <div style={{ padding: "16px 20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--warning-text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  📅 Did this appointment happen?
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{appt.doctor} at {appt.hospital}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                      {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "completed")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--success-text)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Yes</button>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "missed")} style={{ padding: "6px 12px", borderRadius: 6, border: "1.5px solid var(--border)", background: "none", color: "var(--muted-foreground)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Missed</button>
                    <button onClick={() => handleStaleAppointment(appt.appointment_id, "cancelled")} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "var(--danger-bg)", color: "var(--danger-text)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
      <Card style={{ marginBottom: 18, marginTop: 18 }}>
        <div style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", margin: 0 }}>Pregnancy Progress</h3>
            <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Week {week} of 40</span>
          </div>
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
                    {rem.reminder_time?.slice(0, 5)} • {rem.type || "General"}
                  </p>
                </div>
                <button onClick={() => markReminderDone(rem.reminder_id)} style={{ padding: "8px 14px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
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
            {(dashData?.appointments || []).length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)", fontSize: 13 }}>No upcoming events</div>
            )}
            {(dashData?.appointments || []).map((appt, i) => {
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
                      {appt.hospital ? `${appt.hospital} Visit` : `Dr. ${appt.doctor}`}
                    </p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                      {new Date(appt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

// ── Main Dashboard component ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { pregnancyInfo, profile, phase, babies } = useOutletContext();

  return (
    <>
      <style>{`
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .quick-btn { transition: all 0.15s; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:16px 10px; border-radius:10px; border:1px solid var(--border); background:var(--row-bg); cursor:pointer; outline:none; width:100%; }
        .quick-btn:hover { border-color: var(--primary) !important; background: rgba(232,121,160,0.06) !important; }
        .dashboard-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
        .dashboard-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 1024px) { .dashboard-grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .dashboard-grid-4 { grid-template-columns: 1fr; } .dashboard-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* Loading state while phase is being determined */}
      {phase === null ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: "var(--row-bg)", border: "1px solid var(--border)", animation: "pulse 1.5s ease infinite alternate" }} />
          ))}
          <style>{`@keyframes pulse { from { opacity:1; } to { opacity:0.4; } }`}</style>
        </div>
      ) : phase === "postnatal" ? (
        <PostnatalDashboard profile={profile} babies={babies} navigate={navigate} />
      ) : (
        <PregnancyDashboard profile={profile} pregnancyInfo={pregnancyInfo} navigate={navigate} phase={phase} />
      )}
    </>
  );
}