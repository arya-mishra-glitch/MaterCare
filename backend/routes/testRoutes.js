// routes/testRoutes.js
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");

const {
  getTestRecords,
  getTestCatalogue,
  addTestRecord,
} = require("../controllers/testController");

// IMPORTANT: /catalogue must be declared BEFORE /:id style routes
// to avoid Express matching "catalogue" as a dynamic segment.
router.get("/catalogue", auth, getTestCatalogue);  // GET  /api/tests/catalogue
router.get("/",          auth, getTestRecords);     // GET  /api/tests
router.post("/",         auth, addTestRecord);      // POST /api/tests

module.exports = router;
