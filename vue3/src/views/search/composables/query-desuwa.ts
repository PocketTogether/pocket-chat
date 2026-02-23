import type { SearchPageSortModeType } from '@/api'
import { queryKeys, useSearchPageMessageListQuery } from '@/queries'
import { useQueryClient } from '@tanstack/vue-query'
// import type { SearchMessageListPagePageRecoverDataDesuwaType } from './dependencies'

export const useSearchMessageQueryDesuwa = (data: {
  // searchmessageListPagePageRecoverDataDesuwa: SearchMessageListPagePageRecoverDataDesuwaType
}) => {
  const {
    //
    // searchmessageListPagePageRecoverDataDesuwa,
  } = data

  // const {
  //   // 页面恢复数据
  //   searchmessageListPagePageRecoverData,
  // } = searchmessageListPagePageRecoverDataDesuwa

  // 查询排序模式
  const searchmessageQuerySortMode = ref<SearchPageSortModeType>('created_desc')

  // 查询搜索
  const searchmessageQuerySearch = ref<string>('')

  // 查询页数
  const searchmessageQueryPage = ref(1)

  // // 初始化、页面数据恢复
  // if (searchmessageListPagePageRecoverData != null) {
  //   searchmessageQuerySortMode.value = searchmessageListPagePageRecoverData.data.searchmessageQuerySortMode
  //   searchmessageQuerySearch.value = searchmessageListPagePageRecoverData.data.searchmessageQuerySearch
  //   searchmessageQueryPage.value = searchmessageListPagePageRecoverData.data.searchmessageQueryPage
  // }

  // 查询排序模式切换
  // 切换至 created_desc
  const searchmessageQuerySortModeSetToDesc = () => {
    searchmessageQuerySortMode.value = 'created_desc'
    searchmessageQueryPage.value = 1
  }
  // 切换至 created_asc
  const searchmessageQuerySortModeSetToAsc = () => {
    searchmessageQuerySortMode.value = 'created_asc'
    searchmessageQueryPage.value = 1
  }

  // 查询搜索设置
  const searchmessageQuerySearchSet = (val: string) => {
    searchmessageQuerySearch.value = val
    searchmessageQueryPage.value = 1
  }

  // 查询页数设置
  const searchmessageQueryPageSet = (val: number) => {
    searchmessageQueryPage.value = val
  }

  const queryClient = useQueryClient()

  // 是否正在刷新
  const isSearchMessageQueryRefreshRunning = ref(false)
  // 查询刷新
  const searchmessageQueryRefresh = async () => {
    if (isSearchMessageQueryRefreshRunning.value) return
    isSearchMessageQueryRefreshRunning.value = true

    try {
      // 页面重置
      searchmessageQueryPage.value = 1

      await queryClient.invalidateQueries({
        queryKey: queryKeys.searchPageMessageList(),
      })
    } finally {
      isSearchMessageQueryRefreshRunning.value = false
    }
  }

  const searchmessagePageListQuery = useSearchPageMessageListQuery({
    pageNum: computed(() => {
      return searchmessageQueryPage.value
    }),
    sortMode: computed(() => {
      return searchmessageQuerySortMode.value
    }),
    searchContent: computed(() => {
      return searchmessageQuerySearch.value
    }),
    customStrId: computed(() => 'searchmessagePageListQuery'),
  })

  return {
    //
    searchmessageQuerySortMode,
    searchmessageQuerySearch,
    searchmessageQueryPage,
    searchmessageQuerySortModeSetToDesc,
    searchmessageQuerySortModeSetToAsc,
    searchmessageQuerySearchSet,
    searchmessageQueryPageSet,
    isSearchMessageQueryRefreshRunning,
    searchmessageQueryRefresh,
    searchmessagePageListQuery,
  }
}

export type SearchMessageQueryDesuwaType = ReturnType<
  typeof useSearchMessageQueryDesuwa
>
