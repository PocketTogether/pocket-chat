import type { UserPageSortModeType } from '@/api'

export type PageRecoverDataForUserListPageItemType = {
  uuid: string
  data: {
    userQuerySortMode: UserPageSortModeType
    userQuerySearch: string
    userQueryPage: number
    appMainElScrollbarScrollTop: number | undefined
  }
}

/** UserListPage 所需要的页面恢复数据 */
export const useRecoverUserListPageModule = (data: {
  //
  currentUuid: Ref<string | null>
}) => {
  const {
    //
    currentUuid,
  } = data

  // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

  // 【页面恢复数据 UserListPage 】用于 UserListPage 的页面恢复数据
  const pageRecoverDataForUserListPage = ref<
    Array<PageRecoverDataForUserListPageItemType>
  >([])
  // UserListPage 的页面恢复数据设置方法
  const pageRecoverDataForUserListPageItemSetFn = (
    val: PageRecoverDataForUserListPageItemType
  ) => {
    // 按uuid查找，找到则更新，找不到则添加
    const find = pageRecoverDataForUserListPage.value.find(
      (i) => i.uuid === val.uuid
    )
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForUserListPage.value.push(val)
      return 'push' as const
    }
  }
  // UserListPage 的页面恢复数据获取方法
  const pageRecoverDataForUserListPageItemGetFn = (uuid: string) => {
    const find = pageRecoverDataForUserListPage.value.find(
      (i) => i.uuid === uuid
    )
    return find
  }
  // 设置当前的 UserListPage 的页面恢复数据
  const currentSetPageRecoverDataForUserListPageItem = (
    data: PageRecoverDataForUserListPageItemType['data']
  ) => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForUserListPageItemSetFn({
      uuid: currentUuid.value,
      data,
    })
  }
  // 获取当前的 UserListPage 的页面恢复数据
  const currentGetPageRecoverDataForUserListPageItem = () => {
    if (currentUuid.value == null) {
      return null
    }
    return pageRecoverDataForUserListPageItemGetFn(currentUuid.value)
  }

  return {
    //
    pageRecoverDataForUserListPage,
    pageRecoverDataForUserListPageItemSetFn,
    pageRecoverDataForUserListPageItemGetFn,
    currentGetPageRecoverDataForUserListPageItem,
    currentSetPageRecoverDataForUserListPageItem,
  }
}
