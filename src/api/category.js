import axios from 'axios'

export function getCategoryList() {
  return axios.get('/admin/category/')
}

export function addCategory(data) {
  return axios.post('/admin/category/', data)
}

export function updateCategory(id, data) {
  return axios.put(`/admin/category/${id}`, data)
}

export function deleteCategory(id) {
  return axios.delete(`/admin/category/${id}`)
} 