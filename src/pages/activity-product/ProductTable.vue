<template>
  <div>
    <n-space style="margin-bottom: 18px; gap: 16px;">
      <n-button type="primary" @click="showAdd = true">添加商品</n-button>
      <n-button quaternary type="info" @click="fetchList">刷新</n-button>
      <n-button quaternary type="info" @click="handleExportExcel">导出Excel</n-button>
      <n-button quaternary type="error" :disabled="!selectedRowKeys.length" @click="handleBatchDelete">批量删除</n-button>
    </n-space>
    <div class="activity-table-wrap">
      <n-data-table :columns="columns" :data="list" :loading="loading" :row-key="row => row.id" :checked-row-keys="selectedRowKeys" @update:checked-row-keys="val => selectedRowKeys = val" />
    </div>
    <!-- 添加/编辑弹窗 -->
    <n-modal v-model:show="showAdd" preset="card" :title="editId ? '编辑活动商品' : '添加活动商品'" style="width:420px;">
      <n-form :model="form" label-width="60">
        <n-form-item label="商品">
          <div style="display:flex;align-items:center;gap:8px;">
            <n-input v-model:value="productSearch" placeholder="请输入商品名称搜索" @input="onProductSearch" clearable style="flex:1;" />
            <n-select v-model:value="form.product_id" :options="productOptions" filterable placeholder="请选择商品" style="flex:1;" />
          </div>
        </n-form-item>
        <n-form-item label="排序">
          <n-input-number v-model:value="form.sort" :min="0" style="width:100%;" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end" style="gap:12px;">
          <n-button @click="closeModal">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
<script setup>
import { ref, onMounted, h } from 'vue'
import api from '@/api'
import * as XLSX from 'xlsx'
import { useDialog, NButton } from 'naive-ui'
const props = defineProps({ type: String })
const list = ref([])
const loading = ref(false)
const showAdd = ref(false)
const form = ref({ product_id: null, sort: 0 })
const productOptions = ref([])
const selectedRowKeys = ref([])
const editId = ref(null)
const dialog = useDialog()
const productSearch = ref('')
const columns = [
  { type: 'selection', key: 'selection', width: 40 },
  { title: '商品ID', key: 'product_id' },
  { title: '商品名称', key: 'product_name' },
  { title: '图片', key: 'image', render: row => h('img', { src: row.image, style: 'width:48px;height:48px;object-fit:cover;border-radius:8px;' }) },
  { title: '排序', key: 'sort' },
  { title: '操作', key: 'action', render: row => [
    h(NButton, { size: 'small', type: 'info', onClick: () => openEdit(row) }, { default: () => '编辑' }),
    h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' })
  ]}
]
function fetchList() {
  loading.value = true
  api.get(`/admin/activityproducts`, { params: { type: props.type } }).then(res => {
    list.value = res.data?.items || []
  }).finally(() => loading.value = false)
}
function fetchProducts(keyword = '') {
  api.get('/admin/products', { params: { page: 1, page_size: 1000, search: keyword } }).then(res => {
    productOptions.value = (res.data?.items || []).map(p => ({ label: p.name, value: p.id }))
  })
}
function onProductSearch(val) {
  fetchProducts(val)
}
function handleSave() {
  if (editId.value) {
    api.put(`/admin/activityproducts/${editId.value}`, { ...form.value, type: props.type }).then(() => {
      showAdd.value = false
      fetchList()
    })
  } else {
    api.post('/admin/activityproducts', { ...form.value, type: props.type }).then(() => {
      showAdd.value = false
      fetchList()
    })
  }
}
function openEdit(row) {
  editId.value = row.id
  form.value = { product_id: row.product_id, sort: row.sort }
  showAdd.value = true
  fetchProducts()
}
function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除该活动商品吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      api.delete(`/admin/activityproducts/${row.id}`).then(() => fetchList())
    }
  })
}
function handleBatchDelete() {
  if (!selectedRowKeys.value.length) return
  api.delete('/admin/activityproducts/batch', { data: { ids: selectedRowKeys.value } }).then(() => {
    selectedRowKeys.value = []
    fetchList()
  })
}
function closeModal() {
  showAdd.value = false
  editId.value = null
  form.value = { product_id: null, sort: 0 }
}
function handleExportExcel() {
  const exportData = list.value.map(item => ({
    商品ID: item.product_id,
    商品名称: item.product_name,
    排序: item.sort
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '活动商品')
  XLSX.writeFile(wb, 'activity_products.xlsx')
}
onMounted(() => {
  fetchList()
  fetchProducts()
})
</script>
<style scoped>
.n-data-table .n-table td, .n-data-table .n-table th {
  vertical-align: middle;
}
.activity-table-wrap {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(24,160,255,0.10);
  padding: 12px 18px 18px 18px;
  margin-bottom: 18px;
}
.n-data-table .n-table img {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(24,160,255,0.08);
}
.n-button {
  min-width: 72px;
}
</style> 