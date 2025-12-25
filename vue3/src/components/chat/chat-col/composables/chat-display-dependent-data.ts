import type {
  MessagesResponseWidthExpand,
  PMLRCApiParameters0DataPageParamNonNullable,
} from '@/api'
import {
  chatRoomMessagesInfoDialogQueryKey,
  chatRoomMessagesTwowayPositioningCursorRouterQueryParametersKeyConfig,
} from '@/config'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import type {
  ChatRoomMessagesInfiniteTwowayQueryType,
  ChatRoomMessagesLimitTopCursorType,
  ChatRoomMessagesListAndRealtimeType,
  PropsType,
  RefChatColTemplateBaseType,
} from './dependencies'
import { useRouterHistoryStore } from '@/stores'

// 封装，定义 与 初始化，分开

// 定义
// 封装：
// 定位游标数据、链接定位标记、回复定位标记 、……
// 等聊天显示所依赖的数据 的定义与配套方法
// 聊天显示所依赖的数据 ChatDisplayDependentData chat-display-dependent-data

// 聊天显示所依赖的数据 的定义与配套方法
// 注：其中返回的的数据，并不是全部的聊天显示所依赖的数据，还有一些特殊的：
// - 消息显示限制游标 chatRoomMessagesLimitTopCursor 与 chatRoomMessagesLimitBottomCursor 在 chat-show-limit.ts 中定义与初始化
// - 输入栏内容 chatInputContent 、回复消息 chatReplyMessage 在 ChatInputBar.vue 中定义与初始化
// - 消息对话框数据
// - 滚动位置值 refScrollWarp?.scrollTop 在 chat-scroll.ts 中初始化

export const useChatDisplayDependentDataDefinition = () => {
  /** 双向定位无限查询的定位游标数据 */
  const twowayPositioningCursorData =
    ref<PMLRCApiParameters0DataPageParamNonNullable | null>(null)

  // 链接定位标记，如果消息id等于此，将显示链接标记
  const linkPositioningFlagMessageId = ref<string | null>(null)
  // 控制链接标记是否显示，消息被点击会使其不显示
  const linkPositioningFlagShow = ref(false)
  const linkPositioningFlagClose = () => {
    linkPositioningFlagShow.value = false
  }

  // 回复定位标记
  const replyPositioningFlagMessageId = ref<string | null>(null)
  const replyPositioningFlagShow = ref(false)
  const replyPositioningFlagClose = () => {
    replyPositioningFlagShow.value = false
  }
  const replyPositioningFlagOpen = (messageId: string) => {
    replyPositioningFlagMessageId.value = messageId
    replyPositioningFlagShow.value = true
  }

  /** 重置双向定位无限查询的定位游标数据和相关数据 */
  const resetPositioningCursorDataAndRelatedData = () => {
    twowayPositioningCursorData.value = null
    linkPositioningFlagMessageId.value = null
    linkPositioningFlagShow.value = false
    replyPositioningFlagMessageId.value = null
    replyPositioningFlagShow.value = false
  }

  return {
    //
    twowayPositioningCursorData,
    linkPositioningFlagMessageId,
    linkPositioningFlagShow,
    linkPositioningFlagClose,
    replyPositioningFlagMessageId,
    replyPositioningFlagShow,
    replyPositioningFlagClose,
    replyPositioningFlagOpen,
    resetPositioningCursorDataAndRelatedData,
  }
}

// 初始化
// 首先初始化 twowayPositioningCursorData ，其他数据的初始化要等到得到 chatRoomMessagesInfiniteTwowayQuery（c33y） 之后
// 需要先初始化twowayPositioningCursorData是因为chatRoomMessagesInfiniteTwowayQuery依赖这个
// 其他数据的初始化要在c33y之后，是因为要需要有c33y来判断“页面恢复数据”是否正确

