import request from '@/utils/http'

export class UserService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/auth/login',
      params
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      url: '/user/info'
    })
  }

  // 获取用户列表
  static getUserList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.User.UserListData>({
      url: '/user/list',
      params
    })
  }

  // 创建用户
  static createUser(params: any) {
    return request.post({
      url: '/user',
      params
    })
  }

  // 获取用户详情
  static getUserById(id: number) {
    return request.get({
      url: `/user/${id}`
    })
  }

  // 更新用户
  static updateUser(id: number, params: any) {
    return request.put({
      url: `/user/${id}`,
      params
    })
  }

  // 删除用户
  static deleteUser(id: number) {
    return request.del({
      url: `/user/${id}`
    })
  }

  // 切换用户状态
  static toggleUserStatus(id: number, status: string) {
    return request.put({
      url: `/user/${id}/status`,
      params: { status }
    })
  }

  // 重置密码
  static resetPassword(id: number, newPassword: string) {
    return request.post({
      url: `/user/${id}/reset-password`,
      params: { newPassword }
    })
  }
}
