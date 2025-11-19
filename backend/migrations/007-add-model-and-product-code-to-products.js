'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加 model 字段
    const tableDesc = await queryInterface.describeTable('products');
    if (!tableDesc.model) {
      await queryInterface.addColumn('products', 'model', {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: '产品型号（唯一）'
      });
      await queryInterface.addIndex('products', ['model'], { unique: true, name: 'idx_products_model_unique' });
    }

    // 添加 product_code 字段
    if (!tableDesc.product_code) {
      await queryInterface.addColumn('products', 'product_code', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: '产品编码（例如 RD-001）'
      });
      await queryInterface.addIndex('products', ['product_code'], { unique: true, name: 'idx_products_product_code_unique' });
    }
  },

  async down(queryInterface, Sequelize) {
    // 回滚：删除索引与字段（忽略不存在的情况）
    try { await queryInterface.removeIndex('products', 'idx_products_product_code_unique'); } catch {}
    try { await queryInterface.removeIndex('products', 'idx_products_model_unique'); } catch {}
    try { await queryInterface.removeColumn('products', 'product_code'); } catch {}
    try { await queryInterface.removeColumn('products', 'model'); } catch {}
  }
}; 