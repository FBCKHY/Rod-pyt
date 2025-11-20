const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订阅ID'
  },
  contactType: {
    type: DataTypes.ENUM('email', 'wechat', 'phone'),
    allowNull: false,
    field: 'contact_type',
    comment: '联系方式类型'
  },
  contactValue: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'contact_value',
    comment: '联系方式值'
  },
  source: {
    type: DataTypes.ENUM('website_footer', 'contact_form', 'manual'),
    allowNull: false,
    comment: '订阅来源'
  },
  status: {
    type: DataTypes.ENUM('subscribed', 'unsubscribed'),
    defaultValue: 'subscribed',
    comment: '订阅状态'
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'subscribed_at',
    comment: '订阅时间'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
    comment: 'IP地址'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
    comment: '用户代理信息'
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'full_name',
    comment: '用户姓名'
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '咨询主题'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '留言内容'
  },
  userSource: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'user_source',
    comment: '用户来源'
  },
  preferredTime: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'preferred_time',
    comment: '期望服务时间'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '服务地址'
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '特殊需求'
  },
  company: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '公司名称'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注信息'
  }
}, {
  tableName: 'subscriptions',
  indexes: [
    {
      unique: true,
      fields: ['contact_type', 'contact_value'],
      name: 'unique_contact'
    },
    {
      fields: ['status']
    },
    {
      fields: ['source']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['contact_type']
    }
  ]
});

module.exports = Subscription; 