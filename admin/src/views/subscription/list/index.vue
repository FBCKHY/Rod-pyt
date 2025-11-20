<template>
  <div class="subscription-page">
    <!-- 页面头部 - 简洁设计 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><Bell /></el-icon>
          订阅管理中心
        </h1>
        <p class="page-desc">管理用户订阅信息、查看详细数据和处理客户咨询</p>
      </div>
      <div class="header-actions">
        <el-switch
          v-model="isDarkTheme"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          inline-prompt
          style="margin-right: 12px;"
        />
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          添加订阅
        </el-button>
        <el-button :icon="Download" @click="handleExport">
          导出Excel
        </el-button>
        <el-button :icon="Refresh" circle @click="fetchData" />
      </div>
    </div>

    <!-- 统计卡片 - 精简版 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">总订阅数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.active }}</div>
          <div class="stat-label">已订阅</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Phone /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.contacted }}</div>
          <div class="stat-label">已联系</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stats.todayNew }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索联系方式、姓名或留言内容..."
        :prefix-icon="Search"
        clearable
        class="search-input"
        @input="handleSearch"
      />
      
      <el-select
        v-model="filterStatus"
        placeholder="状态筛选"
        clearable
        @change="handleFilter"
      >
        <el-option label="全部状态" value="" />
        <el-option label="已订阅" value="subscribed" />
        <el-option label="已联系" value="contacted" />
        <el-option label="待处理" value="pending" />
      </el-select>
      
      <el-select
        v-model="filterSource"
        placeholder="来源筛选"
        clearable
        @change="handleFilter"
      >
        <el-option label="全部来源" value="" />
        <el-option label="网站表单" value="contact_form" />
        <el-option label="页脚订阅" value="website_footer" />
        <el-option label="手动添加" value="manual" />
      </el-select>
      
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleFilter"
      />
    </div>

    <!-- 数据表格 - 增强版 -->
    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @selection-change="handleSelectionChange"
        class="enhanced-table"
      >
        <el-table-column type="selection" width="45" />
        
        <!-- 基本信息列 -->
        <el-table-column label="订阅信息" width="280">
          <template #default="{ row }">
            <div class="subscriber-info">
              <div class="main-info">
                <span class="contact-value">{{ row.contactValue }}</span>
                <el-tag size="small" :type="getContactTypeTag(row.contactType)">
                  {{ getContactTypeLabel(row.contactType) }}
                </el-tag>
              </div>
              <div class="sub-info">
                <span v-if="row.fullName" class="info-item">
                  <el-icon><User /></el-icon>
                  {{ row.fullName }}
                </span>
                <span v-if="row.company" class="info-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  {{ row.company }}
                </span>
                <span class="info-item">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(row.subscribedAt) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 咨询内容列 -->
        <el-table-column label="咨询内容" width="300">
          <template #default="{ row }">
            <div class="content-cell">
              <div v-if="row.subject" class="subject-line">
                <el-tag size="small" effect="plain">{{ row.subject }}</el-tag>
              </div>
              <div v-if="row.message" class="message-preview">
                {{ truncateText(row.message, 100) }}
              </div>
              <div v-if="row.note" class="note-section">
                <el-icon><EditPen /></el-icon>
                备注: {{ row.note }}
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 备注列 -->
        <el-table-column label="备注" width="200">
          <template #default="{ row }">
            <div class="note-cell">
              <span v-if="row.note" class="note-text">{{ truncateText(row.note, 50) }}</span>
              <span v-else class="no-note">-</span>
            </div>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="处理状态" width="120" align="center">
          <template #default="{ row }">
            <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
              <el-tag 
                :type="getStatusType(row.status)" 
                class="status-tag"
                style="cursor: pointer;"
              >
                {{ getStatusLabel(row.status) }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-tag>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="subscribed">
                    <el-icon><CircleCheck /></el-icon>
                    已订阅
                  </el-dropdown-item>
                  <el-dropdown-item command="contacted">
                    <el-icon><Phone /></el-icon>
                    已联系
                  </el-dropdown-item>
                  <el-dropdown-item command="pending">
                    <el-icon><Clock /></el-icon>
                    待处理
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button
                type="primary"
                link
                :icon="View"
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                type="primary"
                link
                :icon="DocumentCopy"
                @click="copyContact(row)"
              >
                复制
              </el-button>
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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

    <!-- 订阅详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订阅详情"
      width="700px"
      class="detail-dialog"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">
            <el-icon><User /></el-icon>
            基本信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>联系方式:</label>
              <span>{{ currentDetail.contactValue }}</span>
              <el-tag size="small" style="margin-left: 8px;">
                {{ getContactTypeLabel(currentDetail.contactType) }}
              </el-tag>
            </div>
            <div v-if="currentDetail.fullName" class="info-item">
              <label>姓名:</label>
              <span>{{ currentDetail.fullName }}</span>
            </div>
            <div v-if="currentDetail.company" class="info-item">
              <label>公司:</label>
              <span>{{ currentDetail.company }}</span>
            </div>
            <div v-if="currentDetail.userSource" class="info-item">
              <label>用户来源:</label>
              <span>{{ currentDetail.userSource }}</span>
            </div>
            <div class="info-item">
              <label>订阅时间:</label>
              <span>{{ formatDateTime(currentDetail.subscribedAt) }}</span>
            </div>
            <div v-if="currentDetail.ipAddress" class="info-item">
              <label>IP地址:</label>
              <span>{{ currentDetail.ipAddress }}</span>
            </div>
          </div>
        </div>

        <!-- 咨询内容 -->
        <div v-if="currentDetail.subject || currentDetail.message" class="detail-section">
          <h3 class="section-title">
            <el-icon><ChatLineSquare /></el-icon>
            咨询内容
          </h3>
          <div v-if="currentDetail.subject" class="content-block">
            <label>咨询主题:</label>
            <el-tag>{{ currentDetail.subject }}</el-tag>
          </div>
          <div v-if="currentDetail.message" class="content-block">
            <label>留言内容:</label>
            <div class="message-content">{{ currentDetail.message }}</div>
          </div>
        </div>

        <!-- 备注管理 -->
        <div class="detail-section">
          <h3 class="section-title">
            <el-icon><EditPen /></el-icon>
            备注信息
          </h3>
          <el-input
            v-model="currentDetail.note"
            type="textarea"
            :rows="3"
            placeholder="添加备注信息..."
            @blur="updateNote"
          />
        </div>

        <!-- 状态管理 -->
        <div class="detail-section">
          <h3 class="section-title">
            <el-icon><Setting /></el-icon>
            状态管理
          </h3>
          <div class="status-control">
            <el-radio-group v-model="currentDetail.status" @change="updateStatus">
              <el-radio-button value="subscribed">
                <el-icon><CircleCheck /></el-icon>
                已订阅
              </el-radio-button>
              <el-radio-button value="contacted">
                <el-icon><Phone /></el-icon>
                已联系
              </el-radio-button>
              <el-radio-button value="pending">
                <el-icon><Clock /></el-icon>
                待处理
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveDetail">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell, Plus, Download, Refresh, Search, User, CircleCheck, Phone, Calendar,
  Clock, View, DocumentCopy, Delete, EditPen, ChatLineSquare, Setting,
  ArrowDown, OfficeBuilding, Moon, Sunny
} from '@element-plus/icons-vue'
import { 
  getSubscriptions, 
  updateSubscription, 
  deleteSubscription,
  exportSubscriptions 
} from '@/api/subscriptionApi'
import { useSettingStore } from '@/store/modules/setting'
import { SystemThemeEnum } from '@/enums/appEnum'

