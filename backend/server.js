require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */

// ✅ Appointments (already working)
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

// ✅ 🔥 LOGIN ROUTE (NEW - SAFE)
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // 🔹 SIMPLE TEMP LOGIN (no DB yet)
  if (email === "test@gmail.com" && password === "123456") {
    return res.json({ message: "Login success" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("MaterCare Backend Running");
});

/* ================= START SERVER ================= */

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});