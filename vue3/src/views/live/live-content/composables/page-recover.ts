import { useRouterHistoryStore } from '@/stores'
import { useOnComponentLeave } from '@/composables'
import type { PropsLiveContentType } from './dependencies'
import type { LiveListUserDesuwaType } from './list-user'

/** 页面恢复数据获取 */
export const useLiveContentPageRecoverDataDesuwa = () => {
  const routerHistoryStore = useRouterHistoryStore()

  const liveContentPageRecoverData =
    routerHistoryStore.currentGetPageRecoverDataForLiveContentItem()

  return {
    liveContentPageRecoverData,
  }
}

export type LiveContentPageRecoverDataDesuwaType = ReturnType<
  typeof useLiveContentPageRecoverDataDesuwa
>

/** 页面恢复 滚动恢复 */
export const useLiveContentPageRecoverScrollTop = (data: {
  props: PropsLiveContentType
  liveContentPageRecoverDataDesuwa: LiveContentPageRecoverDataDesuwaType
}) => {
  const { liveContentPageRecoverDataDesuwa, props } = data

  const {
    // 页面恢复数据
    liveContentPageRecoverData,
  } = liveContentPageRecoverDataDesuwa

  // const appMainElScrollbar = injectAppMainElScrollbar()

  onMounted(async () => {
    // 无 页面恢复数据 直接返回
    if (liveContentPageRecoverData?.data.refScrollWarpScrollTop == null) {
      return
    }

    await nextTick()

    props.refScrollWarp?.scrollTo({
      top: liveContentPageRecoverData.data.refScrollWarpScrollTop, // 滚动到原先的位置
      behavior: 'instant',
    })
  })
}

/**
 * 页面恢复数据收集
 * onBeforeUnmount
 * onBeforeRouteLeave
 */
export const useLiveContentPageRecoverDataSetOnLeave = (data: {
  //
  props: PropsLiveContentType
  liveListUserDesuwa: LiveListUserDesuwaType
}) => {
  const {
    //
    props,
    liveListUserDesuwa,
  } = data

  // const windowSize = useWindowSize()

  // const appMainElScrollbar = injectAppMainElScrollbar()

  const routerHistoryStore = useRouterHistoryStore()

  const liveContentPageRecoverDataSet = () => {
    routerHistoryStore.currentSetPageRecoverDataForLiveContentItem({
      isExpandedLiveListUserDesuwa: liveListUserDesuwa.isExpanded.value,
      refScrollWarpScrollTop: props.refScrollWarp?.scrollTop,
    })
  }

  // 在组件离开时执行 页面恢复数据收集
  useOnComponentLeave(liveContentPageRecoverDataSet)
}