// 获取各种初始化情况的对应数据，并决定使用哪种初始化
export const useChatDisplayDependentDataInitializationChoose = () => {
  const route = useRoute()
  const router = useRouter()

  // 聊天页 双向定位游标 路由查询参数 键统一管理，以便在多处使用
  const { id: keyId, created: keyCreated } =
    chatRoomMessagesTwowayPositioningCursorRouterQueryParametersKeyConfig

  // 获取根据路由定位查询参数初始化数据
  const routeQueryPositioningCursorData = (() => {
    const id = route.query[keyId]
    const created = route.query[keyCreated]
    if (
      id == null ||
      created == null ||
      typeof id !== 'string' ||
      typeof created !== 'string'
    ) {
      return null
    }
    return {
      id,
      created,
    }
  })()

  // 获取根据页面恢复数据初始化数据
  const routerHistoryStore = useRouterHistoryStore()
  const chatColPageRecoverData =
    routerHistoryStore.currentGetPageRecoverDataForChatColItem()

  // 决定使用哪种初始化
  const chooseInitialization = (() => {
    // 优先使用页面恢复数据初始化
    if (chatColPageRecoverData != null) {
      return 'chatColPageRecoverData' as const
    }
    if (routeQueryPositioningCursorData != null) {
      return 'routeQueryPositioningCursorData' as const
    }
    return 'none' as const
  })()

  // 无论使用哪种初始化，都清除路由中的查询参数
  // router.replace({
  //   path: route.path,
  //   query: {
  //     ...route.query,
  //     [keyId]: undefined,
  //     [keyCreated]: undefined,
  //   },
  // })
  const newQuery = { ...route.query }
  delete newQuery[keyId]
  delete newQuery[keyCreated]
  // 对于 MessageInfoDialog 如果是 chatColPageRecoverData 则保留，否则也清除
  if (chooseInitialization !== 'chatColPageRecoverData') {
    delete newQuery[chatRoomMessagesInfoDialogQueryKey]
  }
  router.replace({
    path: route.path,
    query: newQuery,
  })

  return {
    chooseInitialization,
    routeQueryPositioningCursorData,
    chatColPageRecoverData,
  }
}
export type ChatDisplayDependentDataInitializationChooseType = ReturnType<
  typeof useChatDisplayDependentDataInitializationChoose
>

// twowayPositioningCursorData 的初始化
export const useTwowayPositioningCursorDataInitialization = (data: {
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  twowayPositioningCursorData: Ref<PMLRCApiParameters0DataPageParamNonNullable | null>
}) => {
  const {
    twowayPositioningCursorData,
    chatDisplayDependentDataInitializationChoose,
  } = data

  const {
    chooseInitialization,
    routeQueryPositioningCursorData,
    chatColPageRecoverData,
  } = chatDisplayDependentDataInitializationChoose

  // 根据页面恢复数据初始化
  if (
    chooseInitialization === 'chatColPageRecoverData' &&
    chatColPageRecoverData != null
  ) {
    twowayPositioningCursorData.value =
      chatColPageRecoverData.data.twowayPositioningCursorData
  }
  // 根据路由定位查询参数初始化
  else if (
    chooseInitialization === 'routeQueryPositioningCursorData' &&
    routeQueryPositioningCursorData != null
  ) {
    twowayPositioningCursorData.value = routeQueryPositioningCursorData
  }
}

/**
 * 检查“页面恢复数据”是否正确，以页面恢复数据初始化时需要确保数据正确
 */
