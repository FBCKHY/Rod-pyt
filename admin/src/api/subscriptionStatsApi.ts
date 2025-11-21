import request from '@/utils/http'

/**
 * 订阅统计API
 */
export class SubscriptionStatsService {
  /**
   * 获取订阅统计数据
   */
  static getStats() {
    return request.get({
      url: '/admin/subscriptions/stats'
    })
  }

  /**
   * 获取趋势数据
   * @param days 天数
   */
  static getTrendData(days: number = 7) {
    return request.get({
      url: '/admin/subscriptions/trend',
      params: { days }
    })
  }

  /**
   * 获取按小时统计数据
   */
  static getHourlyStats() {
    return request.get({
      url: '/admin/subscriptions/hourly-stats'
    })
  }

  /**
   * 获取地域分布数据
   */
  static getRegionStats() {
    return request.get({
      url: '/admin/subscriptions/region-stats'
    })
  }
}
