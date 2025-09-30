# 服务器部署问题诊断

## 当前问题
- 前端显示：`✅ 后端服务器连接正常`
- 实际请求：`POST https://gogoea.com/api/login 401 (Unauthorized)`
- 健康检查：`502 Bad Gateway`

## 可能原因

### 1. 后端服务器没有运行
```bash
# 检查服务器进程
ps aux | grep "node server.js"

# 如果没有运行，启动服务器
cd /var/www/gogoea.com
nohup node server.js > /var/log/express.log 2>&1 &
disown

# 检查日志
tail -f /var/log/express.log
```

### 2. 服务器代码没有更新
```bash
# 检查服务器上的代码
cd /var/www/gogoea.com
cat server.js | grep -A 5 "const users"

# 应该显示：
# const users = {
#   'admin': 'admin',
#   'bobchina': 'bobchina'
# }
```

### 3. Nginx配置问题
```bash
# 检查Nginx配置
sudo nginx -t

# 检查Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# 检查Nginx访问日志
sudo tail -f /var/log/nginx/access.log
```

### 4. 端口配置问题
```bash
# 检查端口是否被占用
netstat -tlnp | grep :3001

# 检查防火墙
sudo ufw status
```

## 解决步骤

### 步骤1：检查服务器状态
```bash
ssh root@74.48.192.43
cd /var/www/gogoea.com
ps aux | grep "node server.js"
```

### 步骤2：检查服务器代码
```bash
cat server.js | grep -A 5 "const users"
```

### 步骤3：重启服务器
```bash
# 停止现有进程
pkill -f "node server.js"

# 启动服务器
nohup node server.js > /var/log/express.log 2>&1 &
disown

# 检查是否启动成功
ps aux | grep "node server.js"
```

### 步骤4：检查Nginx配置
```bash
# 检查Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 步骤5：测试API
```bash
# 测试本地API
curl http://localhost:3001/api/health

# 测试通过Nginx的API
curl https://gogoea.com/api/health
```

## 预期结果
- 本地API应该返回：`{"status":"ok","timestamp":"..."}`
- 通过Nginx的API应该返回相同结果
- 登录API应该接受admin/admin和bobchina/bobchina


