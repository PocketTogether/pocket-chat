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
