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
    nickname: '',
    email: '',
    mobile: '',
    department: '',
    avatar: '',
    roleIds: [] as number[]
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
    if (response.code === 200) {
      formData.avatar = response.data.url
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

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      const params = {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        email: formData.email,
        mobile: formData.mobile,
        department: formData.department,
        avatar: formData.avatar,
        roleIds: formData.roleIds
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
</style>
