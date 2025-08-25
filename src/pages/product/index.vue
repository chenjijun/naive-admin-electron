<template>
  <div class="product-manage-layout">
    <!-- 左侧：树形类目管理 -->
    <div class="category-tree-panel">
      <n-space vertical>
        <n-space horizontal style="margin: 6px;">
        <n-button type="primary" @click="showAddCategory = true">新增分类</n-button>
        <n-button @click="fetchCategories" type="info" style="">刷新分类</n-button>
        </n-space>
        <n-tree
          :data="categoryTree"
          :default-expand-all="true"
          :key-field="'id'"
          :label-field="'name'"
          :children-field="'children'"
          :selected-keys="selectedCategoryId ? [selectedCategoryId] : []"
          @update:selected-keys="onCategorySelect"
        />
        <n-button
          style="margin-top: 12px; width: 100%;"
          :type="selectedCategoryId === null ? 'primary' : 'default'"
          @click="handleAllProducts"
        >
          所有商品
        </n-button>
      </n-space>
    </div>
    <!-- 右侧：商品管理 -->
    <div class="product-table-panel">
     
      
      <n-space style="margin: 6px;">
        <n-input v-model:value="searchText" placeholder="搜索商品名称" style="width: 220px" @keydown.enter="handleSearch" />
        <n-button type="primary" @click="handleSearch">搜索</n-button>
        <n-button @click="handleResetSearch">重置</n-button>
        <n-button type="primary" @click="showAddProduct = true">新增商品</n-button>
        <n-button @click="handleRefresh" type="info">刷新</n-button>
        <n-button @click="downloadTemplate" type="info">下载模板</n-button>
        <n-button @click="showImportHelp = true" type="warning">导入说明</n-button>
        <n-upload
          :custom-request="handleImport"
          accept=".xlsx"
          :show-file-list="false"
        >
          <n-button>导入商品</n-button>
        </n-upload>
        <n-button @click="handleExport">导出商品</n-button>
        <n-upload
          :custom-request="handleImportImages"
          accept=".zip"
          :show-file-list="false"
          style="display:inline-block;"
        >
          <n-button type="primary">图片导入</n-button>
        </n-upload>
        <n-button type="success" @click="handleBatchActivate" v-if="batchMode && selectedRows.length">批量上架</n-button>
        <n-button type="warning" @click="handleBatchDeactivate" v-if="batchMode && selectedRows.length">批量下架</n-button>
        <n-button type="error" @click="toggleBatchMode" v-if="!batchMode">批量操作</n-button>
        <n-button @click="handleBatchDelete" v-if="batchMode && selectedRows.length" type="error">确认批量删除</n-button>
        <n-button @click="toggleBatchMode" v-if="batchMode" type="default">取消批量</n-button>
      </n-space>
      <!-- 分页器移动到表格上方 -->
      <div style="margin: 24px 0 12px 0; display: flex; align-items: center; justify-content: flex-end;">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :page-sizes="[20, 30, 50, 100]"
          :item-count="total"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
          show-size-picker
        />
        <span style="margin-left: 16px; color: #888; font-size: 14px; min-width: 80px; text-align: right;">共{{ total }}个商品</span>
      </div>
      <n-data-table
        :columns="columns"
        :data="sortedProducts"
        :bordered="true"
        style="margin-top: 0"
        :row-key="row => row.id"
        :checked-row-keys="selectedRows"
        @update:checked-row-keys="handleCheck"
        :max-height="'70vh'"
        :single-line="false"
        :size="small"
      />
      <!-- 商品表格下方不再显示分页器 -->
    </div>

    <!-- 新增/编辑分类弹窗 -->
    <n-modal v-model:show="showAddCategory" preset="card" style="border-radius: 20px; width: 400px;">
      <template #header>
        <div class="add-title">{{ editCategoryId ? '编辑分类' : '新增分类' }}</div>
      </template>
      <n-form :model="categoryForm">
        <n-form-item label="分类名称">
          <n-input v-model:value="categoryForm.name" />
        </n-form-item>
        <n-form-item label="父级分类">
          <n-tree-select
            v-model:value="categoryForm.parent_id"
            :options="categoryTree"
            :label-field="'name'"
            :key-field="'id'"
            :children-field="'children'"
            clearable
            placeholder="无"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAddCategory = false">取消</n-button>
          <n-button type="primary" @click="handleCategorySave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 导入说明弹窗 -->
    <n-modal v-model:show="showImportHelp" preset="card" style="border-radius: 20px; width: 700px;">
      <template #header>
        <div class="add-title">商品导入说明</div>
      </template>
      <div class="import-help-content">
        <h3>📋 Excel表头格式要求</h3>
        <p>请严格按照以下顺序和名称填写表头（第一行）：</p>
        <div class="header-list">
          <div class="header-item">1. 商品名称</div>
          <div class="header-item">2. 分类</div>
          <div class="header-item">3. 价格</div>
          <div class="header-item">4. 库存</div>
          <div class="header-item">5. 起订量</div>
          <div class="header-item">6. 销量</div>
          <div class="header-item">7. 商品编号</div>
          <div class="header-item">8. 创建时间</div>
          <div class="header-item">9. 是否上架</div>
          <div class="header-item">10. 单位</div>
          <div class="header-item">11. 商品描述</div>
        </div>
        
        <h3>⚠️ 注意事项</h3>
        <ul>
          <li>表头必须完全一致，包括中文字符和标点符号</li>
          <li><strong>商品编号必须唯一，不能重复</strong> - 这是商品的唯一标识</li>
          <li>价格、库存、起订量、销量必须是数字</li>
          <li>是否上架填写：是/否</li>
          <li>创建时间格式：YYYY-MM-DD</li>
          <li>分类不存在时会自动创建</li>
          <li>导出的Excel文件包含商品编码，可用于数据核对</li>
        </ul>
        
        <h3>💡 建议</h3>
        <p>请先点击"下载模板"按钮获取标准模板，然后按照模板格式填写数据。</p>
      </div>
      <template #action>
        <n-space justify="end">
          <n-button @click="showImportHelp = false">关闭</n-button>
          <n-button type="primary" @click="downloadTemplate">下载模板</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 新增/编辑商品弹窗 -->
    <n-modal v-model:show="showAddProduct" preset="card" style="border-radius: 20px; width: 600px;">
      <template #header>
        <div class="add-title">{{ editProductId ? '编辑商品' : '新增商品' }}</div>
      </template>
      <n-form :model="productForm">
        <n-form-item label="商品名称">
          <n-input v-model:value="productForm.name" />
        </n-form-item>
        <n-form-item label="商品编号">
          <n-input v-model:value="productForm.sn" />
        </n-form-item>
        <n-form-item label="分类">
          <n-tree-select
            v-model:value="productForm.category_id"
            :options="categoryTree"
            :label-field="'name'"
            :key-field="'id'"
            :children-field="'children'"
            placeholder="请选择分类"
          />
        </n-form-item>
        <n-form-item label="价格">
          <n-input-number v-model:value="productForm.price" :min="0" />
        </n-form-item>
        <n-form-item label="库存">
          <n-input-number v-model:value="productForm.stock" :min="0" />
        </n-form-item>
        <n-form-item label="起订量">
          <n-input-number v-model:value="productForm.min_order" :min="1" />
        </n-form-item>
        <n-form-item label="销量">
          <n-input-number v-model:value="productForm.sales" :min="0" />
        </n-form-item>
        <n-form-item label="是否上架">
          <n-checkbox v-model:checked="productForm.is_active">上架</n-checkbox>
        </n-form-item>
        <n-form-item label="单位">
          <n-input v-model:value="productForm.unit" />
        </n-form-item>
        <n-form-item label="商品图片">
          <n-upload
            :custom-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
          >
            <n-button>上传图片</n-button>
          </n-upload>
          <img v-if="productForm.image" :src="productForm.image" style="max-width: 80px; margin-left: 12px;" />
        </n-form-item>
        <n-form-item label="商品描述">
          <n-input
            v-model:value="productForm.description"
            type="textarea"
            placeholder="支持富文本（可粘贴HTML）"
            :autosize="{ minRows: 3, maxRows: 8 }"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button @click="showAddProduct = false">取消</n-button>
          <n-button type="primary" @click="handleProductSave">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 商品详情弹窗 -->
    <n-modal v-model:show="showProductDetail" preset="card" style="width: 500px;">
      <template #header>商品详情</template>
      <div v-if="productDetail">
        <div style="text-align:center;margin-bottom:12px;">
          <img :src="productDetail.image" style="max-width:120px;max-height:120px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px #eee;" />
        </div>
        <div><b>名称：</b>{{ productDetail.name }}</div>
        <div><b>商品编号：</b>{{ productDetail.sn }}</div>
        <div><b>分类：</b>{{ getCategoryName(productDetail.category_id) }}</div>
        <div><b>价格：</b>{{ productDetail.price }}</div>
        <div><b>库存：</b>{{ productDetail.stock }}</div>
        <div><b>销量：</b>{{ productDetail.sales }}</div>
        <div><b>单位：</b>{{ productDetail.unit }}</div>
        <div><b>起订量：</b>{{ productDetail.min_order }}</div>
        <div><b>是否上架：</b>{{ productDetail.is_active ? '是' : '否' }}</div>
        <div><b>描述：</b><span v-html="productDetail.description"></span></div>
        <div><b>创建时间：</b>{{ formatDate(productDetail.created_at) }}</div>
        <div><b>更新时间：</b>{{ formatDate(productDetail.updated_at) }}</div>
      </div>
    </n-modal>

    <!-- 生成条形码弹窗 -->
    <n-modal v-model:show="showBarcodeModal" preset="card" style="width: 420px; text-align:center;">
      <template #header>商品条形码</template>
      <div v-if="barcodeImg">
        <img :src="barcodeImg" style="max-width: 360px; margin: 24px auto 8px auto; display:block; background:#fff; padding:12px; border-radius:12px; box-shadow:0 2px 8px #eee;" />
        <div style="margin-top: 12px; font-size: 18px; color: #333;">SN: {{ barcodeSN }}</div>
      </div>
    </n-modal>
  </div>
