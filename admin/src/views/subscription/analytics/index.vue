<template>
  <div class="subscription-analytics-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon class="title-icon"><DataAnalysis /></el-icon>
          数据分析
        </h1>
        <p class="page-subtitle">深入分析订阅数据，洞察用户行为趋势</p>
      </div>
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="large"
          @change="handleDateChange"
        />
        <el-button :icon="Refresh" size="large" circle @click="refreshData" />
      </div>
    </div>

    <!-- 快速统计卡片 -->
    <div class="quick-stats">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.growthRate }}%</div>
          <div class="stat-label">增长率</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            <span>较上月</span>
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            <span>+{{ stats.newActiveUsers }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><PieChart /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.conversionRate }}%</div>
          <div class="stat-label">转化率</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            <span>+2.1%</span>
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><Calendar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.avgDaily }}</div>
          <div class="stat-label">日均新增</div>
          <div class="stat-trend positive">
            <el-icon><ArrowUp /></el-icon>
            <span>稳定增长</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 订阅趋势图 -->
      <div class="chart-card large">
        <div class="chart-header">
          <h3>订阅趋势分析</h3>
          <div class="chart-controls">
            <el-radio-group v-model="trendPeriod" size="small" @change="updateTrendChart">
              <el-radio-button value="7d">近7天</el-radio-button>
              <el-radio-button value="30d">近30天</el-radio-button>
              <el-radio-button value="90d">近90天</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="trendChartRef" class="chart-container large"></div>
      </div>

      <!-- 来源分布饼图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>来源分布</h3>
          <el-tag size="small" type="info">{{ totalSubscriptions }}个订阅</el-tag>
        </div>
        <div ref="sourceChartRef" class="chart-container"></div>
      </div>

      <!-- 联系方式分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>联系方式分布</h3>
          <el-tag size="small" type="success">多渠道覆盖</el-tag>
        </div>
        <div ref="contactTypeChartRef" class="chart-container"></div>
      </div>

      <!-- 时段分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>订阅时段分析</h3>
          <el-tag size="small" type="warning">24小时分布</el-tag>
        </div>
        <div ref="hourlyChartRef" class="chart-container"></div>
      </div>

      <!-- 地域分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>地域分布</h3>
          <el-tag size="small" type="primary">IP统计</el-tag>
        </div>
        <div ref="regionChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 数据洞察 -->
    <div class="insights-panel">
      <div class="insights-header">
        <h3>
          <el-icon><Lightbulb /></el-icon>
          数据洞察
        </h3>
      </div>
      <div class="insights-grid">
        <div class="insight-card">
          <div class="insight-icon success">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="insight-content">
            <h4>增长趋势良好</h4>
            <p>过去30天订阅量增长{{ stats.growthRate }}%，超过行业平均水平</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="insight-content">
            <h4>最佳订阅时段</h4>
            <p>用户在{{ stats.peakHour }}点最活跃，建议在此时段推送内容</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon info">
            <el-icon><Location /></el-icon>
          </div>
          <div class="insight-content">
            <h4>主要用户群体</h4>
            <p>{{ stats.topRegion }}地区用户占比最高，达{{ stats.topRegionPercent }}%</p>
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-icon primary">
            <el-icon><Message /></el-icon>
          </div>
          <div class="insight-content">
            <h4>偏好联系方式</h4>
            <p>{{ stats.preferredContact }}是用户首选，占比{{ stats.preferredContactPercent }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  DataAnalysis, Refresh, TrendCharts, ArrowUp, User, PieChart, Calendar,
  Lightbulb, Clock, Location, Message
} from '@element-plus/icons-vue'
import { useSettingStore } from '@/store/modules/setting'
import { SubscriptionService } from '@/api/subscriptionApi'
import * as echarts from 'echarts'

// 响应式数据
const loading = ref(false)
const dateRange = ref<[Date, Date] | null>(null)
const trendPeriod = ref('30d')

// 图表引用
const trendChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
const contactTypeChartRef = ref<HTMLElement>()
const hourlyChartRef = ref<HTMLElement>()
const regionChartRef = ref<HTMLElement>()

// 图表实例
let trendChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null
let contactTypeChart: echarts.ECharts | null = null
let hourlyChart: echarts.ECharts | null = null
let regionChart: echarts.ECharts | null = null

// 统计数据
const stats = reactive({
  growthRate: 15.8,
  activeUsers: 1234,
  newActiveUsers: 156,
  conversionRate: 85.2,
  avgDaily: 42,
  peakHour: '14:00-16:00',
  topRegion: '北京',
  topRegionPercent: 28.5,
  preferredContact: '邮箱',
  preferredContactPercent: 65.3
})

