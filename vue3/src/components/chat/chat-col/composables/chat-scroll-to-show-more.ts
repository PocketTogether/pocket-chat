import { useScroll } from '@vueuse/core'
import type { PropsType } from './dependencies'
import {
  chatRoomMessagesShowMoreBottomThresholdConfig,
  chatRoomMessagesShowMoreTopThresholdConfig,
  chatRoomMessagesShowMoreWatchScrollIntervalMsConfig,
} from '@/config'

/** 封装了聊天页滚动触发在顶部或底部显示更多的功能 */
export const useChatScrollToShowMore = (data: {
  //
  props: PropsType
  chatShowMoreOnTop: () => Promise<void>
  chatShowMoreOnBottom: () => Promise<void>
}) => {
  const {
    //
    props,
    chatShowMoreOnTop,
    chatShowMoreOnBottom,
  } = data

  // 响应式的滚动位置数据
  const messagesWarpScroll = useScroll(() => {
    // console.log('props.refScrollWarp?.tagName', props.refScrollWarp?.tagName)

    // 【251028】不使用全局原生滚动条后，不再需要
    // if (props.refScrollWarp != null && props.refScrollWarp.tagName === 'HTML') {
    //   return window
    // }
    return props.refScrollWarp
  })

  const topThreshold = chatRoomMessagesShowMoreTopThresholdConfig // 顶部触发阈值（单位：px）
  const bottomThreshold = chatRoomMessagesShowMoreBottomThresholdConfig // 底部触发阈值

  const watchScrollRunning = ref(false)

  // ;(async () => {
  //   while (1) {
  //     await new Promise((resolve) => setTimeout(resolve, 2000))
  //     ;(() => {
  //       if (props.refScrollWarp == null) {
  //         return
  //       }
  //       const scrollTop = props.refScrollWarp.scrollTop
  //       const scrollBottom =
  //         props.refScrollWarp.scrollHeight -
  //         props.refScrollWarp.clientHeight -
  //         props.refScrollWarp.scrollTop
  //       // console.log('scrollTop', scrollTop)
  //       // console.log('scrollBottom', scrollBottom)
  //       // console.log('messagesWarpScroll.y', messagesWarpScroll.y.value)
  //     })()
  //   }
  // })()

  // 滚动触发加载更多
  watch(messagesWarpScroll.y, async () => {
    // console.log('watch(messagesWarpScroll.y')
    // 控制频率，避免性能问题
    if (watchScrollRunning.value === true) {
      return
    }
    watchScrollRunning.value = true
    // 等待几百毫秒
    await new Promise((resolve) =>
      setTimeout(resolve, chatRoomMessagesShowMoreWatchScrollIntervalMsConfig)
    )
    try {
      if (props.refScrollWarp == null) {
        return
      }
      // 距离顶部和底部的距离
      const scrollTop = props.refScrollWarp.scrollTop
      const scrollBottom =
        props.refScrollWarp.scrollHeight -
        props.refScrollWarp.clientHeight -
        props.refScrollWarp.scrollTop

      if (scrollTop <= topThreshold) {
        // 触发顶部加载
        await chatShowMoreOnTop()
      }

      if (scrollBottom <= bottomThreshold) {
        // 触发底部加载
        await chatShowMoreOnBottom()
      }
    } finally {
      watchScrollRunning.value = false
    }
  })
}
