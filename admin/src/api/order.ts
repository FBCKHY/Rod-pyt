import request from '@/utils/request'

// 订单接口类型定义
export interface OrderItem {
  id: number
  productId: number
  productName: string
  productModel?: string
  productImage?: string
  quantity: number
  price: number
  subtotal: number
  variant?: any
}

export interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  province: string
  city: string
  district?: string
  address: string
  postalCode?: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  note?: string
  adminNote?: string
  items?: OrderItem[]
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt?: string
  updatedAt?: string
}

export interface OrderListParams {
  page?: number
  limit?: number
  status?: string
  customerPhone?: string
  startDate?: string
  endDate?: string
  search?: string
}

export interface OrderListResponse {
  items: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderStats {
  overview: {
    total: number
    pending: number
    confirmed: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalAmount: number
  }
  statusStats: Array<{
    status: string
    count: number
    amount: number
  }>
}

// 获取订单列表
export function getOrderList(params: OrderListParams) {
  return request<OrderListResponse>({
    url: '/orders',
    method: 'get',
    params
  })
}

// 获取订单详情
export function getOrder(id: number) {
  return request<Order>({
    url: `/orders/${id}`,
    method: 'get'
  })
}

// 根据订单号查询
export function getOrderByNumber(orderNumber: string) {
  return request<Order>({
    url: `/orders/number/${orderNumber}`,
    method: 'get'
  })
}

// 创建订单
export function createOrder(data: Partial<Order>) {
  return request<Order>({
    url: '/orders',
    method: 'post',
    data
  })
}

// 更新订单
export function updateOrder(id: number, data: Partial<Order>) {
  return request<Order>({
    url: `/orders/${id}`,
    method: 'put',
    data
  })
}

// 更新订单状态
export function updateOrderStatus(id: number, status: Order['status']) {
  return request<Order>({
    url: `/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 删除订单
export function deleteOrder(id: number) {
  return request({
    url: `/orders/${id}`,
    method: 'delete'
  })
}

// 获取订单统计
export function getOrderStats(params?: { startDate?: string; endDate?: string }) {
  return request<OrderStats>({
    url: '/orders/stats',
    method: 'get',
    params
  })
}
