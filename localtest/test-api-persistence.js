// 测试通过API注册和登录的数据持久化
const API_BASE = process.env.API_BASE || 'http://localhost:3001/api'

// 测试结果统计
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
}

function logTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message })
  if (passed) {
    testResults.passed++
    console.log(`✅ ${name}`)
    if (message) console.log(`   ${message}`)
  } else {
    testResults.failed++
    console.log(`❌ ${name}`)
    if (message) console.log(`   ${message}`)
  }
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (response.ok) {
      const data = await response.json()
      return { success: true, data }
    }
    return { success: false, message: `HTTP ${response.status}` }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

async function registerUser(username, password) {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    return {
      success: response.ok && data.success,
      status: response.status,
      data,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function loginUser(username, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()
    return {
      success: response.ok && data.success,
      status: response.status,
      data,
      message: data.message
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

async function testAPIPersistence() {
  console.log('🧪 开始测试API数据持久化...\n')
  console.log(`🌐 API地址: ${API_BASE}\n`)

  // 测试0: 检查服务器健康状态
  console.log('🏥 测试0: 检查服务器健康状态...')
  const healthCheck = await checkServerHealth()
  if (healthCheck.success) {
    logTest('服务器在线', true, 
      `时间戳: ${healthCheck.data.timestamp}`)
  } else {
    logTest('服务器在线', false, healthCheck.message)
    console.log('\n❌ 服务器未运行，请先启动服务器: npm run dev:server')
    process.exit(1)
  }
  console.log()

  // 生成符合3-20字符限制的测试用户名
  // 使用时间戳后6位确保唯一性
  const timestamp = Date.now().toString()
  const testUsername = `test_${timestamp.slice(-6)}` // 例如: test_459298 (11字符)
  const testPassword = 'testpass123'
  
  console.log(`📝 测试用户名: ${testUsername} (长度: ${testUsername.length})`)
  console.log()

  try {
    // 测试1: 注册新用户
    console.log('📝 测试1: 通过API注册新用户...')
    const registerResult = await registerUser(testUsername, testPassword)
    
    if (registerResult.success) {
      logTest('用户注册成功', true, 
        `用户名: ${testUsername}, 消息: ${registerResult.message}`)
    } else {
      logTest('用户注册成功', false, 
        `状态: ${registerResult.status}, 消息: ${registerResult.message}`)
    }
    console.log()

    // 测试2: 验证注册后可以立即登录
    console.log('🔐 测试2: 验证注册后可以立即登录...')
    const loginResult1 = await loginUser(testUsername, testPassword)
    
    if (loginResult1.success) {
      logTest('注册后登录成功', true, 
        `消息: ${loginResult1.message}`)
    } else {
      logTest('注册后登录成功', false, 
        `状态: ${loginResult1.status}, 消息: ${loginResult1.message}`)
    }
    console.log()

    // 测试3: 测试数据持久化 - 等待一段时间后再次登录
    console.log('💾 测试3: 测试数据持久化（等待后再次登录）...')
    console.log('   等待2秒...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const loginResult2 = await loginUser(testUsername, testPassword)
    
    if (loginResult2.success) {
      logTest('持久化后登录成功', true, 
        `数据已持久化，用户信息仍有效`)
    } else {
      logTest('持久化后登录成功', false, 
        `状态: ${loginResult2.status}, 消息: ${loginResult2.message}`)
    }
    console.log()

    // 测试4: 测试用户名唯一性（尝试注册相同用户名）
    console.log('🚫 测试4: 测试用户名唯一性约束...')
    const duplicateRegister = await registerUser(testUsername, 'differentpassword')
    
    if (duplicateRegister.status === 409 && !duplicateRegister.success) {
      logTest('用户名唯一性约束', true, 
        `重复注册被正确拒绝: ${duplicateRegister.message}`)
    } else {
      logTest('用户名唯一性约束', false, 
        `应该拒绝但状态为: ${duplicateRegister.status}`)
    }
    console.log()

    // 测试5: 测试错误密码登录失败
    console.log('🔒 测试5: 测试错误密码登录...')
    const wrongPasswordLogin = await loginUser(testUsername, 'wrongpassword')
    
    if (!wrongPasswordLogin.success && wrongPasswordLogin.status === 401) {
      logTest('错误密码被拒绝', true, 
        `安全验证通过: ${wrongPasswordLogin.message}`)
    } else {
      logTest('错误密码被拒绝', false, 
        `应该拒绝但状态为: ${wrongPasswordLogin.status}`)
    }
    console.log()

    // 测试6: 测试不存在的用户登录
    console.log('👤 测试6: 测试不存在的用户登录...')
    const nonexistentLogin = await loginUser('nonexistent999', 'anypassword')
    
    if (!nonexistentLogin.success && nonexistentLogin.status === 401) {
      logTest('不存在用户被拒绝', true, 
        `安全验证通过: ${nonexistentLogin.message}`)
    } else {
      logTest('不存在用户被拒绝', false, 
        `应该拒绝但状态为: ${nonexistentLogin.status}`)
    }
    console.log()

    // 测试7: 测试注册验证规则（用户名长度）
    console.log('📏 测试7: 测试注册验证规则...')
    
    // 测试用户名太短
    const shortUsername = await registerUser('ab', 'validpass123')
    if (shortUsername.status === 400 && !shortUsername.success) {
      logTest('用户名长度验证（太短）', true, 
        `短用户名被拒绝: ${shortUsername.message}`)
    } else {
      logTest('用户名长度验证（太短）', false, 
        `应该拒绝但状态为: ${shortUsername.status}`)
    }
    
    // 测试密码太短
    const shortPassword = await registerUser('validuser123', '12345')
    if (shortPassword.status === 400 && !shortPassword.success) {
      logTest('密码长度验证（太短）', true, 
        `短密码被拒绝: ${shortPassword.message}`)
    } else {
      logTest('密码长度验证（太短）', false, 
        `应该拒绝但状态为: ${shortPassword.status}`)
    }
    console.log()

    // 测试8: 验证现有用户（admin）可以登录
    console.log('👑 测试8: 验证现有用户登录...')
    const adminLogin = await loginUser('admin', 'bobchina')
    
    if (adminLogin.success) {
      logTest('现有用户登录成功', true, 
        `admin用户登录正常`)
    } else {
      logTest('现有用户登录成功', false, 
        `admin登录失败: ${adminLogin.message}`)
    }
    console.log()

    // 注意：测试用户不会被自动删除
    // 因为这是通过API测试，数据库清理应该由管理员手动处理
    console.log('📌 注意: 测试用户将保留在数据库中')
    console.log(`   用户名: ${testUsername}`)
    console.log('   如需清理，请手动删除或运行数据库清理脚本\n')

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
    logTest('测试执行', false, error.message)
  }

  // 输出测试总结
  console.log('='.repeat(50))
  console.log('📊 测试总结:')
  console.log(`   通过: ${testResults.passed}`)
  console.log(`   失败: ${testResults.failed}`)
  console.log(`   总计: ${testResults.passed + testResults.failed}`)
  console.log('='.repeat(50))

  if (testResults.failed === 0) {
    console.log('🎉 所有测试通过！API数据持久化工作正常。')
    console.log('\n💡 提示: 数据已持久化到SQLite数据库 (users.db)')
    process.exit(0)
  } else {
    console.log('⚠️  部分测试失败，请检查服务器配置和数据库。')
    process.exit(1)
  }
}

// 运行测试
testAPIPersistence().catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
})