</template>

<script setup name="Product">

import { ref, onMounted, h, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, useMessage, useDialog, useLoadingBar, NModal, NDropdown } from 'naive-ui'
import api from '@/api'
import axios from 'axios'
import { API_BASE_URL, IMG_BASE_URL } from '@/api/baseUrl'
import * as XLSX from 'xlsx' // 新增：引入 xlsx 库
import JsBarcode from 'jsbarcode'
import { importProductImages } from '@/api/products'

const message = useMessage()
const dialog = useDialog()
const loadingBar = useLoadingBar()
const categoryTree = ref([])
const products = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showAddCategory = ref(false)
const showAddProduct = ref(false)
const editCategoryId = ref(null)
const editProductId = ref(null)
const categoryForm = ref({ name: '', parent_id: null })
const productForm = ref({
  name: '', description: '', price: 0, image: '', stock: 0, min_order: 1, unit: '', category_id: null, sales: 0, is_active: true
})
const selectedCategoryId = ref(null) // 当前选中的类目id，null为所有商品
const sortKey = ref('')
const sortOrder = ref('') // 'asc' | 'desc' | ''
const batchMode = ref(false)
const selectedRows = ref([])
const deleteCategoryLoading = ref(false)
const searchText = ref('')
const showProductDetail = ref(false)
const productDetail = ref({})
const showBarcodeModal = ref(false)
const barcodeImg = ref('')
const barcodeSN = ref('')
const showImportHelp = ref(false)
const isLoadingProducts = ref(false) // 防止重复加载
const imageLoadStates = ref(new Map()) // 记录图片加载状态

