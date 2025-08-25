<template>
  <n-layout has-sider>
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <!-- Logo -->
      <div class="logo-container">
        <img src="/Hanlian.png" alt="Logo" class="logo" />
        <span v-if="!collapsed" class="logo-text">管理系统</span>
      </div>

      <!-- 菜单 -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuClick"
      />
    </n-layout-sider>

    <!-- 主内容区 -->
    <n-layout>
      <!-- 顶部导航栏 -->
      <n-layout-header bordered class="header">
        <div class="header-left">
          <n-button
            quaternary
            circle
            @click="collapsed = !collapsed"
          >
            <template #icon>
              <n-icon size="20">
                <Menu />
              </n-icon>
            </template>
          </n-button>
        </div>
        
        <div class="header-right">
          <n-dropdown :options="userOptions" @select="handleUserAction">
            <n-button quaternary>
              <template #icon>
                <n-icon><Person /></n-icon>
              </template>
              管理员
              <template #suffix>
                <n-icon><ChevronDown /></n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </div>
      </n-layout-header>

      <!-- 页面内容 -->
      <n-layout-content class="content">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Menu, 
  Person, 
  ChevronDown,
  Home,
  People,
  Cube,
  Grid,
  Location,
  Image,
  DocumentText,
  Chatbubble,
  Mail,
  Flash,
  Settings,
  Archive
} from '@vicons/ionicons5'
import { renderIcon } from '@/utils/renderIcon'

const collapsed = ref(false)
const router = useRouter()
const route = useRoute()

// 当前激活的菜单项
const activeKey = computed(() => route.name)

// 菜单配置
const menuOptions = [
  {
    label: '仪表盘',
    key: 'Dashboard',
    icon: renderIcon(Home)
  },
  
  {
    label: '商品管理',
    key: 'Products',
    icon: renderIcon(Cube)
  },
  {
    label: '分类管理',
    key: 'Categories',
    icon: renderIcon(Grid)
  },
  {
    label: '订单管理',
    key: 'Orders',
    icon: renderIcon(Home)
  },
  {
    label: '购物车管理',
    key: 'Cart',
    icon: renderIcon(Home)
  },
  {
    label: '用户管理',
    key: 'Users',
    icon: renderIcon(People)
  },
  {
    label: '地址管理',
    key: 'Addresses',
    icon: renderIcon(Location)
  },
  
  
  {
    label: '活动商品管理',
    key: 'ActivityProducts',
    icon: renderIcon(Flash)
  },
        {
        label: '系统管理',
        key: 'system',
        icon: renderIcon(Settings),
        children: [
        {
    label: '公司图片管理',
    key: 'CompanyImages',
    icon: renderIcon(Image)
  },
  {
    label: '内容信息管理',
    key: 'ContentInfo',
    icon: renderIcon(DocumentText)
  },
  {
    label: '联系信息管理',
    key: 'ContactInfo',
    icon: renderIcon(Chatbubble)
  },
  {
    label: '消息管理',
    key: 'Messages',
    icon: renderIcon(Chatbubble)
  },
          {
            label: '邮件设置',
            key: 'EmailSettings',
            icon: renderIcon(Mail)
          },
          {
            label: '欢迎配置',
            key: 'WelcomeConfig',
            icon: renderIcon(Home)
          },
          {
            label: '日志管理',
            key: 'Logs',
            icon: renderIcon(DocumentText)
          },
          {
            label: '数据备份',
            key: 'Backup',
            icon: renderIcon(Archive)
          }
        ]
      }
]

// 用户下拉菜单选项
const userOptions = [
  {
    label: '退出登录',
    key: 'logout'
  }
]

// 处理菜单点击
const handleMenuClick = (key) => {
  if (key === 'system') return // 系统管理是父级菜单，不跳转
  
  router.push({ name: key })
}

// 处理用户操作
const handleUserAction = (key) => {
  if (key === 'logout') {
    // 清除登录状态
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<style scoped>
/* 整体布局渐变背景 */
:deep(.n-layout) {
  background: linear-gradient(135deg, #ff6a00 0%, #ffb347 100%);
  min-height: 100vh;
}

/* 侧边栏样式 */
:deep(.n-layout-sider) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 106, 0, 0.2);
  background: linear-gradient(90deg, #fff7f0 0%, #ffe0d2 100%);
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: #ff6a00;
}

/* 顶部导航栏样式 */
.header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 106, 0, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

/* 主内容区域样式 */
.content {
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  min-height: calc(100vh - 64px);
  border-radius: 16px 16px 0 0;
  margin: 0 16px 16px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 菜单样式优化 */
:deep(.n-menu) {
  background: transparent;
}

:deep(.n-menu-item) {
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.n-menu-item:hover) {
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%);
  color: white;
  transform: translateX(4px);
}

:deep(.n-menu-item--selected) {
  background: linear-gradient(90deg, #ff6a00 0%, #ffb347 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 106, 0, 0.3);
}

/* 子菜单样式 */
:deep(.n-submenu) {
  background: transparent;
}

:deep(.n-submenu .n-menu-item) {
  margin-left: 16px;
}

/* 按钮样式优化 */
:deep(.n-button) {
  transition: all 0.3s ease;
}

:deep(.n-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 106, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content {
    padding: 16px;
    margin: 0 8px 8px 8px;
  }
  
  .header {
    padding: 0 16px;
  }
}
</style>