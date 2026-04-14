import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

async function initDatabase() {
  // Connect without selecting a database first
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD || "",
  });

  console.log("Connected to MySQL server.");

  // Create database if it doesn't exist
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`Database "${DB_NAME}" ensured.`);

  await conn.query(`USE \`${DB_NAME}\``);

  // Users
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Table 'users' ensured.");

  // User roles table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_roles (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      role ENUM('patient', 'doctor', 'lab') NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_role (user_id)
    )
  `);
  console.log("Table 'user_roles' ensured.");

  // Profiles table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      avatar_url TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Table 'profiles' ensured.");

  // Appointments table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id VARCHAR(36) PRIMARY KEY,
      patient_id VARCHAR(36) NOT NULL,
      lab_id VARCHAR(36) NOT NULL,
      appointment_date DATETIME NOT NULL,
      test_type VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      notes TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lab_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Table 'appointments' ensured.");

  // Medical tests table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS medical_tests (
      id VARCHAR(36) PRIMARY KEY,
      patient_id VARCHAR(36) NOT NULL,
      lab_id VARCHAR(36) NOT NULL,
      test_name VARCHAR(255) NOT NULL,
      test_type VARCHAR(255) NOT NULL,
      result_value VARCHAR(255) DEFAULT NULL,
      result_unit VARCHAR(100) DEFAULT NULL,
      normal_range VARCHAR(255) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      file_url TEXT DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      test_date DATE NOT NULL DEFAULT (CURRENT_DATE),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lab_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Table 'medical_tests' ensured.");

  // Test notes table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS test_notes (
      id VARCHAR(36) PRIMARY KEY,
      test_id VARCHAR(36) NOT NULL,
      doctor_id VARCHAR(36) NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_id) REFERENCES medical_tests(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log("Table 'test_notes' ensured.");

  console.log("\nAll tables created successfully!");
  await conn.end();
}

initDatabase().catch((err) => {
  console.error("Database init failed:", err);
  process.exit(1);
});
