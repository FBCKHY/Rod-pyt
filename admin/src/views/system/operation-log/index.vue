<template>
  <div class="operation-log-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard shadow="never" style="margin-bottom: 12px">
      <ElForm inline>
        <ElFormItem label="模块">
          <ElSelect v-model="searchForm.module" placeholder="请选择模块" clearable style="width: 150px">
            <ElOption label="用户" value="user" />
            <ElOption label="角色" value="role" />
            <ElOption label="权限" value="permission" />
            <ElOption label="认证" value="auth" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="操作类型">
          <ElSelect v-model="searchForm.action" placeholder="请选择操作" clearable style="width: 150px">
            <ElOption label="创建" value="create" />
            <ElOption label="更新" value="update" />
            <ElOption label="删除" value="delete" />
            <ElOption label="登录" value="login" />
            <ElOption label="登出" value="logout" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="用户名">
          <ElInput v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 150px" />
        </ElFormItem>
        <ElFormItem label="日期范围">
          <ElDatePicker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">搜索</ElButton>
          <ElButton @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格 -->
    <ElCard class="art-table-card" shadow="never">
      <ElTable :data="logList" :loading="loading" border stripe>
        <ElTableColumn type="index" label="序号" width="60" />
        <ElTableColumn prop="username" label="操作用户" width="120" />
        <ElTableColumn prop="module" label="模块" width="100">
          <template #default="{ row }">
            <ElTag :type="getModuleType(row.module)" size="small">
              {{ getModuleName(row.module) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="action" label="操作类型" width="100">
          <template #default="{ row }">
            <ElTag :type="getActionType(row.action)" size="small">
              {{ getActionName(row.action) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="ip" label="IP地址" width="140" />
        <ElTableColumn prop="request_method" label="请求方法" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getMethodType(row.request_method)" size="small">
              {{ row.request_method }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="response_status" label="状态码" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="row.response_status === 200 ? 'success' : 'danger'" size="small">
              {{ row.response_status }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="duration" label="耗时(ms)" width="100" align="center" />
        <ElTableColumn prop="created_at" label="操作时间" width="180">
          <template #default="{ row }">
            {{ row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small" @click="showDetail(row)">
              详情
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
        @size-change="fetchLogList"
        @current-change="fetchLogList"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </ElCard>

    <!-- 详情对话框 -->
    <ElDialog v-model="detailVisible" title="操作日志详情" width="700px">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="操作用户">{{ currentLog?.username || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户ID">{{ currentLog?.user_id || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="模块">{{ getModuleName(currentLog?.module) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作类型">{{ getActionName(currentLog?.action) }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作描述" :span="2">{{ currentLog?.description || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="IP地址">{{ currentLog?.ip || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求方法">{{ currentLog?.request_method || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求URL" :span="2">{{ currentLog?.request_url || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="响应状态">{{ currentLog?.response_status || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="执行时长">{{ currentLog?.duration || '-' }} ms</ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间" :span="2">
          {{ currentLog?.created_at ? new Date(currentLog.created_at).toLocaleString('zh-CN') : '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="User-Agent" :span="2">
          {{ currentLog?.user_agent || '-' }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求参数" :span="2">
          <pre style="max-height: 200px; overflow-y: auto; margin: 0">{{ formatJSON(currentLog?.request_params) }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="错误信息" :span="2" v-if="currentLog?.error_message">
          <ElAlert :title="currentLog.error_message" type="error" :closable="false" />
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { http } from '@/utils/http'

  defineOptions({ name: 'OperationLog' })

  // 搜索表单
  const searchForm = reactive({
    module: '',
    action: '',
    username: ''
  })

  const dateRange = ref<[Date, Date] | null>(null)

  // 分页
  const pagination = reactive({
    page: 1,
    size: 20,
    total: 0
  })

  // 日志列表
  const logList = ref<any[]>([])
  const loading = ref(false)

  // 详情对话框
  const detailVisible = ref(false)
  const currentLog = ref<any>(null)

  // 获取日志列表
  const fetchLogList = async () => {
    try {
      loading.value = true
      const params: any = {
        page: pagination.page,
        size: pagination.size,
        ...searchForm
      }

      if (dateRange.value) {
        params.startDate = dateRange.value[0].toISOString()
        params.endDate = dateRange.value[1].toISOString()
      }

      const res: any = await http.get('/api/operation-logs', { params })
      if (res && res.list) {
        logList.value = res.list || []
        pagination.total = res.total || 0
      }
    } catch (error) {
      console.error('获取日志列表失败:', error)
      ElMessage.error('获取日志列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchLogList()
  }

  // 重置
  const handleReset = () => {
    searchForm.module = ''
    searchForm.action = ''
    searchForm.username = ''
    dateRange.value = null
    pagination.page = 1
    fetchLogList()
  }

  // 显示详情
  const showDetail = (row: any) => {
    currentLog.value = row
    detailVisible.value = true
  }

  // 格式化JSON
  const formatJSON = (str: string) => {
    if (!str) return '-'
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  // 获取模块名称
  const getModuleName = (module: string) => {
    const map: Record<string, string> = {
      user: '用户',
      role: '角色',
      permission: '权限',
      auth: '认证'
    }
    return map[module] || module
  }

  // 获取模块类型
  const getModuleType = (module: string): any => {
    const map: Record<string, string> = {
      user: 'primary',
      role: 'success',
      permission: 'warning',
      auth: 'info'
    }
    return map[module] || ''
  }

  // 获取操作名称
  const getActionName = (action: string) => {
    const map: Record<string, string> = {
      create: '创建',
      update: '更新',
      delete: '删除',
      login: '登录',
      logout: '登出',
      toggleStatus: '切换状态',
      resetPassword: '重置密码',
      assignPermissions: '分配权限'
    }
    return map[action] || action
  }

  // 获取操作类型
  const getActionType = (action: string): any => {
    const map: Record<string, string> = {
      create: 'success',
      update: 'primary',
      delete: 'danger',
      login: 'info',
      logout: 'warning'
    }
    return map[action] || ''
  }

  // 获取请求方法类型
  const getMethodType = (method: string): any => {
    const map: Record<string, string> = {
      GET: 'info',
      POST: 'success',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'primary'
    }
    return map[method] || ''
  }

  // 初始化
  onMounted(() => {
    fetchLogList()
  })
</script>

<style lang="scss" scoped>
  .operation-log-page {
    :deep(.art-table-card) {
      .el-card__body {
        padding: 16px;
      }
    }
  }
</style>
