<template>
  <n-card :bordered="false" class="dashboard-card-modern">
    <div class="dashboard-header-modern">
      <div class="dashboard-title-modern">销售看板</div>
      <n-button type="primary" class="dashboard-refresh-btn" @click="handleRefresh" :loading="refreshing">
        <template #icon>
          <i class="iconfont icon-shuaxin" style="font-size:18px;"></i>
        </template>
        刷新
      </n-button>
    </div>
    
    <!-- 基础统计卡片 -->
    <n-grid x-gap="10" :cols="4">
    <n-gi>
        <n-card style="height: 130px; border-radius: 20px; margin-bottom: 5px;">
        <div>商品总数</div>
          <div class="stat">{{ stats.product_total }}</div>
      </n-card>
    </n-gi>
    <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
        <div>订单总数</div>
          <div class="stat">{{ stats.order_total }}</div>
      </n-card>
    </n-gi>
    <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
        <div>用户总数</div>
          <div class="stat">{{ stats.user_total }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
          <div>今日新增用户</div>
          <div class="stat stat-green">{{ stats.today_new_user }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
          <div>今日新增订单</div>
          <div class="stat stat-blue">{{ stats.today_new_order }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
          <div>今日销售额</div>
          <div class="stat stat-orange">￥{{ stats.today_sales }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
          <div>低库存商品数</div>
          <div class="stat stat-red">{{ stats.low_stock_count }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 130px; border-radius: 20px;">
          <div>待发货订单数</div>
          <div class="stat stat-yellow">{{ stats.pending_order_count }}</div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 本月统计卡片 -->
    <n-grid x-gap="10" :cols="4" style="margin-top: 15px;">
      <n-gi>
        <n-card style="height: 100px; border-radius: 20px;">
          <div>本月销售额</div>
          <div class="stat stat-orange">￥{{ monthlyStats.monthly_sales }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 100px; border-radius: 20px;">
          <div>本月订单数</div>
          <div class="stat stat-blue">{{ monthlyStats.monthly_orders }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 100px; border-radius: 20px;">
          <div>本月新增用户</div>
          <div class="stat stat-green">{{ monthlyStats.monthly_users }}</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card style="height: 100px; border-radius: 20px;">
          <div>本月新增商品</div>
          <div class="stat">{{ monthlyStats.monthly_products }}</div>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 图表区域 -->
    <n-grid x-gap="16" y-gap="16" :cols="2" style="margin-top:15px;">
      <n-gi>
        <n-card title="订单/销售额趋势" style="height:410px;overflow:auto;">
          <template #header-extra>
            <n-select 
              v-model:value="selectedTimeRange" 
              :options="timeRangeOptions" 
              size="small"
              style="width: 120px;"
              @update:value="handleTimeRangeChange"
            />
          </template>
          <div id="order-sales-chart" style="height:320px;width:100%;"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="商品分类分布" style="height:410px;overflow:auto;">
          <div id="category-pie-chart" style="height:320px;width:100%;"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="用户增长趋势" style="height:410px;overflow:auto;">
          <template #header-extra>
            <n-select 
              v-model:value="selectedUserTimeRange" 
              :options="timeRangeOptions" 
              size="small"
              style="width: 120px;"
              @update:value="handleUserTimeRangeChange"
            />
          </template>
          <div id="user-growth-chart" style="height:320px;width:100%;"></div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="快捷入口" style="height:400px;overflow:auto; border-radius: 20px;">
          <n-space vertical>
            <n-button class="quick-btn" @click="$router.push('/product')">
              <template #icon><i class="iconfont icon-shangpin" /></template>
              商品管理
            </n-button>
            <n-button class="quick-btn" @click="$router.push('/order')">
              <template #icon><i class="iconfont icon-dingdan" /></template>
              订单管理
            </n-button>
            <n-button class="quick-btn" @click="$router.push('/user')">
              <template #icon><i class="iconfont icon-yonghu" /></template>
              用户管理
            </n-button>
            <n-button class="quick-btn" type="success" @click="$router.push('/product?add=1')">
              <template #icon><i class="iconfont icon-tianjia" /></template>
              新增商品
            </n-button>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <!-- 数据列表区域 -->
    <n-grid x-gap="16" y-gap="16" :cols="3" style="margin-top:32px;">
      <n-gi>
        <n-card title="热销商品榜单" style="height:400px;overflow:auto;">
          <n-table :bordered="false" size="small" style="width:100%;">
            <thead>
              <tr>
                <th style="width:48px;">排名</th>
                <th>商品名称</th>
                <th>销量</th>
                <th>价格</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in topProducts" :key="item.id">
                <td style="color:#fa541c;font-weight:bold;">{{ idx+1 }}</td>
                <td style="font-weight:bold;">
                  <a style="color:#2080f0;cursor:pointer;" @click.stop="router.push({ path: '/product', query: { id: item.id } })">{{ item.name }}</a>
                </td>
                <td style="color:#fa541c;">{{ item.sales }}</td>
                <td style="color:#18a058;">￥{{ item.price }}</td>
              </tr>
            </tbody>
          </n-table>
          <div v-if="!topProducts.length" style="color:#888;">暂无热销商品</div>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card title="最新订单" style="height:400px;overflow:auto;">
          <n-table :bordered="false" size="small" style="width:100%;">
            <thead>
              <tr>
                <th>订单号</th>
                <th>金额</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recentOrders" :key="item.id">
                <td>
                  <a style="color:#2080f0;cursor:pointer;" @click.stop="router.push({ path: '/order', query: { order_number: item.order_number } })">{{ item.order_number }}</a>
                </td>
                <td style="color:#18a058;">￥{{ formatAmount(item.total_amount) }}</td>
                <td style="color:#faad14;">{{ statusMap[item.status] || item.status }}</td>
              </tr>
            </tbody>
          </n-table>
          <div v-if="!recentOrders.length" style="color:#888;">暂无新订单</div>
      </n-card>
    </n-gi>
    <n-gi>
        <n-card title="低库存预警" style="height:400px;overflow:auto;">
          <n-table :bordered="false" size="small" style="width:100%;">
            <thead>
              <tr>
                <th>商品名称</th>
                <th>库存</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockList" :key="item.id">
                <td>{{ item.name }}</td>
                <td style="color:#d03050;font-weight:bold;">{{ item.stock }}</td>
              </tr>
            </tbody>
          </n-table>
          <div v-if="!lowStockList.length" style="color:#888;">暂无低库存商品</div>
      </n-card>
    </n-gi>
  </n-grid>
  </n-card>
</template>

<script setup name="Dashboard">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import * as echarts from 'echarts'
import { useMessage, useLoadingBar, useDialog } from 'naive-ui'

const router = useRouter()

// 统计数据
const stats = ref({
  product_total: 0,
  order_total: 0,
  user_total: 0,
  today_new_user: 0,
  today_new_order: 0,
  today_sales: 0,
  low_stock_count: 0,
  pending_order_count: 0
})

// 本月统计
const monthlyStats = ref({
  monthly_sales: 0,
  monthly_orders: 0,
  monthly_users: 0,
  monthly_products: 0
})

// 图表数据
const salesTrend = ref({ dates: [], sales: [], orders: [] })
const categoryDist = ref([])
const userGrowth = ref({ dates: [], users: [] })

// 列表数据
const topProducts = ref([])
const recentOrders = ref([])
const lowStockList = ref([])

const statusMap = {
  pending: '待确认',
  confirmed: '已确认',
  shipped: '已发货',
  completed: '已完成',
  cancelled: '已取消'
}

// 时间范围选项
const timeRangeOptions = [
  { label: '近7天', value: 7 },
  { label: '近30天', value: 30 },
  { label: '近90天', value: 90 },
  { label: '近1年', value: 365 }
]

// 当前选中的时间范围
const selectedTimeRange = ref(7)

// 当前选中的用户增长趋势时间范围
const selectedUserTimeRange = ref(7)

// 获取基础统计数据
async function fetchStats() {
  try {
    const res = await api.get('/admin/dashboard/stats')
    if (res && res.message === 'ok') {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取本月统计数据
async function fetchMonthlyStats() {
  try {
    const res = await api.get('/admin/dashboard/monthly-stats')
    if (res && res.message === 'ok') {
      monthlyStats.value = res.data
    }
  } catch (error) {
    console.error('获取本月统计数据失败:', error)
  }
}

// 获取销售趋势
async function fetchSalesTrend() {
  try {
    const res = await api.get('/admin/dashboard/sales-trend', { 
      params: { days: selectedTimeRange.value } 
    })
    if (res && res.message === 'ok') {
      salesTrend.value = res.data
      renderOrderSalesChart()
    }
  } catch (error) {
    console.error('获取销售趋势失败:', error)
  }
}

// 获取分类分布
async function fetchCategoryDist() {
  try {
    const res = await api.get('/admin/dashboard/category-distribution')
    if (res && res.message === 'ok') {
      categoryDist.value = res.data
      renderCategoryPieChart()
    }
  } catch (error) {
    console.error('获取分类分布失败:', error)
  }
}

// 获取用户增长趋势
async function fetchUserGrowth() {
  try {
    const res = await api.get('/admin/dashboard/user-growth', { 
      params: { days: selectedUserTimeRange.value } 
    })
    if (res && res.message === 'ok') {
      userGrowth.value = res.data
      renderUserGrowthChart()
    }
  } catch (error) {
    console.error('获取用户增长趋势失败:', error)
  }
}

// 获取热销商品
async function fetchTopProducts() {
  try {
    const res = await api.get('/admin/dashboard/top-products')
    if (res && res.message === 'ok') {
      topProducts.value = res.data
    }
  } catch (error) {
    console.error('获取热销商品失败:', error)
  }
}

// 获取最新订单
async function fetchRecentOrders() {
  try {
    const res = await api.get('/admin/dashboard/recent-orders')
    if (res && res.message === 'ok') {
      recentOrders.value = res.data
    }
  } catch (error) {
    console.error('获取最新订单失败:', error)
  }
}

// 获取低库存商品
async function fetchLowStockProducts() {
  try {
    const res = await api.get('/admin/products/low-stock')
    if (res && res.message === 'ok') {
      lowStockList.value = res.data.items || []
    }
  } catch (error) {
    console.error('获取低库存商品失败:', error)
  }
}

// 渲染订单销售图表
function renderOrderSalesChart() {
  nextTick(() => {
    const dom = document.getElementById('order-sales-chart')
    if (!dom) return
    
    if (echarts.getInstanceByDom(dom)) {
      echarts.dispose(dom)
    }
    
    const chart = echarts.init(dom)
    
    // 根据时间范围调整图表配置
    const isLongPeriod = selectedTimeRange.value > 30
    const xAxisConfig = {
      type: 'category', 
      data: salesTrend.value.dates,
      axisLabel: { 
        rotate: isLongPeriod ? 45 : 0,
        interval: isLongPeriod ? 'auto' : 0
      }
    }
    
    chart.setOption({
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: { 
        data: ['订单数', '销售额'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: isLongPeriod ? '15%' : '3%',
        containLabel: true
      },
      xAxis: xAxisConfig,
      yAxis: [
        { 
          type: 'value',
          name: '订单数',
          position: 'left'
        },
        { 
          type: 'value',
          name: '销售额',
          position: 'right',
          axisLabel: { formatter: '￥{value}' }
        }
      ],
      series: [
        { 
          name: '订单数', 
          type: 'line', 
          data: salesTrend.value.orders,
          smooth: true,
          itemStyle: { color: '#2080f0' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(32,128,240,0.3)' },
                { offset: 1, color: 'rgba(32,128,240,0.1)' }
              ]
            }
          }
        },
        { 
          name: '销售额', 
          type: 'line', 
          data: salesTrend.value.sales,
          yAxisIndex: 1,
          smooth: true,
          itemStyle: { color: '#fa8c16' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(250,140,22,0.3)' },
                { offset: 1, color: 'rgba(250,140,22,0.1)' }
              ]
            }
          }
        }
      ]
    })
  })
}

// 渲染分类饼图
function renderCategoryPieChart() {
  nextTick(() => {
    const dom = document.getElementById('category-pie-chart')
    if (!dom) return
    
    if (echarts.getInstanceByDom(dom)) {
      echarts.dispose(dom)
    }
    
    const chart = echarts.init(dom)
    chart.setOption({
      tooltip: { 
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: { 
        orient: 'vertical',
        left: 'left',
        top: 'middle'
      },
      series: [{
        name: '商品分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { 
          borderRadius: 10, 
          borderColor: '#fff', 
          borderWidth: 2 
        },
        label: { 
          show: false, 
          position: 'center' 
        },
        emphasis: { 
          label: { 
            show: true, 
            fontSize: 18, 
            fontWeight: 'bold' 
          } 
        },
        labelLine: { show: false },
        data: categoryDist.value
      }]
    })
  })
}

// 渲染用户增长图表
function renderUserGrowthChart() {
  nextTick(() => {
    const dom = document.getElementById('user-growth-chart')
    if (!dom) return
    
    if (echarts.getInstanceByDom(dom)) {
      echarts.dispose(dom)
    }
    
    const chart = echarts.init(dom)
    
    // 根据时间范围调整图表配置
    const isLongPeriod = selectedUserTimeRange.value > 30
    const xAxisConfig = {
      type: 'category', 
      data: userGrowth.value.dates,
      axisLabel: { 
        rotate: isLongPeriod ? 45 : 0,
        interval: isLongPeriod ? 'auto' : 0
      }
    }
    
    chart.setOption({
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: isLongPeriod ? '15%' : '3%',
        containLabel: true
      },
      xAxis: xAxisConfig,
      yAxis: { type: 'value' },
      series: [{ 
        name: '新增用户', 
        type: 'bar', 
        data: userGrowth.value.users,
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#18a058' },
              { offset: 1, color: '#36ad6a' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#42d392' },
                { offset: 1, color: '#18a058' }
              ]
            }
          }
        }
      }]
    })
  })
}

const refreshing = ref(false)
const message = useMessage()
const loadingBar = useLoadingBar()
const dialog = useDialog()

function handleRefresh() {
  dialog.warning({
    title: '确认刷新',
    content: '确定要刷新销售看板数据吗？',
    positiveText: '刷新',
    negativeText: '取消',
    onPositiveClick: () => {
      doRefresh()
    }
  })
}

function doRefresh() {
  message.info('正在刷新...')
  loadingBar.start()
  refreshing.value = true
  
  Promise.all([
    fetchStats(),
    fetchMonthlyStats(),
    fetchSalesTrend(),
    fetchCategoryDist(),
    fetchUserGrowth(),
    fetchTopProducts(),
    fetchRecentOrders(),
    fetchLowStockProducts()
  ]).then(() => {
    message.success('刷新成功')
    loadingBar.finish()
    refreshing.value = false
  }).catch(() => {
    message.error('刷新失败')
    loadingBar.error()
    refreshing.value = false
  })
}

// 时间范围切换处理
async function handleTimeRangeChange() {
  try {
    loadingBar.start()
    await fetchSalesTrend()
    loadingBar.finish()
  } catch (error) {
    console.error('获取销售趋势失败:', error)
    message.error('获取数据失败，请稍后重试')
    loadingBar.error()
  }
}

// 用户增长趋势时间范围切换处理
async function handleUserTimeRangeChange() {
  try {
    loadingBar.start()
    await fetchUserGrowth()
    loadingBar.finish()
  } catch (error) {
    console.error('获取用户增长趋势失败:', error)
    message.error('获取数据失败，请稍后重试')
    loadingBar.error()
  }
}

// 格式化金额，保留两位小数
function formatAmount(value) {
  if (value === null || value === undefined) {
    return '0.00';
  }
  return parseFloat(value).toFixed(2);
}

onMounted(() => {
  fetchStats()
  fetchMonthlyStats()
  fetchSalesTrend()
  fetchCategoryDist()
  fetchUserGrowth()
  fetchTopProducts()
  fetchRecentOrders()
  fetchLowStockProducts()
})
</script>

<style scoped>
.stat {
  font-size: 28px;
  font-weight: bold;
  color: #18a0ff;
  margin-top: 8px;
}
.stat-green { color: #18a058; }
.stat-blue { color: #2080f0; }
.stat-orange { color: #fa8c16; }
.stat-red { color: #d03050; }
.stat-yellow { color: #faad14; }

.dashboard-card-modern {
  background: linear-gradient(90deg, #fff7f0 0%, #ffe0d2 100%);
  border-radius: 22px;
  box-shadow: 0 2px 12px 0 rgba(255,94,98,0.08);
  padding: 0 0 18px 0;
}

.dashboard-header-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  border-radius: 22px 22px 0 0;
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%);
  box-shadow: 0 2px 8px 0 rgba(255,94,98,0.10);
  margin-bottom: 8px;
}

.dashboard-title-modern {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.dashboard-refresh-btn {
  background: linear-gradient(90deg, #ffecd2 0%, #ff5e62 100%) !important;
  color: #ebebeb !important;
  border: none;
  border-radius: 18px;
  font-weight: 600;
}

.quick-btn {
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%) !important;
  color: #fff !important;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 8px 0 rgba(255,94,98,0.10);
  margin-bottom: 10px;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.quick-btn:hover {
  background: linear-gradient(90deg, #ff5e62 0%, #ff9966 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 16px 0 rgba(255,94,98,0.18);
}

.quick-btn .iconfont {
  font-size: 20px;
  margin-right: 6px;
}
</style> 