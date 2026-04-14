import { Router } from "express";
import pool from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

// Get profiles by user_ids (query param: ?user_ids=id1,id2,...)
router.get("/", async (req, res) => {
  try {
    const { user_ids } = req.query;
    if (user_ids) {
      const ids = user_ids.split(",").filter(Boolean);
      if (ids.length === 0) return res.json([]);
      const placeholders = ids.map(() => "?").join(",");
      const [rows] = await pool.query(
        `SELECT user_id, full_name, phone, avatar_url FROM profiles WHERE user_id IN (${placeholders})`,
        ids
      );
      return res.json(rows);
    }
    // Default: return own profile
    const [rows] = await pool.query(
      "SELECT user_id, full_name, phone, avatar_url FROM profiles WHERE user_id = ?",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get profiles error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Get all labs (for patient booking)
router.get("/labs", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.user_id, p.full_name 
       FROM profiles p 
       JOIN user_roles ur ON ur.user_id = p.user_id 
       WHERE ur.role = 'lab'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get labs error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Get all patients (for lab use)
router.get("/patients", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.user_id, p.full_name 
       FROM profiles p 
       JOIN user_roles ur ON ur.user_id = p.user_id 
       WHERE ur.role = 'patient'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Get patients error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
