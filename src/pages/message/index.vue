<template>
  <n-card title="留言管理">
    <n-space style="margin-bottom: 16px;" wrap>
      <n-input v-model:value="searchUserId" placeholder="用户ID" style="width: 120px" @keydown.enter="handleSearch" />
      <n-button type="primary" @click="handleSearch" :loading="loading">搜索</n-button>
      <n-button @click="fetchMessages" :loading="loading">刷新</n-button>
    </n-space>
    
    <n-data-table
      :columns="columns"
      :data="messageList"
      :pagination="pagination"
      :bordered="true"
      :loading="loading"
    />
    
    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetail" preset="card" style="width: 600px;">
      <template #header>留言详情</template>
      <div v-if="detail">
        <n-space vertical>
          <div><strong>用户ID：</strong>{{ detail.user_id }}</div>
          <div><strong>用户名：</strong>{{ detail.user_name }}</div>
          <div><strong>留言内容：</strong></div>
          <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; white-space: pre-wrap;">{{ detail.content }}</div>
          <div><strong>创建时间：</strong>{{ formatDate(detail.created_at) }}</div>
        </n-space>
      </div>
    </n-modal>
  </n-card>
</template>

<script setup name="Message">
import { ref, h, onMounted } from 'vue'
import { NButton, useMessage, useDialog } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()
const messageList = ref([])
const loading = ref(false)
const showDetail = ref(false)
const detail = ref(null)
const searchUserId = ref('')
const page = ref(1)
const pageSize = ref(30)
const total = ref(0)

const pagination = {
  pageSize: pageSize.value,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (p) => { page.value = p; fetchMessages() },
  onUpdatePageSize: (size) => { pageSize.value = size; page.value = 1; fetchMessages() },
  itemCount: total.value
}

const columns = [
  { title: 'ID', key: 'id' },
  { title: '用户ID', key: 'user_id' },
  { title: '用户名', key: 'user_name' },
  { title: '留言内容', key: 'content', ellipsis: true },
  { title: '创建时间', key: 'created_at' },
  { title: '操作', key: 'action', render: (row) => [
      h(NButton, { size: 'small', onClick: () => handleDetail(row) }, { default: () => '详情' }),
      h(NButton, { size: 'small', type: 'error', style: 'margin-left:8px', onClick: () => handleDelete(row) }, { default: () => '删除' })
    ]
  }
]

async function fetchMessages() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (searchUserId.value) params.user_id = searchUserId.value
    
    const res = await api.get('/admin/messages', { params })
    if (res && res.message === 'ok') {
      messageList.value = res.data.items
      total.value = res.data.total
    }
  } catch (e) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchMessages()
}

function handleDetail(row) {
  detail.value = row
  showDetail.value = true
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除这条留言吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/admin/messages/${row.id}`)
        message.success('删除成功')
        fetchMessages()
      } catch (e) {
        message.error('删除失败')
      }
    }
  })
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

onMounted(() => {
  fetchMessages()
})
</script> 