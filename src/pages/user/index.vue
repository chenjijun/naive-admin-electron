<template>
  <div>
    <n-space>
      <n-button type="primary" @click="showAdd = true">新增用户</n-button>
      <n-button quaternary type="info" @click="fetchUsers" :loading="refreshLoading" style="margin-left:8px">
        <template #icon><i class="icon-refresh" /></template>刷新
      </n-button>
      <n-button type="info" @click="handleExportExcel">导出Excel</n-button>
    </n-space>
    <n-data-table
      :columns="columns"
      :data="users"
      :bordered="true"
      :loading="refreshLoading"
      style="margin-top: 16px"
    />
    <!-- 新增用户弹窗 Flutter风格美化 -->
    <n-modal v-model:show="showAdd" preset="card" style="border-radius: 24px; width: 50%; box-shadow: 0 8px 32px rgba(24,160,255,0.18); overflow: hidden;">
      <template #header>
        <div class="add-title">新增用户</div>
      </template>
      <n-form :model="addForm" class="add-form">
        <n-form-item label="用户名">
          <n-input v-model:value="addForm.username" class="add-input" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="addForm.email" class="add-input" />
        </n-form-item>
        <n-form-item label="密码">
          <n-input v-model:value="addForm.password" type="password" class="add-input" />
        </n-form-item>
        <n-form-item label="昵称">
          <n-input v-model:value="addForm.nickname" class="add-input" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="addForm.phone" class="add-input" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAdd = false" class="add-cancel">取消</n-button>
          <n-button type="primary" @click="handleAdd" class="add-confirm" style="background: linear-gradient(90deg, #42a5f5 0%, #478ed1 100%); border-radius: 18px; box-shadow: 0 2px 8px rgba(66,165,245,0.12);">确定</n-button>
        </n-space>
      </template>
    </n-modal>
    <!-- 编辑用户弹窗 Flutter风格美化 -->
    <n-modal v-model:show="showEdit" preset="card" style="border-radius: 24px; width: 50%; box-shadow: 0 8px 32px rgba(24,160,255,0.18); overflow: hidden;">
      <template #header>
        <div class="add-title">编辑用户</div>
      </template>
      <n-form :model="editForm" class="add-form">
        <n-form-item label="用户名">
          <n-input v-model:value="editForm.username" class="add-input" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="editForm.email" class="add-input" />
        </n-form-item>
        <n-form-item label="昵称">
          <n-input v-model:value="editForm.nickname" class="add-input" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="editForm.phone" class="add-input" />
        </n-form-item>
        <n-form-item label="状态">
          <n-switch v-model:value="editForm.is_active" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showEdit = false" class="add-cancel">取消</n-button>
          <n-button @click="handleChangePwd" class="add-cancel" style="background: #f5f7fa; color: #42a5f5; border-radius: 18px;">修改密码</n-button>
          <n-button type="primary" @click="handleEdit" class="add-confirm" style="background: linear-gradient(90deg, #42a5f5 0%, #478ed1 100%); border-radius: 18px; box-shadow: 0 2px 8px rgba(66,165,245,0.12);">保存</n-button>
        </n-space>
      </template>
    </n-modal>
    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="showPwd" preset="card" style="border-radius: 24px; width: 400px; box-shadow: 0 8px 32px rgba(24,160,255,0.18); overflow: hidden;">
      <template #header>
        <div class="add-title">修改密码</div>
      </template>
      <n-form :model="pwdForm" class="add-form">
        <n-form-item label="新密码">
          <n-input v-model:value="pwdForm.password" class="add-input" type="password" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showPwd = false" class="add-cancel">取消</n-button>
          <n-button type="primary" @click="handlePwdConfirm" class="add-confirm" style="background: linear-gradient(90deg, #42a5f5 0%, #478ed1 100%); border-radius: 18px; box-shadow: 0 2px 8px rgba(66,165,245,0.12);">确认</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup name="User">
import { ref, onMounted, h } from 'vue'
import { NButton, useMessage, useDialog } from 'naive-ui'
import api from '@/api'
import axios from 'axios'
import * as XLSX from 'xlsx'
const message = useMessage()
const dialog = useDialog()
const users = ref([])
const showAdd = ref(false)
const showEdit = ref(false)
const refreshLoading = ref(false)
const addForm = ref({ username: '', email: '', password: '', nickname: '', phone: '' })
const editForm = ref({ id: null, username: '', email: '', nickname: '', phone: '', is_active: true })
const showPwd = ref(false)
const pwdForm = ref({ password: '' })
let editingUserId = null

const columns = [
  { title: 'ID', key: 'id' },
  { title: '用户名', key: 'username' },
  { title: '邮箱', key: 'email' },
  { title: '昵称', key: 'nickname' },
  { title: '手机号', key: 'phone' },
  { title: '管理员', key: 'is_admin', render: row => row.is_admin ? '是' : '否' },
  { title: '状态', key: 'is_active', render: row => row.is_active ? '启用' : '禁用' },
  { title: '上次登录', key: 'last_login_at' },
  { title: '创建时间', key: 'created_at' },
  {
    title: '操作',
    key: 'action',
    render(row) {
      return [
        h(NButton, { size: 'small', onClick: () => openEdit(row) }, { default: () => '编辑' }),
        h(NButton, {
          size: 'small',
          type: 'error',
          style: 'margin-left:8px',
          onClick: () => handleDelete(row),
          disabled: row.is_admin
        }, { default: () => '删除' })
      ]
    }
  }
]

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function handleExportExcel() {
  const res = await api.get('/admin/users/export')
  if (res && res.message === 'ok') {
    exportToExcel(res.data)
  } else {
    message.error('导出失败')
  }
}
function exportToExcel(data) {
  const exportData = data.map(item => ({
    用户ID: item.id,
    用户名: item.username,
    邮箱: item.email,
    昵称: item.nickname,
    手机号: item.phone,
    管理员: item.is_admin ? '是' : '否',
    状态: item.is_active ? '启用' : '禁用',
    创建时间: formatDate(item.created_at)
  }))
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户列表')
  XLSX.writeFile(wb, 'users.xlsx')
}

