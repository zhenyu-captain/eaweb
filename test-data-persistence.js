// 测试数据持久化功能
const testDataPersistence = async () => {
  const baseUrl = 'http://localhost:3001/api'
  
  console.log('🧪 测试数据持久化功能...')
  
  // 测试数据
  const testData = {
    answers: { 'q1': 'A', 'q2': 'B' },
    notes: { 'q1': '这是题目1的笔记', 'q2': '这是题目2的笔记' },
    translations: { 'q1': '这是题目1的翻译', 'q2': '这是题目2的翻译' },
    questionHighlights: { 
      'q1': [{ id: 1, text: '重要', color: 'yellow', timestamp: new Date().toISOString() }],
      'q2': [{ id: 2, text: '关键', color: 'green', timestamp: new Date().toISOString() }]
    },
    optionHighlights: { 
      'q1': [{ id: 3, text: '选项A', color: 'blue', timestamp: new Date().toISOString() }],
      'q2': [{ id: 4, text: '选项B', color: 'pink', timestamp: new Date().toISOString() }]
    }
  }
  
  // 1. 测试保存数据
  console.log('📝 测试保存数据...')
  try {
    const saveResponse = await fetch(`${baseUrl}/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test_user',
        data: testData
      })
    })
    
    if (saveResponse.ok) {
      const saveResult = await saveResponse.json()
      console.log('✅ 数据保存成功:', saveResult)
    } else {
      console.error('❌ 数据保存失败:', saveResponse.status)
      return
    }
  } catch (error) {
    console.error('❌ 保存数据时出错:', error.message)
    return
  }
  
  // 2. 测试加载数据
  console.log('📖 测试加载数据...')
  try {
    const loadResponse = await fetch(`${baseUrl}/get-data/test_user`)
    
    if (loadResponse.ok) {
      const loadResult = await loadResponse.json()
      console.log('✅ 数据加载成功:', loadResult)
      
      // 验证数据完整性
      const loadedData = loadResult.data
      console.log('🔍 验证数据完整性:')
      console.log('- 答案数量:', Object.keys(loadedData.answers || {}).length)
      console.log('- 笔记数量:', Object.keys(loadedData.notes || {}).length)
      console.log('- 翻译数量:', Object.keys(loadedData.translations || {}).length)
      console.log('- 题目高亮数量:', Object.keys(loadedData.questionHighlights || {}).length)
      console.log('- 选项高亮数量:', Object.keys(loadedData.optionHighlights || {}).length)
      
      // 验证具体数据
      if (loadedData.answers?.q1 === 'A' && loadedData.answers?.q2 === 'B') {
        console.log('✅ 答案数据正确')
      } else {
        console.log('❌ 答案数据不正确')
      }
      
      if (loadedData.notes?.q1 === '这是题目1的笔记') {
        console.log('✅ 笔记数据正确')
      } else {
        console.log('❌ 笔记数据不正确')
      }
      
      if (loadedData.questionHighlights?.q1?.length > 0) {
        console.log('✅ 题目高亮数据正确')
      } else {
        console.log('❌ 题目高亮数据不正确')
      }
      
    } else {
      console.error('❌ 数据加载失败:', loadResponse.status)
    }
  } catch (error) {
    console.error('❌ 加载数据时出错:', error.message)
  }
  
  // 3. 测试更新部分数据
  console.log('🔄 测试更新部分数据...')
  try {
    const updateData = {
      ...testData,
      notes: { ...testData.notes, 'q1': '更新后的题目1笔记' },
      questionHighlights: { 
        ...testData.questionHighlights, 
        'q1': [...testData.questionHighlights.q1, { 
          id: 5, 
          text: '新增高亮', 
          color: 'orange', 
          timestamp: new Date().toISOString() 
        }]
      }
    }
    
    const updateResponse = await fetch(`${baseUrl}/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test_user',
        data: updateData
      })
    })
    
    if (updateResponse.ok) {
      console.log('✅ 数据更新成功')
      
      // 验证更新后的数据
      const verifyResponse = await fetch(`${baseUrl}/get-data/test_user`)
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json()
        const updatedData = verifyResult.data
        
        if (updatedData.notes?.q1 === '更新后的题目1笔记') {
          console.log('✅ 笔记更新正确')
        } else {
          console.log('❌ 笔记更新不正确')
        }
        
        if (updatedData.questionHighlights?.q1?.length === 2) {
          console.log('✅ 高亮更新正确')
        } else {
          console.log('❌ 高亮更新不正确')
        }
      }
    } else {
      console.error('❌ 数据更新失败:', updateResponse.status)
    }
  } catch (error) {
    console.error('❌ 更新数据时出错:', error.message)
  }
  
  console.log('🎉 数据持久化测试完成!')
}

// 运行测试
testDataPersistence().catch(console.error)