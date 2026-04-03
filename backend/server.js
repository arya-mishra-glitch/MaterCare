require("dotenv").config(); // 1️⃣ load env

const express = require("express");
const cors = require("cors");
const db = require("./config/db"); // 2️⃣ DB connection

const app = express();

// 3️⃣ middleware
app.use(cors());
app.use(express.json());

// 4️⃣ ROUTES IMPORT (ADD HERE)
const appointmentRoutes = require("./routes/appointmentRoutes");

// 5️⃣ ROUTE USE (ADD HERE)
app.use("/api/appointments", appointmentRoutes);

// 6️⃣ test route
app.get("/", (req, res) => {
  res.send("MaterCare Backend Running");
});

// 7️⃣ start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});