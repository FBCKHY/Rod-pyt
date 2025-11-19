<template>
  <div class="role-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard shadow="never" style="margin-bottom: 12px">
      <ElForm inline>
        <ElFormItem label="角色名称">
          <ElInput v-model="searchForm.keyword" placeholder="请输入角色名称" clearable />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="success" @click="showDialog('add')">新增角色</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格 -->
    <ElCard class="art-table-card" shadow="never">
      <ElTable :data="roleList" :loading="loading" border stripe>
        <ElTableColumn type="index" label="序号" width="60" />
        <ElTableColumn prop="role_name" label="角色名称" min-width="120" />
        <ElTableColumn prop="role_code" label="角色代码" min-width="120" />
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="permission_count" label="权限数量" width="100" align="center" />
        <ElTableColumn prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="showPermissionDialog(row)">
              分配权限
            </ElButton>
            <ElButton link type="primary" size="small" @click="showDialog('edit', row)">
              编辑
            </ElButton>
            <ElButton link type="danger" size="small" @click="handleDelete(row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <ElPagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchRoleList"
        @current-change="fetchRoleList"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </ElCard>

    <!-- 角色对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
    >
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <ElFormItem label="角色代码" prop="role_code">
          <ElInput
            v-model="formData.role_code"
            :disabled="dialogType === 'edit'"
            placeholder="请输入角色代码,如:R_MANAGER"
          />
        </ElFormItem>
        <ElFormItem label="角色名称" prop="role_name">
          <ElInput v-model="formData.role_name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">提交</ElButton>
      </template>
    </ElDialog>

    <!-- 权限分配对话框 -->
    <ElDialog v-model="permissionDialogVisible" title="分配权限" width="600px">
      <div v-loading="permissionLoading">
        <div style="margin-bottom: 16px">
          <ElButton size="small" @click="toggleExpandAll">
            {{ isExpandAll ? '全部收起' : '全部展开' }}
          </ElButton>
          <ElButton size="small" @click="toggleSelectAll">
            {{ isSelectAll ? '取消全选' : '全部选择' }}
          </ElButton>
        </div>
        <ElTree
          ref="treeRef"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-expand-all="isExpandAll"
          :default-checked-keys="checkedPermissions"
          :props="{ children: 'children', label: 'label' }"
        />
      </div>
      <template #footer>
        <ElButton @click="permissionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSavePermissions" :loading="saving">
          保存
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { RoleService } from '@/api/rolesApi'
  import { PermissionService } from '@/api/permissionsApi'

  defineOptions({ name: 'RoleManagement' })

  // 搜索表单
  const searchForm = reactive({
    keyword: ''
  })

  // 分页
  const pagination = reactive({
    page: 1,
    size: 20,
    total: 0
  })

  // 角色列表
  const roleList = ref<any[]>([])
  const loading = ref(false)

  // 对话框
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const submitting = ref(false)

  // 表单
  const formRef = ref<FormInstance>()
  const formData = reactive({
    id: 0,
    role_code: '',
    role_name: '',
    description: ''
  })

  // 表单验证
  const rules: FormRules = {
    role_code: [
      { required: true, message: '请输入角色代码', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    role_name: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }

  // 权限对话框
  const permissionDialogVisible = ref(false)
  const permissionLoading = ref(false)
  const permissionTree = ref<any[]>([])
  const checkedPermissions = ref<number[]>([])
  const currentRole = ref<any>(null)
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const saving = ref(false)

  // 获取角色列表
  const fetchRoleList = async () => {
    try {
      loading.value = true
      const res: any = await RoleService.getRoleList({
        page: pagination.page,
        size: pagination.size,
        keyword: searchForm.keyword
      })
      // 响应拦截器已经将data提取出来了
      if (res && res.list) {
        roleList.value = res.list || []
        pagination.total = res.total || 0
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      ElMessage.error('获取角色列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchRoleList()
  }

  // 重置
  const handleReset = () => {
    searchForm.keyword = ''
    pagination.page = 1
    fetchRoleList()
  }

  // 显示对话框
  const showDialog = (type: 'add' | 'edit', row?: any) => {
    dialogType.value = type
    if (type === 'edit' && row) {
      formData.id = row.id
      formData.role_code = row.role_code
      formData.role_name = row.role_name
      formData.description = row.description
    } else {
      formData.id = 0
      formData.role_code = ''
      formData.role_name = ''
      formData.description = ''
    }
    dialogVisible.value = true
    nextTick(() => {
      formRef.value?.clearValidate()
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      submitting.value = true
      const params = {
        role_code: formData.role_code,
        role_name: formData.role_name,
        description: formData.description
      }

      if (dialogType.value === 'add') {
        await RoleService.createRole(params)
        ElMessage.success('添加成功')
      } else {
        await RoleService.updateRole(formData.id, params)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      fetchRoleList()
    } catch (error: any) {
      console.error('提交失败:', error)
      ElMessage.error(error.msg || '操作失败')
    } finally {
      submitting.value = false
    }
  }

  // 删除角色
  const handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除角色 "${row.role_name}" 吗？`, '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await RoleService.deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchRoleList()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error(error.msg || '删除失败')
      }
    }
  }

  // 显示权限对话框
  const showPermissionDialog = async (row: any) => {
    currentRole.value = row
    permissionDialogVisible.value = true
    await fetchPermissionTree()
    
    // 设置已选中的权限
    if (row.permissions && row.permissions.length > 0) {
      checkedPermissions.value = row.permissions.map((p: any) => p.id)
    } else {
      checkedPermissions.value = []
    }
  }

  // 获取权限树
  const fetchPermissionTree = async () => {
    try {
      permissionLoading.value = true
      const res: any = await PermissionService.getPermissionTree()
      // 响应拦截器已经将data提取出来了
      if (res && Array.isArray(res)) {
        // 转换为树形结构
        permissionTree.value = res.map((group: any) => ({
          id: `group_${group.resource}`,
          label: group.label,
          children: group.children.map((perm: any) => ({
            id: perm.id,
            label: perm.name,
            code: perm.code
          }))
        }))
      }
    } catch (error) {
      console.error('获取权限树失败:', error)
      ElMessage.error('获取权限列表失败')
    } finally {
      permissionLoading.value = false
    }
  }

  // 全部展开/收起
  const toggleExpandAll = () => {
    isExpandAll.value = !isExpandAll.value
    if (treeRef.value?.store?.nodesMap) {
      permissionTree.value.forEach((node: any) => {
        const treeNode = treeRef.value?.store.nodesMap[node.id]
        if (treeNode) {
          treeNode.expanded = isExpandAll.value
        }
      })
    }
  }

  // 全部选择/取消
  const toggleSelectAll = () => {
    isSelectAll.value = !isSelectAll.value
    if (isSelectAll.value) {
      // 获取所有叶子节点的ID
      const allIds: number[] = []
      permissionTree.value.forEach((group: any) => {
        if (group.children) {
          group.children.forEach((child: any) => {
            if (typeof child.id === 'number') {
              allIds.push(child.id)
            }
          })
        }
      })
      treeRef.value?.setCheckedKeys(allIds)
    } else {
      treeRef.value?.setCheckedKeys([])
    }
  }

  // 保存权限
  const handleSavePermissions = async () => {
    if (!currentRole.value) return

    try {
      saving.value = true
      // 获取选中的权限ID(只获取叶子节点)
      const checkedKeys = treeRef.value?.getCheckedKeys() || []
      const permissionIds = checkedKeys.filter((key: any) => typeof key === 'number')

      await RoleService.assignPermissions(currentRole.value.id, permissionIds as number[])
      ElMessage.success('权限分配成功')
      permissionDialogVisible.value = false
      fetchRoleList()
    } catch (error: any) {
      console.error('保存权限失败:', error)
      ElMessage.error(error.msg || '保存失败')
    } finally {
      saving.value = false
    }
  }

  // 初始化
  onMounted(() => {
    fetchRoleList()
  })
</script>

<style lang="scss" scoped>
  .role-page {
    :deep(.art-table-card) {
      .el-card__body {
        padding: 16px;
      }
    }
  }
</style>
