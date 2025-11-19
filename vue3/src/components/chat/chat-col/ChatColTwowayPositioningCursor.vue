<script setup lang="ts">
import {
  useChatColPageRecoverDataCheck,
  useChatColPageRecoverDataSetOnBeforeUnmountAndRouteLeave,
  useChatControlFunctions,
  useChatDataProcessMessagesTwoway,
  useChatDisplayDependentDataDefinition,
  useChatDisplayDependentDataInitialization,
  useChatDisplayDependentDataInitializationChoose,
  useChatRoomMessagesRealtimeUnReadNotes,
  useChatScrollMessageChangeTwoway,
  useChatScrollToShowMore,
  useChatShowLimitControlTwoway,
  useChatShowMoreOnTopOrBottomTwoway,
  useTwowayPositioningCursorDataInitialization,
} from './composables'
import ChatColTemplateBase from './ChatColTemplateBase.vue'

const props = defineProps<{
  /** 滚动容器元素 */
  refScrollWarp?: HTMLElement
  /** 是否能返回，控制聊天顶栏的返回按钮是否显示 */
  couldGoBack: boolean
  /** 房间id，空字符串为全局聊天 */
  roomId: string
  /** 聊天标题 */
  chatTitle: string
}>()
// 供封装的组件或组合式函数使用
export type PropsType = typeof props

// 这些数据有点乱，进行封装，定义 与 初始化，分开

// 定义
// 封装：
// 定位游标数据、链接定位标记、回复定位标记 、……
// 等会影响聊天显示的数据 的定义与配套方法
// ChatDisplayDependentData chat-display-dependent-data

// 初始化
// 首先初始化 twowayPositioningCursorData ，其他数据的初始化要等到得到 chatRoomMessagesInfiniteTwowayQuery 之后
// 因为要需要有Query数据来判断“页面恢复数据”是否正确，至于需要先初始化twowayPositioningCursorData时因为chatRoomMessagesInfiniteTwowayQuery依赖这个

// 聊天显示所依赖的数据 的定义与配套方法
const {
  /** 双向定位无限查询的定位游标数据 */
  twowayPositioningCursorData,
  // 链接定位标记，如果消息id等于此，将显示链接标记
  linkPositioningFlagMessageId,
  // 控制链接标记是否显示，消息被点击会使其不显示
  linkPositioningFlagShow,
  linkPositioningFlagClose,
  // 回复定位标记
  replyPositioningFlagMessageId,
  replyPositioningFlagShow,
  replyPositioningFlagClose,
  replyPositioningFlagOpen,
  /** 重置双向定位无限查询的定位游标数据和相关数据 */
  resetPositioningCursorDataAndRelatedData,
} = useChatDisplayDependentDataDefinition()

export type TwowayPositioningCursorDataType = typeof twowayPositioningCursorData

// 获取各种初始化情况的对应数据
const chatDisplayDependentDataInitializationChoose =
  useChatDisplayDependentDataInitializationChoose()

// twowayPositioningCursorData 的初始化
useTwowayPositioningCursorDataInitialization({
  chatDisplayDependentDataInitializationChoose,
  twowayPositioningCursorData,
})

const chatRoomId = computed(() => props.roomId)

/** 封装了聊天页的数据及其处理相关内容 */
const {
  // 聊天页消息 游标分页无限查询
  chatRoomMessagesInfiniteTwowayQuery,
  // 将分页数据处理为消息数组，反转（从旧到新）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chatRoomMessagesList,
  // 从实时消息中，获取本房间的消息
  chatRoomMessagesRealtime,
  // 将 MessagesRealtime 和 MessagesList 融合
  chatRoomMessagesListAndRealtime,
  /**
   * 是否精细化控制Query数据为null
   * 精细化控制Query数据，使其在必要时保持为null（常用于数据切换时）
   */
  whetherToSetChatFinelyControlledQueryDataToNull,
  chatMessageQueryisNullAndError,
} = useChatDataProcessMessagesTwoway({
  chatRoomId,
  twowayPositioningCursorData,
})
export type ChatRoomMessagesInfiniteTwowayQueryType =
  typeof chatRoomMessagesInfiniteTwowayQuery
