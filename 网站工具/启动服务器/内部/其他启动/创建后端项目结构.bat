@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ===============================================
echo   订阅系统后端项目结构自动生成工具
echo ===============================================
echo.

:: 设置项目根目录
set "PROJECT_ROOT=%~dp0..\..\..\..\backend"

echo 🔍 项目将创建在: %PROJECT_ROOT%
echo.

:: 询问用户是否继续
set /p "confirm=是否继续创建后端项目结构? (y/n): "
if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    exit /b
)

echo.
echo 🚀 开始创建项目结构...

:: 创建主目录
if not exist "%PROJECT_ROOT%" (
    mkdir "%PROJECT_ROOT%"
    echo ✅ 创建主目录: backend
)

cd /d "%PROJECT_ROOT%"

:: 创建src目录结构
echo.
echo 📁 创建src目录结构...

mkdir src 2>nul
mkdir src\config 2>nul
mkdir src\controllers 2>nul
mkdir src\middleware 2>nul
mkdir src\models 2>nul
mkdir src\routes 2>nul
mkdir src\services 2>nul
mkdir src\utils 2>nul

echo ✅ src目录结构创建完成

:: 创建其他主要目录
echo.
echo 📁 创建其他主要目录...

mkdir migrations 2>nul
mkdir seeders 2>nul
mkdir tests 2>nul
mkdir tests\controllers 2>nul
mkdir tests\services 2>nul
mkdir tests\routes 2>nul
mkdir logs 2>nul
mkdir docs 2>nul
mkdir scripts 2>nul

echo ✅ 主要目录创建完成

:: 创建package.json
echo.
echo 📄 创建package.json...

(
echo {
echo   "name": "subscription-system-backend",
echo   "version": "1.0.0",
echo   "description": "订阅系统后端服务",
echo   "main": "src/app.js",
echo   "scripts": {
echo     "start": "node src/app.js",
echo     "dev": "nodemon src/app.js",
echo     "test": "jest",
echo     "test:watch": "jest --watch",
echo     "db:migrate": "npx sequelize-cli db:migrate",
echo     "db:seed": "npx sequelize-cli db:seed:all",
echo     "db:setup": "npm run db:migrate && npm run db:seed",
echo     "lint": "eslint src/",
echo     "lint:fix": "eslint src/ --fix",
echo     "setup": "node scripts/setup.js",
echo     "deploy": "node scripts/deploy.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "sequelize": "^6.35.2",
echo     "mysql2": "^3.6.5",
echo     "jsonwebtoken": "^9.0.2",
echo     "bcryptjs": "^2.4.3",
echo     "express-validator": "^7.0.1",
echo     "express-rate-limit": "^7.1.5",
echo     "helmet": "^7.1.0",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.3.1",
echo     "winston": "^3.11.0",
echo     "swagger-jsdoc": "^6.2.8",
echo     "swagger-ui-express": "^5.0.0",
echo     "express-async-errors": "^3.1.1",
echo     "joi": "^17.11.0"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.2",
echo     "jest": "^29.7.0",
echo     "supertest": "^6.3.3",
echo     "eslint": "^8.56.0",
echo     "sequelize-cli": "^6.6.2"
echo   },
echo   "engines": {
echo     "node": ">=18.20.4"
echo   }
echo }
) > package.json

echo ✅ package.json 创建完成

:: 创建.env.example
echo.
echo 📄 创建.env.example...

(
echo # 服务器配置
echo NODE_ENV=development
echo PORT=3000
echo HOST=localhost
echo.
echo # 数据库配置
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_NAME=subscription_system
echo DB_USERNAME=root
echo DB_PASSWORD=your_password
echo DB_DIALECT=mysql
echo.
echo # JWT配置
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
echo JWT_EXPIRES_IN=7d
echo.
echo # 日志配置
echo LOG_LEVEL=info
echo LOG_FILE=./logs/app.log
echo.
echo # CORS配置
echo CORS_ORIGIN=http://localhost:3006,http://localhost:8080
echo.
echo # 其他配置
echo RATE_LIMIT_WINDOW_MS=900000
echo RATE_LIMIT_MAX=100
) > .env.example

echo ✅ .env.example 创建完成

:: 创建.gitignore
echo.
echo 📄 创建.gitignore...

(
echo # 依赖
echo node_modules/
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # 运行时数据
echo pids
echo *.pid
echo *.seed
echo *.pid.lock
echo.
echo # 日志
echo logs/
echo *.log
echo.
echo # 环境变量
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # 编辑器
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # 操作系统
echo .DS_Store
echo Thumbs.db
echo.
echo # 测试覆盖率
echo coverage/
echo .nyc_output
echo.
echo # PM2
echo ecosystem.config.js
) > .gitignore

