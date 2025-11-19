<template>
  <div class="subscription-charts">
    <!-- 图表标题 -->
    <div class="charts-header">
      <h3 class="charts-title">
        <el-icon><TrendCharts /></el-icon>
        数据分析
      </h3>
      <el-button-group>
        <el-button :type="chartPeriod === 7 ? 'primary' : ''" size="small" @click="changePeriod(7)">
          近7天
        </el-button>
        <el-button :type="chartPeriod === 30 ? 'primary' : ''" size="small" @click="changePeriod(30)">
          近30天
        </el-button>
        <el-button :type="chartPeriod === 90 ? 'primary' : ''" size="small" @click="changePeriod(90)">
          近90天
        </el-button>
      </el-button-group>
    </div>

    <div class="charts-grid">
      <!-- 订阅趋势图 -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>订阅趋势</h4>
          <el-tag size="small" type="success">{{ stats.trend?.length || 0 }}天数据</el-tag>
        </div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>

      <!-- 来源分布饼图 -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>来源分布</h4>
          <el-tag size="small" type="info">{{ totalBySource }}个订阅</el-tag>
        </div>
        <div ref="sourceChartRef" class="chart-container"></div>
      </div>

      <!-- 联系方式分布饼图 -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>联系方式分布</h4>
          <el-tag size="small" type="warning">{{ totalByContactType }}个订阅</el-tag>
        </div>
        <div ref="contactTypeChartRef" class="chart-container"></div>
      </div>

      <!-- 转化率分析 -->
      <div class="chart-card">
        <div class="chart-card-header">
          <h4>转化率分析</h4>
          <el-tag size="small" type="primary">{{ conversionRate }}%</el-tag>
        </div>
        <div class="conversion-stats">
          <div class="stat-item">
            <div class="stat-label">总订阅数</div>
            <div class="stat-value">{{ stats.total || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">活跃订阅</div>
            <div class="stat-value success">{{ stats.subscribed || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">已取消</div>
            <div class="stat-value danger">{{ stats.unsubscribed || 0 }}</div>
          </div>
          <div class="stat-item full-width">
            <el-progress
              :percentage="conversionRate"
              :color="getProgressColor(conversionRate)"
              :stroke-width="20"
              :text-inside="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface Props {
  stats: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'periodChange', period: number): void
}>()

const chartPeriod = ref(7)
const trendChartRef = ref<HTMLElement>()
const sourceChartRef = ref<HTMLElement>()
const contactTypeChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let sourceChart: echarts.ECharts | null = null
let contactTypeChart: echarts.ECharts | null = null

// 计算总数
const totalBySource = computed(() => {
  const source = props.stats?.bySource || {}
  return Object.values(source).reduce((sum: number, val: any) => sum + (val || 0), 0)
})

const totalByContactType = computed(() => {
  const contactType = props.stats?.byContactType || {}
  return Object.values(contactType).reduce((sum: number, val: any) => sum + (val || 0), 0)
})

const conversionRate = computed(() => {
  const total = props.stats?.total || 0
  const subscribed = props.stats?.subscribed || 0
  return total > 0 ? Math.round((subscribed / total) * 100) : 0
})

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  
  const dates = props.stats?.trend?.map((item: any) => item.date) || []
  const newSubs = props.stats?.trend?.map((item: any) => item.newSubscriptions) || []
  const unsubs = props.stats?.trend?.map((item: any) => item.unsubscriptions) || []

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['新增订阅', '取消订阅']
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
        data: newSubs,
        itemStyle: {
          color: '#67C23A'
        },
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
        data: unsubs,
        itemStyle: {
          color: '#F56C6C'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }

  trendChart.setOption(option)
}

// 初始化来源饼图
const initSourceChart = () => {
  if (!sourceChartRef.value) return

  sourceChart = echarts.init(sourceChartRef.value)
  
  const sourceData = [
    { value: props.stats?.bySource?.website_footer || 0, name: '网站底部' },
    { value: props.stats?.bySource?.contact_form || 0, name: '联系表单' },
    { value: props.stats?.bySource?.manual || 0, name: '手动添加' }
  ]

  const option: EChartsOption = {
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
        name: '来源',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: sourceData,
        color: ['#409EFF', '#67C23A', '#E6A23C']
      }
    ]
  }

  sourceChart.setOption(option)
}

// 初始化联系方式饼图
const initContactTypeChart = () => {
  if (!contactTypeChartRef.value) return

  contactTypeChart = echarts.init(contactTypeChartRef.value)
  
  const contactTypeData = [
    { value: props.stats?.byContactType?.email || 0, name: '邮箱' },
    { value: props.stats?.byContactType?.wechat || 0, name: '微信' },
    { value: props.stats?.byContactType?.phone || 0, name: '电话' }
  ]

  const option: EChartsOption = {
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
        name: '联系方式',
        type: 'pie',
        radius: '70%',
        data: contactTypeData,
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

  contactTypeChart.setOption(option)
}

// 切换周期
const changePeriod = (period: number) => {
  chartPeriod.value = period
  emit('periodChange', period)
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67C23A'
  if (percentage >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 监听数据变化
watch(() => props.stats, () => {
  nextTick(() => {
    initTrendChart()
    initSourceChart()
    initContactTypeChart()
  })
}, { deep: true })

// 窗口大小变化时重绘图表
const handleResize = () => {
  trendChart?.resize()
  sourceChart?.resize()
  contactTypeChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initTrendChart()
    initSourceChart()
    initContactTypeChart()
  })
  
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  sourceChart?.dispose()
  contactTypeChart?.dispose()
})
</script>

<style scoped lang="scss">
.subscription-charts {
  margin-bottom: 20px;
  
  .charts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .charts-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
  
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    
    .chart-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
      
      .chart-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }
      
      .chart-container {
        width: 100%;
        height: 300px;
      }
      
      .conversion-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        
        .stat-item {
          text-align: center;
          
          &.full-width {
            grid-column: 1 / -1;
            margin-top: 10px;
          }
          
          .stat-label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 8px;
          }
          
          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            
            &.success {
              color: #67C23A;
            }
            
            &.danger {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
