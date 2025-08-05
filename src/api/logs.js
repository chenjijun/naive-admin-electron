import request from './index'

export function getLogStatistics(hours = 24) {
  return request.get('/logs/statistics', { params: { hours } }).then(res => {
    
    return res.data
  })
}
export function getUserActivity(hours = 24) {
  return request.get('/logs/user-activity', { params: { hours } }).then(res => {
   
    return res.data
  })
}
export function getSecurityEvents(hours = 24) {
  console.log('getSecurityEvents')
  return request.get('/logs/security-events', { params: { hours } }).then(res => {

    return res.data
  })
}
export function getRecentErrors(limit = 50) {
  console.log('getRecentErrors')
  return request.get('/logs/recent-errors', { params: { limit } }).then(res => {

    return res.data
  })
}
export function exportLogs(hours = 24) {
  return request.post('/logs/export', null, { params: { hours }, responseType: 'blob' })
} 