import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import { pbUsersPresencesStatusInitGetListApi } from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'
import { useProfileQuery } from './profile'
import { usePbCollectionConfigQuery } from './pb-collection-config'
import { useAuthStore } from '@/stores'

export const useUsersPresencesStatusInitGetListQuery = () => {
  // const pbCollectionConfigQuery = usePbCollectionConfigQuery()
  // // const profileQuery = useProfileQuery() // 通过此判断是否isBanned，不过不是很必要
  // const authStore = useAuthStore()

  const query = useQuery({
    // enabled: computed(() => {
    //   // 判断所需数据未加载完成
    //   if (pbCollectionConfigQuery.data.value == null) {
    //     return false
    //   }
    //   // 允许游客浏览时
    //   if (pbCollectionConfigQuery.data.value['allow-anonymous-view'] === true) {
    //     return true
    //   }
    //   // 不允许游客浏览时
    //   else {
    //     // 当前已登录
    //     if (authStore.isValid === true && authStore.record?.id != null) {
    //       return true
    //     }
    //     // 当前未登录
    //     else {
    //       return false
    //     }
    //   }
    // }),
    queryKey: computed(() => queryKeys.usersPresencesStatusInitGetList()),
    queryFn: async () => {
      const pbRes = await pbUsersPresencesStatusInitGetListApi()
      return pbRes
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}
