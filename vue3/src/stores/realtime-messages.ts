import {
  pbMessagesSubscribeAllApi,
  type MessagesResponseWidthExpand,
} from '@/api'
import { Collections, pb } from '@/lib'
import { defineStore } from 'pinia'
import type { UnsubscribeFunc } from 'pocketbase'
import { ref } from 'vue'

/** 用于储存订阅的实时Messages */
export const useRealtimeMessagesStore = defineStore(
  'pocket-together-realtime-messages',
  () => {
    // 储存订实时阅得到的消息
    /** 创建的帖子 */
    const createListRef = ref<MessagesResponseWidthExpand[]>([])
    const createList = computed(() => createListRef.value)
    /** 更新的帖子 */
    const updateListRef = ref<MessagesResponseWidthExpand[]>([])
    const updateList = computed(() => updateListRef.value)
    /* 删除的帖子 */
    const deleteListRef = ref<MessagesResponseWidthExpand[]>([])
    const deleteList = computed(() => deleteListRef.value)

    const unSubscribeFunc = ref<UnsubscribeFunc | null>(null)
    // 启动订阅，将在App.vue调用
    const startSubscribe = async () => {
      if (unSubscribeFunc.value != null) {
        return 'unSubscribeFunc.value != null' as const
      }
      const pbRes = await pbMessagesSubscribeAllApi(async (e) => {
        // // 模拟延迟
        // await new Promise((resolve) => setTimeout(resolve, 6000))

        if (e.action === 'create') {
          createListRef.value.push(e.record)
        }
        if (e.action === 'update') {
          updateListRef.value.push(e.record)
        }
        if (e.action === 'delete') {
          deleteListRef.value.push(e.record)
        }
        // console.log(e)
      })
      unSubscribeFunc.value = pbRes
      return 'pbMessagesSubscribeAllApi'
    }

    return {
      //
      createList,
      updateList,
      deleteList,
      startSubscribe,
    }
  },
  {
    persist: true, // 持久化
  }
)