export const useChatColPageRecoverDataCheck = (data: {
  chatRoomMessagesListAndRealtime: ChatRoomMessagesListAndRealtimeType
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  chatRoomId: ComputedRef<string>
}) => {
  const {
    chatRoomMessagesListAndRealtime,
    chatDisplayDependentDataInitializationChoose,
    chatRoomId,
  } = data

  const { chooseInitialization, chatColPageRecoverData } =
    chatDisplayDependentDataInitializationChoose

  // chooseInitialization 不为 chatColPageRecoverData 则返回false
  if (
    chooseInitialization !== 'chatColPageRecoverData' ||
    chatColPageRecoverData == null
  ) {
    return false
  }

  const {
    chatRoomId: chatRoomIdCheck,
    chatRoomMessagesLimitTopCursor,
    chatRoomMessagesLimitBottomCursor,
  } = chatColPageRecoverData.data

  // chatRoomId 与 chatRoomIdCheck 不相符 则返回false
  if (chatRoomId.value !== chatRoomIdCheck) {
    return false
  }

  // 如果 chatRoomMessagesLimitTopCursor 有id值但 chatRoomMessagesListAndRealtime 的数据中没有 则返回false
  if (
    chatRoomMessagesLimitTopCursor != null &&
    chatRoomMessagesLimitTopCursor !== 'no-limit'
  ) {
    if (chatRoomMessagesListAndRealtime.value == null) {
      return false
    }
    const find = chatRoomMessagesListAndRealtime.value.find(
      (i) => i.id === chatRoomMessagesLimitTopCursor
    )
    if (find == null) {
      return false
    }
  }
  // 如果 chatRoomMessagesLimitBottomCursor 有id值但 chatRoomMessagesListAndRealtime 的数据中没有 则返回false
  if (
    chatRoomMessagesLimitBottomCursor != null &&
    chatRoomMessagesLimitBottomCursor !== 'no-limit'
  ) {
    if (chatRoomMessagesListAndRealtime.value == null) {
      return false
    }
    const find = chatRoomMessagesListAndRealtime.value.find(
      (i) => i.id === chatRoomMessagesLimitBottomCursor
    )
    if (find == null) {
      return false
    }
  }

  // 通过检查
  return true
}
export type ChatColPageRecoverDataCheckType = ReturnType<
  typeof useChatColPageRecoverDataCheck
>

// 聊天显示所依赖的数据 的初始化（除twowayPositioningCursorData外）
export const useChatDisplayDependentDataInitialization = (data: {
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
  linkPositioningFlagMessageId: Ref<string | null>
  linkPositioningFlagShow: Ref<boolean>
  replyPositioningFlagMessageId: Ref<string | null>
  replyPositioningFlagShow: Ref<boolean>
}) => {
  const {
    chatDisplayDependentDataInitializationChoose,
    chatColPageRecoverDataCheck,
    linkPositioningFlagMessageId,
    linkPositioningFlagShow,
    replyPositioningFlagMessageId,
    replyPositioningFlagShow,
  } = data

  const {
    chooseInitialization,
    routeQueryPositioningCursorData,
    chatColPageRecoverData,
  } = chatDisplayDependentDataInitializationChoose

  // console.log('chooseInitialization', chooseInitialization)
  // console.log('chatColPageRecoverData', chatColPageRecoverData)
  // console.log('chatColPageRecoverDataCheck', chatColPageRecoverDataCheck)

  // 根据页面恢复数据初始化
  if (
    chooseInitialization === 'chatColPageRecoverData' &&
    chatColPageRecoverData != null &&
    // 判断 “页面恢复数据” 是否正确，正确才进行此方式的初始化
    chatColPageRecoverDataCheck === true
  ) {
    linkPositioningFlagMessageId.value =
      chatColPageRecoverData.data.linkPositioningFlagMessageId
    linkPositioningFlagShow.value =
      chatColPageRecoverData.data.linkPositioningFlagShow
    replyPositioningFlagMessageId.value =
      chatColPageRecoverData.data.replyPositioningFlagMessageId
    replyPositioningFlagShow.value =
      chatColPageRecoverData.data.replyPositioningFlagShow
  }
  // 根据路由定位查询参数初始化
  else if (
    chooseInitialization === 'routeQueryPositioningCursorData' &&
    routeQueryPositioningCursorData != null
  ) {
    //
    linkPositioningFlagMessageId.value = routeQueryPositioningCursorData.id
    linkPositioningFlagShow.value = true
  }
}

