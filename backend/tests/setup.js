// 测试环境设置
require('dotenv').config({ path: '.env.test' });

// 设置测试超时
jest.setTimeout(30000);

// 全局测试前设置
beforeAll(async () => {
  // 这里可以添加测试数据库初始化等操作
});

// 全局测试后清理
afterAll(async () => {
  // 这里可以添加测试数据库清理等操作
}); 