import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import testRoutes from "./routes/tests.js";
import noteRoutes from "./routes/notes.js";
import profileRoutes from "./routes/profiles.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(import.meta.dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/profiles", profileRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
