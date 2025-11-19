const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();
const path = require('path');

const sequelize = require('./config/database');
const logger = require('./utils/logger');
const { formatResponse } = require('./utils/response');
const errorHandler = require('./middleware/errorHandler');
const { specs, swaggerUi, swaggerConfig } = require('./config/swagger');

// 路由导入
const subscriptionRoutes = require('./routes/subscriptions');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const productCategoryRoutes = require('./routes/productCategories');
const productTagRoutes = require('./routes/productTags');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roleRoutes = require('./routes/roles');
const permissionRoutes = require('./routes/permissions');
const operationLogRoutes = require('./routes/operationLogs');
const uploadRoutes = require('./routes/upload');

const app = express();

// 计算项目根目录（backend/src -> ../../ 为工作区根目录）
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 基础中间件（允许跨源资源加载图片等）
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "script-src-elem": [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "style-src-elem": [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "img-src": [
        "'self'",
        "data:",
        "blob:",
        "http://localhost:3000",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "font-src": [
        "'self'",
        "data:",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      "connect-src": ["'self'", "http://localhost:3000"],
      "frame-ancestors": ["'self'"]
    }
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3006', 
    'http://localhost:8080',
    'http://127.0.0.1:60436',
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/localhost:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 限流中间件
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个IP最多100个请求
  message: formatResponse(429, '请求过于频繁，请稍后重试'),
  standardHeaders: true,
  legacyHeaders: false
});

// 仅在生产环境或显式开启时启用限流
const IS_PROD = process.env.NODE_ENV === 'production';
const RATE_LIMIT_ENABLED = (process.env.RATE_LIMIT_ENABLED || '').toLowerCase() === 'true' || IS_PROD;
if (RATE_LIMIT_ENABLED) {
  app.use('/api', limiter);
}

// JSON解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态资源：对外暴露 uploads 与 products
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/products', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(process.cwd(), 'public', 'products')));
// 新增：对外暴露含有全站 CSS/JS/图片的 "web Site" 目录（使用项目根路径）
app.use('/web Site', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(PROJECT_ROOT, 'web Site')));
// 新增：常用根路径 /assets 直达 PC 端资源目录，提高兼容性（使用项目根路径）
app.use('/assets', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(PROJECT_ROOT, 'web Site', 'web PC', 'assets')));
// 新增：将网站根路径 '/' 映射到 PC 站点根目录，便于直接访问 /index.html、/pages/*
app.use('/', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(PROJECT_ROOT, 'web Site', 'web PC')));

// Swagger API文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerConfig));

// 健康检查
app.get('/health', (req, res) => {
  res.json(formatResponse(200, 'Service is healthy', {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  }));
});

// 处理所有OPTIONS请求
app.options('*', cors());

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/operation-logs', operationLogRoutes);
app.use('/api/upload', uploadRoutes);

// 静态文件服务 - 提供上传的文件访问
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/product-tags', productTagRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json(formatResponse(404, '接口不存在'));
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    app.listen(PORT, HOST, () => {
      logger.info('服务器启动成功', {
        port: PORT,
        host: HOST,
        env: process.env.NODE_ENV
      });
      console.log(`🚀 服务器运行在 http://${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('服务器启动失败', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
