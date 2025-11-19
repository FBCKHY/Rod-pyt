# 订阅系统后端服务

## 项目简介

本项目是订阅系统的后端服务，基于 Node.js + Express + MySQL 技术栈开发。

## 技术栈

- Node.js 18.20.4+
- Express.js 4.18+
- MySQL 8.0+
- Sequelize ORM
- JWT 身份验证
- Swagger API 文档

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库等信息
```

### 3. 数据库设置
```bash
npm run db:migrate
npm run db:seed
```

### 4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API 文档

开发环境启动后访问: http://localhost:3000/api-docs

## 项目结构

```
backend/
├── src/                    # 源码目录
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── routes/             # 路由
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   └── app.js              # 应用入口
├── migrations/             # 数据库迁移
└── logs/                   # 日志文件
```