// 备份状态
const backupStatus = ref({
  backup_needed: false,
  reason: '',
  days_since_last: null
})

const route = useRoute()
const router = useRouter()

const sortableColumns = [
  { title: '名称', key: 'name' },
  { title: '分类', key: 'category_id' },
  { title: '价格', key: 'price' },
  { title: '库存', key: 'stock' },
  { title: '起订量', key: 'min_order' },
  { title: '销量', key: 'sales' },
  { title: '是否上架', key: 'is_active' },
  { title: '创建时间', key: 'created_at' }
]

const columns = computed(() => {
  const base = [
    { title: () => renderSortableHeader('名称', 'name'), key: 'name', render: row => h('a', { style: 'color:#007aff;cursor:pointer;', onClick: () => handleShowProductDetail(row) }, row.name) },
    { title: '商品编号', key: 'sn' },
    { title: () => renderSortableHeader('分类', 'category_id'), key: 'category_id', render: row => getCategoryName(row.category_id) },
    { title: () => renderSortableHeader('价格', 'price'), key: 'price' },
    { title: () => renderSortableHeader('库存', 'stock'), key: 'stock' },
    { title: () => renderSortableHeader('起订量', 'min_order'), key: 'min_order' },
    { title: () => renderSortableHeader('销量', 'sales'), key: 'sales' },
    { title: () => renderSortableHeader('创建时间', 'created_at'), key: 'created_at', render: row => formatDate(row.created_at) },
    { title: () => renderSortableHeader('是否上架', 'is_active'), key: 'is_active', render: row => h('span', { style: `color:${row.is_active ? '#18a058' : '#d03050'};font-weight:bold;` }, row.is_active ? '上架' : '下架') },
    { title: '单位', key: 'unit' },
    { title: '操作', key: 'action', render(row) {
      return h(NDropdown, {
        trigger: 'hover',
        options: [
          {
            label: '编辑',
            key: 'edit'
          },
          {
            label: '详情',
            key: 'detail'
          },
          {
            label: row.is_active ? '下架' : '上架',
            key: 'toggle_status'
          },
          {
            label: '删除',
            key: 'delete'
          },
          {
            label: '条形码',
            key: 'barcode'
          }
        ],
        onSelect: (key) => {
          switch(key) {
            case 'edit':
              openEditProduct(row)
              break
            case 'detail':
              handleShowProductDetail(row)
              break
            case 'toggle_status':
              handleToggleProductStatus(row)
              break
            case 'delete':
              handleDeleteProduct(row)
              break
            case 'barcode':
              handleBarcode(row)
              break
          }
        }
      }, {
        default: () => h(NButton, { size: 'small' }, { default: () => '操作' })
      })
    }}
  ];
  base.unshift({ title: '图片', key: 'image', render: row => {
    // 创建图片组件的渲染函数
    return h('div', { 
      style: 'width:48px;height:48px;position:relative;'
    }, [
      // 图片元素
      h('img', { 
        src: row.image || '/Hanlian.png',
        style: 'width:48px;height:48px;object-fit:cover;border-radius:4px;border:1px solid #eee;',
        loading: 'lazy',
        onError: (e) => {
          // 防止无限循环：标记图片已加载失败
          e.target.dataset.loaded = 'error'
          // 隐藏图片
          e.target.style.display = 'none'
          // 显示占位符
          const placeholder = e.target.nextSibling
          if (placeholder) {
            placeholder.style.display = 'flex'
          }
        },
        onLoad: (e) => {
          // 标记图片加载成功
          e.target.dataset.loaded = 'success'
        }
      }),
      // 占位符元素（默认隐藏）
      h('div', {
        style: 'width:48px;height:48px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:4px;display:none;align-items:center;justify-content:center;color:#6c757d;font-size:11px;position:absolute;top:0;left:0;',
        textContent: '无图'
      })
    ])
  }});
  if (batchMode.value) {
    base.unshift({ type: 'selection', key: 'selection', width: 40 });
  }
  return base;
});

