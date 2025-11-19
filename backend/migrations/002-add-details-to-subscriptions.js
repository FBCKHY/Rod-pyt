'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'full_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '用户姓名'
    });

    await queryInterface.addColumn('subscriptions', 'subject', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '咨询主题'
    });

    await queryInterface.addColumn('subscriptions', 'message', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '留言内容'
    });

    await queryInterface.addColumn('subscriptions', 'user_source', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '用户来源'
    });

    await queryInterface.addColumn('subscriptions', 'preferred_time', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '期望服务时间'
    });

    await queryInterface.addColumn('subscriptions', 'address', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '服务地址'
    });

    await queryInterface.addColumn('subscriptions', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '特殊需求'
    });

    await queryInterface.addColumn('subscriptions', 'company', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: '公司名称'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'full_name');
    await queryInterface.removeColumn('subscriptions', 'subject');
    await queryInterface.removeColumn('subscriptions', 'message');
    await queryInterface.removeColumn('subscriptions', 'user_source');
    await queryInterface.removeColumn('subscriptions', 'preferred_time');
    await queryInterface.removeColumn('subscriptions', 'address');
    await queryInterface.removeColumn('subscriptions', 'requirements');
    await queryInterface.removeColumn('subscriptions', 'company');
  }
}; 