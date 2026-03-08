import { usersStatusItemPresenceStatusKeyConfig } from '@/config'

import { useI18nStore } from '@/stores'
import { useRealtimeUsersStatusComputed } from './computed'

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
 * 2. userRealtimeStatusWithIsOnline
 *    - 在 userRealtimeStatus 的基础上，额外计算 isOnline 字段
 *    - isOnline 判断基于 statusIsoDate 与当前时间差
 *
 * 3. userRealtimeStatusForShow
 *    - 用于 UI 展示的最终状态对象
 *    - 包含 key / color / text，用于渲染状态图标与文案
 *    - 自动根据 isOnline / isTyping / isNotViewing 等字段选择最合适的展示状态
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
  const userRealtimeStatusWithIsOnline = computed(() => {
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

  const i18nStore = useI18nStore()

  /**
   * userRealtimeStatusForShow
   *
   * 用途：
   * ------
   * 将用户实时状态（含 isOnline / isTyping / isNotViewing 等）转换为
   * “适合 UI 展示的状态对象”。
   *
   * 输出内容包含：
   * - key: 状态标识（如 online / offline / typing / not_viewing）
   * - color: UI 使用的颜色值
   * - text: 本地化后的状态文案
   *
   * 状态判定逻辑（优先级从高到低）：
   * 1. data == null 或 isOnline = false → 离线
   * 2. isNotViewing = true → 闲置
   * 3. isTyping = true → 输入中
   * 4. 其他情况 → 在线
   *
   * 特点：
   * -------
   * - 自动根据用户状态选择最合适的展示内容
   * - 适用于用户列表、头像状态点、聊天头部等 UI 场景
   */
  const userRealtimeStatusForShow = computed(() => {
    const data = userRealtimeStatusWithIsOnline.value

    // 1. null → 离线
    // 2. isOnline = false → 离线
    if (data == null || !data.isOnline) {
      return {
        key: usersStatusItemPresenceStatusKeyConfig.offline,
        color: 'var(--color-text-soft)',
        text: i18nStore.t('usersStatusText_offline')(),
      } as const
    }

    // 3. isNotViewing = true → 闲置
    if (data.isNotViewing) {
      return {
        key: usersStatusItemPresenceStatusKeyConfig.not_viewing,
        color: 'var(--poto-color-amber-sand)',
        text: i18nStore.t('usersStatusText_not_viewing')(),
      } as const
    }

    // 4. isTyping = true → 输入中
    if (data.isTyping) {
      return {
        key: usersStatusItemPresenceStatusKeyConfig.typing,
        color: 'var(--poto-color-mist-blue)',
        text: i18nStore.t('usersStatusText_typing')(),
      } as const
    }

    // 5. 其他 → 在线
    return {
      key: usersStatusItemPresenceStatusKeyConfig.online,
      color: 'var(--poto-color-moss-green)',
      text: i18nStore.t('usersStatusText_online')(),
    } as const
  })

  return {
    //
    userRealtimeStatus,
    userRealtimeStatusWithIsOnline,
    userRealtimeStatusForShow,
  }
}

export type RealtimeUsersStatusComputedForUserRealtimeStatusType = ReturnType<
  typeof useRealtimeUsersStatusComputedForUserRealtimeStatus
>
