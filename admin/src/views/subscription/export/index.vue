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

        <div class="export-card" @click="quickExport('pending')">
          <div class="card-icon warning">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="card-content">
            <h4>待处理用户</h4>
            <p>仅导出待处理状态用户</p>
            <div class="card-stats">{{ stats.pending }} 条记录</div>
          </div>
        </div>

        <div class="export-card" @click="showTypeExportDialog">
          <div class="card-icon info">
            <el-icon><Filter /></el-icon>
          </div>
          <div class="card-content">
            <h4>按类型导出</h4>
            <p>多选筛选条件导出</p>
            <div class="card-stats">点击选择类型</div>
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

    <!-- 按类型导出对话框 -->
    <el-dialog
      v-model="typeExportDialogVisible"
      title="按类型导出"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="type-export-content">
        <el-alert
          title="提示"
          type="info"
          description="可以多选不同的筛选条件，系统将导出满足所有条件的数据"
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <!-- 用户来源 -->
        <div class="filter-section">
          <h4 class="filter-title">
            <el-icon><User /></el-icon>
            用户来源
          </h4>
          <el-checkbox-group v-model="typeExportForm.userSources">
            <el-checkbox value="潜在合作伙伴">潜在合作伙伴</el-checkbox>
            <el-checkbox value="企业客户">企业客户</el-checkbox>
            <el-checkbox value="个人咨询">个人咨询</el-checkbox>
            <el-checkbox value="平台">平台</el-checkbox>
            <el-checkbox value="其他">其他</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 咨询主题 -->
        <div class="filter-section">
          <h4 class="filter-title">
            <el-icon><ChatDotRound /></el-icon>
            咨询主题
          </h4>
          <el-checkbox-group v-model="typeExportForm.subjects">
            <el-checkbox value="售后服务">售后服务</el-checkbox>
            <el-checkbox value="我要订货">我要订货</el-checkbox>
            <el-checkbox value="产品咨询">产品咨询</el-checkbox>
            <el-checkbox value="商务合作">商务合作</el-checkbox>
            <el-checkbox value="媒体咨询">媒体咨询</el-checkbox>
            <el-checkbox value="投诉建议">投诉建议</el-checkbox>
            <el-checkbox value="其他">其他</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 联系方式 -->
        <div class="filter-section">
          <h4 class="filter-title">
            <el-icon><Message /></el-icon>
            联系方式
          </h4>
          <el-checkbox-group v-model="typeExportForm.contactTypes">
            <el-checkbox value="email">邮箱</el-checkbox>
            <el-checkbox value="phone">电话</el-checkbox>
            <el-checkbox value="wechat">微信</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 订阅状态 -->
        <div class="filter-section">
          <h4 class="filter-title">
            <el-icon><CircleCheck /></el-icon>
            订阅状态
          </h4>
          <el-checkbox-group v-model="typeExportForm.statuses">
            <el-checkbox value="subscribed">已订阅</el-checkbox>
            <el-checkbox value="pending">待处理</el-checkbox>
            <el-checkbox value="contacted">已联系</el-checkbox>
            <el-checkbox value="unsubscribed">已取消</el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 选中条件数量提示 -->
        <div class="selected-summary">
          <el-tag type="info" size="large">
            已选择 {{ totalSelectedFilters }} 个筛选条件
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="resetTypeExportForm">重置</el-button>
        <el-button @click="typeExportDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitTypeExport" 
          :loading="exporting"
          :disabled="totalSelectedFilters === 0"
        >
          开始导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Plus, Lightning, Document, CircleCheck, Calendar, Message,
  Clock, Refresh, Delete, View, Filter, User, OfficeBuilding, Platform,
  More, Service, ShoppingCart, Goods, Briefcase, ChatDotRound, Warning, Phone
} from '@element-plus/icons-vue'
import { useSettingStore } from '@/store/modules/setting'
import { SubscriptionService } from '@/api/subscriptionApi'

// 响应式数据
const loading = ref(false)
const exporting = ref(false)
const exportDialogVisible = ref(false)
const typeExportDialogVisible = ref(false)
const exportFormRef = ref()

// 类型导出表单
const typeExportForm = reactive({
  userSources: [] as string[],
  subjects: [] as string[],
  contactTypes: [] as string[],
  statuses: [] as string[]
})

// 计算选中的筛选条件数量
const totalSelectedFilters = computed(() => {
  return typeExportForm.userSources.length + 
         typeExportForm.subjects.length + 
         typeExportForm.contactTypes.length + 
         typeExportForm.statuses.length
})

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  pending: 0,
  email: 0
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const res: any = await SubscriptionService.getSubscriptionStats()
    // 适配不同的响应格式
    const data = res.data || res
    if (data) {
      stats.total = data.total || 0
      stats.active = data.subscribed || 0
      stats.pending = data.pending || 0
      stats.email = data.byContactType?.email || 0
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 导出历史 - 使用localStorage存储
const exportHistory = ref([])

// 从 localStorage 加载导出历史
const loadExportHistory = () => {
  try {
    const saved = localStorage.getItem('export_history')
    if (saved) {
      const parsed = JSON.parse(saved)
      exportHistory.value = parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }))
    }
  } catch (error) {
    console.error('加载导出历史失败:', error)
  }
}

