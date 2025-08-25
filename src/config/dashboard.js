// Dashboard配置
export const dashboardConfig = {
  // 是否使用集合接口（推荐）
  useCombinedApi: true,
  
  // 是否保留原有接口作为备用
  keepLegacyApi: true,
  
  // 默认时间范围
  defaultTimeRange: 7,
  
  // 支持的时间范围选项
  timeRangeOptions: [
    { label: '近7天', value: 7 },
    { label: '近30天', value: 30 },
    { label: '近90天', value: 90 },
    { label: '近1年', value: 365 }
  ],
  
  // 重试配置
  retryConfig: {
    maxRetries: 3,           // 最大重试次数
    retryDelay: 2000,        // 重试延迟（毫秒）
    backoffFactor: 2,        // 退避因子
  },
  
  // 超时配置
  timeoutConfig: {
    combinedApi: 60000,      // 集合接口超时时间（毫秒）
    individualApi: 30000,    // 单独接口超时时间（毫秒）
    fallbackDelay: 1000,     // 降级延迟（毫秒）
  },
  
  // 图表配置
  chartConfig: {
    // 销售趋势图表
    salesTrend: {
      height: 320,
      colors: {
        orders: '#2080f0',
        sales: '#fa8c16'
      }
    },
    
    // 分类分布图表
    categoryDistribution: {
      height: 320,
      radius: ['40%', '70%']
    },
    
    // 用户增长图表
    userGrowth: {
      height: 320,
      colors: {
        primary: '#18a058',
        secondary: '#36ad6a'
      }
    }
  },
  
  // 数据刷新配置
  refreshConfig: {
    // 自动刷新间隔（毫秒），0表示不自动刷新
    autoRefreshInterval: 0,
    
    // 刷新确认提示
    showRefreshConfirm: true,
    
    // 刷新成功提示
    showSuccessMessage: true,
    
    // 智能重试
    enableSmartRetry: true,
    
    // 降级策略
    enableFallback: true,
  },
  
  // 错误处理配置
  errorHandling: {
    // 显示详细错误信息
    showDetailedErrors: false,
    
    // 自动降级到原有接口
    autoFallback: true,
    
    // 错误重试提示
    showRetryMessage: true,
    
    // 网络错误特殊处理
    handleNetworkError: true,
  }
}

export default dashboardConfig
