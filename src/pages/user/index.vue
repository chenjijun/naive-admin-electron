<template>
  <div>
    <n-space>
      <n-button type="primary" @click="showAdd = true">新增用户</n-button>
      <n-button type="success" @click="showBatchAdd = true">批量添加</n-button>
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
        
        <!-- 地址信息 -->
        <n-divider title-placement="left">收货地址（可选）</n-divider>
        <n-form-item label="收货人">
          <n-input v-model:value="addForm.address.receiver_name" class="add-input" placeholder="收货人姓名" />
        </n-form-item>
        <n-form-item label="收货电话">
          <n-input v-model:value="addForm.address.phone" class="add-input" placeholder="收货人电话" />
        </n-form-item>
        <n-row :gutter="12">
          <n-col :span="8">
            <n-form-item label="省份">
              <n-input v-model:value="addForm.address.province" class="add-input" placeholder="省份" />
            </n-form-item>
          </n-col>
          <n-col :span="8">
            <n-form-item label="城市">
              <n-input v-model:value="addForm.address.city" class="add-input" placeholder="城市" />
            </n-form-item>
          </n-col>
          <n-col :span="8">
            <n-form-item label="区县">
              <n-input v-model:value="addForm.address.district" class="add-input" placeholder="区县" />
            </n-form-item>
          </n-col>
        </n-row>
        <n-form-item label="详细地址">
          <n-input v-model:value="addForm.address.detail_address" class="add-input" placeholder="详细地址" />
        </n-form-item>
        <n-form-item>
          <n-checkbox v-model:checked="addForm.address.is_default">设为默认地址</n-checkbox>
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
    
    <!-- 查看用户详情弹窗 -->
    <n-modal v-model:show="showViewDetail" preset="card" style="border-radius: 24px; width: 80%; box-shadow: 0 8px 32px rgba(24,160,255,0.18); overflow: hidden;">
      <template #header>
        <div class="add-title">用户详细信息</div>
      </template>
      <div class="user-detail-content" v-if="selectedUser">
        <n-space vertical size="large">
          <!-- 用户基本信息 -->
          <n-card title="基本信息" size="small">
            <n-descriptions :column="2" bordered>
              <n-descriptions-item label="用户ID">{{ selectedUser.id }}</n-descriptions-item>
              <n-descriptions-item label="用户名">{{ selectedUser.username }}</n-descriptions-item>
              <n-descriptions-item label="昵称">{{ selectedUser.nickname }}</n-descriptions-item>
              <n-descriptions-item label="邮箱">{{ selectedUser.email }}</n-descriptions-item>
              <n-descriptions-item label="手机号">{{ selectedUser.phone }}</n-descriptions-item>
              <n-descriptions-item label="状态">
                <n-tag :type="selectedUser.is_active ? 'success' : 'error'">
                  {{ selectedUser.is_active ? '启用' : '禁用' }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="管理员">
                <n-tag :type="selectedUser.is_admin ? 'warning' : 'default'">
                  {{ selectedUser.is_admin ? '是' : '否' }}
                </n-tag>
              </n-descriptions-item>
              <n-descriptions-item label="创建时间">{{ formatDate(selectedUser.created_at) }}</n-descriptions-item>
              <n-descriptions-item label="最后登录">{{ formatDate(selectedUser.last_login_at) }}</n-descriptions-item>
            </n-descriptions>
          </n-card>
          
          <!-- 用户地址信息 -->
          <n-card title="地址信息" size="small">
            <div v-if="userAddresses.length > 0">
              <div v-for="(address, index) in userAddresses" :key="index" class="address-item">
                <n-space vertical size="small">
                  <div class="address-header">
                    <n-tag :type="address.is_default ? 'success' : 'default'" size="small">
                      {{ address.is_default ? '默认地址' : '地址' + (index + 1) }}
                    </n-tag>
                  </div>
                  <div class="address-content">
                    <div><strong>收货人：</strong>{{ address.receiver_name }}</div>
                    <div><strong>电话：</strong>{{ address.phone }}</div>
                    <div><strong>地址：</strong>{{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail_address }}</div>
                  </div>
                </n-space>
              </div>
            </div>
            <n-empty v-else description="暂无地址信息" />
          </n-card>
          
          <!-- 订单统计信息 -->
          <n-card title="订单统计" size="small">
            <n-grid :cols="6" :x-gap="12">
              <n-grid-item>
                <n-statistic label="未确认订单" :value="orderStats.pending" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="已确认订单" :value="orderStats.confirmed" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="已发货订单" :value="orderStats.shipped" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="已送达订单" :value="orderStats.delivered" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="已取消订单" :value="orderStats.cancelled" />
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="总订单数" :value="orderStats.total" />
              </n-grid-item>
            </n-grid>
          </n-card>
          
          <!-- 订单金额统计 -->
          <n-card title="订单金额统计" size="small">
            <n-grid :cols="3" :x-gap="12">
              <n-grid-item>
                <n-statistic 
                  label="总下单金额" 
                  :value="orderStats.totalAmount" 
                  :precision="2"
                  suffix="元"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic 
                  label="平均订单金额" 
                  :value="orderStats.averageAmount" 
                  :precision="2"
                  suffix="元"
                />
              </n-grid-item>
              <n-grid-item>
                <n-statistic 
                  label="最大订单金额" 
                  :value="orderStats.maxAmount" 
                  :precision="2"
                  suffix="元"
                />
              </n-grid-item>
            </n-grid>
          </n-card>
        </n-space>
      </div>
      <template #action>
        <n-space justify="end">
          <n-button @click="showViewDetail = false" class="add-cancel">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
    
    <!-- 批量添加用户弹窗 -->
    <n-modal v-model:show="showBatchAdd" preset="card" style="border-radius: 24px; width: 70%; box-shadow: 0 8px 32px rgba(24,160,255,0.18); overflow: hidden;">
      <template #header>
        <div class="add-title">批量添加用户</div>
      </template>
      <div class="batch-add-content">
        <n-space vertical size="large">
          <!-- 方式选择 -->
          <n-card title="选择添加方式" size="small">
            <n-radio-group v-model:value="batchAddMethod" name="batchAddMethod" @update:value="onBatchMethodChange">
              <n-space>
                <n-radio value="manual">手动输入</n-radio>
                <n-radio value="excel">Excel导入</n-radio>
                <n-radio value="text">文本批量输入</n-radio>
              </n-space>
            </n-radio-group>
          </n-card>
          
          <!-- 手动输入方式 -->
          <n-card v-if="batchAddMethod === 'manual'" title="手动输入用户信息" size="small">
            <n-space vertical size="medium">
              <div v-for="(user, index) in batchUsers" :key="index" class="batch-user-row">
                <!-- 基本信息 -->
                <n-space vertical size="small">
                  <n-space align="center" :wrap="false">
                    <n-input v-model:value="user.username" placeholder="用户名" class="batch-input" />
                    <n-input v-model:value="user.email" placeholder="邮箱" class="batch-input" />
                    <n-input v-model:value="user.password" placeholder="密码" type="password" class="batch-input" />
                    <n-input v-model:value="user.nickname" placeholder="昵称" class="batch-input" />
                    <n-input v-model:value="user.phone" placeholder="手机号" class="batch-input" />
                    <n-button 
                      type="error" 
                      size="small" 
                      @click="removeBatchUser(index)"
                      :disabled="batchUsers.length <= 1"
                    >
                      删除
                    </n-button>
                  </n-space>
                  
                  <!-- 地址信息 -->
                  <n-divider title-placement="left" size="small">收货地址（可选）</n-divider>
                  <n-space vertical size="small">
                    <n-row :gutter="8">
                      <n-col :span="6">
                        <n-input v-model:value="user.address.receiver_name" placeholder="收货人" size="small" />
                      </n-col>
                      <n-col :span="6">
                        <n-input v-model:value="user.address.phone" placeholder="收货电话" size="small" />
                      </n-col>
                      <n-col :span="4">
                        <n-input v-model:value="user.address.province" placeholder="省份" size="small" />
                      </n-col>
                      <n-col :span="4">
                        <n-input v-model:value="user.address.city" placeholder="城市" size="small" />
                      </n-col>
                      <n-col :span="4">
                        <n-input v-model:value="user.address.district" placeholder="区县" size="small" />
                      </n-col>
                    </n-row>
                    <n-input v-model:value="user.address.detail_address" placeholder="详细地址" size="small" />
                    <n-checkbox v-model:checked="user.address.is_default" size="small">设为默认地址</n-checkbox>
                  </n-space>
                </n-space>
              </div>
                            <n-button type="dashed" @click="addBatchUser" class="add-user-btn">
                + 添加用户行
              </n-button>
            </n-space>
          </n-card>
          
          <!-- Excel导入方式 -->
          <n-card v-if="batchAddMethod === 'excel'" title="Excel导入" size="small">
            <n-space vertical size="medium">
              <n-upload
                accept=".xlsx,.xls"
                :max="1"
                :show-file-list="false"
                @change="handleExcelUpload"
              >
                <n-button type="primary">选择Excel文件</n-button>
              </n-upload>
              <n-text depth="3" size="small">
                支持格式：用户名、邮箱、密码、昵称、手机号、收货人、收货电话、省份、城市、区县、详细地址（密码为空时将使用默认密码：123456）
              </n-text>
              <n-button type="info" @click="downloadTemplate" size="small">下载模板</n-button>
            </n-space>
          </n-card>
          
          <!-- 文本批量输入方式 -->
          <n-card v-if="batchAddMethod === 'text'" title="文本批量输入" size="small">
            <n-space vertical size="medium">
              <n-input
                v-model:value="batchTextInput"
                type="textarea"
                placeholder="请输入用户信息，每行一个用户，格式：用户名,邮箱,密码,昵称,手机号"
                :rows="8"
                class="batch-textarea"
              />
              <n-text depth="3" size="small">
                格式说明：每行一个用户，字段用逗号分隔，顺序：用户名,邮箱,密码,昵称,手机号,收货人,收货电话,省份,城市,区县,详细地址
                <br>示例：user1,user1@example.com,123456,用户1,13800138001,张三,13800138001,广东省,深圳市,南山区,科技园路123号
              </n-text>
            </n-space>
          </n-card>
          
          <!-- 预览区域 -->
          <n-card v-if="batchUsers.length > 0" title="用户预览" size="small">
            <n-data-table
              :columns="previewColumns"
              :data="batchUsers"
              :pagination="{ pageSize: 5 }"
              size="small"
            />
          </n-card>
        </n-space>
      </div>
      <template #action>
        <n-space justify="end">
          <n-button @click="showBatchAdd = false" class="add-cancel">取消</n-button>
          <n-button type="primary" @click="handleBatchAdd" class="add-confirm" :loading="batchAddLoading" style="background: linear-gradient(90deg, #42a5f5 0%, #478ed1 100%); border-radius: 18px; box-shadow: 0 2px 8px rgba(66,165,245,0.12);">
            {{ batchAddLoading ? '添加中...' : '批量添加' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup name="User">
import { ref, onMounted, h } from 'vue'
import { NButton, useMessage, useDialog, NDropdown, NCard, NSpace, NRadioGroup, NRadio, NInput, NUpload, NText, NDataTable, NForm, NFormItem, NSwitch, NModal, NDescriptions, NDescriptionsItem, NTag, NGrid, NGridItem, NStatistic, NEmpty, NDivider, NRow, NCol, NCheckbox } from 'naive-ui'
import api from '@/api'
import axios from 'axios'
import * as XLSX from 'xlsx'
const message = useMessage()
const dialog = useDialog()
const users = ref([])
const showAdd = ref(false)
const showEdit = ref(false)
const refreshLoading = ref(false)
const addForm = ref({ 
  username: '', 
  email: '', 
  password: '', 
  nickname: '', 
  phone: '',
  address: {
    receiver_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    is_default: true
  }
})
const editForm = ref({ id: null, username: '', email: '', nickname: '', phone: '', is_active: true })
const showPwd = ref(false)
const pwdForm = ref({ password: '' })
let editingUserId = null

// 批量添加相关
const showBatchAdd = ref(false)
const batchAddMethod = ref('manual')
const batchUsers = ref([{ 
  username: '', 
  email: '', 
  password: '', 
  nickname: '', 
  phone: '',
  address: {
    receiver_name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail_address: '',
    is_default: true
  }
}])
const batchTextInput = ref('')
const batchAddLoading = ref(false)

// 查看用户详情相关
const showViewDetail = ref(false)
const selectedUser = ref(null)
const userAddresses = ref([])
const orderStats = ref({
  pending: 0,
  confirmed: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
  total: 0,
  totalAmount: 0,
  averageAmount: 0,
  maxAmount: 0
})

// 预览表格列定义
const previewColumns = [
  { title: '用户名', key: 'username' },
  { title: '邮箱', key: 'email' },
  { title: '密码', key: 'password', render: () => '***' },
  { title: '昵称', key: 'nickname' },
  { title: '手机号', key: 'phone' },
  { title: '收货人', key: 'address.receiver_name' },
  { title: '收货电话', key: 'address.phone' },
  { title: '地址', key: 'address', render: (row) => {
    if (row.address && row.address.province) {
      return `${row.address.province} ${row.address.city} ${row.address.district} ${row.address.detail_address}`
    }
    return '-'
  }}
]

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
      const options = [
        {
          label: '查看详情',
          key: 'view',
          icon: () => h('i', { class: 'icon-view' }),
          disabled: false
        },
        {
          label: '编辑用户',
          key: 'edit',
          icon: () => h('i', { class: 'icon-edit' }),
          disabled: false
        },
        {
          label: '修改密码',
          key: 'password',
          icon: () => h('i', { class: 'icon-password' }),
          disabled: false
        },
        {
          label: '删除用户',
          key: 'delete',
          icon: () => h('i', { class: 'icon-delete' }),
          disabled: row.is_admin
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
  
  // 准备用户数据
  const userData = { 
    ...addForm.value, 
    is_admin: false 
  }
  
  // 如果地址信息完整，则包含地址
  if (addForm.value.address.receiver_name && 
      addForm.value.address.phone && 
      addForm.value.address.province && 
      addForm.value.address.city && 
      addForm.value.address.district && 
      addForm.value.address.detail_address) {
    userData.address = addForm.value.address
  }
  
  api.post('/admin/users', userData, { cancelToken: source.token }).then(res => {
    clearTimeout(timeoutId)
    if (res && res.message === 'ok') {
      message.success('新增成功')
      showAdd.value = false
      fetchUsers()
      
      // 重置表单
      addForm.value = {
        username: '',
        email: '',
        password: '',
        nickname: '',
        phone: '',
        address: {
          receiver_name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail_address: '',
          is_default: true
        }
      }
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

// 处理操作下拉选项选择
function handleActionSelect(key, row) {
  switch (key) {
    case 'view':
      viewUserDetail(row)
      break
    case 'edit':
      openEdit(row)
      break
    case 'password':
      editingUserId = row.id
      handleChangePwd()
      break
    case 'delete':
      handleDelete(row)
      break
  }
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

// 批量添加相关方法
function addBatchUser() {
  batchUsers.value.push({ 
    username: '', 
    email: '', 
    password: '', 
    nickname: '', 
    phone: '',
    address: {
      receiver_name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail_address: '',
      is_default: true
    }
  })
}

function removeBatchUser(index) {
  if (batchUsers.value.length > 1) {
    batchUsers.value.splice(index, 1)
  }
}

function handleExcelUpload(options) {
  const file = options.file
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      // 跳过表头
      const users = jsonData.slice(1).map(row => ({
        username: row[0] || '',
        email: row[1] || '',
        password: row[2] || '123456',
        nickname: row[3] || '',
        phone: row[4] || '',
        address: {
          receiver_name: row[5] || '',
          phone: row[6] || '',
          province: row[7] || '',
          city: row[8] || '',
          district: row[9] || '',
          detail_address: row[10] || '',
          is_default: true
        }
      })).filter(user => user.username && user.email) // 过滤空行
      
      batchUsers.value = users
      message.success(`成功解析 ${users.length} 个用户`)
    } catch (error) {
      message.error('Excel文件解析失败')
      console.error(error)
    }
  }
  reader.readAsArrayBuffer(file.file)
}

function downloadTemplate() {
  const templateData = [
    ['用户名', '邮箱', '密码', '昵称', '手机号', '收货人', '收货电话', '省份', '城市', '区县', '详细地址'],
    ['user1', 'user1@example.com', '123456', '用户1', '13800138001', '张三', '13800138001', '广东省', '深圳市', '南山区', '科技园路123号'],
    ['user2', 'user2@example.com', '123456', '用户2', '13800138002', '李四', '13800138002', '北京市', '北京市', '朝阳区', '建国路456号']
  ]
  
  const ws = XLSX.utils.aoa_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户模板')
  XLSX.writeFile(wb, '用户批量添加模板.xlsx')
}

function parseTextInput() {
  if (!batchTextInput.value.trim()) return []
  
  const lines = batchTextInput.value.trim().split('\n')
  return lines.map(line => {
    const parts = line.split(',').map(part => part.trim())
    return {
      username: parts[0] || '',
      email: parts[1] || '',
      password: parts[2] || '123456',
      nickname: parts[3] || '',
      phone: parts[4] || '',
      address: {
        receiver_name: parts[5] || '',
        phone: parts[6] || '',
        province: parts[7] || '',
        city: parts[8] || '',
        district: parts[9] || '',
        detail_address: parts[10] || '',
        is_default: true
      }
    }
  }).filter(user => user.username && user.email)
}

async function handleBatchAdd() {
  let usersToAdd = []
  
  // 根据选择的方式获取用户数据
  switch (batchAddMethod.value) {
    case 'manual':
      usersToAdd = batchUsers.value.filter(user => user.username && user.email)
      break
    case 'excel':
      usersToAdd = batchUsers.value
      break
    case 'text':
      usersToAdd = parseTextInput()
      break
  }
  
  if (usersToAdd.length === 0) {
    message.error('请至少添加一个有效用户')
    return
  }
  
  // 验证数据
  for (const user of usersToAdd) {
    if (!user.username || !user.email) {
      message.error('用户名和邮箱不能为空')
      return
    }
    if (!user.password) {
      user.password = '123456' // 默认密码
    }
  }
  
  // 检查用户名是否重复（在要添加的用户中）
  const usernames = usersToAdd.map(u => u.username)
  const duplicateUsernames = usernames.filter((username, index) => usernames.indexOf(username) !== index)
  if (duplicateUsernames.length > 0) {
    const uniqueDuplicates = [...new Set(duplicateUsernames)]
    message.error(`发现重复的用户名：${uniqueDuplicates.join(', ')}`)
    return
  }
  
  // 检查用户名是否与现有用户重复
  try {
    const existingUsernames = users.value.map(u => u.username)
    const conflictingUsernames = usernames.filter(username => existingUsernames.includes(username))
    if (conflictingUsernames.length > 0) {
      const uniqueConflicts = [...new Set(conflictingUsernames)]
      const confirmResult = await new Promise((resolve) => {
        dialog.warning({
          title: '发现重复用户名',
          content: `以下用户名已存在于系统中：\n\n${uniqueConflicts.join('\n')}\n\n是否继续添加其他用户？`,
          positiveText: '继续添加',
          negativeText: '取消',
          onPositiveClick: () => resolve(true),
          onNegativeClick: () => resolve(false)
        })
      })
      
      if (!confirmResult) {
        return
      }
      
      // 过滤掉重复的用户名
      usersToAdd = usersToAdd.filter(user => !conflictingUsernames.includes(user.username))
      
      if (usersToAdd.length === 0) {
        message.error('没有可添加的用户')
        return
      }
      
      message.info(`将跳过 ${conflictingUsernames.length} 个重复用户名，继续添加 ${usersToAdd.length} 个用户`)
    }
  } catch (error) {
    console.error('检查用户名重复时出错:', error)
    // 如果检查失败，继续执行，让后端处理
  }
  
  batchAddLoading.value = true
  let successCount = 0
  let failCount = 0
  let errorDetails = []
  
  try {
            // 逐个添加用户
        for (const user of usersToAdd) {
          try {
            // 准备用户数据
            const userData = { 
              ...user, 
              is_admin: false 
            }
            
            // 如果地址信息完整，则包含地址
            if (user.address && 
                user.address.receiver_name && 
                user.address.phone && 
                user.address.province && 
                user.address.city && 
                user.address.district && 
                user.address.detail_address) {
              userData.address = user.address
            }
            
            const res = await api.post('/admin/users', userData)
            if (res && res.message === 'ok') {
              successCount++
            } else {
              failCount++
              // 记录失败原因
              const errorMsg = res?.detail || res?.message || '未知错误'
              errorDetails.push(`用户"${user.username}": ${errorMsg}`)
            }
          } catch (error) {
            failCount++
            // 解析错误信息
            let errorMsg = '未知错误'
            if (error?.response?.data?.detail) {
              errorMsg = error.response.data.detail
            } else if (error?.response?.data?.message) {
              errorMsg = error.response.data.message
            } else if (error?.message) {
              errorMsg = error.message
            }
            
            // 美化错误信息显示
            let displayError = errorMsg
            if (errorMsg.includes('already exists') || errorMsg.includes('已存在') || errorMsg.includes('重复')) {
              displayError = '用户名已存在'
            } else if (errorMsg.includes('invalid') || errorMsg.includes('无效') || errorMsg.includes('格式')) {
              displayError = '数据格式无效'
            } else if (errorMsg.includes('required') || errorMsg.includes('必需') || errorMsg.includes('不能为空')) {
              displayError = '必填字段缺失'
            }
            
            errorDetails.push(`用户"${user.username}": ${displayError}`)
            console.error('添加用户失败:', error)
          }
        }
    
    if (successCount > 0) {
      let resultMessage = `批量添加完成！成功：${successCount} 个`
      if (failCount > 0) {
        resultMessage += `，失败：${failCount} 个`
                  // 显示详细的错误信息
          if (errorDetails.length > 0) {
            const errorText = errorDetails.join('\n')
            message.success(resultMessage)
            // 使用对话框显示详细错误信息
            dialog.warning({
              title: '部分用户添加失败',
              content: `✅ 成功添加 ${successCount} 个用户\n❌ ${failCount} 个用户添加失败：\n\n${errorText}`,
              positiveText: '确定',
              negativeText: '关闭',
              onPositiveClick: () => {
                showBatchAdd.value = false
                fetchUsers() // 刷新用户列表
              }
            })
            return
          }
      } else {
        message.success(resultMessage)
      }
      
      showBatchAdd.value = false
      fetchUsers() // 刷新用户列表
      
      // 重置表单
      batchUsers.value = [{ 
        username: '', 
        email: '', 
        password: '', 
        nickname: '', 
        phone: '',
        address: {
          receiver_name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail_address: '',
          is_default: true
        }
      }]
      batchTextInput.value = ''
    } else {
      // 全部失败时显示详细错误信息
      if (errorDetails.length > 0) {
        const errorText = errorDetails.join('\n')
        dialog.error({
          title: '批量添加失败',
          content: `❌ 所有用户添加失败：\n\n${errorText}`,
          positiveText: '确定',
          negativeText: '关闭'
        })
      } else {
        message.error('批量添加失败，请检查数据格式')
      }
    }
  } catch (error) {
    message.error('批量添加过程中发生错误')
    console.error(error)
  } finally {
    batchAddLoading.value = false
  }
}

// 监听批量添加方式变化
function onBatchMethodChange() {
  // 重置数据
  batchUsers.value = [{ 
    username: '', 
    email: '', 
    password: '', 
    nickname: '', 
    phone: '',
    address: {
      receiver_name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail_address: '',
      is_default: true
    }
  }]
  batchTextInput.value = ''
}

// 查看用户详情
async function viewUserDetail(user) {
  selectedUser.value = user
  showViewDetail.value = true
  
  try {
    // 获取用户地址信息
    const addressRes = await api.get(`/admin/users/${user.id}/addresses`)
    if (addressRes && addressRes.message === 'ok') {
      userAddresses.value = addressRes.data || []
    } else {
      userAddresses.value = []
    }
    
    // 获取用户订单统计信息
    const orderRes = await api.get(`/admin/users/${user.id}/order-stats`)
    if (orderRes && orderRes.message === 'ok') {
      orderStats.value = orderRes.data || {
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: 0,
        totalAmount: 0,
        averageAmount: 0,
        maxAmount: 0
      }
    } else {
      // 重置统计数据
      orderStats.value = {
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        total: 0,
        totalAmount: 0,
        averageAmount: 0,
        maxAmount: 0
      }
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    message.error('获取用户详情失败')
    userAddresses.value = []
    orderStats.value = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
      totalAmount: 0,
      averageAmount: 0,
      maxAmount: 0
    }
  }
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

.icon-edit {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #1890ff;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9c3.9-3.9 3.9-10.2 0-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2c-1.9 11.1 1.5 21.9 9.4 29.8 6.6 6.4 14.9 9.9 23.8 9.9z\"></path></svg>') center/contain no-repeat;
}

.icon-password {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #52c41a;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM540 701v53c0 4.4-3.6 8-8 8h-40c-4.4 0-8-3.6-8-8v-53c-12.1-8.7-20-22.9-20-39 0-26.5 21.5-48 48-48s48 21.5 48 48c0 16.1-7.9 30.3-20 39zM360 240c0-35.3 28.7-64 64-64h136c35.3 0 64 28.7 64 64v224H360V240z\"></path></svg>') center/contain no-repeat;
}

.icon-delete {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #ff4d4f;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h8v8c0 4.4-3.6 8-8 8H360c-4.4 0-8-3.6-8-8v-8zm504 56H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60l12.3 123.4c1.6 16.2 15.6 28.6 31.8 28.6h451.8c16.2 0 30.2-12.4 31.8-28.6L892 304h60c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-256h487l-24.2 256z\"></path></svg>') center/contain no-repeat;
}

.icon-view {
  display: inline-block;
  width: 1em;
  height: 1em;
  background: #1890ff;
  -webkit-mask: url('data:image/svg+xml;utf8,<svg fill=\"white\" viewBox=\"0 0 1024 1024\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M396.8 512c0 63.6 51.6 115.2 115.2 115.2s115.2-51.6 115.2-115.2S575.6 396.8 512 396.8 396.8 448.4 396.8 512z\"></path><path d=\"M512 128c-204.8 0-384 153.6-384 384s179.2 384 384 384 384-179.2 384-384-179.2-384-384-384z\"></path></svg>') center/contain no-repeat;
}

/* 批量添加相关样式 */
.batch-add-content {
  max-height: 70vh;
  overflow-y: auto;
}

.batch-user-row {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  margin-bottom: 8px;
}

.batch-input {
  min-width: 120px;
}

.add-user-btn {
  width: 100%;
  border: 2px dashed #d9d9d9;
  color: #666;
  background: #fafafa;
}

.add-user-btn:hover {
  border-color: #42a5f5;
  color: #42a5f5;
  background: #f0f8ff;
}

.batch-textarea {
  border-radius: 8px;
}

.batch-textarea :deep(.n-input__textarea-el),
.batch-textarea :deep(.n-input__textarea) {
  border-radius: 8px;
}

/* 用户详情相关样式 */
.user-detail-content {
  max-height: 70vh;
  overflow-y: auto;
}

.address-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: #fafafa;
  margin-bottom: 12px;
}

.address-header {
  margin-bottom: 8px;
}

.address-content {
  font-size: 14px;
  line-height: 1.6;
}

.address-content div {
  margin-bottom: 4px;
}

.address-content strong {
  color: #333;
  margin-right: 8px;
}
</style> 