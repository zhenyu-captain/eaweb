// 测试服务器登录
const testServerLogin = async () => {
  const baseUrl = 'https://gogoea.com/api'
  
  console.log('🌐 测试服务器登录...')
  console.log('服务器地址:', baseUrl)
  
  // 测试健康检查
  try {
    const healthResponse = await fetch(`${baseUrl}/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ 服务器健康检查通过:', healthData)
    } else {
      console.error('❌ 服务器健康检查失败:', healthResponse.status)
      return
    }
  } catch (error) {
    console.error('❌ 服务器连接失败:', error.message)
    return
  }
  
  // 测试admin登录
  console.log('🔐 测试admin登录...')
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
    
    console.log('登录响应状态:', loginResponse.status)
    console.log('登录响应OK:', loginResponse.ok)
    
    const loginData = await loginResponse.json()
    console.log('登录响应数据:', loginData)
    
    if (loginData.success) {
      console.log('✅ admin登录成功')
    } else {
      console.log('❌ admin登录失败:', loginData.message)
    }
  } catch (error) {
    console.error('❌ admin登录出错:', error.message)
  }
  
  // 测试bobchina登录
  console.log('🔐 测试bobchina登录...')
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
    
    console.log('登录响应状态:', loginResponse.status)
    console.log('登录响应OK:', loginResponse.ok)
    
    const loginData = await loginResponse.json()
    console.log('登录响应数据:', loginData)
    
    if (loginData.success) {
      console.log('✅ bobchina登录成功')
    } else {
      console.log('❌ bobchina登录失败:', loginData.message)
    }
  } catch (error) {
    console.error('❌ bobchina登录出错:', error.message)
  }
  
  console.log('🎉 服务器登录测试完成!')
}

// 运行测试
testServerLogin().catch(console.error)

