<template>
  <n-loading-bar-provider>
    <n-message-provider>
      <n-dialog-provider>
        <router-view />
      </n-dialog-provider>
    </n-message-provider>
  </n-loading-bar-provider>
</template>

<script setup>
</script>

<style>
body, #app {
  background: #666a6f !important;
}
</style>