import request from './index'

export function getLogStatistics(hours = 24) {
  return request.get('/admin/logs/statistics', { params: { hours } })
}

export function getUserActivity(hours = 24) {
  return request.get('/admin/logs/user-activity', { params: { hours } })
}

// 获取用户活动详细记录（每次请求一行）
export function getDetailedUserActivity(hours = 24) {
  return request.get('/admin/logs/detailed-user-activity', { params: { hours } })
}

export function getSecurityEvents(hours = 24) {
  return request.get('/admin/logs/security-events', { params: { hours } })
}

export function getRecentErrors(limit = 50) {
  return request.get('/admin/logs/recent-errors', { params: { limit } })
}

export function exportLogs(hours = 24) {
  return request.post('/admin/logs/export', null, { params: { hours }, responseType: 'blob' })
} 