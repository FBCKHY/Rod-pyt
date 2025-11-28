/**
 * 创建订单相关表的迁移脚本
 * 运行方式: node migrations/create-order-tables.js
 */

const { sequelize, Order, OrderItem, ProductConfig } = require('../src/models');

async function createTables() {
  try {
    console.log('🚀 开始创建订单相关表...\n');

    // 创建 orders 表
    console.log('📦 创建 orders 表...');
    await Order.sync({ force: false });
    console.log('✅ orders 表创建成功\n');

    // 创建 order_items 表
    console.log('📦 创建 order_items 表...');
    await OrderItem.sync({ force: false });
    console.log('✅ order_items 表创建成功\n');

    // 创建 product_configs 表
    console.log('📦 创建 product_configs 表...');
    await ProductConfig.sync({ force: false });
    console.log('✅ product_configs 表创建成功\n');

    console.log('🎉 所有表创建完成！');
    
    // 显示表结构
    console.log('\n📊 表结构信息:');
    const [ordersDesc] = await sequelize.query('DESCRIBE orders');
    console.log('\n📋 orders 表字段:');
    console.table(ordersDesc);

    const [orderItemsDesc] = await sequelize.query('DESCRIBE order_items');
    console.log('\n📋 order_items 表字段:');
    console.table(orderItemsDesc);

    const [configsDesc] = await sequelize.query('DESCRIBE product_configs');
    console.log('\n📋 product_configs 表字段:');
    console.table(configsDesc);

  } catch (error) {
    console.error('❌ 创建表失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行迁移
createTables()
  .then(() => {
    console.log('\n✅ 数据库迁移完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 数据库迁移失败:', error);
    process.exit(1);
  });
