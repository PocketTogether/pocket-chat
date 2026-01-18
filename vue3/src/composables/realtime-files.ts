import { pbFilesSubscribeAllApi, type FilesResponseWithBaseExpand } from '@/api'
import { appUserDefaultAvatar, routerDict } from '@/config'
import { pb } from '@/lib'
import { useI18nStore, useRealtimeFilesStore } from '@/stores'
import { useWebNotification } from '@vueuse/core'
import { useRoute } from 'vue-router'

export const useRealtimeFilesSubscribe = () => {
  const realtimeFilesStore = useRealtimeFilesStore()

  // 启动订阅，将在App.vue调用
  const startSubscribe = async () => {
    // 防止多次调用
    if (realtimeFilesStore.isSubscribeStarted) {
      return 'realtimeFilesStore.isSubscribeStarted' as const
    }
    realtimeFilesStore.isSubscribeStartedSetTrue()

    // pb实时文件订阅
    await pbFilesSubscribeAllApi(
      async (e: { action: string; record: FilesResponseWithBaseExpand }) => {
        // // 模拟延迟
        // await new Promise((resolve) => setTimeout(resolve, 6000))

        if (e.action === 'create') {
          realtimeFilesStore.createListCheckAndPush(e.record)
        }
        if (e.action === 'update') {
          realtimeFilesStore.updateListPush(e.record)
        }
        if (e.action === 'delete') {
          realtimeFilesStore.deleteListPush(e.record)
        }
        // console.log(e)
      }
    ).catch((error) => {
      console.error('pbFilesSubscribeAllApi', error)
    })

    realtimeFilesStore.isSubscribeReadySetTrue()
    return 'startSubscribe'
  }

  return {
    startSubscribe,
  }
}
