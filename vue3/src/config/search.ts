/** 搜索消息查询，分页查询，每页个数 */
export const searchPageMessageListApiPerPageNumConfig = 30 as const

/**
 * 搜索页 路由查询参数 键统一管理，以便在多处使用
 * 用于通过链接来快速搜索
 */
export const searchPageRouterQueryParametersKeyConfig = {
  search: 'search',
} as const
