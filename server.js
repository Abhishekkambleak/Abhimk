import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "twoTierApp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create table if not exists
(async () => {
  const connection = await pool.getConnection();
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100)
    )
  `);
  connection.release();
})();

// API: Add user
app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;
  const [result] = await pool.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);
  res.json({ message: "User saved!", id: result.insertId });
});

// API: Get users
app.get("/api/users", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users");
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
