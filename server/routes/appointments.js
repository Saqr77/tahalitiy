import { Router } from "express";
import { v4 as uuid } from "uuid";
import pool from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

// Get appointments (role-based: patient sees own, lab sees own, doctor sees all)
router.get("/", async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [req.user.id]);
    const role = roles[0]?.role;

    let rows;
    if (role === "patient") {
      [rows] = await pool.query(
        "SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date DESC",
        [req.user.id]
      );
    } else if (role === "lab") {
      [rows] = await pool.query(
        "SELECT * FROM appointments WHERE lab_id = ? ORDER BY appointment_date ASC",
        [req.user.id]
      );
    } else {
      // doctor sees all
      [rows] = await pool.query("SELECT * FROM appointments ORDER BY appointment_date DESC");
    }

    res.json(rows);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Create appointment (patients only)
router.post("/", async (req, res) => {
  try {
    const { lab_id, appointment_date, test_type, notes } = req.body;
    if (!lab_id || !appointment_date || !test_type) {
      return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    }

    const id = uuid();
    await pool.query(
      `INSERT INTO appointments (id, patient_id, lab_id, appointment_date, test_type, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, lab_id, appointment_date, test_type, notes || null]
    );

    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ error: "حدث خطأ أثناء حجز الموعد" });
  }
});

// Update appointment status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "الحالة مطلوبة" });

    await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id]);
    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

export default router;
