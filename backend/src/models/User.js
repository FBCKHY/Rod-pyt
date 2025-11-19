const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * 用户模型
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  nickname: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  mobile: {
    type: DataTypes.STRING(20)
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  department: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active'
  },
  last_login_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    // 保存前自动加密密码
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @returns {Promise<boolean>}
 */
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * 转换为安全的JSON对象(不包含密码)
 * @returns {Object}
 */
User.prototype.toSafeJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
