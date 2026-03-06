import type { UsersPresencesStatusResponseWithBaseExpand } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// ## 全部用户的实时状态订阅接收与处理 这一块

// ### 命名确定与简单描述
// ```
// 用于统一处理全部用户的实时状态，包括订阅 PocketBase 的两个集合、
// 将事件写入本地 store、并提供对外可用的实时状态数据。
// ```

// 有两个pinia store，注意是setup组合式的
// ```
// 一个是 useRealtimeUsersPresencesStatusStore
// 文件 src\stores\realtime-users-presences-status.ts
// useRealtimeUsersPresencesStatusStore
// 用于储存 userPresencesStatus 开始订阅以来所得到的，最旧记录 与 最新记录（在线、是否可见、是否输入中）。

// 一个是 useRealtimeUsersNotViewingMarksStore
// 文件 src\stores\realtime-users-not-viewing-marks.ts
// useRealtimeUsersNotViewingMarksStore
// 用于储存 userNotViewingMarks 的最新记录（基于 sendBeacon 的不可见标记）。
// ```

// 有两个组合式函数，将会使用上面这个个store
// ```
// useRealtimeUsersStatusSubscription
// 文件 src\composables\realtime-users-status\subscription.ts
// 用于启动订阅的组合式函数
// 其中有一个启动订阅函数
// 其中调用pb，收到事件时判断并调用store提供的方法来储存数据
// 还会配合两个store中专门用于标记订阅是否已启动的响应式布尔值来避免重复订阅

// useRealtimeUsersStatusComputed
// 文件 src\composables\realtime-users-status\computed.ts
// 用于供其他地方使用实时数据的组合式函数
// 就是会使用两个store中的数据，有一些函数和计算属性以供外界使用
// ```

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