function renderSortableHeader(label, key) {
  const isActive = sortKey.value === key
  let arrow = '▲'
  let color = '#bbb'
  if (isActive) {
    color = '#222'
    if (sortOrder.value === 'desc') arrow = '▼'
  }
  return h('span', {
    style: 'cursor:pointer;user-select:none;display:inline-flex;align-items:center;',
    onClick: () => handleSort(key)
  }, [
    label,
    h('span', {
      style: `margin-left:4px;font-size:12px;color:${color};transition:color 0.2s;`
    }, arrow)
  ])
}

function handleSort(key) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = ''
    sortKey.value = ''
  } else {
    sortOrder.value = 'asc'
  }
}

const sortedProducts = computed(() => {
  if (!sortKey.value || !sortOrder.value) return products.value
  return [...products.value].sort((a, b) => {
    let v1 = a[sortKey.value]
    let v2 = b[sortKey.value]
    // 分类名特殊处理
    if (sortKey.value === 'category_id') {
      v1 = getCategoryName(a.category_id)
      v2 = getCategoryName(b.category_id)
    }
    if (typeof v1 === 'string') v1 = v1.toLowerCase()
    if (typeof v2 === 'string') v2 = v2.toLowerCase()
    if (v1 === v2) return 0
    if (sortOrder.value === 'asc') return v1 > v2 ? 1 : -1
    return v1 < v2 ? 1 : -1
  })
})

function getCategoryName(id) {
  function findName(tree) {
    for (const node of tree) {
      if (node.id === id) return node.name
      if (node.children && node.children.length) {
        const found = findName(node.children)
        if (found) return found
      }
    }
    return ''
  }
  return findName(categoryTree.value)
}

