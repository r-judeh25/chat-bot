import bcrypt from "bcrypt";
import "dotenv/config.js";
import express from "express";
import { pool } from "./db.js";


// Write helper functions to hash and verify passwords
export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

const app = express();
app.use(express.json());

// Signup - Add user's email and password when they first sign up. Hashed password is only stored. 
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const pwHash = await hashPassword(password);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1,$2,$3) RETURNING id, email, name, created_at`,
      [email, pwHash, name || null]
    );
    res.json({ user: rows[0] });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "email already exists" });
    res.status(500).json({ error: "server error" });
  }
});


// Signin - Verify password when user logs in. 
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const { rows } = await pool.query(
    `SELECT id, email, name, password_hash FROM users WHERE email=$1`,
    [email]
  );
  if (!rows.length) return res.status(401).json({ error: "invalid credentials" });

  const ok = await verifyPassword(password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const { password_hash, ...publicFields } = rows[0];
  res.json({ user: publicFields });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on :${PORT}`));