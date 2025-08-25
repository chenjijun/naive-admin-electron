// Dashboard智能重试和降级机制
import { dashboardApi } from '@/api'
import dashboardConfig from '@/config/dashboard'

/**
 * 智能重试机制
 * @param {Function} apiCall - API调用函数
 * @param {Object} options - 重试选项
 * @returns {Promise} API响应结果
 */
export async function smartRetry(apiCall, options = {}) {
  const {
    maxRetries = dashboardConfig.retryConfig.maxRetries,
    retryDelay = dashboardConfig.retryConfig.retryDelay,
    backoffFactor = dashboardConfig.retryConfig.backoffFactor,
    onRetry = null,
    onError = null
  } = options

  let lastError = null
  let delay = retryDelay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall()
      return result
    } catch (error) {
      lastError = error
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        if (onError) onError(error, attempt)
        throw error
      }

      // 检查是否应该重试
      if (!shouldRetry(error)) {
        throw error
      }

      // 执行重试回调
      if (onRetry) onRetry(error, attempt, delay)

      // 等待后重试
      await sleep(delay)
      
      // 指数退避
      delay *= backoffFactor
    }
  }

  throw lastError
}

/**
 * 判断是否应该重试
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否应该重试
 */
function shouldRetry(error) {
  // 网络错误、超时错误等可以重试
  if (error.code === 'ECONNABORTED' || 
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      !error.response) {
    return true
  }
  
  // 服务器错误可以重试
  if (error.response?.status >= 500) {
    return true
  }
  
  // 其他错误不重试
  return false
}

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} 延迟Promise
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 智能降级策略
 * @param {Function} primaryApi - 主要API（集合接口）
 * @param {Function} fallbackApi - 降级API（原有接口）
 * @param {Object} options - 降级选项
 * @returns {Promise} API响应结果
 */
export async function smartFallback(primaryApi, fallbackApi, options = {}) {
  const {
    enableFallback = dashboardConfig.refreshConfig.enableFallback,
    fallbackDelay = dashboardConfig.timeoutConfig.fallbackDelay,
    onFallback = null,
    onPrimarySuccess = null,
    onFallbackSuccess = null
  } = options

  try {
    // 尝试主要API
    const result = await primaryApi()
    if (onPrimarySuccess) onPrimarySuccess(result)
    return result
  } catch (error) {
    console.warn('主要API失败，尝试降级:', error.message)
    
    // 如果不启用降级，直接抛出错误
    if (!enableFallback) {
      throw error
    }

    // 延迟后尝试降级API
    await sleep(fallbackDelay)
    
    try {
      const fallbackResult = await fallbackApi()
      if (onFallback) onFallback(error, fallbackResult)
      if (onFallbackSuccess) onFallbackSuccess(fallbackResult)
      return fallbackResult
    } catch (fallbackError) {
      console.error('降级API也失败:', fallbackError.message)
      throw fallbackError
    }
  }
}

/**
 * Dashboard数据获取的智能策略
 * @param {number} days - 时间范围
 * @param {Object} options - 选项
 * @returns {Promise} Dashboard数据
 */
export async function getDashboardDataWithFallback(days = 7, options = {}) {
  const {
    enableRetry = true,
    enableFallback = true,
    onProgress = null
  } = options

  // 主要API：集合接口
  const primaryApi = () => dashboardApi.getAllData(days)
  
  // 降级API：原有接口组合
  const fallbackApi = async () => {
    if (onProgress) onProgress('使用降级接口获取数据...')
    
    const [
      stats,
      monthlyStats,
      salesTrend,
      categoryDist,
      userGrowth,
      topProducts,
      recentOrders
    ] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getMonthlyStats(),
      dashboardApi.getSalesTrend(days),
      dashboardApi.getCategoryDistribution(),
      dashboardApi.getUserGrowth(days),
      dashboardApi.getTopProducts(),
      dashboardApi.getRecentOrders()
    ])
    
    // 模拟集合接口的数据结构
    return {
      message: 'ok',
      data: {
        stats: stats.data,
        monthly_stats: monthlyStats.data,
        sales_trend: salesTrend.data,
        user_growth: userGrowth.data,
        category_distribution: categoryDist.data,
        top_products: topProducts.data,
        recent_orders: recentOrders.data,
        low_stock_products: [] // 降级接口不包含低库存数据
      },
      meta: {
        source: 'fallback',
        timestamp: new Date().toISOString()
      }
    }
  }

  if (enableRetry && enableFallback) {
    // 启用重试和降级
    return smartRetry(
      () => smartFallback(primaryApi, fallbackApi, { onProgress }),
      { onRetry: (error, attempt) => console.log(`重试第${attempt}次...`) }
    )
  } else if (enableRetry) {
    // 只启用重试
    return smartRetry(primaryApi)
  } else if (enableFallback) {
    // 只启用降级
    return smartFallback(primaryApi, fallbackApi, { onProgress })
  } else {
    // 都不启用，直接调用主要API
    return primaryApi()
  }
}

export default {
  smartRetry,
  smartFallback,
  getDashboardDataWithFallback
}
