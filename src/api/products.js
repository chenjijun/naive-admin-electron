import request from './index'

// 获取商品列表
export function getProductList(params) {
  return request.get('/admin/products', { params })
}

// 获取商品详情
export function getProductDetail(id) {
  return request.get(`/admin/products/${id}`)
}

// 新增商品
export function addProduct(data) {
  return request.post('/admin/products', data)
}

// 编辑商品
export function updateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

// 导入商品
export function importProducts(formData) {
  return request.post('/admin/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 导出商品
export function exportProducts(params) {
  return request.get('/admin/products/export', { params, responseType: 'blob' })
}

// 批量导入商品图片
export function importProductImages(formData) {
  return request.post('/admin/products/import-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
} 