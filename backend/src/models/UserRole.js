const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 用户角色关联模型
 */
const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'user_roles',
  underscored: true,
  timestamps: false  // 禁用时间戳
});

module.exports = UserRole;
