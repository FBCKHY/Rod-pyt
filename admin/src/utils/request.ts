import api from './http'

// 简化的请求函数，适配产品中心API
export default function request<T = any>(config: {
  url: string
  method?: 'get' | 'post' | 'put' | 'delete'
  params?: any
  data?: any
  headers?: any
}): Promise<{ data: T; success: boolean; message?: string }> {
  const { url, method = 'get', params, data, headers } = config

  // 添加 /api 前缀（如果URL不是以 / 开头）
  const fullUrl = url.startsWith('/') ? url : `/api/${url}`

  return api.request({
    url: fullUrl,
    method: method.toUpperCase() as any,
    params,
    data,
    headers
  }).then((res: any) => {
    // 适配不同的响应格式
    if (res && typeof res === 'object') {
      // 如果响应已经有 data 字段，直接返回
      if ('data' in res) {
        return {
          data: res.data,
          success: res.success !== false,
          message: res.message || res.msg
        }
      }
      // 否则将整个响应作为 data
      return {
        data: res,
        success: true
      }
    }
    return {
      data: res,
      success: true
    }
  })
}
