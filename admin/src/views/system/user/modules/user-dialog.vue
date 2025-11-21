<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="头像" prop="avatar">
        <ElUpload
          class="avatar-uploader"
          :action="uploadUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :on-error="handleAvatarError"
          name="avatar"
          accept="image/*"
        >
          <img v-if="formData.avatar" :src="getAvatarUrl(formData.avatar)" class="avatar" />
          <ElIcon v-else class="avatar-uploader-icon"><Plus /></ElIcon>
        </ElUpload>
        <div class="avatar-tip">支持jpg/png/gif格式,大小不超过5MB</div>
      </ElFormItem>
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" :disabled="dialogType === 'edit'" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password" v-if="dialogType === 'add'">
        <ElInput v-model="formData.password" type="password" placeholder="请输入密码" show-password />
      </ElFormItem>
      <ElFormItem label="当前密码" v-if="dialogType === 'edit'">
        <div class="password-field">
          <ElInput 
            v-model="displayPassword" 
            :type="showPasswordText ? 'text' : 'password'" 
            placeholder="密码已加密" 
            :disabled="!isSuperAdmin"
            show-password 
          />
          <ElButton 
            v-if="isSuperAdmin" 
            type="primary" 
            size="small" 
            @click="fetchUserPassword"
            :loading="passwordLoading"
            style="margin-left: 8px;"
          >
            {{ passwordFetched ? '刷新' : '查看哈希值' }}
          </ElButton>
        </div>
        <div class="password-tip" v-if="!isSuperAdmin">
          注意：密码已使用 bcrypt 加密存储，无法解密为明文。如需修改密码，请使用重置密码功能。
        </div>
        <div class="password-tip-success" v-else-if="!passwordFetched">
          超级管理员权限：可以查看密码哈希值和修改密码
        </div>
        <div class="password-tip-info" v-else>
          🔒 当前显示的是 bcrypt 加密后的哈希值，无法解密为原始密码。<br/>
          这是安全的单向加密，符合安全最佳实践。如需修改，请在下方输入新密码。
        </div>
      </ElFormItem>
      <ElFormItem label="修改密码" v-if="dialogType === 'edit' && isSuperAdmin">
        <ElInput 
          v-model="formData.newPassword" 
          type="password" 
          placeholder="输入新密码即可修改（留空不修改）" 
          show-password 
          clearable
        />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
      </ElFormItem>
      <ElFormItem label="邮箱" prop="email">
        <ElInput v-model="formData.email" placeholder="请输入邮箱" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="mobile">
        <ElInput v-model="formData.mobile" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="部门" prop="department">
        <ElInput v-model="formData.department" placeholder="请输入部门" />
      </ElFormItem>
      <ElFormItem label="角色" prop="roleIds">
        <ElSelect v-model="formData.roleIds" multiple placeholder="请选择角色" :loading="roleLoading">
          <ElOption
            v-for="role in roleList"
            :key="role.id"
            :value="role.id"
            :label="role.role_name"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import type { UploadProps } from 'element-plus'
  import { UserService } from '@/api/usersApi'
  import { RoleService } from '@/api/rolesApi'
  import { useUserStore } from '@/store/modules/user'

  interface Props {
    visible: boolean
    type: string
    userData?: any
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<any[]>([])
  const roleLoading = ref(false)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    id: 0,
    username: '',
    password: '',
    currentPassword: '',
    newPassword: '',
    nickname: '',
    email: '',
    mobile: '',
    department: '',
    avatar: '',
    roleIds: [] as number[]
  })

  // 密码显示相关
  const displayPassword = ref('********')
  const showPasswordText = ref(false)
  const passwordLoading = ref(false)
  const passwordFetched = ref(false)

  // 检查是否为超级管理员
  const userStore = useUserStore()
  const isSuperAdmin = computed(() => {
    const roles = userStore.info?.roles || []
    // 检查是否包含超级管理员角色（可能是 'super_admin', 'admin', '超级管理员' 等）
    return roles.some((role: any) => {
      if (typeof role === 'string') {
        return role.toLowerCase().includes('super') || role.toLowerCase().includes('admin')
      }
      if (typeof role === 'object' && role !== null) {
        const roleName = role.name || role.role_name || role.code || ''
        return roleName.toLowerCase().includes('super') || roleName.toLowerCase().includes('admin')
      }
      return false
    })
  })

  // 上传配置
  const uploadUrl = ref((import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api/upload/avatar')
  const uploadHeaders = computed(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    return {
      Authorization: token || ''
    }
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    email: [
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    mobile: [
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  // 获取角色列表
  const fetchRoleList = async () => {
    try {
      roleLoading.value = true
      const res: any = await RoleService.getRoleList({ page: 1, size: 100 })
      // 响应拦截器已经将data提取出来了,所以res就是data部分
      if (res && res.list) {
        roleList.value = res.list || []
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      roleLoading.value = false
    }
  }

  // 初始化表单数据
  const initFormData = () => {
    // 重置密码显示状态
    displayPassword.value = '********'
    showPasswordText.value = false
    passwordFetched.value = false
    passwordLoading.value = false

    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    if (isEdit) {
      console.log('编辑用户数据:', row)
      console.log('用户角色:', row.roles)
      console.log('角色类型:', typeof row.roles, Array.isArray(row.roles))
      
      // 处理角色ID - 支持多种数据格式
      let roleIds: number[] = []
      if (row.roles && Array.isArray(row.roles) && row.roles.length > 0) {
        console.log('第一个角色:', row.roles[0])
        console.log('第一个角色的所有属性:', Object.keys(row.roles[0]))
        console.log('第一个角色JSON:', JSON.stringify(row.roles[0]))
        roleIds = row.roles.map((r: any) => {
          console.log('处理角色:', r, typeof r)
          console.log('角色属性:', Object.keys(r))
          // 如果roles是对象数组,尝试多个字段
          if (typeof r === 'object' && r !== null) {
            // 尝试 id 字段
            if (r.id) {
              console.log('找到id:', r.id)
              return Number(r.id)
            }
            // 尝试 role_id 字段
            if (r.role_id) {
              console.log('找到role_id:', r.role_id)
              return Number(r.role_id)
            }
            // 尝试 code 字段
            if (r.code) {
              console.log('找到code:', r.code, '角色列表长度:', roleList.value.length)
              if (roleList.value.length > 0) {
                const found = roleList.value.find((role: any) => role.role_code === r.code)
                if (found) {
                  console.log('通过code找到角色:', found)
                  return Number(found.id)
                }
              }
            }
            // 尝试 name 字段匹配
            if (r.name && roleList.value.length > 0) {
              console.log('尝试通过name匹配:', r.name)
              const found = roleList.value.find((role: any) => role.role_name === r.name)
              if (found) {
                console.log('通过name找到角色:', found)
                return Number(found.id)
              }
            }
          }
          // 如果roles是数字数组,直接使用
          if (typeof r === 'number') {
            return r
          }
          // 如果是字符串数字
          if (typeof r === 'string' && !isNaN(Number(r))) {
            return Number(r)
          }
          return 0
        }).filter((id: number) => id > 0)
      }
      
      console.log('解析后的角色IDs:', roleIds)
      
      Object.assign(formData, {
        id: row.id || 0,
        username: row.username || '',
        password: '',
        currentPassword: row.password || '********',
        newPassword: '',
        nickname: row.nickname || '',
        email: row.email || '',
        mobile: row.mobile || '',
        department: row.department || '',
        avatar: row.avatar || '',
        roleIds
      })
    } else {
      Object.assign(formData, {
        id: 0,
        username: '',
        password: '',
        currentPassword: '',
        newPassword: '',
        nickname: '',
        email: '',
        mobile: '',
        department: '',
        avatar: '',
        roleIds: []
      })
    }
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        // 先加载角色列表,再初始化表单数据
        await fetchRoleList()
        // 等待一下确保roleList已更新
        await nextTick()
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  // 头像上传成功
  const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
    console.log('上传响应:', response)
    console.log('响应数据:', response.data)
    if (response.code === 200 && response.data) {
      formData.avatar = response.data.url || response.data.path || response.data
      console.log('设置头像URL:', formData.avatar)
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response.msg || '上传失败')
    }
  }

  // 头像上传失败
  const handleAvatarError: UploadProps['onError'] = (error) => {
    console.error('上传失败:', error)
    ElMessage.error('头像上传失败,请重试')
  }

  // 上传前验证
  const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt5M = file.size / 1024 / 1024 < 5

    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return false
    }
    if (!isLt5M) {
      ElMessage.error('图片大小不能超过 5MB!')
      return false
    }
    return true
  }

  // 获取头像URL
  const getAvatarUrl = (avatar: string) => {
    if (!avatar) return ''
    if (avatar.startsWith('http')) return avatar
    return import.meta.env.VITE_API_BASE_URL + avatar
  }

  // 获取用户密码（仅超级管理员）
  const fetchUserPassword = async () => {
    if (!isSuperAdmin.value || !formData.id) {
      ElMessage.warning('没有权限查看密码')
      return
    }

    try {
      passwordLoading.value = true
      const res: any = await UserService.getUserPassword(formData.id)
      if (res && res.password) {
        displayPassword.value = res.password
        passwordFetched.value = true
        showPasswordText.value = true
        ElMessage.success('密码哈希值获取成功（bcrypt 加密，不可解密）')
      } else {
        ElMessage.warning('无法获取密码')
      }
    } catch (error: any) {
      console.error('获取密码失败:', error)
      ElMessage.error(error.msg || '获取密码失败')
    } finally {
      passwordLoading.value = false
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      const params: any = {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        email: formData.email,
        mobile: formData.mobile,
        department: formData.department,
        avatar: formData.avatar,
        roleIds: formData.roleIds
      }

      // 如果是编辑模式且超级管理员输入了新密码，则添加到参数中
      if (dialogType.value === 'edit' && isSuperAdmin.value && formData.newPassword) {
        params.password = formData.newPassword
      }

      console.log('提交参数:', params)
      console.log('对话框类型:', dialogType.value)
      console.log('用户ID:', formData.id)

      if (dialogType.value === 'add') {
        await UserService.createUser(params)
        ElMessage.success('添加成功')
      } else {
        console.log('调用updateUser, ID:', formData.id, '参数:', params)
        await UserService.updateUser(formData.id, params)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('提交失败:', error)
      console.error('错误详情:', error.response?.data)
      ElMessage.error(error.msg || error.message || '操作失败')
    }
  }
</script>

<style scoped>
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.avatar-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.password-tip {
  font-size: 12px;
  color: var(--el-color-warning);
  margin-top: 8px;
  line-height: 1.5;
}

.password-field {
  display: flex;
  align-items: center;
  width: 100%;
}

.password-tip-success {
  font-size: 12px;
  color: var(--el-color-success);
  margin-top: 8px;
  line-height: 1.5;
}

.password-tip-info {
  font-size: 12px;
  color: var(--el-color-info);
  margin-top: 8px;
  line-height: 1.8;
  padding: 8px 12px;
  background-color: var(--el-color-info-light-9);
  border-radius: 4px;
  border-left: 3px solid var(--el-color-info);
}
</style>
