/**
 * 添加测试数据脚本
 * 运行方式: node migrations/seed-test-data.js
 */

const { sequelize, Product, ProductCategory, Order, OrderItem } = require('../src/models');

async function seedData() {
  try {
    console.log('🌱 开始添加测试数据...\n');

    // 1. 检查是否已有分类
    let category = await ProductCategory.findOne({ where: { name: '燃气灶系列' } });
    
    if (!category) {
      console.log('📦 创建测试分类...');
      category = await ProductCategory.create({
        name: '燃气灶系列',
        icon: 'fire',
        description: '高效节能的燃气灶产品',
        sortOrder: 1,
        status: 'active'
      });
      console.log('✅ 分类创建成功:', category.name);
    } else {
      console.log('✅ 分类已存在:', category.name);
    }

    // 2. 检查是否已有产品
    let product = await Product.findOne({ where: { model: 'RD-XH-PRO-2024' } });
    
    if (!product) {
      console.log('\n📦 创建测试产品...');
      product = await Product.create({
        name: '星火Pro 智能燃气灶',
        model: 'RD-XH-PRO-2024',
        categoryId: category.id,
        price: 2499.00,
        shortDesc: '高效节能 · 智能控温 · 安全可靠',
        tag: '热销',
        sales: 1580,
        features: [
          { icon: 'fire', text: '蓝焰技术' },
          { icon: 'shield', text: '多重安全' },
          { icon: 'leaf', text: '节能环保' }
        ],
        status: 'active',
        filePath: '/产品详情页面模版/RD-001/产品详情.html',
        sortOrder: 1,
        viewCount: 0
      });
      console.log('✅ 产品创建成功:', product.name);
    } else {
      console.log('✅ 产品已存在:', product.name);
    }

    // 3. 创建测试订单
    console.log('\n📦 创建测试订单...');
    
    const orderNumber = 'RD' + Date.now().toString().slice(-10);
    
    const order = await Order.create({
      orderNumber: orderNumber,
      customerName: '张三',
      customerEmail: 'zhangsan@example.com',
      customerPhone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '科技园南区深圳湾科技生态园10栋A座',
      postalCode: '518000',
      totalAmount: 2499.00,
      status: 'pending',
      note: '请尽快发货'
    });
    
    console.log('✅ 订单创建成功:', order.orderNumber);

    // 4. 创建订单项
    console.log('\n📦 创建订单项...');
    
    const orderItem = await OrderItem.create({
      orderId: order.id,
      productId: product.id,
      productName: product.name,
      productModel: product.model,
      productImage: product.cardImage,
      quantity: 1,
      price: product.price,
      subtotal: product.price
    });
    
    console.log('✅ 订单项创建成功');

    // 5. 显示创建的数据
    console.log('\n📊 测试数据汇总:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('分类:', category.name, `(ID: ${category.id})`);
    console.log('产品:', product.name, `(ID: ${product.id})`);
    console.log('  - 型号:', product.model);
    console.log('  - 价格:', product.price);
    console.log('  - 销量:', product.sales);
    console.log('订单:', order.orderNumber, `(ID: ${order.id})`);
    console.log('  - 客户:', order.customerName);
    console.log('  - 手机:', order.customerPhone);
    console.log('  - 金额:', order.totalAmount);
    console.log('  - 状态:', order.status);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n🎉 测试数据添加完成！');

  } catch (error) {
    console.error('❌ 添加测试数据失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
seedData()
  .then(() => {
    console.log('\n✅ 脚本执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });
