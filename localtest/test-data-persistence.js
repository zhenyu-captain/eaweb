// 测试用户注册和登录的数据持久化
import Database from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DB_PATH = path.join(__dirname, '..', 'users.db')

// 密码哈希函数（与server.js中保持一致）
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

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

async function testDataPersistence() {
  console.log('🧪 开始测试数据持久化...\n')
  console.log(`📂 数据库路径: ${DB_PATH}\n`)

  let db
  try {
    // 打开数据库
    db = new Database(DB_PATH)
    console.log('✅ 数据库连接成功\n')
  } catch (error) {
    console.error('❌ 无法连接数据库:', error.message)
    console.error('   请确保服务器已经运行过，数据库文件已创建')
    process.exit(1)
  }

  // 生成符合3-20字符限制的测试用户名
  // 使用时间戳后6位确保唯一性
  const timestamp = Date.now().toString()
  const testUsername = `test_${timestamp.slice(-6)}` // 例如: test_459298 (11字符)
  const testPassword = 'testpassword123'
  
  console.log(`📝 测试用户名: ${testUsername} (长度: ${testUsername.length})\n`)

  try {
    // 测试1: 检查数据库表是否存在
    console.log('📋 测试1: 检查数据库表结构...')
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `).get()
    
    if (tables) {
      logTest('数据库表存在', true)
      
      // 检查表结构
      const tableInfo = db.prepare('PRAGMA table_info(users)').all()
      const hasRequiredColumns = 
        tableInfo.some(c => c.name === 'id') &&
        tableInfo.some(c => c.name === 'username') &&
        tableInfo.some(c => c.name === 'password') &&
        tableInfo.some(c => c.name === 'created_at')
      
      logTest('表结构正确', hasRequiredColumns, 
        hasRequiredColumns ? '' : '缺少必需的列')
    } else {
      logTest('数据库表存在', false, 'users表不存在')
    }
    console.log()

    // 测试2: 插入测试用户
    console.log('📝 测试2: 插入测试用户...')
    try {
      const hashedPassword = hashPassword(testPassword)
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        .run(testUsername, hashedPassword)
      logTest('插入用户成功', true, `用户名: ${testUsername}`)
    } catch (error) {
      logTest('插入用户成功', false, error.message)
    }
    console.log()

    // 测试3: 验证用户已保存
    console.log('🔍 测试3: 验证用户已保存到数据库...')
    const savedUser = db.prepare('SELECT * FROM users WHERE username = ?')
      .get(testUsername)
    
    if (savedUser) {
      logTest('用户数据已保存', true, 
        `ID: ${savedUser.id}, 创建时间: ${savedUser.created_at}`)
      
      // 验证密码是否正确存储（哈希）
      const isHashed = savedUser.password.length === 64 && 
        savedUser.password === hashPassword(testPassword)
      logTest('密码哈希存储正确', isHashed,
        isHashed ? '密码已正确哈希' : '密码存储格式不正确')
    } else {
      logTest('用户数据已保存', false, '无法在数据库中找到刚插入的用户')
    }
    console.log()

    // 测试4: 测试密码验证（登录逻辑）
    console.log('🔐 测试4: 测试密码验证...')
    if (savedUser) {
      const hashedPassword = hashPassword(testPassword)
      const passwordMatch = savedUser.password === hashedPassword
      logTest('密码验证成功', passwordMatch,
        passwordMatch ? '密码匹配' : '密码不匹配')
    } else {
      logTest('密码验证成功', false, '无法验证：用户不存在')
    }
    console.log()

    // 测试5: 测试用户名唯一性约束
    console.log('🚫 测试5: 测试用户名唯一性...')
    try {
      const hashedPassword = hashPassword('anotherpassword')
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
        .run(testUsername, hashedPassword)
      logTest('用户名唯一性约束', false, '重复用户名应该被拒绝')
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        logTest('用户名唯一性约束', true, '重复用户名被正确拒绝')
      } else {
        logTest('用户名唯一性约束', false, `意外错误: ${error.message}`)
      }
    }
    console.log()

    // 测试6: 测试数据持久化（关闭并重新打开数据库）
    console.log('💾 测试6: 测试数据持久化（关闭并重新打开数据库）...')
    const userIdBefore = savedUser?.id
    
    // 关闭数据库
    db.close()
    console.log('   已关闭数据库连接')
    
    // 重新打开数据库
    db = new Database(DB_PATH)
    console.log('   已重新打开数据库连接')
    
    // 查询同一个用户
    const userAfterReopen = db.prepare('SELECT * FROM users WHERE username = ?')
      .get(testUsername)
    
    if (userAfterReopen && userAfterReopen.id === userIdBefore) {
      logTest('数据持久化验证', true, 
        `用户ID保持不变: ${userAfterReopen.id}`)
    } else {
      logTest('数据持久化验证', false, 
        `用户ID不匹配: 之前=${userIdBefore}, 现在=${userAfterReopen?.id}`)
    }
    console.log()

    // 测试7: 验证现有用户（admin, bobchina）存在
    console.log('👤 测试7: 验证现有用户存在...')
    const adminUser = db.prepare('SELECT * FROM users WHERE username = ?')
      .get('admin')
    const bobchinaUser = db.prepare('SELECT * FROM users WHERE username = ?')
      .get('bobchina')
    
    logTest('admin用户存在', !!adminUser, 
      adminUser ? `创建时间: ${adminUser.created_at}` : 'admin用户不存在')
    logTest('bobchina用户存在', !!bobchinaUser,
      bobchinaUser ? `创建时间: ${bobchinaUser.created_at}` : 'bobchina用户不存在')
    console.log()

    // 清理测试数据
    console.log('🧹 清理测试数据...')
    try {
      db.prepare('DELETE FROM users WHERE username = ?').run(testUsername)
      logTest('清理测试数据', true, `已删除测试用户: ${testUsername}`)
    } catch (error) {
      logTest('清理测试数据', false, error.message)
    }
    console.log()

    // 测试8: 验证清理后用户不存在
    console.log('🔍 测试8: 验证清理后数据...')
    const deletedUser = db.prepare('SELECT * FROM users WHERE username = ?')
      .get(testUsername)
    logTest('清理后用户不存在', !deletedUser,
      deletedUser ? '用户仍然存在' : '用户已成功删除')
    console.log()

  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
    logTest('测试执行', false, error.message)
  } finally {
    if (db) {
      db.close()
      console.log('✅ 数据库连接已关闭\n')
    }
  }

  // 输出测试总结
  console.log('='.repeat(50))
  console.log('📊 测试总结:')
  console.log(`   通过: ${testResults.passed}`)
  console.log(`   失败: ${testResults.failed}`)
  console.log(`   总计: ${testResults.passed + testResults.failed}`)
  console.log('='.repeat(50))

  if (testResults.failed === 0) {
    console.log('🎉 所有测试通过！数据持久化工作正常。')
    process.exit(0)
  } else {
    console.log('⚠️  部分测试失败，请检查数据库配置。')
    process.exit(1)
  }
}

// 运行测试
testDataPersistence().catch(error => {
  console.error('❌ 测试执行失败:', error)
  process.exit(1)
})