// 导出一些类型
export type ChatRoomMessagesListType = typeof chatRoomMessagesList
export type ChatRoomMessagesItem = NonNullable<
  typeof chatRoomMessagesList.value
>[number]
export type ChatRoomMessagesRealtimeType = typeof chatRoomMessagesRealtime
export type ChatRoomMessagesListAndRealtimeType =
  typeof chatRoomMessagesListAndRealtime

// 检查“页面恢复数据”是否正确，以页面恢复数据初始化时需要确保数据正确
const chatColPageRecoverDataCheck = useChatColPageRecoverDataCheck({
  chatRoomMessagesListAndRealtime,
  chatDisplayDependentDataInitializationChoose,
  chatRoomId,
})

// 聊天显示所依赖的数据 的初始化（除twowayPositioningCursorData外）
useChatDisplayDependentDataInitialization({
  chatDisplayDependentDataInitializationChoose,
  chatColPageRecoverDataCheck,
  linkPositioningFlagMessageId,
  linkPositioningFlagShow,
  replyPositioningFlagMessageId,
  replyPositioningFlagShow,
})

/** 封装了聊天页消息显示数量限制控制相关的内容 */
const {
  chatRoomMessagesLimitTopCursor,
  chatRoomMessagesLimitBottomCursor,
  chatRoomMessagesLimitList,
  chatRoomMessagesLimitCursorInitFn,
} = useChatShowLimitControlTwoway({
  chatRoomMessagesListAndRealtime,
  twowayPositioningCursorData,
  chatRoomMessagesInfiniteTwowayQuery,
  chatDisplayDependentDataInitializationChoose,
  chatColPageRecoverDataCheck,
})
// 导出一些类型
export type ChatRoomMessagesLimitTopCursorType =
  typeof chatRoomMessagesLimitTopCursor
export type ChatRoomMessagesLimitBottomCursorType =
  typeof chatRoomMessagesLimitBottomCursor
export type ChatRoomMessagesLimitListType = typeof chatRoomMessagesLimitList

// 最终用于渲染的数据
const chatRoomMessagesForShow = computed(() => chatRoomMessagesLimitList.value)
export type ChatRoomMessagesForShowType = typeof chatRoomMessagesForShow

/** 封装了聊天页消息变动时的滚动处理 */
const {
  chatScrollCaptureSnapshotBeforeMessageChange,
  chatScrollAdjustPositionAfterMessageChange,
  chatRoomMessagesScrollInitFn,
} = useChatScrollMessageChangeTwoway({
  props,
  chatRoomMessagesForShow,
  chatRoomMessagesRealtime,
  chatRoomMessagesLimitBottomCursor,
  twowayPositioningCursorData,
  chatDisplayDependentDataInitializationChoose,
  chatColPageRecoverDataCheck,
  chatRoomMessagesInfiniteTwowayQuery,
})
export type ChatScrollCaptureSnapshotBeforeMessageChangeType =
  typeof chatScrollCaptureSnapshotBeforeMessageChange
export type ChatScrollAdjustPositionAfterMessageChangeType =
  typeof chatScrollAdjustPositionAfterMessageChange

/** 封装了在聊天顶部或底部显示更多的函数，加载更多，控制显示限制 */
const {
  // 聊天顶部加载更多
  chatShowMoreOnTop,
  // 聊天底部加载更多
  chatShowMoreOnBottom,
  // 是否正在加载更多
  isShowMoreRunning,
  // 聊天顶部是否有未显示的
  isChatTopHasMore,
  // 聊天底部是否有未显示的
  isChatBottomHasMore,
} = useChatShowMoreOnTopOrBottomTwoway({
  chatRoomMessagesListAndRealtime,
  chatRoomMessagesLimitList,
  chatRoomMessagesInfiniteTwowayQuery,
  chatRoomMessagesLimitTopCursor,
  chatRoomMessagesLimitBottomCursor,
  chatScrollCaptureSnapshotBeforeMessageChange,
  chatScrollAdjustPositionAfterMessageChange,
})

