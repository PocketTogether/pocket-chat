import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import {
  pbUsersNotViewingMarksInitGetListApi,
  pbUsersPresencesStatusInitGetListApi,
  type UsersPresencesStatusResponseWithBaseExpand,
} from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'
import { useProfileQuery } from './profile'
import { usePbCollectionConfigQuery } from './pb-collection-config'
import { useAuthStore } from '@/stores'
import { v4 as uuidv4 } from 'uuid'
import type { UsersNotViewingMarksResponse } from '@/lib'

export const useUsersPresencesStatusInitGetListQuery = () => {
  const query = useQuery({
    queryKey: computed(() => queryKeys.usersPresencesStatusInitGetList()),
    queryFn: async () => {
      const pbRes = await pbUsersPresencesStatusInitGetListApi()
      return {
        ...pbRes,
        // 这次查询的uuid，用作本次查询的唯一标识
        thisTimeQueryUuid: uuidv4(),
      }
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}

// 这个 usequery 封装之中的useQuery的queryFn中，没有任何查询，只是对数据进行处理，以利用其缓存
export const useUsersPresencesStatusInitGetListWithMapByUserProcessQuery =
  () => {
    const usersPresencesStatusInitGetListQuery =
      useUsersPresencesStatusInitGetListQuery()

    const queryProcess = useQuery({
      enabled: computed(
        () => usersPresencesStatusInitGetListQuery.data.value != null
      ),
      queryKey: computed(() =>
        queryKeys.usersPresencesStatusInitGetListWithMapByUserProcess(
          usersPresencesStatusInitGetListQuery.data.value?.thisTimeQueryUuid
        )
      ),
      queryFn: async () => {
        if (
          usersPresencesStatusInitGetListQuery.data.value?.thisTimeQueryUuid ==
          null
        ) {
          throw new Error(
            'usersPresencesStatusInitGetListQuery.data.value?.thisTimeQueryUuid == null'
          )
        }

        /** 初始的一些用户的状态 处理为 latest map */
        const usersPresencesStatusInitLatestMapByUser = (() => {
          const map = new Map<
            string,
            UsersPresencesStatusResponseWithBaseExpand
          >()
          const list =
            usersPresencesStatusInitGetListQuery.data.value?.items ?? []
          for (const item of list) {
            const userId = item.author
            const prev = map.get(userId)
            if (prev == null || item.created > prev.created) {
              map.set(userId, item)
            }
          }
          return map
        })()

        /** 初始的一些用户的状态 处理为 earliest map */
        const usersPresencesStatusInitEarliestMapByUser = (() => {
          const map = new Map<
            string,
            UsersPresencesStatusResponseWithBaseExpand
          >()
          const list =
            usersPresencesStatusInitGetListQuery.data.value?.items ?? []
          for (const item of list) {
            const userId = item.author
            const prev = map.get(userId)
            if (prev == null || item.created < prev.created) {
              map.set(userId, item)
            }
          }
          return map
        })()

        return {
          usersPresencesStatusInitLatestMapByUser,
          usersPresencesStatusInitEarliestMapByUser,
        }
      },
      // 缓存时间和依赖的query保持一致
      gcTime: queryConfig.gcTimeLong,
      staleTime: queryConfig.staleTimeLong,
      // 不重试
      retry: false,
    })

    const usersPresencesStatusInitLatestMapByUser = computed<
      ReadonlyMap<string, UsersPresencesStatusResponseWithBaseExpand>
    >(() => {
      if (queryProcess.data.value == null) {
        return new Map()
      }
      return queryProcess.data.value.usersPresencesStatusInitLatestMapByUser
    })

    const usersPresencesStatusInitEarliestMapByUser = computed<
      ReadonlyMap<string, UsersPresencesStatusResponseWithBaseExpand>
    >(() => {
      if (queryProcess.data.value == null) {
        return new Map()
      }
      return queryProcess.data.value.usersPresencesStatusInitEarliestMapByUser
    })

    return {
      //
      usersPresencesStatusInitLatestMapByUser,
      usersPresencesStatusInitEarliestMapByUser,
    }
  }

export const useUsersNotViewingMarksInitGetListQuery = () => {
  const query = useQuery({
    queryKey: computed(() => queryKeys.usersNotViewingMarksInitGetList()),
    queryFn: async () => {
      const pbRes = await pbUsersNotViewingMarksInitGetListApi()
      return {
        ...pbRes,
        // 这次查询的uuid，用作本次查询的唯一标识
        thisTimeQueryUuid: uuidv4(),
      }
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}

// 这个 usequery 封装之中的useQuery的queryFn中，没有任何查询，只是对数据进行处理，以利用其缓存
export const useUsersNotViewingMarksInitGetListWithMapByUserProcessQuery =
  () => {
    const usersNotViewingMarksInitGetListQuery =
      useUsersNotViewingMarksInitGetListQuery()

    const queryProcess = useQuery({
      enabled: computed(
        () => usersNotViewingMarksInitGetListQuery.data.value != null
      ),
      queryKey: computed(() =>
        queryKeys.usersNotViewingMarksInitGetListWithMapByUserProcess(
          usersNotViewingMarksInitGetListQuery.data.value?.thisTimeQueryUuid
        )
      ),
      queryFn: async () => {
        if (
          usersNotViewingMarksInitGetListQuery.data.value?.thisTimeQueryUuid ==
          null
        ) {
          throw new Error(
            'usersNotViewingMarksInitGetListQuery.data.value?.thisTimeQueryUuid == null'
          )
        }

        /** 初始的一些NotViewingMarks 处理为 latest map */
        const usersNotViewingMarksInitLatestMapByUser = (() => {
          const map = new Map<string, UsersNotViewingMarksResponse>()
          const list =
            usersNotViewingMarksInitGetListQuery.data.value?.items ?? []
          for (const item of list) {
            const userId = item.author
            const prev = map.get(userId)
            if (prev == null || item.created > prev.created) {
              map.set(userId, item)
            }
          }
          return map
        })()

        return {
          //
          usersNotViewingMarksInitLatestMapByUser,
        }
      },
      // 缓存时间和依赖的query保持一致
      gcTime: queryConfig.gcTimeLong,
      staleTime: queryConfig.staleTimeLong,
      // 不重试
      retry: false,
    })

    // ReadonlyMap<string, UsersNotViewingMarksResponse>
    const usersNotViewingMarksInitLatestMapByUser = computed<
      ReadonlyMap<string, UsersNotViewingMarksResponse>
    >(() => {
      if (queryProcess.data.value == null) {
        return new Map()
      }
      return queryProcess.data.value.usersNotViewingMarksInitLatestMapByUser
    })

    return {
      //
      usersNotViewingMarksInitLatestMapByUser,
    }
  }
