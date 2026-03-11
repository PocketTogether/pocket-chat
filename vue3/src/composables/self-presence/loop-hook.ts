import { useSelfPresenceStore } from '@/stores'
import { useSelfPresenceDispatcher } from './dispatcher'
import { usersStatusSelfPresenceLoopIntervalThresholdMs } from '@/config'

// 用于在 app.vue 中，调用本组合式函数中的某个函数，启动无限循环与监听 visibilitychange，
// 内部会配合 store 中的响应式布尔值标记避免重复启动，
// 会使用 useSelfPresenceDispatcher ，循环中会调用SelfPresenceDispatcher中的方法。

export const useSelfPresenceLoopAndViewingHook = () => {
  const selfPresenceDispatcher = useSelfPresenceDispatcher()
  const selfPresenceStore = useSelfPresenceStore()

  /** --------------------------------
   * 无限循环：持续发送 Presence
   * -------------------------------- */
  const presenceloopFn = async () => {
    // 无限循环
    while (true) {
      try {
        await selfPresenceDispatcher.sendPresenceIfNeedAndCanSend()
      } catch (err) {
        console.error('presenceloopFn sendPresenceIfNeedAndCanSend error:', err)
      }

      // 每 5 秒检查一次
      await new Promise((resolve) =>
        setTimeout(resolve, usersStatusSelfPresenceLoopIntervalThresholdMs)
      )
    }
  }

  /** --------------------------------
   * visibilitychange 监听
   * -------------------------------- */
  const viewingHookFn = () => {
    const handler = () => {
      try {
        selfPresenceDispatcher.sendNotViewingMarksIfNeedAndCanSend()
      } catch (err) {
        console.error(
          'viewingHookFn sendNotViewingMarksIfNeedAndCanSend error:',
          err
        )
      }
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon#sending_analytics_at_the_end_of_a_session
    document.addEventListener('visibilitychange', handler)
  }

  /** --------------------------------
   * 启动循环与监听
   * -------------------------------- */
  const startPresenceLoopAndViewingHook = () => {
    // 避免重复启动
    if (selfPresenceStore.isLoopSendStarted) return
    selfPresenceStore.isLoopSendStartedSetTrue()

    presenceloopFn()
    viewingHookFn()
  }

  return {
    startPresenceLoopAndViewingHook,
  }
}
