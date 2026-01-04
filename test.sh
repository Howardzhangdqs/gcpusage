#!/bin/bash

# Docker 测试脚本 - 自动读取本地环境变量

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🐳 构建测试镜像..."
cd "$SCRIPT_DIR"
docker build -f test/Dockerfile -t gcpusage-test . 2>/dev/null || docker build -f test/Dockerfile -t gcpusage-test .

echo ""
echo "✅ 镜像构建完成"
echo ""

# 检查环境变量
if [ -n "$ANTHROPIC_AUTH_TOKEN" ]; then
    echo "✅ 检测到 ANTHROPIC_AUTH_TOKEN"
else
    echo "⚠️  未设置 ANTHROPIC_AUTH_TOKEN 环境变量"
fi

if [ -n "$ANTHROPIC_BASE_URL" ]; then
    echo "✅ 检测到 ANTHROPIC_BASE_URL: $ANTHROPIC_BASE_URL"
else
    echo "⚠️  未设置 ANTHROPIC_BASE_URL 环境变量"
fi

echo ""
echo "🚀 启动容器..."
echo ""

# 运行容器，传递所有环境变量
docker run --rm -it \
  -e ANTHROPIC_AUTH_TOKEN \
  -e ANTHROPIC_BASE_URL \
  gcpusage-test
