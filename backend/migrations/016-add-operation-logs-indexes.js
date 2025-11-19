'use strict';

/**
 * 为操作日志表添加索引以提升查询性能
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加常用查询字段的索引
    await queryInterface.addIndex('operation_logs', ['module'], {
      name: 'idx_operation_logs_module'
    });
    
    await queryInterface.addIndex('operation_logs', ['action'], {
      name: 'idx_operation_logs_action'
    });
    
    await queryInterface.addIndex('operation_logs', ['username'], {
      name: 'idx_operation_logs_username'
    });
    
    await queryInterface.addIndex('operation_logs', ['user_id'], {
      name: 'idx_operation_logs_user_id'
    });
    
    // 添加创建时间索引（用于排序和时间范围查询）
    await queryInterface.addIndex('operation_logs', ['created_at'], {
      name: 'idx_operation_logs_created_at'
    });
    
    // 添加组合索引（常用查询组合）
    await queryInterface.addIndex('operation_logs', ['module', 'action', 'created_at'], {
      name: 'idx_operation_logs_module_action_time'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 删除索引
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_module');
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_action');
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_username');
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_user_id');
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_created_at');
    await queryInterface.removeIndex('operation_logs', 'idx_operation_logs_module_action_time');
  }
};
