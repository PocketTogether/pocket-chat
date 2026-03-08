/**
 * pbUsersPresencesStatusInitGetListApi
 * userPresencesStatus查询前500条
 */
export const usersPresencesStatusInitGetListApiPerPageNumConfig = 500 as const

/**
 * pbUsersNotViewingMarksInitGetListApi
 * usersNotViewingMarks查询前500条
 */
export const usersNotViewingMarksInitGetListApiPerPageNumConfig = 500 as const

/**
 * 用户在线状态判断的时间阈值（毫秒）。
 *
 * 若用户最近一次状态更新时间与当前时间的差值
 * 小于等于该阈值，则视为在线。
 *
 * 100_000 即 100 秒
 */
export const usersStatusComputedRealtimeCheckIsOnlineThresholdMs =
  100_000 as const

/**
 * 本地用户“正在输入”状态的有效时间阈值（毫秒）。
 *
 * 若最近一次输入标记的时间与当前时间差值
 * 小于等于该阈值，则视为仍处于输入状态。
 */
export const usersStatusSelfPresenceTypingActiveThresholdMs = 3_000 as const

/**
 * 本地用户保持在线状态时的心跳发送阈值（毫秒）。
 *
 * 若上次发送在线状态的时间与当前时间差值
 * 大于等于该阈值，则需要再次发送在线状态。
 *
 */
export const usersStatusSelfPresenceKeepOnlineSendThresholdMs = 48_000 as const

/**
 * 本地用户在线状态发送的冷却时间阈值（毫秒）。
 *
 * 若距离上次发送在线状态的时间小于该阈值，
 * 则视为处于冷却期，不允许再次发送。
 *
 */
export const usersStatusSelfPresenceSendCooldownThresholdMs = 1_000 as const

/**
 * `useSelfPresenceLoopAndViewingHook` 中 Presence 循环的固定等待间隔（毫秒）。
 *
 * 在 `presenceloopFn` 的无限循环中，每次调用
 * `selfPresenceDispatcher.sendPresenceIfNeedAndCanSend()` 之后，
 * 会通过 `setTimeout` 使用此间隔进行延迟，
 * 从而控制 Presence 检查与发送的频率（当前为每 4 秒一次）。
 */
export const usersStatusSelfPresenceLoopIntervalThresholdMs = 4_000 as const

/** 封装代表用户各种实时状态的key */
export const usersStatusItemPresenceStatusKeyConfig = {
  // 离线
  offline: 'offline',
  // 在线
  online: 'online',
  // 输入中
  typing: 'typing',
  // 闲置
  not_viewing: 'not_viewing',
} as const

/** usersStatusItemPresenceStatusKeyConfig 类型体操得到联合类型 */
export type UsersStatusItemPresenceStatusKeyUnionType =
  (typeof usersStatusItemPresenceStatusKeyConfig)[keyof typeof usersStatusItemPresenceStatusKeyConfig]
