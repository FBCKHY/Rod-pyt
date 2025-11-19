'use strict';

/**
 * 创建用户角色关联表
 * 用于存储用户和角色的多对多关系
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '用户ID'
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '角色ID'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '创建时间'
      }
    }, {
      comment: '用户角色关联表'
    });

    // 添加唯一索引,防止重复分配
    await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
      unique: true,
      name: 'idx_user_roles_unique'
    });
    
    // 添加外键索引
    await queryInterface.addIndex('user_roles', ['user_id'], {
      name: 'idx_user_roles_user_id'
    });
    await queryInterface.addIndex('user_roles', ['role_id'], {
      name: 'idx_user_roles_role_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_roles');
  }
};
