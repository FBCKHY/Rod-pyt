const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单项ID'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id',
    comment: '订单ID'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
    comment: '产品ID'
  },
  // 冗余存储产品信息（防止产品删除后订单信息丢失）
  productName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'product_name',
    comment: '产品名称'
  },
  productModel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'product_model',
    comment: '产品型号'
  },
  productImage: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    field: 'product_image',
    comment: '产品图片'
  },
  // 购买信息
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '购买数量'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计'
  },
  // 规格选择（JSON格式存储）
  variant: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '产品规格选择（颜色、尺寸等）'
  }
}, {
  tableName: 'order_items',
  indexes: [
    {
      fields: ['order_id']
    },
    {
      fields: ['product_id']
    }
  ]
});

module.exports = OrderItem;
