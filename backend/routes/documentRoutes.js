const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/auth"); // adjust path if needed

const {
  getDocuments,
  uploadDocument,
  deleteDocument,
} = require("../controllers/documentController");

const fs = require("fs");

// ── Ensure Uploads Directory Exists ──────────────────────────────
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Multer storage config ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|gif|webp|doc|docx|xls|xlsx|csv/;
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

// ── Routes ────────────────────────────────────────────────────────
router.get("/",          verifyToken, getDocuments);
router.post("/",         verifyToken, upload.single("file"), uploadDocument);
router.delete("/:id",    verifyToken, deleteDocument);

module.exports = router;
