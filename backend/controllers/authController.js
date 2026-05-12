const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "matercare_secret_key";

// POST /api/auth/register
exports.register = async (req, res) => {
  const { first_name, last_name, email, password, phone } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO user (first_name, last_name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?, 'patient')
    `;
    db.query(sql, [first_name, last_name, email, password_hash, phone || null], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Email already registered." });
        }
        return res.status(500).json({ message: "Database error.", error: err });
      }

      // Safeguard: if insertId is 0 (misconfigured AUTO_INCREMENT), fetch the actual user_id
      let userId = result.insertId;
      if (!userId || userId === 0) {
        db.query(`SELECT user_id FROM user WHERE email = ? LIMIT 1`, [email], (err2, rows) => {
          if (err2 || rows.length === 0) {
            return res.status(500).json({ message: "User created but failed to retrieve user ID." });
          }
          return res.status(201).json({ message: "Registered successfully.", user_id: rows[0].user_id });
        });
      } else {
        res.status(201).json({ message: "Registered successfully.", user_id: userId });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err });
  }
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const sql = `SELECT * FROM user WHERE email = ? LIMIT 1`;
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error.", error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  });
};
