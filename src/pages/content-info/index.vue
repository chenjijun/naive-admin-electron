<template>
  <div class="content-info-page">
    <n-card title="内容信息管理" class="page-card">
      <template #header-extra>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <n-icon><Add /></n-icon>
          </template>
          添加内容
        </n-button>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索内容标题..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <n-icon><Search /></n-icon>
          </template>
        </n-input>
        <n-button type="primary" @click="handleSearch">
          搜索
        </n-button>
      </div>

      <!-- 内容列表 -->
      <n-data-table
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        :loading="loading"
        class="data-table"
      />

      <!-- 添加/编辑模态框 -->
      <n-modal v-model:show="showAddModal" preset="card" title="添加内容信息" style="width: 600px">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="标题" path="title">
            <n-input v-model:value="formData.title" placeholder="请输入内容标题" />
          </n-form-item>
          <n-form-item label="内容" path="content">
            <n-input
              v-model:value="formData.content"
              type="textarea"
              placeholder="请输入内容详情"
              :rows="4"
            />
          </n-form-item>
          <n-form-item label="类型" path="type">
            <n-select
              v-model:value="formData.type"
              :options="typeOptions"
              placeholder="请选择内容类型"
            />
          </n-form-item>
          <n-form-item label="状态" path="status">
            <n-switch v-model:value="formData.status" />
            <span class="ml-2">{{ formData.status ? '启用' : '禁用' }}</span>
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showAddModal = false">取消</n-button>
            <n-button type="primary" @click="handleSubmit">确定</n-button>
          </n-space>
        </template>
      </n-modal>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Add, Search } from '@vicons/ionicons5'
import { h } from 'vue'
import { NButton, NSpace, NPopconfirm } from 'naive-ui'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)
const formRef = ref(null)

// 表单数据
const formData = reactive({
  title: '',
  content: '',
  type: '',
  status: true
})

// 类型选项
const typeOptions = [
  { label: '公司介绍', value: 'company' },
  { label: '服务条款', value: 'terms' },
  { label: '隐私政策', value: 'privacy' },
  { label: '帮助中心', value: 'help' }
]

// 验证规则
const rules = {
  title: {
    required: true,
    message: '请输入标题',
    trigger: 'blur'
  },
  content: {
    required: true,
    message: '请输入内容',
    trigger: 'blur'
  },
  type: {
    required: true,
    message: '请选择类型',
    trigger: 'change'
  }
}

// 模拟数据
const mockData = [
  {
    id: 1,
    title: '公司介绍',
    content: '我们是一家专注于...',
    type: 'company',
    status: true,
    createTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    title: '服务条款',
    content: '用户在使用我们的服务时...',
    type: 'terms',
    status: true,
    createTime: '2024-01-02 14:30:00'
  }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 40],
  onChange: (page) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

// 过滤后的数据
const filteredData = computed(() => {
  if (!searchQuery.value) return mockData
  return mockData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 表格列配置
const columns = [
  { title: 'ID', key: 'id', width: 80 },
  { title: '标题', key: 'title', width: 200 },
  { title: '内容', key: 'content', width: 300, ellipsis: true },
  { title: '类型', key: 'type', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '创建时间', key: 'createTime', width: 180 },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleEdit(row)
          }, { default: () => '编辑' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            default: () => '确定删除吗？',
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              secondary: true
            }, { default: () => '删除' })
          })
        ]
      })
    }
  }
]

// 方法
const handleSearch = () => {
  pagination.page = 1
}

const handleEdit = (row) => {
  Object.assign(formData, row)
  showAddModal.value = true
}

const handleDelete = (id) => {
  // 这里应该调用删除API
  console.log('删除内容:', id)
}

const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      // 这里应该调用添加/编辑API
      console.log('提交数据:', formData)
      showAddModal.value = false
      // 重置表单
      Object.assign(formData, {
        title: '',
        content: '',
        type: '',
        status: true
      })
    }
  })
}

// 生命周期
onMounted(() => {
  // 这里可以加载真实数据
})
</script>

<style scoped>
.content-info-page {
  min-height: 100%;
}

.page-card {
  margin-bottom: 16px;
}

.search-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.data-table {
  margin-top: 16px;
}

.ml-2 {
  margin-left: 8px;
}
</style>


