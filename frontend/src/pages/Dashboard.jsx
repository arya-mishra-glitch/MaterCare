import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt } from "react-icons/fa";
import Appointments from "./Appointments";

function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [appointments, setAppointments] = useState([]);

  // ✅ Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    axios
      .get("http://localhost:5000/api/appointments")
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => console.error(err));
  };

  const navItems = [
    "Dashboard",
    "Appointments",
    "Tests",
    "Medication",
    "Vaccination",
  ];

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={{ color: "#8B5CF6" }}>MaterCare</h2>

        {navItems.map((item) => (
          <div
            key={item}
            style={{
              ...styles.navItem,
              background: activeNav === item ? "#2D2D2D" : "transparent",
            }}
            onClick={() => setActiveNav(item)}
          >
            {item}
          </div>
        ))}

        <div style={styles.profile}>
          <div style={styles.avatar}>AS</div>
          <div>
            <p style={{ margin: 0 }}>Ananya S.</p>
            <small>Week 22</small>
          </div>
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
                <h2>You're in your 2nd trimester</h2>
                <p>Baby is the size of a papaya — keep it up!</p>
              </div>
              <div style={styles.week}>Week 22</div>
            </div>

            {/* Cards */}
            <div style={styles.cards}>
              {/* ✅ APPOINTMENTS CARD (DYNAMIC) */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4>Appointments</h4>
                  <FaCalendarAlt />
                </div>

                <h1>{appointments.length}</h1>
                <p>{appointments.length} total</p>
              </div>

              <div style={styles.card}>
                <h4>Tests</h4>
                <h1>5</h1>
              </div>

              <div style={styles.card}>
                <h4>Medication</h4>
                <h1>3</h1>
              </div>

              <div style={styles.card}>
                <h4>Vaccination</h4>
                <h1>2</h1>
              </div>
            </div>
          </>
        )}

        {/* ✅ APPOINTMENTS PAGE */}
        {activeNav === "Appointments" && (
          <Appointments
            appointments={appointments}                // ✅ PASS DATA
            refreshAppointments={fetchAppointments}    // ✅ PASS FUNCTION
          />
        )}

        {/* Placeholder */}
        {activeNav !== "Dashboard" && activeNav !== "Appointments" && (
          <div style={{ marginTop: "20px" }}>
            <h3>{activeNav} Module</h3>
            <p>Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#121212",
    color: "white",
    fontFamily: "sans-serif",
  },

  sidebar: {
    width: "220px",
    background: "#1E1E1E",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  navItem: {
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },

  main: {
    flex: 1,
    padding: "30px",
  },

  banner: {
    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  week: {
    background: "rgba(255,255,255,0.2)",
    padding: "10px 15px",
    borderRadius: "10px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },

  card: {
    background: "#1E1E1E",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profile: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "auto",
  },

  avatar: {
    background: "#7C3AED",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Dashboard;