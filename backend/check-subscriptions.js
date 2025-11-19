const { Subscription } = require('./src/models');

async function checkSubscriptions() {
  try {
    console.log('🔍 检查数据库中的订阅记录...\n');
    
    const subscriptions = await Subscription.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      raw: true
    });
    
    console.log(`📊 找到 ${subscriptions.length} 条订阅记录:\n`);
    
    if (subscriptions.length === 0) {
      console.log('❌ 数据库中没有订阅记录！');
      console.log('\n可能的原因:');
      console.log('1. 订阅提交失败');
      console.log('2. 数据库连接问题');
      console.log('3. 数据保存失败');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. ID: ${sub.id}`);
        console.log(`   联系方式: ${sub.contactType} - ${sub.contactValue}`);
        console.log(`   来源: ${sub.source}`);
        console.log(`   状态: ${sub.status}`);
        console.log(`   创建时间: ${sub.createdAt}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    process.exit(1);
  }
}

checkSubscriptions();
