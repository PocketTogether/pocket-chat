import { queryConfig } from '@/config'
import { ClientResponseError } from 'pocketbase'

/**
 * useQuery useMutation retry pocketbase fetchWithTimeout
 * 仅在 pocketbase 使用的 fetch:fetchWithTimeout 中断（超时）时进行重试（最多重试 2 次）（请求三次）
 *
 * 250715优化，queryRetryPbNetworkError 不止在超时时重试，在所有网络错误时也重试
 */
export const queryRetryPbNetworkError = (
  failureCount: number,
  error: Error
) => {
  // console.log('queryRetryPbNetworkError')
  // console.log(error)
  // console.log(error.name)
  // if (error instanceof ClientResponseError) {
  //   // console.log(error.data)
  //   // console.log(error.isAbort)
  //   // console.log(error.status)
  //   // console.log(error.originalError)
  //   if (error.originalError instanceof TypeError) {
  //     // console.log(error.originalError.name)
  //     // console.log(error.originalError.message)
  //   }
  // }

  // 是否为超时，主要由自己配置的fetchWithTimeoutPreferred引起
  const isPbFetchTimeout = (() => {
    // error.originalError
    // AbortError: signal is aborted without reason
    if (error instanceof ClientResponseError && error.isAbort === true) {
      return true
    }
    return false
  })()

  // 是否为其他网络错误
  const isOtherNetworkError = (() => {
    // error.originalError
    // TypeError: Failed to fetch
    if (
      error instanceof ClientResponseError &&
      error.originalError instanceof TypeError
    ) {
      return true
    }
    return false
  })()

  // 不是请求超时或其他网络问题，不重试
  if (!isPbFetchTimeout && !isOtherNetworkError) {
    return false
  }
  // 已重试2次，不再重试
  if (failureCount >= queryConfig.retry) {
    return false
  }
  // 重试
  return true
}
