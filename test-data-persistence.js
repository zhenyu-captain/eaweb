// 测试数据持久性
const API_BASE = 'http://localhost:3001/api'

async function testDataPersistence() {
  console.log('测试数据持久性...')
  
  const userId = 'test_persistence'
  
  try {
    // 1. 保存完整数据
    const fullData = {
      userId: userId,
      data: {
        answers: { 'q1': 'A', 'q2': 'B' },
        notes: { 'q1': '笔记1', 'q2': '笔记2' },
        translations: { 'q1': '翻译1', 'q2': '翻译2' },
        questionHighlights: { 'q1': [{ id: 1, text: '高亮1', color: 'yellow' }] },
        optionHighlights: { 'q1': [{ id: 2, text: '选项高亮', color: 'green' }] }
      }
    }
    
    console.log('1. 保存完整数据...')
    const saveResponse = await fetch(`${API_BASE}/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData)
    })
    const saveResult = await saveResponse.json()
    console.log('✅ 保存结果:', saveResult)
    
    // 2. 模拟只更新笔记（应该保留其他数据）
    const updateNotesData = {
      userId: userId,
      data: {
        answers: { 'q1': 'A', 'q2': 'B' },
        notes: { 'q1': '更新的笔记1', 'q2': '更新的笔记2' },
        translations: { 'q1': '翻译1', 'q2': '翻译2' },
        questionHighlights: { 'q1': [{ id: 1, text: '高亮1', color: 'yellow' }] },
        optionHighlights: { 'q1': [{ id: 2, text: '选项高亮', color: 'green' }] }
      }
    }
    
    console.log('2. 更新笔记（保留其他数据）...')
    const updateResponse = await fetch(`${API_BASE}/save-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateNotesData)
    })
    const updateResult = await updateResponse.json()
    console.log('✅ 更新结果:', updateResult)
    
    // 3. 验证数据完整性
    console.log('3. 验证数据完整性...')
    const getResponse = await fetch(`${API_BASE}/get-data/${userId}`)
    const getData = await getResponse.json()
    
    const data = getData.data
    console.log('📊 验证结果:')
    console.log('  - 答案数量:', Object.keys(data.answers || {}).length)
    console.log('  - 笔记数量:', Object.keys(data.notes || {}).length)
    console.log('  - 翻译数量:', Object.keys(data.translations || {}).length)
    console.log('  - 题目高亮数量:', Object.keys(data.questionHighlights || {}).length)
    console.log('  - 选项高亮数量:', Object.keys(data.optionHighlights || {}).length)
    
    // 检查具体数据
    if (data.notes && data.notes.q1 === '更新的笔记1') {
      console.log('✅ 笔记更新成功')
    } else {
      console.log('❌ 笔记更新失败')
    }
    
    if (data.questionHighlights && data.questionHighlights.q1 && data.questionHighlights.q1.length > 0) {
      console.log('✅ 题目高亮保留成功')
    } else {
      console.log('❌ 题目高亮丢失')
    }
    
    if (data.optionHighlights && data.optionHighlights.q1 && data.optionHighlights.q1.length > 0) {
      console.log('✅ 选项高亮保留成功')
    } else {
      console.log('❌ 选项高亮丢失')
    }
    
    console.log('🎉 数据持久性测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

testDataPersistence()
