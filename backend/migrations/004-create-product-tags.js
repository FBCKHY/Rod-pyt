'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_tags', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '标签ID'
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: '标签名称'
      },
      color: {
        type: Sequelize.STRING(7),
        defaultValue: '#409EFF',
        comment: '标签颜色（HEX）'
      },
      icon: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '标签图标'
      },
      description: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: '标签描述'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        comment: '标签状态'
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
    await queryInterface.addIndex('product_tags', ['name']);
    await queryInterface.addIndex('product_tags', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_tags');
  }
}; 