// 保存导出历史到 localStorage
const saveExportHistory = () => {
  try {
    localStorage.setItem('export_history', JSON.stringify(exportHistory.value))
  } catch (error) {
    console.error('保存导出历史失败:', error)
  }
}

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
        // 仅导出已订阅用户
        params.status = 'subscribed'
        break
      case 'pending':
        // 导出待处理用户
        params.status = 'pending'
        break
      case 'email':
        // 仅导出邮箱用户
        params.contactType = 'email'
        break
    }
    
    // 调用导出API
    await SubscriptionService.exportSubscriptions(params)
    
    ElMessage.success('导出成功！文件已开始下载')
    
    // 添加到导出历史
    const newTask = {
      id: Date.now(),
      name: getQuickExportName(type),
      description: getQuickExportDesc(type),
      type,
      recordCount: getQuickExportCount(type),
      fileSize: 0,
      status: 'completed',
      createdAt: new Date()
    }
    exportHistory.value.unshift(newTask)
    saveExportHistory()
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exporting.value = false
  }
}

// 显示类型导出对话框
const showTypeExportDialog = () => {
  typeExportDialogVisible.value = true
}

// 重置类型导出表单
const resetTypeExportForm = () => {
  typeExportForm.userSources = []
  typeExportForm.subjects = []
  typeExportForm.contactTypes = []
  typeExportForm.statuses = []
}

// 提交类型导出
const submitTypeExport = async () => {
  try {
    if (totalSelectedFilters.value === 0) {
      ElMessage.warning('请至少选择一个筛选条件')
      return
    }
    
    exporting.value = true
    
    // 构建查询参数
    const queryParams: any = {
      page: 1,
      size: 1  // 只需要知道数量,不需要实际数据
    }
    
    // 如果选了用户来源
    if (typeExportForm.userSources.length > 0) {
      queryParams.userSource = typeExportForm.userSources.join(',')
    }
    
    // 如果选了咨询主题
    if (typeExportForm.subjects.length > 0) {
      queryParams.subject = typeExportForm.subjects.join(',')
    }
    
    // 如果选了联系方式
    if (typeExportForm.contactTypes.length > 0) {
      queryParams.contactType = typeExportForm.contactTypes.join(',')
    }
    
    // 如果选了状态
    if (typeExportForm.statuses.length > 0) {
      queryParams.status = typeExportForm.statuses.join(',')
    }
    
    // 先查询数据量
    console.log('🔍 查询参数:', JSON.stringify(queryParams, null, 2))
    const result: any = await SubscriptionService.getSubscriptionList(queryParams)
    console.log('📊 查询结果:', JSON.stringify(result, null, 2))
    const total = result.pagination?.total || 0
    console.log('📊 找到数据条数:', total)
    
    if (total === 0) {
      console.log('❌ 没有找到数据,检查数据库中的实际值')
      console.log('选择的userSource:', typeExportForm.userSources)
    }
    
    if (total === 0) {
      ElMessage.warning('没有符合筛选条件的数据,无法导出')
      exporting.value = false
      return
    }
    
    // 确认导出
    await ElMessageBox.confirm(
      `找到 ${total} 条符合条件的数据,确定要导出吗?`,
      '确认导出',
      {
        type: 'info',
        confirmButtonText: '确定导出',
        cancelButtonText: '取消'
      }
    )
    
    // 构建导出参数
    const exportParams: any = {}
    
    if (typeExportForm.userSources.length > 0) {
      exportParams.userSource = typeExportForm.userSources.join(',')
    }
    
    if (typeExportForm.subjects.length > 0) {
      exportParams.subject = typeExportForm.subjects.join(',')
    }
    
    if (typeExportForm.contactTypes.length > 0) {
      exportParams.contactType = typeExportForm.contactTypes.join(',')
    }
    
    if (typeExportForm.statuses.length > 0) {
      exportParams.status = typeExportForm.statuses.join(',')
    }
    
    // 调用导出API
    await SubscriptionService.exportSubscriptions(exportParams)
    
    ElMessage.success(`成功导出 ${total} 条数据!文件已开始下载`)
    
    // 构建描述文本
    const descriptions = []
    if (typeExportForm.userSources.length > 0) {
      descriptions.push(`用户来源: ${typeExportForm.userSources.join(', ')}`)
    }
    if (typeExportForm.subjects.length > 0) {
      descriptions.push(`咨询主题: ${typeExportForm.subjects.join(', ')}`)
    }
    if (typeExportForm.contactTypes.length > 0) {
      descriptions.push(`联系方式: ${typeExportForm.contactTypes.join(', ')}`)
    }
    if (typeExportForm.statuses.length > 0) {
      descriptions.push(`状态: ${typeExportForm.statuses.join(', ')}`)
    }
    
    // 添加到导出历史
    const newTask = {
      id: Date.now(),
      name: `多条件筛选导出`,
      description: descriptions.join(' | '),
      type: 'custom',
      recordCount: total,
      fileSize: Math.round(total * 200),  // 估算文件大小
      status: 'completed',
      createdAt: new Date()
    }
    exportHistory.value.unshift(newTask)
    saveExportHistory()
    
    // 关闭对话框并重置表单
    typeExportDialogVisible.value = false
    resetTypeExportForm()
    
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
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
      page: 1,
      size: 1,
      status: exportForm.status,
      contactType: exportForm.contactType,
      source: exportForm.source
    }

    if (exportForm.dateRange) {
      params.startDate = exportForm.dateRange[0].toISOString().split('T')[0]
      params.endDate = exportForm.dateRange[1].toISOString().split('T')[0]
    }

    // 先查询数据量
    const result: any = await SubscriptionService.getSubscriptionList(params)
    const total = result.pagination?.total || 0
    
    if (total === 0) {
      ElMessage.warning('没有符合筛选条件的数据,无法导出')
      exporting.value = false
      return
    }
    
    // 确认导出
    await ElMessageBox.confirm(
      `找到 ${total} 条符合条件的数据,确定要导出吗?`,
      '确认导出',
      {
        type: 'info',
        confirmButtonText: '确定导出',
        cancelButtonText: '取消'
      }
    )

    // 执行导出
    const exportParams: any = {
      status: exportForm.status,
      contactType: exportForm.contactType,
      source: exportForm.source
    }

    if (exportForm.dateRange) {
      exportParams.startDate = exportForm.dateRange[0].toISOString().split('T')[0]
      exportParams.endDate = exportForm.dateRange[1].toISOString().split('T')[0]
    }

    await SubscriptionService.exportSubscriptions(exportParams)
    ElMessage.success('导出成功！文件已开始下载')
    
    // 添加到历史记录
    const descriptions = []
    if (exportForm.status) descriptions.push(`状态: ${exportForm.status}`)
    if (exportForm.contactType) descriptions.push(`联系方式: ${exportForm.contactType}`)
    if (exportForm.source) descriptions.push(`来源: ${exportForm.source}`)
    if (exportForm.dateRange) descriptions.push(`日期范围`)
    
    const newTask = {
      id: Date.now(),
      name: exportForm.name || `自定义导出_${new Date().toLocaleDateString()}`,
      description: descriptions.length > 0 ? descriptions.join(' | ') : '自定义导出任务',
      type: 'custom',
      recordCount: total,
      fileSize: Math.round(total * 200),
      status: 'completed',
      createdAt: new Date()
    }
    exportHistory.value.unshift(newTask)
    saveExportHistory()
    
    exportDialogVisible.value = false
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出失败:', error)
      ElMessage.error('导出失败,请稍后重试')
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
      saveExportHistory()
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 刷新历史
const refreshHistory = async () => {
  loading.value = true
  try {
    await fetchStats()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 清空历史
const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有导出历史吗？', '提示', {
      type: 'warning'
    })
    
    exportHistory.value = []
    saveExportHistory()
    ElMessage.success('历史记录已清空')
  } catch (error) {
    // 用户取消
  }
}

