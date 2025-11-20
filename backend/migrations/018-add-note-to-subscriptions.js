'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'note', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '备注信息'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('subscriptions', 'note');
  }
};
