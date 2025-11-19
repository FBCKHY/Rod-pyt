const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 角色权限关联模型
 */
const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  permission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'role_permissions',
  underscored: true,
  timestamps: false  // 禁用时间戳
});

module.exports = RolePermission;
