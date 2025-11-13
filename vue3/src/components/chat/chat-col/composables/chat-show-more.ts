import {
  chatRoomMessagesLimitLoadMoreMaxItemNumberConfig,
  chatRoomMessagesLimitShowItemMaxNumberConfig,
  chatRoomMessagesShowMoreAfterDelayMsConfig,
  chatRoomMessagesShowMoreBeforeDelayMsConfig,
} from '@/config'
import type {
  ChatRoomMessagesInfiniteTwowayQueryType,
  ChatRoomMessagesLimitBottomCursorType,
  ChatRoomMessagesLimitListType,
  ChatRoomMessagesLimitTopCursorType,
  ChatRoomMessagesListAndRealtimeType,
  ChatScrollAdjustPositionAfterMessageChangeType,
  ChatScrollCaptureSnapshotBeforeMessageChangeType,
} from './dependencies'
import { potoMessage } from '@/utils'
import { useI18nStore } from '@/stores'

/** 封装了在聊天顶部或底部显示更多的函数，加载更多，控制显示限制 双向 */
export const useChatShowMoreOnTopOrBottomTwoway = (data: {
  chatRoomMessagesListAndRealtime: ChatRoomMessagesListAndRealtimeType
  chatRoomMessagesLimitList: ChatRoomMessagesLimitListType
  chatRoomMessagesInfiniteTwowayQuery: ChatRoomMessagesInfiniteTwowayQueryType
  chatRoomMessagesLimitTopCursor: ChatRoomMessagesLimitTopCursorType
  chatRoomMessagesLimitBottomCursor: ChatRoomMessagesLimitBottomCursorType
  chatScrollCaptureSnapshotBeforeMessageChange: ChatScrollCaptureSnapshotBeforeMessageChangeType
  chatScrollAdjustPositionAfterMessageChange: ChatScrollAdjustPositionAfterMessageChangeType
}) => {
  const {
    chatRoomMessagesListAndRealtime,
    chatRoomMessagesLimitList,
    chatRoomMessagesInfiniteTwowayQuery,
    chatRoomMessagesLimitTopCursor,
    chatRoomMessagesLimitBottomCursor,
    chatScrollCaptureSnapshotBeforeMessageChange,
    chatScrollAdjustPositionAfterMessageChange,
  } = data

  const i18nStore = useI18nStore()

  // 【251110】解决发现的严重问题
  // 消息加载中时跳转至设置页再返回时可能导致问题，十分严重，会导致页面卡死。可能是因为组件卸载后导致加载更多请求逻辑无限循环导致的
  let isUnmounted = false
  onUnmounted(() => {
    isUnmounted = true
  })

  /**
   * 下一页逻辑，向上加载更多
   * ```
   * chatRoomMessagesListAndRealtime 简称 cRMLAR ，是当前无限查询加实时消息全部的数组
   * chatRoomMessagesLimitLoadMoreMaxItemNumberConfig 简称 cRMLLMMINC ，是每次加载更多消息的最多数量
   * chatRoomMessagesLimitTopCursor
   * chatRoomMessagesLimitBottomCursor
   *
   * 循环 {
   *   判断剩余的 cRMLAR 是否足够 cRMLLMMINC，够 {
   *     退出循环
   *   }
   *   是否最后一页，是 {
   *     退出循环
   *   }
   *   请求下一页
   * }
   *
   * 计算限制游标，赋值
   * ```
   */
  // 控制显示限制，让聊天顶部加载更多
  const controlLimitToShowMoreOnTop = async (data: {
    /**
     * 在显示限制游标被赋值的前一刻，会调用这个函数
     * 也就是显示内容改变的前一刻，主要用于 chatScrollCaptureSnapshotBeforeMessageChange 调用
     */
    beforeLimitCursorUpdate: () => void
  }) => {
    const { beforeLimitCursorUpdate } = data

    // chatRoomMessagesLimitTopCursor/BottomCursor 为 null，这是不正常的情况，返回
    if (
      chatRoomMessagesLimitTopCursor.value == null ||
      chatRoomMessagesLimitBottomCursor.value == null
    ) {
      return
    }
    // 没有消息数据，直接返回
    if (
      chatRoomMessagesListAndRealtime.value == null ||
      chatRoomMessagesListAndRealtime.value.length === 0
    ) {
      return
    }
    if (
      chatRoomMessagesLimitList.value == null ||
      chatRoomMessagesLimitList.value.length === 0
    ) {
      return
    }
    // 已经显示最顶部的数据，返回
    if (
      chatRoomMessagesInfiniteTwowayQuery.hasNextPage.value === false &&
      chatRoomMessagesLimitList.value[0].id ===
        chatRoomMessagesListAndRealtime.value[0].id
    ) {
      return
    }
    // chatRoomMessagesLimitTopCursor.value 为 'no-limit' 是特殊情况，不需要再加载更多，返回
    if (chatRoomMessagesLimitTopCursor.value === 'no-limit') {
      return
    }
    while (true) {
      // 计算顶部剩余的数量（cRMLAR）
      const topRemainingNumber = (() => {
        // 获取 index
        const findIndex = chatRoomMessagesListAndRealtime.value.findIndex(
          (i) => i.id === chatRoomMessagesLimitTopCursor.value
        )
        // 未找到 index
        if (findIndex === -1) {
          return 'findIndex === -1' as const
        }
        // index 的值即为数组在此项前方的数量
        return findIndex
      })()
      // 未找到 TopCursor 对应的item，这是不正常的
      if (topRemainingNumber === 'findIndex === -1') {
        // eslint-disable-next-line quotes
        console.error("topRemainingNumber === 'findIndex === -1'")
        return
      }
      // 【break 1】判断剩余的 cRMLAR 是否足够 cRMLLMMINC ，够则退出循环
      if (
        topRemainingNumber >= chatRoomMessagesLimitLoadMoreMaxItemNumberConfig
      ) {
        break
      }
      // 【break 2】是否最后一页（没有下一页），是则退出循环
      if (chatRoomMessagesInfiniteTwowayQuery.hasNextPage.value === false) {
        break
      }
      // 请求下一页
      await chatRoomMessagesInfiniteTwowayQuery.fetchNextPage()
      // 【251110】解决发现的严重问题
      // 消息加载中时跳转至设置页再返回时可能导致问题，十分严重，会导致页面卡死。可能是因为组件卸载后导致加载更多请求逻辑无限循环导致的
      if (isUnmounted) {
        throw new Error('isUnmounted')
      }
      // 【251112】网络问题
      // console.log(
      //   'chatRoomMessagesInfiniteTwowayQuery.isError',
      //   chatRoomMessagesInfiniteTwowayQuery.isError.value
      // )
      if (chatRoomMessagesInfiniteTwowayQuery.isError.value === true) {
        potoMessage({
          type: 'error',
          message: i18nStore.t('chatMessageGetErrorText')(),
        })
        throw new Error(
          'chatRoomMessagesInfiniteTwowayQuery.isError.value === true'
        )
      }
    }
    // 计算限制游标
    // 当前TopCursor的index
    const indexTopCursorNow =
      // 获取当前index，因为上面找过，所以这里肯定是找到的（不可能等于-1）
      chatRoomMessagesListAndRealtime.value.findIndex(
        (i) => i.id === chatRoomMessagesLimitTopCursor.value
      )
    // 新的TopCursor的index
    const indexTopCursorNew = (() => {
      // 顶部增加 cRMLLMMINC 个消息
      const newIndex =
        indexTopCursorNow - chatRoomMessagesLimitLoadMoreMaxItemNumberConfig
      // 避免index不合法，一般是数组过短引起的 index < 0，返回 0 即可，意为数组从后往前不够 cRMLLMMINC 个则尽可能靠前的item
      if (
        newIndex < 0 ||
        newIndex > chatRoomMessagesListAndRealtime.value.length - 1
      ) {
        return 0
      }
      // index合法，返回
      return newIndex
    })()
    // 新的BottomCursor的index
    const indexBottomCursorNew = (() => {
      // 计算将增加的数量 indexTopCursorNow 的值大于 indexTopCursorNew
      const willAddItemNumber = indexTopCursorNow - indexTopCursorNew
      // 计算增加后的总数量
      const AddedArrayLength =
        chatRoomMessagesLimitList.value.length + willAddItemNumber
      // 判断是否超出，未超出，返回 'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      if (AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig) {
        return 'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      }
      // 超出，根据indexTopCursorNew计算indexBottomCursorNew，index肯定不会大于最大值，其实不必担心index不合法
      const newIndex =
        indexTopCursorNew + (chatRoomMessagesLimitShowItemMaxNumberConfig - 1)
      if (
        newIndex < 0 ||
        newIndex > chatRoomMessagesListAndRealtime.value.length - 1
      ) {
        return chatRoomMessagesListAndRealtime.value.length - 1
      }
      return newIndex
    })()

    // 获取游标值
    const valTopCursorNew =
      chatRoomMessagesListAndRealtime.value[indexTopCursorNew].id
    const valBottomCursorNew = (() => {
      // 未超出，则 chatRoomMessagesLimitBottomCursor 不用改，返回当前值即可
      if (
        indexBottomCursorNew ===
        'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      ) {
        return chatRoomMessagesLimitBottomCursor.value
      }
      // 超出，即根据刚刚得到indexBottomCursorNew获取
      return chatRoomMessagesListAndRealtime.value[indexBottomCursorNew].id
    })()

    // 调用回调函数 beforeLimitCursorUpdate
    beforeLimitCursorUpdate()

    // 为显示限制游标赋值
    chatRoomMessagesLimitTopCursor.value = valTopCursorNew
    chatRoomMessagesLimitBottomCursor.value = valBottomCursorNew

    // console.log(chatRoomMessagesLimitTopCursor.value)
    // console.log(chatRoomMessagesLimitBottomCursor.value)
    // console.log(chatRoomMessagesLimitList.value)
  }
  // 控制显示限制，让聊天底部加载更多
  const controlLimitToShowMoreOnBottom = async (data: {
    /**
     * 在显示限制游标被赋值的前一刻，会调用这个函数
     * 也就是显示内容改变的前一刻，主要用于 chatScrollCaptureSnapshotBeforeMessageChange 调用
     */
    beforeLimitCursorUpdate: () => void
  }) => {
    const { beforeLimitCursorUpdate } = data
    // chatRoomMessagesLimitTopCursor/BottomCursor 为 null，这是不正常的情况，返回
    if (
      chatRoomMessagesLimitTopCursor.value == null ||
      chatRoomMessagesLimitBottomCursor.value == null
    ) {
      return
    }
    // 没有消息数据，直接返回
    if (
      chatRoomMessagesListAndRealtime.value == null ||
      chatRoomMessagesListAndRealtime.value.length === 0
    ) {
      return
    }
    if (
      chatRoomMessagesLimitList.value == null ||
      chatRoomMessagesLimitList.value.length === 0
    ) {
      return
    }
    // 已显示最底部的数据，返回
    if (chatRoomMessagesLimitBottomCursor.value === 'no-limit') {
      return
    }

    while (true) {
      // 计算底部剩余的数量（cRMLAR）
      const bottomRemainingNumber = (() => {
        // 获取 index
        const findIndex = chatRoomMessagesListAndRealtime.value.findIndex(
          (i) => i.id === chatRoomMessagesLimitBottomCursor.value
        )
        // 未找到 index
        if (findIndex === -1) {
          return 'findIndex === -1' as const
        }
        // (length - 1) - findIndex 的值即为数组在此项后方的数量
        return chatRoomMessagesListAndRealtime.value.length - 1 - findIndex
      })()
      // TODO
      // 未找到 BottomCursor 对应的item，这是不正常的
      if (bottomRemainingNumber === 'findIndex === -1') {
        // eslint-disable-next-line quotes
        console.error("bottomRemainingNumber === 'findIndex === -1'")
        return
      }
      // 【break 1】判断剩余的 cRMLAR 是否足够 cRMLLMMINC ，够则退出循环
      if (
        bottomRemainingNumber >=
        chatRoomMessagesLimitLoadMoreMaxItemNumberConfig
      ) {
        break
      }
      // 【break 2】是否最后一页（没有下一页，底部 Previous），是则退出循环
      if (chatRoomMessagesInfiniteTwowayQuery.hasPreviousPage.value === false) {
        break
      }
      // 请求下一页，底部 Previous
      await chatRoomMessagesInfiniteTwowayQuery.fetchPreviousPage()
      // 【251110】解决发现的严重问题
      // 消息加载中时跳转至设置页再返回时可能导致问题，十分严重，会导致页面卡死。可能是因为组件卸载后导致加载更多请求逻辑无限循环导致的
      if (isUnmounted) {
        throw new Error('isUnmounted')
      }
      // 【251112】网络问题
      // console.log(
      //   'chatRoomMessagesInfiniteTwowayQuery.isError',
      //   chatRoomMessagesInfiniteTwowayQuery.isError.value
      // )
      if (chatRoomMessagesInfiniteTwowayQuery.isError.value === true) {
        potoMessage({
          type: 'error',
          message: i18nStore.t('chatMessageGetErrorText')(),
        })
        throw new Error(
          'chatRoomMessagesInfiniteTwowayQuery.isError.value === true'
        )
      }
    }
    // 计算限制游标
    // 当前BottomCursor的index
    const indexBottomCursorNow =
      // 获取当前index，因为上面找过，所以这里肯定是找到的（不可能等于-1）
      chatRoomMessagesListAndRealtime.value.findIndex(
        (i) => i.id === chatRoomMessagesLimitBottomCursor.value
      )
    // 新的BottomCursor的index
    const indexBottomCursorNew = (() => {
      // 底部增加 cRMLLMMINC 个消息
      const newIndex =
        indexBottomCursorNow + chatRoomMessagesLimitLoadMoreMaxItemNumberConfig
      // 避免index不合法，增加后可能会超出数组长度，返回最大的index即可，即代表数组最后一个元素
      if (
        newIndex < 0 ||
        newIndex > chatRoomMessagesListAndRealtime.value.length - 1
      ) {
        return chatRoomMessagesListAndRealtime.value.length - 1
      }
      // index合法，返回
      return newIndex
    })()
    // 新的TopCursor的index
    const indexTopCursorNew = (() => {
      // 计算将增加的数量 indexBottomCursorNew 的值大于 indexBottomCursorNow
      const willAddItemNumber = indexBottomCursorNew - indexBottomCursorNow
      // 计算增加后的总数量
      const AddedArrayLength =
        chatRoomMessagesLimitList.value.length + willAddItemNumber
      // 判断是否超出，未超出，返回 'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      if (AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig) {
        return 'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      }
      // 超出，根据indexBottomCursorNew计算indexTopCursorNew，index肯定不会小于0，其实不必担心index不合法
      const newIndex =
        indexBottomCursorNew -
        (chatRoomMessagesLimitShowItemMaxNumberConfig - 1)
      if (
        newIndex < 0 ||
        newIndex > chatRoomMessagesListAndRealtime.value.length - 1
      ) {
        return 0
      }
      return newIndex
    })()

    // 获取游标值
    const valTopCursorNew = (() => {
      // 未超出，则 chatRoomMessagesLimitTopCursor 不用改，返回当前值即可
      if (
        indexTopCursorNew ===
        'AddedArrayLength <= chatRoomMessagesLimitShowItemMaxNumberConfig'
      ) {
        return chatRoomMessagesLimitTopCursor.value
      }
      // 超出，即根据刚刚得到indexTopCursorNew获取
      return chatRoomMessagesListAndRealtime.value[indexTopCursorNew].id
    })()
    const valBottomCursorNew = (() => {
      // indexBottomCursorNew 为数组中最后一个，且底部已没有下一页，则返回 'no-limit' 即不必限制底部的显示
      if (
        indexBottomCursorNew ===
          chatRoomMessagesListAndRealtime.value.length - 1 &&
        chatRoomMessagesInfiniteTwowayQuery.hasPreviousPage.value === false
      ) {
        return 'no-limit' as const
      }
      // 正常，即根据刚刚得到indexBottomCursorNew获取
      return chatRoomMessagesListAndRealtime.value[indexBottomCursorNew]
        .id as string & {}
    })()

    // console.log(props.refScrollWarp?.scrollHeight)
    // console.log(props.refScrollWarp?.scrollTop)

    // 调用回调函数 beforeLimitCursorUpdate
    beforeLimitCursorUpdate()

    // 为显示限制游标赋值
    chatRoomMessagesLimitTopCursor.value = valTopCursorNew
    chatRoomMessagesLimitBottomCursor.value = (() => {
      if (valBottomCursorNew === 'no-limit') {
        return 'no-limit'
      }
      return valBottomCursorNew
    })()
  }

  /** 聊天顶部是否有未显示的 */
  const isChatTopHasMore = computed(() => {
    // chatRoomMessagesLimitTopCursor/BottomCursor 为 null，这是不正常的情况，返回
    if (
      chatRoomMessagesLimitTopCursor.value == null ||
      chatRoomMessagesLimitBottomCursor.value == null
    ) {
      return false
    }
    // 没有消息数据，直接返回
    if (
      chatRoomMessagesListAndRealtime.value == null ||
      chatRoomMessagesListAndRealtime.value.length === 0
    ) {
      return false
    }
    if (
      chatRoomMessagesLimitList.value == null ||
      chatRoomMessagesLimitList.value.length === 0
    ) {
      return false
    }
    // 已经显示最顶部的数据，返回
    if (
      chatRoomMessagesInfiniteTwowayQuery.hasNextPage.value === false &&
      chatRoomMessagesLimitList.value[0].id ===
        chatRoomMessagesListAndRealtime.value[0].id
    ) {
      return false
    }
    // chatRoomMessagesLimitTopCursor.value 为 'no-limit' 是特殊情况，不需要再加载更多，返回
    if (chatRoomMessagesLimitTopCursor.value === 'no-limit') {
      return false
    }
    return true
  })
  /** 聊天底部是否有未显示的 */
  const isChatBottomHasMore = computed(() => {
    // chatRoomMessagesLimitTopCursor/BottomCursor 为 null，这是不正常的情况，返回
    if (
      chatRoomMessagesLimitTopCursor.value == null ||
      chatRoomMessagesLimitBottomCursor.value == null
    ) {
      return false
    }
    // 没有消息数据，直接返回
    if (
      chatRoomMessagesListAndRealtime.value == null ||
      chatRoomMessagesListAndRealtime.value.length === 0
    ) {
      return false
    }
    if (
      chatRoomMessagesLimitList.value == null ||
      chatRoomMessagesLimitList.value.length === 0
    ) {
      return false
    }
    // 已显示最底部的数据，返回
    if (chatRoomMessagesLimitBottomCursor.value === 'no-limit') {
      return false
    }
    return true
  })

  /** 是否正在加载更多 */
  const isShowMoreRunning = ref(false)
  // 防止多次调用或 chatRoomMessagesInfiniteQuery.isFetching
  const preventShowMoreMultipleCalls = async (
    callback: () => Promise<void>
  ) => {
    // 防止多次调用或 chatRoomMessagesInfiniteQuery.isFetching
    if (chatRoomMessagesInfiniteTwowayQuery.isFetching.value === true) {
      return
    }
    if (isShowMoreRunning.value === true) {
      return
    }
    isShowMoreRunning.value = true

    try {
      // 等待几百毫秒
      await new Promise((resolve) =>
        setTimeout(resolve, chatRoomMessagesShowMoreBeforeDelayMsConfig)
      )

      await callback()

      // 等待几百毫秒
      await new Promise((resolve) =>
        setTimeout(resolve, chatRoomMessagesShowMoreAfterDelayMsConfig)
      )
    } finally {
      isShowMoreRunning.value = false
    }
  }

  /** 聊天顶部加载更多 */
  const chatShowMoreOnTop = async () => {
    await preventShowMoreMultipleCalls(async () => {
      // 处理聊天滚动（在消息变动前），将在下面的回调中被赋值
      let chatScrollCaptureSnapshot = null as ReturnType<
        typeof chatScrollCaptureSnapshotBeforeMessageChange
      > | null

      // 控制显示限制，让聊天顶部加载更多
      await controlLimitToShowMoreOnTop({
        // 在显示限制游标被赋值的前一刻，会调用这个函数 也就是显示内容改变的前一刻
        beforeLimitCursorUpdate: () => {
          chatScrollCaptureSnapshot =
            chatScrollCaptureSnapshotBeforeMessageChange()
        },
      })

      if (chatScrollCaptureSnapshot == null) {
        return
      }
      // 处理聊天滚动（在消息变动后）
      await chatScrollAdjustPositionAfterMessageChange(
        chatScrollCaptureSnapshot
      )
    })
  }

  /** 聊天底部加载更多 */
  const chatShowMoreOnBottom = async () => {
    await preventShowMoreMultipleCalls(async () => {
      // 处理聊天滚动（在消息变动前），将在下面的回调中被赋值
      let chatScrollCaptureSnapshot = null as ReturnType<
        typeof chatScrollCaptureSnapshotBeforeMessageChange
      > | null

      // 控制显示限制，让聊天顶部加载更多
      await controlLimitToShowMoreOnBottom({
        // 在显示限制游标被赋值的前一刻，会调用这个函数 也就是显示内容改变的前一刻
        beforeLimitCursorUpdate: () => {
          chatScrollCaptureSnapshot =
            chatScrollCaptureSnapshotBeforeMessageChange()
        },
      })

      if (chatScrollCaptureSnapshot == null) {
        return
      }
      // 处理聊天滚动（在消息变动后）
      await chatScrollAdjustPositionAfterMessageChange(
        chatScrollCaptureSnapshot
      )
    })
  }

  return {
    chatShowMoreOnTop,
    chatShowMoreOnBottom,
    isShowMoreRunning,
    isChatTopHasMore,
    isChatBottomHasMore,
  }
}
