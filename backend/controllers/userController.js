const db = require("../config/db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const pool = db.promise();

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [rows] = await pool.query(
      "SELECT user_id, first_name, last_name, email, phone, profile_photo, blood_group, email_notifications, sms_notifications, created_at FROM user WHERE user_id = ?",
      [userId]
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });

    // Also fetch emergency contact (if any)
    const [contacts] = await pool.query("SELECT * FROM emergency_contact WHERE user_id = ?", [userId]);
    const profile = rows[0];
    profile.emergency_contact = contacts[0] || null;

    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { first_name, last_name, phone, blood_group, emergency_contact } = req.body;
  try {
    await pool.query(
      "UPDATE user SET first_name = ?, last_name = ?, phone = ?, blood_group = ? WHERE user_id = ?",
      [first_name, last_name, phone, blood_group, userId]
    );

    if (emergency_contact) {
      const { name, phone_number, relation, contact_id } = emergency_contact;
      if (contact_id) {
        await pool.query(
          "UPDATE emergency_contact SET name = ?, phone_number = ?, relation = ? WHERE contact_id = ? AND user_id = ?",
          [name, phone_number, relation, contact_id, userId]
        );
      } else {
        await pool.query(
          "INSERT INTO emergency_contact (user_id, name, phone_number, relation) VALUES (?, ?, ?, ?)",
          [userId, name, phone_number, relation]
        );
      }
    }
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: err.message });
  }
};

// PUT /api/user/settings
exports.updateSettings = async (req, res) => {
  const userId = req.user.user_id;
  const { email_notifications, sms_notifications, password } = req.body;
  try {
    if (email_notifications !== undefined || sms_notifications !== undefined) {
      await pool.query(
        "UPDATE user SET email_notifications = COALESCE(?, email_notifications), sms_notifications = COALESCE(?, sms_notifications) WHERE user_id = ?",
        [email_notifications, sms_notifications, userId]
      );
    }
    
    if (password && password.trim() !== "") {
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE user SET password_hash = ? WHERE user_id = ?", [password_hash, userId]);
    }
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update settings", error: err.message });
  }
};

// POST /api/user/profile/photo (using multer)
exports.uploadProfilePhoto = async (req, res) => {
  const userId = req.user.user_id;
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  try {
    const filePath = `/uploads/profiles/${req.file.filename}`;
    await pool.query("UPDATE user SET profile_photo = ? WHERE user_id = ?", [filePath, userId]);
    res.json({ success: true, message: "Profile photo updated", profile_photo: filePath });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
};

// DELETE /api/user/account
exports.deleteAccount = async (req, res) => {
  const userId = req.user.user_id;
  try {
    await pool.query("UPDATE user SET status = 'inactive' WHERE user_id = ?", [userId]);
    res.json({ success: true, message: "Account marked as inactive." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete account", error: err.message });
  }
};
