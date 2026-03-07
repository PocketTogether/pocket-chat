import { useSelfPresenceStore } from '@/stores'
import { useSelfPresenceDispatcher } from './dispatcher'

// 用于供输入栏组件调用，更新 store 中的输入状态，
// 还能在在第一次输入或发送消息后调用SelfPresenceDispatcher中的方法，以便立即判断并决定是否立即发送。

export const useSelfPresenceTypingReporter = () => {
  //
  const selfPresenceStore = useSelfPresenceStore()
  const selfPresenceDispatcher = useSelfPresenceDispatcher()

  /** --------------------------------
   * 输入事件：reportTypingOnInput
   * --------------------------------
   * 1. 设置 isTypingMark = true
   * 2. 如果之前不是 typing 状态（即从 false → true）
   *    则立即调用 sendPresenceIfNeedAndCanSend
   */
  const reportTypingOnInput = async () => {
    const wasTyping = selfPresenceDispatcher.isTypingFn()

    selfPresenceStore.isTypingMarkSet(true)

    // 如果是从非输入状态进入输入状态，则立即发送 presence
    if (!wasTyping) {
      try {
        await selfPresenceDispatcher.sendPresenceIfNeedAndCanSend()
      } catch (err) {
        console.error('reportTypingOnInput sendPresence error:', err)
      }
    }
  }

  /** --------------------------------
   * 发送消息后：reportTypingOnMessageSend
   * --------------------------------
   * 1. 设置 isTypingMark = false
   * 2. 立即调用 sendPresenceIfNeedAndCanSend
   *
   * 在消息编辑提交、消息编辑提交时也会调用
   */
  const reportTypingOnMessageSend = async () => {
    selfPresenceStore.isTypingMarkSet(false)

    try {
      await selfPresenceDispatcher.sendPresenceIfNeedAndCanSend()
    } catch (err) {
      console.error('reportTypingOnMessageSend sendPresence error:', err)
    }
  }

  return {
    //
    reportTypingOnInput,
    reportTypingOnMessageSend,
  }
}

export type selfPresenceTypingReporterType = ReturnType<
  typeof useSelfPresenceTypingReporter
>
