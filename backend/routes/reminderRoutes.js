const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getReminders, createReminder, markDone, updateReminder, deleteReminder } = require("../controllers/reminderController");

// Use auth middleware for all routes
router.use(auth);

router.get("/", getReminders);
router.post("/", createReminder);
router.put("/:id/done", markDone);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

module.exports = router;
