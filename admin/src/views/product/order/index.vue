<!-- 产品订单管理 -->
<template>
  <div class="product-order-page art-full-height">
    <!-- 页面头部 -->
    <ElCard class="header-card" :class="{ 'header-card-dark': isDark }" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <h3>订单管理</h3>
          <p>查看和管理所有产品订单，处理发货、退款及售后服务</p>
        </div>
        <div class="header-right">
          <div class="stat-item">
            <div class="stat-value">12</div>
            <div class="stat-label">待处理</div>
          </div>
          <ElDivider direction="vertical" />
          <div class="stat-item">
            <div class="stat-value">¥25,840</div>
            <div class="stat-label">今日金额</div>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 搜索栏 -->
      <ElCard class="search-card" shadow="never">
        <ElForm :model="searchForm" inline class="search-form">
          <ElFormItem label="订单号">
            <ElInput
              v-model="searchForm.orderNo"
              placeholder="请输入订单号"
              clearable
              prefix-icon="Search"
              style="width: 220px"
            />
          </ElFormItem>
          <ElFormItem label="订单状态">
            <ElSelect
              v-model="searchForm.status"
              placeholder="全部状态"
              clearable
              style="width: 160px"
            >
              <template #prefix>
                <div class="status-dot" :class="searchForm.status || 'default'"></div>
              </template>
              <ElOption label="待付款" value="pending">
                <span class="option-dot warning"></span>待付款
              </ElOption>
              <ElOption label="已付款" value="paid">
                <span class="option-dot primary"></span>已付款
              </ElOption>
              <ElOption label="配送中" value="shipping">
                <span class="option-dot info"></span>配送中
              </ElOption>
              <ElOption label="已完成" value="completed">
                <span class="option-dot success"></span>已完成
              </ElOption>
              <ElOption label="已取消" value="cancelled">
                <span class="option-dot danger"></span>已取消
              </ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="下单时间">
            <ElDatePicker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 260px"
            />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleSearch">
              <ElIcon><Search /></ElIcon> 查询
            </ElButton>
            <ElButton @click="resetSearch">
              <ElIcon><RefreshLeft /></ElIcon> 重置
            </ElButton>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <!-- 表格区域 -->
      <ElCard class="table-card" shadow="never">
        <!-- 表格头部 -->
        <div class="table-header">
          <div class="header-left">
            <div class="table-title">订单列表</div>
          </div>
          <div class="header-right">
            <ElButton @click="exportData">
              <ElIcon><Download /></ElIcon> 导出
            </ElButton>
            <ElButton @click="refreshData" :loading="isLoading">
              <ElIcon><Refresh /></ElIcon> 刷新
            </ElButton>
          </div>
        </div>

        <!-- 表格 -->
        <ElTable
          :data="tableData"
          :loading="isLoading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          class="order-table"
        >
          <ElTableColumn type="selection" width="50" />
          <ElTableColumn prop="orderNo" label="订单信息" min-width="240">
            <template #default="{ row }">
              <div class="order-info">
                <div class="order-no">{{ row.orderNo }}</div>
                <div class="order-meta">
                  <span class="customer">{{ row.customerName }}</span>
                  <span class="separator">|</span>
                  <span class="phone">{{ row.customerPhone }}</span>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="productName" label="产品信息" min-width="200">
            <template #default="{ row }">
              <div class="product-info">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-spec">{{ row.productSpec }} x{{ row.quantity }}</div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="totalAmount" label="金额" width="120">
            <template #default="{ row }">
              <div class="amount-info">
                <div class="amount">¥{{ row.totalAmount?.toFixed(2) }}</div>
                <div class="payment">{{ row.paymentMethod }}</div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="status" label="状态" width="100">
            <template #default="{ row }">
              <div class="status-tag" :class="row.status">
                <span class="dot"></span>
                {{ getStatusText(row.status) }}
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createdAt" label="下单时间" width="160">
            <template #default="{ row }">
              <div class="time-info">{{ formatDateTime(row.createdAt) }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <ElButton link type="primary" @click="viewOrder(row)">查看</ElButton>
                <template v-if="row.status === 'pending'">
                  <ElButton link type="success" @click="confirmPayment(row)">确认</ElButton>
                  <ElButton link type="danger" @click="cancelOrder(row)">取消</ElButton>
                </template>
                <ElButton v-else-if="row.status === 'paid'" link type="warning" @click="startShipping(row)">发货</ElButton>
                <ElButton v-else-if="row.status === 'shipping'" link type="success" @click="completeOrder(row)">完成</ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </ElCard>
    </div>

    <!-- 订单详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
      class="order-detail-dialog"
      :class="{ 'dark-dialog': isDark }"
    >
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="订单号">{{ selectedOrder.orderNo }}</ElDescriptionsItem>
            <ElDescriptionsItem label="订单状态">
              <div class="status-tag" :class="selectedOrder.status">
                <span class="dot"></span>
                {{ getStatusText(selectedOrder.status) }}
              </div>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="下单时间">{{ formatDateTime(selectedOrder.createdAt) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="支付方式">{{ selectedOrder.paymentMethod }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">收货信息</div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="客户姓名">{{ selectedOrder.customerName }}</ElDescriptionsItem>
            <ElDescriptionsItem label="联系电话">{{ selectedOrder.customerPhone }}</ElDescriptionsItem>
            <ElDescriptionsItem label="收货地址" :span="2">{{ selectedOrder.shippingAddress }}</ElDescriptionsItem>
            <ElDescriptionsItem label="备注" :span="2">{{ selectedOrder.remark || '无' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">产品信息</div>
          <ElTable :data="[selectedOrder]" border style="width: 100%">
            <ElTableColumn prop="productName" label="产品名称" />
            <ElTableColumn prop="productSpec" label="规格" />
            <ElTableColumn prop="unitPrice" label="单价">
              <template #default="{ row }">¥{{ row.unitPrice?.toFixed(2) }}</template>
            </ElTableColumn>
            <ElTableColumn prop="quantity" label="数量" />
            <ElTableColumn prop="totalAmount" label="小计">
              <template #default="{ row }">¥{{ row.totalAmount?.toFixed(2) }}</template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        <ElButton v-if="selectedOrder?.status === 'pending'" type="primary" @click="detailDialogVisible = false">去支付</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import {
  ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElIcon,
  ElTable, ElTableColumn, ElPagination, ElDialog, ElDatePicker,
  ElDescriptions, ElDescriptionsItem, ElMessage, ElMessageBox, ElDivider
} from 'element-plus'
import {
  Search, RefreshLeft, Download, Refresh
} from '@element-plus/icons-vue'

defineOptions({ name: 'ProductOrder' })

// 引入 Store
const settingStore = useSettingStore()
const isDark = computed(() => settingStore.isDark)

// 类型定义
interface OrderItem {
  id: number
  orderNo: string
  customerName: string
  customerPhone: string
  shippingAddress: string
  productName: string
  productSpec: string
  quantity: number
  unitPrice: number
  totalAmount: number
  status: string
  paymentMethod: string
  remark: string
  createdAt: string
}

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: '',
  dateRange: []
})

// 表格数据
const tableData = ref<OrderItem[]>([
  {
    id: 1,
    orderNo: 'ORD20240801001',
    customerName: '张三',
    customerPhone: '13888888888',
    shippingAddress: '广东省深圳市南山区某某街道123号',
    productName: '星火Pro 智能燃气灶',
    productSpec: '3L容量 白色',
    quantity: 2,
    unitPrice: 999.00,
    totalAmount: 1998.00,
    status: 'paid',
    paymentMethod: '微信支付',
    remark: '请尽快发货',
    createdAt: '2024-08-01 10:30:00'
  },
  {
    id: 2,
    orderNo: 'ORD20240801002',
    customerName: '李四',
    customerPhone: '13999999999',
    shippingAddress: '上海市浦东新区某某路456号',
    productName: '智能烤箱',
    productSpec: '30L容量 黑色',
    quantity: 1,
    unitPrice: 1999.00,
    totalAmount: 1999.00,
    status: 'shipping',
    paymentMethod: '支付宝',
    remark: '',
    createdAt: '2024-08-01 14:20:00'
  }
])

const isLoading = ref(false)
const selectedRows = ref<OrderItem[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 订单详情弹窗
const detailDialogVisible = ref(false)
const selectedOrder = ref<OrderItem | null>(null)

// 方法
const handleSearch = () => {
  console.log('搜索:', searchForm)
  isLoading.value = true
  setTimeout(() => isLoading.value = false, 500)
}

const resetSearch = () => {
  Object.assign(searchForm, {
    orderNo: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

const refreshData = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    ElMessage.success('数据已刷新')
  }, 800)
}

const exportData = () => {
  ElMessage.success('正在导出数据...')
}

const handleSelectionChange = (selection: OrderItem[]) => {
  selectedRows.value = selection
}

const viewOrder = (row: OrderItem) => {
  selectedOrder.value = row
  detailDialogVisible.value = true
}

const confirmPayment = (row: OrderItem) => {
  ElMessageBox.confirm('确定要确认该订单已付款吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'paid'
    ElMessage.success('订单状态已更新为已付款')
  })
}

const startShipping = (row: OrderItem) => {
  ElMessageBox.confirm('确定要开始配送该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'shipping'
    ElMessage.success('订单状态已更新为配送中')
  })
}

const completeOrder = (row: OrderItem) => {
  ElMessageBox.confirm('确定要完成该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'completed'
    ElMessage.success('订单已完成')
  })
}

const cancelOrder = (row: OrderItem) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'cancelled'
    ElMessage.success('订单已取消')
  })
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    shipping: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const formatDateTime = (dateStr: string) => {
  return dateStr
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  refreshData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  refreshData()
}

