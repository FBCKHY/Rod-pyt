const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductCategory = sequelize.define('ProductCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '分类ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '分类名称'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id',
    comment: '父分类ID'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '分类图标'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '分类描述'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序权重'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '分类状态'
  }
}, {
  tableName: 'product_categories',
  indexes: [
    {
      fields: ['parent_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// 自关联：支持层级分类
ProductCategory.hasMany(ProductCategory, {
  as: 'children',
  foreignKey: 'parent_id'
});

ProductCategory.belongsTo(ProductCategory, {
  as: 'parent',
  foreignKey: 'parent_id'
});

module.exports = ProductCategory; 