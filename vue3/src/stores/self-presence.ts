import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SelfPresenceSentPayloadType = {
  isTyping: boolean
  isNotViewing: boolean
}

/**
 * 当前 Store 的版本号。
 *
 * 当 store 的结构（字段、类型）发生不兼容更新时，
 * 修改此版本号即可强制生成一个新的持久化存储空间。
 * 避免旧数据与新类型不符导致运行时错误。
 */
const STORE_VERSION = 'v1'

// ## 用户自己的实时状态循环检查与发送 这一块

// ### 命名确定与简单描述
// ```
// 用于管理用户自己的实时状态，包括本地状态管理（在 store 中）、
// 间隔 5 秒的无限循环判断与发送逻辑，以及 visibilitychange(hidden) 时的 sendBeacon 发送。
// ```

// 有一个pinia store，注意是setup组合式的
// ```
// useSelfPresenceStore
// 文件 src/stores/self-presence.ts
// 用于储存本地状态：是否输入中、上次发送内容、上次发送完成时间戳、当前是否正在发送、是否已启动循环等。
// ```

// 三个组合式函数，会使用上面这个store
// ```
// useSelfPresenceDispatcher
// 文件 src/composables/self-presence/dispatcher.ts
// 用于封装判断与发送逻辑，提供方法供外界调用，
// 如：判断是否需要发送、执行发送、立即触发一次判断与发送等。

// useSelfPresenceLoopAndViewingHook
// 文件 src/composables/self-presence/loop-hook.ts
// 用于在 app.vue 中，调用本组合式函数中的某个函数，启动无限循环与监听 visibilitychange，
// 内部会配合 store 中的响应式布尔值标记避免重复启动，
// 会使用 useSelfPresenceDispatcher ，循环中会调用SelfPresenceDispatcher中的方法。

// useSelfPresenceTypingReporter
// 文件 src/composables/self-presence/typing-reporter.ts
// 用于供输入栏组件调用，更新 store 中的输入状态，
// 还能在在第一次输入或发送后调用SelfPresenceDispatcher中的方法，以便立即判断并决定是否立即发送。
// ```

/** 用于储存本地自己的实时状态 */
export const useSelfPresenceStore = defineStore(
  `pocket-together-self-presence-${STORE_VERSION}`,
  () => {
    /** typing 标记 */
    const isTypingMarkRef = ref(false)
    const isTypingMark = computed(() => isTypingMarkRef.value)

    const isTypingMarkTimestampRef = ref<number | null>(null)
    const isTypingMarkTimestamp = computed(() => isTypingMarkTimestampRef.value)

    const isTypingMarkSet = (val: boolean) => {
      isTypingMarkRef.value = val
      isTypingMarkTimestampRef.value = Date.now()
    }

    /** presence 发送记录 */
    const lastPresenceSentTimestampRef = ref<number | null>(null)
    const lastPresenceSentTimestamp = computed(
      () => lastPresenceSentTimestampRef.value
    )

    const lastPresenceSentPayloadRef = ref<SelfPresenceSentPayloadType | null>(
      null
    )
    const lastPresenceSentPayload = computed(
      () => lastPresenceSentPayloadRef.value
    )

    const lastPresenceSentPayloadSet = (
      payload: SelfPresenceSentPayloadType
    ) => {
      lastPresenceSentPayloadRef.value = payload
      lastPresenceSentTimestampRef.value = Date.now()
    }

    /** presence 发送状态 */
    const isPresenceSentSuccessRef = ref<boolean | null>(null)
    const isPresenceSentSuccess = computed(() => isPresenceSentSuccessRef.value)
    const isPresenceSentSuccessSet = (val: boolean | null) => {
      isPresenceSentSuccessRef.value = val
    }

    const isPresenceSendingRef = ref(false)
    const isPresenceSending = computed(() => isPresenceSendingRef.value)
    const isPresenceSendingSet = (val: boolean) => {
      isPresenceSendingRef.value = val
    }

    /** not-viewing-marks 发送记录 */
    const lastNotViewingMarksSentTimestampRef = ref<number | null>(null)
    const lastNotViewingMarksSentTimestamp = computed(
      () => lastNotViewingMarksSentTimestampRef.value
    )
    const lastNotViewingMarksSentTimestampSetNow = () => {
      lastNotViewingMarksSentTimestampRef.value = Date.now()
    }

    /** 是否已启动轮询发送 */
    const isLoopSendStartedRef = ref(false)
    const isLoopSendStarted = computed(() => isLoopSendStartedRef.value)
    const isLoopSendStartedSetTrue = () => {
      isLoopSendStartedRef.value = true
    }

    return {
      isTypingMark,
      isTypingMarkSet,
      isTypingMarkTimestamp,

      lastPresenceSentTimestamp,
      lastPresenceSentPayload,
      lastPresenceSentPayloadSet,

      isPresenceSending,
      isPresenceSendingSet,
      isPresenceSentSuccess,
      isPresenceSentSuccessSet,

      lastNotViewingMarksSentTimestamp,
      lastNotViewingMarksSentTimestampSetNow,

      isLoopSendStarted,
      isLoopSendStartedSetTrue,
    }
  },
  {
    persist: true,
  }
)
