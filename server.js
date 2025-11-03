import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = path.join(__dirname, 'user_data')
const DB_PATH = path.join(__dirname, 'users.db')

// 初始化数据库
function initDatabase() {
  const db = new Database(DB_PATH)
  
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // 迁移旧的硬编码用户到数据库（如果不存在）
  const existingUsers = db.prepare('SELECT username FROM users WHERE username IN (?, ?)').all('admin', 'bobchina')
  const existingUsernames = existingUsers.map(u => u.username)
  
  if (!existingUsernames.includes('admin')) {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'bobchina')
    console.log('已迁移用户: admin')
  }
  
  if (!existingUsernames.includes('bobchina')) {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('bobchina', 'bobchina')
    console.log('已迁移用户: bobchina')
  }
  
  return db
}

// 创建数据库连接
const db = initDatabase()

// 简单的密码哈希函数（生产环境应使用更安全的方法如 bcrypt）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// 确保数据目录存在
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// 获取用户数据文件路径
function getUserDataPath(userId) {
  return path.join(DATA_DIR, `user_${userId}.json`)
}

// 保存用户数据
app.post('/api/save-data', async (req, res) => {
  try {
    const { userId, data } = req.body
    
    if (!userId || !data) {
      return res.status(400).json({ error: '用户ID和数据不能为空' })
    }

    const userDataPath = getUserDataPath(userId)
    const userData = {
      userId,
      lastUpdated: new Date().toISOString(),
      ...data
    }

    await fs.writeFile(userDataPath, JSON.stringify(userData, null, 2), 'utf8')
    
    res.json({ success: true, message: '数据保存成功' })
  } catch (error) {
    console.error('保存数据失败:', error)
    res.status(500).json({ error: '保存数据失败' })
  }
})

// 获取用户数据
app.get('/api/get-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const userDataPath = getUserDataPath(userId)
    
    try {
      const data = await fs.readFile(userDataPath, 'utf8')
      const userData = JSON.parse(data)
      res.json({ success: true, data: userData })
    } catch (fileError) {
      // 文件不存在，返回空数据
      res.json({ 
        success: true, 
        data: {
          userId,
          answers: {},
          notes: {},
          translations: {},
          questionHighlights: {},
          optionHighlights: {}
        }
      })
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    res.status(500).json({ error: '获取数据失败' })
  }
})

// 清空用户数据
app.delete('/api/clear-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const userDataPath = getUserDataPath(userId)
    
    try {
      await fs.unlink(userDataPath)
      res.json({ success: true, message: '数据已清空' })
    } catch (fileError) {
      res.json({ success: true, message: '数据已清空' })
    }
  } catch (error) {
    console.error('清空数据失败:', error)
    res.status(500).json({ error: '清空数据失败' })
  }
})

// 获取所有用户列表（可选，用于管理）
app.get('/api/users', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR)
    const users = files
      .filter(file => file.startsWith('user_') && file.endsWith('.json'))
      .map(file => file.replace('user_', '').replace('.json', ''))
    
    res.json({ success: true, users })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    res.status(500).json({ error: '获取用户列表失败' })
  }
})

// 用户注册
app.post('/api/register', (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      })
    }
    
    // 验证用户名长度和密码长度
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be between 3 and 20 characters' 
      })
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      })
    }
    
    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT username FROM users WHERE username = ?').get(username)
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      })
    }
    
    // 插入新用户（密码先不哈希，直接存储，因为现有用户也是明文）
    // 如果需要，可以改为哈希存储
    const hashedPassword = hashPassword(password)
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword)
    
    res.json({ 
      success: true, 
      message: 'Registration successful',
      username: username
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    })
  }
})

// 登录验证
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      })
    }
    
    // 从数据库查询用户
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      })
    }
    
    // 验证密码（支持旧明文密码和新哈希密码）
    const hashedPassword = hashPassword(password)
    const passwordMatch = user.password === password || user.password === hashedPassword
    
    if (passwordMatch) {
      // 如果密码是明文，更新为哈希
      if (user.password === password) {
        db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?').run(hashedPassword, username)
      }
      
      res.json({ 
        success: true, 
        message: 'Login successful',
        username: username
      })
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 启动服务器
async function startServer() {
  await ensureDataDir()
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`)
    console.log(`数据存储目录: ${DATA_DIR}`)
  })
}

startServer().catch(console.error)
