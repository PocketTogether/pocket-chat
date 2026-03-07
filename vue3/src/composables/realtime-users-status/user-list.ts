import type { UsersResponse } from '@/lib'

import { useRealtimeUsersStatusComputed } from './computed'

/**
 * 实时用户状态用户列表的组合式函数
 *
 * 功能：
 * - 基于 useRealtimeUsersStatusComputed 提供的底层状态（presence / not-viewing-marks）
 * - 提供两个用户列表：
 *   - userListOfAllOnline：当前在线用户列表（UsersResponse[]）
 *   - userListOfRecentActive：不在线但有记录的用户列表（UsersResponse[]）
 *
 * 性能设计：
 * - 底层 sortedUserIdsByEarliest 只依赖 earliestMap / psEarliest，不依赖当前时间
 *   → 只在数据源变化时重新计算（如新 presence 记录）
 *   → 负责完成“按最早出现时间排序”的重活（O(n log n)）
 *
 * - 高层 userListOfAllOnline / userListOfRecentActive：
 *   → 只在 sortedUserIdsByEarliest 和 getIsOnlineByUserId 变化时更新
 *   → 每次只是遍历已排好序的 userId 列表并过滤（O(n)）
 *   → 不再做排序，避免在 nowRefTimestamp 高频变化时重复排序
 */
export const useRealtimeUsersStatusComputedForUserList = () => {
  const {
    getIsOnlineByUserId,
    realtimeUsersPresencesStatusStore,
    usersPresencesStatusInitLatestMapByUser,
    usersPresencesStatusInitEarliestMapByUser,
  } = useRealtimeUsersStatusComputed()

  /**
   * 根据 userId 获取 UsersResponse
   *
   * 数据来源：
   * - 优先使用实时最新 presence（statusLatestMapByUser）
   * - 若没有，则使用初始化 latest presence（usersPresencesStatusInitLatestMapByUser）
   */
  const getUserByUserId = (userId: string) => {
    const psLatest = realtimeUsersPresencesStatusStore.statusLatestMapByUser
    const initLatest = usersPresencesStatusInitLatestMapByUser.value

    return (
      psLatest.get(userId)?.expand?.author ??
      initLatest.get(userId)?.expand?.author ??
      null
    )
  }

  /**
   * 底层：所有用户按 earliest 记录时间排好序的 userId 列表
   *
   * 排序依据：
   * - 优先使用实时 earliest presence（statusEarliestMapByUser）
   * - 若没有，则使用初始化 earliest presence（usersPresencesStatusInitEarliestMapByUser）
   * - created 为 ISO 字符串，使用 localeCompare 即可按时间排序
   *
   * 特点：
   * - 不依赖当前时间戳，只依赖 presence 数据本身
   * - 只在 presence 数据变化时重新计算
   * - 负责完成 O(n log n) 的排序工作
   */
  const sortedUserIdsByEarliest = computed(() => {
    const earliestMap = usersPresencesStatusInitEarliestMapByUser.value
    const psEarliest = realtimeUsersPresencesStatusStore.statusEarliestMapByUser

    const allUserIds = new Set<string>([
      ...earliestMap.keys(),
      ...psEarliest.keys(),
    ])

    return Array.from(allUserIds).sort((a, b) => {
      const ea =
        psEarliest.get(a)?.created ??
        earliestMap.get(a)?.created ??
        '9999-12-31'
      const eb =
        psEarliest.get(b)?.created ??
        earliestMap.get(b)?.created ??
        '9999-12-31'
      return ea.localeCompare(eb)
    })
  })

  /**
   * 在线用户列表（UsersResponse[]）
   *
   * 逻辑：
   * - 遍历已按 earliest 排好序的 sortedUserIdsByEarliest
   * - 使用 getIsOnlineByUserId 判断是否在线
   * - 通过 getUserByUserId 获取 UsersResponse
   *
   * 性能：
   * - 不做排序，只做过滤（O(n)）
   * - getIsOnlineByUserId 内部是基于 Map 查找 + 时间比较，复杂度 O(1)
   * - 每次 nowRefTimestamp 更新时，只做一次线性遍历
   */
  const userListOfAllOnline = computed<UsersResponse[]>(() => {
    const users: UsersResponse[] = []

    for (const userId of sortedUserIdsByEarliest.value) {
      if (getIsOnlineByUserId(userId)) {
        const user = getUserByUserId(userId)
        if (user) users.push(user)
      }
    }

    return users
  })

  /**
   * 最近活跃用户列表（UsersResponse[]）
   *
   * 定义：
   * - 不在线（!getIsOnlineByUserId）
   * - 但在 presence 相关 Map 中有记录
   *
   * 逻辑与在线用户类似：
   * - 遍历已排好序的 sortedUserIdsByEarliest
   * - 过滤出不在线的用户
   * - 通过 getUserByUserId 获取 UsersResponse
   *
   * 性能：
   * - 同样是 O(n) 过滤，不做排序
   */
  const userListOfRecentActive = computed<UsersResponse[]>(() => {
    const users: UsersResponse[] = []

    for (const userId of sortedUserIdsByEarliest.value) {
      if (!getIsOnlineByUserId(userId)) {
        const user = getUserByUserId(userId)
        if (user) users.push(user)
      }
    }

    return users
  })

  return {
    //
    // ...realtimeUsersStatusComputed,
    userListOfAllOnline,
    userListOfRecentActive,
  }
}
