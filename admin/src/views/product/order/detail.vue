<template>
  <div class="order-detail-page">
    <ElCard class="header-card" shadow="never">
      <div class="header-content">
        <div class="header-left">
          <ElButton :icon="ArrowLeft" @click="goBack">返回</ElButton>
          <div class="title-group">
            <h3>订单详情</h3>
            <p>订单号：{{ orderData?.orderNumber || '-' }}</p>
          </div>
        </div>
        <div class="header-right">
          <ElTag :type="getStatusType(orderData?.status)">
            {{ getStatusText(orderData?.status) }}
          </ElTag>
          <ElButton :icon="Printer" @click="printOrder">打印</ElButton>
          <ElButton type="primary" :icon="Edit" @click="editOrder">编辑</ElButton>
        </div>
      </div>
    </ElCard>

    <ElRow :gutter="16" v-loading="loading">
      <!-- 订单信息 -->
      <ElCol :span="16">
        <ElCard class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>订单信息</span>
            </div>
          </template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="订单号">
              {{ orderData?.orderNumber }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="订单状态">
              <ElTag :type="getStatusType(orderData?.status)">
                {{ getStatusText(orderData?.status) }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="客户姓名">
              {{ orderData?.customerName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="联系电话">
              {{ orderData?.customerPhone }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="客户邮箱" :span="2">
              {{ orderData?.customerEmail || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="收货地址" :span="2">
              {{ orderData?.shippingAddress || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="订单备注" :span="2">
              {{ orderData?.notes || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="创建时间">
              {{ formatDate(orderData?.createdAt) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="更新时间">
              {{ formatDate(orderData?.updatedAt) }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>

        <!-- 订单商品 -->
        <ElCard class="info-card" shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>订单商品</span>
            </div>
          </template>
          <ElTable :data="orderData?.items || []" border>
            <ElTableColumn label="产品名称" prop="productName" min-width="200" />
            <ElTableColumn label="产品编号" prop="productSku" width="150" />
            <ElTableColumn label="单价" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.price?.toFixed(2) }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="数量" prop="quantity" width="100" align="center" />
            <ElTableColumn label="小计" width="120" align="right">
              <template #default="{ row }">
                ¥{{ (row.price * row.quantity).toFixed(2) }}
              </template>
            </ElTableColumn>
          </ElTable>
          <div class="total-section">
            <div class="total-row">
              <span>商品总额：</span>
              <span class="amount">¥{{ orderData?.totalAmount?.toFixed(2) }}</span>
            </div>
          </div>
        </ElCard>
      </ElCol>

      <!-- 操作记录 -->
      <ElCol :span="8">
        <ElCard class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>状态变更</span>
            </div>
          </template>
          <ElTimeline>
            <ElTimelineItem
              v-for="(log, index) in statusLogs"
              :key="index"
              :timestamp="formatDate(log.createdAt)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="status-change">
                  <ElTag :type="getStatusType(log.status)" size="small">
                    {{ getStatusText(log.status) }}
                  </ElTag>
                </div>
                <div class="log-note" v-if="log.note">{{ log.note }}</div>
              </div>
            </ElTimelineItem>
          </ElTimeline>
        </ElCard>

        <!-- 快速操作 -->
        <ElCard class="info-card" shadow="never" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <ElButton
              v-for="action in quickActions"
              :key="action.status"
              :type="action.type"
              :icon="action.icon"
              @click="updateStatus(action.status)"
              :disabled="orderData?.status === action.status"
              block
            >
              {{ action.label }}
            </ElButton>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 编辑对话框 -->
    <ElDialog v-model="editVisible" title="编辑订单" width="600px">
      <ElForm :model="editForm" label-width="100px">
        <ElFormItem label="订单状态">
          <ElSelect v-model="editForm.status" placeholder="请选择状态">
            <ElOption
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="editForm.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="saveEdit" :loading="saving">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Printer, Edit, Check, Close, Clock } from '@element-plus/icons-vue'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => route.query.id as string)
const loading = ref(false)
const orderData = ref<any>(null)
const statusLogs = ref<any[]>([])
const editVisible = ref(false)
const saving = ref(false)
const editForm = ref({
  status: '',
  notes: ''
})

// 状态选项
const statusOptions = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '处理中', value: 'processing' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' }
]

// 快速操作
const quickActions = [
  { label: '确认订单', status: 'confirmed', type: 'success' as const, icon: Check },
  { label: '开始处理', status: 'processing', type: 'primary' as const, icon: Clock },
  { label: '标记发货', status: 'shipped', type: 'warning' as const, icon: Check },
  { label: '完成订单', status: 'completed', type: 'success' as const, icon: Check },
  { label: '取消订单', status: 'cancelled', type: 'danger' as const, icon: Close }
]

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'info',
    confirmed: 'success',
    processing: 'primary',
    shipped: 'warning',
    completed: 'success',
    cancelled: 'danger',
    refunded: 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    processing: '处理中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return textMap[status] || status
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return '-'
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch {
    return date
  }
}

// 加载订单详情
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const res = await request<any>({
      url: `/orders/${orderId.value}`,
      method: 'get'
    })
    // 兼容两种格式
    const responseData = res?.data || res
    if (responseData) {
      orderData.value = responseData
      // 模拟状态日志
      statusLogs.value = [
        {
          status: responseData.status,
          createdAt: responseData.updatedAt,
          note: '当前状态'
        },
        {
          status: 'pending',
          createdAt: responseData.createdAt,
          note: '订单创建'
        }
      ]
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

// 更新状态
const updateStatus = async (status: string) => {
  try {
    await request({
      url: `/orders/${orderId.value}/status`,
      method: 'put',
      data: { status }
    })
    ElMessage.success('状态更新成功')
    loadOrderDetail()
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败')
  }
}

// 编辑订单
const editOrder = () => {
  editForm.value = {
    status: orderData.value?.status || '',
    notes: orderData.value?.notes || ''
  }
  editVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  saving.value = true
  try {
    await request({
      url: `/orders/${orderId.value}`,
      method: 'put',
      data: editForm.value
    })
    ElMessage.success('保存成功')
    editVisible.value = false
    loadOrderDetail()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 打印订单
const printOrder = () => {
  window.print()
}

// 返回
const goBack = () => {
  router.back()
}

onMounted(() => {
  if (orderId.value) {
    loadOrderDetail()
  } else {
    ElMessage.error('缺少订单ID')
    router.back()
  }
})
</script>

<style scoped lang="scss">
.order-detail-page {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100%;
}

.header-card {
  margin-bottom: 16px;
  
  :deep(.el-card__body) {
    padding: 16px 24px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-group {
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.info-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.total-section {
  margin-top: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: right;
}

.total-row {
  font-size: 16px;
  font-weight: 600;
  color: #303133;

  .amount {
    color: #f56c6c;
    font-size: 20px;
    margin-left: 8px;
  }
}

.timeline-content {
  .status-change {
    margin-bottom: 8px;
  }

  .log-note {
    font-size: 13px;
    color: #909399;
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media print {
  .header-right,
  .quick-actions {
    display: none;
  }
}
</style>
