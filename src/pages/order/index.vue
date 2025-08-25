<template>
  <n-card title="订单管理">
    <n-space style="margin-bottom: 16px;" wrap>
      <n-input v-model:value="searchOrderNumber" placeholder="订单号" style="width: 180px" @keydown.enter="handleSearch" />
      <n-input v-model:value="searchUserId" placeholder="用户ID" style="width: 120px" @keydown.enter="handleSearch" />
      <n-select v-model:value="searchStatusList" :options="statusOptions" multiple placeholder="状态" style="width: 180px" />
      <n-date-picker v-model:value="searchDateRange" type="daterange" clearable style="width: 260px" />
      <n-button type="primary" @click="handleSearch" :loading="loading">搜索</n-button>
      <n-button @click="handleResetSearch">重置</n-button>
      <n-button type="primary" @click="fetchOrders" :loading="loading">刷新</n-button>
      <n-button type="success" @click="showAddOrder = true">新增订单</n-button>
      <n-button type="primary" @click="handleExportExcel" :loading="loading">导出Excel</n-button>
    </n-space>
    
    <n-data-table
      :columns="columns"
      :data="orders"
      :pagination="pagination"
      :bordered="true"
      :loading="loading"
    />
    <n-modal v-model:show="showDetail" preset="card" style="width: 900px;">
      <template #header>订单详情</template>
      <div v-if="detail" style="display: flex; gap: 24px; align-items: flex-start;">
        <!-- 左侧：基本信息表格 -->
        <div style="flex: 1; min-width: 260px;">
          <n-table size="small" :bordered="true" style="margin-bottom: 12px;">
            <tbody>
              <tr><td>订单ID</td><td>{{ detail.id }}</td></tr>
              <tr><td>订单号</td><td>{{ detail.order_number }}</td></tr>
              <tr><td>用户ID</td><td>{{ detail.user_id }}</td></tr>
              <tr><td>用户名</td><td>{{ detail.user_name }}</td></tr>
              <tr><td>金额</td><td>{{ formatAmount(detail.total_amount) }}</td></tr>
              <tr><td>状态</td><td>{{ statusMap[detail.status] || detail.status }}</td></tr>
              <tr><td>备注</td><td>{{ detail.remark }}</td></tr>
              <tr><td>收货地址</td><td>
                <div v-if="detail.shipping_address" style="max-width: 300px; word-break: break-all;">
                  {{ detail.shipping_address }}
                </div>
                <span v-else style="color: #888;">无地址信息</span>
              </td></tr>
              <tr><td>联系电话</td><td>{{ detail.contact_phone }}</td></tr>
              <tr><td>创建时间</td><td>{{ formatDate(detail.created_at) }}</td></tr>
              <tr><td>更新时间</td><td>{{ formatDate(detail.updated_at) }}</td></tr>
            </tbody>
          </n-table>
        </div>
        <!-- 右侧：商品明细表格 -->
        <div style="flex: 1.5; min-width: 340px;">
          <div style="font-weight: bold; margin-bottom: 8px;">商品明细：</div>
          <n-table v-if="detail.items && detail.items.length" size="small" :bordered="true">
            <thead>
              <tr>
                <th>图片</th>
                <th>商品名称</th>
                <th>数量</th>
                <th>单价</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detail.items" :key="item.id">
                <td><img :src="item.image" style="width:40px;height:40px;object-fit:cover;" /></td>
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.price }}</td>
              </tr>
            </tbody>
          </n-table>
          <div v-else style="color:#888;">无商品明细</div>
        </div>
      </div>
    </n-modal>
    <n-modal v-model:show="showEdit" preset="card" style="width: 900px;">
      <template #header>编辑订单</template>
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <!-- 左侧：基本信息表单 -->
        <div style="flex: 1; min-width: 260px;">
          <n-form :model="editForm">
            <n-form-item label="状态">
              <n-select v-model:value="editForm.status" :options="statusOptions" />
            </n-form-item>
            <n-form-item label="收货地址">
              <n-input 
                v-model:value="editForm.shipping_address" 
                type="textarea" 
                :rows="3"
                placeholder="请输入完整的收货地址（省市区详细地址）"
              />
              <div style="font-size: 12px; color: #888; margin-top: 4px;">
                建议格式：省份+城市+区县+详细地址
              </div>
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="editForm.contact_phone" />
            </n-form-item>
            <n-form-item label="自动调价">
              <n-select v-model:value="editForm.auto_adjust_price" :options="[
                { label: '是', value: true },
                { label: '否', value: false }
              ]" />
              <div style="font-size: 12px; color: #888; margin-top: 4px;">
                选择"是"时，修改商品数量会自动重新计算订单总金额
              </div>
            </n-form-item>
          </n-form>
          <div style="margin-top: 24px;">
            <n-space justify="end">
              <n-button @click="showEdit = false">取消</n-button>
              <n-button type="primary" @click="handleEditSave">保存</n-button>
            </n-space>
          </div>
        </div>
        <!-- 右侧：商品明细表格 -->
        <div style="flex: 1.5; min-width: 340px;">
          <div style="font-weight: bold; margin-bottom: 8px;">商品明细：</div>
          <n-table v-if="editForm.items && editForm.items.length" size="small" :bordered="true">
            <thead>
              <tr>
                <th>图片</th>
                <th>商品名称</th>
                <th>库存</th>
                <th>数量</th>
                <th>单价</th>
                <th>小计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in editForm.items" :key="item.product_id">
                <td><img :src="item.image" style="width:40px;height:40px;object-fit:cover;" /></td>
                <td>{{ item.product_name }}</td>
                <td>{{ allProducts.find(p => p.id === item.product_id)?.stock ?? item.stock ?? '-' }}</td>
                <td>
                  <n-input-number v-model:value="item.quantity" :min="1" :max="allProducts.find(p => p.id === item.product_id)?.stock ?? item.stock ?? 99999" @update:value="val => updateOrderItemQty(idx, val)" />
                </td>
                <td>{{ item.price }}</td>
                <td>{{ (item.price * item.quantity).toFixed(2) }}</td>
                <td><n-button size="small" type="error" @click="removeOrderItem(idx)">删除</n-button></td>
              </tr>
            </tbody>
          </n-table>
          <div v-else style="color:#888;">无商品明细</div>
          <div style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
            <div style="font-weight: bold;">订单总金额：¥{{ calculateTotalAmount() }}</div>
          </div>
          <n-button style="margin-top:12px;" @click="handleaddProduct">添加商品</n-button>
        </div>
      </div>
    </n-modal>
    <!-- 商品选择弹窗 -->
    <n-modal v-model:show="showProductSelect" preset="card" style="width: 500px;">
      <template #header>选择商品</template>
      <n-input v-model:value="productSearchText" placeholder="搜索商品名称" style="margin-bottom:8px;width:100%;" clearable />
      <n-select v-model:value="selectedProductIds" :options="filteredProducts.map(p => ({ label: p.name, value: p.id }))" multiple filterable placeholder="请选择商品" style="width:100%" />
      <div v-for="pid in selectedProductIds" :key="pid" style="margin:8px 0 0 0;display:flex;align-items:center;gap:8px;">
        <span style="min-width:60px;">{{ allProducts.find(p => p.id === pid)?.name }}</span>
        <span style="color:#888;">库存: {{ allProducts.find(p => p.id === pid)?.stock ?? '-' }}</span>
        <n-input-number v-model:value="addProductQtyMap[pid]" :min="1" :max="allProducts.find(p => p.id === pid)?.stock ?? 99999" placeholder="数量" style="width:100px;" />
      </div>
      <template #action>
        <n-space justify="end">
          <n-button @click="showProductSelect = false">取消</n-button>
          <n-button type="primary" @click="addProductToOrder">添加</n-button>
        </n-space>
      </template>
    </n-modal>
    <!-- 修改订单金额弹窗 -->
    <n-modal v-model:show="showAmountEdit" preset="card" style="width: 400px;">
      <template #header>修改订单金额</template>
      <n-form :model="amountEditForm">
        <n-form-item label="订单号">
          <n-input :value="orders.find(o => o.id === amountEditForm.id)?.order_number" disabled />
        </n-form-item>
        <n-form-item label="当前金额">
          <n-input :value="`¥${orders.find(o => o.id === amountEditForm.id)?.total_amount}`" disabled />
        </n-form-item>
        <n-form-item label="新金额">
          <n-input-number v-model:value="amountEditForm.total_amount" :min="0" :precision="2" style="width: 100%;" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAmountEdit = false">取消</n-button>
          <n-button type="primary" @click="handleAmountEditSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <!-- 新增订单弹窗 -->
    <n-modal v-model:show="showAddOrder" preset="card" style="width: 900px;">
      <template #header>新增订单</template>
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <!-- 左侧：基本信息表单 -->
        <div style="flex: 1; min-width: 260px;">
          <n-form :model="addOrderForm">
            <n-form-item label="用户ID" required>
              <n-input v-model:value="addOrderForm.user_id" placeholder="请输入用户ID" />
            </n-form-item>
            <n-form-item label="状态">
              <n-select v-model:value="addOrderForm.status" :options="statusOptions" />
            </n-form-item>
            <n-form-item label="收货地址">
              <n-input 
                v-model:value="addOrderForm.shipping_address" 
                type="textarea" 
                :rows="3"
                placeholder="请输入完整的收货地址（省市区详细地址）"
              />
              <div style="font-size: 12px; color: #888; margin-top: 4px;">
                建议格式：省份+城市+区县+详细地址
              </div>
            </n-form-item>
            <n-form-item label="联系电话">
              <n-input v-model:value="addOrderForm.contact_phone" placeholder="请输入联系电话" />
            </n-form-item>
            <n-form-item label="备注">
              <n-input v-model:value="addOrderForm.remark" placeholder="请输入备注信息" />
            </n-form-item>
            <n-form-item label="自动调价">
              <n-select v-model:value="addOrderForm.auto_adjust_price" :options="[
                { label: '是', value: true },
                { label: '否', value: false }
              ]" />
              <div style="font-size: 12px; color: #888; margin-top: 4px;">
                选择"是"时，修改商品数量会自动重新计算订单总金额
              </div>
            </n-form-item>
          </n-form>
          <div style="margin-top: 24px;">
            <n-space justify="end">
              <n-button @click="showAddOrder = false">取消</n-button>
              <n-button type="primary" @click="handleAddOrderSave" :loading="addOrderLoading">保存</n-button>
            </n-space>
          </div>
        </div>
        <!-- 右侧：商品明细表格 -->
        <div style="flex: 1.5; min-width: 340px;">
          <div style="font-weight: bold; margin-bottom: 8px;">商品明细：</div>
          <n-table v-if="addOrderForm.items && addOrderForm.items.length" size="small" :bordered="true">
            <thead>
              <tr>
                <th>图片</th>
                <th>商品名称</th>
                <th>库存</th>
                <th>数量</th>
                <th>单价</th>
                <th>小计</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in addOrderForm.items" :key="item.product_id">
                <td><img :src="item.image" style="width:40px;height:40px;object-fit:cover;" /></td>
                <td>{{ item.product_name }}</td>
                <td>{{ allProducts.find(p => p.id === item.product_id)?.stock ?? item.stock ?? '-' }}</td>
                <td>
                  <n-input-number v-model:value="item.quantity" :min="1" :max="allProducts.find(p => p.id === item.product_id)?.stock ?? item.stock ?? 99999" @update:value="val => updateAddOrderItemQty(idx, val)" />
                </td>
                <td>{{ item.price }}</td>
                <td>{{ (item.price * item.quantity).toFixed(2) }}</td>
                <td><n-button size="small" type="error" @click="removeAddOrderItem(idx)">删除</n-button></td>
              </tr>
            </tbody>
          </n-table>
          <div v-else style="color:#888;">无商品明细</div>
          <div style="margin-top: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
            <div style="font-weight: bold;">订单总金额：¥{{ calculateAddOrderTotalAmount() }}</div>
          </div>
          <n-button style="margin-top:12px;" @click="handleaddOrderproduct">添加商品</n-button>
        </div>
      </div>
    </n-modal>
    
    <!-- 新增订单商品选择弹窗 -->
    <n-modal v-model:show="showAddOrderProductSelect" preset="card" style="width: 500px;">
      <template #header>选择商品</template>
      <n-input v-model:value="addOrderProductSearchText" placeholder="搜索商品名称" style="margin-bottom:8px;width:100%;" clearable />
      <n-select v-model:value="addOrderSelectedProductIds" :options="filteredProducts.map(p => ({ label: p.name, value: p.id }))" multiple filterable placeholder="请选择商品" style="width:100%" />
      <div v-for="pid in addOrderSelectedProductIds" :key="pid" style="margin:8px 0 0 0;display:flex;align-items:center;gap:8px;">
        <span style="min-width:60px;">{{ allProducts.find(p => p.id === pid)?.name }}</span>
        <span style="color:#888;">库存: {{ allProducts.find(p => p.id === pid)?.stock ?? '-' }}</span>
        <n-input-number v-model:value="addOrderProductQtyMap[pid]" :min="1" :max="allProducts.find(p => p.id === pid)?.stock ?? 99999" placeholder="数量" style="width:100px;" />
      </div>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAddOrderProductSelect = false">取消</n-button>
          <n-button type="primary" @click="addProductToAddOrder">添加</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script setup name="Order">
