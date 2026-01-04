# 使用官方 Node.js 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json bun.lock ./

# 安装依赖（包括 tsx）
RUN npm install

# 复制源代码
COPY tsconfig.json ./
COPY src ./src

# 默认命令 - 使用 npm run
CMD ["npm", "run", "start:node"]
