<template>
  <n-card title="活动商品管理">
    <n-tabs v-model:value="activeTab" type="line">
      <n-tab-pane name="hot" tab="爆款商品">
        <ProductTable :type="'hot'" />
      </n-tab-pane>
      <n-tab-pane name="new" tab="新品">
        <ProductTable :type="'new'" />
      </n-tab-pane>
      <n-tab-pane name="top" tab="特价商品">
        <ProductTable :type="'top'" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>
<script setup name="ActivityProduct">
import { ref } from 'vue'
import ProductTable from './ProductTable.vue'
const activeTab = ref('hot')
</script> 