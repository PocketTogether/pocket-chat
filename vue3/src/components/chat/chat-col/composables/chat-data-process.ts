import {
  useChatRoomMessagesInfiniteQuery,
  useChatRoomMessagesInfiniteTwowayQuery,
} from '@/queries'
import { useRealtimeMessagesStore } from '@/stores'
import type { TwowayPositioningCursorDataType } from './dependencies'

/** 封装了聊天页的数据及其处理相关内容 双向 */
export const useChatDataProcessMessagesTwoway = (data: {
  twowayPositioningCursorData: TwowayPositioningCursorDataType
  chatRoomId: ComputedRef<string>
}) => {
  const { twowayPositioningCursorData, chatRoomId } = data

  // 聊天页消息 游标分页无限查询
  const chatRoomMessagesInfiniteTwowayQuery =
    useChatRoomMessagesInfiniteTwowayQuery({
      roomId: chatRoomId,
      twowayPositioningCursorData: computed(
        () => twowayPositioningCursorData.value
      ),
    })
  // console.log(
  //   'chatRoomMessagesInfiniteTwowayQuery.data.value',
  //   chatRoomMessagesInfiniteTwowayQuery.data.value
  // )

  /** 是否精细化控制Query数据为null */
  const whetherToSetChatFinelyControlledQueryDataToNull = ref(false)
  /** 精细化控制Query数据，使其在必要时保持为null（常用于数据切换时） */
  const chatRoomMessagesInfiniteTwowayQueryFinelyControlledQueryData = computed(
    () => {
      if (whetherToSetChatFinelyControlledQueryDataToNull.value === true) {
        return null
      }
      return chatRoomMessagesInfiniteTwowayQuery.data.value
    }
  )

  // 将分页数据处理为消息数组，反转（从旧到新）
  const chatRoomMessagesList = computed(() => {
    if (
      chatRoomMessagesInfiniteTwowayQueryFinelyControlledQueryData.value == null
    ) {
      return null
    }
    // 处理为数组
    const messagesListData: Array<
      (typeof chatRoomMessagesInfiniteTwowayQueryFinelyControlledQueryData.value)['pages'][number]['items'][number]
    > = []
    chatRoomMessagesInfiniteTwowayQueryFinelyControlledQueryData.value.pages.forEach(
      (pagesItem) => {
        messagesListData.push(...pagesItem.items)
      }
    )
    // 反转
    const messagesListReverseData = messagesListData.reverse()
    return messagesListReverseData
  })

  // 实时消息Store
  const realtimeMessagesStore = useRealtimeMessagesStore()
  // 从实时消息中，获取本房间的消息
  const chatRoomMessagesRealtime = computed(() => {
    // return realtimeMessagesStore.createList.filter(
    //   (i) => i.room === chatRoomId.value
    // )
    // 【251108】pocket-chat暂时没有房间
    return realtimeMessagesStore.createList
  })

  // 【251103】将此从 chatRoomMessagesListAndRealtime 重命名为 chatRoomMessagesListAndRealtimeStep1Process ，即融合的初步处理 Step1Process
  // 将 MessagesRealtime 和 MessagesList 融合
  const chatRoomMessagesListAndRealtimeStep1Process = computed(() => {
    if (chatRoomMessagesList.value == null) {
      return null
    }
    // 【双向】如果有更新的数据还没有请求，则不与 MessagesRealtime 融合，这是双向查询需要注意的
    // console.log(chatRoomMessagesInfiniteTwowayQuery.hasPreviousPage.value)
    if (chatRoomMessagesInfiniteTwowayQuery.hasPreviousPage.value === true) {
      return chatRoomMessagesList.value
    }

    // // 将MessagesRealtime与MessagesList重复的删除
    // const messagesRealtimeDeleteDuplicates =
    //   chatRoomMessagesRealtime.value.filter(
    //     (realtimaeItem) =>
    //       chatRoomMessagesList.value?.find(
    //         (listItem) => listItem.id === realtimaeItem.id
    //       ) == null
    //   )
    // return [...chatRoomMessagesList.value, ...messagesRealtimeDeleteDuplicates]

    // 【250919】更改为过滤出MessagesRealtime中比MessagesList大的（更新的）
    const messagesRealtimeMoreRecentList = (() => {
      if (chatRoomMessagesList.value.length === 0) {
        return chatRoomMessagesRealtime.value
      }
      const messagesListLatestItem =
        chatRoomMessagesList.value[chatRoomMessagesList.value.length - 1]

      return chatRoomMessagesRealtime.value.filter((realtimaeItem) => {
        // 这个标准时间字符串可以直接比较大小
        return realtimaeItem.created > messagesListLatestItem.created
      })
    })()
    return [...chatRoomMessagesList.value, ...messagesRealtimeMoreRecentList]
  })

  // 【251103】实现删除的效果：消息在Query中为isDeleted则不显示，否则仍然显示（显示删除状态）
  // Query查询中的isDeleted的消息id
  const chatQueryMessagesListIsDeletedMessageId = computed(() => {
    if (chatRoomMessagesList.value == null) {
      return []
    }
    const itemList = chatRoomMessagesList.value.filter(
      (i) => i.isDeleted === true
    )
    const idList = itemList.map((i) => i.id)
    return idList
  })
  // 在chatRoomMessagesListAndRealtime中去除isDeleted的消息 Step2Process
  const chatRoomMessagesListAndRealtimeStep2Process = computed(() => {
    if (chatRoomMessagesListAndRealtimeStep1Process.value == null) {
      return null
    }
    return chatRoomMessagesListAndRealtimeStep1Process.value.filter(
      (i) => !chatQueryMessagesListIsDeletedMessageId.value.includes(i.id)
    )
  })
  const chatRoomMessagesListAndRealtime =
    chatRoomMessagesListAndRealtimeStep2Process

  /**
   * 消息查询是否错误，即是否需要输入栏显示错误所需的刷新。
   * chatRoomMessagesInfiniteTwowayQuery.isError.value 为 true 且，
   * chatRoomMessagesList 为 null 时，
   * 这样判断以忽略上下加载导致的错误（无需刷新，再次加载即可）
   */
  const chatMessageQueryisNullAndError = computed(() => {
    if (
      chatRoomMessagesInfiniteTwowayQuery.isError.value === true &&
      chatRoomMessagesList.value == null
    ) {
      return true
    }
    return false
  })
  return {
    chatRoomMessagesInfiniteTwowayQuery,
    chatRoomMessagesList,
    chatRoomMessagesRealtime,
    chatRoomMessagesListAndRealtime,
    whetherToSetChatFinelyControlledQueryDataToNull,
    chatMessageQueryisNullAndError,
  }
}
