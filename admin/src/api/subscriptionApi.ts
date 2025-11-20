import request from '@/utils/http'

export interface SubscriptionItem {
  id: number
  contactType: string
  contactValue: string
  source: string
  status: string
  subscribedAt: string
  ipAddress: string
  userAgent: string
}

export interface SubscriptionListParams {
  page: number
  size: number
  status?: string
  contactType?: string
  source?: string
  contact?: string
  startDate?: string
  endDate?: string
}

export interface SubscriptionStats {
  total: number
  subscribed: number
  unsubscribed: number
  todayNew: number
  thisWeekNew: number
  thisMonthNew: number
  byContactType: {
    email: number
    wechat: number
    phone: number
  }
  bySource: {
    website_footer: number
    contact_form: number
    manual: number
  }
  trend: Array<{
    date: string
    newSubscriptions: number
    unsubscriptions: number
  }>
}

export class SubscriptionService {
  /**
   * 获取订阅列表
   */
  static getSubscriptionList(params: SubscriptionListParams) {
    return request.get({
      url: '/admin/subscriptions',
      params
    })
  }

  /**
   * 切换订阅状态
   */
  static toggleSubscriptionStatus(id: number, status: string) {
    return request.request({
      url: `/admin/subscriptions/${id}`,
      method: 'PATCH',
      params: { status }
    })
  }

  /**
   * 删除订阅
   */
  static deleteSubscription(id: number) {
    return request.del({
      url: `/admin/subscriptions/${id}`
    })
  }

  /**
   * 批量删除订阅
   */
  static batchDeleteSubscriptions(ids: number[]) {
    return request.post({
      url: '/admin/subscriptions/batch-delete',
      params: { ids }
    })
  }

  /**
   * 新增订阅用户
   */
  static createSubscription(data: {
    contactType: string
    contactValue: string
    source: string
  }) {
    return request.post({
      url: '/admin/subscriptions',
      params: data
    })
  }

  /**
   * 获取订阅统计数据
   */
  static getSubscriptionStats() {
    return request.get<SubscriptionStats>({
      url: '/admin/subscriptions/stats'
    })
  }

  /**
   * 导出订阅数据
   */
  static exportSubscriptions(params: Partial<SubscriptionListParams>) {
    return request.get({
      url: '/admin/subscriptions/export',
      params
    })
  }

  /**
   * 验证联系方式是否已存在
   */
  static checkContactExists(contactType: string, contactValue: string) {
    return request.get({
      url: '/admin/subscriptions/check',
      params: { contactType, contactValue }
    })
  }

  /**
   * 更新订阅信息
   */
  static updateSubscription(id: number, data: any) {
    return request.request({
      url: `/admin/subscriptions/${id}`,
      method: 'PUT',
      params: data
    })
  }
}

// 导出函数式API以兼容现有代码
export const getSubscriptions = SubscriptionService.getSubscriptionList
export const updateSubscription = SubscriptionService.updateSubscription
export const deleteSubscription = SubscriptionService.deleteSubscription
export const createSubscription = SubscriptionService.createSubscription
export const exportSubscriptions = SubscriptionService.exportSubscriptions
export const toggleSubscriptionStatus = SubscriptionService.toggleSubscriptionStatus
export const batchDeleteSubscriptions = SubscriptionService.batchDeleteSubscriptions
export const getSubscriptionStats = SubscriptionService.getSubscriptionStats
export const checkContactExists = SubscriptionService.checkContactExists