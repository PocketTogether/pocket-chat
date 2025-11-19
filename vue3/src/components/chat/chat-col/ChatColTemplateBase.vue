<script setup lang="ts">
import type {
  MessagesResponseWidthExpand,
  PMLRCApiParameters0DataPageParamNonNullable,
} from '@/api'
import {
  ChatInputBar,
  ChatMessage,
  MessageInfoDialog,
  ChatTopBar,
} from './components'
import { useI18nStore } from '@/stores'
import { ContainerBar } from '@/components'
import type {
  ChatDisplayDependentDataInitializationChooseType,
  ChatColPageRecoverDataCheckType,
} from './types'
import {
  appIcon,
  appIconNotif,
  chatInputBarDefaultHeightConfig,
} from '@/config'
import { useFavicon } from '@vueuse/core'

const i18nStore = useI18nStore()

/**
 * ChatCol的主要渲染内容，达到将逻辑和内容分离的效果
 * 将 ChatCol.vue\index.vue 拆分封装为 ChatCol.vue\ChatColTemplateBase.vue，以便之后将单向最新无限查询与双向定位无限查询分为两个组件
 */
const props = defineProps<{
  isChatTopHasMore: boolean
  isShowMoreRunning: boolean
  chatShowMoreOnTop: () => Promise<void>
  chatRoomMessagesForShow: MessagesResponseWidthExpand[] | null
  isChatBottomHasMore: boolean
  chatShowMoreOnBottom: () => Promise<void>
  linkPositioningFlagMessageId: string | null
  linkPositioningFlagShow: boolean
  linkPositioningFlagClose: () => void
  chatRoomMessagesRestartFn: () => Promise<void>
  chatRoomMessagesRestartFnRunning: boolean
  chatRoomMessagesRestartFnRunnable: boolean
  /** 是否能返回，控制聊天顶栏的返回按钮是否显示 */
  couldGoBack: boolean
  /** 房间id，空字符串为全局聊天 */
  roomId: string
  /** 聊天回复定位 */
  chatRoomMessagesReplyPositioningFn: (
    replyMessagePositioningData: PMLRCApiParameters0DataPageParamNonNullable
  ) => Promise<void>
  replyPositioningFlagMessageId: string | null
  replyPositioningFlagShow: boolean
  replyPositioningFlagClose: () => void
  // 各种初始化情况的对应数据，决定使用哪种初始化
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  // “页面恢复数据”是否正确
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
  chatBackBottomDisplayable: boolean
  chatBackBottomFn: () => Promise<void>
  chatRoomMessagesRealtimeUnReadNumber: number
  /** 聊天标题 */
  chatTitle: string
  chatMessageQueryisNullAndError: boolean
}>()

// 有新消息时网站图标与标题改变
useFavicon(
  computed(() => {
    if (props.chatRoomMessagesRealtimeUnReadNumber > 0) {
      return appIconNotif
    }
    return appIcon
  })
)
// const title = useTitle()
watch(
  () => props.chatRoomMessagesRealtimeUnReadNumber,
  (num) => {
    // 正则匹配开头的 (数字)，并去除
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, '')

    if (num > 0) {
      document.title = `(${num}) ${baseTitle}`
    } else {
      document.title = baseTitle
    }
  }
)

// 消息详情对话框
const refMessageInfoDialog = ref<InstanceType<typeof MessageInfoDialog> | null>(
  null
)

// 打开消息详情对话框，类型和refMessageInfoDialog导出的一致
const openMessageInfoDialog: NonNullable<
  typeof refMessageInfoDialog.value
>['openMessageInfoDialog'] = (messageId, messageQueryData) => {
  refMessageInfoDialog.value?.openMessageInfoDialog(messageId, messageQueryData)
}
// eslint-disable-next-line prettier/prettier
export type OpenMessageInfoDialogType = typeof openMessageInfoDialog;

// 聊天输入栏
const refChatInputBar = ref<InstanceType<typeof ChatInputBar> | null>(null)

