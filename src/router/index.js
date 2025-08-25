import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    component: BaseLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/pages/user/index.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/pages/product/index.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/pages/category/index.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/pages/order/index.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/pages/cart/index.vue'),
        meta: { title: '购物车管理' }
      },
      {
        path: 'addresses',
        name: 'Addresses',
        component: () => import('@/pages/address/index.vue'),
        meta: { title: '地址管理' }
      },
      {
        path: 'company-images',
        name: 'CompanyImages',
        component: () => import('@/pages/companyimage/index.vue'),
        meta: { title: '公司图片管理' }
      },
      {
        path: 'content-info',
        name: 'ContentInfo',
        component: () => import('@/pages/content-info/index.vue'),
        meta: { title: '内容信息管理' }
      },
      {
        path: 'contact-info',
        name: 'ContactInfo',
        component: () => import('@/pages/contact-service/index.vue'),
        meta: { title: '联系信息管理' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/pages/message/index.vue'),
        meta: { title: '消息管理' }
      },
      {
        path: 'email-settings',
        name: 'EmailSettings',
        component: () => import('@/pages/email-settings/index.vue'),
        meta: { title: '邮件设置' }
      },
      {
        path: 'activity-products',
        name: 'ActivityProducts',
        component: () => import('@/pages/activity-product/index.vue'),
        meta: { title: '活动商品管理' }
      },
      {
        path: 'welcome-config',
        name: 'WelcomeConfig',
        component: () => import('@/pages/welcome-config/index.vue'),
        meta: { title: '欢迎配置' }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/pages/logs/index.vue'),
        meta: { title: '日志管理' }
      },
      {
        path: 'backup',
        name: 'Backup',
        component: () => import('@/pages/backup/index.vue'),
        meta: { title: '数据备份' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: { title: '登录' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router 