async function fetchCategories() {
  const res = await api.get('/admin/categories')
  if (res && res.message === 'ok') {
    categoryTree.value = res.data
    // 默认选中第一个类目
    if (categoryTree.value.length > 0) {
      selectedCategoryId.value = categoryTree.value[0].id
      await nextTick()
      fetchProductsByCategory(selectedCategoryId.value)
    }
  }
}
async function fetchProducts() {
  if (isLoadingProducts.value) return // 防止重复加载
  
  isLoadingProducts.value = true
  loadingBar.start()
  
  try {
    const params = { page: page.value, page_size: pageSize.value }
    if (searchText.value) params.search = searchText.value
    const res = await api.get('/admin/products', { params })
    if (res && res.message === 'ok') {
      products.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    message.error('获取商品列表失败')
  } finally {
    loadingBar.finish()
    isLoadingProducts.value = false
  }
}
function onCategorySelect(keys) {
  if (!keys.length) return; // 防止二次点击清空
  const catId = keys[0]
  // 如果点击的是当前已选中的分类，不做任何操作
  if (selectedCategoryId.value === catId) return
  selectedCategoryId.value = catId
  page.value = 1 // 只在切换类目时重置页码
  fetchProductsByCategory(catId)
}
async function fetchProductsByCategory(catId) {
  if (isLoadingProducts.value) return // 防止重复加载
  
  isLoadingProducts.value = true
  loadingBar.start()
  
  try {
    const params = { category_id: catId, page: page.value, page_size: pageSize.value }
    if (searchText.value) params.search = searchText.value
    const res = await api.get('/admin/products/', { params })
    if (res && res.message === 'ok') {
      products.value = res.data.items
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取分类商品失败:', error)
    message.error('获取分类商品失败')
  } finally {
    loadingBar.finish()
    isLoadingProducts.value = false
  }
}
function handleSearch() {
  page.value = 1
  if (selectedCategoryId.value) {
    fetchProductsByCategory(selectedCategoryId.value)
  } else {
    fetchProducts()
  }
}
function handleResetSearch() {
  searchText.value = ''
  page.value = 1
  if (selectedCategoryId.value) {
    fetchProductsByCategory(selectedCategoryId.value)
  } else {
    fetchProducts()
  }
}
async function openEditProduct(row) {
  editProductId.value = row.id
  loadingBar.start()
  try {
    const res = await api.get(`/admin/products/${row.id}`)
    if (res && res.message === 'ok' && res.data) {
      Object.assign(productForm.value, res.data)
      productForm.value.is_active = !!res.data.is_active

      console.log(productForm)
    } else {
      message.error('获取商品详情失败')
      return
    }
  } catch (e) {
    message.error('获取商品详情失败')
    return
  } finally {
    loadingBar.finish()
  }
  showAddProduct.value = true
}
function handleDeleteProduct(row) {
  // 先检查商品使用情况
  loadingBar.start()
  api.get(`/admin/products/${row.id}/usage-check`).then(res => {
    loadingBar.finish()
    if (res && res.message === 'ok') {
      const usageData = res.data
      
      if (usageData.can_delete) {
        // 可以安全删除
        dialog.warning({
          title: '确认删除',
          content: `确定要删除商品"${row.name}"吗？\n\n该商品目前未被使用，可以安全删除。`,
          positiveText: '删除',
          negativeText: '取消',
          onPositiveClick: () => {
            performDeleteProduct(row)
          }
        })
      } else {
        // 不能删除，建议下架
        const orderText = usageData.order_count > 0 ? `\n• 在 ${usageData.order_count} 个订单中使用` : ''
        const cartText = usageData.cart_count > 0 ? `\n• 在 ${usageData.cart_count} 个购物车中` : ''
        const userText = usageData.total_users > 0 ? `\n• 涉及 ${usageData.total_users} 个用户` : ''
        
        dialog.error({
          title: '商品无法删除',
          content: `商品"${row.name}"目前正在被使用，无法删除：${orderText}${cartText}${userText}\n\n建议：\n• 将商品下架而不是删除\n• 处理完相关订单后再考虑删除\n• 联系相关用户清理购物车`,
          positiveText: '下架商品',
          negativeText: '取消',
          onPositiveClick: () => {
            // 执行下架操作
            handleDeactivateProduct(row)
          }
        })
      }
    } else {
      message.error('检查商品使用情况失败')
    }
  }).catch(err => {
    loadingBar.error()
    message.error('检查商品使用情况失败：' + (err.message || '网络错误'))
  })
}

// 执行删除商品操作
function performDeleteProduct(row) {
  loadingBar.start()
  api.delete(`/admin/products/${row.id}`).then(res => {
    if (res && res.message === 'ok') {
      message.success(`商品【${row.name}】删除成功`)
      if (selectedCategoryId.value) {
        fetchProductsByCategory(selectedCategoryId.value)
      } else {
        fetchProducts()
      }
      loadingBar.finish()
    } else {
      message.error('删除失败')
      loadingBar.error()
    }
  }).catch(() => loadingBar.error())
}

// 下架商品
function handleDeactivateProduct(row) {
  loadingBar.start()
  api.post(`/admin/products/${row.id}/deactivate`).then(res => {
    if (res && res.message === 'ok') {
      message.success(`商品【${row.name}】已下架`)
      if (selectedCategoryId.value) {
        fetchProductsByCategory(selectedCategoryId.value)
      } else {
        fetchProducts()
      }
      loadingBar.finish()
    } else {
      message.error('下架失败：' + (res.message || '未知错误'))
      loadingBar.error()
    }
  }).catch(err => {
    loadingBar.error()
    message.error('下架失败：' + (err.message || '网络错误'))
  })
}
function handleProductSave() {
  loadingBar.start()
  if (editProductId.value) {
    api.put(`/admin/products/${editProductId.value}`, productForm.value).then(res => {
      if (res && res.message === 'ok') {
        message.success('修改成功')
        showAddProduct.value = false
        if (selectedCategoryId.value) {
          fetchProductsByCategory(selectedCategoryId.value)
        } else {
          fetchProducts()
        }
        loadingBar.finish()
      } else {
        message.error('修改失败')
        loadingBar.error()
      }
    }).catch(() => loadingBar.error())
  } else {
    api.post('/admin/products', productForm.value).then(res => {
      if (res && res.message === 'ok') {
        message.success('新增成功')
        showAddProduct.value = false
        if (selectedCategoryId.value) {
          fetchProductsByCategory(selectedCategoryId.value)
        } else {
          fetchProducts()
        }
        loadingBar.finish()
      } else {
        message.error('新增失败')
        loadingBar.error()
      }
    }).catch(() => loadingBar.error())
  }
}
function handleImageUpload({ file, onFinish }) {
  const formData = new FormData()
  formData.append('file', file.file)
  // 自动带上分类名
  const cat = getCategoryName(productForm.value.category_id) || 'default'
  formData.append('category', cat)
  api.post('/admin/products/upload-image/', formData).then(res => {
    console.log(res)
    if (res.data && res.message === 'ok') {
      // 拼接BASE_URL，保证预览可用
      productForm.value.image = res.data.url
      console.log(productForm.value.image)
      onFinish()
      message.success('上传成功')
    } else {
      message.error('上传失败')
    }
  })
}
// 下载导入模板
function downloadTemplate() {
  try {
    console.log('开始生成模板...')
    console.log('XLSX对象:', XLSX)
    
    // 检查XLSX是否可用
    if (!XLSX || !XLSX.utils || !XLSX.utils.aoa_to_sheet) {
      throw new Error('XLSX库未正确加载')
    }
    
    // 直接在前端生成模板，不依赖后端API
    const headers = [
      "商品名称", "分类", "价格", "库存", "起订量", "销量", 
      "商品编号", "创建时间", "是否上架", "单位", "商品描述"
    ]
    
    const exampleData = [
      "示例商品", "示例分类", 99.99, 100, 1, 0, 
      "SP001", "2024-01-01", "是", "个", "这是一个示例商品描述"
    ]
    
    console.log('表头:', headers)
    console.log('示例数据:', exampleData)
    
    // 创建模板数据
    const templateRows = [
      headers, // 表头
      exampleData // 示例数据
    ]
    
    console.log('模板行数据:', templateRows)
    
    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(templateRows)
    console.log('工作表创建成功:', ws)
    
    const wb = XLSX.utils.book_new()
    console.log('工作簿创建成功:', wb)
    
    XLSX.utils.book_append_sheet(wb, ws, '商品导入模板')
    console.log('工作表添加成功')
    
    // 设置列宽
    const colWidths = [15, 12, 10, 10, 10, 10, 15, 15, 10, 8, 30]
    ws['!cols'] = colWidths.map(width => ({ width }))
    console.log('列宽设置成功')
    
    console.log('准备下载文件...')
    
    // 尝试多种下载方法
    try {
      // 方法1: 直接使用XLSX.writeFile
      XLSX.writeFile(wb, '商品导入模板.xlsx')
      console.log('方法1成功: XLSX.writeFile')
      message.success('模板下载成功')
      return
    } catch (method1Error) {
      console.warn('方法1失败:', method1Error)
    }
    
    try {
      // 方法2: 使用Blob和URL.createObjectURL
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = '商品导入模板.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('方法2成功: Blob下载')
      message.success('模板下载成功')
      return
    } catch (method2Error) {
      console.warn('方法2失败:', method2Error)
    }
    
    // 如果Excel方法都失败，使用CSV备用方案
    throw new Error('Excel下载方法失败，使用CSV备用方案')
    
  } catch (error) {
    console.error('生成模板失败:', error)
    
    // 使用CSV备用方法
    try {
      console.log('使用CSV备用下载方法...')
      const csvContent = "商品名称,分类,价格,库存,起订量,销量,商品编号,创建时间,是否上架,单位,商品描述\n示例商品,示例分类,99.99,100,1,0,SP001,2024-01-01,是,个,这是一个示例商品描述"
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', '商品导入模板.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      message.success('CSV模板下载成功（Excel下载失败，使用备用方案）')
    } catch (backupError) {
      console.error('所有下载方法都失败:', backupError)
      message.error('下载失败，请检查浏览器设置或联系管理员')
    }
  }
}

// 仅支持xlsx文件导入
function handleImport({ file, onFinish }) {
  loadingBar.start()
  const formData = new FormData()
  formData.append('file', file.file)
  api.post('/admin/products/import/', formData, {
    headers: {
      Authorization: localStorage.getItem('token') || ''
    }
  }).then(res => {
    console.log(res)
    if (res.message === 'ok') {
      message.success('导入成功'+res.imported+'个，跳过'+res.skipped+'个')
      if (selectedCategoryId.value) {
        fetchProductsByCategory(selectedCategoryId.value)
      } else {
        fetchProducts()
      }
      onFinish()
      loadingBar.finish()
    } else {
      message.error('导入失败')
      loadingBar.error()
    }
  }).catch((error) => {
    console.error('导入错误:', error)
    // 显示详细的错误信息
    if (error.response && error.response.data && error.response.data.detail) {
      message.error(`导入失败: ${error.response.data.detail}`)
    } else {
      message.error('导入失败，请检查文件格式')
    }
    loadingBar.error()
  })
}
function handleExport() {
  dialog.info({
    title: '确认导出',
    content: '确定要导出所有商品数据为 Excel 吗？',
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: () => {
      exportProducts()
    }
  })
}

function exportProducts() {
  loadingBar.start()
  api.get('/admin/products/export/').then(res => {
    if (res && res.message === 'ok') {
      exportToExcel(res.data)
      loadingBar.finish()
    } else {
      message.error('导出失败')
      loadingBar.error()
    }
  }).catch(() => loadingBar.error())
}

function exportToExcel(data) {
  // 1. 构造导出数据，分类字段转为名称
  const exportData = data.map(item => ({
    商品名称: item.name,
    商品编码: item.sn, // 添加商品编码
    分类: getCategoryName(item.category_id),
    价格: item.price,
    库存: item.stock,
    起订量: item.min_order,
    销量: item.sales,
    创建时间: formatDate(item.created_at),
    是否上架: item.is_active ? '是' : '否',
    单位: item.unit,
    商品描述: item.description
  }))
  // 2. 导出
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '商品列表')
  XLSX.writeFile(wb, 'products.xlsx')
}
function handleCategorySave() {
  if (editCategoryId.value) {
    api.put(`/admin/categories/${editCategoryId.value}`, categoryForm.value).then(res => {
      if (res && res.message === 'ok') {
        message.success('修改成功')
        showAddCategory.value = false
        fetchCategories()
      } else {
        message.error('修改失败')
      }
    })
  } else {
    api.post('/admin/categories', categoryForm.value).then(res => {
      if (res && res.message === 'ok') {
        message.success('新增成功')
        showAddCategory.value = false
        fetchCategories()
      } else {
        message.error('新增失败')
      }
    })
  }
}
function handlePageChange() {
  if (selectedCategoryId.value) {
    fetchProductsByCategory(selectedCategoryId.value)
  } else {
    fetchProducts()
  }
}
function handlePageSizeChange(newSize) {
  pageSize.value = newSize
  page.value = 1
  if (selectedCategoryId.value) {
    fetchProductsByCategory(selectedCategoryId.value)
  } else {
    fetchProducts()
  }
}

function handleAllProducts() {
  selectedCategoryId.value = null
  page.value = 1
  fetchProducts()
}

function toggleBatchMode() {
  batchMode.value = !batchMode.value
  selectedRows.value = []
}
function handleBatchDelete() {
  if (!selectedRows.value.length) return
  
  // 先检查所有选中商品的使用情况
  loadingBar.start()
  const checkPromises = selectedRows.value.map(id => 
    api.get(`/admin/products/${id}/usage-check`)
  )
  
  Promise.all(checkPromises).then(responses => {
    loadingBar.finish()
    
    const canDeleteIds = []
    const cannotDeleteProducts = []
    
    responses.forEach((res, index) => {
      const productId = selectedRows.value[index]
      if (res && res.message === 'ok') {
        if (res.data.can_delete) {
          canDeleteIds.push(productId)
        } else {
          cannotDeleteProducts.push({
            id: productId,
            name: res.data.product_name,
            order_count: res.data.order_count,
            cart_count: res.data.cart_count
          })
        }
      }
    })
    
    if (cannotDeleteProducts.length > 0) {
      // 有商品无法删除
      let content = `以下商品无法删除：\n\n`
      cannotDeleteProducts.forEach(product => {
        content += `• ${product.name}：`
        if (product.order_count > 0) content += `在 ${product.order_count} 个订单中使用，`
        if (product.cart_count > 0) content += `在 ${product.cart_count} 个购物车中，`
        content += `建议下架\n`
      })
      content += `\n建议：\n• 将无法删除的商品下架\n• 处理完相关订单后再考虑删除\n• 联系相关用户清理购物车`
      
      dialog.error({
        title: '部分商品无法删除',
        content: content,
        positiveText: '下架无法删除的商品',
        negativeText: '取消',
        onPositiveClick: () => {
          // 下架无法删除的商品
          handleBatchDeactivateForUnsafe(cannotDeleteProducts.map(p => p.id))
        }
      })
    }
    
    if (canDeleteIds.length > 0) {
      // 可以删除的商品
      dialog.warning({
        title: '确认删除',
        content: `确定要删除选中的 ${canDeleteIds.length} 个商品吗？\n\n这些商品目前未被使用，可以安全删除。`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: () => {
          performBatchDelete(canDeleteIds)
        }
      })
    }
    
  }).catch(err => {
    loadingBar.error()
    message.error('检查商品使用情况失败：' + (err.message || '网络错误'))
  })
}

// 执行批量删除操作
function performBatchDelete(productIds) {
  loadingBar.start()
  api.post('/admin/products/batch-delete', { ids: productIds }).then(res => {
    if (res && res.message === 'ok') {
      message.success(`已删除 ${productIds.length} 个商品`)
      batchMode.value = false
      selectedRows.value = []
      if (selectedCategoryId.value) {
        fetchProductsByCategory(selectedCategoryId.value)
      } else {
        fetchProducts()
      }
      loadingBar.finish()
    } else {
      message.error('批量删除失败：' + res.message)
      loadingBar.error()
    }
  }).catch(() => loadingBar.error())
}

// 下架无法删除的商品
function handleBatchDeactivateForUnsafe(productIds) {
  loadingBar.start()
  api.post('/admin/products/batch-deactivate', { ids: productIds }).then(res => {
    if (res && res.message === 'ok') {
      message.success(`已下架 ${productIds.length} 个无法删除的商品`)
      batchMode.value = false
      selectedRows.value = []
      if (selectedCategoryId.value) {
        fetchProductsByCategory(selectedCategoryId.value)
      } else {
        fetchProducts()
      }
      loadingBar.finish()
    } else {
      message.error('批量下架失败：' + (res.message || '未知错误'))
      loadingBar.error()
    }
  }).catch(err => {
    loadingBar.error()
    message.error('批量下架失败：' + (err.message || '网络错误'))
  })
}

function handleBatchActivate() {
  if (!selectedRows.value.length) return
  dialog.warning({
    title: '批量上架',
    content: `确定要上架选中的${selectedRows.value.length}个商品吗？`,
    positiveText: '上架',
    negativeText: '取消',
    onPositiveClick: () => {
      loadingBar.start()
      api.post('/admin/products/batch-activate', { ids: selectedRows.value }).then(res => {
        if (res && res.message === 'ok') {
          message.success(`已上架${selectedRows.value.length}个商品`)
          batchMode.value = false
          selectedRows.value = []
          if (selectedCategoryId.value) {
            fetchProductsByCategory(selectedCategoryId.value)
          } else {
            fetchProducts()
          }
          loadingBar.finish()
        } else {
          message.error('批量上架失败'+res.message)
          loadingBar.error()
        }
      }).catch(() => loadingBar.error())
    }
  })
}

function handleBatchDeactivate() {
  if (!selectedRows.value.length) return
  dialog.warning({
    title: '批量下架',
    content: `确定要下架选中的${selectedRows.value.length}个商品吗？`,
    positiveText: '下架',
    negativeText: '取消',
    onPositiveClick: () => {
      loadingBar.start()
      api.post('/admin/products/batch-deactivate', { ids: selectedRows.value }).then(res => {
        if (res && res.message === 'ok') {
          message.success(`已下架${selectedRows.value.length}个商品`)
          batchMode.value = false
          selectedRows.value = []
          if (selectedCategoryId.value) {
            fetchProductsByCategory(selectedCategoryId.value)
          } else {
            fetchProducts()
          }
          loadingBar.finish()
        } else {
          message.error('批量下架失败'+res.message)
          loadingBar.error()
        }
      }).catch(() => loadingBar.error())
    }
  })
}

function handleRefresh() {
  loadingBar.start()
  if (selectedCategoryId.value) {
    fetchProductsByCategory(selectedCategoryId.value).then(() => {
      message.success('刷新成功')
      loadingBar.finish()
    }).catch(() => loadingBar.error())
  } else {
    fetchProducts().then(() => {
      message.success('刷新成功')
      loadingBar.finish()
    }).catch(() => loadingBar.error())
  }
}

function handleCheck(val) {
    console.log(val)
    console.log(selectedRows)
  selectedRows.value = val
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

async function handleShowProductDetail(row) {
  loadingBar.start()
  try {
    const res = await api.get(`/admin/products/${row.id}`)
    if (res && res.message === 'ok' && res.data) {
      productDetail.value = res.data
      showProductDetail.value = true
    } else {
      message.error('获取商品详情失败')
    }
  } catch (e) {
    message.error('获取商品详情失败')
  } finally {
    loadingBar.finish()
  }
}

function handleBarcode(row) {
  dialog.warning({
    title: '生成条形码',
    content: `确定要为商品“${row.name}”生成条形码吗？`,
    positiveText: '生成',
    negativeText: '取消',
    onPositiveClick: () => {
      // 生成条形码图片并在当前页面弹窗显示
      const sn = row.sn
      const canvas = document.createElement('canvas')
      JsBarcode(canvas, sn, { format: 'CODE128', width: 2, height: 80, displayValue: true })
      barcodeImg.value = canvas.toDataURL('image/png')
      barcodeSN.value = sn
      showBarcodeModal.value = true
    }
  })
}

function handleToggleProductStatus(row) {
  dialog.warning({
    title: `切换商品状态`,
    content: `确定要将商品“${row.name}”从${row.is_active ? '下架' : '上架'}吗？`,
    positiveText: '切换',
    negativeText: '取消',
    onPositiveClick: () => {
      loadingBar.start()
      const action = row.is_active ? 'deactivate' : 'activate'
      api.post(`/admin/products/${row.id}/${action}`).then(res => {
        if (res && res.message === 'ok') {
          message.success(`商品【${row.name}】已${action === 'deactivate' ? '下架' : '上架'}`)
          if (selectedCategoryId.value) {
            fetchProductsByCategory(selectedCategoryId.value)
          } else {
            fetchProducts()
          }
          loadingBar.finish()
        } else {
          message.error(`切换状态失败：${res.message}`)
          loadingBar.error()
        }
      }).catch(() => loadingBar.error())
    }
  })
}

function handleDeleteCategory() {
  if (!selectedCategoryId.value) {
    message.warning('请先选择要删除的分类')
    return
  }
  dialog.warning({
    title: '删除分类',
    content: '确定要删除当前分类吗？删除后该分类下商品不会被删除。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      deleteCategoryLoading.value = true
      loadingBar.start()
      api.delete(`/admin/categories/${selectedCategoryId.value}`)
        .then(res => {
          if (res && res.message === 'ok') {
            message.success('分类删除成功')
            fetchCategories()
            fetchProducts()
            loadingBar.finish()
          } else {
            message.error('分类删除失败')
            loadingBar.error()
          }
        })
        .catch(err => {
          loadingBar.error()
        })
        .finally(() => {
          deleteCategoryLoading.value = false
        })
    }
  })
}

const handleImportImages = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file.file)
  try {
    const res = await importProductImages(formData)
    message.success(res.message)
    if (res.unmatched && res.unmatched.length > 0) {
      message.warning('未匹配商品图片：' + res.unmatched.join(','))
    }
  } catch (e) {
    message.error('导入失败')
  }
}



onMounted(() => {
  fetchCategories()
  
  // 路由带id时自动弹出详情
  if (route.query.id) {
    const id = Number(route.query.id)
    if (id) {
      handleShowProductDetail({ id })
    }
  }
})
</script>

<style scoped>
.product-manage-layout {
  display: flex;
  min-height: 80vh;
  background: #f5f7fa;
}
.category-tree-panel {
  width: 200px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(24,144,255,0.08);
  
  min-height: 600px;
}
.product-table-panel {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(24,144,255,0.08);
  min-height: 600px;
  margin-left: 5px;
}
.add-title {
  font-size: 22px;
  font-weight: bold;
  color: #42a5f5;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.add-form {
  padding: 8px 0 0 0;
}

.import-help-content {
  padding: 16px 0;
}

.import-help-content h3 {
  color: #42a5f5;
  margin: 20px 0 12px 0;
  font-size: 16px;
}

.import-help-content p {
  margin: 8px 0;
  color: #666;
  line-height: 1.6;
}

.header-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.header-item {
  background: #f0f9ff;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #bae6fd;
  font-size: 14px;
  color: #0369a1;
  text-align: center;
}

.import-help-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.import-help-content li {
  margin: 6px 0;
  color: #666;
  line-height: 1.5;
}
</style>