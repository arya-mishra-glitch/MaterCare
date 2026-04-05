const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getTestRecords, getTestCatalogue, addTestRecord,
  getMedicationRecords, getMedicationCatalogue, addMedicationRecord,
  getVaccinationRecords, getVaccineCatalogue, addVaccinationRecord,
} = require("../controllers/healthController");

// Tests
router.get("/tests",              auth, getTestRecords);
router.get("/tests/catalogue",    auth, getTestCatalogue);
router.post("/tests",             auth, addTestRecord);

// Medications
router.get("/medications",            auth, getMedicationRecords);
router.get("/medications/catalogue",  auth, getMedicationCatalogue);
router.post("/medications",           auth, addMedicationRecord);

// Vaccinations
router.get("/vaccinations",           auth, getVaccinationRecords);
router.get("/vaccinations/catalogue", auth, getVaccineCatalogue);
router.post("/vaccinations",          auth, addVaccinationRecord);

module.exports = router;
