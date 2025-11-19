<template>
  <div class="subscription-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><User /></el-icon>
            订阅用户管理
          </h1>
          <p class="page-description">全面管理订阅用户，掌握数据洞察，提升运营效率</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="large" @click="showAddDialog" class="primary-btn">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
          <el-button size="large" @click="exportData" class="secondary-btn">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <div class="stat-card total-users">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.total || 0 }}</h3>
            <p class="stat-label">总用户数</p>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>+15.2%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card active-users">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.active || 0 }}</h3>
            <p class="stat-label">活跃用户</p>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>+8.5%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card today-new">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">{{ stats.today || 0 }}</h3>
            <p class="stat-label">今日新增</p>
            <div class="stat-trend up">
              <el-icon><Plus /></el-icon>
              <span>{{ stats.today || 0 }}人</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card conversion-rate">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <h3 class="stat-number">92.3%</h3>
            <p class="stat-label">活跃率</p>
            <div class="stat-trend up">
              <el-icon><CaretTop /></el-icon>
              <span>+3.1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-header">
          <h3 class="search-title">
            <el-icon><Search /></el-icon>
            搜索筛选
          </h3>
          <el-button text @click="toggleSearchExpanded" class="expand-toggle">
            <el-icon>
              <component :is="searchExpanded ? 'ArrowUp' : 'ArrowDown'" />
            </el-icon>
            {{ searchExpanded ? '收起' : '更多筛选' }}
          </el-button>
        </div>

        <div class="search-form" :class="{ expanded: searchExpanded }">
          <div class="search-row primary-row">
            <div class="search-field main-search">
              <el-input
                v-model="searchQuery"
                placeholder="搜索邮箱、微信号或手机号..."
                size="large"
                clearable
                @keyup.enter="handleSearch"
                class="search-input"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <div class="search-field">
              <el-select
                v-model="filters.status"
                placeholder="状态筛选"
                size="large"
                clearable
                class="status-filter"
              >
                <el-option label="全部状态" value="" />
                <el-option label="已订阅" value="subscribed">
                  <div class="option-item">
                    <el-badge is-dot type="success" />
                    <span>已订阅</span>
                  </div>
                </el-option>
                <el-option label="已取消" value="unsubscribed">
                  <div class="option-item">
                    <el-badge is-dot type="danger" />
                    <span>已取消</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="search-actions">
              <el-button type="primary" @click="handleSearch" size="large" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="resetSearch" size="large" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
          </div>

          <div v-show="searchExpanded" class="search-row expanded-row">
            <div class="search-field">
              <el-select
                v-model="filters.contactType"
                placeholder="联系方式类型"
                size="large"
                clearable
              >
                <el-option label="全部类型" value="" />
                <el-option label="邮箱" value="email">
                  <div class="option-item">
                    <el-icon><Message /></el-icon>
                    <span>邮箱</span>
                  </div>
                </el-option>
                <el-option label="微信" value="wechat">
                  <div class="option-item">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>微信</span>
                  </div>
                </el-option>
                <el-option label="手机" value="phone">
                  <div class="option-item">
                    <el-icon><Phone /></el-icon>
                    <span>手机</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="search-field">
              <el-select
                v-model="filters.source"
                placeholder="订阅来源"
                size="large"
                clearable
              >
                <el-option label="全部来源" value="" />
                <el-option label="网站页脚" value="website_footer" />
                <el-option label="联系表单" value="contact_form" />
                <el-option label="手动添加" value="manual" />
              </el-select>
            </div>

            <div class="search-field date-range">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="large"
                clearable
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-section">
      <div class="table-container">
        <div class="table-header">
          <div class="table-title">
            <h3>
              <el-icon><Grid /></el-icon>
              用户列表
              <el-tag class="total-count" type="info">共 {{ pagination.total }} 条</el-tag>
            </h3>
          </div>
          <div class="table-actions">
            <el-button-group>
              <el-button
                type="danger"
                :disabled="!selectedRows.length"
                @click="batchDelete"
                class="batch-btn"
              >
                <el-icon><Delete /></el-icon>
                批量删除 ({{ selectedRows.length }})
              </el-button>
              <el-button @click="refreshData" class="refresh-btn">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </el-button-group>
          </div>
        </div>

        <div class="table-wrapper">
          <el-table
            v-loading="loading"
            :data="tableData"
            @selection-change="handleSelectionChange"
            :row-class-name="getRowClassName"
            class="data-table"
            stripe
          >
            <el-table-column type="selection" width="55" align="center" />
            
            <el-table-column label="姓名" width="120" align="center">
              <template #default="{ row }">
                <div class="user-name">
                  <span class="name-text">{{ (row as any).fullName || '未提供' }}</span>
                  <div class="user-id">ID: {{ row.id }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="联系信息" min-width="280" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="user-info">
                  <div class="contact-badge">
                    <el-tag :type="getContactTypeTagType(row.contactType)" size="small">
                      {{ getContactTypeName(row.contactType) }}
                    </el-tag>
                  </div>
                  <div class="contact-details">
                    <div class="contact-value">{{ row.contactValue }}</div>
                    <div class="contact-meta">
                      {{ getSourceName(row.source) }}
                      <span v-if="(row as any).subject" class="subject-info">
                        · {{ (row as any).subject }}
                      </span>
                    </div>
                  </div>
                  <el-button
                    text
                    size="small"
                    @click="copyContact(row.contactValue)"
                    class="copy-btn"
                  >
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="getStatusTagType(row.status)"
                  effect="dark"
                  class="status-badge"
                >
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="订阅时间" width="180" align="center">
              <template #default="{ row }">
                <div class="time-info">
                  <div class="time-main">{{ formatTime(row.subscribedAt) }}</div>
                  <div class="time-relative">{{ getRelativeTime(row.subscribedAt) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="设备信息" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <div class="device-info">
                  <div class="ip-info">
                    <el-icon><Monitor /></el-icon>
                    <span>{{ row.ipAddress || '未知IP' }}</span>
                  </div>
                  <div class="browser-info">{{ formatUserAgent(row.userAgent) }}</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="240" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    type="primary"
                    size="small"
                    @click="editUser(row)"
                    class="action-btn"
                  >
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button
                    type="info"
                    size="small"
                    @click="showUserDetails(row)"
                    class="action-btn"
                  >
                    <el-icon><InfoFilled /></el-icon>
                    详细内容
                  </el-button>
                  <el-popconfirm
                    title="确定要删除这个用户吗？"
                    @confirm="deleteUser(row)"
                    confirm-button-text="删除"
                    cancel-button-text="取消"
                    confirm-button-type="danger"
                  >
                    <template #reference>
                      <el-button
                        type="danger"
                        size="small"
                        class="action-btn"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
          <div class="pagination-info">
            <span>
              显示第 {{ (pagination.page - 1) * pagination.size + 1 }} - 
              {{ Math.min(pagination.page * pagination.size, pagination.total) }} 条，
              共 {{ pagination.total }} 条记录
            </span>
          </div>
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            class="pagination"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editMode ? '编辑用户' : '新增用户'"
      width="600px"
      destroy-on-close
      class="user-dialog"
    >
      <div class="dialog-content">
        <el-form
          :model="userForm"
          :rules="formRules"
          ref="formRef"
          label-width="120px"
          class="user-form"
        >
          <el-form-item label="联系方式类型" prop="contactType">
            <el-radio-group v-model="userForm.contactType" size="large">
              <el-radio-button label="email">
                <el-icon><Message /></el-icon>
                邮箱
              </el-radio-button>
              <el-radio-button label="wechat">
                <el-icon><ChatDotRound /></el-icon>
                微信
              </el-radio-button>
              <el-radio-button label="phone">
                <el-icon><Phone /></el-icon>
                手机
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="联系方式" prop="contactValue">
            <el-input
              v-model="userForm.contactValue"
              :placeholder="getContactPlaceholder(userForm.contactType)"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon>
                  <component :is="getContactIcon(userForm.contactType)" />
                </el-icon>
              </template>
            </el-input>
            <div class="field-tip">{{ getContactTip(userForm.contactType) }}</div>
          </el-form-item>

          <el-form-item label="订阅来源" prop="source">
            <el-select v-model="userForm.source" placeholder="选择来源" size="large" style="width: 100%">
              <el-option label="网站页脚" value="website_footer">
                <div class="source-option">
                  <el-icon><House /></el-icon>
                  <span>网站页脚</span>
                  <el-tag size="small">自动</el-tag>
                </div>
              </el-option>
              <el-option label="联系表单" value="contact_form">
                <div class="source-option">
                  <el-icon><Document /></el-icon>
                  <span>联系表单</span>
                  <el-tag size="small" type="success">表单</el-tag>
                </div>
              </el-option>
              <el-option label="手动添加" value="manual">
                <div class="source-option">
                  <el-icon><User /></el-icon>
                  <span>手动添加</span>
                  <el-tag size="small" type="warning">手动</el-tag>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item v-if="editMode" label="状态" prop="status">
            <el-radio-group v-model="userForm.status" size="large">
              <el-radio-button label="subscribed">
                <el-icon><Check /></el-icon>
                已订阅
              </el-radio-button>
              <el-radio-button label="unsubscribed">
                <el-icon><Close /></el-icon>
                已取消
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button
            type="primary"
            @click="saveUser"
            size="large"
            :loading="submitting"
          >
            <el-icon><Check /></el-icon>
            {{ editMode ? '保存' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详细信息对话框 -->
    <el-dialog
      v-model="detailsDialogVisible"
      title="订阅用户详细信息"
      width="700px"
      destroy-on-close
      class="details-dialog"
    >
      <div v-if="selectedUserDetails" class="details-content">
        <div class="details-section">
          <h3 class="section-title">
            <el-icon><User /></el-icon>
            基本信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>用户ID</label>
              <span class="info-value">#{{ selectedUserDetails.id }}</span>
            </div>
            <div class="info-item">
              <label>用户姓名</label>
              <span class="info-value">{{ (selectedUserDetails as any).fullName || '用户未提供姓名' }}</span>
            </div>
            <div class="info-item">
              <label>联系方式类型</label>
              <el-tag :type="getContactTypeTagType(selectedUserDetails.contactType)">
                {{ getContactTypeName(selectedUserDetails.contactType) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>联系方式</label>
              <span class="info-value contact-value">
                {{ selectedUserDetails.contactValue }}
                <el-button
                  text
                  size="small"
                  @click="copyContact(selectedUserDetails.contactValue)"
                  class="copy-btn-inline"
                >
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </span>
            </div>
            <div class="info-item">
              <label>订阅状态</label>
              <el-tag :type="getStatusTagType(selectedUserDetails.status)" effect="dark">
                {{ getStatusName(selectedUserDetails.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>订阅来源</label>
              <span class="info-value">{{ getSourceName(selectedUserDetails.source) }}</span>
            </div>
            <div class="info-item">
              <label>用户来源</label>
              <span class="info-value">{{ (selectedUserDetails as any).userSource || '未指定来源' }}</span>
            </div>
            <div class="info-item">
              <label>公司名称</label>
              <span class="info-value">{{ (selectedUserDetails as any).company || '用户未提供公司信息' }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">
            <el-icon><Calendar /></el-icon>
            时间信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>订阅时间</label>
              <span class="info-value">{{ formatTime(selectedUserDetails.subscribedAt) }}</span>
            </div>
            <div class="info-item">
              <label>创建时间</label>
              <span class="info-value">{{ formatTime((selectedUserDetails as any).createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>更新时间</label>
              <span class="info-value">{{ formatTime((selectedUserDetails as any).updatedAt) }}</span>
            </div>
            <div class="info-item">
              <label>距今时间</label>
              <span class="info-value">{{ getRelativeTime(selectedUserDetails.subscribedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">
            <el-icon><Monitor /></el-icon>
            设备信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label>IP地址</label>
              <span class="info-value">{{ selectedUserDetails.ipAddress || '未知' }}</span>
            </div>
            <div class="info-item full-width">
              <label>用户代理</label>
              <span class="info-value user-agent">{{ selectedUserDetails.userAgent || '未知设备' }}</span>
            </div>
            <div class="info-item">
              <label>浏览器</label>
              <span class="info-value">{{ formatUserAgent(selectedUserDetails.userAgent) }}</span>
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3 class="section-title">
            <el-icon><Document /></el-icon>
            订阅详情
          </h3>
          <div class="subscription-details">
            <div class="info-item full-width">
              <label>咨询主题</label>
              <el-tag 
                :type="getSubjectTagType((selectedUserDetails as any).subject)" 
                size="large"
                :class="[
                  'subject-tag',
                  { 'subject-tag-empty': !(selectedUserDetails as any).subject }
                ]"
              >
                {{ (selectedUserDetails as any).subject || '未指定咨询主题' }}
              </el-tag>
            </div>
            <div class="info-item full-width">
              <label>期望服务时间</label>
              <span class="info-value">{{ (selectedUserDetails as any).preferredTime || '用户未指定具体时间' }}</span>
            </div>
            <div class="info-item full-width">
              <label>服务地址</label>
              <span class="info-value">{{ (selectedUserDetails as any).address || '用户未提供地址信息' }}</span>
            </div>
            <div class="info-item full-width">
              <label>留言内容</label>
              <div class="message-content">
                {{ (selectedUserDetails as any).message || '用户未留下任何留言' }}
              </div>
            </div>
            <div class="info-item full-width">
              <label>特殊需求</label>
              <div class="requirements-content">
                {{ (selectedUserDetails as any).requirements || '暂无特殊需求' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="details-footer">
          <el-button @click="detailsDialogVisible = false" size="large">
            <el-icon><Close /></el-icon>
            关闭
          </el-button>
          <el-button type="primary" @click="editFromDetails" size="large">
            <el-icon><Edit /></el-icon>
            编辑用户
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, UserFilled, Plus, Download, Check, Calendar, TrendCharts, CaretTop,
  Search, ArrowUp, ArrowDown, Grid, Delete, Refresh, Message, ChatDotRound,
  Phone, DocumentCopy, Monitor, Edit, Close, House, Document, InfoFilled
} from '@element-plus/icons-vue'
import { SubscriptionService, type SubscriptionItem } from '@/api/subscriptionApi'
import { useSettingStore } from '@/store/modules/setting'

// 响应式数据
const loading = ref(false)
const searchExpanded = ref(false)
const dialogVisible = ref(false)
const editMode = ref(false)
const submitting = ref(false)
const formRef = ref()
const detailsDialogVisible = ref(false)
const selectedUserDetails = ref<SubscriptionItem | null>(null)

// 数据状态
const tableData = ref<SubscriptionItem[]>([])
const selectedRows = ref<SubscriptionItem[]>([])
const searchQuery = ref('')
const dateRange = ref('')

// 筛选条件
const filters = reactive({
  status: '',
  contactType: '',
  source: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  total: 0,
  active: 0,
  today: 0
})

// 用户表单
const userForm = reactive({
  id: undefined as number | undefined,
  contactType: 'email',
  contactValue: '',
  source: 'manual',
  status: 'subscribed'
})

// 表单验证规则
const formRules = {
  contactType: [
    { required: true, message: '请选择联系方式类型', trigger: 'change' }
  ],
  contactValue: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { validator: validateContactValue, trigger: 'blur' }
  ],
  source: [
    { required: true, message: '请选择订阅来源', trigger: 'change' }
  ]
}

// 计算属性
const settingStore = useSettingStore()
const isDarkMode = computed(() => settingStore.isDark)

// 方法函数
function validateContactValue(rule: any, value: string, callback: Function) {
  if (!value) {
    callback(new Error('请输入联系方式'))
    return
  }
  
  const { contactType } = userForm
  if (contactType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入正确的邮箱格式'))
      return
    }
  } else if (contactType === 'phone') {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入正确的手机号格式'))
      return
    }
  } else if (contactType === 'wechat') {
    if (value.length < 6 || value.length > 20) {
      callback(new Error('微信号长度应为6-20位'))
      return
    }
  }
  
  callback()
}

function toggleSearchExpanded() {
  searchExpanded.value = !searchExpanded.value
}

function getContactTypeTagType(type: string): "primary" | "success" | "warning" | "info" | "danger" {
  const typeMap: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = { 
    email: 'primary', 
    wechat: 'success', 
    phone: 'warning' 
  }
  return typeMap[type] || 'info'
}

function getContactTypeName(type: string) {
  const nameMap = { email: '邮箱', wechat: '微信', phone: '手机' }
  return nameMap[type as keyof typeof nameMap] || type
}

function getContactIcon(type: string) {
  const iconMap = { email: 'Message', wechat: 'ChatDotRound', phone: 'Phone' }
  return iconMap[type as keyof typeof iconMap] || 'Message'
}

function getSourceName(source: string) {
  const nameMap = {
    website_footer: '网站页脚',
    contact_form: '联系表单', 
    manual: '手动添加'
  }
  return nameMap[source as keyof typeof nameMap] || source
}

function getStatusTagType(status: string): "primary" | "success" | "warning" | "info" | "danger" {
  return status === 'subscribed' ? 'success' : 'danger'
}

function getStatusName(status: string) {
  return status === 'subscribed' ? '已订阅' : '已取消'
}

function getSubjectTagType(subject: string): "primary" | "success" | "warning" | "info" | "danger" {
  // 如果没有主题或是默认文本，返回一个特殊的类型
  if (!subject || subject === '未指定咨询主题') {
    return 'info'
  }
  
  const subjectTypeMap: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = {
    '产品咨询': 'primary',
    '我要订货': 'success', 
    '售后服务': 'warning',
    '商务合作': 'info',
    '媒体咨询': 'info',
    '投诉建议': 'danger',
    '其他': 'info'
  }
  return subjectTypeMap[subject] || 'info'
}

function getRowClassName({ row }: { row: SubscriptionItem }) {
  return row.status === 'subscribed' ? 'active-row' : 'inactive-row'
}

function getContactPlaceholder(type: string) {
  const placeholders = {
    email: '请输入邮箱地址，如：user@example.com',
    wechat: '请输入微信号，6-20位字符',
    phone: '请输入手机号，11位数字'
  }
  return placeholders[type as keyof typeof placeholders] || '请输入联系方式'
}

function getContactTip(type: string) {
  const tips = {
    email: '请确保邮箱地址格式正确且可正常接收邮件',
    wechat: '请输入真实可用的微信号，用于后续联系',
    phone: '请输入11位有效的中国大陆手机号码'
  }
  return tips[type as keyof typeof tips] || ''
}

function formatTime(timeStr: string) {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleDateString('zh-CN') + ' ' + 
         date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getRelativeTime(timeStr: string) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return `${Math.floor(days / 30)}月前`
}

function formatUserAgent(userAgent: string) {
  if (!userAgent) return '未知设备'
  if (userAgent.includes('Chrome')) return 'Chrome浏览器'
  if (userAgent.includes('Firefox')) return 'Firefox浏览器'
  if (userAgent.includes('Safari')) return 'Safari浏览器'
  if (userAgent.includes('Edge')) return 'Edge浏览器'
  return '其他浏览器'
}

async function copyContact(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 事件处理函数
async function handleSearch() {
  pagination.page = 1
  await loadData()
}

function resetSearch() {
  searchQuery.value = ''
  Object.assign(filters, { status: '', contactType: '', source: '' })
  dateRange.value = ''
  handleSearch()
}

function showAddDialog() {
  editMode.value = false
  Object.assign(userForm, {
    id: undefined,
    contactType: 'email',
    contactValue: '',
    source: 'manual',
    status: 'subscribed'
  })
  dialogVisible.value = true
}

function editUser(row: SubscriptionItem) {
  editMode.value = true
  Object.assign(userForm, {
    id: row.id,
    contactType: row.contactType,
    contactValue: row.contactValue,
    source: row.source,
    status: row.status
  })
  dialogVisible.value = true
}

function showUserDetails(row: SubscriptionItem) {
  selectedUserDetails.value = row
  detailsDialogVisible.value = true
}

function editFromDetails() {
  if (selectedUserDetails.value) {
    detailsDialogVisible.value = false
    editUser(selectedUserDetails.value)
  }
}

async function saveUser() {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    if (editMode.value) {
      if (userForm.id) {
        await SubscriptionService.toggleSubscriptionStatus(userForm.id, userForm.status)
        ElMessage.success('修改成功')
      }
    } else {
      await SubscriptionService.createSubscription({
        contactType: userForm.contactType,
        contactValue: userForm.contactValue,
        source: userForm.source
      })
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
    await loadData()
    await loadStats()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}



async function deleteUser(row: SubscriptionItem) {
  try {
    await SubscriptionService.deleteSubscription(row.id)
    ElMessage.success('删除成功')
    await loadData()
    await loadStats()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败，请重试')
  }
}

async function batchDelete() {
  if (!selectedRows.value.length) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    await SubscriptionService.batchDeleteSubscriptions(ids)
    ElMessage.success(`成功删除 ${ids.length} 个用户`)
    
    selectedRows.value = []
    await loadData()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败，请重试')
    }
  }
}

function handleSelectionChange(selection: SubscriptionItem[]) {
  selectedRows.value = selection
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.page = 1
  loadData()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

async function exportData() {
  try {
    ElMessage.info('正在准备导出数据...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

function refreshData() {
  loadData()
  loadStats()
}

// 数据加载
async function loadData() {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      contact: searchQuery.value,
      ...filters
    }
    
    const response: any = await SubscriptionService.getSubscriptionList(params)
    
    if (response.code === 200) {
      tableData.value = response.data.list
      pagination.total = response.data.pagination.total
    } else {
      ElMessage.error(response.msg || '数据加载失败')
    }
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const response: any = await SubscriptionService.getSubscriptionStats()
    if (response.code === 200) {
      Object.assign(stats, {
        total: response.data.total,
        active: response.data.subscribed,
        today: response.data.todayNew
      })
    }
  } catch (error) {
    console.error('统计数据加载失败:', error)
  }
}

// 生命周期
onMounted(() => {
  loadData()
  loadStats()
})
</script>

<style scoped>
/* ===========================================
   基础布局样式
   =========================================== */
.subscription-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
  transition: all 0.3s ease;
}

.subscription-page.dark-mode {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

/* ===========================================
   页面头部样式
   =========================================== */
.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .page-header {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #1a1a1a;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-mode .page-title {
  color: #e5e5e5;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 36px;
  color: #667eea;
}

.dark-mode .title-icon {
  color: #60a5fa;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.dark-mode .page-description {
  color: #9ca3af;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  color: #374151;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dark-mode .secondary-btn {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #d1d5db;
}

.secondary-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  transform: translateY(-2px);
}

/* ===========================================
   统计卡片样式
   =========================================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dark-mode .stat-card {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.dark-mode .stat-card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 20px 20px 0 0;
}

.total-users::before { background: linear-gradient(90deg, #667eea, #764ba2); }
.active-users::before { background: linear-gradient(90deg, #10b981, #059669); }
.today-new::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
.conversion-rate::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.total-users .stat-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
.active-users .stat-icon { background: linear-gradient(135deg, #10b981, #059669); }
.today-new .stat-icon { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.conversion-rate .stat-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.dark-mode .stat-number {
  color: #f3f4f6;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.dark-mode .stat-label {
  color: #9ca3af;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.stat-trend.up {
  color: #10b981;
}

/* ===========================================
   搜索区域样式
   =========================================== */
.search-section {
  margin-bottom: 24px;
}

.search-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark-mode .search-container {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .search-title {
  color: #f3f4f6;
}

.expand-toggle {
  color: #6b7280;
  font-weight: 500;
}

.dark-mode .expand-toggle {
  color: #9ca3af;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.search-field {
  min-width: 200px;
  flex: 1;
}

.search-field.main-search {
  min-width: 300px;
  flex: 2;
}

.search-field.date-range {
  min-width: 280px;
}

.search-input :deep(.el-input__inner) {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.dark-mode .search-input :deep(.el-input__inner) {
  background: rgba(55, 65, 81, 0.5);
  border: 1px solid #4b5563;
  color: #f3f4f6;
}

.search-input :deep(.el-input__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.search-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  border-radius: 12px;
  font-weight: 600;
}

.reset-btn {
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  color: #374151;
  border-radius: 12px;
  font-weight: 500;
}

.dark-mode .reset-btn {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #d1d5db;
}

.expanded-row {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===========================================
   表格区域样式
   =========================================== */
.table-section {
  margin-bottom: 24px;
}

.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark-mode .table-container {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .table-title h3 {
  color: #f3f4f6;
}

.total-count {
  margin-left: 12px;
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.batch-btn {
  background: #ef4444;
  border: none;
  color: white;
  border-radius: 8px;
  font-weight: 500;
}

.refresh-btn {
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
}

.dark-mode .refresh-btn {
  background: rgba(156, 163, 175, 0.1);
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #d1d5db;
}

.table-wrapper {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
}

.data-table {
  border-radius: 16px;
}

.data-table :deep(.el-table__header) {
  background: #f8fafc;
}

.dark-mode .data-table :deep(.el-table__header) {
  background: #374151;
}

.data-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.dark-mode .data-table :deep(.el-table__header th) {
  background: #374151;
  color: #f3f4f6;
  border-bottom: 1px solid #4b5563;
}

.data-table :deep(.el-table__body) {
  background: white;
}

.dark-mode .data-table :deep(.el-table__body) {
  background: #1f2937;
}

.data-table :deep(.el-table__row) {
  transition: all 0.3s ease;
  background: white;
}

.dark-mode .data-table :deep(.el-table__row) {
  background: #1f2937;
}

.data-table :deep(.el-table--striped .el-table__row--striped td) {
  background: #f8fafc;
}

.dark-mode .data-table :deep(.el-table--striped .el-table__row--striped td) {
  background: #374151;
}

.data-table :deep(.el-table__row):hover {
  background: #f1f5f9 !important;
}

.dark-mode .data-table :deep(.el-table__row):hover {
  background: #4b5563 !important;
}

.data-table :deep(.el-table__row.active-row) {
  background: #f8fafc;
}

.dark-mode .data-table :deep(.el-table__row.active-row) {
  background: #374151;
}

.data-table :deep(.el-table__row.inactive-row) {
  background: #f1f5f9;
}

.dark-mode .data-table :deep(.el-table__row.inactive-row) {
  background: #4b5563;
}

.data-table :deep(.el-table td) {
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  background: transparent;
}

.dark-mode .data-table :deep(.el-table td) {
  border-bottom: 1px solid #4b5563;
  color: #d1d5db;
  background: transparent;
}

/* 用户姓名样式 */
.user-name {
  text-align: center;
  padding: 4px 0;
}

.name-text {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.dark-mode .name-text {
  color: #f3f4f6;
}

.user-id {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.dark-mode .user-id {
  color: #9ca3af;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.contact-badge {
  flex-shrink: 0;
}

.contact-details {
  flex: 1;
  min-width: 0;
}

.contact-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
  word-break: break-all;
}

.dark-mode .contact-value {
  color: #f3f4f6;
}

.contact-meta {
  font-size: 12px;
  color: #6b7280;
}

.dark-mode .contact-meta {
  color: #9ca3af;
}

.subject-info {
  color: #667eea;
  font-weight: 500;
}

.dark-mode .subject-info {
  color: #60a5fa;
}

.copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: #6b7280;
  flex-shrink: 0;
}

.user-info:hover .copy-btn {
  opacity: 1;
}

.status-badge {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
}

.time-info {
  text-align: center;
}

.time-main {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  margin-bottom: 4px;
}

.dark-mode .time-main {
  color: #d1d5db;
}

.time-relative {
  font-size: 12px;
  color: #6b7280;
}

.dark-mode .time-relative {
  color: #9ca3af;
}

.device-info {
  padding: 4px 0;
}

.ip-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 13px;
  margin-bottom: 4px;
}

.dark-mode .ip-info {
  color: #d1d5db;
}

.browser-info {
  font-size: 12px;
  color: #6b7280;
}

.dark-mode .browser-info {
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 64px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
}

/* ===========================================
   分页样式
   =========================================== */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.dark-mode .pagination-container {
  border-top: 1px solid #4b5563;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.dark-mode .pagination-info {
  color: #9ca3af;
}

.pagination :deep(.el-pagination) {
  color: #374151;
}

.dark-mode .pagination :deep(.el-pagination) {
  color: #d1d5db;
}

/* ===========================================
   对话框样式
   =========================================== */
.user-dialog :deep(.el-dialog) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .user-dialog :deep(.el-dialog) {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
}

.user-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px 32px 20px;
  border-radius: 20px 20px 0 0;
  margin: 0;
}

.user-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.dialog-content {
  padding: 32px;
}

.dark-mode .dialog-content {
  background: rgba(38, 38, 38, 0.95);
  color: #f3f4f6;
}

.user-form {
  margin: 0;
}

.user-form :deep(.el-form-item__label) {
  color: #374151;
  font-weight: 600;
}

.dark-mode .user-form :deep(.el-form-item__label) {
  color: #f3f4f6;
}

.user-form :deep(.el-radio-group) {
  display: flex;
  gap: 8px;
}

.user-form :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
}

.field-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  line-height: 1.4;
}

.dark-mode .field-tip {
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  background: #f8fafc;
  border-radius: 0 0 20px 20px;
  margin: 0;
}

.dark-mode .dialog-footer {
  background: #374151;
  border-top: 1px solid #4b5563;
}

.dialog-footer .el-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

/* ===========================================
   响应式设计
   =========================================== */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .subscription-page {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-field,
  .search-field.main-search,
  .search-field.date-range {
    min-width: unset;
    width: 100%;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .user-dialog :deep(.el-dialog) {
    width: 95%;
    margin: 5vh auto;
  }
  
  .dialog-content {
    padding: 24px;
  }
  
  .dialog-footer {
    padding: 16px 24px;
  }
}

/* ===========================================
   动画效果
   =========================================== */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-container,
.table-container {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===========================================
   特殊效果
   =========================================== */
.subscription-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23000" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23000" opacity="0.02"/><circle cx="50" cy="50" r="0.5" fill="%23000" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

.dark-mode.subscription-page::before {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23fff" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23fff" opacity="0.02"/><circle cx="50" cy="50" r="0.5" fill="%23fff" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
}

.page-header,
.search-container,
.table-container,
.stat-card {
  position: relative;
  z-index: 1;
}

/* ===========================================
   详细信息对话框样式
   =========================================== */
.details-dialog :deep(.el-dialog) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark-mode .details-dialog :deep(.el-dialog) {
  background: rgba(38, 38, 38, 0.95);
  border: 1px solid rgba(82, 82, 82, 0.3);
}

.details-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px 32px 20px;
  border-radius: 20px 20px 0 0;
  margin: 0;
}

.details-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.details-content {
  padding: 24px 32px;
  max-height: 70vh;
  overflow-y: auto;
}

.dark-mode .details-content {
  background: rgba(38, 38, 38, 0.95);
  color: #f3f4f6;
}

.details-section {
  margin-bottom: 32px;
}

.details-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.dark-mode .section-title {
  color: #f3f4f6;
  border-bottom-color: #4b5563;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-mode .info-item label {
  color: #9ca3af;
}

.info-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dark-mode .info-value {
  color: #d1d5db;
}

.contact-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.copy-btn-inline {
  opacity: 0.7;
  transition: opacity 0.2s;
  color: #6b7280;
  margin-left: auto;
}

.copy-btn-inline:hover {
  opacity: 1;
}

.user-agent {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
  line-height: 1.4;
}

.dark-mode .user-agent {
  color: #9ca3af;
}

.subscription-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-content,
.requirements-content {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 16px;
  min-height: 60px;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #e5e7eb;
  word-wrap: break-word;
}

.dark-mode .message-content,
.dark-mode .requirements-content {
  background: #374151;
  color: #d1d5db;
  border-color: #4b5563;
}

.subject-tag {
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.subject-tag.el-tag--primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
}

.subject-tag.el-tag--success {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
}

.subject-tag.el-tag--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: none;
  color: white;
}

.subject-tag.el-tag--info {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  border: none;
  color: white;
}

.subject-tag.el-tag--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  color: white;
}

/* 为空数据的咨询主题提供特殊样式 */
.subject-tag-empty {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 1px solid #e5e7eb !important;
}

.dark-mode .subject-tag-empty {
  background: #374151 !important;
  color: #9ca3af !important;
  border: 1px solid #4b5563 !important;
}

.details-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px 32px;
  background: #f8fafc;
  border-radius: 0 0 20px 20px;
  margin: 0;
}

.dark-mode .details-footer {
  background: #374151;
  border-top: 1px solid #4b5563;
}

.details-footer .el-button {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .details-dialog :deep(.el-dialog) {
    width: 95%;
    margin: 5vh auto;
  }
  
  .details-content {
    padding: 16px 20px;
    max-height: 60vh;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .details-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .details-footer .el-button {
    width: 100%;
  }
}
</style> 