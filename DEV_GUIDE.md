# 本地开发指南

## 快速开始

### 方法1：同时运行前后端（推荐）
```bash
npm run dev:all
```
这会同时启动：
- 后端服务器：http://localhost:3001
- 前端开发服务器：http://localhost:5173

### 方法2：分别运行
```bash
# 终端1：启动后端
npm run dev:server

# 终端2：启动前端
npm run dev
```

## 测试服务器

运行测试脚本验证服务器是否正常工作：
```bash
node test-server.js
```

## 数据存储

### 开发环境
- 数据保存在 `user_data/` 目录
- 每个用户一个JSON文件
- 清除浏览器历史记录不会丢失数据

### 查看保存的数据
```bash
# 查看用户数据目录
ls -la user_data/

# 查看特定用户的数据
cat user_data/user_default_user.json
```

## 故障排除

### 1. 数据没有保存
- 检查后端服务器是否运行：http://localhost:3001/api/health
- 查看浏览器控制台是否有错误
- 检查 `user_data/` 目录权限

### 2. 前端无法连接后端
- 确认后端服务器在3001端口运行
- 检查CORS设置
- 查看网络请求是否被阻止

### 3. 端口冲突
- 修改 `server.js` 中的端口号
- 同时修改 `src/App.vue` 中的API_BASE

## 开发流程

1. 启动开发环境：`npm run dev:all`
2. 打开浏览器：http://localhost:5173
3. 进行测试操作（选择答案、添加笔记等）
4. 检查数据是否保存：`cat user_data/user_default_user.json`
5. 清除浏览器历史记录测试数据持久性
