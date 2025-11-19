'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '分类ID'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '分类名称'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '父分类ID',
        references: {
          model: 'product_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '分类图标'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '分类描述'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序权重'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '分类状态'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // 添加索引
    await queryInterface.addIndex('product_categories', ['parent_id']);
    await queryInterface.addIndex('product_categories', ['status']);
    await queryInterface.addIndex('product_categories', ['sort_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_categories');
  }
}; 