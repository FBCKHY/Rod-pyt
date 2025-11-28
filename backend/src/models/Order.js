const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单ID'
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'order_number',
    comment: '订单号（唯一）'
  },
  // 客户信息
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'customer_name',
    comment: '客户姓名'
  },
  customerEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'customer_email',
    comment: '客户邮箱'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'customer_phone',
    comment: '客户手机号'
  },
  // 收货地址
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '城市'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '区/县'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '详细地址'
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'postal_code',
    comment: '邮政编码'
  },
  // 订单金额
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_amount',
    comment: '订单总金额'
  },
  // 订单状态
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
    comment: '订单状态'
  },
  // 备注
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '客户备注'
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_note',
    comment: '管理员备注'
  },
  // 时间戳
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmed_at',
    comment: '确认时间'
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'shipped_at',
    comment: '发货时间'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
    comment: '送达时间'
  }
}, {
  tableName: 'orders',
  indexes: [
    {
      unique: true,
      fields: ['order_number']
    },
    {
      fields: ['customer_phone']
    },
    {
      fields: ['status']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = Order;
