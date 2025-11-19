FROM node:18.20.4-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY src/ ./src/

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "src/app.js"]
