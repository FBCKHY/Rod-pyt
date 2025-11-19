<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
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
  import { UserService } from '@/api/usersApi'
  import { RoleService } from '@/api/rolesApi'

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
    roleIds: [] as number[]
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
      const res = await RoleService.getRoleList({ page: 1, size: 100 })
      if (res.code === 200 && res.data) {
        roleList.value = res.data.list || []
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
      Object.assign(formData, {
        id: row.id || 0,
        username: row.username || '',
        password: '',
        nickname: row.nickname || '',
        email: row.email || '',
        mobile: row.mobile || '',
        department: row.department || '',
        roleIds: row.roles ? row.roles.map((r: any) => r.id || 0).filter((id: number) => id > 0) : []
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
        roleIds: []
      })
    }
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        fetchRoleList()
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

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
        roleIds: formData.roleIds
      }

      if (dialogType.value === 'add') {
        await UserService.createUser(params)
        ElMessage.success('添加成功')
      } else {
        await UserService.updateUser(formData.id, params)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      emit('submit')
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.msg || '操作失败')
    }
  }
</script>