echo ✅ .gitignore 创建完成

:: 创建README.md
echo.
echo 📄 创建README.md...

(
echo # 订阅系统后端服务
echo.
echo ## 项目简介
echo.
echo 本项目是订阅系统的后端服务，基于 Node.js + Express + MySQL 技术栈开发。
echo.
echo ## 技术栈
echo.
echo - Node.js 18.20.4+
echo - Express.js 4.18+
echo - MySQL 8.0+
echo - Sequelize ORM
echo - JWT 身份验证
echo - Swagger API 文档
echo.
echo ## 快速开始
echo.
echo ### 1. 安装依赖
echo ```bash
echo npm install
echo ```
echo.
echo ### 2. 配置环境变量
echo ```bash
echo cp .env.example .env
echo # 编辑 .env 文件配置数据库等信息
echo ```
echo.
echo ### 3. 数据库设置
echo ```bash
echo npm run db:migrate
echo npm run db:seed
echo ```
echo.
echo ### 4. 启动服务
echo ```bash
echo # 开发环境
echo npm run dev
echo.
echo # 生产环境
echo npm start
echo ```
echo.
echo ## API 文档
echo.
echo 开发环境启动后访问: http://localhost:3000/api-docs
echo.
echo ## 项目结构
echo.
echo ```
echo backend/
echo ├── src/                    # 源码目录
echo │   ├── config/             # 配置文件
echo │   ├── controllers/        # 控制器
echo │   ├── middleware/         # 中间件
echo │   ├── models/             # 数据模型
echo │   ├── routes/             # 路由
echo │   ├── services/           # 业务逻辑
echo │   ├── utils/              # 工具函数
echo │   └── app.js              # 应用入口
echo ├── migrations/             # 数据库迁移
echo ├── tests/                  # 测试文件
echo └── logs/                   # 日志文件
echo ```
) > README.md

echo ✅ README.md 创建完成

:: 创建基础配置文件
echo.
echo 📄 创建基础配置文件...

:: 创建数据库配置
(
echo const { Sequelize } = require('sequelize'^);
echo require('dotenv'^).config(^);
echo.
echo const sequelize = new Sequelize({
echo   host: process.env.DB_HOST ^|^| 'localhost',
echo   port: process.env.DB_PORT ^|^| 3306,
echo   database: process.env.DB_NAME ^|^| 'subscription_system',
echo   username: process.env.DB_USERNAME ^|^| 'root',
echo   password: process.env.DB_PASSWORD ^|^| '',
echo   dialect: process.env.DB_DIALECT ^|^| 'mysql',
echo   logging: process.env.NODE_ENV === 'development' ? console.log : false,
echo   pool: {
echo     max: 10,
echo     min: 0,
echo     acquire: 30000,
echo     idle: 10000
echo   },
echo   define: {
echo     timestamps: true,
echo     underscored: true,
echo     freezeTableName: true
echo   }
echo }^);
echo.
echo module.exports = sequelize;
) > src\config\database.js

echo ✅ 数据库配置文件创建完成

:: 创建响应格式化工具
(
echo /**
echo  * 统一响应格式化工具
echo  */
echo.
echo const formatResponse = (code, msg, data = null^) =^> {
echo   return {
echo     code,
echo     msg,
echo     data,
echo     timestamp: Date.now(^)
echo   };
echo };
echo.
echo const successResponse = (data, msg = '操作成功'^) =^> {
echo   return formatResponse(200, msg, data^);
echo };
echo.
echo const errorResponse = (code, msg^) =^> {
echo   return formatResponse(code, msg^);
echo };
echo.
echo module.exports = {
echo   formatResponse,
echo   successResponse,
echo   errorResponse
echo };
) > src\utils\response.js

echo ✅ 响应格式化工具创建完成

:: 创建日志工具
(
echo const winston = require('winston'^);
echo const path = require('path'^);
echo.
echo const logger = winston.createLogger({
echo   level: process.env.LOG_LEVEL ^|^| 'info',
echo   format: winston.format.combine(
echo     winston.format.timestamp(^),
echo     winston.format.errors({ stack: true }^),
echo     winston.format.json(^)
echo   ^),
echo   defaultMeta: { service: 'subscription-backend' },
echo   transports: [
echo     new winston.transports.File({ 
echo       filename: path.join(__dirname, '../../logs/error.log'^), 
echo       level: 'error' 
echo     }^),
echo     new winston.transports.File({ 
echo       filename: path.join(__dirname, '../../logs/combined.log'^) 
echo     }^)
echo   ]
echo }^);
echo.
echo if (process.env.NODE_ENV !== 'production'^) {
echo   logger.add(new winston.transports.Console({
echo     format: winston.format.simple(^)
echo   }^)^);
echo }
echo.
echo module.exports = logger;
) > src\utils\logger.js

