import type { FilesResponseWithBaseExpand } from '@/api'
import type { FileQueryModeMarkType } from '@/views/file/composables'

export type PageRecoverDataForFileSelectPageItemType = {
  uuid: string
  data: {
    fileQueryMode: FileQueryModeMarkType
    fileQuerySearch: string
    fileQueryPage: number
    fileSelectList: FilesResponseWithBaseExpand[]
    appMainElScrollbarScrollTop: number | undefined
    // windowWidth: number | undefined
    transBoxHeight: number | undefined
    layoutBoxWidth: number | undefined
  }
}

/** FileSelectPage 所需要的页面恢复数据 */
export const useRecoverFileSelectPageModule = (data: {
  //
  currentUuid: Ref<string | null>
}) => {
  const {
    //
    currentUuid,
  } = data

  // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

  // 【页面恢复数据 FileSelectPage 】用于 FileSelectPage 的页面恢复数据
  const pageRecoverDataForFileSelectPage = ref<
    Array<PageRecoverDataForFileSelectPageItemType>
  >([])
  // FileSelectPage 的页面恢复数据设置方法
  const pageRecoverDataForFileSelectPageItemSetFn = (
    val: PageRecoverDataForFileSelectPageItemType
  ) => {
    // 按uuid查找，找到则更新，找不到则添加
    const find = pageRecoverDataForFileSelectPage.value.find(
      (i) => i.uuid === val.uuid
    )
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForFileSelectPage.value.push(val)
      return 'push' as const
    }
  }
  // FileSelectPage 的页面恢复数据获取方法
  const pageRecoverDataForFileSelectPageItemGetFn = (uuid: string) => {
    const find = pageRecoverDataForFileSelectPage.value.find(
      (i) => i.uuid === uuid
    )
    return find
  }
  // 设置当前的 FileSelectPage 的页面恢复数据
  const currentSetPageRecoverDataForFileSelectPageItem = (
    data: PageRecoverDataForFileSelectPageItemType['data']
  ) => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForFileSelectPageItemSetFn({
      uuid: currentUuid.value,
      data,
    })
  }
  // 获取当前的 FileSelectPage 的页面恢复数据
  const currentGetPageRecoverDataForFileSelectPageItem = () => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForFileSelectPageItemGetFn(currentUuid.value)
  }

  return {
    //
    pageRecoverDataForFileSelectPage,
    pageRecoverDataForFileSelectPageItemSetFn,
    pageRecoverDataForFileSelectPageItemGetFn,
    currentGetPageRecoverDataForFileSelectPageItem,
    currentSetPageRecoverDataForFileSelectPageItem,
  }
}
