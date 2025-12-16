import { pbUsersListAuthMethodsApi } from '@/api'
import { queryConfig } from '@/config'
import { Collections, pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { usePlaceholderDataListAuthMethodsStore } from '@/stores'
import { fetchWithTimeoutPreferred } from '@/utils'
import { useQuery } from '@tanstack/vue-query'

// listAuthMethods 查询
export const useListAuthMethodsQuery = () => {
  const placeholderDataStore = usePlaceholderDataListAuthMethodsStore()

  const query = useQuery({
    // 查询键
    queryKey: queryKeys.listAuthMethods(),
    // 查询函数
    queryFn: async () => {
      // pb请求
      const pbRes = await pbUsersListAuthMethodsApi()
      // console.log(pbRes)

      // 将 pbRes 持久化，以用于 placeholderData
      placeholderDataStore.set(pbRes)

      return pbRes
    },
    // 占位数据
    placeholderData: computed(() => {
      if (placeholderDataStore.data != null) {
        return placeholderDataStore.data
      }
      return undefined
    }),
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}
