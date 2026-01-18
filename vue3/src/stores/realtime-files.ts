import type { FilesResponseWithBaseExpand } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 当前 Store 的版本号。
 *
 * 当 store 的结构（字段、类型）发生不兼容更新时，
 * 修改此版本号即可强制生成一个新的持久化存储空间。
 * 避免旧数据与新类型不符导致运行时错误。
 */
const STORE_VERSION = 'v1'

/** 用于储存订阅的实时Files */
export const useRealtimeFilesStore = defineStore(
  `pocket-together-realtime-files-${STORE_VERSION}`,
  () => {
    // 储存订实时阅得到的消息
    /** 创建的 */
    const createListRef = ref<FilesResponseWithBaseExpand[]>([])
    const createList = computed(() => createListRef.value)
    // 用于实时事件时的添加，push即可。返回true代表成功添加，返回false代表已存在
    const createListCheckAndPush = (val: FilesResponseWithBaseExpand) => {
      // 使用 id 字段作为唯一标识，如果已存在则直接返回
      if (createListRef.value.find((item) => item.id === val.id) != null) {
        return false
      }
      // push即可
      createListRef.value.push(val)
      return true
    }
    // 【260102】文件暂不需要断线补偿
    // // 用于断线补偿时的添加，查找“比自己小且最接近”的元素，在其之后后插入
    // const createListCheckAndInsert = (val: FilesResponseWithBaseExpand) => {
    //   // 使用 id 字段作为唯一标识，如果已存在则直接返回
    //   if (createListRef.value.find((item) => item.id === val.id) != null) {
    //     return false
    //   }
    //   // 从尾部开始往前找
    //   for (let i = createListRef.value.length - 1; i >= 0; i--) {
    //     if (createListRef.value[i].created <= val.created) {
    //       // 查找“比自己小且最接近”的元素，在其之后后插入
    //       createListRef.value.splice(i + 1, 0, val)
    //       return true
    //     }
    //   }
    //   // 如果没有找到比自己小的，插到最前面
    //   createListRef.value.unshift(val)
    //   return true
    // }

    /** 更新的 */
    const updateListRef = ref<FilesResponseWithBaseExpand[]>([])
    const updateList = computed(() => updateListRef.value)
    const updateListPush = (val: FilesResponseWithBaseExpand) => {
      updateListRef.value.push(val)
    }
    // 从尾部向前找，就是最新的
    const updateListFindLatestById = (id: string) => {
      const list = updateListRef.value
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].id === id) {
          return list[i]
        }
      }
      return null
    }

    /* 删除的 */
    const deleteListRef = ref<FilesResponseWithBaseExpand[]>([])
    const deleteList = computed(() => deleteListRef.value)
    const deleteListPush = (val: FilesResponseWithBaseExpand) => {
      deleteListRef.value.push(val)
    }

    // 是否已启动订阅
    const isSubscribeStartedRef = ref(false)
    const isSubscribeStarted = computed(() => isSubscribeStartedRef.value)
    const isSubscribeStartedSetTrue = () => {
      isSubscribeStartedRef.value = true
    }

    // 是否订阅已就绪
    const isSubscribeReadyRef = ref(false)
    const isSubscribeReady = computed(() => isSubscribeReadyRef.value)
    const isSubscribeReadySetTrue = () => {
      isSubscribeReadyRef.value = true
    }

    // 【260102】文件暂不需要断线补偿
    // // 记录第一次实时连接时得到的第一个消息，也用于判断当前是否为第一次实时连接，none 代表第一次连接时没有消息
    // const firstPbConnectMessageRef = ref<
    //   FilesResponseWithBaseExpand | 'none' | null
    // >(null)
    // const firstPbConnectMessage = computed(() => firstPbConnectMessageRef.value)
    // const firstPbConnectMessageSet = (
    //   val: FilesResponseWithBaseExpand | 'none'
    // ) => {
    //   firstPbConnectMessageRef.value = val
    // }

    return {
      //
      createList,
      createListCheckAndPush,
      // createListCheckAndInsert,
      updateList,
      updateListPush,
      updateListFindLatestById,
      deleteList,
      deleteListPush,
      isSubscribeStarted,
      isSubscribeStartedSetTrue,
      isSubscribeReady,
      isSubscribeReadySetTrue,
      // firstPbConnectMessage,
      // firstPbConnectMessageSet,
    }
  },
  {
    persist: true, // 持久化
  }
)
