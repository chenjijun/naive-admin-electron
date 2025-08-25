<template>
  <div class="address-manage-layout">
    <n-space style="margin-bottom: 16px;">
      <n-input v-model:value="search" placeholder="搜索用户/收货人/手机号/地址" style="width: 260px" @keydown.enter="handleSearch" />
      <n-button type="primary" @click="openAdd">新增地址</n-button>
      <n-button @click="handleSearch">搜索</n-button>
      <n-button @click="handleRefresh">刷新</n-button>
      <n-button type="error" @click="toggleBatchMode" v-if="!batchMode">批量删除</n-button>
      <n-button @click="handleBatchDelete" v-if="batchMode && selectedRows.length" type="error">确认批量删除</n-button>
      <n-button @click="toggleBatchMode" v-if="batchMode" type="default">取消批量</n-button>
      <n-button type="info" @click="handleExportExcel">导出Excel</n-button>
    </n-space>
    <n-data-table
      :columns="columns"
      :data="addresses"
      :bordered="true"
      :pagination="false"
      :max-height="'70vh'"
      style="margin-bottom: 16px;"
      :row-key="row => row.id"
      :checked-row-keys="selectedRows"
      @update:checked-row-keys="handleCheck"
    />
    <div style="text-align:right;">
      <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :item-count="total"
        :page-sizes="[20, 30, 50, 100]"
        show-size-picker
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
    <!-- 新增地址弹窗 -->
    <n-modal v-model:show="showAdd" preset="card" style="width: 480px;">
      <template #header>新增地址</template>
      <n-form :model="formAdd">
        <n-form-item label="选择用户">
          <n-select v-model:value="formAdd.user_id" :options="userOptions" filterable placeholder="请选择用户" />
        </n-form-item>
        <n-form-item label="用户昵称">
          <n-input v-model:value="formAdd.receiver_name" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="formAdd.phone" />
        </n-form-item>
        <n-form-item label="省">
          <n-input v-model:value="formAdd.province" />
        </n-form-item>
        <n-form-item label="市">
          <n-input v-model:value="formAdd.city" />
        </n-form-item>
        <n-form-item label="区">
          <n-input v-model:value="formAdd.district" />
        </n-form-item>
        <n-form-item label="详细地址">
          <n-input v-model:value="formAdd.detail_address" />
        </n-form-item>
        <n-form-item label="是否默认">
          <n-switch v-model:value="formAdd.is_default" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAdd = false">取消</n-button>
          <n-button type="primary" @click="handleSaveAdd">保存</n-button>
        </n-space>
      </template>
    </n-modal>
    <!-- 编辑地址弹窗 -->
    <n-modal v-model:show="showEdit" preset="card" style="width: 480px;">
      <template #header>编辑地址</template>
      <div v-if="formEdit.username" style="margin-bottom: 12px; color: #888; font-size: 15px;">所属用户：{{ formEdit.username }}</div>
      <n-form :model="formEdit">
        <n-form-item label="用户昵称">
          <n-input v-model:value="formEdit.receiver_name" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="formEdit.phone" />
        </n-form-item>
        <n-form-item label="省">
          <n-input v-model:value="formEdit.province" />
        </n-form-item>
        <n-form-item label="市">
          <n-input v-model:value="formEdit.city" />
        </n-form-item>
        <n-form-item label="区">
          <n-input v-model:value="formEdit.district" />
        </n-form-item>
        <n-form-item label="详细地址">
          <n-input v-model:value="formEdit.detail_address" />
        </n-form-item>
        <n-form-item label="是否默认">
          <n-switch v-model:value="formEdit.is_default" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" @click="handleSaveEdit">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>
<script setup name="Address">
import { ref, onMounted, h, computed } from 'vue'
import { NButton, useMessage, useDialog, useLoadingBar, NDropdown } from 'naive-ui'
import api from '@/api'
import * as XLSX from 'xlsx'

const message = useMessage()
const dialog = useDialog()
const loadingBar = useLoadingBar()
const addresses = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const showAdd = ref(false)
const showEdit = ref(false)
const editId = ref(null)
const formAdd = ref({
  user_id: null,
  receiver_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})
const formEdit = ref({
  id: null,
  username: '',
  receiver_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})
const userOptions = ref([])
const batchMode = ref(false)
const selectedRows = ref([])
const loaded = ref(false)

