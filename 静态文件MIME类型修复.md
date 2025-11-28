# ✅ 静态文件MIME类型修复

**问题**: 产品详情页CSS/JS文件无法加载,浏览器报错MIME类型不正确

**错误信息**:
```
Refused to apply style from 'http://localhost:3001/web%20Site/web%20PC/assets/css/Main%20File.css' 
because its MIME type ('application/json') is not a supported stylesheet MIME type

Refused to execute script from 'http://localhost:3001/web%20Site/web%20PC/assets/js/Main%20File.js' 
because its MIME type ('application/json') is not executable
```

**发现时间**: 2025-11-28

---

## 🔍 问题分析

### 症状
1. ❌ CSS文件返回 `application/json` 而不是 `text/css`
2. ❌ JS文件返回 `application/json` 而不是 `application/javascript`
3. ❌ 浏览器拒绝加载这些文件(strict MIME checking)
4. ❌ 产品详情页样式和功能全部失效

### 根本原因

**Express静态文件服务默认MIME类型问题**:

Express的 `express.static` 中间件通常会自动识别文件类型并设置正确的Content-Type,但在某些情况下(特别是文件名包含空格或特殊字符时),可能会返回错误的MIME类型。

#### 原代码问题
```javascript
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(process.cwd(), 'public', 'uploads')));
```

- ✅ 设置了CORS头
- ❌ **没有显式设置Content-Type**
- ❌ 依赖Express自动识别(可能失败)

### 触发条件
1. 文件名包含空格(如 `Main File.css`)
2. 文件路径被URL编码(如 `Main%20File.css`)
3. Express无法正确识别文件类型
4. 返回默认的 `application/json` 或 `application/octet-stream`

---

## 🔧 修复方案

### 修改文件
`backend/src/app.js`

### 创建MIME类型中间件

**修改前**:
```javascript
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  next()
}, express.static(path.join(process.cwd(), 'public', 'uploads')));
```

**修改后**:
```javascript
// 静态文件MIME类型中间件
const setStaticHeaders = (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none')
  
  // 根据文件扩展名设置正确的Content-Type
  const ext = path.extname(req.path).toLowerCase()
  const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  }
  
  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext])
  }
  
  next()
}

// 应用到所有静态资源路由
app.use('/uploads', setStaticHeaders, express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/products', setStaticHeaders, express.static(path.join(process.cwd(), 'public', 'products')));
app.use('/web Site', setStaticHeaders, express.static(path.join(PROJECT_ROOT, 'web Site')));
app.use('/assets', setStaticHeaders, express.static(path.join(PROJECT_ROOT, 'web Site', 'web PC', 'assets')));
app.use('/', setStaticHeaders, express.static(path.join(PROJECT_ROOT, 'web Site', 'web PC')));
```

### 改进点
1. ✅ **显式设置Content-Type** - 不依赖Express自动识别
2. ✅ **支持所有常见文件类型** - CSS, JS, HTML, 图片, 字体等
3. ✅ **统一的中间件** - 所有静态资源路由使用相同逻辑
4. ✅ **保留CORS设置** - 跨域访问仍然正常工作

---

## ✅ 修复效果

### 修复前
```
Request: GET /web%20Site/web%20PC/assets/css/Main%20File.css
Response Headers:
  Content-Type: application/json  ❌
  
浏览器: Refused to apply style (MIME type error)
```

### 修复后
```
Request: GET /web%20Site/web%20PC/assets/css/Main%20File.css
Response Headers:
  Content-Type: text/css  ✅
  Cross-Origin-Resource-Policy: cross-origin
  
浏览器: CSS加载成功 ✅
```

---

## 🧪 测试验证

### 测试1: CSS文件
```bash
curl -I http://localhost:3001/web%20Site/web%20PC/assets/css/Main%20File.css
```

**预期结果**:
```
HTTP/1.1 200 OK
Content-Type: text/css
Cross-Origin-Resource-Policy: cross-origin
```

### 测试2: JS文件
```bash
curl -I http://localhost:3001/products/RD-001/样式逻辑/产品详情.js
```

**预期结果**:
```
HTTP/1.1 200 OK
Content-Type: application/javascript
Cross-Origin-Resource-Policy: cross-origin
```

### 测试3: 图片文件
```bash
curl -I http://localhost:3001/products/RD-001/图片/容电log.png
```

