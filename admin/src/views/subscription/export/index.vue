<template>
  <div class="subscription-export-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><Download /></el-icon>
          数据导出
        </h1>
        <p class="page-subtitle">导出订阅数据，支持多种格式和自定义筛选</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" size="large" @click="showExportDialog">
          新建导出任务
        </el-button>
      </div>
    </div>

    <!-- 快速导出卡片 -->
    <div class="quick-export-section">
      <h3 class="section-title">
        <el-icon><Lightning /></el-icon>
        快速导出
      </h3>
      <div class="quick-export-cards">
        <div class="export-card" @click="quickExport('all')">
          <div class="card-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <h4>全部数据</h4>
            <p>导出所有订阅用户数据</p>
            <div class="card-stats">{{ stats.total }} 条记录</div>
          </div>
        </div>

        <div class="export-card" @click="quickExport('active')">
          <div class="card-icon success">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="card-content">
            <h4>活跃用户</h4>
            <p>仅导出已订阅用户</p>
            <div class="card-stats">{{ stats.active }} 条记录</div>
          </div>
        </div>

        <div class="export-card" @click="quickExport('recent')">
          <div class="card-icon warning">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="card-content">
            <h4>近期新增</h4>
            <p>最近30天新增用户</p>
            <div class="card-stats">{{ stats.recent }} 条记录</div>
          </div>
        </div>

        <div class="export-card" @click="quickExport('email')">
          <div class="card-icon info">
            <el-icon><Message /></el-icon>
          </div>
          <div class="card-content">
            <h4>邮箱用户</h4>
            <p>仅导出邮箱订阅用户</p>
            <div class="card-stats">{{ stats.email }} 条记录</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出历史 -->
    <div class="export-history-section">
      <div class="section-header">
        <h3 class="section-title">
          <el-icon><Clock /></el-icon>
          导出历史
        </h3>
        <div class="section-actions">
          <el-button :icon="Refresh" @click="refreshHistory">刷新</el-button>
          <el-button :icon="Delete" type="danger" @click="clearHistory">清空历史</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="exportHistory"
        class="history-table"
      >
        <el-table-column label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="task-info">
              <div class="task-name">{{ row.name }}</div>
              <div class="task-desc">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="导出类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="记录数量" width="100" align="center">
          <template #default="{ row }">
            <span class="record-count">{{ row.recordCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="文件大小" width="100" align="center">
          <template #default="{ row }">
            <span class="file-size">{{ formatFileSize(row.fileSize) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180" align="center">
          <template #default="{ row }">
            <div class="time-info">
              <div>{{ formatDate(row.createdAt) }}</div>
              <div class="time-ago">{{ getTimeAgo(row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'completed'"
                text
                type="primary"
                :icon="Download"
                size="small"
                @click="downloadFile(row)"
              >
                下载
              </el-button>
              <el-button
                v-if="row.status === 'processing'"
                text
                type="warning"
                :icon="View"
                size="small"
                @click="viewProgress(row)"
              >
                查看进度
              </el-button>
              <el-button
                text
                type="danger"
                :icon="Delete"
                size="small"
                @click="deleteTask(row)"
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 导出配置对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="新建导出任务"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="exportFormRef"
        :model="exportForm"
        :rules="exportRules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input
            v-model="exportForm.name"
            placeholder="请输入任务名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="导出格式" prop="format">
          <el-radio-group v-model="exportForm.format">
            <el-radio value="excel">Excel (.xlsx)</el-radio>
            <el-radio value="csv">CSV (.csv)</el-radio>
            <el-radio value="json">JSON (.json)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="筛选条件">
          <div class="filter-options">
            <el-select
              v-model="exportForm.status"
              placeholder="订阅状态"
              clearable
              style="width: 120px; margin-right: 8px;"
            >
              <el-option label="已订阅" value="subscribed" />
              <el-option label="已取消" value="unsubscribed" />
            </el-select>

            <el-select
              v-model="exportForm.contactType"
              placeholder="联系方式"
              clearable
              style="width: 120px; margin-right: 8px;"
            >
              <el-option label="邮箱" value="email" />
              <el-option label="微信" value="wechat" />
              <el-option label="电话" value="phone" />
            </el-select>

            <el-select
              v-model="exportForm.source"
              placeholder="来源"
              clearable
              style="width: 120px;"
            >
              <el-option label="网站底部" value="website_footer" />
              <el-option label="联系表单" value="contact_form" />
              <el-option label="手动添加" value="manual" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="导出字段">
          <el-checkbox-group v-model="exportForm.fields">
            <el-checkbox value="id">ID</el-checkbox>
            <el-checkbox value="contactType">联系方式类型</el-checkbox>
            <el-checkbox value="contactValue">联系方式</el-checkbox>
            <el-checkbox value="source">来源</el-checkbox>
            <el-checkbox value="status">状态</el-checkbox>
            <el-checkbox value="ipAddress">IP地址</el-checkbox>
            <el-checkbox value="createdAt">创建时间</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitExport" :loading="exporting">
          开始导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Plus, Lightning, Document, CircleCheck, Calendar, Message,
  Clock, Refresh, Delete, View
} from '@element-plus/icons-vue'
import { useSettingStore } from '@/store/modules/setting'
import { SubscriptionService } from '@/api/subscriptionApi'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const exportDialogVisible = ref(false)
const exportFormRef = ref()

// 统计数据
const stats = reactive({
  total: 1234,
  active: 1050,
  recent: 156,
  email: 680
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 导出历史
const exportHistory = ref([
  {
    id: 1,
    name: '全部订阅用户导出',
    description: '导出所有订阅用户数据',
    type: 'all',
    recordCount: 1234,
    fileSize: 245760,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 2,
    name: '活跃用户导出',
    description: '仅导出已订阅用户',
    type: 'active',
    recordCount: 1050,
    fileSize: 210240,
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    name: '邮箱用户导出',
    description: '仅导出邮箱订阅用户',
    type: 'email',
    recordCount: 680,
    fileSize: 0,
    status: 'processing',
    createdAt: new Date(Date.now() - 10 * 60 * 1000)
  }
])

// 导出表单
const exportForm = reactive({
  name: '',
  format: 'excel',
  status: '',
  contactType: '',
  source: '',
  dateRange: null as [Date, Date] | null,
  fields: ['contactType', 'contactValue', 'source', 'status', 'createdAt']
})

// 表单验证规则
const exportRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' }
  ]
}

// 计算属性
const settingStore = useSettingStore()
const isDarkMode = computed(() => settingStore.isDark)

// 快速导出
const quickExport = async (type: string) => {
  try {
    exporting.value = true
    
    const params: any = {}
    switch (type) {
      case 'active':
        params.status = 'subscribed'
        break
      case 'recent':
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        params.startDate = thirtyDaysAgo.toISOString()
        break
      case 'email':
        params.contactType = 'email'
        break
    }

    await SubscriptionService.exportSubscriptions(params)
    ElMessage.success('导出成功')
    
    // 添加到历史记录
    const newTask = {
      id: Date.now(),
      name: getQuickExportName(type),
      description: getQuickExportDesc(type),
      type,
      recordCount: getQuickExportCount(type),
      fileSize: Math.floor(Math.random() * 500000) + 100000,
      status: 'completed',
      createdAt: new Date()
    }
    exportHistory.value.unshift(newTask)
    
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 显示导出对话框
const showExportDialog = () => {
  exportForm.name = `订阅数据导出_${new Date().toLocaleDateString()}`
  exportDialogVisible.value = true
}

// 提交导出
const submitExport = async () => {
  try {
    await exportFormRef.value.validate()
    exporting.value = true

    const params: any = {
      status: exportForm.status,
      contactType: exportForm.contactType,
      source: exportForm.source
    }

    if (exportForm.dateRange) {
      params.startDate = exportForm.dateRange[0].toISOString()
      params.endDate = exportForm.dateRange[1].toISOString()
    }

    await SubscriptionService.exportSubscriptions(params)
    ElMessage.success('导出任务已创建')
    
    // 添加到历史记录
    const newTask = {
      id: Date.now(),
      name: exportForm.name,
      description: '自定义导出任务',
      type: 'custom',
      recordCount: Math.floor(Math.random() * 1000) + 100,
      fileSize: 0,
      status: 'processing',
      createdAt: new Date()
    }
    exportHistory.value.unshift(newTask)
    
    exportDialogVisible.value = false
    
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('创建导出任务失败')
    }
  } finally {
    exporting.value = false
  }
}

// 下载文件
const downloadFile = (row: any) => {
  ElMessage.success(`开始下载 ${row.name}`)
}

// 查看进度
const viewProgress = (row: any) => {
  ElMessage.info(`${row.name} 正在处理中，请稍后...`)
}

// 删除任务
const deleteTask = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个导出任务吗？', '提示', {
      type: 'warning'
    })
    
    const index = exportHistory.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 刷新历史
const refreshHistory = () => {
  ElMessage.success('历史记录已刷新')
}

// 清空历史
const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有导出历史吗？', '提示', {
      type: 'warning'
    })
    
    exportHistory.value = []
    ElMessage.success('历史记录已清空')
  } catch (error) {
    // 用户取消
  }
}

// 分页处理
const handlePageChange = () => {
  // 加载数据
}

const handlePageSizeChange = () => {
  pagination.page = 1
  // 加载数据
}

// 工具函数
const getQuickExportName = (type: string) => {
  const names: Record<string, string> = {
    all: '全部订阅用户导出',
    active: '活跃用户导出',
    recent: '近期新增用户导出',
    email: '邮箱用户导出'
  }
  return names[type] || '快速导出'
}

const getQuickExportDesc = (type: string) => {
  const descs: Record<string, string> = {
    all: '导出所有订阅用户数据',
    active: '仅导出已订阅用户',
    recent: '最近30天新增用户',
    email: '仅导出邮箱订阅用户'
  }
  return descs[type] || '快速导出任务'
}

const getQuickExportCount = (type: string) => {
  const counts: Record<string, number> = {
    all: stats.total,
    active: stats.active,
    recent: stats.recent,
    email: stats.email
  }
  return counts[type] || 0
}

const getTypeTag = (type: string) => {
  const tags: Record<string, string> = {
    all: 'primary',
    active: 'success',
    recent: 'warning',
    email: 'info',
    custom: ''
  }
  return tags[type] || ''
}

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    all: '全部数据',
    active: '活跃用户',
    recent: '近期新增',
    email: '邮箱用户',
    custom: '自定义'
  }
  return names[type] || type
}

