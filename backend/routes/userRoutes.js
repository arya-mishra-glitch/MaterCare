const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyToken = require("../middleware/auth");
const { getProfile, updateProfile, updateSettings, uploadProfilePhoto, deleteAccount } = require("../controllers/userController");

// Ensure profiles upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads/profiles");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/settings", verifyToken, updateSettings);
router.post("/profile/photo", verifyToken, upload.single("file"), uploadProfilePhoto);
router.delete("/account", verifyToken, deleteAccount);

module.exports = router;
