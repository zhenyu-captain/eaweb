#!/bin/bash

# 启动脚本
echo "启动EA Web应用..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js未安装，请先安装Node.js"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建前端
echo "构建前端..."
npm run build

# 启动后端服务器
echo "启动后端服务器..."
npm run server