const columns = computed(() => {
  const base = [
    { title: '用户名', key: 'username' },
    { title: '收件人', key: 'receiver_name' },
    { title: '手机号', key: 'phone' },
    { title: '地区', key: 'region', render: row => `${row.province}${row.city}${row.district}` },
    { title: '详细地址', key: 'detail_address' },
    { title: '是否默认', key: 'is_default', render: row => row.is_default ? '是' : '否' },
    { title: '创建时间', key: 'created_at', render: row => formatDate(row.created_at) },
    { title: '操作', key: 'action', render(row) {
      const options = [
        {
          label: '编辑地址',
          key: 'edit',
          icon: () => h('i', { class: 'icon-edit' }),
          disabled: false
        },
        {
          label: '删除地址',
          key: 'delete',
          icon: () => h('i', { class: 'icon-delete' }),
          disabled: false
        }
      ]

      return h(NDropdown, {
        trigger: 'click',
        options: options,
        onSelect: (key) => handleActionSelect(key, row),
        placement: 'bottom-end'
      }, {
        default: () => h(NButton, {
          size: 'small',
          type: 'primary',
          secondary: true,
          style: 'min-width: 60px;'
        }, { default: () => '操作 ▼' })
      })
    }}
  ];
  if (batchMode.value) {
    base.unshift({ type: 'selection', key: 'selection', width: 40 });
  }
  return base;
});

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function handleExportExcel() {
  const params = { keyword: search.value }
  const res = await api.get('/admin/addresses/export', { params })
  if (res && res.message === 'ok') {
    exportToExcel(res.data)
  } else {
    message.error('导出失败')
  }
}
function exportToExcel(data) {
  const exportData = data.map(item => ({
    用户名: item.username,
    收件人: item.receiver_name,
    手机号: item.phone,
    省: item.province,
    市: item.city,
    区: item.district,
    详细地址: item.detail_address,
    是否默认: item.is_default ? '是' : '否',
    创建时间: formatDate(item.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '地址列表')
  XLSX.writeFile(wb, 'addresses.xlsx')
}

async function fetchUserOptions() {
  // 假设后端有 /api/admin/users?all=1 返回所有用户
  const res = await api.get('/admin/users', { params: { all: 1 } })
  if (res && res.message === 'ok') {
    userOptions.value = res.data.map(u => ({ label: u.username, value: u.id }))
  }
}

async function fetchAddresses() {
  loadingBar.start()
  const res = await api.get('/admin/addresses', { params: { page: page.value, page_size: pageSize.value, keyword: search.value } })
  if (res && res.message === 'ok') {
    addresses.value = res.data.items
    total.value = res.data.total
    loadingBar.finish()
    message.success('获取地址成功')
  } else {
    message.error('获取失败')
    loadingBar.error()
  }
}
function handleSearch() {
  page.value = 1
  fetchAddresses()
}
function handlePageChange(newPage) {
  page.value = newPage
  fetchAddresses()
}
function handlePageSizeChange(newSize) {
  pageSize.value = newSize
  page.value = 1
  fetchAddresses()
}
function handleRefresh() {
  fetchAddresses()
}
function openEdit(row) {
  editId.value = row.id
  showEdit.value = true
  formEdit.value = { ...row }
}

// 处理操作下拉选项选择
function handleActionSelect(key, row) {
  switch (key) {
    case 'edit':
      openEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}
function openAdd() {
  showAdd.value = true
  Object.assign(formAdd.value, { user_id: null, receiver_name: '', phone: '', province: '', city: '', district: '', detail_address: '', is_default: false })
  fetchUserOptions()
}
function handleSaveAdd() {
  loadingBar.start()
  const req = { ...formAdd.value }
  api.post('/admin/addresses', req).then(res => {
    if (res && res.message === 'ok') {
      message.success('新增成功')
      showAdd.value = false
      fetchAddresses()
      loadingBar.finish()
    } else {
      message.error('新增失败')
      loadingBar.error()
    }
  }).catch(() => loadingBar.error())
}
function handleSaveEdit() {
  loadingBar.start()
  const req = { ...formEdit.value }
  api.put(`/admin/addresses/${editId.value}`, req).then(res => {
    if (res && res.message === 'ok') {
      message.success('保存成功')
      showEdit.value = false
      fetchAddresses()
      loadingBar.finish()
    } else {
      message.error('保存失败')
      loadingBar.error()
    }
  }).catch(() => loadingBar.error())
}
function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除该地址吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      loadingBar.start()
      api.delete(`/admin/addresses/${row.id}`).then(res => {
        if (res && res.message === 'ok') {
          message.success('删除成功')
          fetchAddresses()
          loadingBar.finish()
        } else {
          message.error('删除失败')
          loadingBar.error()
        }
      }).catch(() => loadingBar.error())
    }
  })
}
function toggleBatchMode() {
  batchMode.value = !batchMode.value
  selectedRows.value = []
}
function handleBatchDelete() {
  if (!selectedRows.value.length) return
  dialog.warning({
    title: '批量删除',
    content: `确定要删除选中的${selectedRows.value.length}个地址吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      loadingBar.start()
      api.post('/admin/addresses/batch-delete', { ids: selectedRows.value }).then(res => {
        if (res && res.message === 'ok') {
          message.success(`已删除${selectedRows.value.length}个地址`)
          batchMode.value = false
          selectedRows.value = []
          fetchAddresses()
          loadingBar.finish()
        } else {
          message.error('批量删除失败')
          loadingBar.error()
        }
      }).catch(() => loadingBar.error())
    }
  })
}
function handleCheck(val) {
  selectedRows.value = val
}
onMounted(() => {
  fetchAddresses()
})
</script>
<style scoped>
.address-manage-layout {
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(24,144,255,0.08);
  
  min-height: 600px;
}

.icon-edit {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #1890ff;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9c3.9-3.9 3.9-10.2 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2c-1.9 11.1 1.5 21.9 9.4 29.8 6.6 6.4 14.9 9.9 23.8 9.9z\"></path></svg>') center/contain no-repeat;
}

.icon-delete {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #ff4d4f;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h8v8c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-8zm504 56H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60l12.3 123.4c1.6 16.2 15.6 28.6 31.8 28.6h451.8c16.2 0 30.2-12.4 31.8-28.6L892 304h60c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-256h487l-24.2 256z\"></path></svg>') center/contain no-repeat;
}
</style> 