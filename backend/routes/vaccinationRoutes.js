const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getVaccinations,
  getVaccineCatalogue,
  addVaccination,
  updateVaccination,
  getBabies,
} = require("../controllers/vaccinationController");

// IMPORTANT: /catalogue must come before / to avoid route conflicts
router.get("/catalogue", auth, getVaccineCatalogue); // GET  /api/vaccinations/catalogue
router.get("/",          auth, getVaccinations);     // GET  /api/vaccinations
router.post("/",         auth, addVaccination);      // POST /api/vaccinations
router.put("/:id",       auth, updateVaccination);   // PUT  /api/vaccinations/:id

module.exports = router;
