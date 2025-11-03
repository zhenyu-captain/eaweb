<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loginUsername = ref('')
const loginPassword = ref('')
const loginError = ref('')
const serverStatus = ref('checking') // 'checking', 'online', 'offline'
const serverError = ref('')

// 服务器API调用
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3001/api' 
  : '/api'

// 检查服务器状态
const checkServerStatus = async () => {
  try {
    serverStatus.value = 'checking'
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      timeout: 5000
    })
    
    if (response.ok) {
      serverStatus.value = 'online'
      serverError.value = ''
      console.log('✅ 后端服务器连接正常')
    } else {
      serverStatus.value = 'offline'
      serverError.value = `服务器响应错误: ${response.status}`
      console.error('❌ 后端服务器响应错误:', response.status)
    }
  } catch (error) {
    serverStatus.value = 'offline'
    serverError.value = error.message
    console.error('❌ 后端服务器连接失败:', error.message)
  }
}

// 登录验证
const login = async () => {
  if (!loginUsername.value || !loginPassword.value) {
    loginError.value = 'Please enter username and password'
    return
  }
  
  console.log('🔄 开始登录...', { username: loginUsername.value, password: loginPassword.value })
  console.log('API_BASE:', API_BASE)
  
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginUsername.value,
        password: loginPassword.value
      })
    })
    
    console.log('📡 登录响应:', { status: response.status, ok: response.ok })
    
    if (response.ok) {
      const result = await response.json()
      console.log('📄 登录结果:', result)
      
      if (result.success) {
        loginError.value = ''
        // 保存登录状态
        const userData = { username: loginUsername.value }
        localStorage.setItem('quiz-user', JSON.stringify(userData))
        console.log('✅ Login successful, saved to localStorage:', userData)
        console.log('localStorage content:', localStorage.getItem('quiz-user'))
        // 登录成功后跳转到quiz页面
        await router.push('/quiz')
      } else {
        loginError.value = result.message || 'Invalid credentials'
        console.log('❌ 登录失败:', result.message)
      }
    } else {
      loginError.value = 'Login failed. Please try again.'
      console.log('❌ HTTP错误:', response.status)
    }
  } catch (error) {
    loginError.value = 'Network error. Please try again.'
    console.error('❌ 登录错误:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 首先检查服务器状态
  await checkServerStatus()
  
  // 检查是否有保存的登录状态
  const savedUser = localStorage.getItem('quiz-user')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      console.log('✅ 发现保存的登录状态:', userData.username)
      // 如果有保存的登录状态，直接跳转到quiz页面
      router.push('/quiz')
    } catch (error) {
      console.error('Failed to restore login state:', error)
      localStorage.removeItem('quiz-user')
    }
  } else {
    console.log('ℹ️ 没有保存的登录状态，显示登录界面')
  }
  
  // 定期检查服务器状态（每30秒）
  setInterval(checkServerStatus, 30000)
})
</script>

<template>
  <div class="quiz-container">
    <!-- 登录界面 -->
    <div class="login-modal">
      <div class="login-content">
        <div class="login-header">
          <h2>Login Required</h2>
          <p>Please enter your credentials to access the quiz system</p>
        </div>
        <div class="login-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginUsername" 
              placeholder="Enter username"
              @keyup.enter="login"
            >
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginPassword" 
              placeholder="Enter password"
              @keyup.enter="login"
            >
          </div>
          <div class="login-error" v-if="loginError">
            {{ loginError }}
          </div>
          <button class="login-btn" @click="login" :disabled="!loginUsername || !loginPassword">
            Login
          </button>
        </div>
        <div class="login-tips">
          <small>💡 Contact administrator for login credentials</small>
        </div>
        <div class="server-status">
          <span 
            class="status-indicator" 
            :class="{
              'status-checking': serverStatus === 'checking',
              'status-online': serverStatus === 'online',
              'status-offline': serverStatus === 'offline'
            }"
            :title="serverError || '服务器状态'"
          >
            {{ serverStatus === 'checking' ? '🔄' : serverStatus === 'online' ? '✅' : '❌' }}
            {{ serverStatus === 'checking' ? 'Checking' : serverStatus === 'online' ? 'Server Online' : 'Server Offline' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
  overflow: hidden;
}

/* 登录界面样式 */
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.login-content {
  background: white;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.login-header h2 {
  color: #333;
  margin: 0 0 10px 0;
  font-size: 1.8em;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0 0 30px 0;
  font-size: 1em;
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 0.9em;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9em;
  border: 1px solid #f5c6cb;
}

.login-btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.login-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.login-tips {
  margin-top: 20px;
}

.login-tips small {
  color: #6c757d;
  font-size: 0.85em;
}

.server-status {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: 500;
  cursor: help;
  transition: all 0.3s ease;
}

.status-checking {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-online {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-offline {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>

