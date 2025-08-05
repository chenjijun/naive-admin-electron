<template>
  <n-card title="分类管理">
    <n-space vertical>
        <n-space horizontal>
      <n-button type="primary" @click="openAdd">新增分类</n-button>
      <n-button quaternary type="info" @click="fetchCategories" :loading="refreshLoading" style="margin-left:8px">刷新</n-button>
      <n-button type="default" @click="clearSort" style="margin-left:8px">清空排序</n-button>
    </n-space>
      <n-data-table :columns="columns" :data="sortedCategoryList" :pagination="pagination" />
    </n-space>
    <n-modal v-model:show="showModal">
      <n-card style="width: 400px" :title="modalTitle">
        <n-form :model="form" label-width="80">
          <n-form-item label="名称" path="name">
            <n-input v-model:value="form.name" />
          </n-form-item>
          <n-form-item label="父级" path="parent_id">
            <n-select v-model:value="form.parent_id" :options="parentOptions" clearable />
          </n-form-item>
          <n-form-item label="图标" path="icon">
            <n-upload
              :custom-request="handleIconUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <n-button>上传图标</n-button>
            </n-upload>
            <img v-if="form.icon" :src="form.icon" style="max-width: 80px; margin-left: 12px;" />
          </n-form-item>
          <n-form-item label="描述" path="description">
            <n-input v-model:value="form.description" />
          </n-form-item>
          <n-form-item label="首页显示" path="show_on_index">
            <n-switch v-model:value="form.show_on_index" />
          </n-form-item>
          <n-space>
            <n-button type="primary" @click="handleSave">保存</n-button>
            <n-button @click="showModal = false">取消</n-button>
          </n-space>
        </n-form>
      </n-card>
    </n-modal>
  </n-card>
</template>

<script setup name="Category">
import { ref, onMounted, h, computed } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSelect, NSwitch, useMessage, useDialog } from 'naive-ui'
import api from '@/api'
import axios from 'axios'
import { API_BASE_URL } from '@/api/baseUrl'

const message = useMessage()
const categoryList = ref([])
const showModal = ref(false)
const modalTitle = ref('新增分类')
const form = ref({
  id: null,
  name: '',
  parent_id: null,
  description: '',
  show_on_index: false
})
const parentOptions = ref([])
const refreshLoading = ref(false)
const uploadUrl = '/admin/categories/upload-icon/'
const dialog = useDialog()

const sortableKeys = ['name', 'description', 'show_on_index']
const sortKey = ref('')
const sortOrder = ref('') // 'asc' | 'desc' | ''

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
}

function clearSort() {
  sortKey.value = ''
  sortOrder.value = ''
}

const sortedCategoryList = computed(() => {
  if (!sortKey.value || !sortOrder.value) return categoryList.value
  return [...categoryList.value].sort((a, b) => {
    let v1 = a[sortKey.value]
    let v2 = b[sortKey.value]
    // 首页显示布尔值特殊处理
    if (sortKey.value === 'show_on_index') {
      v1 = v1 ? 1 : 0
      v2 = v2 ? 1 : 0
    }
    if (typeof v1 === 'string') v1 = v1.toLowerCase()
    if (typeof v2 === 'string') v2 = v2.toLowerCase()
    if (v1 === v2) return 0
    if (sortOrder.value === 'asc') return v1 > v2 ? 1 : -1
    return v1 < v2 ? 1 : -1
  })
})

const columns = [
  { title: 'ID', key: 'id' },
  { title: () => renderSortableHeader('名称', 'name'), key: 'name' },
  { title: '父级', key: 'parent_id' },
  { title: '图标', key: 'icon', render: row => row.icon ? h('img', { src: row.icon, style: 'width:40px;height:40px;object-fit:cover;border-radius:6px;' }) : '' },
  { title: () => renderSortableHeader('描述', 'description'), key: 'description' },
  { title: () => renderSortableHeader('首页显示', 'show_on_index'), key: 'show_on_index', render: row => row.show_on_index ? '是' : '否' },
  { title: '操作', key: 'actions', render: (row) => [
      h(NButton, { size: 'small', type: 'info', onClick: () => openEdit(row) }, { default: () => '编辑' }),
      h(NButton, { size: 'small', type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' })
    ]
  }
]

const pagination = { pageSize: 30 }

async function fetchCategories() {
  refreshLoading.value = true
  try {
    const res = await api.get('/admin/categories/')
    if (res && res.message === 'ok') {
      categoryList.value = res.data
      // 展平所有分类用于父级下拉选择
      function flattenTree(tree) {
        let arr = []
        tree.forEach(node => {
          arr.push({ label: node.name, value: node.id })
          if (node.children && node.children.length) {
            arr = arr.concat(flattenTree(node.children))
          }
        })
        return arr
      }
      parentOptions.value = flattenTree(categoryList.value)
      message.success('获取分类成功')
    } else {
      message.error('获取分类失败')
    }
  } catch (e) {
    message.error('获取分类失败')
  } finally {
    refreshLoading.value = false
  }
}

onMounted(fetchCategories)

function openAdd() {
  modalTitle.value = '新增分类'
  form.value = { id: null, name: '', parent_id: null, description: '', show_on_index: false }
  showModal.value = true
}

async function openEdit(row) {
  modalTitle.value = '编辑分类'
  const res = await api.get(`/admin/categories/${row.id}`)
  // 这里假设api返回的就是{message, data}
  if (res && res.message === 'ok' && res.data) {
    const d = res.data
    form.value = {
      id: d.id,
      name: d.name,
      parent_id: d.parent_id,
      description: d.description ?? '',
      show_on_index: d.show_on_index ?? false,
      icon: d.icon ?? ''
    }
    showModal.value = true
  } else {
    message.error('获取分类详情失败')
  }
}

async function handleSave() {
  try {
    if (form.value.id) {
      await api.put(`/admin/categories/${form.value.id}`, {
        name: form.value.name,
        parent_id: form.value.parent_id,
        description: form.value.description,
        show_on_index: form.value.show_on_index,
        icon: form.value.icon
      })
      message.success('编辑成功')
    } else {
      await api.post('/admin/categories', {
        name: form.value.name,
        parent_id: form.value.parent_id,
        description: form.value.description,
        show_on_index: form.value.show_on_index,
        icon: form.value.icon
      })
      message.success('新增成功')
    }
    showModal.value = false
    await fetchCategories()
  } catch (e) {
    message.error('保存失败')
  }
}

async function handleDelete(row) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除分类“${row.name}”吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await api.delete(`/admin/categories/${row.id}`)
        message.success('删除成功')
        await fetchCategories()
      } catch (e) {
        message.error('删除失败')
      }
    }
  })
}

async function handleIconUpload({ file, onFinish }) {
  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('category', form.value.name || 'default')
  const res = await api.post('/admin/categories/upload-icon/', formData)
  if (res && res.data && res.message === 'ok') {
    form.value.icon = res.data.url || res.data
    onFinish()
    message.success('上传成功')
  } else {
    message.error('上传失败')
  }
}
</script> 