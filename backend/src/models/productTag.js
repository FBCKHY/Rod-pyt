const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductTag = sequelize.define('ProductTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '标签ID'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '标签名称'
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#409EFF',
    comment: '标签颜色（HEX）'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '标签图标'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '标签描述'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '标签状态'
  }
}, {
  tableName: 'product_tags',
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = ProductTag; 