<template>
  <n-layout has-sider style="min-height: 100vh; background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%);">
    <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="200" v-model:collapsed="collapsed" style="height: auto;min-height: 100vh; background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%); border-radius: 22px 0 0 22px; box-shadow: 2px 0 24px 0 rgba(255,94,98,0.10); border-right: none;">
      <div class="logo-modern">
        <img src="/Hanlian.png" alt="logo" class="logo-img-modern" />
      </div>
      <n-menu :options="menuOptions" :value="selectedKey" @update:value="onMenuClick" style="background-color: #fff7f0; border-radius: 18px; margin: 18px 10px 10px 10px; box-shadow: none;" :collapsed="collapsed" />
    </n-layout-sider>
   
    <n-layout style="background: transparent; height: auto;">
      <n-layout-header bordered style="width: auto;height:68px;display:flex;margin: 18px 18px 0 18px;background: #fff7f0; border-radius: 22px; align-items:center;justify-content:space-between; padding:0 36px; box-shadow: 0 2px 12px 0 rgba(255,94,98,0.10);">
        <div style="font-size:22px;font-weight:700;letter-spacing:1px;color:#ff5e62;">HL ADMIN 后台</div>
        <div style="display:flex;align-items:center;gap:18px;">
          <img src="/HLLOGO2.png" style="width:48px;height:48px;border-radius:50%;object-fit:cover;box-shadow:0 2px 8px 0 rgba(255,94,98,0.15);border:2px solid #fff7f0;" alt="avatar" />
          <n-dropdown :options="dropdownOptions" @select="onDropdown">
            <n-button quaternary style="font-weight:600;color:#ff5e62;">管理员</n-button>
          </n-dropdown>
        </div>
      </n-layout-header>
      <n-layout-content style="border-radius: 22px; margin: 18px;">
        <div style="padding:18px 14px; background:#fff; min-height:360px; border-radius:18px; box-shadow:0 2px 12px 0 rgba(255,94,98,0.08);">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const collapsed = ref(false)
const router = useRouter()
const route = useRoute()
const selectedKey = computed(() => route.name)
const menuOptions = [
  { label: '销售看板', key: 'Dashboard' },
  { label: '商品管理', key: 'Product' },
  { label: '分类管理', key: 'Category' },
  { label: '活动商品管理', key: 'ActivityProduct' },
  { label: '订单管理', key: 'Order' },
  { label: '购物车管理', key: 'Cart' },
  { label: '用户管理', key: 'User' },
  { label: '地址管理', key: 'Address' },
  {
    label: '系统设置',
    key: 'SystemSettings',
    children: [
      { label: '邮件设置', key: 'EmailSettings' },
      { label: '公司图片管理', key: 'CompanyImage' },
      { label: '联系客服管理', key: 'ContactService' },
      { label: '关于我们管理', key: 'AboutUs' },
      { label: '留言管理', key: 'Message' }
    ]
  },
  {
    label: '日志管理',
    key: 'Logs',
  }
]
function onMenuClick(key) {
  if (key === 'Dashboard') router.push('/')
  else if (key === 'ActivityProduct') router.push('/activity-product')
  else if (key === 'CompanyImage') router.push('/company-image')
  else if (key === 'ContactService') router.push('/contact-service')
  else if (key === 'AboutUs') router.push('/about-us')
  else if (key === 'Message') router.push('/message')
  else if (key === 'EmailSettings') router.push('/email-settings')
  else router.push('/' + key.toLowerCase())
}
const dropdownOptions = [
  { label: '退出登录', key: 'logout' }
]
function onDropdown(key) {
  if (key === 'logout') {
    localStorage.clear()
    router.replace('/login')
  }
}
</script>

<style scoped>
.logo-modern {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 18px 18px 8px 18px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 2px 12px 0 rgba(255,94,98,0.10);
}
.logo-img-modern {
  height: 100%;
  width: 100%;
  border-radius: 28px;
  object-fit: fill;
  box-shadow: 0 2px 8px 0 rgba(255,94,98,0.10);
}

:deep(.n-menu .n-menu-item) {
  border-radius: 12px !important;
  margin: 5px 0;
  transition: background 0.2s;
}
:deep(.n-menu .n-menu-item:hover),
:deep(.n-menu .n-menu-item.n-menu-item--selected) {
  background: linear-gradient(90deg, #ffecd2 0%, #ff5e62 100%) !important;
  color: #ff5e62 !important;
}
</style> 