const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '订阅系统API',
      version: '1.0.0',
      description: '企业网站订阅系统的后端API接口文档',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.example.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' 
          ? '生产环境' 
          : '开发环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: '订阅ID'
            },
            contactType: {
              type: 'string',
              enum: ['email', 'wechat', 'phone'],
              description: '联系方式类型'
            },
            contactValue: {
              type: 'string',
              description: '联系方式值'
            },
            source: {
              type: 'string',
              enum: ['website_footer', 'contact_form', 'manual'],
              description: '订阅来源'
            },
            status: {
              type: 'string',
              enum: ['subscribed', 'unsubscribed'],
              description: '订阅状态'
            },
            subscribedAt: {
              type: 'string',
              format: 'date-time',
              description: '订阅时间'
            },
            ipAddress: {
              type: 'string',
              description: 'IP地址'
            },
            userAgent: {
              type: 'string',
              description: '用户代理'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            code: {
              type: 'integer',
              description: '响应状态码'
            },
            msg: {
              type: 'string',
              description: '响应消息'
            },
            data: {
              description: '响应数据'
            },
            timestamp: {
              type: 'integer',
              description: '时间戳'
            }
          }
        },
        SubscriptionList: {
          type: 'object',
          properties: {
            list: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Subscription'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  description: '当前页码'
                },
                size: {
                  type: 'integer',
                  description: '每页条数'
                },
                total: {
                  type: 'integer',
                  description: '总记录数'
                },
                pages: {
                  type: 'integer',
                  description: '总页数'
                }
              }
            }
          }
        },
        SubscriptionStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: '总订阅数'
            },
            subscribed: {
              type: 'integer',
              description: '已订阅数'
            },
            unsubscribed: {
              type: 'integer',
              description: '已取消订阅数'
            },
            todayNew: {
              type: 'integer',
              description: '今日新增'
            },
            thisWeekNew: {
              type: 'integer',
              description: '本周新增'
            },
            thisMonthNew: {
              type: 'integer',
              description: '本月新增'
            },
            byContactType: {
              type: 'object',
              properties: {
                email: { type: 'integer' },
                wechat: { type: 'integer' },
                phone: { type: 'integer' }
              }
            },
            bySource: {
              type: 'object',
              properties: {
                website_footer: { type: 'integer' },
                contact_form: { type: 'integer' },
                manual: { type: 'integer' }
              }
            },
            trend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date' },
                  newSubscriptions: { type: 'integer' },
                  unsubscriptions: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Subscriptions',
        description: '订阅管理接口'
      },
      {
        name: 'Admin',
        description: '后台管理接口'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJSDoc(options);

const swaggerConfig = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '订阅系统API文档',
  swaggerOptions: {
    docExpansion: 'none',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
}; 