import type { UsersNotViewingMarksResponse } from '@/lib'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 用于储存订阅的实时UsersNotViewingMarks */
export const useRealtimeUsersNotViewingMarksStore = defineStore(
  'pocket-together-realtime-users-not-viewing-marks',
  () => {
    type MapDataItem = UsersNotViewingMarksResponse

    /** Map<userId, MapDataItem> */
    const marksMapByUserRef = ref<Map<string, MapDataItem>>(new Map())

    /** 只读暴露（编译期只读，不做运行时拷贝） */
    const marksMapByUser = computed<ReadonlyMap<string, MapDataItem>>(
      () => marksMapByUserRef.value
    )

    /** 插入或更新用户的 not-viewing-marks 记录 */
    const upsertMarks = (record: MapDataItem) => {
      const userId = record.author
      marksMapByUserRef.value.set(userId, record)
    }

    /** 是否已启动订阅 */
    const isSubscribeStartedRef = ref(false)
    const isSubscribeStarted = computed(() => isSubscribeStartedRef.value)
    const isSubscribeStartedSetTrue = () => {
      isSubscribeStartedRef.value = true
    }

    return {
      marksMapByUser,
      upsertMarks,
      isSubscribeStarted,
      isSubscribeStartedSetTrue,
    }
  }
)
