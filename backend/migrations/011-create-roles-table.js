'use strict';

/**
 * 创建角色表
 * 用于存储系统角色信息
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '角色ID'
      },
      role_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '角色代码(如: R_SUPER, R_ADMIN, R_USER)'
      },
      role_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '角色名称'
      },
      description: {
        type: Sequelize.TEXT,
        comment: '角色描述'
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: 'active',
        comment: '状态: active-启用, inactive-禁用'
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
      comment: '角色表'
    });

    // 添加索引
    await queryInterface.addIndex('roles', ['role_code'], {
      name: 'idx_roles_code'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roles');
  }
};
