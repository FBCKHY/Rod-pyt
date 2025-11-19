const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '产品ID'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '产品名称'
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '产品型号（唯一）'
  },
  cardImage: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'card_image',
    comment: '产品卡片图片（可能为base64或URL）'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '产品价格'
  },
  shortDesc: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'short_desc',
    comment: '产品简短描述'
  },
  // 新增字段：卡片标签
  tag: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '卡片标签（如：热销/新品/特价/推荐）'
  },
  // 新增字段：销售数量
  sales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '销售数量'
  },
  // 新增字段：产品特性（图标+文案），使用JSON
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '产品特性数组 [{icon, text}]'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    comment: '所属分类ID'
  },
  promoPosition: {
    type: DataTypes.ENUM('none', 'homepage_banner', 'category_top', 'homepage_recommend'),
    defaultValue: 'none',
    field: 'promo_position',
    comment: '推广位置'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'active',
    comment: '产品状态'
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'file_path',
    comment: '产品详情页文件路径'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
    comment: '排序权重'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count',
    comment: '查看次数'
  }
}, {
  tableName: 'products',
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['promo_position']
    },
    {
      fields: ['sort_order']
    },
    {
      fields: ['created_at']
    },
    {
      unique: true,
      fields: ['model']
    }
  ]
});

module.exports = Product; 