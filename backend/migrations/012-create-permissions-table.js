'use strict';

/**
 * 创建权限表
 * 用于存储系统权限信息
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '权限ID'
      },
      permission_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '权限代码(如: user:create, product:delete)'
      },
      permission_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '权限名称'
      },
      resource: {
        type: Sequelize.STRING(100),
        comment: '资源(如: user, product, order)'
      },
      action: {
        type: Sequelize.STRING(50),
        comment: '操作(如: create, read, update, delete)'
      },
      description: {
        type: Sequelize.TEXT,
        comment: '权限描述'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    }, {
      comment: '权限表'
    });

    // 添加索引
    await queryInterface.addIndex('permissions', ['permission_code'], {
      name: 'idx_permissions_code'
    });
    await queryInterface.addIndex('permissions', ['resource'], {
      name: 'idx_permissions_resource'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('permissions');
  }
};
