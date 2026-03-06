import {
  pbUsersNotViewingMarksCreateApiBySendBeacon,
  pbUsersPresencesStatusCreateApi,
} from '@/api'
import {
  usersStatusSelfPresenceKeepOnlineSendThresholdMs,
  usersStatusSelfPresenceSendCooldownThresholdMs,
  usersStatusSelfPresenceTypingActiveThresholdMs,
} from '@/config'
import { useSelfPresenceStore } from '@/stores'

// 用户自己的实时状态循环检查与发送 这一块
// 用于管理用户自己的实时状态，包括本地状态管理（在 store 中）、
// 间隔 5 秒的无限循环判断与发送逻辑，以及 visibilitychange(hidden) 时的 sendBeacon 发送。

/**
 * 用于封装判断与发送逻辑，提供方法供外界调用，
 * 如：判断是否需要发送、执行发送、立即触发一次判断与发送等。
 */
export const useSelfPresenceDispatcher = () => {
  const selfPresenceStore = useSelfPresenceStore()

  /** -----------------------------
   * 基础状态计算
   * ----------------------------- */

  const isTypingFn = () => {
    const mark = selfPresenceStore.isTypingMark
    const ts = selfPresenceStore.isTypingMarkTimestamp
    if (!mark) return false
    // null即是尚未输入过，判定为false
    if (ts == null) return false
    return Date.now() - ts <= usersStatusSelfPresenceTypingActiveThresholdMs
  }

  const isNotViewingFn = () => {
    return document.visibilityState !== 'visible'
  }

  /** -----------------------------
   * Presence 发送判断
   * ----------------------------- */
  // 根据 isTyping isNotViewing 与 lastPresenceSentPayload 判断是否需要发送
  // 状态改变时需要发送
  const checkNeedSendPresenceByUpdatePresence = () => {
    const isTyping = isTypingFn()
    const isNotViewing = isNotViewingFn()
    const lastPayload = selfPresenceStore.lastPresenceSentPayload

    // null即是为尚未发送过，应发送
    if (lastPayload == null) return true

    if (lastPayload.isTyping !== isTyping) return true
    if (lastPayload.isNotViewing !== isNotViewing) return true

    return false
  }

  // 根据当前时间戳与 lastPresenceSentTimestamp 判断是否需要发送，超过50秒需发送
  const checkNeedSendPresenceByKeepOnline = () => {
    const lastTs = selfPresenceStore.lastPresenceSentTimestamp
    // null即是为尚未发送过，应发送
    if (lastTs == null) return true

    return (
      Date.now() - lastTs >= usersStatusSelfPresenceKeepOnlineSendThresholdMs
    )
  }

  // 根据上次发送是否成功，判断是否需要发送。上次发送如果不成功则需要发送
  const checkNeedSendPresenceByIsPresenceSentSuccess = () => {
    return selfPresenceStore.isPresenceSentSuccess === false
  }

  // 根据上次发送时间，来判断是否能发送。上次发送如果距今少于2秒则不能发送
  const checkCanSendPresenceByLastPresenceSentTimestamp = () => {
    const lastTs = selfPresenceStore.lastPresenceSentTimestamp
    // null即是为尚未发送过，应发送
    if (lastTs == null) return true
    return Date.now() - lastTs >= usersStatusSelfPresenceSendCooldownThresholdMs
  }

  // 根据是否正在发送，来判断是否能发送。正在发送则不能发送
  const checkCanSendPresenceByIsPresenceSending = () => {
    return !selfPresenceStore.isPresenceSending
  }

  /** -----------------------------
   * Presence 发送函数
   * ----------------------------- */

  // 只供 sendPresenceIfNeedAndCanSend 使用，不提供给外部使用
  // 将调用api函数 pbUsersPresencesStatusCreateApi
  // 将根据设计对store进行操作
  const sendPresenceFn = async () => {
    const payload = {
      isTyping: isTypingFn(),
      isNotViewing: isNotViewingFn(),
    }

    try {
      selfPresenceStore.isPresenceSendingSet(true)

      const res = await pbUsersPresencesStatusCreateApi(payload)

      selfPresenceStore.lastPresenceSentPayloadSet(payload)
      selfPresenceStore.isPresenceSentSuccessSet(true)
      return res
    } catch (err) {
      selfPresenceStore.isPresenceSentSuccessSet(false)
      console.error('selfPresenceDispatcher.sendPresenceFn', err)
    } finally {
      selfPresenceStore.isPresenceSendingSet(false)
    }
  }

  // 核心发送函数，供循环与其他地方调用
  const sendPresenceIfNeedAndCanSend = async () => {
    const canSend =
      checkCanSendPresenceByIsPresenceSending() &&
      checkCanSendPresenceByLastPresenceSentTimestamp()

    const needSend =
      checkNeedSendPresenceByKeepOnline() ||
      checkNeedSendPresenceByUpdatePresence() ||
      checkNeedSendPresenceByIsPresenceSentSuccess()

    if (canSend && needSend) {
      return sendPresenceFn()
    }
  }

  /** -----------------------------
   * NotViewingMarks 发送判断
   * ----------------------------- */

  // 检查 isNotViewingFn ，页面不可见才能发送
  const checkCanSendNotViewingMarksByIsNotViewing = () => {
    return isNotViewingFn()
  }

  // （lastNotViewingMarksSentTimestamp 小于 lastPresenceSentTimestamp）且
  // （lastPresenceSentPayload 的 isNotViewing 为 false）才能发送
  // 即已经会被判定为isNotViewing=ture时就不必发送了
  const checkNeedSendNotViewingMarksByPresence = () => {
    const lastNotViewingTs = selfPresenceStore.lastNotViewingMarksSentTimestamp
    const lastPresenceTs = selfPresenceStore.lastPresenceSentTimestamp
    const lastPayload = selfPresenceStore.lastPresenceSentPayload

    // lastPresenceTs == null 即尚未发送状态记录，不必发送
    if (lastPresenceTs == null) return false
    if (lastPayload == null) return false

    // lastNotViewingTs == null 即尚未发送过NotViewing标记，可发送
    if (lastNotViewingTs == null) return true

    // 已经会被判定为 isNotViewing=ture 时就不必发送了
    // 即未被判定为 isNotViewing=ture 时才需要发送
    if (lastNotViewingTs < lastPresenceTs) {
      if (lastPayload.isNotViewing === false) return true
    }

    return false
  }

  /** -----------------------------
   * NotViewingMarks 发送函数
   * ----------------------------- */

  // 只供 sendNotViewingMarksIfNeedAndCanSend 使用，不提供给外部使用
  // 将调用api函数 pbUsersNotViewingMarksCreateApiBySendBeacon
  // 将根据设计对store进行操作
  const sendNotViewingMarksFn = () => {
    try {
      const res = pbUsersNotViewingMarksCreateApiBySendBeacon()

      selfPresenceStore.lastNotViewingMarksSentTimestampSetNow()
      return res
    } catch (err) {
      console.error('selfPresenceDispatcher.sendNotViewingMarksFn', err)
    }
  }

  // sendNotViewingMarksIfNeedAndCanSend 函数供visibilitychange钩子中调用，
  // 实际绑定是在useSelfPresenceLoop中的启动函数中，即差不多和Presence循环检查是在一起的
  const sendNotViewingMarksIfNeedAndCanSend = () => {
    const canSend = checkCanSendNotViewingMarksByIsNotViewing()
    const needSend = checkNeedSendNotViewingMarksByPresence()
    if (canSend && needSend) {
      return sendNotViewingMarksFn()
    }
  }

  return {
    //
    sendPresenceIfNeedAndCanSend,
    sendNotViewingMarksIfNeedAndCanSend,
    isTypingFn,
    isNotViewingFn,
  }
}
