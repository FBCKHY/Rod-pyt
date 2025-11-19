# 订阅系统 API 接口设计文档

## 📋 API 概述

本文档定义了订阅系统的完整API接口规范，包括前端订阅提交和后台管理的所有接口。

### 🔗 基础信息

- **API 基础路径**: `https://api.yourdomain.com`
- **API 版本**: `v1`
- **认证方式**: JWT Token (后台管理接口)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 📊 通用响应格式

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "timestamp": 1703123456789
}
```

### 📝 状态码说明

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 操作成功完成 |
| 400 | 请求参数错误 | 缺少必填参数、格式错误 |
| 401 | 未授权 | Token无效或过期 |
| 403 | 权限不足 | 无操作权限 |
| 409 | 数据冲突 | 联系方式已存在 |
| 500 | 服务器内部错误 | 系统异常 |

---

## 🌐 前端订阅接口

### 1. 提交订阅

**接口说明**: 用户在网站前端提交订阅信息

- **URL**: `POST /api/subscriptions`
- **认证**: 无需认证
- **请求头**:
```
Content-Type: application/json
```

**请求参数**:
```json
{
  "contactType": "email|wechat|phone",
  "contactValue": "用户联系方式",
  "source": "website_footer|contact_form|manual",
  "userAgent": "浏览器信息",
  "ipAddress": "客户端IP（可选，服务器端获取）"
}
```

**参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contactType | string | 是 | 联系方式类型：email(邮箱)、wechat(微信号)、phone(手机号) |
| contactValue | string | 是 | 联系方式值，需符合对应类型格式 |
| source | string | 是 | 订阅来源：website_footer(网站页脚)、contact_form(联系表单)、manual(手动添加) |
| userAgent | string | 否 | 用户浏览器信息 |
| ipAddress | string | 否 | 客户端IP地址（一般由服务器获取） |

**成功响应**:
```json
{
  "code": 200,
  "msg": "订阅成功",
  "data": {
    "id": 123,
    "contactType": "email",
    "contactValue": "user@example.com",
    "status": "subscribed",
    "subscribedAt": "2024-01-15T14:30:25Z"
  },
  "timestamp": 1703123456789
}
```

**失败响应示例**:
```json
{
  "code": 409,
  "msg": "该联系方式已存在",
  "data": {
    "existingId": 123,
    "status": "subscribed"
  },
  "timestamp": 1703123456789
}
```

**错误码说明**:
- `400`: 参数格式错误（如邮箱格式不正确）
- `409`: 联系方式已存在
- `500`: 服务器内部错误

**请求示例**:
```javascript
// 前端JavaScript调用示例
const response = await fetch('/api/subscriptions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contactType: 'email',
    contactValue: 'user@example.com',
    source: 'website_footer',
    userAgent: navigator.userAgent
  })
});

const result = await response.json();
if (result.code === 200) {
  console.log('订阅成功:', result.data);
} else {
  console.error('订阅失败:', result.msg);
}
```

---

## 🔧 后台管理接口

### 认证说明

后台管理接口需要在请求头中携带有效的JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

### 2. 获取订阅列表

**接口说明**: 获取订阅用户列表，支持分页和筛选

- **URL**: `GET /api/admin/subscriptions`
- **认证**: 需要管理员权限

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| size | integer | 否 | 每页条数，默认20 |
| status | string | 否 | 状态筛选：subscribed、unsubscribed |
| contactType | string | 否 | 联系方式类型：email、wechat、phone |
| source | string | 否 | 来源筛选：website_footer、contact_form、manual |
| contact | string | 否 | 联系方式关键字搜索 |
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD |
| endDate | string | 否 | 结束日期，格式：YYYY-MM-DD |

**成功响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "list": [
      {
        "id": 1,
        "contactType": "email",
        "contactValue": "user@example.com",
        "source": "website_footer",
        "status": "subscribed",
        "subscribedAt": "2024-01-15T14:30:25Z",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-01-15T14:30:25Z",
        "updatedAt": "2024-01-15T14:30:25Z"
      }
    ],
    "pagination": {
      "page": 1,
      "size": 20,
      "total": 100,
      "pages": 5
    }
  },
  "timestamp": 1703123456789
}
```

