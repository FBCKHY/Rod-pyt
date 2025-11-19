'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_tag_relations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '产品ID',
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '标签ID',
        references: {
          model: 'product_tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // 添加复合唯一索引，确保同一产品不会重复关联同一标签
    await queryInterface.addIndex('product_tag_relations', 
      ['product_id', 'tag_id'], 
      {
        unique: true,
        name: 'unique_product_tag'
      }
    );

    // 添加单独索引
    await queryInterface.addIndex('product_tag_relations', ['product_id']);
    await queryInterface.addIndex('product_tag_relations', ['tag_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_tag_relations');
  }
}; 