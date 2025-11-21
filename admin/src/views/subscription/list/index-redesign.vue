<template>
  <div class="subscription-page-redesign">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Notification /></el-icon>
          订阅管理
        </h1>
        <p class="page-subtitle">管理和分析用户订阅数据</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" size="large" @click="handleAdd">
          新增订阅
        </el-button>
        <el-button :icon="Download" size="large" @click="handleExport">
          导出数据
        </el-button>
        <el-button :icon="Refresh" size="large" circle @click="handleRefresh" />
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div class="stats-overview">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-label">总订阅数</div>
          <div class="stat-trend positive">
            <el-icon><TrendCharts /></el-icon>
            <span>+12.5%</span>
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.subscribed || 0 }}</div>
          <div class="stat-label">活跃订阅</div>
          <div class="stat-trend positive">
            <el-icon><TrendCharts /></el-icon>
            <span>+8.3%</span>
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.todayNew || 0 }}</div>
          <div class="stat-label">今日新增</div>
          <div class="stat-trend positive">
            <el-icon><TrendCharts /></el-icon>
            <span>+{{ stats.todayNew || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><DataAnalysis /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ conversionRate }}%</div>
          <div class="stat-label">转化率</div>
          <div class="stat-trend positive">
            <el-icon><TrendCharts /></el-icon>
            <span>+3.2%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索邮箱、微信号或手机号..."
          :prefix-icon="Search"
          size="large"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="filter-right">
        <el-select
          v-model="filters.status"
          placeholder="状态"
          size="large"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="已订阅" value="subscribed" />
          <el-option label="已取消" value="unsubscribed" />
        </el-select>

        <el-select
          v-model="filters.contactType"
          placeholder="联系方式"
          size="large"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="邮箱" value="email">
            <el-icon><Message /></el-icon>
            <span style="margin-left: 8px">邮箱</span>
          </el-option>
          <el-option label="微信" value="wechat">
            <el-icon><ChatDotRound /></el-icon>
            <span style="margin-left: 8px">微信</span>
          </el-option>
          <el-option label="电话" value="phone">
            <el-icon><Phone /></el-icon>
            <span style="margin-left: 8px">电话</span>
          </el-option>
        </el-select>

        <el-select
          v-model="filters.source"
          placeholder="来源"
          size="large"
          clearable
          class="filter-select"
          @change="handleSearch"
        >
          <el-option label="网站底部" value="website_footer" />
          <el-option label="联系表单" value="contact_form" />
          <el-option label="手动添加" value="manual" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="large"
          clearable
          class="date-picker"
          @change="handleSearch"
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <div class="table-header">
        <div class="table-title">
          <el-icon><Grid /></el-icon>
          <span>订阅列表</span>
          <el-tag type="info" size="small">共 {{ pagination.total }} 条</el-tag>
        </div>
        <div class="table-actions">
          <el-button
            v-if="selectedRows.length > 0"
            type="danger"
            :icon="Delete"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRows.length }})
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        class="modern-table"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column type="selection" width="50" align="center" />
        
        <el-table-column label="ID" prop="id" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">#{{ row.id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="联系方式" min-width="280">
          <template #default="{ row }">
            <div class="contact-cell">
              <div class="contact-type-badge">
                <el-icon v-if="row.contactType === 'email'"><Message /></el-icon>
                <el-icon v-else-if="row.contactType === 'wechat'"><ChatDotRound /></el-icon>
                <el-icon v-else><Phone /></el-icon>
              </div>
              <div class="contact-info">
                <div class="contact-value">{{ row.contactValue }}</div>
                <div class="contact-meta">
                  <el-tag size="small" :type="getContactTypeTag(row.contactType)">
                    {{ getContactTypeName(row.contactType) }}
                  </el-tag>
                </div>
              </div>
              <el-button
                text
                :icon="DocumentCopy"
                size="small"
                @click="copyToClipboard(row.contactValue)"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="来源" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getSourceTag(row.source)" size="small">
              {{ getSourceName(row.source) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'subscribed' ? 'success' : 'info'"
              effect="dark"
              size="small"
            >
              {{ row.status === 'subscribed' ? '已订阅' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="IP地址" width="140" align="center">
          <template #default="{ row }">
            <span class="ip-address">{{ row.ipAddress || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="订阅时间" width="180" align="center">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate(row.subscribedAt) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                text
                type="primary"
                :icon="Edit"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                text
                type="danger"
                :icon="Delete"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="modern-form"
      >
        <el-form-item label="联系方式类型" prop="contactType">
          <el-radio-group v-model="formData.contactType" size="large">
            <el-radio-button value="email">
              <el-icon><Message /></el-icon>
              邮箱
            </el-radio-button>
            <el-radio-button value="wechat">
              <el-icon><ChatDotRound /></el-icon>
              微信
            </el-radio-button>
            <el-radio-button value="phone">
              <el-icon><Phone /></el-icon>
              电话
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="联系方式" prop="contactValue">
          <el-input
            v-model="formData.contactValue"
            :placeholder="getPlaceholder(formData.contactType)"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item label="来源" prop="source">
          <el-select v-model="formData.source" placeholder="选择来源" size="large" style="width: 100%">
            <el-option label="网站底部" value="website_footer" />
            <el-option label="联系表单" value="contact_form" />
            <el-option label="手动添加" value="manual" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="dialogType === 'edit'" label="状态" prop="status">
          <el-radio-group v-model="formData.status" size="large">
            <el-radio-button value="subscribed">已订阅</el-radio-button>
            <el-radio-button value="unsubscribed">已取消</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false" size="large">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Download, Refresh, User, CircleCheck, Calendar, DataAnalysis,
  TrendCharts, Search, Message, ChatDotRound, Phone, Grid, Delete,
  DocumentCopy, Clock, Edit, Notification
} from '@element-plus/icons-vue'
import { SubscriptionService } from '@/api/subscriptionApi'

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref()

const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])
const searchQuery = ref('')
const dateRange = ref<[Date, Date] | null>(null)

const filters = reactive({
  status: '',
  contactType: '',
  source: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const stats = reactive({
  total: 0,
  subscribed: 0,
  unsubscribed: 0,
  todayNew: 0,
  thisWeekNew: 0,
  thisMonthNew: 0
})

const formData = reactive({
  id: undefined as number | undefined,
  contactType: 'email',
  contactValue: '',
  source: 'manual',
  status: 'subscribed'
})

const formRules = {
  contactType: [{ required: true, message: '请选择联系方式类型', trigger: 'change' }],
  contactValue: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }]
}

// 计算属性
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增订阅' : '编辑订阅')
const conversionRate = computed(() => {
  const total = stats.total || 0
  const subscribed = stats.subscribed || 0
  return total > 0 ? Math.round((subscribed / total) * 100) : 0
})

// 方法
const fetchData = async () => {
  try {
    loading.value = true
    const params: any = {
      page: pagination.page,
      size: pagination.size,
      ...filters
    }

    if (searchQuery.value) {
      params.contact = searchQuery.value
    }

    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }

    const res = await SubscriptionService.getSubscriptionList(params)
    if (res && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await SubscriptionService.getSubscriptionStats()
    if (res && res.data) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
  fetchStats()
}

const handlePageChange = () => {
  fetchData()
}

const handlePageSizeChange = () => {
  pagination.page = 1
  fetchData()
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(formData, {
    id: undefined,
    contactType: 'email',
    contactValue: '',
    source: 'manual',
    status: 'subscribed'
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(formData, {
    id: row.id,
    contactType: row.contactType,
    contactValue: row.contactValue,
    source: row.source,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    if (dialogType.value === 'add') {
      await SubscriptionService.createSubscription({
        contactType: formData.contactType,
        contactValue: formData.contactValue,
        source: formData.source
      })
      ElMessage.success('添加成功')
    } else {
      await SubscriptionService.toggleSubscriptionStatus(formData.id!, formData.status)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchData()
    fetchStats()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条订阅记录吗？', '提示', {
      type: 'warning'
    })

    await SubscriptionService.deleteSubscription(row.id)
    ElMessage.success('删除成功')
    fetchData()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      type: 'warning'
    })

    const ids = selectedRows.value.map(row => row.id)
    await SubscriptionService.batchDeleteSubscriptions(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    fetchData()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleExport = async () => {
  try {
    const params: any = { ...filters }
    if (searchQuery.value) params.contact = searchQuery.value
    if (dateRange.value) {
      params.startDate = dateRange.value[0].toISOString()
      params.endDate = dateRange.value[1].toISOString()
    }

    await SubscriptionService.exportSubscriptions(params)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

const getContactTypeName = (type: string) => {
  const map: Record<string, string> = {
    email: '邮箱',
    wechat: '微信',
    phone: '电话'
  }
  return map[type] || type
}

const getContactTypeTag = (type: string) => {
  const map: Record<string, any> = {
    email: 'primary',
    wechat: 'success',
    phone: 'warning'
  }
  return map[type] || 'info'
}

const getSourceName = (source: string) => {
  const map: Record<string, string> = {
    website_footer: '网站底部',
    contact_form: '联系表单',
    manual: '手动添加'
  }
  return map[source] || source
}

const getSourceTag = (source: string) => {
  const map: Record<string, any> = {
    website_footer: 'primary',
    contact_form: 'success',
    manual: 'warning'
  }
  return map[source] || 'info'
}

const getPlaceholder = (type: string) => {
  const map: Record<string, string> = {
    email: '请输入邮箱地址',
    wechat: '请输入微信号',
    phone: '请输入手机号码'
  }
  return map[type] || '请输入联系方式'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 生命周期
onMounted(() => {
  fetchData()
  fetchStats()
})
</script>

<style scoped lang="scss">
.subscription-page-redesign {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;

  // 页面头部
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;

        .title-icon {
          font-size: 32px;
          color: #409eff;
        }
      }

      .page-subtitle {
        color: #909399;
        font-size: 14px;
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  // 统计卡片
  .stats-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s;
      border-left: 4px solid;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      &.primary {
        border-left-color: #409eff;
        .stat-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      }

      &.success {
        border-left-color: #67c23a;
        .stat-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
      }

      &.warning {
        border-left-color: #e6a23c;
        .stat-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
      }

      &.info {
        border-left-color: #909399;
        .stat-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28px;
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 8px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #67c23a;

          &.positive {
            color: #67c23a;
          }

          &.negative {
            color: #f56c6c;
          }
        }
      }
    }
  }

  // 筛选区域
  .filter-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .filter-left {
      flex: 1;
      min-width: 300px;

      .search-input {
        width: 100%;
      }
    }

    .filter-right {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .filter-select {
        width: 140px;
      }

      .date-picker {
        width: 280px;
      }
    }
  }

  // 表格区域
  .table-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .modern-table {
      border-radius: 8px;
      overflow: hidden;

      .contact-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .contact-type-badge {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #409eff;
        }

        .contact-info {
          flex: 1;

          .contact-value {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
          }

          .contact-meta {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .time-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: #606266;
        font-size: 13px;
      }

      .ip-address {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: #606266;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
    }

    .pagination-wrapper {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  // 表单样式
  .modern-form {
    padding: 20px 0;
  }
}
</style>
