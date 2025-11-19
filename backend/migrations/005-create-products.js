'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '产品ID'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '产品名称'
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: '产品型号（唯一）'
      },
      product_code: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: '产品编码（例如自动生成的RD-001）'
      },
      card_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '产品卡片图片URL'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: '产品价格'
      },
      short_desc: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '产品简短描述'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '所属分类ID',
        references: {
          model: 'product_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      promo_position: {
        type: Sequelize.ENUM('none', 'homepage_banner', 'category_top', 'homepage_recommend'),
        defaultValue: 'none',
        comment: '推广位置'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'draft'),
        defaultValue: 'active',
        comment: '产品状态'
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: '产品详情页文件路径'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '排序权重'
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '查看次数'
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
    await queryInterface.addIndex('products', ['model'], { unique: true });
    await queryInterface.addIndex('products', ['product_code'], { unique: true });
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['status']);
    await queryInterface.addIndex('products', ['promo_position']);
    await queryInterface.addIndex('products', ['sort_order']);
    await queryInterface.addIndex('products', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
}; 