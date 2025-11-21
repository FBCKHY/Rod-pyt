const sequelize = require('./src/config/database');

async function updateEnum() {
  try {
    console.log('🔄 开始更新status枚举类型...');
    
    // 获取数据库方言
    const dialect = sequelize.getDialect();
    console.log(`📊 数据库类型: ${dialect}`);
    
    if (dialect === 'mysql' || dialect === 'mariadb') {
      // MySQL/MariaDB
      await sequelize.query(`
        ALTER TABLE subscriptions 
        MODIFY COLUMN status ENUM('subscribed', 'unsubscribed', 'pending', 'contacted') 
        DEFAULT 'subscribed' 
        COMMENT '订阅状态'
      `);
    } else if (dialect === 'postgres') {
      // PostgreSQL - 使用ALTER TYPE ADD VALUE添加新枚举值
      console.log('添加新的枚举值...');
      
      try {
        await sequelize.query(`
          ALTER TYPE enum_subscriptions_status ADD VALUE IF NOT EXISTS 'pending';
        `);
        console.log('✓ 已添加 pending');
      } catch (e) {
        console.log('pending 可能已存在');
      }
      
      try {
        await sequelize.query(`
          ALTER TYPE enum_subscriptions_status ADD VALUE IF NOT EXISTS 'contacted';
        `);
        console.log('✓ 已添加 contacted');
      } catch (e) {
        console.log('contacted 可能已存在');
      }
    }
    
    console.log('✅ status枚举类型更新成功!');
    console.log('新的枚举值: subscribed, unsubscribed, pending, contacted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateEnum();
