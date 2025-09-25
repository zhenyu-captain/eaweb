# 部署说明

## 问题诊断

如果生产环境中出现"正在加载题目..."长时间停留的问题，通常是因为以下原因：

1. **静态资源路径问题**：JSON文件无法正确访问
2. **CORS问题**：跨域请求被阻止
3. **MIME类型问题**：服务器无法正确识别JSON文件

## 解决方案

### 1. 构建项目

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 复制JSON文件到dist目录
mkdir -p dist/db
cp db/all_questions.json dist/db/
```

### 2. 部署到nginx

确保将整个`dist`目录上传到nginx服务器，包括`db`子目录。

### 3. nginx配置

使用提供的`nginx.conf`配置文件，确保：

- JSON文件可以被正确访问
- 设置了正确的CORS头
- 设置了正确的MIME类型

### 4. 调试步骤

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 查看Network标签页，检查`/db/all_questions.json`请求是否成功
4. 检查返回的状态码和响应内容

### 5. 常见错误

- **404错误**：JSON文件路径不正确
- **CORS错误**：需要设置正确的CORS头
- **MIME类型错误**：需要设置`Content-Type: application/json`

## 文件结构

部署后的文件结构应该是：

```
dist/
├── index.html
├── favicon.ico
├── assets/
│   ├── index.[hash].css
│   └── index.[hash].js
└── db/
    └── all_questions.json
```

## 验证部署

访问 `http://your-domain.com` 应该能够正常加载题目，不再出现"正在加载题目..."的长时间停留。
