'use strict';

/**
 * 创建操作日志表
 * 记录用户的所有操作行为
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('operation_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '操作用户ID'
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '操作用户名'
      },
      module: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '操作模块(user/role/permission等)'
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: '操作类型(create/update/delete等)'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '操作描述'
      },
      ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '操作IP地址'
      },
      user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '用户代理'
      },
      request_method: {
        type: Sequelize.STRING(10),
        allowNull: true,
        comment: '请求方法'
      },
      request_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '请求URL'
      },
      request_params: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '请求参数(JSON)'
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '响应状态码'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '错误信息'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '执行时长(ms)'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 添加索引
    await queryInterface.addIndex('operation_logs', ['user_id']);
    await queryInterface.addIndex('operation_logs', ['module']);
    await queryInterface.addIndex('operation_logs', ['action']);
    await queryInterface.addIndex('operation_logs', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('operation_logs');
  }
};
