// 在浏览器控制台运行这段代码测试API

console.log('🔍 开始测试订阅列表API...\n');

fetch('/api/admin/subscriptions?page=1&size=20')
  .then(response => {
    console.log('📡 响应状态:', response.status);
    console.log('📡 响应OK:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('\n✅ API响应成功！');
    console.log('📊 完整数据:', data);
    console.log('\n📈 统计信息:');
    console.log('  - 状态码:', data.code);
    console.log('  - 消息:', data.msg);
    console.log('  - 总记录数:', data.data.pagination.total);
    console.log('  - 当前页记录数:', data.data.list.length);
    console.log('\n📋 订阅列表:');
    data.data.list.forEach((item, index) => {
      console.log(`  ${index + 1}. ID:${item.id} - ${item.contactValue} (${item.source})`);
    });
  })
  .catch(error => {
    console.error('\n❌ API调用失败:', error);
    console.error('错误详情:', error.message);
  });
