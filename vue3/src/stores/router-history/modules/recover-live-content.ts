export type PageRecoverDataForLiveContentItemType = {
  uuid: string
  data: {
    isExpandedLiveListUserDesuwa: boolean
    refScrollWarpScrollTop: number | undefined
  }
}

/** LiveContent 所需要的页面恢复数据 */
export const useRecoverLiveContentModule = (data: {
  //
  currentUuid: Ref<string | null>
}) => {
  const {
    //
    currentUuid,
  } = data

  // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

  // 【页面恢复数据 LiveContent 】用于 LiveContent 的页面恢复数据
  const pageRecoverDataForLiveContent = ref<
    Array<PageRecoverDataForLiveContentItemType>
  >([])
  // LiveContent 的页面恢复数据设置方法
  const pageRecoverDataForLiveContentItemSetFn = (
    val: PageRecoverDataForLiveContentItemType
  ) => {
    // 按uuid查找，找到则更新，找不到则添加
    const find = pageRecoverDataForLiveContent.value.find(
      (i) => i.uuid === val.uuid
    )
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForLiveContent.value.push(val)
      return 'push' as const
    }
  }
  // LiveContent 的页面恢复数据获取方法
  const pageRecoverDataForLiveContentItemGetFn = (uuid: string) => {
    const find = pageRecoverDataForLiveContent.value.find(
      (i) => i.uuid === uuid
    )
    return find
  }
  // 设置当前的 LiveContent 的页面恢复数据
  const currentSetPageRecoverDataForLiveContentItem = (
    data: PageRecoverDataForLiveContentItemType['data']
  ) => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForLiveContentItemSetFn({
      uuid: currentUuid.value,
      data,
    })
  }
  // 获取当前的 LiveContent 的页面恢复数据
  const currentGetPageRecoverDataForLiveContentItem = () => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForLiveContentItemGetFn(currentUuid.value)
  }

  return {
    //
    pageRecoverDataForLiveContent,
    pageRecoverDataForLiveContentItemSetFn,
    pageRecoverDataForLiveContentItemGetFn,
    currentGetPageRecoverDataForLiveContentItem,
    currentSetPageRecoverDataForLiveContentItem,
  }
}
