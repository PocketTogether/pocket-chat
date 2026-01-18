import { useRouterHistoryStore } from '@/stores'
import type { FileQueryModeDesuwaType } from './query-mode'
import type { FileSelectListDesuwaType } from './select-list'
import { injectAppMainElScrollbar, useOnComponentLeave } from '@/composables'
import { watchUntilSourceCondition } from '@/utils'
import type { RefFilePageFileListType } from './dependencies'
import { useWindowSize } from '@vueuse/core'

/** 页面恢复数据获取 */
export const useFileSelectPagePageRecoverDataDesuwa = () => {
  const routerHistoryStore = useRouterHistoryStore()

  const fileSelectPagePageRecoverData =
    routerHistoryStore.currentGetPageRecoverDataForFileSelectPageItem()

  // fileQueryMode: FileQueryModeMarkType;
  // fileQuerySearch: string;
  // fileQueryPage: number;
  // 在 useFileQueryModeDesuwa 初始化
  // src\views\file\composables\query-mode.ts

  // fileSelectList: {
  //     ...;
  // }[];
  // 在 useFileSelectListDesuwa 初始化
  // src\views\file\composables\select-list.ts

  return {
    fileSelectPagePageRecoverData,
  }
}

export type FileSelectPagePageRecoverDataDesuwaType = ReturnType<
  typeof useFileSelectPagePageRecoverDataDesuwa
>

/** 页面恢复 滚动恢复 */
export const useFileSelectPagePageRecoverScrollTop = (data: {
  fileSelectPagePageRecoverDataDesuwa: FileSelectPagePageRecoverDataDesuwaType
}) => {
  const { fileSelectPagePageRecoverDataDesuwa } = data

  const {
    // 页面恢复数据
    fileSelectPagePageRecoverData,
  } = fileSelectPagePageRecoverDataDesuwa

  const appMainElScrollbar = injectAppMainElScrollbar()

  onMounted(async () => {
    // 无 页面恢复数据 直接返回
    if (fileSelectPagePageRecoverData == null) {
      return
    }

    await nextTick()

    appMainElScrollbar.value?.wrapRef?.scrollTo({
      top: fileSelectPagePageRecoverData.data.appMainElScrollbarScrollTop, // 滚动到原先的位置
      behavior: 'instant',
    })
  })
}

/**
 * 页面恢复数据收集
 * onBeforeUnmount
 * onBeforeRouteLeave
 */
export const useFileSelectPagePageRecoverDataSetOnLeave = (data: {
  //
  fileQueryModeDesuwa: FileQueryModeDesuwaType
  fileSelectListDesuwa: FileSelectListDesuwaType
  refFilePageFileList: RefFilePageFileListType
}) => {
  const {
    //
    fileQueryModeDesuwa,
    fileSelectListDesuwa,
    refFilePageFileList,
  } = data

  const {
    //
    fileQueryMode,
    fileQuerySearch,
    fileQueryPage,
  } = fileQueryModeDesuwa

  const {
    //
    fileSelectList,
  } = fileSelectListDesuwa

  // const windowSize = useWindowSize()

  const appMainElScrollbar = injectAppMainElScrollbar()

  const routerHistoryStore = useRouterHistoryStore()

  const fileSelectPagePageRecoverDataSet = () => {
    routerHistoryStore.currentSetPageRecoverDataForFileSelectPageItem({
      fileQueryMode: fileQueryMode.value,
      fileQuerySearch: fileQuerySearch.value,
      fileQueryPage: fileQueryPage.value,
      fileSelectList: fileSelectList.value,
      appMainElScrollbarScrollTop: appMainElScrollbar.value?.wrapRef?.scrollTop,
      // windowWidth: windowSize.width.value,
      layoutBoxWidth: refFilePageFileList.value?.layoutBoxWidth,
      transBoxHeight: refFilePageFileList.value?.transBoxHeight,
    })
  }

  // 在组件离开时执行 页面恢复数据收集
  useOnComponentLeave(fileSelectPagePageRecoverDataSet)
}
