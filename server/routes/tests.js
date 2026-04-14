import { Router } from "express";
import { v4 as uuid } from "uuid";
import multer from "multer";
import path from "path";
import pool from "../db.js";
import { authMiddleware } from "../auth.js";

const router = Router();
router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(import.meta.dirname, "..", "uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuid()}${ext}`);
  },
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("نوع الملف غير مدعوم. يُسمح فقط بـ PDF, JPG, PNG"));
    }
  },
});

// Get medical tests (role-based)
router.get("/", async (req, res) => {
  try {
    const [roles] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [req.user.id]);
    const role = roles[0]?.role;

    let rows;
    if (role === "patient") {
      [rows] = await pool.query(
        "SELECT * FROM medical_tests WHERE patient_id = ? ORDER BY test_date DESC",
        [req.user.id]
      );
    } else if (role === "lab") {
      [rows] = await pool.query(
        "SELECT * FROM medical_tests WHERE lab_id = ? ORDER BY created_at DESC",
        [req.user.id]
      );
    } else {
      // doctor sees all
      [rows] = await pool.query("SELECT * FROM medical_tests ORDER BY test_date DESC");
    }

    res.json(rows);
  } catch (err) {
    console.error("Get tests error:", err);
    res.status(500).json({ error: "حدث خطأ" });
  }
});

// Create medical test (labs only)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { patient_id, test_name, test_type, result_value, result_unit, normal_range, notes, test_date } = req.body;
    if (!patient_id || !test_name || !test_type) {
      return res.status(400).json({ error: "الحقول المطلوبة ناقصة" });
    }

    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const id = uuid();
    const status = result_value ? "completed" : "pending";

    await pool.query(
      `INSERT INTO medical_tests (id, patient_id, lab_id, test_name, test_type, result_value, result_unit, normal_range, status, file_url, notes, test_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        patient_id,
        req.user.id,
        test_name,
        test_type,
        result_value || null,
        result_unit || null,
        normal_range || null,
        status,
        fileUrl,
        notes || null,
        test_date || new Date().toISOString().split("T")[0],
      ]
    );

    const [rows] = await pool.query("SELECT * FROM medical_tests WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Create test error:", err);
    res.status(500).json({ error: err.message || "حدث خطأ أثناء إضافة التحليل" });
  }
});

export default router;
