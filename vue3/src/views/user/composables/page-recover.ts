import { useRouterHistoryStore } from '@/stores'
import type { UserQueryModeDesuwaType } from './query-mode'
import { injectAppMainElScrollbar, useOnComponentLeave } from '@/composables'
import { watchUntilSourceCondition } from '@/utils'
import type { RefUserListPageUserListType } from './dependencies'
import { useWindowSize } from '@vueuse/core'

/** 页面恢复数据获取 */
export const useUserListPagePageRecoverDataDesuwa = () => {
  const routerHistoryStore = useRouterHistoryStore()

  const userListPagePageRecoverData =
    routerHistoryStore.currentGetPageRecoverDataForUserListPageItem()

  return {
    userListPagePageRecoverData,
  }
}

export type UserListPagePageRecoverDataDesuwaType = ReturnType<
  typeof useUserListPagePageRecoverDataDesuwa
>

/** 页面恢复 滚动恢复 */
export const useUserListPagePageRecoverScrollTop = (data: {
  userListPagePageRecoverDataDesuwa: UserListPagePageRecoverDataDesuwaType
}) => {
  const { userListPagePageRecoverDataDesuwa } = data

  const {
    // 页面恢复数据
    userListPagePageRecoverData,
  } = userListPagePageRecoverDataDesuwa

  const appMainElScrollbar = injectAppMainElScrollbar()

  onMounted(async () => {
    // 无 页面恢复数据 直接返回
    if (userListPagePageRecoverData == null) {
      return
    }

    await nextTick()

    appMainElScrollbar.value?.wrapRef?.scrollTo({
      top: userListPagePageRecoverData.data.appMainElScrollbarScrollTop, // 滚动到原先的位置
      behavior: 'instant',
    })
  })
}

/**
 * 页面恢复数据收集
 * onBeforeUnmount
 * onBeforeRouteLeave
 */
export const useUserListPagePageRecoverDataSetOnLeave = (data: {
  //
  userQueryModeDesuwa: UserQueryModeDesuwaType
  refUserListPageUserList: RefUserListPageUserListType
}) => {
  const {
    //
    userQueryModeDesuwa,
    refUserListPageUserList,
  } = data

  const {
    //
    userQuerySortMode,
    userQuerySearch,
    userQueryPage,
  } = userQueryModeDesuwa

  // const windowSize = useWindowSize()

  const appMainElScrollbar = injectAppMainElScrollbar()

  const routerHistoryStore = useRouterHistoryStore()

  const userListPagePageRecoverDataSet = () => {
    routerHistoryStore.currentSetPageRecoverDataForUserListPageItem({
      userQuerySortMode: userQuerySortMode.value,
      userQuerySearch: userQuerySearch.value,
      userQueryPage: userQueryPage.value,
      appMainElScrollbarScrollTop: appMainElScrollbar.value?.wrapRef?.scrollTop,
      // windowWidth: windowSize.width.value,
      layoutBoxWidth: refUserListPageUserList.value?.layoutBoxWidth,
      transBoxHeight: refUserListPageUserList.value?.transBoxHeight,
    })
  }

  // 在组件离开时执行 页面恢复数据收集
  useOnComponentLeave(userListPagePageRecoverDataSet)
}