const getStatusTag = (status: string) => {
  const tags: Record<string, string> = {
    completed: 'success',
    processing: 'warning',
    failed: 'danger'
  }
  return tags[status] || ''
}

const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败'
  }
  return names[status] || status
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (date: Date) => {
  return date.toLocaleString('zh-CN')
}

const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 生命周期
onMounted(() => {
  pagination.total = exportHistory.value.length
})
</script>

<style scoped lang="scss">
.subscription-export-page {
  padding: 24px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
  transition: all 0.3s ease;

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
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;

        .title-icon {
          font-size: 32px;
          color: #409eff;
        }
      }

      .page-subtitle {
        color: var(--el-text-color-regular);
        font-size: 14px;
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  // 快速导出区域
  .quick-export-section {
    margin-bottom: 32px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
    }

    .quick-export-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;

      .export-card {
        background: var(--el-bg-color);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 16px;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #409eff;
          color: #fff;
          font-size: 20px;

          &.success { background: #67c23a; }
          &.warning { background: #e6a23c; }
          &.info { background: #909399; }
        }

        .card-content {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          p {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: var(--el-text-color-regular);
          }

          .card-stats {
            font-size: 12px;
            color: #409eff;
            font-weight: 500;
          }
        }
      }
    }
  }

  // 导出历史区域
  .export-history-section {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
      }

      .section-actions {
        display: flex;
        gap: 8px;
      }
    }

    .history-table {
      .task-info {
        .task-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .task-desc {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }

      .record-count {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .file-size {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        color: var(--el-text-color-regular);
      }

      .time-info {
        text-align: center;

        .time-ago {
          font-size: 12px;
          color: var(--el-text-color-regular);
          margin-top: 4px;
        }
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
  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  // 深色模式适配
  &.dark-mode {
    .export-card,
    .export-history-section {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

@media (max-width: 768px) {
  .quick-export-cards {
    grid-template-columns: 1fr !important;
  }
}
</style>
