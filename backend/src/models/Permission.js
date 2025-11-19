const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 权限模型
 */
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  permission_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  permission_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  resource: {
    type: DataTypes.STRING(100)
  },
  action: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'permissions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Permission;
