import type { UsersPresencesStatusResponseWithBaseExpand } from '@/api'
import { usersStatusComputedRealtimeCheckIsOnlineThresholdMs } from '@/config'
import type { UsersResponse } from '@/lib'
import { useUsersPresencesStatusInitGetListQuery } from '@/queries'
import {
  useRealtimeUsersNotViewingMarksStore,
  useRealtimeUsersPresencesStatusStore,
} from '@/stores'
import { useTimestamp } from '@vueuse/core'

/**
 * 用于供其他地方使用实时数据的组合式函数
 * 就是会使用两个store中的数据，有一些函数和计算属性以供外界使用
 */
export const useRealtimeUsersStatusComputed = () => {
  // 用户实时状态相关store
  const realtimeUsersPresencesStatusStore =
    useRealtimeUsersPresencesStatusStore()
  const realtimeUsersNotViewingMarksStore =
    useRealtimeUsersNotViewingMarksStore()

  // userPresencesStatus前500条查询，初始的一些用户的状态
  const usersPresencesStatusInitGetListQuery =
    useUsersPresencesStatusInitGetListQuery()

  /** 初始的一些用户的状态 处理为 latest map */
  const usersPresencesStatusInitLatestMapByUser = computed<
    ReadonlyMap<string, UsersPresencesStatusResponseWithBaseExpand>
  >(() => {
    const map = new Map<string, UsersPresencesStatusResponseWithBaseExpand>()
    const list = usersPresencesStatusInitGetListQuery.data.value?.items ?? []
    for (const item of list) {
      const userId = item.author
      const prev = map.get(userId)
      if (!prev || item.created > prev.created) {
        map.set(userId, item)
      }
    }
    return map
  })

  /** 初始的一些用户的状态 处理为 earliest map */
  const usersPresencesStatusInitEarliestMapByUser = computed<
    ReadonlyMap<string, UsersPresencesStatusResponseWithBaseExpand>
  >(() => {
    const map = new Map<string, UsersPresencesStatusResponseWithBaseExpand>()
    const list = usersPresencesStatusInitGetListQuery.data.value?.items ?? []
    for (const item of list) {
      const userId = item.author
      const prev = map.get(userId)
      if (!prev || item.created < prev.created) {
        map.set(userId, item)
      }
    }
    return map
  })

  /** 每秒更新一次的响应式时间戳 */
  const nowRefTimestamp = useTimestamp({
    interval: 1000, // 默认 1000ms
  })

  /**
   * 获取用户状态（不含 isOnline）
   * 不依赖 nowRefTimestamp，避免频繁重算
   */
  const getStatusByUserId = (userId: string) => {
    // 最新实时 presence 状态（来自实时订阅）
    const latestPresence =
      realtimeUsersPresencesStatusStore.statusLatestMapByUser.get(userId)

    // 最新实时 not-viewing-marks 状态（来自实时订阅）
    const latestNotViewingMark =
      realtimeUsersNotViewingMarksStore.marksMapByUser.get(userId)

    // 初始化查询得到的最新 presence 状态（订阅启动前的历史数据）
    const initLatestPresence =
      usersPresencesStatusInitLatestMapByUser.value.get(userId)

    /**
     * base 状态：
     * - 优先使用实时最新 presence 状态（用户状态集合 userPresencesStatus）
     * - 若没有实时状态，则使用初始化查询得到的最新状态
     *
     * basePresence 是最终用于返回 isTyping / created 的基础记录
     */
    const basePresence = (() => {
      if (latestPresence != null) {
        return latestPresence
      }
      if (initLatestPresence != null) {
        return initLatestPresence
      }
      return null
    })()
    if (basePresence == null) {
      return null
    }

    /**
     * isNotViewing
     * - latestNotViewingMark
     *   如果 UsersNotViewingMarks 的个记录的创建时间更大，那就指的是用户是屏幕正在不显示状态
     * - basePresence（latestPresence或initLatestPresence）
     *   如果 UsersPresencesStatus 的个记录的创建时间更大，那就以其内容为准
     */
    /**
     * isNotViewing 判定逻辑（使用 IIFE）
     *
     * 背景说明：
     * 用户状态集合 userPresencesStatus：
     *   - 每 50 秒前端会创建一条记录
     *   - 包含 isNotViewing（屏幕是否正在显示）
     *   - created 字段用于判断是否在线（100 秒内）
     *
     * 用户离开事件集合 userNotViewingMarks：
     *   - 在 visibilitychange hidden 时创建
     *   - 使用 navigator.sendBeacon，无鉴权
     *   - 主要用于“标签页关闭前”快速上报不显示状态
     *
     * 判定规则：
     * 1. 如果用户离开事件集合（not-viewing-marks）的最新记录时间 > basePresence.created
     *    → 认为用户“屏幕正在不显示”
     *
     * 2. 否则（presence 更新更晚）
     *    → 以 basePresence.isNotViewing 为准
     *
     * 这样可以统一处理：
     * - 用户切换标签页、最小化窗口、关闭标签页
     * - 用户状态集合的正常轮询更新
     */
    const isNotViewing = (() => {
      // 情况 1：存在 latestNotViewingMark ，与 basePresence 进行比较
      if (latestNotViewingMark != null) {
        // latestNotViewingMark.created 更大，则判定为 isNotViewing=true
        if (latestNotViewingMark.created > basePresence.created) {
          return true
        }
        // 否则以 basePresence 内容为准
        return basePresence.isNotViewing
      }
      // 情况 2：不存在 latestNotViewingMark ，即只有 basePresence
      // 直接使用 basePresence.isNotViewing
      return basePresence.isNotViewing
    })()

    return {
      isNotViewing,
      isTyping: basePresence.isTyping,
      statusIsoDate: basePresence.created,
    }
  }

  const checkIsOnlineByStatusIsoDate = (statusIsoDate: string) => {
    const ts = new Date(statusIsoDate).getTime()
    return (
      nowRefTimestamp.value - ts <=
      usersStatusComputedRealtimeCheckIsOnlineThresholdMs
    )
  }

  /**
   * 获取用户状态 + 是否在线
   */
  const getStatusByUserIdWithIsOnline = (userId: string) => {
    const status = getStatusByUserId(userId)
    if (!status) return null

    const isOnline = checkIsOnlineByStatusIsoDate(status.statusIsoDate)

    return {
      ...status,
      isOnline,
    }
  }

  /**
   * 判断是否在线
   */
  const getIsOnlineByUserId = (userId: string) => {
    const status = getStatusByUserId(userId)
    if (!status) return false

    return checkIsOnlineByStatusIsoDate(status.statusIsoDate)
  }

  return {
    //
    getStatusByUserId,
    getStatusByUserIdWithIsOnline,
    checkIsOnlineByStatusIsoDate,
    getIsOnlineByUserId,
    realtimeUsersPresencesStatusStore,
    usersPresencesStatusInitLatestMapByUser,
    usersPresencesStatusInitEarliestMapByUser,
  }
}

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

