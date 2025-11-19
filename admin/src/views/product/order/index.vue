<!-- 产品订单管理 -->
<template>
  <div class="product-order-page art-full-height">
    <!-- 搜索栏 -->
    <ElCard class="search-card" shadow="never">
      <ElForm :model="searchForm" inline>
        <ElFormItem label="订单号">
          <ElInput
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </ElFormItem>
        <ElFormItem label="订单状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <ElOption label="待付款" value="pending" />
            <ElOption label="已付款" value="paid" />
            <ElOption label="配送中" value="shipping" />
            <ElOption label="已完成" value="completed" />
            <ElOption label="已取消" value="cancelled" />
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
          />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" @click="handleSearch">
            <ElIcon><Search /></ElIcon>
            查询
          </ElButton>
          <ElButton @click="resetSearch">
            <ElIcon><RefreshLeft /></ElIcon>
            重置
          </ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <div class="table-header">
        <div class="header-left">
          <ElButton @click="exportData">
            <ElIcon><Download /></ElIcon>
            导出数据
          </ElButton>
        </div>
        <div class="header-right">
          <ElButton @click="refreshData" :loading="isLoading">
            <ElIcon><Refresh /></ElIcon>
            刷新
          </ElButton>
        </div>
      </div>

      <!-- 表格 -->
      <ElTable
        :data="tableData"
        :loading="isLoading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn prop="orderNo" label="订单号" width="160" />
        <ElTableColumn prop="customerName" label="客户姓名" width="120" />
        <ElTableColumn prop="productName" label="产品名称" min-width="150" />
        <ElTableColumn prop="quantity" label="数量" width="80" />
        <ElTableColumn prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount?.toFixed(2) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="下单时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" @click="viewOrder(row)">
              查看详情
            </ElButton>
            <ElButton v-if="row.status === 'pending'" link type="success" @click="confirmPayment(row)">
              确认付款
            </ElButton>
            <ElButton v-if="row.status === 'paid'" link type="warning" @click="startShipping(row)">
              开始配送
            </ElButton>
            <ElButton v-if="row.status === 'shipping'" link type="success" @click="completeOrder(row)">
              完成订单
            </ElButton>
            <ElButton v-if="['pending', 'paid'].includes(row.status)" link type="danger" @click="cancelOrder(row)">
              取消订单
            </ElButton>
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

    <!-- 订单详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="800px"
    >
      <div v-if="selectedOrder" class="order-detail">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="订单号">{{ selectedOrder.orderNo }}</ElDescriptionsItem>
          <ElDescriptionsItem label="订单状态">
            <ElTag :type="getStatusTagType(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="客户姓名">{{ selectedOrder.customerName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="联系电话">{{ selectedOrder.customerPhone }}</ElDescriptionsItem>
          <ElDescriptionsItem label="收货地址" :span="2">{{ selectedOrder.shippingAddress }}</ElDescriptionsItem>
          <ElDescriptionsItem label="产品名称">{{ selectedOrder.productName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="产品规格">{{ selectedOrder.productSpec }}</ElDescriptionsItem>
          <ElDescriptionsItem label="购买数量">{{ selectedOrder.quantity }}</ElDescriptionsItem>
          <ElDescriptionsItem label="单价">¥{{ selectedOrder.unitPrice?.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="订单金额">¥{{ selectedOrder.totalAmount?.toFixed(2) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="支付方式">{{ selectedOrder.paymentMethod }}</ElDescriptionsItem>
          <ElDescriptionsItem label="下单时间">{{ formatDateTime(selectedOrder.createdAt) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="备注" :span="2">{{ selectedOrder.remark || '无' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElCard, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElIcon,
  ElTable, ElTableColumn, ElTag, ElPagination, ElDialog, ElDatePicker,
  ElDescriptions, ElDescriptionsItem, ElMessage, ElMessageBox
} from 'element-plus'
import {
  Search, RefreshLeft, Download, Refresh
} from '@element-plus/icons-vue'

defineOptions({ name: 'ProductOrder' })

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
    productName: '智能电饭煲',
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
  // TODO: 实现搜索逻辑
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
  // TODO: 刷新数据
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const exportData = () => {
  ElMessage.success('导出功能开发中...')
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

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    paid: 'primary',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
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
  return dateStr // 简单返回原始日期字符串
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
  .search-card {
    margin-bottom: 16px;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .header-left {
      .el-button + .el-button {
        margin-left: 12px;
      }
    }
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .order-detail {
    .el-descriptions {
      margin-top: 20px;
    }
  }
}
</style> 