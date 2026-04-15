const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { getBabies } = require("../controllers/vaccinationController");

router.get("/", auth, getBabies); // GET /api/babies

module.exports = router;