import { ref, h, watch, computed, onMounted, onActivated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, useMessage, useDialog, NDatePicker, NInputNumber, NSelect, NModal, NDynamicInput, NDropdown } from 'naive-ui'
import api from '@/api'
import * as XLSX from 'xlsx'

const message = useMessage()
const dialog = useDialog()
const orders = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(30)
const loading = ref(false)
const showDetail = ref(false)
const detail = ref(null)
const showEdit = ref(false)
const editForm = ref({ id: null, status: '', shipping_address: '', contact_phone: '', items: [], auto_adjust_price: false })
const searchOrderNumber = ref('')
const searchUserId = ref('')
const searchStatusList = ref([])
const allProducts = ref([])
const showProductSelect = ref(false)
const selectedProductIds = ref([])
const addProductQtyMap = ref({})
const productSearchText = ref('')
const showAmountEdit = ref(false)
const amountEditForm = ref({ id: null, total_amount: 0 })
const filteredProducts = computed(() => {
  if (!productSearchText.value) return allProducts.value
  return allProducts.value.filter(p => p.name.includes(productSearchText.value))
})
const sortKey = ref('')
const sortOrder = ref('') // 'asc' | 'desc' | ''

// 新增订单相关变量
const showAddOrder = ref(false)
const addOrderForm = ref({ 
  user_id: '', 
  status: 'pending', 
  shipping_address: '', 
  contact_phone: '', 
  remark: '', 
  items: [], 
  auto_adjust_price: false 
})
const addOrderLoading = ref(false)
const showAddOrderProductSelect = ref(false)
const addOrderSelectedProductIds = ref([])
const addOrderProductQtyMap = ref({})
const addOrderProductSearchText = ref('')


