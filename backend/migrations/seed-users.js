/**
 * 创建测试用户数据
 * 运行方式: node migrations/seed-users.js
 */

const { sequelize, User, Role } = require('../src/models');

async function seedUsers() {
  try {
    console.log('🌱 开始创建测试用户...\n');

    // 1. 创建角色
    console.log('📦 创建角色...');
    
    const [adminRole] = await Role.findOrCreate({
      where: { role_code: 'R_ADMIN' },
      defaults: {
        role_name: '管理员',
        role_code: 'R_ADMIN',
        description: '系统管理员角色',
        status: 'active'
      }
    });
    console.log('✅ 管理员角色:', adminRole.role_name);

    const [userRole] = await Role.findOrCreate({
      where: { role_code: 'R_USER' },
      defaults: {
        role_name: '普通用户',
        role_code: 'R_USER',
        description: '普通用户角色',
        status: 'active'
      }
    });
    console.log('✅ 普通用户角色:', userRole.role_name);

    // 2. 创建管理员用户
    console.log('\n📦 创建管理员用户...');
    
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        password: 'admin123', // 密码会在模型的hook中自动加密
        nickname: '系统管理员',
        email: 'admin@example.com',
        mobile: '13800138000',
        department: '技术部',
        status: 'active'
      });
      
      // 分配管理员角色
      await adminUser.addRole(adminRole);
      
      console.log('✅ 管理员用户创建成功');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
    } else {
      console.log('✅ 管理员用户已存在');
      // 确保有管理员角色
      const roles = await adminUser.getRoles();
      if (!roles.find(r => r.role_code === 'R_ADMIN')) {
        await adminUser.addRole(adminRole);
        console.log('   已添加管理员角色');
      }
    }

    // 3. 创建测试用户
    console.log('\n📦 创建测试用户...');
    
    let testUser = await User.findOne({ where: { username: 'test' } });
    
    if (!testUser) {
      testUser = await User.create({
        username: 'test',
        password: 'test123',
        nickname: '测试用户',
        email: 'test@example.com',
        mobile: '13900139000',
        department: '测试部',
        status: 'active'
      });
      
      // 分配普通用户角色
      await testUser.addRole(userRole);
      
      console.log('✅ 测试用户创建成功');
      console.log('   用户名: test');
      console.log('   密码: test123');
    } else {
      console.log('✅ 测试用户已存在');
    }

    // 4. 显示所有用户
    console.log('\n📊 用户列表:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const allUsers = await User.findAll({
      include: [{
        model: Role,
        as: 'roles',
        attributes: ['role_code', 'role_name']
      }]
    });
    
    allUsers.forEach(user => {
      const roles = user.roles.map(r => r.role_name).join(', ');
      console.log(`${user.username} (${user.nickname}) - ${roles}`);
    });

    console.log('\n✅ 用户数据创建完成！');
    console.log('\n💡 登录信息:');
    console.log('   管理员 - 用户名: admin, 密码: admin123');
    console.log('   测试用户 - 用户名: test, 密码: test123');
    
  } catch (error) {
    console.error('❌ 创建用户失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
seedUsers()
  .then(() => {
    console.log('\n🎉 脚本执行成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });
