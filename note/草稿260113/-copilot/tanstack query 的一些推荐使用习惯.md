tanstack query 的一些推荐使用习惯
```
可参考 E:\Project\pocket-chat\vue3\src\queries\profile.ts
useXxxxQuery 之类的，推荐写在，src\queries 中的文件中
useMutation 之类的，推荐在vue文件里写，或封装到 src\queries 中都可以

E:\Project\pocket-chat\vue3\src\queries\profile.ts
import { pbUsersGetOneApi } from '@/api'
import { queryConfig } from '@/config'
import { pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { useAuthStore } from '@/stores'
import { useQuery } from '@tanstack/vue-query'
// 个人信息查询
export const useProfileQuery = () => {
  const authStore = useAuthStore()
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
      return pbRes
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })
  return {
    ...query,
  }
}
```