/**
 * useRealtimeUsersStatusComputedForUserRealtimeStatus
 *
 * 用途：
 * ------
 * 为“单个用户组件”提供实时用户状态（presence）计算。
 * 组件只需传入 userId，即可获得：
 *
 * 1. userRealtimeStatus
 *    - 该用户的最新 presence 状态（包含 isTyping / isNotViewing / statusIsoDate 等）
 *
 * 2. statusByUserIdWithIsOnline
 *    - 在 userRealtimeStatus 的基础上，额外计算 isOnline 字段
 *    - isOnline 判断基于 statusIsoDate 与当前时间差
 *
 *
 * 性能设计：
 * ----------
 * - 该封装只处理“单个用户”的状态，不会遍历所有用户
 * - 内部依赖的 getStatusByUserId / checkIsOnlineByStatusIsoDate 都是 O(1)
 * - computed 会自动依赖收集 userId、presence Map、nowRefTimestamp
 * - 当 userId 或该用户的 presence 变化时才会重新计算
 * - 当 nowRefTimestamp 更新时，只会重新计算这个用户的在线状态（O(1））
 *
 * 适用场景：
 * ----------
 * - 用户列表项组件
 * - 任意需要实时显示“某个用户是否在线”的地方
 */
export const useRealtimeUsersStatusComputedForUserRealtimeStatus = (data: {
  userId: ComputedRef<string | null | undefined>
}) => {
  const {
    //
    userId,
  } = data

  const { getStatusByUserId, checkIsOnlineByStatusIsoDate } =
    useRealtimeUsersStatusComputed()

  /**
   * 用户状态（不含 isOnline）
   * 不依赖 nowRefTimestamp，避免频繁重算
   */
  const userRealtimeStatus = computed(() => {
    if (userId.value == null) {
      return null
    }
    return getStatusByUserId(userId.value)
  })

  /**
   * 获取该用户的完整状态（含 isOnline）
   *
   * - 基于 userRealtimeStatus
   * - 使用 checkIsOnlineByStatusIsoDate 判断是否在线
   *
   * 依赖：
   * - userRealtimeStatus
   * - nowRefTimestamp（内部由 checkIsOnlineByStatusIsoDate 使用）
   *
   * 性能：
   * - O(1)，只处理单个用户
   * - nowRefTimestamp 更新时，只重新计算这个用户的在线状态
   */
  const statusByUserIdWithIsOnline = computed(() => {
    if (userRealtimeStatus.value == null) {
      return null
    }
    const isOnline = checkIsOnlineByStatusIsoDate(
      userRealtimeStatus.value.statusIsoDate
    )
    return {
      ...userRealtimeStatus.value,
      isOnline,
    }
  })

  return {
    //
    userRealtimeStatus,
    statusByUserIdWithIsOnline,
  }
}
