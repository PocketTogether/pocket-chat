import {
  pbUsersNotViewingMarksSubscribeAllApi,
  pbUsersPresencesStatusSubscribeAllApi,
} from '@/api'
import {
  useRealtimeUsersNotViewingMarksStore,
  useRealtimeUsersPresencesStatusStore,
} from '@/stores'

/** 用于启动用户实时状态这一块实时订阅的组合式函数 */
export const useRealtimeUsersStatusSubscription = () => {
  const realtimeUsersPresencesStatusStore =
    useRealtimeUsersPresencesStatusStore()
  const realtimeUsersNotViewingMarksStore =
    useRealtimeUsersNotViewingMarksStore()

  /**
   * 启动订阅
   */
  const startSubscription = async () => {
    await Promise.all([
      startSubscriptionForUsersPresencesStatus(),
      startSubscriptionForUsersNotViewingMarks(),
    ]).catch((error) => {
      console.error('realtimeUsersStatusSubscription.startSubscription', error)
    })
  }

  // pbUsersPresencesStatusSubscribeAllApi 启动订阅（只会执行一次）
  const startSubscriptionForUsersPresencesStatus = async () => {
    // presences-status 订阅是否已启动
    if (realtimeUsersPresencesStatusStore.isSubscribeStarted) {
      return
    }
    realtimeUsersPresencesStatusStore.isSubscribeStartedSetTrue()

    await pbUsersPresencesStatusSubscribeAllApi((e) => {
      if (e?.action === 'create') {
        realtimeUsersPresencesStatusStore.upsertStatus(e.record)
      }
    }).catch((error) => {
      console.error('pbUsersPresencesStatusSubscribeAllApi', error)
    })
  }

  // pbUsersNotViewingMarksSubscribeAllApi 启动订阅（只会执行一次）
  const startSubscriptionForUsersNotViewingMarks = async () => {
    // not-viewing-marks 订阅是否已启动
    if (realtimeUsersNotViewingMarksStore.isSubscribeStarted) {
      return
    }
    realtimeUsersNotViewingMarksStore.isSubscribeStartedSetTrue()

    await pbUsersNotViewingMarksSubscribeAllApi((e) => {
      if (e?.action === 'create') {
        realtimeUsersNotViewingMarksStore.upsertMarks(e.record)
      }
    }).catch((error) => {
      console.error('pbUsersNotViewingMarksSubscribeAllApi', error)
    })
  }

  return {
    //
    startSubscription,
  }
}
