const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMyPregnancy, createPregnancy, getCurrentWeek, onboardPregnancy, completePregnancy, getPregnancyStatus } = require("../controllers/pregnancyController");

router.get("/",     auth, getMyPregnancy);
router.get("/week", auth, getCurrentWeek);
router.get("/status", auth, getPregnancyStatus);
router.post("/",    auth, createPregnancy);
router.post("/onboard", auth, onboardPregnancy);
router.post("/complete", auth, completePregnancy);

module.exports = router;
