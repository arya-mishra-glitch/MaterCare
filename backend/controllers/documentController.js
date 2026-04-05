const db = require("../config/db");
const path = require("path");
const fs = require("fs");

const pool = db.promise();

/**
 * GET /api/documents
 * Returns all documents for the logged-in user's active pregnancy.
 */
exports.getDocuments = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT d.document_id, d.pregnancy_id, d.file_name, d.file_type, d.file_path, d.upload_date
       FROM document d
       JOIN pregnancy_profile pp ON d.pregnancy_id = pp.pregnancy_id
       WHERE pp.user_id = ?
       ORDER BY d.upload_date DESC`,
      [user_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("❌ getDocuments error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * POST /api/documents
 * Uploads a document (multipart/form-data).
 * Body: pregnancy_id, file_name (optional)
 * File: req.file (handled by multer middleware)
 */
exports.uploadDocument = async (req, res) => {
  const user_id = req.user.user_id;
  const { pregnancy_id, file_name } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  if (!pregnancy_id) {
    return res.status(400).json({ message: "pregnancy_id is required." });
  }

  try {
    // Verify the pregnancy belongs to this user
    const [[pregnancy]] = await pool.query(
      `SELECT pregnancy_id FROM pregnancy_profile WHERE pregnancy_id = ? AND user_id = ?`,
      [pregnancy_id, user_id]
    );
    if (!pregnancy) {
      return res.status(403).json({ message: "Pregnancy not found or access denied." });
    }

    const displayName = file_name || req.file.originalname;
    const filePath = `/uploads/${req.file.filename}`; // relative public URL
    const fileType = req.file.mimetype;

    await pool.query(
      `INSERT INTO document (pregnancy_id, file_name, file_type, file_path, upload_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [pregnancy_id, displayName, fileType, filePath]
    );

    return res.status(201).json({ message: "Document uploaded successfully." });
  } catch (err) {
    console.error("❌ uploadDocument error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};

/**
 * DELETE /api/documents/:id
 * Deletes a document record and its file from disk.
 */
exports.deleteDocument = async (req, res) => {
  const user_id = req.user.user_id;
  const { id } = req.params;

  try {
    // Ensure document belongs to this user
    const [[doc]] = await pool.query(
      `SELECT d.document_id, d.file_path
       FROM document d
       JOIN pregnancy_profile pp ON d.pregnancy_id = pp.pregnancy_id
       WHERE d.document_id = ? AND pp.user_id = ?`,
      [id, user_id]
    );

    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Remove file from disk (best-effort)
    if (doc.file_path) {
      const absPath = path.join(__dirname, "../public", doc.file_path);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    }

    await pool.query(`DELETE FROM document WHERE document_id = ?`, [id]);

    return res.json({ message: "Document deleted." });
  } catch (err) {
    console.error("❌ deleteDocument error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
