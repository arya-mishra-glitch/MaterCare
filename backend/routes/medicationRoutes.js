const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getMedications,
  getMedicationCatalogue,
  addMedication,
} = require("../controllers/medicationController");

// IMPORTANT: /catalogue must come before / to avoid route conflicts
router.get("/catalogue", auth, getMedicationCatalogue); // GET  /api/medications/catalogue
router.get("/",          auth, getMedications);         // GET  /api/medications
router.post("/",         auth, addMedication);          // POST /api/medications

module.exports = router;
