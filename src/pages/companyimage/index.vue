<template>
  <n-card title="公司图片管理">
    <div style="margin-bottom: 16px; padding: 8px; background: #f0f9ff; border-radius: 8px; border: 1px solid #0ea5e9;">
      <p style="margin: 0; color: #0ea5e9;">✅ 公司图片管理页面已成功加载</p>
    </div>
    <n-space style="margin-bottom: 16px;">
      <n-select v-model:value="type" :options="typeOptions" style="width: 180px" @update:value="fetchImages" />
      <n-upload :custom-request="handleUpload" accept="image/*" :show-file-list="false">
        <n-button type="primary">上传图片</n-button>
      </n-upload>
    </n-space>
    <n-table :bordered="true" size="small">
      <thead>
        <tr>
          <th>图片</th>
          <th>类型</th>
          <th>排序</th>
          <th>上传时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="img in images" :key="img.id">
          <td><img :src="img.url" style="width:80px;height:80px;object-fit:cover;border-radius:8px;" /></td>
          <td>
            <n-select v-model:value="img.type" :options="typeOptions" size="small" style="width:110px" @update:value="val => handleEdit(img, { type: val })" />
          </td>
          <td>
            <n-input-number v-model:value="img.sort" size="small" style="width:80px" @blur="() => handleEdit(img, { sort: img.sort })" />
          </td>
          <td>{{ formatDate(img.created_at) }}</td>
          <td>
            <n-popconfirm @positive-click="() => handleDelete(img.id)">
              <template #trigger>
                <n-button type="error" size="small">删除</n-button>
              </template>
              确认删除该图片？
            </n-popconfirm>
          </td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup name="CompanyImage">
import { ref, onMounted } from 'vue'
import api from '@/api'
import { useMessage } from 'naive-ui'

const message = useMessage()
const images = ref([])
const type = ref('company')
const typeOptions = [
  { label: '公司图片栏', value: 'company' },
  { label: '欢迎图片', value: 'welcome' },
  { label: '新品推荐', value: 'recommend_new' },
  { label: '爆款推荐', value: 'recommend_hot' },
  { label: '特价商品', value: 'recommend_sale' }
]

function typeLabel(val) {
  const opt = typeOptions.find(o => o.value === val)
  return opt ? opt.label : val
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function fetchImages() {
  const res = await api.get('/admin/company-images', { params: { type: type.value } })
  if (Array.isArray(res)) {
    images.value = res
  } else if (res && res.data && Array.isArray(res.data)) {
    images.value = res.data
  } else if (res && res.data && Array.isArray(res.data.data)) {
    images.value = res.data.data
  } else {
    images.value = []
  }
}

async function handleUpload({ file, onFinish }) {
  const formData = new FormData()
  formData.append('file', file.file)
  formData.append('type', type.value)
  const res = await api.post('/admin/company-images/upload-image/', formData)
  if (res && res.data && res.message === 'ok') {
    message.success('上传成功')
    fetchImages()
    onFinish()
  } else {
    message.error('上传失败')
  }
}

async function handleDelete(id) {
  await api.delete(`/admin/company-images/${id}`)
  message.success('删除成功')
  fetchImages()
}

async function handleEdit(img, patch) {
  await api.patch(`/admin/company-images/${img.id}`, patch)
  message.success('修改成功')
  fetchImages()
}

onMounted(() => {
  fetchImages()
})
</script> 