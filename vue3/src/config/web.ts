let baseUrl: string
if (import.meta.env.DEV) {
  // console.log('当前是开发环境')
  // 开发时使用的
  baseUrl = 'http://127.0.0.1:58090/' as const
  // baseUrl = 'http://192.168.2.110:58090/' as const
}
// if (import.meta.env.PROD)
else {
  // console.log('当前是生产环境')
  // 部署时，将由后端来托管前端，设置为根路径
  baseUrl = '/' as const
}
export { baseUrl }

// // 开发时使用的
// const baseUrl = 'http://127.0.0.1:8090/' as const

// // 这是为了在手机上测试，需要的话要改为自己电脑的ip
// const baseUrl = 'http://192.168.2.110:8090/' as const

// // 部署时，将由后端来托管前端，设置为根路径
// const baseUrl = '/' as const

// // 远程测试
// const baseUrl = 'https://pototest.sakiko.top/' as const

const timeout = 5000 as const

export const axiosConfig = {
  baseUrl,
}

export const pocketbaseConfig = {
  baseUrl,
}

export const fetchConfig = {
  // baseUrl,
  timeoutPreferred: timeout,
  /**
   * 为了 pocketbase SDK 的
   * requestEmailChange
   * requestVerification
   * requestPasswordReset
   * 而设置的超时时间
   *
   * 服务端pocketbase将发送邮件，用时比较长
   *
   * 30秒
   */
  timeoutForPbRequestWillEmail: 30000,
} as const

export const queryConfig = {
  /** 30秒 */
  staleTimeShort: 30 * 1000,
  /** 5分钟 */
  staleTimeMedium: 5 * 60 * 1000,
  /** 1小时 */
  staleTimeLong: 60 * 60 * 1000,
  /**
   * 将 staleTime 设置为 Infinity 直到查询被 手动失效 之前，都不会触发重新获取。
   */
  staleTimeInfinity: Infinity,
  /**
   * 将 staleTime 设置为 'static'，即使查询被 手动失效，也永远不会触发重新获取。
   * 即使调用 `invalidateQueries()` 或 `refetch()`，也不会触发请求，
   * 应调用 `removeQueries()` 再调用 `refetch()` 来重新请求。
   * 主要用于避免useInfiniteQuery的多页refetch。
   */
  staleTimeStatic: 'static',
  // gcTime 比 staleTime 长一些比较好
  /** 60秒 */
  gcTimeShort: 60 * 1000,
  /** 10分钟 */
  gcTimeMedium: 10 * 60 * 1000,
  /** 2小时 */
  gcTimeLong: 2 * 60 * 60 * 1000,
  /**
   * 将 gcTime 设置为 Infinity ，将禁用垃圾回收。
   */
  gcTimeInfinity: Infinity,

  /**
   * 重试2次（共请求3次）
   */
  retry: 2,
} as const
