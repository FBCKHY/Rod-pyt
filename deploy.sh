#!/bin/bash

# 容电科技 - 阿里云部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署容电科技产品展示系统..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
APP_DIR="/var/www/rongdian"
BACKEND_DIR="$APP_DIR/backend"
ADMIN_DIR="$APP_DIR/admin-dist"
WEB_DIR="$APP_DIR/web Site"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ 请使用root用户或sudo运行此脚本${NC}"
  exit 1
fi

echo -e "${YELLOW}📦 步骤1: 停止现有服务...${NC}"
pm2 stop rongdian-backend || true

echo -e "${YELLOW}📦 步骤2: 备份数据库...${NC}"
BACKUP_DIR="$APP_DIR/backups"
mkdir -p $BACKUP_DIR
BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump rongdian_db > $BACKUP_FILE
echo -e "${GREEN}✅ 数据库已备份到: $BACKUP_FILE${NC}"

echo -e "${YELLOW}📦 步骤3: 更新代码...${NC}"
cd $BACKEND_DIR
git pull origin main || echo "跳过Git更新"

echo -e "${YELLOW}📦 步骤4: 安装依赖...${NC}"
cd $BACKEND_DIR
pnpm install --prod

echo -e "${YELLOW}📦 步骤5: 运行数据库迁移...${NC}"
cd $BACKEND_DIR
pnpm db:migrate || pnpm db:push || echo "跳过数据库迁移"

echo -e "${YELLOW}📦 步骤6: 设置文件权限...${NC}"
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $BACKEND_DIR/public

echo -e "${YELLOW}📦 步骤7: 重启后端服务...${NC}"
cd $BACKEND_DIR
pm2 restart rongdian-backend || pm2 start ecosystem.config.js
pm2 save

echo -e "${YELLOW}📦 步骤8: 重启Nginx...${NC}"
nginx -t && systemctl restart nginx

echo -e "${YELLOW}📦 步骤9: 检查服务状态...${NC}"
sleep 3
pm2 status
systemctl status nginx --no-pager

echo -e "${GREEN}✅ 部署完成!${NC}"
echo -e "${GREEN}📊 查看日志: pm2 logs rongdian-backend${NC}"
echo -e "${GREEN}🌐 访问网站: https://your-domain.com${NC}"
