<template>
  <div class="login-bg-modern">
    <div class="login-card-flex-modern">
      <div class="login-card-left-modern">
        <div class="login-title-modern">HL ADMIN 登录</div>
        <n-form :model="form" class="login-form-modern" @submit.prevent="onLogin">
          <n-form-item>
            <n-input v-model:value="form.username" placeholder="用户名" class="login-input-modern" />
          </n-form-item>
          <n-form-item>
            <n-input v-model:value="form.password" type="password" placeholder="密码" class="login-input-modern" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" block @click="onLogin" :loading="loading" class="login-btn-modern">登 录</n-button>
          </n-form-item>
        </n-form>
        <div class="login-bottom-tip-modern">
          没有账号？<a class="register-link-modern" href="#">注册</a>
        </div>
      </div>
      <div class="login-card-right-modern">
        <img class="login-illustration-modern" src="/Hanlian.png" alt="login-illustration" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useMessage } from 'naive-ui'
import { BASE_URL } from '@/api/baseUrl'
const router = useRouter()
const message = useMessage()
const form = ref({ username: '', password: '' })
const loading = ref(false)
async function onLogin() {
  if (!form.value.username || !form.value.password) return
  loading.value = true
  try {
    const res = await axios.post(BASE_URL + '/auth/admin_login', form.value)
    console.log(res)
    const token = res.data?.data?.access_token
    if (token) {
      localStorage.setItem('token', token)
      router.push('/dashboard')
    } else {
      message.error('登录失败')
    }
  } catch (e) {
    message.error(e?.response?.data?.detail || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg-modern {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #ff5e62 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card-flex-modern {
  display: flex;
  background: #fff7f0;
  border-radius: 32px;
  box-shadow: 0 8px 32px rgba(255,94,98,0.12);
  overflow: hidden;
  min-width: 900px;
  min-height: 480px;
}
.login-card-left-modern {
  flex: 1;
  padding: 56px 56px 32px 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ffecd2 0%, #ff5e62 100%);
  border-radius: 32px 0 0 32px;
}
.login-title-modern {
  font-size: 38px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%);
  border-radius: 22px 22px 0 0;
  margin-bottom: 32px;
  padding: 24px 0 16px 0;
  width: 100%;
  text-align: center;
  letter-spacing: 2px;
  box-shadow: 0 2px 8px 0 rgba(255,94,98,0.10);
}
.login-form-modern {
  width: 340px;
  margin: 0 auto;
}
.login-input-modern {
  border-radius: 32px;
  background: #fff;
  height: 48px;
  font-size: 18px;
  padding-left: 24px;
  border: none;
  box-shadow: 0 2px 8px 0 rgba(255,94,98,0.06);
  align-items: center;
}
.login-btn-modern {
  border-radius: 32px;
  height: 48px;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(255,94,98,0.10);
  border: none;
  transition: background 0.2s, color 0.2s;
}
.login-btn-modern:active, .login-btn-modern:hover {
  background: linear-gradient(90deg, #ff5e62 0%, #ff9966 100%) !important;
  color: #fff !important;
}
.login-bottom-tip-modern {
  margin-top: 32px;
  color: #ff5e62;
  text-align: center;
  font-size: 16px;
}
.register-link-modern {
  color: #ff5e62;
  text-decoration: underline;
  margin-left: 4px;
}
.login-card-right-modern {
  flex: 1;
  background: #fff7f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 32px 32px 0;
}
.login-illustration-modern {
  width: 340px;
  height: 340px;
  object-fit: contain;
  border-radius: 32px;
  box-shadow: 0 2px 12px 0 rgba(255,94,98,0.10);
}
@media (max-width: 900px) {
  .login-card-flex-modern {
    flex-direction: column;
    min-width: 340px;
    min-height: 600px;
  }
  .login-card-right-modern {
    display: none;
  }
}
</style> 