const route = useRoute()
const router = useRouter()

const getYearStart = () => {
  const now = new Date()
  return new Date(now.getFullYear(), 0, 1).getTime()
}
const getTomorrow = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime()
}
const searchDateRange = ref([
  new Date('2025-01-01T00:00:00').getTime(),
  getTomorrow()
])

// 防御性watch，自动修正非法赋值


const pagination = {
  pageSize: pageSize.value,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (p) => { page.value = p; fetchOrders() },
  onUpdatePageSize: (size) => { pageSize.value = size; page.value = 1; fetchOrders() },
  itemCount: total.value
}

const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' }
]

const statusMap = {
  pending: '待处理',
  confirmed: '已确认',
  shipped: '已发货',
  delivered: '已完成',
  cancelled: '已取消'
}

const columns = [
  { title: renderSortableHeader('订单ID', 'id'), key: 'id' },
  { title: renderSortableHeader('订单号', 'order_number'), key: 'order_number' },
  { title: renderSortableHeader('用户ID', 'user_id'), key: 'user_id' },
  { title: renderSortableHeader('用户名', 'user_name'), key: 'user_name' },
  { title: renderSortableHeader('金额', 'total_amount'), key: 'total_amount' },
  { title: renderSortableHeader('状态', 'status'), key: 'status', render: row => statusMap[row.status] || row.status },
  { title: '备注', key: 'remark' },
  { title: renderSortableHeader('创建时间', 'created_at'), key: 'created_at' },
  { title: '操作', key: 'action', render: (row) => [
      h(NDropdown, {
        trigger: 'hover',
        options: [
          {
            label: '详情',
            key: 'detail'
          },
          {
            label: '修改',
            key: 'edit'
          },
          {
            label: '修改金额',
            key: 'editAmount'
          },
          {
            label: '删除',
            key: 'delete'
          }
        ],
        onSelect: (key) => {
          switch(key) {
            case 'detail':
              handleDetail(row)
              break
            case 'edit':
              handleEdit(row)
              break
            case 'editAmount':
              handleEditAmount(row)
              break
            case 'delete':
              handleDelete(row)
              break
          }
        }
      }, {
        default: () => h(NButton, { size: 'small' }, { default: () => '操作' })
      })
    ]
  }
]

