#!/bin/bash

echo "开始构建项目..."

# 清理之前的构建
rm -rf dist

# 构建项目
npm run build

# 确保db目录存在
mkdir -p dist/db

# 复制JSON文件到dist目录
cp db/all_questions.json dist/db/
cp db/test.json dist/db/

echo "构建完成！"
echo "dist目录内容："
ls -la dist/
echo ""
echo "db目录内容："
ls -la dist/db/