/** 封装了聊天页滚动触发在顶部或底部显示更多的功能 */
useChatScrollToShowMore({
  props,
  chatShowMoreOnTop,
  chatShowMoreOnBottom,
})

const refScrollView = ref<HTMLElement | null>(null)

const refChatColTemplateBase = ref<InstanceType<
  typeof ChatColTemplateBase
> | null>(null)
export type RefChatColTemplateBaseType = typeof refChatColTemplateBase

// 封装 chat的一些操作
const {
  chatRoomMessagesRestartFnRunning,
  chatRoomMessagesRestartFnRunnable,
  chatRoomMessagesRestartFn,
  chatRoomMessagesReplyPositioningFn,
  chatBackBottomDisplayable,
  chatBackBottomFn,
} = useChatControlFunctions({
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
})

// 未读实时消息统计
const {
  chatRoomMessagesRealtimeUnReadNumber,
  chatRoomMessagesRealtimeReadNumber,
} = useChatRoomMessagesRealtimeUnReadNotes({
  chatRoomMessagesRealtime,
  props,
  isChatBottomHasMore,
  chatDisplayDependentDataInitializationChoose,
  chatColPageRecoverDataCheck,
})

// 页面恢复数据收集
useChatColPageRecoverDataSetOnBeforeUnmountAndRouteLeave({
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
})
</script>

<template>
  <div>
    <div ref="refScrollView">
      <!-- ChatCol的主要渲染内容，达到将逻辑和内容分离的效果 -->
      <ChatColTemplateBase
        ref="refChatColTemplateBase"
        :isChatTopHasMore="isChatTopHasMore"
        :isShowMoreRunning="isShowMoreRunning"
        :chatShowMoreOnTop="chatShowMoreOnTop"
        :chatRoomMessagesForShow="chatRoomMessagesForShow"
        :isChatBottomHasMore="isChatBottomHasMore"
        :chatShowMoreOnBottom="chatShowMoreOnBottom"
        :linkPositioningFlagMessageId="linkPositioningFlagMessageId"
        :linkPositioningFlagShow="linkPositioningFlagShow"
        :linkPositioningFlagClose="linkPositioningFlagClose"
        :chatRoomMessagesRestartFn="chatRoomMessagesRestartFn"
        :chatRoomMessagesRestartFnRunning="chatRoomMessagesRestartFnRunning"
        :chatRoomMessagesRestartFnRunnable="chatRoomMessagesRestartFnRunnable"
        :couldGoBack="couldGoBack"
        :roomId="roomId"
        :chatRoomMessagesReplyPositioningFn="chatRoomMessagesReplyPositioningFn"
        :replyPositioningFlagMessageId="replyPositioningFlagMessageId"
        :replyPositioningFlagShow="replyPositioningFlagShow"
        :replyPositioningFlagClose="replyPositioningFlagClose"
        :chatDisplayDependentDataInitializationChoose="
          chatDisplayDependentDataInitializationChoose
        "
        :chatColPageRecoverDataCheck="chatColPageRecoverDataCheck"
        :chatBackBottomDisplayable="chatBackBottomDisplayable"
        :chatBackBottomFn="chatBackBottomFn"
        :chatRoomMessagesRealtimeUnReadNumber="
          chatRoomMessagesRealtimeUnReadNumber
        "
        :chatTitle="chatTitle"
        :chatMessageQueryisNullAndError="chatMessageQueryisNullAndError"
      >
        <template #chatTopBarMoreMenu>
          <!-- 聊天顶栏菜单项 插槽 -->
          <slot name="chatTopBarMoreMenu"></slot>
        </template>
      </ChatColTemplateBase>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
