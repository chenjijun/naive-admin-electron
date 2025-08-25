<template>
  <n-card title="购物车管理">
    <!-- 统计信息 -->
    <n-grid :cols="4" :x-gap="16" style="margin-bottom: 20px;">
      <n-grid-item>
        <n-card size="small" style="text-align: center;">
          <template #header>总用户数</template>
          <div style="font-size: 24px; font-weight: bold; color: #1890ff;">{{ stats.total_users || 0 }}</div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small" style="text-align: center;">
          <template #header>总商品数</template>
          <div style="font-size: 24px; font-weight: bold; color: #52c41a;">{{ stats.total_items || 0 }}</div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small" style="text-align: center;">
          <template #header>涉及商品种类</template>
          <div style="font-size: 24px; font-weight: bold; color: #fa8c16;">{{ stats.total_products || 0 }}</div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small" style="text-align: center;">
          <template #header>当前页用户</template>
          <div style="font-size: 24px; font-weight: bold; color: #722ed1;">{{ carts.length }}</div>
        </n-card>
      </n-grid-item>
    </n-grid>
    
    <n-space style="margin-bottom: 16px;" wrap>
      <n-input v-model:value="searchUserId" placeholder="用户ID" style="width: 120px" @keydown.enter="handleSearch" />
      <n-input v-model:value="searchUsername" placeholder="用户名" style="width: 120px" @keydown.enter="handleSearch" />
      <n-input v-model:value="searchProductName" placeholder="商品名称" style="width: 150px" @keydown.enter="handleSearch" />
      <n-select v-model:value="sortKey" placeholder="排序方式" style="width: 120px" :options="sortOptions" />
      <n-select v-model:value="sortOrder" placeholder="排序顺序" style="width: 100px" :options="sortOrderOptions" />
      <n-button type="primary" @click="handleSearch" :loading="loading">搜索</n-button>
      <n-button @click="handleResetSearch">重置</n-button>
      <n-button type="primary" @click="fetchCarts" :loading="loading">刷新</n-button>
    </n-space>
    <n-data-table
      :columns="columns"
      :data="carts"
      :pagination="pagination"
      :bordered="true"
      :loading="loading"
      :row-key="row => row.user_id"
      :empty="loading ? '加载中...' : '暂无购物车数据'"
    />
    <!-- 购物车详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" style="width: 800px;">
      <template #header>购物车详情 - 用户ID: {{ detailUser?.user_id }} 用户名: {{ detailUser?.user_name }}</template>
      <n-table :bordered="true" size="small">
        <thead>
          <tr>
            <th>商品ID</th>
            <th>商品名称</th>
            <th>图片</th>
            <th>数量</th>
            <th>单价</th>
            <th>小计</th>
            <th>添加时间</th>
            <th>修改时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in detailUser?.products || []" :key="item.id">
            <td>{{ item.product_id }}</td>
            <td>{{ item.product_name }}</td>
            <td><img :src="item.product_image" style="width:40px;height:40px;object-fit:cover;" /></td>
            <td>
              <n-input-number 
                v-model:value="item.quantity" 
                :min="1" 
                size="small" 
                style="width: 80px"
                @update:value="(val) => updateCartItemQuantity(item.id, val)"
              />
            </td>
            <td>¥{{ formatPrice(item.price) }}</td>
            <td>¥{{ formatPrice(item.total_price) }}</td>
            <td>{{ formatDateTime(item.created_at) }}</td>
            <td>{{ formatDateTime(item.updated_at) }}</td>
            <td>
              <n-button 
                size="small" 
                type="error" 
                @click="deleteCartItem(item.id)"
                :loading="item.deleting"
              >
                删除
              </n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showDetail = false">关闭</n-button>
          <n-button 
            type="error" 
            @click="clearUserCart(detailUser?.user_id)"
            :loading="clearingCart"
          >
            清空该用户购物车
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script setup name="Cart">
import { ref, h, onMounted, watch, computed } from 'vue'
import { NButton, NModal, NInputNumber, NSelect, NInput, NSpace, NGrid, NGridItem, useMessage, useDialog } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()
const carts = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(30)
const loading = ref(false)
const searchUserId = ref('')
const searchUsername = ref('')
const searchProductName = ref('')
const sortKey = ref('cart_count')
const sortOrder = ref('desc')
const showDetail = ref(false)
const detailUser = ref(null)
const clearingCart = ref(false)
const stats = ref({})

// 排序选项
const sortOptions = [
  { label: '按商品数量', value: 'cart_count' },
  { label: '按用户ID', value: 'user_id' },
  { label: '按用户名', value: 'user_name' }
]

