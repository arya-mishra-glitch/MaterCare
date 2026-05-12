const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const { getBabies, addBaby } = require("../controllers/vaccinationController");

router.get("/",  auth, getBabies); // GET  /api/babies
router.post("/", auth, addBaby);   // POST /api/babies

module.exports = router;
