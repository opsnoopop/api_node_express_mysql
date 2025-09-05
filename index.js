import 'dotenv/config'
import express from 'express'
import mysql from 'mysql2/promise'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) // ต้องใช้ก่อน POST

// สร้าง MariaDB pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'container_mysql',
  user: process.env.DB_USER || 'testuser',
  password: process.env.DB_PASSWORD || 'testpass',
  database: process.env.DB_NAME || 'testdb',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ป้องกันปัญหา BigInt -> JSON
  supportBigNumbers: true,
  bigNumberStrings: true,
  // (ถ้าต้องการให้ datetime เป็น string เสมอ)
  // dateStrings: true,
})

// root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World from Node (Express + MySQL)' })
})

// สร้างผู้ใช้ใหม่
app.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body
    if (!username || !email) {
      return res.status(400).json({ error: 'username and email are required' })
    }

    // ใช้ placeholder แบบ ? ของ MySQL/MariaDB
    const [result] = await pool.execute(
      'INSERT INTO users (username, email) VALUES (?, ?)',
      [username, email]
    )

    // MariaDB/MySQL ใช้ insertId แทน RETURNING
    res.status(201).json({
      message: 'User created successfully',
      user_id: result.insertId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// ดึงข้อมูลผู้ใช้ตาม user_id
app.get('/users/:user_id', async (req, res) => {
  const userId = Number(req.params.user_id)
  if (!Number.isInteger(userId)) {
    return res.status(400).json({ error: 'Invalid user_id' })
  }

  try {
    const [rows] = await pool.execute(
      'SELECT user_id, username, email FROM users WHERE user_id = ?',
      [userId]
    )

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.status(200).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