const sortOrderOptions = [
  { label: '降序', value: 'desc' },
  { label: '升序', value: 'asc' }
]

// 响应式分页
const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (p) => { page.value = p; fetchCarts() },
  onUpdatePageSize: (size) => { pageSize.value = size; page.value = 1; fetchCarts() },
  itemCount: total.value
}))

const columns = [
  { title: '用户ID', key: 'user_id' },
  { title: '用户名', key: 'user_name' },
  { title: '购物车商品数', key: 'cart_count' },
  { title: '操作', key: 'action', render: (row) => h('div', {}, [
    h(NButton, { 
      size: 'small', 
      style: 'margin-right:8px', 
      onClick: () => showCartDetail(row) 
    }, { default: () => '详情' }),
    h(NButton, { 
      size: 'small', 
      type: 'error', 
      secondary: true, 
      onClick: () => clearUserCart(row.user_id) 
    }, { default: () => '清空' })
  ]) }
]

// 格式化价格
function formatPrice(price) {
  if (!price && price !== 0) return '0.00'
  return Number(price).toFixed(2)
}

// 格式化日期时间
function formatDateTime(val) {
  if (!val) return ''
  const d = new Date(val)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const date = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const seconds = d.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}

async function fetchCarts() {
  loading.value = true
  try {
    const params = { 
      page: page.value, 
      page_size: pageSize.value,
      sort_key: sortKey.value,
      sort_order: sortOrder.value
    }
    if (searchUserId.value) params.user_id = searchUserId.value
    if (searchUsername.value) params.username = searchUsername.value
    if (searchProductName.value) params.product_name = searchProductName.value
    
    const res = await api.get('/admin/carts', { params })
    if (res && res.message === 'ok') {
      carts.value = res.data.items
      total.value = res.data.total
    }
  } catch (e) {
    message.error('获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
async function fetchStats() {
  try {
    const res = await api.get('/admin/carts/stat')
    if (res && res.message === 'ok') {
      stats.value = res.data
    }
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
}

function handleSearch() {
  page.value = 1
  fetchCarts()
}

function handleResetSearch() {
  searchUserId.value = ''
  searchUsername.value = ''
  searchProductName.value = ''
  sortKey.value = 'cart_count'
  sortOrder.value = 'desc'
  page.value = 1
  fetchCarts()
}

function showCartDetail(row) {
  detailUser.value = row
  // 为每个商品保存原始数量，用于失败时恢复
  if (detailUser.value.products) {
    detailUser.value.products.forEach(product => {
      product.originalQuantity = product.quantity
    })
  }
  showDetail.value = true
}

// 清空用户购物车
async function clearUserCart(userId) {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空该用户的所有购物车商品吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        clearingCart.value = true
        await api.delete(`/admin/carts/user/${userId}`)
        message.success('已清空该用户购物车')
        fetchCarts()
        if (showDetail.value && detailUser.value?.user_id === userId) {
          showDetail.value = false
        }
      } catch (e) {
        message.error('清空购物车失败')
      } finally {
        clearingCart.value = false
      }
    }
  })
}

// 删除单个购物车项
async function deleteCartItem(cartId) {
  const item = detailUser.value.products.find(p => p.id === cartId)
  if (!item) return
  
  dialog.warning({
    title: '确认删除',
    content: `确定要删除商品"${item.product_name}"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        // 设置删除状态
        item.deleting = true
        
        await api.delete(`/admin/carts/${cartId}`)
        message.success('删除成功')
        
        // 从详情中移除该项
        detailUser.value.products = detailUser.value.products.filter(p => p.id !== cartId)
        
        // 更新购物车商品数
        detailUser.value.cart_count = detailUser.value.products.length
        
        // 刷新列表
        fetchCarts()
      } catch (e) {
        message.error('删除失败')
      } finally {
        // 清除删除状态
        item.deleting = false
      }
    }
  })
}

// 更新购物车项数量
async function updateCartItemQuantity(cartId, quantity) {
  try {
    await api.put(`/admin/carts/${cartId}`, { quantity })
    message.success('数量更新成功')
    
    // 更新本地数据
    const item = detailUser.value.products.find(p => p.id === cartId)
    if (item) {
      item.quantity = quantity
      item.total_price = item.price * quantity
    }
    
    // 刷新列表
    fetchCarts()
  } catch (e) {
    message.error('数量更新失败')
    // 恢复原始数量
    const item = detailUser.value.products.find(p => p.id === cartId)
    if (item) {
      item.quantity = item.originalQuantity || item.quantity
    }
  }
}

onMounted(() => {
  fetchStats()
  fetchCarts()
})
</script>

<style scoped>
.n-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(24,144,255,0.08);
}
</style> 