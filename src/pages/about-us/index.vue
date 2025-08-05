<template>
  <n-card title="关于我们管理">
    <n-space style="margin-bottom: 16px;" wrap>
      <n-button type="primary" @click="handleAdd">新增</n-button>
      <n-button @click="fetchContentInfo" :loading="loading">刷新</n-button>
    </n-space>
    
    <n-data-table
      :columns="columns"
      :data="contentList"
      :pagination="pagination"
      :bordered="true"
      :loading="loading"
    />
    
    <!-- 新增/编辑弹窗 -->
    <n-modal v-model:show="showEdit" preset="card" style="width: 600px;">
      <template #header>{{ isEdit ? '编辑' : '新增' }}关于我们</template>
      <n-form :model="editForm" ref="formRef">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="editForm.title" placeholder="请输入标题" />
        </n-form-item>
        <n-form-item label="内容" path="content">
          <n-input v-model:value="editForm.content" type="textarea" :rows="8" placeholder="请输入内容" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showEdit = false">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script setup name="AboutUs">
import { ref, h, onMounted } from 'vue'
import { NButton, useMessage, useDialog } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const dialog = useDialog()
const contentList = ref([])
const loading = ref(false)
const showEdit = ref(false)
const isEdit = ref(false)
const editForm = ref({ id: null, title: '', content: '' })

const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 50],
  onChange: (p) => { fetchContentInfo() },
  onUpdatePageSize: (size) => { fetchContentInfo() },
  itemCount: contentList.value.length
}

const columns = [
  { title: 'ID', key: 'id' },
  { title: '标题', key: 'title' },
  { title: '内容', key: 'content', ellipsis: true },
  { title: '创建时间', key: 'created_at' },
  { title: '更新时间', key: 'updated_at' },
  { title: '操作', key: 'action', render: (row) => [
      h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => '编辑' }),
      h(NButton, { size: 'small', type: 'error', style: 'margin-left:8px', onClick: () => handleDelete(row) }, { default: () => '删除' })
    ]
  }
]

async function fetchContentInfo() {
  loading.value = true
  try {
    const res = await api.get('/admin/contact-info', { params: { type: 'about' } })
    if (res && res.message === 'ok') {
      contentList.value = res.data.items
    }
  } catch (e) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editForm.value = { id: null, title: '', content: '' }
  showEdit.value = true
}

function handleEdit(row) {
  isEdit.value = true
  editForm.value = { ...row }
  showEdit.value = true
}

async function handleSave() {
  try {
    if (isEdit.value) {
      await api.put(`/admin/contact-info/${editForm.value.id}`, {
        type: 'about',
        title: editForm.value.title,
        content: editForm.value.content
      })
      message.success('更新成功')
    } else {
      await api.post('/admin/contact-info', {
        type: 'about',
        title: editForm.value.title,
        content: editForm.value.content
      })
      message.success('创建成功')
    }
    showEdit.value = false
    fetchContentInfo()
  } catch (e) {
    message.error('操作失败')
  }
}

function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除"${row.title}"吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/admin/contact-info/${row.id}`)
        message.success('删除成功')
        fetchContentInfo()
      } catch (e) {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchContentInfo()
})
</script> 