import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import {
  pbUsersNotViewingMarksInitGetListApi,
  pbUsersPresencesStatusInitGetListApi,
} from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'
import { useProfileQuery } from './profile'
import { usePbCollectionConfigQuery } from './pb-collection-config'
import { useAuthStore } from '@/stores'

export const useUsersPresencesStatusInitGetListQuery = () => {
  const query = useQuery({
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

export const useUsersNotViewingMarksInitGetListQuery = () => {
  const query = useQuery({
    queryKey: computed(() => queryKeys.usersNotViewingMarksInitGetList()),
    queryFn: async () => {
      const pbRes = await pbUsersNotViewingMarksInitGetListApi()
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
