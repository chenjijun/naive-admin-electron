import axios from 'axios'
import { BASE_URL } from './baseUrl'
import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
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
        window.location.href = '/login'
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

export default service 