// 获取全局设置store
const settingStore = useSettingStore()

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const filterSource = ref('')
const dateRange = ref([])
const tableData = ref([])
const selectedRows = ref([])
const detailDialogVisible = ref(false)
const currentDetail = ref(null)
const isDarkTheme = ref(settingStore.isDark)

// 监听主题变化
watch(() => settingStore.isDark, (newVal) => {
  isDarkTheme.value = newVal
})

// 监听组件内主题切换
watch(isDarkTheme, (newVal) => {
  const theme = newVal ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT
  settingStore.setGlopTheme(theme, theme)
})

// 统计数据
const stats = ref({
  total: 0,
  active: 0,
  contacted: 0,
  todayNew: 0
})

// 分页
const pagination = ref({
  page: 1,
  size: 20,
  total: 0
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size,
      search: searchQuery.value,
      status: filterStatus.value,
      source: filterSource.value,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1]
    }
    
    const response = await getSubscriptions(params)
    console.log('📊 API响应:', response)
    
    // 检查响应数据结构 - 兼容两种格式
    let data = null
    if (response && response.data) {
      // 格式1: {data: {list: [], pagination: {}}}
      data = response.data
    } else if (response && response.list) {
      // 格式2: {list: [], pagination: {}}
      data = response
    }
    
    if (data && data.list) {
      tableData.value = data.list || []
      pagination.value.total = data.pagination?.total || 0
      
      console.log('✅ 数据加载成功:', tableData.value.length, '条记录')
      
      // 更新统计
      updateStats(data)
    } else {
      console.warn('⚠️ 响应数据格式不正确:', response)
      tableData.value = []
      ElMessage.warning('暂无数据')
    }
  } catch (error) {
    console.error('❌ 获取数据失败:', error)
    ElMessage.error('获取数据失败: ' + (error.message || '未知错误'))
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = (data) => {
  stats.value = {
    total: data.pagination.total,
    active: data.list.filter(item => item.status === 'subscribed').length,
    contacted: data.list.filter(item => item.status === 'contacted').length,
    todayNew: data.todayNew || 0
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.page = 1
  fetchData()
}

// 筛选处理
const handleFilter = () => {
  pagination.value.page = 1
  fetchData()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchData()
}

const handlePageSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  fetchData()
}

// 选择处理
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 查看详情
const handleViewDetail = async (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 更新备注
const updateNote = async () => {
  if (!currentDetail.value) return
  
  try {
    await updateSubscription(currentDetail.value.id, {
      note: currentDetail.value.note
    })
    ElMessage.success('备注已更新')
    fetchData()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 更新状态
const updateStatus = async () => {
  if (!currentDetail.value) return
  
  try {
    await updateSubscription(currentDetail.value.id, {
      status: currentDetail.value.status
    })
    ElMessage.success('状态已更新')
    fetchData()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 状态快速切换
const handleStatusChange = async (row, status) => {
  try {
    await updateSubscription(row.id, { status })
    ElMessage.success('状态已更新')
    fetchData()
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 保存详情
const saveDetail = async () => {
  if (!currentDetail.value) return
  
  try {
    const updateData = {
      note: currentDetail.value.note,
      status: currentDetail.value.status
    }
    await updateSubscription(currentDetail.value.id, updateData)
    ElMessage.success('保存成功')
    detailDialogVisible.value = false
    fetchData()
  } catch (error: any) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + (error.message || '未知错误'))
  }
}

// 复制联系方式
const copyContact = (row) => {
  navigator.clipboard.writeText(row.contactValue)
  ElMessage.success('已复制到剪贴板')
}

// 删除订阅
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除这条订阅记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  
  try {
    await deleteSubscription(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 新增订阅
const handleAdd = () => {
  ElMessage.info('新增功能开发中')
}

// 导出数据
const handleExport = async () => {
  try {
    await exportSubscriptions()
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 工具函数
const getContactTypeTag = (type) => {
  const map = { email: 'primary', wechat: 'success', phone: 'warning' }
  return map[type] || 'info'
}

const getContactTypeLabel = (type) => {
  const map = { email: '邮箱', wechat: '微信', phone: '电话' }
  return map[type] || type
}

const getSourceTag = (source) => {
  const map = { contact_form: 'primary', website_footer: 'success', manual: 'info' }
  return map[source] || 'info'
}

const getSourceLabel = (source) => {
  const map = { contact_form: '表单提交', website_footer: '页脚订阅', manual: '手动添加' }
  return map[source] || source
}

const getStatusType = (status) => {
  const map = { subscribed: 'success', contacted: 'primary', pending: 'warning' }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = { subscribed: '已订阅', contacted: '已联系', pending: '待处理' }
  return map[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
@import './styles.scss';
</style>
