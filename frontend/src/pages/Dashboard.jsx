import { useState } from "react";
import { FaCalendarAlt, FaSyringe } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { GiMedicines } from "react-icons/gi";
import Appointments from "./Appointments";

function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");

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
        <div>
          <h2 style={{ color: "#6D28D9" }}>MaterCare</h2>

          {navItems.map((item) => (
            <div
              key={item}
              style={{
                padding: "12px",
                margin: "6px 0",
                cursor: "pointer",
                background: activeNav === item ? "#EDE9FE" : "transparent",
                borderRadius: "8px",
                fontWeight: activeNav === item ? "600" : "normal",
                transition: "all 0.2s ease",
              }}
              onClick={() => setActiveNav(item)}
              onMouseEnter={(e) => {
                if (activeNav !== item)
                  e.currentTarget.style.background = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Profile */}
        <div style={styles.profile}>
          <div style={styles.avatar}>AS</div>
          <div>
            <p style={{ margin: 0, fontWeight: "600" }}>Ananya S.</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
              Week 22
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <h2 style={{ marginBottom: "20px" }}>{activeNav}</h2>

        {activeNav === "Dashboard" && (
          <>
            {/* Banner */}
            <div style={styles.banner}>
              <div>
                <h3 style={{ margin: 0 }}>
                  You're in your 2nd trimester
                </h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Baby is the size of a papaya — keep it up!
                </p>
              </div>
              <div style={styles.week}>Week 22</div>
            </div>

            {/* Cards */}
            <div style={styles.cards}>
              {/* Appointments */}
              <div
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => setActiveNav("Appointments")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-6px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0px)")
                }
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Appointments</h4>
                  <FaCalendarAlt color="#7C3AED" />
                </div>
                <h2 style={styles.value}>8</h2>
                <span style={styles.badgeGreen}>+2 this month</span>
              </div>

              {/* Tests */}
              <div
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => setActiveNav("Tests")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-6px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0px)")
                }
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Tests Done</h4>
                  <MdMedicalServices color="#10B981" />
                </div>
                <h2 style={styles.value}>5</h2>
                <span style={styles.badgePurple}>3 remaining</span>
              </div>

              {/* Medications */}
              <div
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => setActiveNav("Medication")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-6px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0px)")
                }
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Medications</h4>
                  <GiMedicines color="#3B82F6" />
                </div>
                <h2 style={styles.value}>3</h2>
                <span style={styles.badgeBlue}>All on track</span>
              </div>

              {/* Vaccinations */}
              <div
                style={{ ...styles.card, cursor: "pointer" }}
                onClick={() => setActiveNav("Vaccination")}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-6px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0px)")
                }
              >
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Vaccinations</h4>
                  <FaSyringe color="#F59E0B" />
                </div>
                <h2 style={styles.value}>2</h2>
                <span style={styles.badgeOrange}>1 due soon</span>
              </div>
            </div>
          </>
        )}

        {/* Other Sections */}
        {activeNav === "Appointments" && <Appointments />}
{activeNav !== "Dashboard" && activeNav !== "Appointments" && (
  <div style={styles.placeholder}>
    <h3>{activeNav} Module</h3>
    <p>This section is under development</p>
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
  },

  sidebar: {
    width: "240px",
    background: "#fafafa",
    padding: "20px",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  main: {
    flex: 1,
    padding: "30px",
    background: "#f1f5f9",
  },

  banner: {
    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    padding: "20px",
    borderRadius: "16px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  week: {
    background: "rgba(255,255,255,0.2)",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "600",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    border: "1px solid #f1f1f1",
    transition: "transform 0.2s ease",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    marginBottom: "6px",
    color: "#555",
    fontSize: "14px",
  },

  value: {
    fontSize: "26px",
    fontWeight: "700",
    margin: "6px 0 12px",
  },

  badgeGreen: {
    background: "#DCFCE7",
    color: "#166534",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
  },

  badgePurple: {
    background: "#EDE9FE",
    color: "#6D28D9",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
  },

  badgeBlue: {
    background: "#DBEAFE",
    color: "#1E40AF",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
  },

  badgeOrange: {
    background: "#FEF3C7",
    color: "#92400E",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#7C3AED",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  placeholder: {
    marginTop: "50px",
    textAlign: "center",
    color: "#555",
  },
};

export default Dashboard;