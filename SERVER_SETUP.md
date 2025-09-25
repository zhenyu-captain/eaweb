# 服务器部署指南

## 概述
现在应用支持将数据保存到服务器，而不是浏览器的localStorage。数据会永久保存在服务器的文件系统中。

## 部署步骤

### 1. 安装依赖
```bash
npm install
```

### 2. 构建前端
```bash
npm run build
```

### 3. 启动后端服务器
```bash
npm run server
```

或者使用启动脚本：
```bash
./start.sh
```

### 4. 配置nginx
将 `nginx.conf.example` 中的配置添加到你的nginx配置文件中，并修改路径：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 静态文件服务
    location / {
        root /path/to/your/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 数据存储

### 存储位置
- 用户数据保存在 `user_data/` 目录中
- 每个用户一个JSON文件：`user_data/user_用户ID.json`
- 数据包括：答案、笔记、翻译、高亮标记

### 数据格式
```json
{
  "userId": "default_user",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "answers": {},
  "notes": {},
  "translations": {},
  "questionHighlights": {},
  "optionHighlights": {}
}
```

## 功能特性

### 1. 自动保存
- 选择答案时自动保存
- 编辑笔记时自动保存
- 添加高亮时自动保存
- 添加翻译时自动保存

### 2. 离线支持
- 如果服务器不可用，自动回退到localStorage
- 网络恢复后自动同步到服务器

### 3. 多用户支持
- 每个用户独立的数据存储
- 可以通过修改 `userId` 来区分不同用户

## API接口

### 保存数据
```
POST /api/save-data
Content-Type: application/json

{
  "userId": "用户ID",
  "data": {
    "answers": {},
    "notes": {},
    "translations": {},
    "questionHighlights": {},
    "optionHighlights": {}
  }
}
```

### 获取数据
```
GET /api/get-data/用户ID
```

### 清空数据
```
DELETE /api/clear-data/用户ID
```

## 故障排除

### 1. 服务器无法启动
- 检查端口3001是否被占用
- 检查Node.js版本是否>=18.0.0

### 2. 数据保存失败
- 检查 `user_data` 目录权限
- 查看服务器日志

### 3. nginx代理失败
- 检查nginx配置
- 确认后端服务器正在运行

## 安全注意事项

1. 在生产环境中，建议添加用户认证
2. 定期备份 `user_data` 目录
3. 设置适当的文件权限
4. 考虑添加数据验证和限制