function renderSortableHeader(label, key) {
  const isActive = sortKey.value === key
  let arrow = '▲'
  let color = '#bbb'
  if (isActive) {
    color = '#222'
    if (sortOrder.value === 'desc') arrow = '▼'
  }
  return h('span', {
    style: 'cursor:pointer;user-select:none;display:inline-flex;align-items:center;',
    onClick: () => handleSort(key)
  }, [
    label,
    h('span', {
      style: `margin-left:4px;font-size:12px;color:${color};transition:color 0.2s;`
    }, arrow)
  ])
}

function handleSort(key) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = ''
    sortKey.value = ''
  } else {
    sortOrder.value = 'asc'
  }
  fetchOrders()
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (searchOrderNumber.value) params.order_number = searchOrderNumber.value
    if (searchUserId.value) params.user_id = searchUserId.value
    if (searchStatusList.value && searchStatusList.value.length) params.status_list = searchStatusList.value.join(',')
    if (searchDateRange.value && searchDateRange.value.length === 2) {
      params.created_from = new Date(searchDateRange.value[0]).toISOString()
      params.created_to = new Date(searchDateRange.value[1]).toISOString()
    }
    if (sortKey.value && sortOrder.value) {
      params.sort_key = sortKey.value
      params.sort_order = sortOrder.value
    }
    const res = await api.get('/admin/orders', { params })
    if (res && res.message === 'ok') {
      orders.value = res.data.items
      total.value = res.data.total
      message.success('获取订单成功')
    } else {
      message.error('获取订单失败')
    }
  } catch (e) {
    message.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function handleDetail(row) {
  const res = await api.get(`/admin/orders/${row.id}`)
  if (res && res.message === 'ok') {
    detail.value = res.data
    showDetail.value = true
  } else {
    message.error('获取订单详情失败')
  }
}

function handleEdit(row) {
  api.get(`/admin/orders/${row.id}`).then(res => {
    if (res && res.message === 'ok') {
      const d = res.data
      editForm.value = {
        id: d.id,
        status: d.status,
        shipping_address: d.shipping_address,
        contact_phone: d.contact_phone,
        items: (d.items || []).map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          image: i.image,
          quantity: i.quantity,
          price: i.price
        })),
        auto_adjust_price: true // 默认开启自动调价
      }
      showEdit.value = true
      fetchAllProducts()
    } else {
      message.error('获取订单详情失败')
    }
  })
}

