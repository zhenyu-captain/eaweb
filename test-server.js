// 测试服务器API
const API_BASE = 'http://localhost:3001/api'

async function testServer() {
  console.log('测试服务器连接...')
  
  try {
    // 测试健康检查
    const healthResponse = await fetch(`${API_BASE}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ 服务器健康检查:', healthData)
    
    // 测试保存数据
    const testData = {
      userId: 'test_user',
      data: {
        answers: { 'q1': 'A' },
        notes: { 'q1': '测试笔记' },
        translations: { 'q1': '测试翻译' },
        questionHighlights: { 'q1': [] },
        optionHighlights: { 'q1': [] }
      }
    }
    
    const saveResponse = await fetch(`${API_BASE}/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })
    
    const saveResult = await saveResponse.json()
    console.log('✅ 保存数据测试:', saveResult)
    
    // 测试获取数据
    const getResponse = await fetch(`${API_BASE}/get-data/test_user`)
    const getData = await getResponse.json()
    console.log('✅ 获取数据测试:', getData)
    
    console.log('🎉 所有测试通过！服务器工作正常。')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('请确保服务器正在运行: npm run dev:server')
  }
}

testServer()
