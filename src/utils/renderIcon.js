import { h } from 'vue'

/**
 * 渲染图标的工具函数
 * @param {Object} icon - 图标组件
 * @returns {Function} 渲染函数
 */
export function renderIcon(icon) {
  return () => h(icon)
}