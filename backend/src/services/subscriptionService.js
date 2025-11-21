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
      endDate,
      userSource,
      subject
    } = params;

    const where = {};

    // 条件筛选 - 支持多选(逗号分隔或数组)
    if (status) {
      const statusArray = typeof status === 'string' ? status.split(',') : status;
      where.status = statusArray.length > 1 ? { [Op.in]: statusArray } : statusArray[0];
    }
    
    if (contactType) {
      const contactTypeArray = typeof contactType === 'string' ? contactType.split(',') : contactType;
      where.contactType = contactTypeArray.length > 1 ? { [Op.in]: contactTypeArray } : contactTypeArray[0];
    }
    
    if (source) {
      const sourceArray = typeof source === 'string' ? source.split(',') : source;
      where.source = sourceArray.length > 1 ? { [Op.in]: sourceArray } : sourceArray[0];
    }
    
    if (userSource) {
      const userSourceArray = typeof userSource === 'string' ? userSource.split(',') : userSource;
      if (userSourceArray.length > 1) {
        // 多选: 使用OR条件进行模糊匹配
        where[Op.or] = userSourceArray.map(val => ({
          userSource: { [Op.like]: `%${val}%` }
        }));
      } else {
        // 单选: 直接模糊匹配
        where.userSource = { [Op.like]: `%${userSourceArray[0]}%` };
      }
    }
    
    if (subject) {
      const subjectArray = typeof subject === 'string' ? subject.split(',') : subject;
      if (subjectArray.length > 1) {
        // 多选: 使用OR条件进行模糊匹配
        const subjectConditions = subjectArray.map(val => ({
          subject: { [Op.like]: `%${val}%` }
        }));
        // 如果已经有Op.or,合并条件
        if (where[Op.or]) {
          where[Op.and] = [
            { [Op.or]: where[Op.or] },
            { [Op.or]: subjectConditions }
          ];
          delete where[Op.or];
        } else {
          where[Op.or] = subjectConditions;
        }
      } else {
        // 单选: 直接模糊匹配
        where.subject = { [Op.like]: `%${subjectArray[0]}%` };
      }
    }
    
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

    console.log('🔍 Sequelize WHERE条件:', JSON.stringify(where, null, 2));

    // 先单独查询count以避免问题
    const count = await Subscription.count({ where });
    console.log('='.repeat(50));
    console.log('📊 新版本 COUNT查询结果:', count);
    console.log('='.repeat(50));

    // 再查询实际数据
    const rows = await Subscription.findAll({
      where,
      limit: size,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'contactType', 'contactValue', 'source', 'status',
        'subscribedAt', 'ipAddress', 'userAgent', 'createdAt', 'updatedAt',
        'fullName', 'subject', 'message', 'userSource', 'company',
        'preferredTime', 'address', 'requirements', 'note'
      ]
    });

    console.log('📊 查询结果: count =', count, ', rows.length =', rows.length);
    console.log('📊 返回的记录 IDs:', rows.map(r => r.id));

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
   * 更新订阅信息（完整更新）
   */
  async updateSubscription(id, data) {
    const subscription = await Subscription.findByPk(id);
    
    if (!subscription) {
      return null;
    }

    // 允许更新的字段
    const allowedFields = [
      'status', 'note', 'fullName', 'company', 'subject', 
      'message', 'userSource', 'preferredTime', 'address', 'requirements'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    await subscription.update(updateData);
    return subscription;
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