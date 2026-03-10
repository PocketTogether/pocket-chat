import { useRealtimeUsersStatusComputedForUserList } from '@/composables'
import type { UsersResponse } from '@/lib'
import { useProfileQuery, useUserPageListQuery } from '@/queries'
import type { LiveContentPageRecoverDataDesuwaType } from './page-recover'

export const useLiveListUserDesuwa = (data: {
  liveContentPageRecoverDataDesuwa: LiveContentPageRecoverDataDesuwaType
}) => {
  const {
    //
    liveContentPageRecoverDataDesuwa,
  } = data

  const {
    //
    liveContentPageRecoverData,
  } = liveContentPageRecoverDataDesuwa

  /**
   * 在线用户列表是否展开
   */
  const isExpanded = ref(false)
  // 按页面恢复数据初始化
  if (liveContentPageRecoverData != null) {
    isExpanded.value =
      liveContentPageRecoverData.data.isExpandedLiveListUserDesuwa
  }

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
  }

  const realtimeUsersStatusComputedForUserList =
    useRealtimeUsersStatusComputedForUserList()
  const {
    //
    userListOfAllOnline,
    userListOfRecentActive,
  } = realtimeUsersStatusComputedForUserList

  // 查询前几个（一页）用户
  const livePageFirstFewUserListQuery = useUserPageListQuery({
    pageNum: computed(() => 1),
    sortMode: computed(() => 'joined_at_desc'),
    searchContent: computed(() => null),
    customStrId: computed(() => 'livePageFirstFewUserListQuery'),
  })
  // livePageFirstFewUserListQuery.data.value?.items 类型是 UsersResponse| undefined

  const profileQuery = useProfileQuery()
  // profileQuery.data.value 类型是 UsersResponse| undefined

  /**
   * 合并所有可展示的用户列表（保持顺序 + 去重）
   * 顺序：
   * 1. 自己（如果存在）
   * 2. 在线用户（去掉自己）
   * 3. 最近活跃用户（去掉自己）
   * 4. 首页分页用户（去掉自己）
   */
  const userListAllCouldShow = computed(() => {
    const result: UsersResponse[] = []
    const seen = new Set<string>()

    const selfUser = profileQuery.data.value
    if (selfUser) {
      result.push(selfUser)
      seen.add(selfUser.id)
    }

    const pushList = (list?: UsersResponse[]) => {
      if (!list) return
      for (const user of list) {
        if (!seen.has(user.id)) {
          seen.add(user.id)
          result.push(user)
        }
      }
    }

    pushList(userListOfAllOnline.value)
    pushList(userListOfRecentActive.value)
    pushList(livePageFirstFewUserListQuery.data.value?.items)

    return result
  })

  /**
   * 折叠时显示数量：
   * - 如果在线人数 >= 3 → 显示 6
   * - 否则 → 显示 3
   */
  const collapsedDisplayCount = computed(() => {
    return (userListOfAllOnline.value?.length ?? 0) >= 3 ? 6 : 3
  })

  /**
   * 展开时显示数量：
   * - 如果在线人数 < 20 → 显示 20
   * - 否则 → 显示在线人数
   */
  const expandedDisplayCount = computed(() => {
    const onlineCount = userListOfAllOnline.value?.length ?? 0
    return onlineCount < 20 ? 20 : onlineCount
  })

  /**
   * 最终用于渲染的用户列表
   */
  const userListForShow = computed(() => {
    const baseList = userListAllCouldShow.value
    const limit = isExpanded.value
      ? expandedDisplayCount.value
      : collapsedDisplayCount.value

    return baseList.slice(0, limit)
  })

  return {
    //
    userListForShow,
    isExpanded,
    toggleExpanded,
  }
}

export type LiveListUserDesuwaType = ReturnType<typeof useLiveListUserDesuwa>
