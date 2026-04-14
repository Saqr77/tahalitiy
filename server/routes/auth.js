import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import pool from "../db.js";
import { signToken, authMiddleware } from "../auth.js";

const router = Router();

// Sign up
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }
    if (!["patient", "doctor", "lab"].includes(role)) {
      return res.status(400).json({ error: "نوع الحساب غير صالح" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    // Check if email already exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    }

    const userId = uuid();
    const passwordHash = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Create user
      await conn.query(
        "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
        [userId, email, passwordHash, fullName]
      );

      // Create role
      await conn.query(
        "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)",
        [uuid(), userId, role]
      );

      // Create profile
      await conn.query(
        "INSERT INTO profiles (id, user_id, full_name) VALUES (?, ?, ?)",
        [uuid(), userId, fullName]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.json({ message: "تم إنشاء الحساب بنجاح" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message || "حدث خطأ أثناء إنشاء الحساب" });
  }
});

// Sign in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // Get role
    const [roles] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [user.id]);
    const role = roles.length > 0 ? roles[0].role : null;

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name },
      role,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء تسجيل الدخول" });
  }
});

// Get current user + role
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id, email, full_name, created_at FROM users WHERE id = ?", [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: "المستخدم غير موجود" });

    const [roles] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [req.user.id]);
    const role = roles.length > 0 ? roles[0].role : null;

    res.json({ user: users[0], role });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
