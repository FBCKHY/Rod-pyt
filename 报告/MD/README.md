# 容电厨电网站项目

一个完整的厨电企业网站系统，包含前端展示、后端API和管理后台。

## 📋 项目结构

```
oai 08/
├── web Site/          # 前端网站
│   └── web PC/        # PC端网站
├── backend/           # 后端API服务
├── admin/             # 管理后台
└── 产品详情页面模版/  # 产品详情页模板
```

## 🚀 技术栈

### 前端网站
- HTML5, CSS3, JavaScript
- Bootstrap 5
- AOS动画库
- Font Awesome图标

### 后端API
- Node.js + Express
- PostgreSQL数据库
- Sequelize ORM
- JWT认证
- Swagger API文档

### 管理后台
- Vue 3 + TypeScript
- Element Plus
- Pinia状态管理
- Vue Router
- Axios

## 📦 安装和运行

### 前置要求
- Node.js 16+
- PostgreSQL 15
- npm或pnpm

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 管理后台
cd admin
npm install
```

### 2. 配置环境变量

复制 `backend/.env.example` 为 `backend/.env` 并配置：

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscription_system
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DIALECT=postgres
```

### 3. 初始化数据库

```bash
cd backend
npm run db:migrate
```

### 4. 启动服务

```bash
# 启动后端（开发模式）
cd backend
npm run dev

# 启动管理后台（开发模式）
cd admin
npm run dev
```

### 5. 访问网站

- 前端网站: http://localhost:3000/index.html
- API文档: http://localhost:3000/api-docs
- 管理后台: http://localhost:3006

## 🎯 主要功能

### 前端网站
- ✅ 响应式设计
- ✅ 产品展示
- ✅ 公司介绍
- ✅ 新闻资讯
- ✅ 联系我们
- ✅ 订阅功能

### 后端API
- ✅ RESTful API
- ✅ 产品管理
- ✅ 分类管理
- ✅ 订阅管理
- ✅ 文件上传
- ✅ JWT认证

### 管理后台
- ✅ 产品管理
- ✅ 分类管理
- ✅ 订阅管理
- ✅ 用户管理
- ✅ 权限管理

## 📝 API文档

启动后端服务后访问: http://localhost:3000/api-docs

## 🔧 开发指南

详细的开发指南请查看：
- [前端后端集成指南](./前端后端集成指南.md)
- [安装和部署指南](./web%20Site/安装和部署指南.md)
- [API接口设计文档](./admin/API接口设计文档.md)

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- Email: your.email@example.com
- Website: http://your-website.com
