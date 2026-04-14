const express   = require("express");
const cors      = require("cors");
const path      = require("path");
require("dotenv").config();

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/test", (req, res) => res.send("MaterCare API is running ✅"));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/user",         require("./routes/userRoutes"));
app.use("/api/dashboard",    require("./routes/dashboardRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/doctors",      require("./routes/doctorRoutes"));
app.use("/api/pregnancy",    require("./routes/pregnancyRoutes"));
app.use("/api",              require("./routes/healthRoutes"));
app.use("/api/documents",    require("./routes/documentRoutes"));
app.use("/api/reminders",    require("./routes/reminderRoutes"));
app.use("/api/symptoms",     require("./routes/symptomRoutes"));

// ── Static uploads ───────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ── Boot ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MaterCare server running on http://localhost:${PORT}`);

  // Boot the SMS notification engine silently in the background
  const { startTask } = require("./cron/reminderCron");
  startTask();
});