// 计算属性
const settingStore = useSettingStore()
const isDarkMode = computed(() => settingStore.isDark)
const totalSubscriptions = computed(() => stats.activeUsers + 500)

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 29 + i)
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })

  const subscriptions = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20)
  const unsubscriptions = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 2)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新增订阅', '取消订阅', '净增长']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增订阅',
        type: 'line',
        smooth: true,
        data: subscriptions,
        itemStyle: { color: '#67C23A' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        }
      },
      {
        name: '取消订阅',
        type: 'line',
        smooth: true,
        data: unsubscriptions,
        itemStyle: { color: '#F56C6C' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      },
      {
        name: '净增长',
        type: 'bar',
        data: subscriptions.map((sub, i) => sub - unsubscriptions[i]),
        itemStyle: { color: '#409EFF' }
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化来源饼图
const initSourceChart = () => {
  if (!sourceChartRef.value) return

  sourceChart = echarts.init(sourceChartRef.value)
  
  const data = [
    { value: 450, name: '网站底部' },
    { value: 320, name: '联系表单' },
    { value: 280, name: '手动添加' }
  ]

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '订阅来源',
        type: 'pie',
        radius: ['40%', '70%'],
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        color: ['#409EFF', '#67C23A', '#E6A23C']
      }
    ]
  }

  sourceChart.setOption(option)
}

// 初始化联系方式图表
const initContactTypeChart = () => {
  if (!contactTypeChartRef.value) return

  contactTypeChart = echarts.init(contactTypeChartRef.value)
  
  const data = [
    { value: 680, name: '邮箱' },
    { value: 250, name: '微信' },
    { value: 120, name: '电话' }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '联系方式',
        type: 'pie',
        radius: '70%',
        data,
        color: ['#409EFF', '#67C23A', '#E6A23C']
      }
    ]
  }

  contactTypeChart.setOption(option)
}

// 初始化时段分析图表
const initHourlyChart = () => {
  if (!hourlyChartRef.value) return

  hourlyChart = echarts.init(hourlyChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 30) + 5)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: hours
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#67C23A' }
          ])
        }
      }
    ]
  }

  hourlyChart.setOption(option)
}

// 初始化地域分析图表
const initRegionChart = () => {
  if (!regionChartRef.value) return

  regionChart = echarts.init(regionChartRef.value)
  
  const data = [
    { name: '北京', value: 285 },
    { name: '上海', value: 234 },
    { name: '广州', value: 198 },
    { name: '深圳', value: 176 },
    { name: '杭州', value: 145 }
  ]

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '地域分布',
        type: 'pie',
        radius: ['30%', '70%'],
        roseType: 'area',
        data,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      }
    ]
  }

  regionChart.setOption(option)
}

// 刷新数据
const refreshData = async () => {
  try {
    loading.value = true
    // 这里可以调用实际的API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 日期范围变化
const handleDateChange = () => {
  // 根据日期范围更新图表
  updateAllCharts()
}

// 更新趋势图
const updateTrendChart = () => {
  // 根据选择的时间周期更新趋势图
  initTrendChart()
}

// 更新所有图表
const updateAllCharts = () => {
  nextTick(() => {
    initTrendChart()
    initSourceChart()
    initContactTypeChart()
    initHourlyChart()
    initRegionChart()
  })
}

// 窗口大小变化处理
const handleResize = () => {
  trendChart?.resize()
  sourceChart?.resize()
  contactTypeChart?.resize()
  hourlyChart?.resize()
  regionChart?.resize()
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateAllCharts()
  })
  
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  sourceChart?.dispose()
  contactTypeChart?.dispose()
  hourlyChart?.dispose()
  regionChart?.dispose()
})
</script>

<style scoped lang="scss">
.subscription-analytics-page {
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
      align-items: center;
    }
  }

  // 快速统计
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .stat-card {
      background: var(--el-bg-color);
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

      &.primary { border-left-color: #409eff; }
      &.success { border-left-color: #67c23a; }
      &.warning { border-left-color: #e6a23c; }
      &.info { border-left-color: #909399; }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--el-text-color-primary);
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin-bottom: 8px;
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #67c23a;

          &.positive { color: #67c23a; }
          &.negative { color: #f56c6c; }
        }
      }
    }
  }

  // 图表网格
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .chart-card {
      background: var(--el-bg-color);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      &.large {
        grid-column: 1 / -1;
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .chart-controls {
          display: flex;
          gap: 8px;
        }
      }

      .chart-container {
        width: 100%;
        height: 300px;

        &.large {
          height: 400px;
        }
      }
    }
  }

  // 数据洞察
  .insights-panel {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    .insights-header {
      margin-bottom: 20px;

      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;

      .insight-card {
        display: flex;
        gap: 16px;
        padding: 16px;
        border-radius: 8px;
        background: var(--el-fill-color-lighter);
        transition: all 0.3s;

        &:hover {
          background: var(--el-fill-color-light);
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 20px;

          &.success { background: #67c23a; }
          &.warning { background: #e6a23c; }
          &.info { background: #909399; }
          &.primary { background: #409eff; }
        }

        .insight-content {
          flex: 1;

          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          p {
            margin: 0;
            font-size: 13px;
            color: var(--el-text-color-regular);
            line-height: 1.5;
          }
        }
      }
    }
  }

  // 深色模式适配
  &.dark-mode {
    .stat-card,
    .chart-card,
    .insights-panel {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
