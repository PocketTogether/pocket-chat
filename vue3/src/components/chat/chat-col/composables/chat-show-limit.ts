import { watchUntilQueryReady, watchUntilSourceCondition } from '@/utils'
import type {
  ChatColPageRecoverDataCheckType,
  ChatDisplayDependentDataInitializationChooseType,
  ChatRoomMessagesInfiniteTwowayQueryType,
  ChatRoomMessagesListAndRealtimeType,
  TwowayPositioningCursorDataType,
} from './dependencies'
import {
  chatRoomMessagesLimitInitShowItemNumberConfig,
  chatRoomMessagesLimitShowItemMaxNumberConfig,
} from '@/config'

/**
 * 限制消息显示数量，顶部游标与底部游标 的类型
 * null 为初始值，将会被初始化，如果为null就不显示所有消息
 * 'no-limit' 为不限制
 */
export type ChatRoomMessagesLimitCursorValType =
  | 'no-limit'
  | (string & {})
  | null

/** 封装了聊天页消息显示数量限制控制相关的内容 双向 */
export const useChatShowLimitControlTwoway = (data: {
  // 所有消息数据
  chatRoomMessagesListAndRealtime: ChatRoomMessagesListAndRealtimeType
  // 双向定位无限查询的定位游标数据，在限制游标的初始化时会使用，
  // 用于判断消息查询时从最新的开始 twowayPositioningCursorData === null
  // 或是游标定位双向查询 id created
  twowayPositioningCursorData: TwowayPositioningCursorDataType
  // 数据查询相关信息，用与判断底部（）是否有下一页
  chatRoomMessagesInfiniteTwowayQuery: ChatRoomMessagesInfiniteTwowayQueryType
  // 各种初始化情况的对应数据，决定使用哪种初始化
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  // “页面恢复数据”是否正确
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
}) => {
  const {
    //
    chatRoomMessagesListAndRealtime,
    twowayPositioningCursorData,
    chatRoomMessagesInfiniteTwowayQuery,
    chatDisplayDependentDataInitializationChoose,
    chatColPageRecoverDataCheck,
  } = data
  const { chooseInitialization, chatColPageRecoverData } =
    chatDisplayDependentDataInitializationChoose

  // 限制消息显示数量，顶部游标与底部游标
  // null 为初始值，将会被初始化，如果为null就不显示所有消息
  // 'no-limit' 为不限制
  const chatRoomMessagesLimitTopCursor =
    ref<ChatRoomMessagesLimitCursorValType>(null)
  const chatRoomMessagesLimitBottomCursor =
    ref<ChatRoomMessagesLimitCursorValType>(null)

  // 已限制数量的消息列表
  const chatRoomMessagesLimitList = computed(() => {
    // chatRoomMessagesListAndRealtime 没有值，返回null
    if (chatRoomMessagesListAndRealtime.value == null) {
      return null
    }
    // 任意一个为默认值，即限制数量功能还未初始化，返回null
    if (
      chatRoomMessagesLimitTopCursor.value == null ||
      chatRoomMessagesLimitBottomCursor.value == null
    ) {
      return null
    }

    // 找到两个Cursor所对应的序列值
    const indexTopCursor = (() => {
      // defaultIndex = 0 即第一个
      const defaultIndex = 0
      // TopCursor = 'no-limit' 则默认为最后一个
      if (chatRoomMessagesLimitTopCursor.value === 'no-limit') {
        return defaultIndex
      }
      const findIndex = chatRoomMessagesListAndRealtime.value.findIndex(
        (i) => i.id === chatRoomMessagesLimitTopCursor.value
      )
      // 未找到则默认为第一个
      if (findIndex === -1) {
        return defaultIndex
      }
      return findIndex
    })()
    const indexBottomCursor = (() => {
      // defaultIndex = Array.length - 1 即最后一个
      const defaultIndex = chatRoomMessagesListAndRealtime.value.length - 1
      // BottomCursor = 'no-limit' 则默认为最后一个
      if (chatRoomMessagesLimitBottomCursor.value === 'no-limit') {
        return defaultIndex
      }
      const findIndex = chatRoomMessagesListAndRealtime.value.findIndex(
        (i) => i.id === chatRoomMessagesLimitBottomCursor.value
      )
      // 未找到则默认为最后一个
      if (findIndex === -1) {
        return defaultIndex
      }
      return findIndex
    })()

    // 包含indexBottomCursor所指的
    const limitList = chatRoomMessagesListAndRealtime.value.slice(
      indexTopCursor,
      indexBottomCursor + 1
    )
    return limitList
  })

  // 显示限制游标初始化函数
  const chatRoomMessagesLimitCursorInitFn = async () => {
    if (chatRoomMessagesListAndRealtime.value == null) {
      // 等待存在消息数据
      await watchUntilSourceCondition(
        chatRoomMessagesListAndRealtime,
        (val) => val != null
      )
    }
    // 此时仍不存在消息数据是异常的，直接返回
    // watchUntilSourceCondition 并不能约束类型
    // 主要目的是让下文的 chatRoomMessagesListAndRealtime 类型正确
    if (chatRoomMessagesListAndRealtime.value == null) {
      console.error('chatRoomMessagesListAndRealtime.value == null')
      return
    }
    // 消息为空数组，将限制游标初始化为 'no-limit' 并返回
    if (chatRoomMessagesListAndRealtime.value.length === 0) {
      chatRoomMessagesLimitTopCursor.value = 'no-limit'
      chatRoomMessagesLimitBottomCursor.value = 'no-limit'
      return
    }

    // 【双向】
    // twowayPositioningCursorData.value == null
    // 双向定位游标为 null，即其为从最新的消息开始查询（和单向一样），初始化限制游标，使其从最底部开始显示，显示个个数为 cRMLISINC
    if (twowayPositioningCursorData.value == null) {
      // chatRoomMessagesLimitInitShowItemNumberConfig 简称为 cRMLISINC
      // 从后往前限制 cRMLISINC 个，也就是找到从后往前第 cRMLISINC 个的item
      const indexTopCursor = (() => {
        // length - cRMLISINC 即从后往前第 cRMLISINC 个的item
        const index =
          chatRoomMessagesListAndRealtime.value.length -
          chatRoomMessagesLimitInitShowItemNumberConfig
        // 避免index不合法，一般是数组过短引起的 index < 0，返回 0 即可，意为数组从后往前不够 cRMLISINC 个则尽可能靠前的item
        if (
          index < 0 ||
          index > chatRoomMessagesListAndRealtime.value.length - 1
        ) {
          return 0
        }
        return index
      })()

      // 为用于显示数量限制的游标赋值
      chatRoomMessagesLimitTopCursor.value =
        chatRoomMessagesListAndRealtime.value[indexTopCursor].id
      chatRoomMessagesLimitBottomCursor.value = 'no-limit'
    }
    // twowayPositioningCursorData.value != null
    // 双向定位游标有值，即其为正常的双向定位查询，初始化限制游标，使其显示当前游标范围内的数据，根据初始显示的消息数量
    else {
      // 找到双向定位游标所对应的索引
      const twowayPositioningCursorDataId = twowayPositioningCursorData.value.id
      const twowayPositioningCursorIndex = (() => {
        const index = chatRoomMessagesListAndRealtime.value.findIndex(
          (i) => i.id === twowayPositioningCursorDataId
        )
        // 未找到，这是异常情况，暂时返回0
        if (index === -1) {
          console.error('index === -1')
          return 0
        }
        return index
      })()

      // 计算新的顶部限制游标对应的索引
      const newLimitTopCursorIndex = (() => {
        // 将双向定位游标对应索引 减 一半的 chatRoomMessagesLimitInitShowItemNumberConfig 初始显示的消息数量
        const index =
          twowayPositioningCursorIndex -
          (Math.abs(
            Math.round(chatRoomMessagesLimitInitShowItemNumberConfig / 2)
          ) -
            1)
        // index < 0 即超出，返回0
        if (index < 0) {
          return 0
        }
        return index
      })()
      // 计算新的底部限制游标对应的索引
      const newLimitBottomCursorIndex = (() => {
        // 将新的顶部限制游标对应的索引 加 chatRoomMessagesLimitInitShowItemNumberConfig 初始显示的消息数量
        const index =
          newLimitTopCursorIndex + chatRoomMessagesLimitInitShowItemNumberConfig
        // index > length - 1 即超出，返回 length - 1
        if (index > chatRoomMessagesListAndRealtime.value.length - 1) {
          return chatRoomMessagesListAndRealtime.value.length - 1
        }
        return index
      })()

      // 为用于显示数量限制的游标赋值
      chatRoomMessagesLimitTopCursor.value =
        chatRoomMessagesListAndRealtime.value[newLimitTopCursorIndex].id
      chatRoomMessagesLimitBottomCursor.value = (() => {
        // 如果newLimitBottomCursorIndex为最后一个，且底部已没有下一页，则返回 'no-limit'
        if (
          newLimitBottomCursorIndex ===
            chatRoomMessagesListAndRealtime.value.length - 1 &&
          chatRoomMessagesInfiniteTwowayQuery.hasPreviousPage.value === false
        ) {
          return 'no-limit'
        }
        // console.log('newLimitBottomCursorIndex', newLimitBottomCursorIndex)
        // 正常情况
        return chatRoomMessagesListAndRealtime.value[newLimitBottomCursorIndex]
          .id
      })()
    }
  }

  // 初始化显示限制，setup时就可以进行
  // 根据“页面恢复数据”初始化
  if (
    chooseInitialization === 'chatColPageRecoverData' &&
    chatColPageRecoverData != null &&
    // 判断 “页面恢复数据” 是否正确，正确才进行此方式的初始化
    chatColPageRecoverDataCheck === true
  ) {
    chatRoomMessagesLimitTopCursor.value =
      chatColPageRecoverData.data.chatRoomMessagesLimitTopCursor
    chatRoomMessagesLimitBottomCursor.value =
      chatColPageRecoverData.data.chatRoomMessagesLimitBottomCursor
  }
  // 正常的初始化
  else {
    ;(async () => {
      // 执行初始化显示限制函数前，先等待query
      await watchUntilQueryReady(chatRoomMessagesInfiniteTwowayQuery).catch(
        () => {}
      )
      // 【251112】网络问题
      // console.log(
      //   'chatRoomMessagesInfiniteTwowayQuery.isError',
      //   chatRoomMessagesInfiniteTwowayQuery.isError.value
      // )
      if (chatRoomMessagesInfiniteTwowayQuery.isError.value === true) {
        // 这里不需要错误提示
        // potoMessage({
        //   type: 'error',
        //   message: i18nStore.t('chatMessageGetErrorText')(),
        // })
        throw new Error(
          'chatRoomMessagesInfiniteTwowayQuery.isError.value === true'
        )
      }

      await chatRoomMessagesLimitCursorInitFn()
    })()
  }

  return {
    chatRoomMessagesLimitTopCursor,
    chatRoomMessagesLimitBottomCursor,
    chatRoomMessagesLimitList,
    chatRoomMessagesLimitCursorInitFn,
  }
}
