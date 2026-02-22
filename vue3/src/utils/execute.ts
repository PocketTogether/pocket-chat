/**
 * 执行异步任务并根据可配置的重试策略进行自动重试（框架无关、前后端通用）。
 *
 * 适用场景：
 * - 网络请求（fetch、PocketBase、Axios）
 * - 数据库操作
 * - 文件 IO
 * - 任意可能失败的异步任务
 *
 * 功能特性：
 * - 可 await
 * - 可配置最大重试次数
 * - 可配置初始延迟与指数退避（backoff）
 * - 可配置 shouldRetry 策略函数（决定是否继续重试）
 * - 不依赖任何框架（Vue、React、TanStack Query）
 * - 可在浏览器、Node、Cloudflare Worker、PB Hooks 中使用
 *
 * @template T 返回值类型
 * @param taskFn 实际执行的异步任务函数（必须返回 Promise）
 * @param options 重试配置
 * @returns Promise<T>
 */
export async function executeAsyncTaskWithRetryStrategy<T>(
  taskFn: () => Promise<T>,
  options: {
    /** 最大重试次数（不含首次执行），默认 4 次 */
    maxRetries?: number

    /** 初始延迟（毫秒），默认 300ms */
    initialDelayMs?: number

    /** 指数退避因子，默认 2（即 300 → 600 → 1200） */
    backoffFactor?: number

    /**
     * 自定义重试策略函数
     * @param failureCount 当前是第几次失败（从 1 开始）
     * @param error 捕获到的错误对象
     * @returns 是否应该继续重试
     */
    shouldRetry?: (failureCount: number, error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 4,
    initialDelayMs = 300,
    backoffFactor = 2,
    shouldRetry = () => true, // 默认所有错误都重试
  } = options

  let attempt = 0
  let delay = initialDelayMs

  while (true) {
    try {
      // 尝试执行异步任务
      return await taskFn()
    } catch (error) {
      // 若策略函数判断不应重试 → 直接抛出
      if (!shouldRetry(attempt, error)) {
        throw error
      }

      attempt += 1

      // 超过最大重试次数 → 抛出
      if (attempt > maxRetries) {
        throw error
      }

      // 等待 delay 毫秒（指数退避）
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= backoffFactor
    }
  }
}
