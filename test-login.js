// 测试登录功能
const testLogin = async () => {
  const baseUrl = 'http://localhost:3001/api'
  
  console.log('🧪 测试登录功能...')
  
  // 测试健康检查
  try {
    const healthResponse = await fetch(`${baseUrl}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ 健康检查:', healthData)
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message)
    return
  }
  
  // 测试有效登录
  try {
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('✅ 管理员登录:', loginData)
  } catch (error) {
    console.error('❌ 管理员登录失败:', error.message)
  }
  
  // 测试另一个用户登录
  try {
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'bobchina',
        password: 'bobchina'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('✅ Bobchina登录:', loginData)
  } catch (error) {
    console.error('❌ Bobchina登录失败:', error.message)
  }
  
  // 测试无效登录
  try {
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'invalid',
        password: 'wrong'
      })
    })
    
    const loginData = await loginResponse.json()
    console.log('❌ 无效登录测试:', loginData)
  } catch (error) {
    console.error('❌ 无效登录测试失败:', error.message)
  }
  
  console.log('🎉 登录功能测试完成!')
}

// 运行测试
testLogin().catch(console.error)