async function handleEditSave() {
  try {
    const payload = {
      status: editForm.value.status,
      shipping_address: editForm.value.shipping_address,
      contact_phone: editForm.value.contact_phone,
      items: editForm.value.items.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.price
      })),
      auto_adjust_price: editForm.value.auto_adjust_price
    }
    
    await api.put(`/admin/orders/${editForm.value.id}`, payload)
    message.success('修改成功')
    showEdit.value = false
    fetchOrders()
  } catch (e) {
    if (e && e.response && e.response.data && e.response.data.message) {
      message.error(e.response.data.message)
    } else {
      message.error('修改失败')
    }
  }
}

function  handleDelete(row) {
  const restoreStatus = ['confirmed', 'shipped', 'finished']
  if (restoreStatus.includes(row.status)) {
    dialog.warning({
      title: '确认删除',
      content: () => h('div', null, [
        h('div', `订单"${row.order_number}"为已确认/已发货/已完成状态。`),
        h('div', { style: 'margin-top:8px;' }, [
          '是否恢复库存及销量？',
          h('br'),
          h('span', { style: 'color:#888;font-size:13px;' }, '（选择"是"将恢复商品库存和销量，选择"否"则不恢复）')
        ])
      ]),
      positiveText: '是，恢复库存和销量',
      negativeText: '否，仅删除',
      onPositiveClick: async () => {
        try {
          await api.delete(`/admin/orders/${row.id}?restore=1`)
          message.success('删除成功，已恢复库存和销量')
          fetchOrders()
        } catch (e) {
          message.error('删除失败')
        }
      },
      onNegativeClick: async () => {
        try {
          await api.delete(`/admin/orders/${row.id}?restore=0`)
          message.success('删除成功')
          fetchOrders()
        } catch (e) {
          message.error('删除失败')
        }
      }
    })
  } else {
    // 未确认订单也提供恢复库存选项
    dialog.warning({
      title: '确认删除',
      content: () => h('div', null, [
        h('div', `订单"${row.order_number}"为未确认状态。`),
        h('div', { style: 'margin-top:8px;' }, [
          '是否恢复库存及销量？',
          h('br'),
          h('span', { style: 'color:#888;font-size:13px;' }, '（选择"是"将恢复商品库存和销量，选择"否"则不恢复）')
        ])
      ]),
      positiveText: '是，恢复库存和销量',
      negativeText: '否，仅删除',
      onPositiveClick: async () => {
        try {
          await api.delete(`/admin/orders/${row.id}?restore=1`)
          message.success('删除成功，已恢复库存和销量')
          fetchOrders()
        } catch (e) {
          message.error('删除失败')
        }
      },
      onNegativeClick: async () => {
        try {
          await api.delete(`/admin/orders/${row.id}?restore=0`)
          message.success('删除成功')
          fetchOrders()
        } catch (e) {
          message.error('删除失败')
        }
      }
    })
  }
}

