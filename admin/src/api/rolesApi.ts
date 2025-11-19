import request from '@/utils/http'

export class RoleService {
  // 获取角色列表
  static getRoleList(params?: any) {
    return request.get({
      url: '/roles',
      params
    })
  }

  // 获取角色详情
  static getRoleById(id: number) {
    return request.get({
      url: `/roles/${id}`
    })
  }

  // 创建角色
  static createRole(params: any) {
    return request.post({
      url: '/roles',
      params
    })
  }

  // 更新角色
  static updateRole(id: number, params: any) {
    return request.put({
      url: `/roles/${id}`,
      params
    })
  }

  // 删除角色
  static deleteRole(id: number) {
    return request.del({
      url: `/roles/${id}`
    })
  }

  // 分配权限
  static assignPermissions(id: number, permissionIds: number[]) {
    return request.post({
      url: `/roles/${id}/permissions`,
      params: { permissionIds }
    })
  }

  // 获取角色的用户列表
  static getRoleUsers(id: number) {
    return request.get({
      url: `/roles/${id}/users`
    })
  }
}
