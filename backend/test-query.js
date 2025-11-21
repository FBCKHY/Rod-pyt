const { Op } = require('sequelize');
const Subscription = require('./src/models/subscription');

(async () => {
  try {
    console.log('=== 测试查询 ===\n');
    
    // 查询所有记录
    const all = await Subscription.findAll({
      attributes: ['id', 'userSource'],
      raw: true
    });
    
    console.log('所有记录:');
    all.forEach(r => {
      console.log(`ID ${r.id}: userSource = "${r.userSource}" (长度: ${r.userSource ? r.userSource.length : 0})`);
      if (r.userSource) {
        console.log(`  字符编码:`, Buffer.from(r.userSource).toString('hex'));
      }
    });
    
    console.log('\n=== 测试LIKE查询 ===\n');
    
    // 测试LIKE查询
    const result = await Subscription.findAll({
      where: {
        userSource: { [Op.like]: '%企业客户%' }
      },
      attributes: ['id', 'userSource'],
      raw: true
    });
    
    console.log(`LIKE '%企业客户%' 匹配到 ${result.length} 条:`);
    result.forEach(r => {
      console.log(`  ID ${r.id}: "${r.userSource}"`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error('错误:', e);
    process.exit(1);
  }
})();
