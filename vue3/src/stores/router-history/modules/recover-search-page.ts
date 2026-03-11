import type { SearchPageSortModeType } from '@/api'

export type PageRecoverDataForSearchPageItemType = {
  uuid: string
  data: {
    searchmessageQuerySortMode: SearchPageSortModeType
    searchmessageQuerySearch: string
    searchmessageQueryPage: number
    appMainElScrollbarScrollTop: number | undefined
  }
}

/** SearchPage 所需要的页面恢复数据 */
export const useRecoverSearchPageModule = (data: {
  //
  currentUuid: Ref<string | null>
}) => {
  const {
    //
    currentUuid,
  } = data

  // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

  // 【页面恢复数据 SearchPage 】用于 SearchPage 的页面恢复数据
  const pageRecoverDataForSearchPage = ref<
    Array<PageRecoverDataForSearchPageItemType>
  >([])
  // SearchPage 的页面恢复数据设置方法
  const pageRecoverDataForSearchPageItemSetFn = (
    val: PageRecoverDataForSearchPageItemType
  ) => {
    // 按uuid查找，找到则更新，找不到则添加
    const find = pageRecoverDataForSearchPage.value.find(
      (i) => i.uuid === val.uuid
    )
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForSearchPage.value.push(val)
      return 'push' as const
    }
  }
  // SearchPage 的页面恢复数据获取方法
  const pageRecoverDataForSearchPageItemGetFn = (uuid: string) => {
    const find = pageRecoverDataForSearchPage.value.find((i) => i.uuid === uuid)
    return find
  }
  // 设置当前的 SearchPage 的页面恢复数据
  const currentSetPageRecoverDataForSearchPageItem = (
    data: PageRecoverDataForSearchPageItemType['data']
  ) => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForSearchPageItemSetFn({
      uuid: currentUuid.value,
      data,
    })
  }
  // 获取当前的 SearchPage 的页面恢复数据
  const currentGetPageRecoverDataForSearchPageItem = () => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForSearchPageItemGetFn(currentUuid.value)
  }

  return {
    //
    pageRecoverDataForSearchPage,
    pageRecoverDataForSearchPageItemSetFn,
    pageRecoverDataForSearchPageItemGetFn,
    currentGetPageRecoverDataForSearchPageItem,
    currentSetPageRecoverDataForSearchPageItem,
  }
}