### 3. 切换订阅状态

**接口说明**: 切换用户的订阅状态（订阅/取消订阅）

- **URL**: `PUT /api/admin/subscriptions/{id}/status`
- **认证**: 需要管理员权限

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 订阅记录ID |

**请求参数**:
```json
{
  "status": "subscribed|unsubscribed"
}
```

**成功响应**:
```json
{
  "code": 200,
  "msg": "状态更新成功",
  "data": {
    "id": 123,
    "status": "unsubscribed",
    "updatedAt": "2024-01-15T15:30:25Z"
  },
  "timestamp": 1703123456789
}
```

### 4. 删除订阅记录

**接口说明**: 删除单个订阅记录

- **URL**: `DELETE /api/admin/subscriptions/{id}`
- **认证**: 需要管理员权限

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | integer | 是 | 订阅记录ID |

**成功响应**:
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": {
    "deletedId": 123
  },
  "timestamp": 1703123456789
}
```

### 5. 批量删除订阅记录

**接口说明**: 批量删除多个订阅记录

- **URL**: `DELETE /api/admin/subscriptions/batch`
- **认证**: 需要管理员权限

**请求参数**:
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**成功响应**:
```json
{
  "code": 200,
  "msg": "批量删除成功",
  "data": {
    "deletedCount": 5,
    "deletedIds": [1, 2, 3, 4, 5]
  },
  "timestamp": 1703123456789
}
```

### 6. 新增订阅用户

**接口说明**: 手动添加订阅用户

- **URL**: `POST /api/admin/subscriptions`
- **认证**: 需要管理员权限

**请求参数**:
```json
{
  "contactType": "email|wechat|phone",
  "contactValue": "联系方式",
  "source": "manual"
}
```

**成功响应**:
```json
{
  "code": 200,
  "msg": "添加成功",
  "data": {
    "id": 124,
    "contactType": "email",
    "contactValue": "admin@example.com",
    "source": "manual",
    "status": "subscribed",
    "subscribedAt": "2024-01-15T16:30:25Z"
  },
  "timestamp": 1703123456789
}
```

### 7. 获取订阅统计数据

**接口说明**: 获取订阅系统的统计信息

- **URL**: `GET /api/admin/subscriptions/stats`
- **认证**: 需要管理员权限

**成功响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 1250,
    "subscribed": 1180,
    "unsubscribed": 70,
    "todayNew": 15,
    "thisWeekNew": 89,
    "thisMonthNew": 234,
    "byContactType": {
      "email": 800,
      "wechat": 300,
      "phone": 150
    },
    "bySource": {
      "website_footer": 900,
      "contact_form": 300,
      "manual": 50
    },
    "trend": [
      {
        "date": "2024-01-15",
        "newSubscriptions": 15,
        "unsubscriptions": 2
      },
      {
        "date": "2024-01-14",
        "newSubscriptions": 12,
        "unsubscriptions": 1
      }
    ]
  },
  "timestamp": 1703123456789
}
```

### 8. 导出订阅数据

**接口说明**: 导出订阅数据为Excel文件

- **URL**: `GET /api/admin/subscriptions/export`
- **认证**: 需要管理员权限

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选 |
| contactType | string | 否 | 联系方式类型 |
| source | string | 否 | 来源筛选 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**成功响应**:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="subscriptions_20240115.xlsx"

[Excel文件内容]
```

### 9. 验证联系方式是否已存在

**接口说明**: 检查指定联系方式是否已经订阅

- **URL**: `GET /api/admin/subscriptions/check`
- **认证**: 需要管理员权限

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contactType | string | 是 | 联系方式类型 |
| contactValue | string | 是 | 联系方式值 |

**成功响应**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "exists": true,
    "subscription": {
      "id": 123,
      "status": "subscribed",
      "subscribedAt": "2024-01-15T14:30:25Z"
    }
  },
  "timestamp": 1703123456789
}
```

