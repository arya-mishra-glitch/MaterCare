const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMyPregnancy, createPregnancy, getCurrentWeek, onboardPregnancy } = require("../controllers/pregnancyController");

router.get("/",     auth, getMyPregnancy);
router.get("/week", auth, getCurrentWeek);
router.post("/",    auth, createPregnancy);
router.post("/onboard", auth, onboardPregnancy);

module.exports = router;
