import request from './index'

// 获取所有欢迎配置
export function getWelcomeConfigs(params) {
  return request.get('/admin/welcome-config', { params })
}

// 获取单个欢迎配置
export function getWelcomeConfig(id) {
  return request.get(`/admin/welcome-config/${id}`)
}

// 创建欢迎配置
export function createWelcomeConfig(data) {
  return request.post('/admin/welcome-config', data)
}

// 更新欢迎配置
export function updateWelcomeConfig(id, data) {
  return request.put(`/admin/welcome-config/${id}`, data)
}

// 删除欢迎配置
export function deleteWelcomeConfig(id) {
  return request.delete(`/admin/welcome-config/${id}`)
}

// 生成随机值
export function generateRandomValue(id) {
  return request.post(`/admin/welcome-config/generate-random-value/${id}`)
}
