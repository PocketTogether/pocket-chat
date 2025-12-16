import { pbUsersGetOneApi } from '@/api'
import { queryConfig } from '@/config'
import { pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { useAuthStore, usePlaceholderDataProfileStore } from '@/stores'
import { useQuery } from '@tanstack/vue-query'

// 个人信息查询
export const useProfileQuery = () => {
  const authStore = useAuthStore()

  const placeholderDataStore = usePlaceholderDataProfileStore()

  const query = useQuery({
    // 查询依赖，需登录（响应式）
    enabled: computed(() => authStore.isValid && authStore.record?.id != null),
    // 查询键（响应式）
    queryKey: computed(() => queryKeys.profile(authStore.record?.id ?? '')),
    // 查询函数
    queryFn: async () => {
      // 未登录，抛出错误
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        throw new Error(
          '!pb.authStore.isValid || pb.authStore.record?.id == null'
        )
      }
      // pb请求
      const pbRes = await pbUsersGetOneApi(pb.authStore.record.id)
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
