<template>
  <div class="welcome-config-page">
    <n-card title="欢迎配置管理" class="page-card">
      <template #header-extra>
        <n-button type="primary" @click="showAddModal = true">
          <template #icon>
            <n-icon><Add /></n-icon>
          </template>
          添加配置
        </n-button>
      </template>

      <!-- 配置列表 -->
      <div class="table-container">
        <div v-if="configs.length === 0 && !loading" class="empty-state" style="text-align: center; padding: 40px; color: #999;">
          <h3>暂无配置数据</h3>
          <p>请点击"添加配置"按钮创建新的配置</p>
        </div>
        <n-data-table
          v-else
          :columns="columns"
          :data="configs"
          :pagination="pagination"
          :loading="loading"
          class="data-table"
          :scroll-x="1200"
          :row-key="(row) => row.id"
        />

      </div>

      <!-- 添加/编辑模态框 -->
      <n-modal v-model:show="showAddModal" preset="card" title="配置信息" style="width: 600px">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-form-item label="配置键" path="key">
            <n-input v-model:value="formData.key" placeholder="请输入配置键" :disabled="isEdit" />
          </n-form-item>
          <n-form-item label="配置值" path="value">
            <n-input
              v-model:value="formData.value"
              type="textarea"
              placeholder="请输入配置值"
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="配置描述" path="description">
            <n-input
              v-model:value="formData.description"
              type="textarea"
              placeholder="请输入配置描述"
              :rows="2"
            />
          </n-form-item>
          <n-form-item label="状态" path="is_active">
            <n-switch v-model:value="formData.is_active" />
            <span class="ml-2">{{ formData.is_active ? '启用' : '禁用' }}</span>
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
import { ref, reactive, onMounted, h } from 'vue'
import { Add } from '@vicons/ionicons5'
import { NButton, NSpace, NPopconfirm, NTag, NPopover, NModal, NForm, NFormItem, NInput, NSwitch, NIcon } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { 
  getWelcomeConfigs, 
  createWelcomeConfig, 
  updateWelcomeConfig, 
  deleteWelcomeConfig, 
  generateRandomValue 
} from '@/api/welcomeConfig'

// 响应式数据
const loading = ref(false)
const configs = ref([])
const showAddModal = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const message = useMessage()

// 表单数据
const formData = reactive({
  key: '',
  value: '',
  description: '',
  is_active: true
})

// 验证规则
const rules = {
  key: {
    required: true,
    message: '请输入配置键',
    trigger: 'blur'
  },
  value: {
    required: true,
    message: '请输入配置值',
    trigger: 'blur'
  }
}

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

// 表格列配置
const columns = [
  { title: 'ID', key: 'id', width: 80, fixed: 'left' },
  { title: '配置键', key: 'key', width: 200, fixed: 'left' },
  { 
    title: '配置值', 
    key: 'value', 
    width: 300, 
    ellipsis: true,
    render(row) {
      return h('div', {
        style: 'word-break: break-all; white-space: pre-wrap; max-height: 60px; overflow: hidden;'
      }, row.value || '-')
    }
  },
  { 
    title: '描述', 
    key: 'description', 
    width: 250, 
    ellipsis: true,
    render(row) {
      return h('div', {
        style: 'word-break: break-all; white-space: pre-wrap; max-height: 60px; overflow: hidden;'
      }, row.description || '-')
    }
  },
  { 
    title: '状态', 
    key: 'is_active', 
    width: 100,
    render(row) {
      return h(NTag, {
        type: row.is_active ? 'success' : 'error',
        size: 'small'
      }, { default: () => row.is_active ? '启用' : '禁用' })
    }
  },
  { 
    title: '创建时间', 
    key: 'created_at', 
    width: 180,
    render(row) {
      return row.created_at ? new Date(row.created_at).toLocaleString() : '-'
    }
  },
  { 
    title: '更新时间', 
    key: 'updated_at', 
    width: 180,
    render(row) {
      return row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 280,
    fixed: 'right',
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            secondary: true,
            onClick: () => handleView(row)
          }, { default: () => '查看' }),
          h(NButton, {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleEdit(row)
          }, { default: () => '编辑' }),
          h(NPopover, {
            trigger: 'hover',
            placement: 'top'
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'warning',
              secondary: true,
              onClick: () => handleGenerateRandom(row)
            }, { default: () => '随机值' }),
            default: () => '生成新的随机值'
          }),
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
const loadConfigs = async () => {
  loading.value = true
  try {
    // 检查认证token
    const token = localStorage.getItem('token')
    if (!token) {
      message.error('未找到认证token，请重新登录')
      return
    }
    
    // 检查token是否过期
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      const exp = tokenData.exp * 1000
      const now = Date.now()
      if (now > exp) {
        message.error('Token已过期，请重新登录')
        localStorage.removeItem('token')
        return
      }
    } catch (e) {
      message.error('Token格式错误，请重新登录')
      return
    }
    
    const response = await getWelcomeConfigs()
    
    // FastAPI直接返回数据，没有statusCode字段
    if (Array.isArray(response)) {
      configs.value = response
      message.success(`成功加载 ${response.length} 条配置`)
    } else if (response && response.statusCode === 200 && Array.isArray(response.data)) {
      // 兼容其他可能的响应格式
      configs.value = response.data
      message.success(`成功加载 ${response.data.length} 条配置`)
    } else {
      configs.value = []
      message.error('数据格式错误，请检查API响应')
    }
  } catch (error) {
    console.error('加载配置异常:', error)
    const errorMessage = error?.message || error?.detail || error?.response?.data?.detail || '未知错误'
    message.error(`加载配置失败: ${errorMessage}`)
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  Object.assign(formData, row)
  showAddModal.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  showAddModal.value = true
}

