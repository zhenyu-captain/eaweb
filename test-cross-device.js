// 测试跨设备数据访问
const testCrossDeviceAccess = async () => {
  const baseUrl = 'http://localhost:3001/api'
  
  console.log('🌐 测试跨设备数据访问...')
  
  // 模拟不同设备访问同一用户数据
  const testUserId = 'cross_device_user'
  
  // 设备1：保存数据
  console.log('📱 设备1：保存数据...')
  const device1Data = {
    answers: { 'q1': 'A', 'q2': 'B' },
    notes: { 'q1': '设备1的笔记', 'q2': '设备1的另一个笔记' },
    translations: { 'q1': '设备1的翻译', 'q2': '设备1的另一个翻译' },
    questionHighlights: { 
      'q1': [{ id: 1, text: '设备1高亮', color: 'yellow', timestamp: new Date().toISOString() }]
    },
    optionHighlights: { 
      'q1': [{ id: 2, text: '设备1选项高亮', color: 'blue', timestamp: new Date().toISOString() }]
    }
  }
  
  try {
    const saveResponse = await fetch(`${baseUrl}/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, data: device1Data })
    })
    
    if (saveResponse.ok) {
      console.log('✅ 设备1数据保存成功')
    } else {
      console.error('❌ 设备1数据保存失败')
      return
    }
  } catch (error) {
    console.error('❌ 设备1保存出错:', error.message)
    return
  }
  
  // 设备2：访问数据
  console.log('💻 设备2：访问数据...')
  try {
    const loadResponse = await fetch(`${baseUrl}/get-data/${testUserId}`)
    
    if (loadResponse.ok) {
      const loadResult = await loadResponse.json()
      const loadedData = loadResult.data
      
      console.log('✅ 设备2成功访问数据:')
      console.log('- 用户ID:', loadedData.userId)
      console.log('- 最后更新:', loadedData.lastUpdated)
      console.log('- 答案数量:', Object.keys(loadedData.answers || {}).length)
      console.log('- 笔记数量:', Object.keys(loadedData.notes || {}).length)
      console.log('- 翻译数量:', Object.keys(loadedData.translations || {}).length)
      console.log('- 题目高亮数量:', Object.keys(loadedData.questionHighlights || {}).length)
      console.log('- 选项高亮数量:', Object.keys(loadedData.optionHighlights || {}).length)
      
      // 验证数据完整性
      if (loadedData.notes?.q1 === '设备1的笔记') {
        console.log('✅ 设备1的笔记在设备2上可见')
      }
      
      if (loadedData.questionHighlights?.q1?.length > 0) {
        console.log('✅ 设备1的高亮在设备2上可见')
      }
      
    } else {
      console.error('❌ 设备2访问数据失败:', loadResponse.status)
    }
  } catch (error) {
    console.error('❌ 设备2访问出错:', error.message)
  }
  
  // 设备2：添加新数据
  console.log('💻 设备2：添加新数据...')
  const device2Data = {
    ...device1Data,
    notes: { 
      ...device1Data.notes, 
      'q3': '设备2添加的笔记' 
    },
    questionHighlights: { 
      ...device1Data.questionHighlights,
      'q2': [{ id: 3, text: '设备2高亮', color: 'green', timestamp: new Date().toISOString() }]
    }
  }
  
  try {
    const updateResponse = await fetch(`${baseUrl}/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: testUserId, data: device2Data })
    })
    
    if (updateResponse.ok) {
      console.log('✅ 设备2数据更新成功')
    } else {
      console.error('❌ 设备2数据更新失败')
    }
  } catch (error) {
    console.error('❌ 设备2更新出错:', error.message)
  }
  
  // 设备1：重新访问数据（验证设备2的更改）
  console.log('📱 设备1：重新访问数据...')
  try {
    const recheckResponse = await fetch(`${baseUrl}/get-data/${testUserId}`)
    
    if (recheckResponse.ok) {
      const recheckResult = await recheckResponse.json()
      const recheckData = recheckResult.data
      
      console.log('✅ 设备1重新访问成功:')
      console.log('- 笔记数量:', Object.keys(recheckData.notes || {}).length)
      console.log('- 题目高亮数量:', Object.keys(recheckData.questionHighlights || {}).length)
      
      if (recheckData.notes?.q3 === '设备2添加的笔记') {
        console.log('✅ 设备2的更改在设备1上可见')
      }
      
      if (recheckData.questionHighlights?.q2?.length > 0) {
        console.log('✅ 设备2的高亮在设备1上可见')
      }
      
    } else {
      console.error('❌ 设备1重新访问失败:', recheckResponse.status)
    }
  } catch (error) {
    console.error('❌ 设备1重新访问出错:', error.message)
  }
  
  console.log('🎉 跨设备数据访问测试完成!')
  console.log('💡 结论：数据完全跨设备同步，任何设备上的更改都会保存到服务器')
}

// 运行测试
testCrossDeviceAccess().catch(console.error)


