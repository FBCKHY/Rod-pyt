const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署生产环境...');

try {
  // 检查环境变量
  if (!fs.existsSync('.env')) {
    console.error('❌ 未找到 .env 文件，请先配置环境变量');
    process.exit(1);
  }

  // 安装生产依赖
  console.log('📦 安装生产依赖...');
  execSync('npm ci --only=production', { stdio: 'inherit' });

  // 运行数据库迁移
  console.log('🗄️ 运行数据库迁移...');
  execSync('npm run db:migrate', { stdio: 'inherit' });

  // 启动PM2
  console.log('🔄 启动PM2进程...');
  execSync('npx pm2 start ecosystem.config.js --env production', { stdio: 'inherit' });

  console.log('✅ 部署完成！');
  console.log('');
  console.log('查看进程状态：npx pm2 status');
  console.log('查看日志：npx pm2 logs');
  console.log('重启服务：npx pm2 restart subscription-system-backend');

} catch (error) {
  console.error('❌ 部署失败：', error.message);
  process.exit(1);
} 