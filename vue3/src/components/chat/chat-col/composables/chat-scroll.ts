import {
  compareDatesSafeWithNull,
  scrollToElementInContainer,
  watchUntilQueryReady,
  watchUntilSourceCondition,
} from '@/utils'
import type {
  ChatColPageRecoverDataCheckType,
  ChatDisplayDependentDataInitializationChooseType,
  ChatRoomMessagesForShowType,
  ChatRoomMessagesInfiniteTwowayQueryType,
  ChatRoomMessagesLimitBottomCursorType,
  ChatRoomMessagesRealtimeType,
  PropsType,
  TwowayPositioningCursorDataType,
} from './dependencies'
import {
  chatRoomMessagesClassIdNamingFnConfig,
  chatRoomMessagesScrollCaptureElementNumberConfig,
  chatRoomMessagesScrollRealtimeIsBottomDistanceConfig,
  chatRoomMessagesTwowayPositioningCursorScrollTopOffsetConfig,
} from '@/config'
import { useScroll } from '@vueuse/core'

/** 封装了聊天页消息变动时的滚动处理 双向 */
export const useChatScrollMessageChangeTwoway = (data: {
  chatRoomMessagesForShow: ChatRoomMessagesForShowType
  chatRoomMessagesRealtime: ChatRoomMessagesRealtimeType
  props: PropsType
  chatRoomMessagesLimitBottomCursor: ChatRoomMessagesLimitBottomCursorType
  twowayPositioningCursorData: TwowayPositioningCursorDataType
  // 各种初始化情况的对应数据，决定使用哪种初始化
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  // “页面恢复数据”是否正确
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
  // // 【251112】处理网络问题
  chatRoomMessagesInfiniteTwowayQuery: ChatRoomMessagesInfiniteTwowayQueryType
}) => {
  const {
    props,
    chatRoomMessagesForShow,
    chatRoomMessagesRealtime,
    chatRoomMessagesLimitBottomCursor,
    twowayPositioningCursorData,
    chatDisplayDependentDataInitializationChoose,
    chatColPageRecoverDataCheck,
    chatRoomMessagesInfiniteTwowayQuery,
  } = data
  const { chooseInitialization, chatColPageRecoverData } =
    chatDisplayDependentDataInitializationChoose

  // 聊天滚动初始化函数（正常）
  // 当前为从最新的消息开始查询的，则滚动到底部
  // 当前为双向定位查询的，则滚动至定位的消息
  const chatRoomMessagesScrollInitFn = async () => {
    // 等待存在消息数据
    await watchUntilSourceCondition(
      chatRoomMessagesForShow,
      (val) => val != null
    )
    // 等待渲染
    await nextTick()

    // 【双向】
    // twowayPositioningCursorData.value == null
    // 双向定位游标为 null，即其为从最新的消息开始查询（和单向一样）
    // 滚动到底部
    if (twowayPositioningCursorData.value == null) {
      props.refScrollWarp?.scrollTo({
        top: props.refScrollWarp.scrollHeight,
        // behavior: 'smooth', // 平滑滚动
        behavior: 'instant', // 立即滚动
      })
    }
    // twowayPositioningCursorData.value != null
    // 双向定位游标有值，即其为正常的双向定位查询
    // 滚动到定位的消息
    else {
      const cursorElement = document.querySelector<HTMLElement>(
        `.${chatRoomMessagesClassIdNamingFnConfig(twowayPositioningCursorData.value.id)}`
      )
      // 未找到定位的消息元素 cursorElement 是异常的，滚动容器 props.refScrollWarp 没有值也是异常的
      if (cursorElement == null || props.refScrollWarp == null) {
        console.error('cursorElement == null')
        return
      }
      // 滚动到指定元素，立即滚动
      scrollToElementInContainer(
        props.refScrollWarp,
        cursorElement,
        'instant',
        chatRoomMessagesTwowayPositioningCursorScrollTopOffsetConfig
      )
    }
  }

  // 初始化时据情况处理滚动
  onMounted(async () => {
    // 根据“页面恢复数据”初始化
    if (
      chooseInitialization === 'chatColPageRecoverData' &&
      chatColPageRecoverData != null &&
      // 判断 “页面恢复数据” 是否正确，正确才进行此方式的初始化
      chatColPageRecoverDataCheck === true
    ) {
      // 等待渲染
      await nextTick()
      props.refScrollWarp?.scrollTo({
        top: chatColPageRecoverData.data.refScrollWarpScrollTop,
        // behavior: 'smooth', // 平滑滚动
        behavior: 'instant', // 立即滚动
      })
    }
    // 正常的初始化
    else {
      // 执行初始化滚动函数前，先等待query
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
      await chatRoomMessagesScrollInitFn()
    }
  })

  // 新增实时消息时，如果当前底部显示限制为 no-limit 即显示至底部的所有消息，且贴近底部，则滚到底部（平滑）
  watch(
    () => chatRoomMessagesRealtime.value.map((i) => i.id).toString(),
    async () => {
      if (props.refScrollWarp == null) {
        return
      }

      // 当前底部显示限制不为 no-limit，直接返回
      if (chatRoomMessagesLimitBottomCursor.value !== 'no-limit') {
        return
      }

      // 距底部的距离
      const distanceFromBottom =
        props.refScrollWarp.scrollHeight -
        props.refScrollWarp.clientHeight -
        props.refScrollWarp.scrollTop
      if (
        distanceFromBottom >
        chatRoomMessagesScrollRealtimeIsBottomDistanceConfig
      ) {
        // 大于10px，则算不贴近底部，直接返回
        return
      }

      // 等待渲染
      await nextTick()

      // 滚动到底部
      props.refScrollWarp.scrollTo({
        top: props.refScrollWarp.scrollHeight,
        behavior: 'smooth', // 平滑滚动
      })
    }
  )

  /**
   * 处理聊天滚动（在消息变动前）
   * 收集滚动前的快照数据，用于后续滚动补偿计算。
   * 与 chatScrollAdjustPositionAfterMessageChange 结合使用
   * 【250901】最好在消息变动的最近的前一刻使用此函数收集信息，不然scrollSnapshot可能随用户滚动而不正确
   */
  const chatScrollCaptureSnapshotBeforeMessageChange = () => {
    // 消息数据快照
    const messageListSnapshot = (() => {
      if (chatRoomMessagesForShow.value == null) {
        return null
      }
      return [...chatRoomMessagesForShow.value]
    })()

    // 消息元素高度信息
    const messageElementMetrics = (() => {
      if (chatRoomMessagesForShow.value == null) return null

      // 只收集前几十条消息的 DOM 元素高度（具体数量根据配置控制）
      const selector = chatRoomMessagesForShow.value
        .slice(0, chatRoomMessagesScrollCaptureElementNumberConfig)
        .map((msg) => `.${chatRoomMessagesClassIdNamingFnConfig(msg.id)}`)
        .join(', ')

      const elements = document.querySelectorAll<HTMLElement>(selector)
      const metrics: { id: string; offsetHeight: number }[] = []

      elements.forEach((el) => {
        const id = el.getAttribute('data-message-id') ?? ''
        const offsetHeight = el.offsetHeight
        metrics.push({ id, offsetHeight })
      })

      return metrics
    })()

    // // 当前滚动内容高度
    // const scrollHeightSnapshot = props.refScrollWarp?.scrollHeight ?? null
    // 当前滚动信息
    const scrollSnapshot = (() => {
      if (props.refScrollWarp == null) {
        return null
      }
      return {
        scrollHeight: props.refScrollWarp.scrollHeight,
        scrollTop: props.refScrollWarp.scrollTop,
      }
    })()

    return {
      messageListSnapshot,
      messageElementMetrics,
      scrollSnapshot,
    }
  }

  /**
   * 处理聊天滚动（在消息变动后）
   * 根据快照数据计算顶部新增消息的高度，并补偿滚动位置。
   * 与 chatScrollCaptureSnapshotBeforeMessageChange 结合使用
   */
  const chatScrollAdjustPositionAfterMessageChange = async (
    previousSnapshot: ReturnType<
      typeof chatScrollCaptureSnapshotBeforeMessageChange
    >
  ) => {
    const { messageListSnapshot, messageElementMetrics, scrollSnapshot } =
      previousSnapshot
    // 所需数据没有值，直接返回
    if (
      chatRoomMessagesForShow.value == null ||
      messageListSnapshot == null ||
      messageElementMetrics == null ||
      chatRoomMessagesForShow.value.length === 0 ||
      messageListSnapshot.length === 0 ||
      props.refScrollWarp == null
    ) {
      console.error(
        `
        chatRoomMessagesForShow.value == null ||
        messageListSnapshot == null ||
        chatRoomMessagesForShow.value.length === 0 ||
        messageListSnapshot.length === 0
          `
      )
      return
    }
    // console.log(props.refScrollWarp.scrollHeight)
    // console.log(props.refScrollWarp.scrollTop)
    /**
     * 判断消息数组顶部为增加还是减少（只有顶部的增减会影响滚动）
     * ```
     * 1 为增加
     * -1 为减少
     * 0 为不变
     * 存在无效值则返回null
     *
     * ```
     * 原理为，比较数组中第一个item的created，如果当前的更早（更小）则为增加
     */
    const isListTopAddOrReduce = compareDatesSafeWithNull(
      messageListSnapshot[0].created,
      chatRoomMessagesForShow.value[0].created
    )
    // 存在无效值，返回
    if (isListTopAddOrReduce == null) {
      console.error('isListTopAddOrReduce == null')
      return
    }
    // 消息数组顶部不变，无需处理滚动，返回
    if (isListTopAddOrReduce === 0) {
      console.error('isListTopAddOrReduce === 0')
      return
    }
    // console.log('isListTopAddOrReduce', isListTopAddOrReduce)
    // 统计消息数据的变化
    const listTopDelta = (() => {
      if (isListTopAddOrReduce === 1) {
        // 消息数组顶部增加，统计增加的item.id
        // 储存变化的消息
        const itemDeltaList: typeof chatRoomMessagesForShow.value = []
        for (const item of chatRoomMessagesForShow.value) {
          // 消息id等于旧的数组中的第一个，即代表增加的消息已收集完毕
          if (item.id === messageListSnapshot[0].id) {
            break
          }
          // 收集变化的消息
          itemDeltaList.push(item)
        }
        return itemDeltaList
      } else {
        // isListTopAddOrReduce === -1
        // 消息数组顶部减少，统计减少的item.id
        // 储存变化的消息
        const itemDeltaList: typeof chatRoomMessagesForShow.value = []
        for (const item of messageListSnapshot) {
          // 消息id等于新的数组中的第一个，即代表减少的消息已收集完毕
          if (item.id === chatRoomMessagesForShow.value[0].id) {
            break
          }
          // 收集变化的消息
          itemDeltaList.push(item)
        }
        return itemDeltaList
      }
    })()

    // // 缓存一下 scrollTop 值，让之后的计算更精准
    // const cacheScrollTopVal = props.refScrollWarp.scrollTop
    // console.log(props.refScrollWarp.scrollHeight)
    // console.log(props.refScrollWarp.scrollTop)

    await nextTick() // 等待 DOM 更新

    // console.log(props.refScrollWarp.scrollHeight)
    // console.log(props.refScrollWarp.scrollTop)

    // 计算高度变化，将用于调整滚动
    const heightDeltaForScroll = (() => {
      if (isListTopAddOrReduce === 1) {
        // 消息数组顶部增加，统计增加的高度
        // dom查询消息元素
        const selector = listTopDelta
          .map((msg) => `.${chatRoomMessagesClassIdNamingFnConfig(msg.id)}`)
          .join(', ')
        const elements = document.querySelectorAll<HTMLElement>(selector)
        // 统计高度
        let height = 0
        elements.forEach((el) => (height += el.offsetHeight))
        return height
      } else {
        // isListTopAddOrReduce === -1
        // 消息数组顶部减少，统计减少的高度
        // 在 messageElementMetrics 找出对应的消息
        const elements = messageElementMetrics.filter(
          (elItem) =>
            listTopDelta.find((msgItem) => msgItem.id === elItem.id) != null
        )
        // console.log(elements)
        // 统计高度
        let height = 0
        elements.forEach((el) => {
          height += el.offsetHeight
        })
        return -height
      }
    })()

    // 正确的 ScrollTop 的值
    const correctScrollTopVal = (() => {
      // 优先使用 scrollSnapshot
      if (scrollSnapshot != null) {
        return scrollSnapshot.scrollTop
      }
      // 否则使用 props.refScrollWarp.scrollTop
      return props.refScrollWarp.scrollTop
    })()

    // 滚动补偿：将滚动设置为 scrollTop与变化的高度的和
    props.refScrollWarp.scrollTo({
      top: correctScrollTopVal + heightDeltaForScroll,
      // behavior: 'smooth', // 平滑滚动不适用与此
      behavior: 'instant', // 立即滚动
    })
  }
  return {
    chatScrollCaptureSnapshotBeforeMessageChange,
    chatScrollAdjustPositionAfterMessageChange,
    chatRoomMessagesScrollInitFn,
  }
}
