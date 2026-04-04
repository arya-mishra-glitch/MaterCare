import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaFlask, FaPills, FaSyringe, FaSignOutAlt } from "react-icons/fa";
import api from "../api";
import Appointments from "./Appointments";
import Tests from "./Tests";

function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const navigate = useNavigate();

  // ✅ Data state
  const [appointments, setAppointments] = useState([]);
  const [pregnancyInfo, setPregnancyInfo] = useState(null);
  const [stats, setStats] = useState({ tests: 0, medications: 0, vaccinations: 0 });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Initials from user name
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "MC";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = () => {
    fetchAppointments();
    fetchPregnancyInfo();
    fetchStats();
  };

  const fetchAppointments = () => {
    api
      .get("/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Appointments error:", err));
  };

  const fetchPregnancyInfo = () => {
    api
      .get("/pregnancy/week")
      .then((res) => setPregnancyInfo(res.data))
      .catch((err) => console.error("Pregnancy info error:", err));
  };

  const fetchStats = () => {
    Promise.all([
      api.get("/health/tests"),
      api.get("/health/medications"),
      api.get("/health/vaccinations"),
    ])
      .then(([testsRes, medsRes, vaccsRes]) => {
        setStats({
          tests: testsRes.data.length,
          medications: medsRes.data.length,
          vaccinations: vaccsRes.data.length,
        });
      })
      .catch((err) => console.error("Stats error:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", icon: "🏠" },
    { label: "Appointments", icon: "📅" },
    { label: "Tests", icon: "🔬" },
    { label: "Medication", icon: "💊" },
    { label: "Vaccination", icon: "💉" },
  ];

  const trimesterLabel = pregnancyInfo
    ? pregnancyInfo.week <= 13
      ? "1st trimester"
      : pregnancyInfo.week <= 26
        ? "2nd trimester"
        : "3rd trimester"
    : "Loading...";

  const babySize = pregnancyInfo
    ? getBabySize(pregnancyInfo.week)
    : "...";

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div>
          <h2 style={{ color: "#8B5CF6", marginBottom: "30px" }}>MaterCare</h2>

          {navItems.map(({ label, icon }) => (
            <div
              key={label}
              style={{
                ...styles.navItem,
                background: activeNav === label ? "#2D2D2D" : "transparent",
                color: activeNav === label ? "#A78BFA" : "#ccc",
              }}
              onClick={() => setActiveNav(label)}
            >
              <span style={{ marginRight: "10px" }}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        <div>
          <div style={styles.profile}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <p style={{ margin: 0, fontWeight: "600" }}>{user.name || "User"}</p>
              {pregnancyInfo && (
                <small style={{ color: "#A78BFA" }}>Week {pregnancyInfo.week}</small>
              )}
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: "8px" }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        {/* DASHBOARD VIEW */}
        {activeNav === "Dashboard" && (
          <>
            {/* Banner */}
            <div style={styles.banner}>
              <div>
                <h2 style={{ margin: 0 }}>You're in your {trimesterLabel}</h2>
                <p style={{ margin: "8px 0 0", opacity: 0.85 }}>
                  Baby is the size of {babySize} — keep it up!
                </p>
              </div>
              {pregnancyInfo && (
                <div style={styles.week}>Week {pregnancyInfo.week}</div>
              )}
            </div>

            {/* Stat Cards */}
            <div style={styles.cards}>
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0 }}>Appointments</h4>
                  <FaCalendarAlt color="#A78BFA" />
                </div>
                <h1 style={styles.statNum}>{appointments.length}</h1>
                <p style={styles.statSub}>{appointments.length} total</p>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0 }}>Tests</h4>
                  <FaFlask color="#34D399" />
                </div>
                <h1 style={styles.statNum}>{stats.tests}</h1>
                <p style={styles.statSub}>{stats.tests} total</p>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0 }}>Medication</h4>
                  <FaPills color="#F59E0B" />
                </div>
                <h1 style={styles.statNum}>{stats.medications}</h1>
                <p style={styles.statSub}>{stats.medications} active</p>
              </div>

              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0 }}>Vaccination</h4>
                  <FaSyringe color="#F87171" />
                </div>
                <h1 style={styles.statNum}>{stats.vaccinations}</h1>
                <p style={styles.statSub}>{stats.vaccinations} total</p>
              </div>
            </div>

            {/* Upcoming appointments preview */}
            {appointments.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ color: "#A78BFA", marginBottom: "12px" }}>
                  Upcoming Appointments
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {appointments.slice(0, 3).map((appt) => (
                    <div key={appt.appointment_id} style={styles.apptRow}>
                      <span style={{ color: "#A78BFA", fontSize: "20px" }}>📅</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: "600" }}>
                          Dr. {appt.doctor_name || appt.doctor_id}
                        </p>
                        <small style={{ color: "#888" }}>
                          {new Date(appt.appointment_date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {appt.hospital_name ? ` · ${appt.hospital_name}` : ""}
                        </small>
                      </div>
                      {appt.notes && (
                        <span style={styles.noteBadge}>{appt.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* APPOINTMENTS PAGE */}
        {activeNav === "Appointments" && (
          <Appointments
            appointments={appointments}
            refreshAppointments={fetchAppointments}
            pregnancy_id={pregnancyInfo?.pregnancy_id}
          />
        )}

        {/* TESTS PAGE */}
        {activeNav === "Tests" && (
          <Tests pregnancyId={pregnancyInfo?.pregnancy_id} />
        )}

        {/* PLACEHOLDER PAGES */}
        {activeNav !== "Dashboard" && activeNav !== "Appointments" && activeNav !== "Tests" && (
          <div style={{ marginTop: "20px" }}>
            <h3>{activeNav} Module</h3>
            <p style={{ color: "#888" }}>Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getBabySize(week) {
  if (week <= 4) return "a poppy seed";
  if (week <= 8) return "a raspberry";
  if (week <= 12) return "a lime";
  if (week <= 16) return "an avocado";
  if (week <= 20) return "a mango";
  if (week <= 24) return "a papaya";
  if (week <= 28) return "an eggplant";
  if (week <= 32) return "a squash";
  if (week <= 36) return "a honeydew melon";
  return "a watermelon";
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#121212",
    color: "white",
    fontFamily: "sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "230px",
    background: "#1A1A1A",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #2D2D2D",
  },
  navItem: {
    padding: "10px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "6px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
  },
  main: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },
  banner: {
    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  week: {
    background: "rgba(255,255,255,0.2)",
    padding: "10px 18px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "16px",
    backdropFilter: "blur(4px)",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginTop: "24px",
  },
  card: {
    background: "#1E1E1E",
    padding: "22px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    border: "1px solid #2A2A2A",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  statNum: {
    fontSize: "42px",
    margin: "4px 0",
    fontWeight: "800",
  },
  statSub: {
    color: "#666",
    margin: 0,
    fontSize: "13px",
  },
  profile: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid #2D2D2D",
    marginBottom: "10px",
  },
  avatar: {
    background: "#7C3AED",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
  },
  logoutBtn: {
    width: "100%",
    padding: "9px",
    background: "transparent",
    border: "1px solid #3D3D3D",
    borderRadius: "8px",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  apptRow: {
    background: "#1E1E1E",
    border: "1px solid #2A2A2A",
    borderRadius: "12px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  noteBadge: {
    marginLeft: "auto",
    background: "#2D2D2D",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    color: "#A78BFA",
  },
};

export default Dashboard;
