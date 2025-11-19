'use strict';

/**
 * 添加updated_at字段到users表(如果不存在)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('users');
    
    // 检查updated_at字段是否存在
    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '更新时间'
      });
      console.log('✅ 添加updated_at字段到users表');
    } else {
      console.log('ℹ️ updated_at字段已存在');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('users');
    if (tableDescription.updated_at) {
      await queryInterface.removeColumn('users', 'updated_at');
    }
  }
};
