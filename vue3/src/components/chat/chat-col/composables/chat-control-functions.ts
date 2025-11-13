import { useQueryClient } from '@tanstack/vue-query'
import type {
  ChatRoomMessagesInfiniteTwowayQueryType,
  PropsType,
  RefChatColTemplateBaseType,
  TwowayPositioningCursorDataType,
} from './dependencies'
import type { PMLRCApiParameters0DataPageParamNonNullable } from '@/api'
import {
  chatRoomMessagesClassIdNamingFnConfig,
  chatRoomMessagesScrollBottomGtThisValueCanBackTopConfig,
  chatRoomMessagesTwowayPositioningCursorScrollTopOffsetConfig,
} from '@/config'
import {
  isElementInViewport,
  potoMessage,
  scrollToElementInContainer,
  watchUntilQueryReady,
} from '@/utils'
import { useResizeObserver, useScroll } from '@vueuse/core'
import { useElementScrollMetrics } from '@/composables'
import { useI18nStore } from '@/stores'

/**
 * 封装 chat的一些操作
 */
export const useChatControlFunctions = (data: {
  //
  chatRoomMessagesInfiniteTwowayQuery: ChatRoomMessagesInfiniteTwowayQueryType
  resetPositioningCursorDataAndRelatedData: () => void
  chatRoomMessagesLimitCursorInitFn: () => Promise<void>
  chatRoomMessagesScrollInitFn: () => Promise<void>
  props: PropsType
  whetherToSetChatFinelyControlledQueryDataToNull: Ref<boolean>
  twowayPositioningCursorData: TwowayPositioningCursorDataType
  replyPositioningFlagOpen: (messageId: string) => void
  isChatBottomHasMore: ComputedRef<boolean>
  refScrollView: Ref<HTMLElement | null>
  refChatColTemplateBase: RefChatColTemplateBaseType
}) => {
  const {
    //
    chatRoomMessagesInfiniteTwowayQuery,
    resetPositioningCursorDataAndRelatedData,
    chatRoomMessagesLimitCursorInitFn,
    chatRoomMessagesScrollInitFn,
    props,
    whetherToSetChatFinelyControlledQueryDataToNull,
    twowayPositioningCursorData,
    replyPositioningFlagOpen,
    isChatBottomHasMore,
    refScrollView,
    refChatColTemplateBase,
  } = data

  const i18nStore = useI18nStore()

  const queryClient = useQueryClient()

  /** 聊天刷新（重置）是否正在进行 */
  const chatRoomMessagesRestartFnRunning = ref(false)
  /** 聊天刷新（重置）是否能执行 */
  const chatRoomMessagesRestartFnRunnable = computed(() => {
    if (chatRoomMessagesRestartFnRunning.value === true) {
      return false
    }
    return true
  })
  /** 聊天刷新（重置） */
  const chatRoomMessagesRestartFn = async () => {
    if (chatRoomMessagesRestartFnRunning.value === true) {
      return
    }
    chatRoomMessagesRestartFnRunning.value = true
    try {
      const { queryKey } = chatRoomMessagesInfiniteTwowayQuery
      // 移除本房间聊天数据
      queryClient.removeQueries({
        // chatRoomMessagesInfiniteTwowayQuery.queryKey.value 是只读的固定长度元组类型，通过索引访问是安全的
        queryKey: [queryKey.value[0], queryKey.value[1]],
        exact: false, // 模糊匹配，即不需要CursorData游标数据，移除本房间的所有数据
      })
      // 重置双向定位无限查询的定位游标数据和相关数据
      resetPositioningCursorDataAndRelatedData()
      // 重新加载数据
      await chatRoomMessagesInfiniteTwowayQuery.refetch()
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
      // 重新初始化显示限制游标
      await chatRoomMessagesLimitCursorInitFn()
      // 重新初始化滚动位置
      await chatRoomMessagesScrollInitFn()

      refChatColTemplateBase.value?.refChatInputBar?.chatMessageIsRealtimeTimeoutSet(
        false
      )
    } finally {
      chatRoomMessagesRestartFnRunning.value = false
    }
  }

  /** 聊天回复定位 */
  const chatRoomMessagesReplyPositioningFn = async (
    // 回复定位数据
    replyMessagePositioningData: PMLRCApiParameters0DataPageParamNonNullable,
    // 是否开启回复定位标记，在聊天消息中点击回复的消息时需要，而在输入栏中点击回复的消息时不需要
    couldReplyPositioningFlagOpen: boolean = true
  ) => {
    // 【操作1】使消息在屏幕显示
    // 从dom获取指定的元素
    const replyMessageElement = document.querySelector<HTMLElement>(
      `.${chatRoomMessagesClassIdNamingFnConfig(replyMessagePositioningData.id)}`
    )
    // 判断是否已在dom 是
    if (replyMessageElement != null) {
      // 判断是否已在屏幕范围 是
      if (
        isElementInViewport(replyMessageElement, {
          fullyVisible: true,
          offset: {
            // 元素距顶部距离要大于配置的值
            top: Math.abs(
              chatRoomMessagesTwowayPositioningCursorScrollTopOffsetConfig
            ),
          },
        })
      ) {
        // 无需处理
      }
      // 判断是否已在屏幕范围 否
      else {
        // 滚动容器 props.refScrollWarp 没有值是异常的
        if (props.refScrollWarp == null) {
          console.error('props.refScrollWarp == null')
          return
        }
        // 滚动至消息
        scrollToElementInContainer(
          props.refScrollWarp,
          replyMessageElement,
          'smooth',
          chatRoomMessagesTwowayPositioningCursorScrollTopOffsetConfig
        )
      }
    }
    // 判断是否已在dom 否
    else {
      // 新的定位查询
      // 将进入加载状态，精细化控制Query数据为null，持续300ms，即加载状态至少为300ms
      ;(async () => {
        whetherToSetChatFinelyControlledQueryDataToNull.value = true
        await new Promise((resolve) => setTimeout(resolve, 300))
        // // 避免出现问题，控制滚动归位（el滚动条不需要，原生滚动条需要）
        // props.refScrollWarp?.scrollTo({
        //   top: 0,
        //   // behavior: 'smooth', // 平滑滚动
        //   behavior: 'instant', // 立即滚动
        // })
        // await new Promise((resolve) => setTimeout(resolve, 100))
        whetherToSetChatFinelyControlledQueryDataToNull.value = false
      })()

      // 重置双向定位无限查询的定位游标数据和相关数据
      resetPositioningCursorDataAndRelatedData()
      // 修改双向定位游标数据
      twowayPositioningCursorData.value = {
        id: replyMessagePositioningData.id,
        created: replyMessagePositioningData.created,
      }
      // 已解决回复跳转不稳定的问题，原因出在Query.refetch，其导致已缓存的数据出现异常，这里不应该也不必调用refetch
      // await chatRoomMessagesInfiniteTwowayQuery.refetch()

      await nextTick()
      await watchUntilQueryReady(chatRoomMessagesInfiniteTwowayQuery).catch(
        () => {}
      )
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

      // 重新初始化显示限制游标
      await chatRoomMessagesLimitCursorInitFn()
      // 重新初始化滚动位置
      await chatRoomMessagesScrollInitFn()
    }

    // 【操作2】赋值回复标志数据
    if (couldReplyPositioningFlagOpen) {
      replyPositioningFlagOpen(replyMessagePositioningData.id)
    }
  }

  const messagesWarpScroll = useScroll(computed(() => props.refScrollWarp))
  const messagesWarpElementScrollMetrics = useElementScrollMetrics(
    computed(() => props.refScrollWarp),
    computed(() => refScrollView.value)
  )
  /** 是否显示回到底部 */
  const chatBackBottomDisplayable = computed(() => {
    // 底部仍有未显示消息，返回true
    if (isChatBottomHasMore.value) {
      return true
    }
    // 计算距底部距离scrollBottom
    const scrollHeight = messagesWarpElementScrollMetrics.scrollHeight.value
    const clientHeight = messagesWarpElementScrollMetrics.clientHeight.value
    const scrollTop = messagesWarpScroll.y.value
    const scrollBottom = scrollHeight - clientHeight - scrollTop
    // 距底部距离大于大于一定值，返回true
    if (
      scrollBottom > chatRoomMessagesScrollBottomGtThisValueCanBackTopConfig
    ) {
      return true
    }
    return false
  })
  /** 聊天刷新（重置）是否正在进行 */
  const chatBackBottomFnRunning = ref(false)
  /** 回到底部 */
  const chatBackBottomFn = async () => {
    if (chatRoomMessagesRestartFnRunning.value === true) {
      return
    }
    chatRoomMessagesRestartFnRunning.value = true
    try {
      // 情况1：已显示底部所有消息，滚动至底部即可
      if (isChatBottomHasMore.value === false) {
        props.refScrollWarp?.scrollTo({
          top: props.refScrollWarp.scrollHeight,
          behavior: 'smooth', // 平滑滚动
          // behavior: 'instant', // 立即滚动
        })
      }
      // 情况2：未显示底部所有消息，按类似重置聊天的操作
      else {
        // 将进入加载状态，精细化控制Query数据为null，持续300ms，即加载状态至少为300ms
        ;(async () => {
          whetherToSetChatFinelyControlledQueryDataToNull.value = true
          await new Promise((resolve) => setTimeout(resolve, 300))
          whetherToSetChatFinelyControlledQueryDataToNull.value = false
        })()
        // 重置双向定位无限查询的定位游标数据
        twowayPositioningCursorData.value = null

        await nextTick()
        await watchUntilQueryReady(chatRoomMessagesInfiniteTwowayQuery).catch(
          () => {}
        )
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

        // 重新初始化显示限制游标
        await chatRoomMessagesLimitCursorInitFn()
        // 重新初始化滚动位置
        await chatRoomMessagesScrollInitFn()
      }
    } finally {
      chatRoomMessagesRestartFnRunning.value = false
    }
  }

  return {
    chatRoomMessagesRestartFnRunning,
    chatRoomMessagesRestartFnRunnable,
    chatRoomMessagesRestartFn,
    chatRoomMessagesReplyPositioningFn,
    chatBackBottomDisplayable,
    chatBackBottomFnRunning,
    chatBackBottomFn,
  }
}