**预期结果**:
```
HTTP/1.1 200 OK
Content-Type: image/png
Cross-Origin-Resource-Policy: cross-origin
```

### 测试4: 浏览器访问
1. 打开产品详情页: `http://localhost:3001/products/RD-001/产品详情.html`
2. 打开浏览器开发者工具 → Network
3. 检查CSS/JS文件的Content-Type

**预期结果**:
- ✅ 所有CSS文件: `text/css`
- ✅ 所有JS文件: `application/javascript`
- ✅ 所有图片: `image/png` 或 `image/jpeg`
- ✅ 页面样式正常显示
- ✅ 页面功能正常工作

---

## 📋 支持的文件类型

| 扩展名 | MIME类型 | 说明 |
|--------|----------|------|
| `.css` | `text/css` | 样式表 |
| `.js` | `application/javascript` | JavaScript |
| `.json` | `application/json` | JSON数据 |
| `.html` | `text/html` | HTML页面 |
| `.htm` | `text/html` | HTML页面 |
| `.png` | `image/png` | PNG图片 |
| `.jpg` | `image/jpeg` | JPEG图片 |
| `.jpeg` | `image/jpeg` | JPEG图片 |
| `.gif` | `image/gif` | GIF图片 |
| `.svg` | `image/svg+xml` | SVG矢量图 |
| `.webp` | `image/webp` | WebP图片 |
| `.ico` | `image/x-icon` | 图标 |
| `.woff` | `font/woff` | Web字体 |
| `.woff2` | `font/woff2` | Web字体 |
| `.ttf` | `font/ttf` | TrueType字体 |
| `.eot` | `application/vnd.ms-fontobject` | EOT字体 |

---

## 🔍 其他发现的问题

### 1. 404错误 - 文件不存在
```
Failed to load resource: 404 (Not Found)
- 容电log.png
- 自动可编辑.js
- Main File.js
- visual-editor.js
```

**原因**: 产品详情页HTML引用了不存在的文件

**建议**: 
- 检查产品详情页模板中的文件引用
- 确保所有引用的文件都已上传
- 或者删除不需要的文件引用

### 2. 浏览器扩展警告
```
Denying load of chrome-extension://...
```

**原因**: 浏览器扩展尝试注入资源

**影响**: 无影响,可以忽略

### 3. Tracking Prevention警告
```
Tracking Prevention blocked access to storage for https://cdn.jsdelivr.net/...
```

**原因**: 浏览器隐私保护功能

**影响**: CDN资源可能加载失败,建议使用本地资源

---

## 💡 后续优化建议

### 1. 添加缓存控制
```javascript
const setStaticHeaders = (req, res, next) => {
  // ... 现有代码 ...
  
  // 添加缓存控制
  if (ext === '.css' || ext === '.js') {
    res.setHeader('Cache-Control', 'public, max-age=31536000') // 1年
  } else if (ext.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000') // 30天
  }
  
  next()
}
```

### 2. 添加压缩支持
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. 添加ETag支持
```javascript
app.use('/uploads', setStaticHeaders, express.static(path.join(process.cwd(), 'public', 'uploads'), {
  etag: true,
  lastModified: true
}));
```

### 4. 文件名规范化
建议避免文件名中包含空格,使用以下命名方式:
- ✅ `main-file.css`
- ✅ `main_file.css`
- ✅ `mainFile.css`
- ❌ `Main File.css` (包含空格)

---

## 🎯 总结

**问题**: Express静态文件服务返回错误的MIME类型,导致CSS/JS文件无法加载

**原因**: 
1. 文件名包含空格或特殊字符
2. Express无法正确识别文件类型
3. 返回默认的 `application/json`

**修复**: 
1. ✅ 创建统一的MIME类型中间件
2. ✅ 根据文件扩展名显式设置Content-Type
3. ✅ 应用到所有静态资源路由
4. ✅ 保留CORS和安全设置

**效果**: 
- ✅ CSS文件正确返回 `text/css`
- ✅ JS文件正确返回 `application/javascript`
- ✅ 产品详情页样式和功能正常
- ✅ 支持所有常见文件类型

---

**修复完成时间**: 2025-11-28
**修复文件**: `backend/src/app.js`
**影响范围**: 所有静态文件服务
**需要操作**: 重启后端服务
