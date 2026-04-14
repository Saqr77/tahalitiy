import { Router } from "express";
import { v4 as uuid } from "uuid";
import pool from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

// Get notes (for specific test IDs or all)
router.get("/", async (req, res) => {
  try {
    const { test_ids } = req.query; // comma-separated
    let rows;
    if (test_ids) {
      const ids = test_ids.split(",").filter(Boolean);
      if (ids.length === 0) return res.json([]);
      const placeholders = ids.map(() => "?").join(",");
      [rows] = await pool.query(
        `SELECT * FROM test_notes WHERE test_id IN (${placeholders}) ORDER BY created_at DESC`,
        ids
      );
    } else {
      [rows] = await pool.query("SELECT * FROM test_notes ORDER BY created_at DESC");
    }
    res.json(rows);
  } catch (err) {
    console.error("Get notes error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Add a note (doctors only)
router.post("/", async (req, res) => {
  try {
    const { test_id, note } = req.body;
    if (!test_id || !note) {
      return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    }

    const id = uuid();
    await pool.query(
      "INSERT INTO test_notes (id, test_id, doctor_id, note) VALUES (?, ?, ?, ?)",
      [id, test_id, req.user.id, note]
    );

    const [rows] = await pool.query("SELECT * FROM test_notes WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Add note error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة الملاحظة" });
  }
});

export default router;