// 删除单条历史
const deleteExportTask = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条导出记录吗？', '提示', {
      type: 'warning'
    })
    
    const index = exportHistory.value.findIndex((item: any) => item.id === id)
    if (index > -1) {
      exportHistory.value.splice(index, 1)
      saveExportHistory()
      ElMessage.success('删除成功')
    }
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
    pending: '待处理用户导出',
    email: '邮箱用户导出'
  }
  return names[type] || '快速导出'
}

const getQuickExportDesc = (type: string) => {
  const descs: Record<string, string> = {
    all: '导出所有订阅用户数据',
    active: '仅导出已订阅用户',
    pending: '仅导出待处理状态用户',
    email: '仅导出邮箱订阅用户'
  }
  return descs[type] || '快速导出任务'
}

const getQuickExportCount = (type: string) => {
  const counts: Record<string, number> = {
    all: stats.total,
    active: stats.active,
    pending: stats.pending,
    email: stats.email
  }
  return counts[type] || 0
}

const getTypeTag = (type: string) => {
  const tags: Record<string, string> = {
    all: 'primary',
    active: 'success',
    pending: 'warning',
    email: 'info'
  }
  return tags[type] || 'default'
}

const getTypeName = (type: string) => {
  const names: Record<string, string> = {
    all: '全部数据',
    active: '活跃用户',
    pending: '待处理',
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

// 页面可见性监听
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchStats()
  }
}

// 生命周期
onMounted(() => {
  // 加载导出历史
  loadExportHistory()
  pagination.total = exportHistory.value.length
  // 获取统计数据
  fetchStats()
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// keep-alive 激活时刷新
onActivated(() => {
  fetchStats()
})

// 清理监听器
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
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

  // 类型导出对话框样式
  .type-export-content {
    .filter-section {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 8px;

      .filter-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);

        .el-icon {
          font-size: 16px;
          color: #409eff;
        }
      }

      .el-checkbox-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .el-checkbox {
          margin: 0;
        }
      }
    }

    .selected-summary {
      margin-top: 20px;
      padding: 16px;
      text-align: center;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
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
