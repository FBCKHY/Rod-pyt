<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 如果你想使用 template 语法，请移步功能示例下面的高级表格示例 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model:filter="defaultFilter" @reset="resetSearch" @search="handleSearch" />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshAll">
        <template #left>
          <ElButton @click="showDialog('add')">新增用户</ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="isLoading"
        :data="tableData"
        :columns="columns"
        :pagination="paginationState"
        @selection-change="handleSelectionChange"
        @pagination:size-change="onPageSizeChange"
        @pagination:current-change="onCurrentPageChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessageBox, ElMessage, ElTag } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import { UserService } from '@/api/usersApi'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.User.UserListItem
  const { width } = useWindowSize()
  const { getUserList } = UserService

  // 弹窗相关
  const dialogType = ref<Form.DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 表单搜索初始值
  const defaultFilter = ref({
    keyword: '',
    status: '',
    department: '',
    role: ''
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    'active': { type: 'success' as const, text: '正常' },
    'inactive': { type: 'info' as const, text: '禁用' },
    'deleted': { type: 'danger' as const, text: '已删除' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    tableData,
    isLoading,
    paginationState,
    searchData,
    searchState,
    resetSearch,
    onPageSizeChange,
    onCurrentPageChange,
    refreshAll
  } = useTable<UserListItem>({
    // 核心配置
    core: {
      apiFn: getUserList,
      apiParams: {
        page: 1,
        size: 20,
        ...defaultFilter.value
      },
      paginationKey: {
        current: 'page',
        size: 'size'
      },
      // 自定义分页字段映射，同时需要在 apiParams 中配置字段名
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'username',
          label: '用户名',
          minWidth: 150
        },
        {
          prop: 'nickname',
          label: '昵称',
          minWidth: 120
        },
        {
          prop: 'email',
          label: '邮箱',
          minWidth: 180
        },
        {
          prop: 'department',
          label: '部门',
          minWidth: 120
        },
        {
          prop: 'roles',
          label: '角色',
          formatter: (row) => {
            if (!row.roles || row.roles.length === 0) return '-'
            return h('div', {}, row.roles.map((role: any) => 
              h(ElTag, { size: 'small', style: 'margin-right: 5px' }, () => role.name)
            ))
          }
        },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'created_at',
          label: '创建时间',
          minWidth: 160,
          formatter: (row) => {
            if (!row.created_at) return '-'
            return new Date(row.created_at).toLocaleString('zh-CN')
          }
        },
        {
          prop: 'operation',
          label: '操作',
          width: 280,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', { style: 'display: flex; gap: 4px; flex-wrap: wrap;' }, [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'view',
                text: row.status === 'active' ? '禁用' : '启用',
                onClick: () => toggleStatus(row)
              }),
              h(ArtButtonTable, {
                type: 'view',
                text: '重置密码',
                onClick: () => resetPassword(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    },
    // 数据处理
    transform: {
      dataTransformer: (records: any) => {
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }
        return records
      }
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...searchParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchState, { ...searchParams, startTime, endTime })
    searchData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: Form.DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 切换用户状态
   */
  const toggleStatus = async (row: any): Promise<void> => {
    try {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      const action = newStatus === 'active' ? '启用' : '禁用'
      
      await ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, `${action}用户`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await UserService.toggleUserStatus(row.id, newStatus)
      ElMessage.success(`${action}成功`)
      refreshAll()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('切换状态失败:', error)
        ElMessage.error(error.msg || '操作失败')
      }
    }
  }

  /**
   * 重置密码
   */
  const resetPassword = async (row: any): Promise<void> => {
    try {
      const { value: newPassword } = await ElMessageBox.prompt('请输入新密码(至少6位)', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.{6,}/,
        inputErrorMessage: '密码长度不能少于6位'
      })
      
      if (newPassword) {
        await UserService.resetPassword(row.id, newPassword)
        ElMessage.success('密码重置成功')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('重置密码失败:', error)
        ElMessage.error(error.msg || '操作失败')
      }
    }
  }

  /**
   * 删除用户
   */
  const deleteUser = async (row: any): Promise<void> => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '删除用户', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await UserService.deleteUser(row.id)
      ElMessage.success('删除成功')
      refreshAll()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error(error.msg || '操作失败')
      }
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      // 刷新列表
      refreshAll()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
