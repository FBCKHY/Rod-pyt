import request from '@/utils/request'

// 产品接口类型定义
export interface Product {
  id: number
  name: string
  model?: string
  cardImage?: string
  price?: number
  shortDesc?: string
  tag?: string
  sales?: number
  features?: Array<{ icon: string; text: string }>
  categoryId?: number
  category?: {
    id: number
    name: string
    icon?: string
  }
  status: 'active' | 'inactive' | 'draft'
  sortOrder?: number
  viewCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  categoryId?: number
  status?: string
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface ProductListResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 获取产品列表
export function getProductList(params: ProductListParams) {
  return request<ProductListResponse>({
    url: 'products',
    method: 'get',
    params
  })
}

// 获取产品详情
export function getProduct(id: number) {
  return request<Product>({
    url: `/products/${id}`,
    method: 'get'
  })
}

// 创建产品
export function createProduct(data: Partial<Product>) {
  return request<Product>({
    url: '/products',
    method: 'post',
    data
  })
}

// 更新产品
export function updateProduct(id: number, data: Partial<Product>) {
  return request<Product>({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

// 删除产品
export function deleteProduct(id: number) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

// 批量更新排序
export function updateProductsSortOrder(products: Array<{ id: number; sortOrder: number }>) {
  return request({
    url: '/products/sort-order',
    method: 'put',
    data: { products }
  })
}

// 获取产品统计
export function getProductStats() {
  return request({
    url: '/products/stats',
    method: 'get'
  })
}

// 上传产品卡片图片
export function uploadCardImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return request<{ url: string }>({
    url: '/products/card-image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取产品配置
export function getProductConfig(id: number) {
  return request({
    url: `/products/${id}/config`,
    method: 'get'
  })
}

// 保存产品配置
export function saveProductConfig(id: number, configData: any) {
  return request({
    url: `/products/${id}/config`,
    method: 'put',
    data: { configData }
  })
}

// 获取配置历史
export function getProductConfigHistory(id: number) {
  return request({
    url: `/products/${id}/config/history`,
    method: 'get'
  })
}
