<template>
  <n-card title="购物车管理">
    <n-space style="margin-bottom: 16px;" wrap>
      <n-input v-model:value="searchUserId" placeholder="用户ID" style="width: 120px" @keydown.enter="handleSearch" />
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
    />
    <!-- 购物车详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" style="width: 700px;">
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
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in detailUser?.products || []" :key="item.id">
            <td>{{ item.product_id }}</td>
            <td>{{ item.product_name }}</td>
            <td><img :src="item.product_image" style="width:40px;height:40px;object-fit:cover;" /></td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.price }}</td>
            <td>{{ item.total_price }}</td>
            <td>{{ formatDate(item.created_at) }}</td>
            <td>{{ formatDate(item.updated_at) }}</td>
          </tr>
        </tbody>
      </n-table>
    </n-modal>
  </n-card>
</template>

<script setup name="Cart">
import { ref, h, onMounted } from 'vue'
import { NButton, NModal, useMessage } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const carts = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(30)
const loading = ref(false)
const searchUserId = ref('')
const showDetail = ref(false)
const detailUser = ref(null)

const pagination = {
  pageSize: pageSize.value,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (p) => { page.value = p; fetchCarts() },
  onUpdatePageSize: (size) => { pageSize.value = size; page.value = 1; fetchCarts() },
  itemCount: total.value
}

const columns = [
  { title: '用户ID', key: 'user_id' },
  { title: '用户名', key: 'user_name' },
  { title: '购物车商品数', key: 'cart_count' },
  { title: '操作', key: 'action', render: (row) =>
    h(NButton, { size: 'small', onClick: () => showCartDetail(row) }, { default: () => '详情' })
  }
]

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function fetchCarts() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (searchUserId.value) params.user_id = searchUserId.value
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

function handleSearch() {
  page.value = 1
  fetchCarts()
}

function handleResetSearch() {
  searchUserId.value = ''
  page.value = 1
  fetchCarts()
}

function showCartDetail(row) {
  detailUser.value = row
  showDetail.value = true
}

onMounted(() => {
  fetchCarts()
})
</script>

<style scoped>
.n-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(24,144,255,0.08);
}
</style> 