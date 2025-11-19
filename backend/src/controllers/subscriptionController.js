const subscriptionService = require('../services/subscriptionService');
const { formatResponse } = require('../utils/response');
const logger = require('../utils/logger');

class SubscriptionController {
  /**
   * 创建订阅
   */
  async create(req, res) {
    const { 
      contactType, 
      contactValue, 
      source,
      fullName,
      subject,
      message,
      userSource,
      company,
      preferredTime,
      address,
      requirements
    } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    try {
      const subscription = await subscriptionService.createSubscription({
        contactType,
        contactValue,
        source,
        ipAddress,
        userAgent,
        fullName,
        subject,
        message,
        userSource,
        company,
        preferredTime,
        address,
        requirements
      });

      logger.info('订阅创建成功', { 
        subscriptionId: subscription.id,
        contactType,
        contactValue,
        source 
      });

      res.status(201).json(formatResponse(200, '订阅成功', subscription));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json(formatResponse(400, error.message));
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json(formatResponse(409, '该联系方式已存在'));
      }
      
      logger.error('创建订阅失败', error);
      res.status(500).json(formatResponse(500, '服务器内部错误'));
    }
  }
}

module.exports = new SubscriptionController(); 