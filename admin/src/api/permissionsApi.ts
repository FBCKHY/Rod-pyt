import request from '@/utils/http'

export class PermissionService {
  // 获取权限列表
  static getPermissionList(params?: any) {
    return request.get({
      url: '/permissions',
      params
    })
  }

  // 获取权限树
  static getPermissionTree() {
    return request.get({
      url: '/permissions/tree'
    })
  }

  // 创建权限
  static createPermission(params: any) {
    return request.post({
      url: '/permissions',
      params
    })
  }

  // 更新权限
  static updatePermission(id: number, params: any) {
    return request.put({
      url: `/permissions/${id}`,
      params
    })
  }

  // 删除权限
  static deletePermission(id: number) {
    return request.del({
      url: `/permissions/${id}`
    })
  }
}