onMounted(() => {
  pagination.total = tableData.value.length
})
</script>

<style lang="scss" scoped>
.product-order-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  background-color: var(--el-bg-color-page); // 适配背景色

  // 头部卡片样式
  .header-card {
    border: none;
    background: linear-gradient(135deg, #fff 0%, #f9fafb 100%);
    transition: all 0.3s ease;
    
    :deep(.el-card__body) {
      padding: 20px 24px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-left {
        h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
        }
        
        p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 24px;
        
        .stat-item {
          text-align: right;
          
          .stat-value {
            font-size: 20px;
            font-weight: 700;
            color: #074E9C;
            margin-bottom: 4px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }
    }
    
    // 暗色模式适配
    &.header-card-dark {
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      
      .header-left {
        h3 { color: #f9fafb; }
        p { color: #9ca3af; }
      }
      
      .header-right {
        .stat-item {
          .stat-value { color: #60a5fa; }
          .stat-label { color: #9ca3af; }
        }
      }
    }
  }
  
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    
    .search-card {
      border: none;
      
      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 24px;
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
        display: inline-block;
        
        &.default { background-color: #9ca3af; }
        &.pending { background-color: #f59e0b; }
        &.paid { background-color: #3b82f6; }
        &.shipping { background-color: #074E9C; }
        &.completed { background-color: #10b981; }
        &.cancelled { background-color: #ef4444; }
      }
    }
    
    .table-card {
      flex: 1;
      border: none;
      display: flex;
      flex-direction: column;
      
      :deep(.el-card__body) {
        padding: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .table-header {
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        .table-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      .pagination-wrapper {
        padding: 16px 24px;
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
  }
  
  // 表格样式优化
  .order-info {
    .order-no {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }
    .order-meta {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      
      .separator {
        margin: 0 4px;
        color: var(--el-border-color);
      }
    }
  }
  
  .product-info {
    .product-name {
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }
    .product-spec {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .amount-info {
    .amount {
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    .payment {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .status-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 6px;
    }
    
    &.pending {
      background-color: rgba(245, 158, 11, 0.1);
      color: #d97706;
      .dot { background-color: #f59e0b; }
    }
    
    &.paid {
      background-color: rgba(59, 130, 246, 0.1);
      color: #2563eb;
      .dot { background-color: #3b82f6; }
    }
    
    &.shipping {
      background-color: rgba(7, 78, 156, 0.1);
      color: #074E9C;
      .dot { background-color: #074E9C; }
    }
    
    &.completed {
      background-color: rgba(16, 185, 129, 0.1);
      color: #059669;
      .dot { background-color: #10b981; }
    }
    
    &.cancelled {
      background-color: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      .dot { background-color: #ef4444; }
    }
  }
  
  // 下拉选项样式
  .option-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    
    &.warning { background-color: #f59e0b; }
    &.primary { background-color: #3b82f6; }
    &.info { background-color: #074E9C; }
    &.success { background-color: #10b981; }
    &.danger { background-color: #ef4444; }
  }
  
  .detail-section {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 12px;
      border-left: 3px solid var(--el-color-primary);
      padding-left: 10px;
    }
  }
}
</style>