'use strict';

/**
 * 创建用户表
 * 用于存储系统用户信息
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户ID'
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '用户名(登录账号)'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '密码(bcrypt加密)'
      },
      nickname: {
        type: Sequelize.STRING(50),
        comment: '昵称'
      },
      email: {
        type: Sequelize.STRING(100),
        unique: true,
        comment: '邮箱'
      },
      mobile: {
        type: Sequelize.STRING(20),
        comment: '手机号'
      },
      avatar: {
        type: Sequelize.STRING(255),
        comment: '头像URL'
      },
      department: {
        type: Sequelize.STRING(50),
        comment: '部门'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active',
        comment: '状态: active-正常, inactive-禁用, deleted-已删除'
      },
      last_login_at: {
        type: Sequelize.DATE,
        comment: '最后登录时间'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
      }
    }, {
      comment: '用户表'
    });

    // 添加索引
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_users_username'
    });
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email'
    });
    await queryInterface.addIndex('users', ['status'], {
      name: 'idx_users_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
