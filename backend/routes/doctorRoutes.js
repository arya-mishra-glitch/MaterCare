// routes/doctorRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getDoctors, getDoctorAvailability } = require("../controllers/doctorController");

router.get("/",                  auth, getDoctors);
router.get("/:id/availability",  auth, getDoctorAvailability);

module.exports = router;
