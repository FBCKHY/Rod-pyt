'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('products');

    if (!desc.tag) {
      await queryInterface.addColumn('products', 'tag', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '卡片标签（如：热销/新品/特价/推荐）'
      });
    }

    if (!desc.sales) {
      await queryInterface.addColumn('products', 'sales', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '销售数量'
      });
    }

    if (!desc.features) {
      await queryInterface.addColumn('products', 'features', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: '产品特性数组 [{icon, text}]'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('products');
    if (desc.features) await queryInterface.removeColumn('products', 'features');
    if (desc.sales) await queryInterface.removeColumn('products', 'sales');
    if (desc.tag) await queryInterface.removeColumn('products', 'tag');
  }
}; 