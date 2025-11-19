'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '订阅ID'
      },
      contact_type: {
        type: Sequelize.ENUM('email', 'wechat', 'phone'),
        allowNull: false,
        comment: '联系方式类型'
      },
      contact_value: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '联系方式值'
      },
      source: {
        type: Sequelize.ENUM('website_footer', 'contact_form', 'manual'),
        allowNull: false,
        comment: '订阅来源'
      },
      status: {
        type: Sequelize.ENUM('subscribed', 'unsubscribed'),
        defaultValue: 'subscribed',
        comment: '订阅状态'
      },
      subscribed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        comment: '订阅时间'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP地址'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '用户代理信息'
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

    // 添加唯一索引
    await queryInterface.addIndex('subscriptions', 
      ['contact_type', 'contact_value'], 
      {
        unique: true,
        name: 'unique_contact'
      }
    );

    // 添加其他索引
    await queryInterface.addIndex('subscriptions', ['status']);
    await queryInterface.addIndex('subscriptions', ['source']);
    await queryInterface.addIndex('subscriptions', ['created_at']);
    await queryInterface.addIndex('subscriptions', ['contact_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscriptions');
  }
}; 