import type { UsersPresencesStatusResponseWithBaseExpand } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 用于储存订阅的实时UsersPresencesStatus */
export const useRealtimeUsersPresencesStatusStore = defineStore(
  'pocket-together-realtime-users-presences-status',
  () => {
    type MapDataItem = UsersPresencesStatusResponseWithBaseExpand

    /** 最新记录 Map<userId, MapDataItem> */
    const statusLatestMapByUserRef = ref<Map<string, MapDataItem>>(new Map())
    // ReadonlyMap 避免修改方法被调用
    const statusLatestMapByUser = computed<ReadonlyMap<string, MapDataItem>>(
      () => statusLatestMapByUserRef.value
    )

    /** 最早记录 Map<userId, MapDataItem> */
    const statusEarliestMapByUserRef = ref<Map<string, MapDataItem>>(new Map())
    // ReadonlyMap 避免修改方法被调用
    const statusEarliestMapByUser = computed<ReadonlyMap<string, MapDataItem>>(
      () => statusEarliestMapByUserRef.value
    )

    /**
     * 插入或更新用户状态记录
     * record.author 为 userId
     */
    const upsertStatus = (record: MapDataItem) => {
      const userId = record.author

      // 更新最新记录
      statusLatestMapByUserRef.value.set(userId, record)

      // 更新最早记录（只在首次出现时写入）
      if (!statusEarliestMapByUserRef.value.has(userId)) {
        statusEarliestMapByUserRef.value.set(userId, record)
      }
    }

    /** 是否已启动订阅 */
    const isSubscribeStartedRef = ref(false)
    const isSubscribeStarted = computed(() => isSubscribeStartedRef.value)
    const isSubscribeStartedSetTrue = () => {
      isSubscribeStartedRef.value = true
    }

    return {
      statusLatestMapByUser,
      statusEarliestMapByUser,
      upsertStatus,
      isSubscribeStarted,
      isSubscribeStartedSetTrue,
    }
  }
)
