'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 对于 MySQL: 使用 LONGTEXT 存储较长的base64图片
    await queryInterface.changeColumn('products', 'card_image', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      comment: '产品卡片图片（可能为base64或URL）'
    });
  },

  async down(queryInterface, Sequelize) {
    // 回滚为原来的长度限制（可能会截断数据，请谨慎）
    await queryInterface.changeColumn('products', 'card_image', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: '产品卡片图片URL'
    });
  }
}; 