<template>
  <div class="backup-manage-layout">
    <n-card title="数据库备份管理" class="backup-card">
      <!-- 备份操作区域 -->
      <div class="backup-actions">
        <n-space>
          <n-button 
            type="primary" 
            @click="handleCreateBackup" 
            :loading="creatingBackup"
            size="large"
          >
            创建数据库备份
          </n-button>
          <n-button 
            @click="handleRefreshBackups" 
            :loading="loading"
            size="large"
          >
            刷新备份列表
          </n-button>
        </n-space>
      </div>

      <!-- 备份状态信息 -->
      <div class="backup-status" v-if="backupStatus">
        <n-alert type="info" :show-icon="true">
          <template #header>备份状态概览</template>
          <div class="status-info">
            <span>总备份数: <strong>{{ backupStatus.total_backups }}</strong></span>
            <span>总大小: <strong>{{ backupStatus.total_size_mb }} MB</strong></span>
            <span v-if="backupStatus.latest_backup">
              最新备份: <strong>{{ backupStatus.latest_backup.created_at_formatted }}</strong>
            </span>
          </div>
        </n-alert>
      </div>

      <!-- 备份列表 -->
      <div class="backup-list">
        <n-data-table
          :columns="columns"
          :data="backups"
          :loading="loading"
          :bordered="true"
          :pagination="pagination"
          :row-key="row => row.filename"
        />
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue'
import { useMessage, useLoadingBar, NButton } from 'naive-ui'
import api from '@/api'

const message = useMessage()
const loadingBar = useLoadingBar()

// 响应式数据
const backups = ref([])
const backupStatus = ref(null)
const loading = ref(false)
const creatingBackup = ref(false)

// 分页配置
const pagination = ref({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50]
})

// 表格列配置
const columns = [
  {
    title: '备份文件名',
    key: 'filename',
    width: 300
  },
  {
    title: '创建时间',
    key: 'created_at_formatted',
    width: 180
  },
  {
    title: '文件大小',
    key: 'file_size_mb',
    width: 120,
    render: (row) => `${row.file_size_mb} MB`
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) => {
      return h('div', { class: 'action-buttons' }, [
        h(
            NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleDownloadBackup(row)
          },
          '下载'
        ),
        h(
            NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDeleteBackup(row),
            style: 'margin-left: 8px;'
          },
          '删除'
        )
      ])
    }
  }
]

// 获取备份列表
const fetchBackups = async () => {
  try {
    loading.value = true
    const response = await api.get('/admin/backup/list')
    if (response && response.message === 'ok') {
      backups.value = response.data.backups || []
    }
  } catch (error) {
    message.error('获取备份列表失败')
  } finally {
    loading.value = false
  }
}

// 获取备份状态
const fetchBackupStatus = async () => {
  try {
    const response = await api.get('/admin/backup/status')
    if (response && response.message === 'ok') {
      backupStatus.value = response.data
    }
  } catch (error) {
    console.error('获取备份状态失败:', error)
  }
}

// 刷新备份列表
const handleRefreshBackups = () => {
  fetchBackups()
  fetchBackupStatus()
}

// 创建备份
const handleCreateBackup = async () => {
  try {
    creatingBackup.value = true
    loadingBar.start()
    
    const response = await api.post('/admin/backup/create')
    loadingBar.finish()
    
    if (response && response.success) {
      message.success('数据库备份创建成功！')
      await fetchBackups()
      await fetchBackupStatus()
    } else {
      message.error(response?.message || '创建备份失败')
    }
  } catch (error) {
    loadingBar.error()
    message.error('创建备份失败')
  } finally {
    creatingBackup.value = false
  }
}

// 下载备份
const handleDownloadBackup = async (backup) => {
  try {
    const response = await api.get(`/admin/backup/download/${backup.filename}`, {
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', backup.filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    message.success('备份文件下载开始')
  } catch (error) {
    message.error('下载备份文件失败')
  }
}

// 删除备份
const handleDeleteBackup = async (backup) => {
  try {
    const response = await api.delete(`/admin/backup/${backup.filename}`)
    
    if (response && response.message === 'ok') {
      message.success('备份文件删除成功')
      await fetchBackups()
      await fetchBackupStatus()
    } else {
      message.error(response?.message || '删除备份失败')
    }
  } catch (error) {
    message.error('删除备份失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchBackups()
  fetchBackupStatus()
})
</script>

<style scoped>
.backup-manage-layout {
  padding: 20px;
}

.backup-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.backup-actions {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.backup-status {
  margin-bottom: 24px;
}

.status-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.status-info span {
  color: #666;
}

.backup-list {
  margin-top: 24px;
}

.action-buttons {
  display: flex;
  align-items: center;
}
</style>
