import type { UserPageSortModeType } from '@/api'
import { queryKeys, useUserPageListQuery } from '@/queries'
import { useQueryClient } from '@tanstack/vue-query'
import type { UserListPagePageRecoverDataDesuwaType } from './dependencies'

export const useUserQueryModeDesuwa = (data: {
  userListPagePageRecoverDataDesuwa: UserListPagePageRecoverDataDesuwaType
}) => {
  const {
    //
    userListPagePageRecoverDataDesuwa,
  } = data

  const {
    // 页面恢复数据
    userListPagePageRecoverData,
  } = userListPagePageRecoverDataDesuwa

  // 查询排序模式
  const userQuerySortMode = ref<UserPageSortModeType>('joined_at_desc')

  // 查询搜索
  const userQuerySearch = ref<string>('')

  // 查询页数
  const userQueryPage = ref(1)

  // 初始化、页面数据恢复
  if (userListPagePageRecoverData != null) {
    userQuerySortMode.value = userListPagePageRecoverData.data.userQuerySortMode
    userQuerySearch.value = userListPagePageRecoverData.data.userQuerySearch
    userQueryPage.value = userListPagePageRecoverData.data.userQueryPage
  }

  // 查询排序模式切换
  // 切换至 joined_at_desc
  const userQuerySortModeSetToJoinedAtDesc = () => {
    userQuerySortMode.value = 'joined_at_desc'
    userQueryPage.value = 1
  }
  // 切换至 joined_at_asc
  const userQuerySortModeSetToJoinedAtAsc = () => {
    userQuerySortMode.value = 'joined_at_asc'
    userQueryPage.value = 1
  }

  // 查询搜索设置
  const userQuerySearchSet = (val: string) => {
    userQuerySearch.value = val
    userQueryPage.value = 1
  }

  // 查询页数设置
  const userQueryPageSet = (val: number) => {
    userQueryPage.value = val
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
      userQueryPage.value = 1

      await queryClient.invalidateQueries({
        queryKey: queryKeys.userPageList(),
      })
    } finally {
      isUserQueryRefreshRunning.value = false
    }
  }

  const userPageListQuery = useUserPageListQuery({
    pageNum: computed(() => {
      return userQueryPage.value
    }),
    sortMode: computed(() => {
      return userQuerySortMode.value
    }),
    searchContent: computed(() => {
      return userQuerySearch.value
    }),
    customStrId: computed(() => 'userPageListQuery'),
  })

  return {
    //
    userQuerySortMode,
    userQuerySearch,
    userQueryPage,
    userQuerySortModeSetToJoinedAtDesc,
    userQuerySortModeSetToJoinedAtAsc,
    userQuerySearchSet,
    userQueryPageSet,
    isUserQueryRefreshRunning,
    userQueryRefresh,
    userPageListQuery,
  }
}

export type UserQueryModeDesuwaType = ReturnType<typeof useUserQueryModeDesuwa>
