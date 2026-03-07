import type { UsersPresencesStatusResponseWithBaseExpand } from '@/api'
import { usersStatusComputedRealtimeCheckIsOnlineThresholdMs } from '@/config'
import type { UsersNotViewingMarksResponse } from '@/lib'
import {
  useUsersNotViewingMarksInitGetListQuery,
  useUsersPresencesStatusInitGetListQuery,
} from '@/queries'
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
  // usersNotViewingMarks前500条查询，初始的一些NotViewingMarks
  const usersNotViewingMarksInitGetListQuery =
    useUsersNotViewingMarksInitGetListQuery()

  /** 初始的一些用户的状态 处理为 latest map */
  const usersPresencesStatusInitLatestMapByUser = computed<
    ReadonlyMap<string, UsersPresencesStatusResponseWithBaseExpand>
  >(() => {
    const map = new Map<string, UsersPresencesStatusResponseWithBaseExpand>()
    const list = usersPresencesStatusInitGetListQuery.data.value?.items ?? []
    for (const item of list) {
      const userId = item.author
      const prev = map.get(userId)
      if (prev == null || item.created > prev.created) {
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
      if (prev == null || item.created < prev.created) {
        map.set(userId, item)
      }
    }
    return map
  })

  /** 初始的一些NotViewingMarks 处理为 latest map */
  const usersNotViewingMarksInitLatestMapByUser = computed<
    ReadonlyMap<string, UsersNotViewingMarksResponse>
  >(() => {
    const map = new Map<string, UsersNotViewingMarksResponse>()
    const list = usersNotViewingMarksInitGetListQuery.data.value?.items ?? []
    for (const item of list) {
      const userId = item.author
      const prev = map.get(userId)
      if (prev == null || item.created > prev.created) {
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

    // 初始化查询得到的最新 not-viewing-marks 状态（订阅启动前的历史数据）
    const initLatestNotViewingMark =
      usersNotViewingMarksInitLatestMapByUser.value.get(userId)

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

    const baseLatestNotViewingMark = (() => {
      if (latestNotViewingMark != null) {
        return latestNotViewingMark
      }
      if (initLatestNotViewingMark != null) {
        return latestNotViewingMark
      }
      return null
    })()

    /**
     * isNotViewing
     * - baseLatestNotViewingMark
     *   如果 UsersNotViewingMarks 的个记录的创建时间更大，那就指的是用户是屏幕正在不显示状态
     * - basePresence
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
      // 情况 1：存在 baseLatestNotViewingMark ，与 basePresence 进行比较
      if (baseLatestNotViewingMark != null) {
        // baseLatestNotViewingMark.created 更大，则判定为 isNotViewing=true
        if (baseLatestNotViewingMark.created > basePresence.created) {
          return true
        }
        // 否则以 basePresence 内容为准
        return basePresence.isNotViewing
      }
      // 情况 2：不存在 baseLatestNotViewingMark ，即只有 basePresence
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
