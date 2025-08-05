import { createRouter, createWebHistory } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue')
  },
  {
    path: '/',
    component: BaseLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/pages/dashboard/index.vue')
      },
      {
        path: '/product',
        name: 'Product',
        component: () => import('@/pages/product/index.vue')
      },
      {
        path: '/category',
        name: 'Category',
        component: () => import('@/pages/category/index.vue')
      },
      {
        path: '/activity-product',
        name: 'ActivityProduct',
        component: () => import('@/pages/activity-product/index.vue')
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/pages/order/index.vue')
      },
      {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/pages/cart/index.vue')
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('@/pages/user/index.vue')
      },
      {
        path: '/address',
        name: 'Address',
        component: () => import('@/pages/address/index.vue')
      },
      {
        path: '/logs',
        name: 'Logs',
        component: () => import('@/pages/logs/index.vue')
      },
      {
        path: '/company-image',
        name: 'CompanyImage',
        component: () => import('@/pages/companyimage/index.vue')
      },
      {
        path: '/contact-service',
        name: 'ContactService',
        component: () => import('@/pages/contact-service/index.vue')
      },
      {
        path: '/about-us',
        name: 'AboutUs',
        component: () => import('@/pages/about-us/index.vue')
      },
      {
        path: '/message',
        name: 'Message',
        component: () => import('@/pages/message/index.vue')
      },
      {
        path: '/email-settings',
        name: 'EmailSettings',
        component: () => import('@/pages/email-settings/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：未登录跳转登录页
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router 