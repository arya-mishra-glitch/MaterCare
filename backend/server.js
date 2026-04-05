const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/test", (req, res) => res.send("MaterCare API is running ✅"));

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/pregnancy", require("./routes/pregnancyRoutes"));
app.use("/api", require("./routes/healthRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
// /api/tests, /api/medications, /api/vaccinations

const path = require("path");

app.use("/api/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