function handleSearch() {
  page.value = 1
  fetchOrders()
}

function handleResetSearch() {
  searchOrderNumber.value = ''
  searchUserId.value = ''
  searchStatusList.value = []
  searchDateRange.value = [
    new Date('2025-01-01T00:00:00').getTime(),
    getTomorrow()
  ]
  sortKey.value = ''
  sortOrder.value = ''
  page.value = 1
  fetchOrders()
}

const handleExportExcel = async () => {
  try {
    const params = {}
    if (searchOrderNumber.value) params.order_number = searchOrderNumber.value
    if (searchUserId.value) params.user_id = searchUserId.value // 只在有值时传
    if (searchStatusList.value && searchStatusList.value.length) params.status_list = searchStatusList.value.join(',')
    if (searchDateRange.value && searchDateRange.value.length === 2) {
      params.created_from = new Date(searchDateRange.value[0]).toISOString()
      params.created_to = new Date(searchDateRange.value[1]).toISOString()
    }
    const res = await api.get('/admin/orders/export', { params })
    if (res && res.message === 'ok') {
      exportToExcel(res.data)
    } else {
      message.error('导出失败')
    }
  } catch (e) {
    message.error('导出失败')
  }
}
function exportToExcel(data) {
  const exportData = data.map(item => ({
    订单号: item.order_number,
    用户ID: item.user_id,
    用户名: item.user_name,
    金额: item.total_amount,
    状态: item.status,
    备注: item.remark,
    收货地址: item.shipping_address,
    联系电话: item.contact_phone,
    商品明细: item.items_str, // 新增
    创建时间: formatDate(item.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '订单列表')
  XLSX.writeFile(wb, 'orders.xlsx')
}

// 获取所有商品用于选择
async function fetchAllProducts() {
  const res = await api.get('/admin/products', { params: { page: 1, page_size: 1000 } })
  if (res && res.message === 'ok') {
    allProducts.value = res.data.items
  }
}

// 编辑弹窗商品明细区块
function addProductToOrder() {
  // 选中的商品加入editForm.items
  const toAdd = selectedProductIds.value
    .map(pid => {
      const p = allProducts.value.find(x => x.id === pid)
      let qty = addProductQtyMap.value[pid] || 1
      if (qty > p.stock) {
        message.warning(`商品“${p.name}”库存不足，最大可填${p.stock}`)
        qty = p.stock
      }
      return p ? {
        product_id: p.id,
        product_name: p.name,
        image: p.image,
        quantity: qty,
        price: p.price,
        stock: p.stock
      } : null
    })
    .filter(Boolean)
  // 去重（已存在的不重复添加）
  const existIds = editForm.value.items.map(i => i.product_id)
  toAdd.forEach(item => {
    if (!existIds.includes(item.product_id)) {
      editForm.value.items.push(item)
    }
  })
  showProductSelect.value = false
  selectedProductIds.value = []
  addProductQtyMap.value = {}
}
function removeOrderItem(idx) {
  editForm.value.items.splice(idx, 1)
}

function updateOrderItemQty(idx, val) {
  const item = editForm.value.items[idx]
  const product = allProducts.value.find(p => p.id === item.product_id)
  if (product && val > product.stock) {
    message.warning(`库存不足，最大可填${product.stock}`)
    item.quantity = product.stock
  } else {
    item.quantity = val
  }
  
  // 如果开启了自动调价，显示提示信息
  if (editForm.value.auto_adjust_price) {
    const newTotal = calculateTotalAmount()
    message.info(`订单总金额已更新为：¥${newTotal}`)
  }
}

function calculateTotalAmount() {
  return editForm.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
}

function handleEditAmount(row) {
  amountEditForm.value = {
    id: row.id,
    total_amount: row.total_amount
  }
  showAmountEdit.value = true
}

async function handleAmountEditSave() {
  try {
    await api.put(`/admin/orders/${amountEditForm.value.id}`, {
      total_amount: amountEditForm.value.total_amount
    })
    message.success('修改金额成功')
    showAmountEdit.value = false
    fetchOrders()
  } catch (e) {
    if (e && e.response && e.response.data && e.response.data.message) {
      message.error(e.response.data.message)
    } else {
      message.error('修改金额失败')
    }
  }
}

// 新增订单相关函数
function calculateAddOrderTotalAmount() {
  return addOrderForm.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)
}

function addProductToAddOrder() {
  // 选中的商品加入addOrderForm.items
  const toAdd = addOrderSelectedProductIds.value
    .map(pid => {
      const p = allProducts.value.find(x => x.id === pid)
      let qty = addOrderProductQtyMap.value[pid] || 1
      if (qty > p.stock) {
        message.warning(`商品"${p.name}"库存不足，最大可填${p.stock}`)
        qty = p.stock
      }
      return p ? {
        product_id: p.id,
        product_name: p.name,
        image: p.image,
        quantity: qty,
        price: p.price,
        stock: p.stock
      } : null
    })
    .filter(Boolean)
  // 去重（已存在的不重复添加）
  const existIds = addOrderForm.value.items.map(i => i.product_id)
  toAdd.forEach(item => {
    if (!existIds.includes(item.product_id)) {
      addOrderForm.value.items.push(item)
    }
  })
  showAddOrderProductSelect.value = false
  addOrderSelectedProductIds.value = []
  addOrderProductQtyMap.value = {}
}

function removeAddOrderItem(idx) {
  addOrderForm.value.items.splice(idx, 1)
}

function updateAddOrderItemQty(idx, val) {
  const item = addOrderForm.value.items[idx]
  const product = allProducts.value.find(p => p.id === item.product_id)
  if (product && val > product.stock) {
    message.warning(`库存不足，最大可填${product.stock}`)
    item.quantity = product.stock
  } else {
    item.quantity = val
  }
  
  // 如果开启了自动调价，显示提示信息
  if (addOrderForm.value.auto_adjust_price) {
    const newTotal = calculateAddOrderTotalAmount()
    message.info(`订单总金额已更新为：¥${newTotal}`)
  }
}

async function handleAddOrderSave() {
  // 验证必填字段
  if (!addOrderForm.value.user_id) {
    message.error('请输入用户ID')
    return
  }
  
  if (!addOrderForm.value.items || addOrderForm.value.items.length === 0) {
    message.error('请至少添加一个商品')
    return
  }
  
  addOrderLoading.value = true
  try {
    const orderData = {
      user_id: parseInt(addOrderForm.value.user_id),
      status: addOrderForm.value.status,
      shipping_address: addOrderForm.value.shipping_address,
      contact_phone: addOrderForm.value.contact_phone,
      remark: addOrderForm.value.remark,
      items: addOrderForm.value.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      auto_adjust_price: addOrderForm.value.auto_adjust_price
    }
    
    const res = await api.post('/admin/orders/create', orderData)
    if (res && res.message === 'ok') {
      message.success('新增订单成功')
      showAddOrder.value = false
      // 重置表单
      addOrderForm.value = { 
        user_id: '', 
        status: 'pending', 
        shipping_address: '', 
        contact_phone: '', 
        remark: '', 
        items: [], 
        auto_adjust_price: false 
      }
      fetchOrders()
    } else {
      message.error('新增订单失败')
    }
  } catch (e) {
    if (e && e.response && e.response.data && e.response.data.message) {
      message.error(e.response.data.message)
    } else {
      message.error('新增订单失败')
    }
  } finally {
    addOrderLoading.value = false
  }
}


async function handleaddProduct (){
  console.log('handleaddProduct')
  showProductSelect.value = true
  await fetchAllProducts()
}

async function handleaddOrderproduct (){
  showAddOrderProductSelect.value = true
  await fetchAllProducts()
}

// 格式化金额，保留两位小数
function formatAmount(value) {
  if (value === null || value === undefined) {
    return '0.00';
  }
  return parseFloat(value).toFixed(2);
}

onMounted(async () => {
  await fetchOrders()
  // 只保留fetchOrders，其他移到onActivated
})

onActivated(async () => {
 // 自动弹出详情
 const orderNumber = route.query.order_number
  if (orderNumber) {
    const order = orders.value.find(o => o.order_number == orderNumber)
    if (order) {
      await handleDetail(order)
    } else {
      // 若当前页未找到，尝试搜索
      searchOrderNumber.value = orderNumber
      await fetchOrders()
      const found = orders.value.find(o => o.order_number == orderNumber)
      if (found) await handleDetail(found)
    }
  }
  // fetchAllProducts()
})
</script> 