echo ✅ 日志工具创建完成

:: 创建PM2配置
echo.
echo 📄 创建PM2配置...

(
echo module.exports = {
echo   apps: [{
echo     name: 'subscription-system-backend',
echo     script: 'src/app.js',
echo     instances: 'max',
echo     exec_mode: 'cluster',
echo     env: {
echo       NODE_ENV: 'production',
echo       PORT: 3000
echo     },
echo     env_production: {
echo       NODE_ENV: 'production',
echo       PORT: 3000
echo     },
echo     error_file: './logs/pm2-error.log',
echo     out_file: './logs/pm2-out.log',
echo     log_file: './logs/pm2-combined.log',
echo     time: true,
echo     max_memory_restart: '1G',
echo     node_args: '--max_old_space_size=1024'
echo   }]
echo };
) > ecosystem.config.js

echo ✅ PM2配置文件创建完成

:: 创建Dockerfile
echo.
echo 📄 创建Dockerfile...

(
echo FROM node:18.20.4-alpine
echo.
echo WORKDIR /app
echo.
echo # 复制依赖文件
echo COPY package*.json ./
echo.
echo # 安装依赖
echo RUN npm ci --only=production
echo.
echo # 复制源码
echo COPY src/ ./src/
echo.
echo # 创建日志目录
echo RUN mkdir -p logs
echo.
echo # 暴露端口
echo EXPOSE 3000
echo.
echo # 启动命令
echo CMD ["node", "src/app.js"]
) > Dockerfile

echo ✅ Dockerfile 创建完成

:: 创建设置脚本
echo.
echo 📄 创建setup.js脚本...

(
echo const fs = require('fs'^);
echo const path = require('path'^);
echo.
echo console.log('🚀 开始初始化项目...');
echo.
echo // 检查.env文件
echo if (^!fs.existsSync('.env'^)^) {
echo   console.log('📋 复制环境变量文件...');
echo   fs.copyFileSync('.env.example', '.env'^);
echo   console.log('✅ .env 文件已创建，请编辑配置信息');
echo } else {
echo   console.log('ℹ️ .env 文件已存在');
echo }
echo.
echo // 检查logs目录
echo if (^!fs.existsSync('logs'^)^) {
echo   fs.mkdirSync('logs'^);
echo   console.log('✅ logs 目录已创建');
echo }
echo.
echo console.log('🎉 项目初始化完成！');
echo console.log('');
echo console.log('下一步：');
echo console.log('1. 编辑 .env 文件配置数据库信息');
echo console.log('2. 运行 npm install 安装依赖');
echo console.log('3. 运行 npm run db:migrate 初始化数据库');
echo console.log('4. 运行 npm run dev 启动开发服务器');
) > scripts\setup.js

echo ✅ setup.js 脚本创建完成

:: 创建基础的app.js模板
echo.
echo 📄 创建app.js模板...

(
echo const express = require('express'^);
echo const cors = require('cors'^);
echo const helmet = require('helmet'^);
echo require('express-async-errors'^);
echo require('dotenv'^).config(^);
echo.
echo const sequelize = require('./config/database'^);
echo const logger = require('./utils/logger'^);
echo const { formatResponse } = require('./utils/response'^);
echo.
echo const app = express(^);
echo.
echo // 基础中间件
echo app.use(helmet(^)^);
echo app.use(cors({
echo   origin: process.env.CORS_ORIGIN?.split(','^) ^|^| ['http://localhost:3006'],
echo   credentials: true
echo }^)^);
echo.
echo // JSON解析
echo app.use(express.json({ limit: '10mb' }^)^);
echo app.use(express.urlencoded({ extended: true }^)^);
echo.
echo // 健康检查
echo app.get('/health', (req, res^) =^> {
echo   res.json(formatResponse(200, 'Service is healthy', {
echo     timestamp: new Date(^).toISOString(^),
echo     uptime: process.uptime(^),
echo     environment: process.env.NODE_ENV
echo   }^)^);
echo }^);
echo.
echo // 404处理
echo app.use('*', (req, res^) =^> {
echo   res.status(404^).json(formatResponse(404, '接口不存在'^)^);
echo }^);
echo.
echo // 启动服务器
echo const PORT = process.env.PORT ^|^| 3000;
echo const HOST = process.env.HOST ^|^| 'localhost';
echo.
echo async function startServer(^) {
echo   try {
echo     await sequelize.authenticate(^);
echo     logger.info('数据库连接成功'^);
echo.
echo     app.listen(PORT, HOST, (^) =^> {
echo       logger.info('服务器启动成功', {
echo         port: PORT,
echo         host: HOST,
echo         env: process.env.NODE_ENV
echo       }^);
echo       console.log(`🚀 服务器运行在 http://${HOST}:${PORT}`^);
echo     }^);
echo   } catch (error^) {
echo     logger.error('服务器启动失败', error^);
echo     process.exit(1^);
echo   }
echo }
echo.
echo startServer(^);
echo.
echo module.exports = app;
) > src\app.js