// 页面恢复数据收集
export const useChatColPageRecoverDataSetOnBeforeUnmountAndRouteLeave = (data: {
  //
  props: PropsType
  twowayPositioningCursorData: Ref<PMLRCApiParameters0DataPageParamNonNullable | null>
  linkPositioningFlagMessageId: Ref<string | null>
  linkPositioningFlagShow: Ref<boolean>
  replyPositioningFlagMessageId: Ref<string | null>
  replyPositioningFlagShow: Ref<boolean>
  chatRoomMessagesLimitTopCursor: ChatRoomMessagesLimitTopCursorType
  chatRoomMessagesLimitBottomCursor: ChatRoomMessagesLimitTopCursorType
  refChatColTemplateBase: RefChatColTemplateBaseType
  chatRoomMessagesRealtimeReadNumber: Ref<number>
}) => {
  const {
    //
    props,
    twowayPositioningCursorData,
    linkPositioningFlagMessageId,
    linkPositioningFlagShow,
    replyPositioningFlagMessageId,
    replyPositioningFlagShow,
    chatRoomMessagesLimitTopCursor,
    chatRoomMessagesLimitBottomCursor,
    refChatColTemplateBase,
    chatRoomMessagesRealtimeReadNumber,
  } = data

  const routerHistoryStore = useRouterHistoryStore()
  // onBeforeUnmount 有一些问题，有时会在 router.afterEach 之后才执行，这对于自己是不正确的，
  // 而 onBeforeRouteLeave 虽然能确保在 router.afterEach 之前执行（确定吗），但不会触发于非路由卸载（如 v-if）
  // 所以需要将 onBeforeUnmount 和 beforeRouteLeave结合，同时使用这两个，只要让这两个不会执行两次即可

  const chatColPageRecoverDataSet = () => {
    // console.log(
    //   'routerHistoryStore.currentUuid',
    //   routerHistoryStore.currentUuid
    // )
    if (
      props.refScrollWarp == null ||
      refChatColTemplateBase.value?.refChatInputBar == null ||
      refChatColTemplateBase.value?.refMessageInfoDialog == null
    ) {
      // console.log(`
      // props.refScrollWarp == null ||
      // refChatColTemplateBase.value?.refChatInputBar == null
      // `)
      return
    }
    const {
      chatInputContent,
      chatImageSelectList,
      chatReplyMessage,
      chatEditMessage,
      chatMessageIsRealtimeTimeout,
    } = refChatColTemplateBase.value.refChatInputBar

    const dialogMessageId =
      refChatColTemplateBase.value.refMessageInfoDialog.dialogMessageId
    const refScrollWarpScrollTop = props.refScrollWarp.scrollTop

    routerHistoryStore.currentSetPageRecoverDataForChatColItem({
      chatRoomId: props.roomId,
      twowayPositioningCursorData: twowayPositioningCursorData.value,
      linkPositioningFlagMessageId: linkPositioningFlagMessageId.value,
      linkPositioningFlagShow: linkPositioningFlagShow.value,
      replyPositioningFlagMessageId: replyPositioningFlagMessageId.value,
      replyPositioningFlagShow: replyPositioningFlagShow.value,
      chatRoomMessagesLimitTopCursor: chatRoomMessagesLimitTopCursor.value,
      chatRoomMessagesLimitBottomCursor:
        chatRoomMessagesLimitBottomCursor.value,
      chatInputContent,
      chatImageSelectList,
      chatReplyMessage,
      chatEditMessage,
      chatMessageIsRealtimeTimeout,
      dialogMessageId,
      refScrollWarpScrollTop,
      chatRoomMessagesRealtimeReadNumber:
        chatRoomMessagesRealtimeReadNumber.value,
    })
    // console.log(routerHistoryStore.pageRecoverDataForChatCol)
  }
  // chatColPageRecoverDataSet 是否已执行
  let chatColPageRecoverDataSetHasRun = false
  // 让 chatColPageRecoverDataSet 只执行一次
  const chatColPageRecoverDataSetRunOnce = () => {
    if (chatColPageRecoverDataSetHasRun) {
      return
    }
    chatColPageRecoverDataSetHasRun = true
    chatColPageRecoverDataSet()
  }

  onBeforeUnmount(() => {
    chatColPageRecoverDataSetRunOnce()
  })
  onBeforeRouteLeave(() => {
    chatColPageRecoverDataSetRunOnce()
  })
}
