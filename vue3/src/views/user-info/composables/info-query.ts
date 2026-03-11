import {
  queryKeys,
  useUserInfoMessageListQuery,
  useUsersGetOneQuery,
} from '@/queries'
import type { UserInfoRouteParamsType } from './dependencies'
import { useQueryClient } from '@tanstack/vue-query'
// import { useAuthStore } from '@/stores'
// import type { UsersResponseWithBaseExpand } from '@/api'
// import { compareDatesSafe } from '@/utils'

export const useUserInfoQueryDesuwa = (data: {
  userInfoRouteParams: UserInfoRouteParamsType
}) => {
  const {
    //
    userInfoRouteParams,
  } = data

  const userId = computed(() => userInfoRouteParams.value.id)

  const usersGetOneQuery = useUsersGetOneQuery({
    userId,
  })

  // 【260220】用户这一块暂不用实时
  // const realtimeUsersStore = useRealtimeUsersStore()

  // 经过实时优化的文件数据，会使用较新的数据
  const userInfoDataWithRealtime = computed(() => {
    if (userId.value == null) {
      return null
    }
    const fromQuery = usersGetOneQuery.data.value
    // const fromRealtime = realtimeUsersStore.updateListFindLatestById(
    //   userId.value
    // )
    // // 两者都有 → 比较 updated
    // if (fromQuery != null && fromRealtime != null) {
    //   if (fromRealtime.updated > fromQuery.updated) {
    //     return fromRealtime
    //   } else {
    //     return fromQuery
    //   }
    // }
    // // 只有 query 有
    // if (fromQuery != null) {
    //   return fromQuery
    // }
    // // 只有 realtime 有
    // if (fromRealtime != null) {
    //   return fromRealtime
    // }
    // // 两者都不存在
    // return null
    return fromQuery
  })

  const userInfoQueryStatus = computed(() => {
    // 有内容
    if (userInfoDataWithRealtime.value != null) {
      // 特殊情况已封禁
      if (userInfoDataWithRealtime.value.isBanned === true) {
        return 'isBanned'
      }
      return 'content' as const
    }
    // 加载中
    if (
      userInfoDataWithRealtime.value == null &&
      usersGetOneQuery.isFetching.value === true
    ) {
      return 'loading' as const
    }
    // 无内容（文件id不存在）
    return 'none' as const
  })

  const userInfoMessageListPageNum = ref(1)

  const userInfoMessageListQuery = useUserInfoMessageListQuery({
    pageNum: computed(() => userInfoMessageListPageNum.value),
    userId,
  })

  // 查询页数设置
  const userInfoMessageListPageSet = (val: number) => {
    userInfoMessageListPageNum.value = val
  }

  const queryClient = useQueryClient()

  // 是否正在刷新
  const isUserQueryRefreshRunning = ref(false)
  // 查询刷新
  const userQueryRefresh = async () => {
    if (isUserQueryRefreshRunning.value) return
    isUserQueryRefreshRunning.value = true

    try {
      // 页面重置
      // userInfoMessageListPageNum.value = 1

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.usersGetOne(userId.value),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.userInfoMessageList(userId.value),
        }),
      ])
    } finally {
      isUserQueryRefreshRunning.value = false
    }
  }

  // const authStore = useAuthStore()

  // // 当前是否为发送者
  // const isAuthorCurrent = computed(() => {
  //   if (
  //     userInfoDataWithRealtime.value == null ||
  //     authStore.isValid === false ||
  //     authStore.record?.id == null
  //   ) {
  //     return false
  //   }
  //   if (userInfoDataWithRealtime.value.author === authStore.record.id) {
  //     return true
  //   }
  //   return false
  // })

  // /**
  //  * 用于文件信息修改成功后，根据返回的数据检查并设置setQueryData
  //  * 在 onSuccess 中使用
  //  */
  // const userInfoCheckSetQueryDataOnSuccessUpdate = (
  //   data: UsersResponseWithBaseExpand
  // ) => {
  //   // 更新query
  //   // 更新前，应确认data.update时间为最新的，以此方式避免两次很近的请求导致问题
  //   if (
  //     usersGetOneQuery.data.value != null &&
  //     // data.updated > usersGetOneQuery.data.value.updated
  //     compareDatesSafe(data.updated, usersGetOneQuery.data.value.updated) === 1
  //   ) {
  //     // 更新query缓存
  //     queryClient.setQueryData(
  //       queryKeys.usersGetOne(usersGetOneQuery.data.value.id),
  //       // 确保类型正确
  //       data satisfies NonNullable<typeof usersGetOneQuery.data.value>
  //     )
  //   }
  // }

  return {
    //
    usersGetOneQuery,
    userInfoDataWithRealtime,
    userInfoQueryStatus,
    userInfoMessageListQuery,
    userInfoMessageListPageNum,
    userInfoMessageListPageSet,
    userQueryRefresh,
    isUserQueryRefreshRunning,
    // isAuthorCurrent,
    // userInfoCheckSetQueryDataOnSuccessUpdate,
  }
}

export type UserInfoQueryDesuwaType = ReturnType<typeof useUserInfoQueryDesuwa>