---

## 🗄️ 数据库设计

### 订阅表 (subscriptions)

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订阅ID',
  contact_type ENUM('email', 'wechat', 'phone') NOT NULL COMMENT '联系方式类型',
  contact_value VARCHAR(255) NOT NULL COMMENT '联系方式值',
  source ENUM('website_footer', 'contact_form', 'manual') NOT NULL COMMENT '订阅来源',
  status ENUM('subscribed', 'unsubscribed') DEFAULT 'subscribed' COMMENT '订阅状态',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '订阅时间',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  UNIQUE KEY unique_contact (contact_type, contact_value),
  INDEX idx_status (status),
  INDEX idx_source (source),
  INDEX idx_created_at (created_at),
  INDEX idx_contact_type (contact_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订阅用户表';
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| contact_type | ENUM | 联系方式类型：email(邮箱)、wechat(微信号)、phone(手机号) |
| contact_value | VARCHAR(255) | 联系方式的具体值 |
| source | ENUM | 订阅来源：website_footer(网站页脚)、contact_form(联系表单)、manual(手动添加) |
| status | ENUM | 订阅状态：subscribed(已订阅)、unsubscribed(已取消) |
| subscribed_at | TIMESTAMP | 初次订阅时间 |
| ip_address | VARCHAR(45) | 客户端IP地址（支持IPv6） |
| user_agent | TEXT | 浏览器用户代理信息 |
| created_at | TIMESTAMP | 记录创建时间 |
| updated_at | TIMESTAMP | 记录更新时间 |

---

## 🔒 安全考虑

### 1. 数据验证

- **联系方式格式验证**: 严格验证邮箱、手机号、微信号格式
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 对用户输入进行HTML转义

### 2. 访问控制

- **后台接口认证**: JWT Token验证
- **权限控制**: 基于角色的访问控制(RBAC)
- **IP白名单**: 可选的IP访问限制

### 3. 数据保护

- **敏感信息加密**: 可选择对联系方式进行加密存储
- **数据备份**: 定期备份订阅数据
- **隐私合规**: 符合GDPR、CCPA等隐私法规

---

## 📊 监控与日志

### 1. 接口监控

- **响应时间监控**: 监控各接口的平均响应时间
- **成功率监控**: 监控接口成功率和错误率
- **并发量监控**: 监控接口并发请求数量

### 2. 业务监控

- **订阅转化率**: 监控订阅成功率
- **用户来源分析**: 分析不同来源的订阅量
- **时间趋势分析**: 分析订阅数量的时间趋势

### 3. 日志记录

```json
{
  "timestamp": "2024-01-15T14:30:25Z",
  "level": "INFO",
  "endpoint": "/api/subscriptions",
  "method": "POST",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "req-123456",
  "responseTime": 150,
  "statusCode": 200,
  "requestBody": {
    "contactType": "email",
    "contactValue": "user@example.com",
    "source": "website_footer"
  },
  "responseBody": {
    "code": 200,
    "msg": "订阅成功"
  }
}
```

---

## 🚀 部署建议

### 1. 环境配置

- **开发环境**: 使用Mock数据或测试数据库
- **测试环境**: 使用独立的测试数据库
- **生产环境**: 使用高可用数据库集群

### 2. 性能优化

- **数据库优化**: 添加合适的索引，定期优化查询
- **缓存策略**: 对统计数据使用Redis缓存
- **CDN加速**: 静态资源使用CDN分发

### 3. 扩展性考虑

- **水平扩展**: 支持多实例部署
- **数据库分片**: 大数据量时考虑分库分表
- **异步处理**: 邮件发送等操作使用消息队列

---

**文档版本**: v1.0  
**创建日期**: 2024-12-01  
**最后更新**: 2024-12-01  
**维护人员**: 开发团队 