const handleGenerateRandom = async (row) => {
  try {
    const response = await generateRandomValue(row.id)
    
    // 检查响应格式
    if (response && response.message && response.new_value) {
      // 更新本地数据
      row.value = response.new_value
      row.updated_at = new Date().toLocaleString()
      message.success(`已为 ${row.key} 生成新的随机值: ${response.new_value}`)
    } else if (response && response.statusCode === 200 && response.data && response.data.new_value) {
      // 兼容其他响应格式
      row.value = response.data.new_value
      row.updated_at = new Date().toLocaleString()
      message.success(`已为 ${row.key} 生成新的随机值: ${response.data.new_value}`)
    } else {
      message.error('生成随机值失败：响应格式错误')
    }
  } catch (error) {
    message.error('生成随机值失败')
    console.error('生成随机值失败:', error)
  }
}

const handleDelete = async (id) => {
  try {
    const response = await deleteWelcomeConfig(id)
    
    // 检查响应格式
    if (response && response.message) {
      message.success('删除成功')
      await loadConfigs()
    } else if (response && response.statusCode === 200) {
      message.success('删除成功')
      await loadConfigs()
    } else {
      message.error('删除失败：响应格式错误')
    }
  } catch (error) {
    message.error('删除失败')
    console.error('删除失败:', error)
  }
}

const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        let response
        if (isEdit.value) {
          response = await updateWelcomeConfig(formData.id, formData)
          if (response && response.id) {
            message.success('更新成功')
          } else if (response && response.statusCode === 200) {
            message.success('更新成功')
          } else {
            message.error('更新失败：响应格式错误')
            return
          }
        } else {
          response = await createWelcomeConfig(formData)
          if (response && response.id) {
            message.success('添加成功')
          } else if (response && response.statusCode === 201) {
            message.success('添加成功')
          } else {
            message.error('添加失败：响应格式错误')
            return
          }
        }
        
        showAddModal.value = false
        await loadConfigs()
        
        // 重置表单
        Object.assign(formData, {
          key: '',
          value: '',
          description: '',
          is_active: true
        })
        isEdit.value = false
      } catch (error) {
        message.error(isEdit.value ? '更新失败' : '添加失败')
        console.error('操作失败:', error)
      }
    }
  })
}

// 生命周期
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.welcome-config-page {
  min-height: 100%;
}

.page-card {
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
  margin-top: 16px;
}

.data-table {
  min-width: 1200px;
}

.ml-2 {
  margin-left: 8px;
}

/* 确保表格可以水平滚动 */
:deep(.n-data-table) {
  overflow-x: auto;
}

:deep(.n-data-table-table) {
  min-width: 1200px;
}
</style>
