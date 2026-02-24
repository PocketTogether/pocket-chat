import { useRouterHistoryStore } from '@/stores'
import type { SearchMessageQueryDesuwaType } from './query-desuwa'
import { injectAppMainElScrollbar, useOnComponentLeave } from '@/composables'

/** 页面恢复数据获取 */
export const useSearchPagePageRecoverDataDesuwa = () => {
  const routerHistoryStore = useRouterHistoryStore()

  const searchPagePageRecoverData =
    routerHistoryStore.currentGetPageRecoverDataForSearchPageItem()

  return {
    searchPagePageRecoverData,
  }
}

export type SearchPagePageRecoverDataDesuwaType = ReturnType<
  typeof useSearchPagePageRecoverDataDesuwa
>

/** 页面恢复 滚动恢复 */
export const useSearchPagePageRecoverScrollTop = (data: {
  searchPagePageRecoverDataDesuwa: SearchPagePageRecoverDataDesuwaType
}) => {
  const { searchPagePageRecoverDataDesuwa } = data

  const {
    // 页面恢复数据
    searchPagePageRecoverData,
  } = searchPagePageRecoverDataDesuwa

  const appMainElScrollbar = injectAppMainElScrollbar()

  onMounted(async () => {
    // 无 页面恢复数据 直接返回
    if (searchPagePageRecoverData == null) {
      return
    }

    await nextTick()

    appMainElScrollbar.value?.wrapRef?.scrollTo({
      top: searchPagePageRecoverData.data.appMainElScrollbarScrollTop, // 滚动到原先的位置
      behavior: 'instant',
    })
  })
}

/**
 * 页面恢复数据收集
 * onBeforeUnmount
 * onBeforeRouteLeave
 */
export const useSearchPagePageRecoverDataSetOnLeave = (data: {
  //
  searchMessageQueryDesuwa: SearchMessageQueryDesuwaType
}) => {
  const {
    //
    searchMessageQueryDesuwa,
  } = data

  const {
    //
    searchmessageQuerySortMode,
    searchmessageQuerySearch,
    searchmessageQueryPage,
  } = searchMessageQueryDesuwa

  // const windowSize = useWindowSize()

  const appMainElScrollbar = injectAppMainElScrollbar()

  const routerHistoryStore = useRouterHistoryStore()

  const searchPagePageRecoverDataSet = () => {
    routerHistoryStore.currentSetPageRecoverDataForSearchPageItem({
      searchmessageQuerySortMode: searchmessageQuerySortMode.value,
      searchmessageQuerySearch: searchmessageQuerySearch.value,
      searchmessageQueryPage: searchmessageQueryPage.value,
      appMainElScrollbarScrollTop: appMainElScrollbar.value?.wrapRef?.scrollTop,
    })
  }

  // 在组件离开时执行 页面恢复数据收集
  useOnComponentLeave(searchPagePageRecoverDataSet)
}
