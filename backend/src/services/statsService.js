const { Op, fn, col, literal } = require('sequelize');
const Subscription = require('../models/subscription');

class StatsService {
  /**
   * 获取订阅统计数据
   */
  async getSubscriptionStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 基础统计
    const [
      total,
      subscribed,
      unsubscribed,
      todayNew,
      thisWeekNew,
      thisMonthNew
    ] = await Promise.all([
      this.getTotalCount(),
      this.getCountByStatus('subscribed'),
      this.getCountByStatus('unsubscribed'),
      this.getCountByDateRange(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
      this.getCountByDateRange(thisWeekStart, now),
      this.getCountByDateRange(thisMonthStart, now)
    ]);

    // 按联系方式类型统计
    const byContactType = await this.getCountByContactType();

    // 按来源统计
    const bySource = await this.getCountBySource();

    // 趋势数据（最近7天）
    const trend = await this.getTrendData(7);

    return {
      total,
      subscribed,
      unsubscribed,
      todayNew,
      thisWeekNew,
      thisMonthNew,
      byContactType,
      bySource,
      trend
    };
  }

  /**
   * 获取总数
   */
  async getTotalCount() {
    return await Subscription.count();
  }

  /**
   * 按状态统计
   */
  async getCountByStatus(status) {
    return await Subscription.count({
      where: { status }
    });
  }

  /**
   * 按日期范围统计
   */
  async getCountByDateRange(startDate, endDate) {
    return await Subscription.count({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
  }

  /**
   * 按联系方式类型统计
   */
  async getCountByContactType() {
    const results = await Subscription.findAll({
      attributes: [
        'contactType',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['contactType'],
      raw: true
    });

    const stats = { email: 0, wechat: 0, phone: 0 };
    results.forEach(item => {
      stats[item.contactType] = parseInt(item.count);
    });

    return stats;
  }

  /**
   * 按来源统计
   */
  async getCountBySource() {
    const results = await Subscription.findAll({
      attributes: [
        'source',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['source'],
      raw: true
    });

    const stats = { website_footer: 0, contact_form: 0, manual: 0 };
    results.forEach(item => {
      stats[item.source] = parseInt(item.count);
    });

    return stats;
  }

  /**
   * 获取趋势数据
   */
  async getTrendData(days) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    const subscriptionTrend = await Subscription.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('COUNT', col('id')), 'newSubscriptions']
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    const unsubscriptionTrend = await Subscription.findAll({
      attributes: [
        [fn('DATE', col('updated_at')), 'date'],
        [fn('COUNT', col('id')), 'unsubscriptions']
      ],
      where: {
        status: 'unsubscribed',
        updatedAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      group: [fn('DATE', col('updated_at'))],
      order: [[fn('DATE', col('updated_at')), 'ASC']],
      raw: true
    });

    // 合并数据
    const trendMap = new Map();
    
    subscriptionTrend.forEach(item => {
      trendMap.set(item.date, {
        date: item.date,
        newSubscriptions: parseInt(item.newSubscriptions),
        unsubscriptions: 0
      });
    });

    unsubscriptionTrend.forEach(item => {
      const existing = trendMap.get(item.date);
      if (existing) {
        existing.unsubscriptions = parseInt(item.unsubscriptions);
      } else {
        trendMap.set(item.date, {
          date: item.date,
          newSubscriptions: 0,
          unsubscriptions: parseInt(item.unsubscriptions)
        });
      }
    });

    return Array.from(trendMap.values()).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  }
}

module.exports = new StatsService(); 