echo ✅ app.js 模板创建完成

:: 创建Jest配置
echo.
echo 📄 创建Jest配置...

(
echo module.exports = {
echo   testEnvironment: 'node',
echo   setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
echo   testMatch: [
echo     '<rootDir>/tests/**/*.test.js'
echo   ],
echo   collectCoverage: true,
echo   coverageDirectory: 'coverage',
echo   coverageReporters: ['text', 'lcov', 'html'],
echo   collectCoverageFrom: [
echo     'src/**/*.js',
echo     '^!src/app.js'
echo   ]
echo };
) > jest.config.js

echo ✅ Jest配置创建完成

:: 创建sequelize配置
echo.
echo 📄 创建sequelize配置...

(
echo require('dotenv'^).config(^);
echo.
echo module.exports = {
echo   development: {
echo     username: process.env.DB_USERNAME ^|^| 'root',
echo     password: process.env.DB_PASSWORD ^|^| '',
echo     database: process.env.DB_NAME ^|^| 'subscription_system',
echo     host: process.env.DB_HOST ^|^| 'localhost',
echo     port: process.env.DB_PORT ^|^| 3306,
echo     dialect: 'mysql',
echo     logging: console.log
echo   },
echo   test: {
echo     username: process.env.DB_USERNAME ^|^| 'root',
echo     password: process.env.DB_PASSWORD ^|^| '',
echo     database: process.env.DB_NAME + '_test' ^|^| 'subscription_system_test',
echo     host: process.env.DB_HOST ^|^| 'localhost',
echo     port: process.env.DB_PORT ^|^| 3306,
echo     dialect: 'mysql',
echo     logging: false
echo   },
echo   production: {
echo     username: process.env.DB_USERNAME,
echo     password: process.env.DB_PASSWORD,
echo     database: process.env.DB_NAME,
echo     host: process.env.DB_HOST,
echo     port: process.env.DB_PORT,
echo     dialect: 'mysql',
echo     logging: false
echo   }
echo };
) > config\config.js

echo ✅ sequelize配置创建完成

:: 创建.sequelizerc
echo.
echo 📄 创建.sequelizerc...

(
echo const path = require('path'^);
echo.
echo module.exports = {
echo   'config': path.resolve('config', 'config.js'^),
echo   'models-path': path.resolve('src', 'models'^),
echo   'seeders-path': path.resolve('seeders'^),
echo   'migrations-path': path.resolve('migrations'^)
echo };
) > .sequelizerc

echo ✅ .sequelizerc 创建完成

echo.
echo 🎉 后端项目结构创建完成！
echo.
echo 📊 项目统计：
echo ✅ 目录结构：完整创建
echo ✅ 配置文件：8个
echo ✅ 基础脚本：2个  
echo ✅ 工具文件：2个
echo ✅ Docker配置：已创建
echo ✅ PM2配置：已创建
echo.
echo 📋 下一步操作指南：
echo.
echo 1️⃣ 进入后端目录：
echo    cd backend
echo.
echo 2️⃣ 安装项目依赖：
echo    npm install
echo.
echo 3️⃣ 复制并编辑环境配置：
echo    copy .env.example .env
echo    然后编辑 .env 文件配置数据库信息
echo.
echo 4️⃣ 初始化项目：
echo    npm run setup
echo.
echo 5️⃣ 安装数据库迁移工具：
echo    npm install -g sequelize-cli
echo.
echo 6️⃣ 生成订阅模型和迁移：
echo    npx sequelize-cli model:generate --name Subscription --attributes contactType:enum,contactValue:string,source:enum,status:enum
echo.
echo 7️⃣ 启动开发服务器：
echo    npm run dev
echo.
echo 💡 提示：
echo - 服务器默认运行在 http://localhost:3000
echo - 健康检查地址：http://localhost:3000/health
echo - 项目完整的实现代码请参考《后端实现指南.md》
echo.
echo 🔗 相关文档：
echo - API接口设计：admin/API接口设计文档.md
echo - 后端实现指南：后端实现指南.md

echo.
pause 