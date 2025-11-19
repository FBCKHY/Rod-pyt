const { Op } = require('sequelize');
const Subscription = require('../models/subscription');

class SubscriptionService {
  /**
   * 创建订阅
   */
  async createSubscription(data) {
    return await Subscription.create(data);
  }

  /**
   * 根据联系方式查找订阅
   */
  async findByContact(contactType, contactValue) {
    return await Subscription.findOne({
      where: {
        contactType,
        contactValue
      }
    });
  }

  /**
   * 获取订阅列表
   */
  async getSubscriptionList(params) {
    const {
      page = 1,
      size = 20,
      status,
      contactType,
      source,
      contact,
      startDate,
      endDate
    } = params;

    const where = {};

    // 条件筛选
    if (status) where.status = status;
    if (contactType) where.contactType = contactType;
    if (source) where.source = source;
    if (contact) {
      where.contactValue = {
        [Op.like]: `%${contact}%`
      };
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
    }

    const offset = (page - 1) * size;

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      limit: size,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'contactType', 'contactValue', 'source', 'status',
        'subscribedAt', 'ipAddress', 'userAgent', 'createdAt', 'updatedAt',
        'fullName', 'subject', 'message', 'userSource', 'company',
        'preferredTime', 'address', 'requirements'
      ]
    });

    return {
      list: rows,
      pagination: {
        page,
        size,
        total: count,
        pages: Math.ceil(count / size)
      }
    };
  }

  /**
   * 更新订阅状态
   */
  async updateSubscriptionStatus(id, status) {
    const [updatedRowsCount] = await Subscription.update(
      { status },
      {
        where: { id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      return null;
    }

    return await Subscription.findByPk(id);
  }

  /**
   * 删除订阅
   */
  async deleteSubscription(id) {
    const deletedRowsCount = await Subscription.destroy({
      where: { id }
    });

    return deletedRowsCount > 0;
  }

  /**
   * 批量删除订阅
   */
  async batchDeleteSubscriptions(ids) {
    return await Subscription.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });
  }
}

module.exports = new SubscriptionService(); 