async function fetchUsers() {
  refreshLoading.value = true
  let timeoutId
  try {
    const source = axios.CancelToken.source()
    timeoutId = setTimeout(() => {
      source.cancel('请求超时')
    }, 10000)
    const res = await api.get('/admin/users', { cancelToken: source.token })
    clearTimeout(timeoutId)
    if (res && res.message === 'ok') {
      users.value = res.data
      message.success('获取用户成功')
    } else {
      message.error('获取用户失败')
    }
  } catch (e) {
    clearTimeout(timeoutId)
    if (e?.message?.includes('timeout')) {
      message.error('获取用户超时')
    } else {
      message.error('获取用户失败')
    }
  } finally {
    refreshLoading.value = false
  }
}

function handleAdd() {
  let timeoutId
  const source = axios.CancelToken.source()
  timeoutId = setTimeout(() => {
    source.cancel('请求超时')
  }, 10000)
  api.post('/admin/users', { ...addForm.value, is_admin: false }, { cancelToken: source.token }).then(res => {
    clearTimeout(timeoutId)
    if (res && res.message === 'ok') {
      message.success('新增成功')
      showAdd.value = false
      fetchUsers()
    } else {
      message.error('新增失败')
    }
  }).catch(e => {
    clearTimeout(timeoutId)
    if (e?.message?.includes('timeout')) {
      message.error('新增用户超时')
    } else {
      message.error('新增失败')
    }
  })
}

function openEdit(row) {
  editForm.value = { ...row }
  showEdit.value = true
  editingUserId = row.id
}

function handleEdit() {
  let timeoutId
  const source = axios.CancelToken.source()
  timeoutId = setTimeout(() => {
    source.cancel('请求超时')
  }, 10000)
  api.put(`/admin/users/${editForm.value.id}`, editForm.value, { cancelToken: source.token }).then(res => {
    clearTimeout(timeoutId)
    if (res && res.message === 'ok') {
      message.success('修改成功')
      showEdit.value = false
      fetchUsers()
    } else {
      message.error('修改失败')
    }
  }).catch(e => {
    clearTimeout(timeoutId)
    if (e?.message?.includes('timeout')) {
      message.error('修改用户超时')
    } else {
      message.error('修改失败')
    }
  })
}

function handleChangePwd() {
  pwdForm.value.password = ''
  showPwd.value = true
}
function handlePwdConfirm() {
  if (!pwdForm.value.password) {
    message.error('请输入新密码')
    return
  }
  let timeoutId
  const source = axios.CancelToken.source()
  timeoutId = setTimeout(() => {
    source.cancel('请求超时')
  }, 10000)
  api.put(`/admin/users/${editingUserId}/password`, { password: pwdForm.value.password }, { cancelToken: source.token }).then(res => {
    clearTimeout(timeoutId)
    if (res && res.message === 'ok') {
      message.success('密码修改成功')
      showPwd.value = false
    } else {
      message.error('密码修改失败')
    }
  }).catch(e => {
    clearTimeout(timeoutId)
    if (e?.message?.includes('timeout')) {
      message.error('修改密码超时')
    } else {
      message.error('密码修改失败')
    }
  })
}

function handleDelete(row) {
  if (row.is_admin) {
    message.error('禁止删除管理员账户')
    return
  }
  dialog.warning({
    title: '确认删除',
    content: `确定要删除用户「${row.username}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      let timeoutId
      try {
        const source = axios.CancelToken.source()
        timeoutId = setTimeout(() => {
          source.cancel('请求超时')
        }, 10000)
        const resp = await api.delete(`/admin/users/${row.id}`, { cancelToken: source.token })
        clearTimeout(timeoutId)
        if (resp && resp.message === 'ok') {
          message.success('删除成功')
          fetchUsers()
        } else if (resp && resp.detail) {
          message.error(resp.detail)
        } else {
          message.error('删除失败')
        }
      } catch (e) {
        clearTimeout(timeoutId)
        if (e?.message?.includes('timeout')) {
          message.error('删除超时')
        } else if (e?.response?.data?.detail) {
          message.error(e.response.data.detail)
        } else {
          message.error('删除失败')
        }
      }
    }
  })
}

onMounted(fetchUsers)
</script>

<style scoped>
.add-title {
  font-size: 22px;
  font-weight: bold;
  color: #42a5f5;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.add-form {
  padding: 8px 0 0 0;
}
.add-input {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(66,165,245,0.08);
  padding: 6px 12px;
}
.add-cancel {
  border-radius: 16px;
  background: #f5f7fa;
  color: #888;
  margin-right: 8px;
}
.add-confirm {
  color: #fff;
  font-weight: bold;
}
.icon-refresh {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: linear-gradient(90deg, #42a5f5 0%, #478ed1 100%);
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M789.333 277.333A384 384 0 1 0 896 512h-85.333A298.667 298.667 0 1 1 512 213.333c70.4 0 135.467 25.6 185.6 68.267l-98.133 98.133H896V128l-106.667 106.667z\"></path></svg>') center/contain no-repeat;
}
</style> 