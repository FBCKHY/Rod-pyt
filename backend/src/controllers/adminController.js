const subscriptionService = require('../services/subscriptionService');
const statsService = require('../services/statsService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');

class AdminController {
  /**
   * 获取用户信息
   */
  async getUserInfo(req, res) {
    try {
      // 返回开发环境的默认用户信息
      const userInfo = {
        id: req.user?.id || 1,
        username: req.user?.email || 'admin@example.com',
        nickname: '管理员',
        avatar: '/src/assets/img/avatar/avatar.webp',
        role: req.user?.role || 'admin',
        permissions: ['subscription:read', 'subscription:write', 'subscription:delete'],
        lastLoginTime: new Date().toISOString()
      };

      logger.info('获取用户信息成功', { userId: userInfo.id });
      res.json(formatResponse(200, '获取用户信息成功', userInfo));
    } catch (error) {
      logger.error('获取用户信息失败', error);
      res.status(500).json(formatResponse(500, '获取用户信息失败'));
    }
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptions(req, res) {
    try {
      const {
        page = 1,
        size = 20,
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate
      } = req.query;

      const result = await subscriptionService.getSubscriptionList({
        page: parseInt(page),
        size: parseInt(size),
        status,
        contactType,
        source,
        contact,
        startDate,
        endDate
      });

      res.json(formatResponse(200, '查询成功', result));
    } catch (error) {
      logger.error('获取订阅列表失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 切换订阅状态
   */
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const subscription = await subscriptionService.updateSubscriptionStatus(
        parseInt(id),
        status
      );

      if (!subscription) {
        return res.status(404).json(formatResponse(404, '订阅记录不存在'));
      }

      logger.info('订阅状态更新成功', { 
        subscriptionId: id,
        newStatus: status 
      });

      res.json(formatResponse(200, '状态更新成功', subscription));
    } catch (error) {
      logger.error('更新订阅状态失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 删除订阅
   */
  async deleteSubscription(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await subscriptionService.deleteSubscription(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json(formatResponse(404, '订阅记录不存在'));
      }

      logger.info('订阅删除成功', { subscriptionId: id });

      res.json(formatResponse(200, '删除成功', { deletedId: parseInt(id) }));
    } catch (error) {
      logger.error('删除订阅失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 批量删除订阅
   */
  async batchDelete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json(formatResponse(400, '请提供有效的ID列表'));
      }

      const deletedCount = await subscriptionService.batchDeleteSubscriptions(ids);

      logger.info('批量删除完成', { 
        requestedIds: ids,
        deletedCount 
      });

      res.json(formatResponse(200, '批量删除成功', {
        deletedCount,
        deletedIds: ids
      }));
    } catch (error) {
      logger.error('批量删除失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 创建订阅
   */
  async createSubscription(req, res) {
    try {
      const { contactType, contactValue, source = 'manual' } = req.body;

      const subscription = await subscriptionService.createSubscription({
        contactType,
        contactValue,
        source,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      logger.info('管理员创建订阅成功', { 
        subscriptionId: subscription.id,
        contactType,
        contactValue 
      });

      res.status(201).json(formatResponse(200, '添加成功', subscription));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json(formatResponse(400, error.message));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(formatResponse(409, '该联系方式已存在'));
      }
      
      logger.error('管理员创建订阅失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 获取统计数据
   */
  async getStats(req, res) {
    try {
      const stats = await statsService.getSubscriptionStats();
      res.json(formatResponse(200, '查询成功', stats));
    } catch (error) {
      logger.error('获取统计数据失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }

  /**
   * 检查联系方式是否存在
   */
  async checkExists(req, res) {
    try {
      const { contactType, contactValue } = req.query;

      if (!contactType || !contactValue) {
        return res.status(400).json(formatResponse(400, '缺少必要参数'));
      }

      const subscription = await subscriptionService.findByContact(
        contactType,
        contactValue
      );

      res.json(formatResponse(200, '查询成功', {
        exists: !!subscription,
        subscription: subscription || null
      }));
    } catch (error) {
      logger.error('检查联系方式失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }
}

module.exports = new AdminController(); 