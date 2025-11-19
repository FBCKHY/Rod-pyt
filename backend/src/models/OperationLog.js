const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 操作日志模型
 */
const OperationLog = sequelize.define('OperationLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '操作用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作用户名'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作模块'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '操作描述'
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '操作IP地址'
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '用户代理'
  },
  request_method: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '请求方法'
  },
  request_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '请求URL'
  },
  request_params: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '请求参数'
  },
  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '响应状态码'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '执行时长(ms)'
  }
}, {
  tableName: 'operation_logs',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // 操作日志不需要更新时间
});

module.exports = OperationLog;
