import axios from 'axios'
import { BASE_URL } from './baseUrl'
import { createDiscreteApi } from 'naive-ui'
import router from '@/router'

const { message } = createDiscreteApi(['message'])

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 30000  // 增加到30秒，适应国外数据库延迟
})

service.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  
  // 移除自动添加尾部斜杠的逻辑，避免307重定向
  // if (config.url && !config.url.includes('?') && !config.url.endsWith('/') && 
  //     (config.method === 'get' || config.method === 'GET')) {
  //   config.url = config.url + '/'
  // }
  
  return config
})

service.interceptors.response.use(
  response => response.data,
  error => {
    if (error.config && error.config.url && error.config.url.includes('/auth/admin_login')) {
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        message.error('登录超时，请重试')
        return Promise.reject(error)
      }
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail)
        return Promise.reject(error)
      }
    }
    if (error.response && error.response.status === 401) {
      message.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      setTimeout(() => {
        // 使用Vue Router导航，而不是window.location
        router.push('/login')
      }, 800)
      return Promise.reject(error)
    }
    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      message.error('请求超时，请重试')
    } else if (error.response && error.response.data && error.response.data.detail) {
      message.error(error.response.data.detail)
    } else if (error.message) {
      message.error(error.message)
    } else {
      message.error('请求失败，请重试')
    }
    return Promise.reject(error)
  }
)

// Dashboard相关API
export const dashboardApi = {
  // 获取所有仪表盘数据（集合接口）- 设置更长超时时间
  getAllData: (days = 7) => service.get('/admin/dashboard/all-data', { 
    params: { days },
    timeout: 60000  // dashboard接口设置60秒超时
  }),
  
  // 保留原有接口，用于单独调用
  getStats: () => service.get('/admin/dashboard/stats', { timeout: 30000 }),
  getMonthlyStats: () => service.get('/admin/dashboard/monthly-stats', { timeout: 30000 }),
  getSalesTrend: (days = 7) => service.get('/admin/dashboard/sales-trend', { 
    params: { days },
    timeout: 30000 
  }),
  getCategoryDistribution: () => service.get('/admin/dashboard/category-distribution', { timeout: 30000 }),
  getUserGrowth: (days = 7) => service.get('/admin/dashboard/user-growth', { 
    params: { days },
    timeout: 30000 
  }),
  getTopProducts: () => service.get('/admin/dashboard/top-products', { timeout: 30000 }),
  getRecentOrders: () => service.get('/admin/dashboard/recent-orders', { timeout: 30000 })
}

export default service 