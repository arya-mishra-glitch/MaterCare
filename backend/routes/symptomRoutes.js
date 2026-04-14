const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getSymptoms, logSymptom } = require("../controllers/symptomController");

// Protective auth middleware
router.use(auth);

router.get("/", getSymptoms);
router.post("/", logSymptom);

module.exports = router;