// 导出聊天输入栏引用以便于页面回复数据收集
defineExpose({
  refChatInputBar,
  refMessageInfoDialog,
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
// 控制chatRoomMessagesForShow使其再onMounted后才有数据，这样可以将页面加载压力转移到onMounted后，解决页面切换慢的问题
const chatRoomMessagesForShowWithOnMounted = computed(() => {
  if (isMounted.value === false) {
    return null
  }
  return props.chatRoomMessagesForShow
})
</script>

<template>
  <div class="relative">
    <!-- 消息详情对话框 -->
    <MessageInfoDialog
      ref="refMessageInfoDialog"
      :refChatInputBar="refChatInputBar"
      :chatRoomMessagesReplyPositioningFn="chatRoomMessagesReplyPositioningFn"
      :chatDisplayDependentDataInitializationChoose="
        chatDisplayDependentDataInitializationChoose
      "
      :chatColPageRecoverDataCheck="chatColPageRecoverDataCheck"
    ></MessageInfoDialog>
    <!-- bottomHeight测量的高度会有延时，如果需要立即测量滚动高度就会导致问题，此时可以通过此参数指定默认高度 -->
    <!-- 聊天页的滚动控制，初始需要在底部，需要指定默认高度（输入框为空时的高度） -->
    <ContainerBar :defaultBarHeight="chatInputBarDefaultHeightConfig">
      <template #default>
        <div class="relative">
          <!-- 聊天页顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <ChatTopBar
              :chatRoomMessagesRestartFn="chatRoomMessagesRestartFn"
              :chatRoomMessagesRestartFnRunning="
                chatRoomMessagesRestartFnRunning
              "
              :chatRoomMessagesRestartFnRunnable="
                chatRoomMessagesRestartFnRunnable
              "
              :couldGoBack="couldGoBack"
              :roomId="roomId"
              :chatTitle="chatTitle"
            >
              <template #chatTopBarMoreMenu>
                <!-- 聊天顶栏菜单项 插槽 -->
                <slot name="chatTopBarMoreMenu"></slot>
              </template>
            </ChatTopBar>
          </div>
          <!-- 聊天页内容 -->
          <Transition name="fade">
            <div
              v-if="chatRoomMessagesForShowWithOnMounted != null"
              class="mx-1 mt-6"
            >
              <!-- <ElButton @click="testPbPage">pb分页测试</ElButton> -->
              <!-- <ElButton @click="testPbSend">pb批量消息</ElButton> -->
              <!-- 加载更多按钮 -->
              <div
                v-if="isChatTopHasMore"
                class="mt-[-24px] flex items-center justify-center"
              >
                <ElButton
                  class="chat-show-more-button top"
                  round
                  size="small"
                  text
                  type="primary"
                  :loading="isShowMoreRunning"
                  @click="chatShowMoreOnTop"
                >
                  <template v-if="isShowMoreRunning">
                    {{ i18nStore.t('chatOnTopOrBottomShowMoreRunningText')() }}
                  </template>
                  <template v-else>
                    {{ i18nStore.t('chatOnTopOrBottomShowMoreText')() }}
                  </template>
                </ElButton>
              </div>
              <!-- 消息内容 -->
              <div v-if="chatRoomMessagesForShow != null">
                <!-- 消息 -->
                <ChatMessage
                  v-for="(item, index) in chatRoomMessagesForShow"
                  :key="item.id"
                  :openMessageInfoDialog="openMessageInfoDialog"
                  :chatRoomMessagesItem="item"
                  :chatRoomMessagesItemPrevious="
                    (() => {
                      // 上一条消息
                      // 确保存在
                      // index === 0
                      if (index < 1) {
                        return null
                      }
                      return chatRoomMessagesForShow[index - 1]
                    })()
                  "
                  :chatRoomMessagesItemNext="
                    (() => {
                      // 下一条消息
                      // 确保存在
                      // index === chatRoomMessagesForShow.length - 1
                      if (index > chatRoomMessagesForShow.length - 2) {
                        return null
                      }
                      return chatRoomMessagesForShow[index + 1]
                    })()
                  "
                  :linkPositioningFlagMessageId="linkPositioningFlagMessageId"
                  :linkPositioningFlagShow="linkPositioningFlagShow"
                  :linkPositioningFlagClose="linkPositioningFlagClose"
                  :refChatInputBar="refChatInputBar"
                  :chatRoomMessagesReplyPositioningFn="
                    chatRoomMessagesReplyPositioningFn
                  "
                  :replyPositioningFlagMessageId="replyPositioningFlagMessageId"
                  :replyPositioningFlagShow="replyPositioningFlagShow"
                  :replyPositioningFlagClose="replyPositioningFlagClose"
                ></ChatMessage>
              </div>
              <!-- <ElButton @click="testPbPageBottom">pb分页测试</ElButton> -->
              <!-- 加载更多按钮 -->
              <div
                v-if="isChatBottomHasMore"
                class="flex items-center justify-center"
              >
                <ElButton
                  class="chat-show-more-button bottom"
                  round
                  size="small"
                  text
                  type="primary"
                  :loading="isShowMoreRunning"
                  @click="chatShowMoreOnBottom"
                >
                  <template v-if="isShowMoreRunning">
                    {{ i18nStore.t('chatOnTopOrBottomShowMoreRunningText')() }}
                  </template>
                  <template v-else>
                    {{ i18nStore.t('chatOnTopOrBottomShowMoreText')() }}
                  </template>
                </ElButton>
              </div>
              <div v-else class="h-3"></div>
            </div>
          </Transition>
        </div>
      </template>
      <template #bar>
        <div class="flow-root">
          <!-- 输入栏 -->
          <ChatInputBar
            ref="refChatInputBar"
            :roomId="roomId"
            :chatRoomMessagesReplyPositioningFn="
              chatRoomMessagesReplyPositioningFn
            "
            :chatDisplayDependentDataInitializationChoose="
              chatDisplayDependentDataInitializationChoose
            "
            :chatColPageRecoverDataCheck="chatColPageRecoverDataCheck"
            :chatBackBottomDisplayable="chatBackBottomDisplayable"
            :chatBackBottomFn="chatBackBottomFn"
            :chatRoomMessagesRealtimeUnReadNumber="
              chatRoomMessagesRealtimeUnReadNumber
            "
            :chatMessageQueryisNullAndError="chatMessageQueryisNullAndError"
            :chatRoomMessagesRestartFn="chatRoomMessagesRestartFn"
            :chatRoomMessagesRestartFnRunning="chatRoomMessagesRestartFnRunning"
            :chatRoomMessagesRestartFnRunnable="
              chatRoomMessagesRestartFnRunnable
            "
          ></ChatInputBar>
        </div>
      </template>
    </ContainerBar>
    <!-- 显示状态的遮罩层：加载中、聊天为空 -->
    <Transition name="fade" mode="out-in">
      <!-- 加载时显示的内容 -->
      <div
        v-if="
          chatRoomMessagesForShowWithOnMounted == null && isMounted === true
        "
        class="pointer-events-none absolute top-0 z-10 h-full w-full"
      >
        <div class="sticky top-0 flex h-screen items-center justify-center">
          <div class="h-[50px] w-[50px] text-color-text-soft">
            <RiLoader3Line
              class="loading-spinner-800ms"
              size="50px"
            ></RiLoader3Line>
          </div>
        </div>
      </div>
      <!-- 为空时显示的内容 -->
      <div
        v-else-if="
          chatRoomMessagesForShowWithOnMounted != null &&
          chatRoomMessagesForShowWithOnMounted.length === 0
        "
        class="pointer-events-none absolute top-0 z-10 h-full w-full"
      >
        <div class="sticky top-0 flex h-screen items-center justify-center">
          <div class="h-[100px] w-[100px] text-color-background-soft">
            <!-- <RiMessage3Line size="100px"></RiMessage3Line> -->
            <RiMessage3Fill size="100px"></RiMessage3Fill>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.chat-show-more-button {
  min-width: 50%;
  &.is-loading:before {
    // background-color: transparent;
    background-color: var(--color-background-a30);
    display: none;
  }
  &.top {
    border-radius: 0 0 20px 20px;
  }
  &.bottom {
    border-radius: 20px 20px 0 0;
  }
}
</style>
