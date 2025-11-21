const subscriptionService = require('./src/services/subscriptionService');

(async () => {
  try {
    console.log('\n=== 测试 getSubscriptionList ===\n');
    
    const result = await subscriptionService.getSubscriptionList({
      page: 1,
      size: 1,
      userSource: '企业客户'
    });
    
    console.log('\n最终返回结果:');
    console.log('total:', result.pagination.total);
    console.log('list length:', result.list.length);
    console.log('list IDs:', result.list.map(r => r.id));
    
    process.exit(0);
  } catch (e) {
    console.error('错误:', e);
    process.exit(1);
  }
})();
