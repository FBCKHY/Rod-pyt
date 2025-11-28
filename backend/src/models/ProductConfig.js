const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductConfig = sequelize.define('ProductConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '配置ID'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
    comment: '产品ID'
  },
  // 可视化编辑器配置数据
  configData: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'config_data',
    comment: '编辑器配置数据（JSON格式）'
  },
  // 版本控制
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '配置版本号'
  },
  // 是否为当前使用的版本
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: '是否为当前版本'
  }
}, {
  tableName: 'product_configs',
  indexes: [
    {
      fields: ['product_id']
    },
    {
      fields: ['product_id', 'is_active']
    },
    {
      fields: ['version']
    }
  ]
});

module.exports = ProductConfig;
