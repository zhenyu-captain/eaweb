import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const DATA_DIR = path.join(__dirname, 'user_data')

// 用户凭据（简单硬编码，生产环境应使用数据库）
const users = {
  'admin': 'bobchina',
  'bobchina': 'bobchina'
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
    
    if (users[username] && users[username] === password) {
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
