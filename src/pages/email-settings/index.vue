<template>
  <div class="email-settings">
    <!-- 配置概览卡片 -->
    <n-card title="当前邮箱配置" class="overview-card" style="margin-bottom: 20px;">
      <n-grid :cols="3" :x-gap="16" :y-gap="12">
        <n-gi>
          <div class="config-item">
            <div class="config-label">邮箱服务商</div>
            <div class="config-value">{{ getProviderLabel(formData.email_provider) }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">SMTP服务器</div>
            <div class="config-value">{{ formData.smtp_server || '未配置' }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">SMTP端口</div>
            <div class="config-value">{{ formData.smtp_port || '未配置' }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">邮箱账号</div>
            <div class="config-value">{{ formData.smtp_username || '未配置' }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">发件人邮箱</div>
            <div class="config-value">{{ formData.sender_email || '未配置' }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">发件人名称</div>
            <div class="config-value">{{ formData.sender_name || '未配置' }}</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">订单通知</div>
            <div class="config-value">
              <n-tag :type="formData.order_notification_enabled ? 'success' : 'error'" size="small">
                {{ formData.order_notification_enabled ? '已启用' : '已禁用' }}
              </n-tag>
            </div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">管理员邮箱</div>
            <div class="config-value">
              <n-tag v-if="adminEmails.length > 0" type="info" size="small">
                {{ adminEmails.length }}个邮箱
              </n-tag>
              <n-tag v-else type="warning" size="small">未配置</n-tag>
            </div>
          </div>
        </n-gi>
        <n-gi>
          <div class="config-item">
            <div class="config-label">配置状态</div>
            <div class="config-value">
              <n-tag :type="isConfigComplete ? 'success' : 'warning'" size="small">
                {{ isConfigComplete ? '配置完整' : '配置不完整' }}
              </n-tag>
            </div>
          </div>
        </n-gi>
      </n-grid>
      
      <!-- 管理员邮箱列表预览 -->
      <div v-if="adminEmails.length > 0" style="margin-top: 16px;">
        <div class="config-label" style="margin-bottom: 8px;">管理员邮箱列表：</div>
        <div class="email-preview">
          <n-tag 
            v-for="(email, index) in adminEmails" 
            :key="index" 
            type="info" 
            size="small"
            style="margin-right: 8px; margin-bottom: 4px;"
          >
            {{ email }}
          </n-tag>
        </div>
      </div>
    </n-card>

    <n-card title="邮件设置" class="settings-card">
      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-placement="left"
        label-width="120px"
        require-mark-placement="right-hanging"
      >
        <n-grid :cols="2" :x-gap="24">
          <n-gi>
            <n-form-item label="邮箱服务商" path="email_provider">
              <n-select 
                v-model:value="formData.email_provider" 
                :options="emailProviders" 
                placeholder="选择邮箱服务商"
                @update:value="onEmailProviderChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="SMTP服务器" path="smtp_server">
              <n-input v-model:value="formData.smtp_server" placeholder="例如: smtp.qq.com" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="SMTP端口" path="smtp_port">
              <n-input-number v-model:value="formData.smtp_port" placeholder="例如: 587" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="邮箱账号" path="smtp_username">
              <n-input v-model:value="formData.smtp_username" placeholder="您的邮箱账号" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="邮箱密码" path="smtp_password">
              <n-input
                v-model:value="formData.smtp_password"
                type="password"
                placeholder="邮箱授权码或密码"
                show-password-on="click"
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="发件人邮箱" path="sender_email">
              <n-input v-model:value="formData.sender_email" placeholder="发件人邮箱地址" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="发件人名称" path="sender_name">
              <n-input v-model:value="formData.sender_name" placeholder="发件人显示名称" />
            </n-form-item>
          </n-gi>
        </n-grid>
        
        <n-form-item label="订单通知" path="order_notification_enabled">
          <n-switch v-model:value="formData.order_notification_enabled" />
          <span style="margin-left: 8px; color: #666;">启用新订单邮件通知</span>
        </n-form-item>
        
        <n-form-item label="管理员邮箱">
          <div class="email-list">
            <div v-for="(email, index) in adminEmails" :key="index" class="email-item">
              <n-input v-model:value="adminEmails[index]" placeholder="管理员邮箱" />
              <n-button
                type="error"
                size="small"
                @click="removeEmail(index)"
                style="margin-left: 8px;"
              >
                删除
              </n-button>
            </div>
            <n-button type="primary" size="small" @click="addEmail" style="margin-top: 8px;">
              添加邮箱
            </n-button>
          </div>
        </n-form-item>
        
        <n-form-item>
          <n-space>
            <n-button type="primary" @click="saveSettings" :loading="saving">
              保存设置
            </n-button>
            <n-button @click="testEmail" :loading="testing">
              测试邮件
            </n-button>
            <n-button @click="resetForm">
              重置
            </n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-card>
    
    <!-- 测试邮件弹窗 -->
    <n-modal v-model:show="showTestModal" preset="card" title="发送测试邮件" style="width: 400px;">
      <n-form :model="testForm" label-placement="left" label-width="80px">
        <n-form-item label="测试邮箱">
          <n-input v-model:value="testForm.test_email" placeholder="请输入测试邮箱地址" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showTestModal = false">取消</n-button>
          <n-button type="primary" @click="sendTestEmail" :loading="sendingTest">
            发送测试
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import api from '@/api'

const message = useMessage()

// 表单数据
const formData = reactive({
  email_provider: 'qq',  // 默认QQ邮箱
  smtp_server: 'smtp.qq.com',
  smtp_port: 587,
  smtp_username: '',
  smtp_password: '',
  sender_email: '',
  sender_name: 'HL商城系统',
  order_notification_enabled: true
})

// 管理员邮箱列表
const adminEmails = ref([])

// 表单验证规则
const rules = {
  smtp_server: {
    required: true,
    message: '请输入SMTP服务器地址',
    trigger: 'blur'
  },
  smtp_port: {
    required: true,
    message: '请输入SMTP端口',
    trigger: 'blur'
  },
  smtp_username: {
    required: true,
    message: '请输入邮箱账号',
    trigger: 'blur'
  },
  smtp_password: {
    required: true,
    message: '请输入邮箱密码',
    trigger: 'blur'
  },
  sender_email: {
    required: true,
    message: '请输入发件人邮箱',
    trigger: 'blur'
  }
}

// 状态变量
const saving = ref(false)
const testing = ref(false)
const sendingTest = ref(false)
const showTestModal = ref(false)
const testForm = reactive({
  test_email: ''
})

// 邮箱服务商选项
const emailProviders = [
  { label: 'QQ邮箱', value: 'qq' },
  { label: '163邮箱', value: '163' },
  { label: '126邮箱', value: '126' },
  { label: 'Gmail', value: 'gmail' },
  { label: '阿里企业邮箱', value: 'ali_enterprise' },
  { label: '腾讯企业邮箱', value: 'tencent_enterprise' },
  { label: '网易企业邮箱', value: 'netease_enterprise' },
  { label: '自定义', value: 'custom' }
]

// 邮箱服务商配置
const emailProviderConfigs = {
  qq: {
    smtp_server: 'smtp.qq.com',
    smtp_port: 587,
    description: '需要在QQ邮箱设置中开启SMTP服务并获取授权码'
  },
  '163': {
    smtp_server: 'smtp.163.com',
    smtp_port: 587,
    description: '需要在163邮箱设置中开启SMTP服务并获取授权码'
  },
  '126': {
    smtp_server: 'smtp.126.com',
    smtp_port: 587,
    description: '需要在126邮箱设置中开启SMTP服务并获取授权码'
  },
  gmail: {
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    description: '需要使用应用专用密码，需要开启两步验证'
  },
  ali_enterprise: {
    smtp_server: 'smtp.qiye.aliyun.com',
    smtp_port: 465,
    description: '阿里企业邮箱，使用SSL连接'
  },
  tencent_enterprise: {
    smtp_server: 'smtp.exmail.qq.com',
    smtp_port: 465,
    description: '腾讯企业邮箱，使用SSL连接'
  },
  netease_enterprise: {
    smtp_server: 'smtp.qiye.163.com',
    smtp_port: 465,
    description: '网易企业邮箱，使用SSL连接'
  },
  custom: {
    smtp_server: '',
    smtp_port: 587,
    description: '自定义邮箱服务器配置'
  }
}

// 邮箱服务商切换处理
function onEmailProviderChange(provider) {
  const config = emailProviderConfigs[provider]
  if (config) {
    formData.smtp_server = config.smtp_server
    formData.smtp_port = config.smtp_port
  }
}

// 获取邮箱服务商标签
function getProviderLabel(provider) {
  const providerOption = emailProviders.find(p => p.value === provider)
  return providerOption ? providerOption.label : provider
}

// 检查配置是否完整
const isConfigComplete = computed(() => {
  return formData.smtp_server && 
         formData.smtp_port && 
         formData.smtp_username && 
         formData.smtp_password && 
         formData.sender_email && 
         adminEmails.value.length > 0
})

// 加载设置
async function loadSettings() {
  try {
    const res = await api.get('/admin/email-settings/')
    if (res && res.message === 'ok') {
      Object.assign(formData, res.data)
      
      // 加载管理员邮箱列表
      const emailsRes = await api.get('/admin/email-settings/admin-emails/')
      if (emailsRes && emailsRes.emails) {
        adminEmails.value = emailsRes.emails
      }
    }
  } catch (error) {
    console.error('加载邮件设置失败:', error)
    message.error('加载设置失败')
  }
}

// 保存设置
async function saveSettings() {
  try {
    saving.value = true
    
    // 保存基本设置
    await api.put('/admin/email-settings/', formData)
    
    // 保存管理员邮箱列表
    await api.post('/admin/email-settings/admin-emails/', adminEmails.value)
    
    message.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    message.error('保存设置失败')
  } finally {
    saving.value = false
  }
}

// 测试邮件设置
function testEmail() {
  showTestModal.value = true
}

// 发送测试邮件
async function sendTestEmail() {
  if (!testForm.test_email) {
    message.error('请输入测试邮箱地址')
    return
  }
  
  try {
    sendingTest.value = true
    const res = await api.post('/admin/email-settings/test/', {
      test_email: testForm.test_email
    })
    
    if (res && res.success) {
      message.success('测试邮件发送成功')
      showTestModal.value = false
      testForm.test_email = ''
    } else {
      message.error('测试邮件发送失败')
    }
  } catch (error) {
    console.error('发送测试邮件失败:', error)
    message.error('发送测试邮件失败')
  } finally {
    sendingTest.value = false
  }
}

// 添加邮箱
function addEmail() {
  adminEmails.value.push('')
}

// 删除邮箱
function removeEmail(index) {
  adminEmails.value.splice(index, 1)
}

// 重置表单
function resetForm() {
  Object.assign(formData, {
    smtp_server: 'smtp.qq.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    sender_email: '',
    sender_name: 'HL商城系统',
    order_notification_enabled: true
  })
  adminEmails.value = []
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.email-settings {
  padding: 20px;
}

.overview-card {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  max-width: 800px;
  margin: 0 auto;
}

.config-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.config-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.config-value {
  font-size: 14px;
  color: #212529;
  font-weight: 600;
}

.email-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.email-list {
  width: 100%;
}

.email-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.email-item .n-input {
  flex: 1;
}
</style> 