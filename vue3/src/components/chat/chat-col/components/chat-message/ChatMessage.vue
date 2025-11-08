<script setup lang="ts">
import { chatRoomMessagesClassIdNamingFnConfig } from '@/config'
import type {
  ChatRoomMessagesItem,
  OpenMessageInfoDialogType,
  ChatInputBar,
} from './dependencies'
import type { PMLRCApiParameters0DataPageParamNonNullable } from '@/api'
import {
  useMessageControl,
  useMessageDisplay,
  useMessageRealtimeUpdate,
} from './composables'
import { useI18nStore } from '@/stores'

const props = defineProps<{
  /** 消息数据 */
  chatRoomMessagesItem: ChatRoomMessagesItem
  /**
   * 上一条消息、下一条消息，用于控制本条消息的样式，上下是指从旧到新（在列表中显示的上下）
   */
  /** 上一条消息 */
  chatRoomMessagesItemPrevious: ChatRoomMessagesItem | null
  /** 下一条消息 */
  chatRoomMessagesItemNext: ChatRoomMessagesItem | null
  /** 打开消息详情对话框 */
  openMessageInfoDialog: OpenMessageInfoDialogType
  /** 链接定位标记，如果消息id等于此，将显示链接标记 */
  linkPositioningFlagMessageId: string | null
  linkPositioningFlagShow: boolean
  linkPositioningFlagClose: () => void
  /** 聊天输入栏，正在回复的消息 */
  // chatReplyMessage: MessagesResponseWidthExpand | null
  refChatInputBar: InstanceType<typeof ChatInputBar> | null
  /** 聊天回复定位 */
  chatRoomMessagesReplyPositioningFn: (
    replyMessagePositioningData: PMLRCApiParameters0DataPageParamNonNullable
  ) => Promise<void>
  replyPositioningFlagMessageId: string | null
  replyPositioningFlagShow: boolean
  replyPositioningFlagClose: () => void
}>()
export type ChatMessagePropsType = typeof props

const i18nStore = useI18nStore()

// 封装 消息的实时更新逻辑
// useMessageRealtimeUpdate
const {
  updateCurrentMessageRealtimeUpdated,
  isCurrentMessageShouldUpdateRealtimeUpdated,
  currentMessageData,
  isCurrentMessageRealtimeUpdatedIsDeleted,
} = useMessageRealtimeUpdate({
  props,
})

// 封装 消息的显示逻辑
// useMessageDisplay
const {
  isMessageCurrentUser,
  isMessagesDispalyTogetherNext,
  isMessageBoxroundedTL,
  isMessageBoxroundedTR,
  isMessageBoxroundedBL,
  isMessageBoxroundedBR,
  messageUserAvatarUrl,
  messageUserName,
  timeAgo,
  messageReplyMessageUserAvatarUrl,
} = useMessageDisplay({
  props,
  currentMessageData,
})

// 封装 消息的操作逻辑
// useMessageControl
const {
  openMessageInfoDialogFn,
  onLongPressTargetRef,
  isShowLinkPositioningFlag,
  linkPositioningFlagClickFn,
  isShowReplyPositioningFlag,
  replyPositioningFlagClickFn,
  isShowChatReplyMessageFlag,
  isShowChatEditMessageFlag,
  replyMessagesPositioningFn,
} = useMessageControl({
  props,
  currentMessageData,
  isCurrentMessageShouldUpdateRealtimeUpdated,
  updateCurrentMessageRealtimeUpdated,
  isCurrentMessageRealtimeUpdatedIsDeleted,
})
</script>

<template>
  <!--
   chat-message-${currentMessageData.id}，data-message-id，用于聊天页处理滚动的收集元素数据
  -->
  <div
    class="chat-message flow-root"
    :class="chatRoomMessagesClassIdNamingFnConfig(currentMessageData.id)"
    :data-message-id="currentMessageData.id"
  >
    <div class="mt-1">
      <!-- 头像与消息 -->
      <div
        ref="onLongPressTargetRef"
        class="avatar-message-box"
        :class="{
          // 消息为当前用户发送，flex-row-reverse使其靠右显示
          'flex-row-reverse': isMessageCurrentUser,
        }"
      >
        <!-- 头像列 -->
        <div class="col-avatar">
          <div class="flex h-full flex-col-reverse items-center">
            <!-- 头像 -->
            <div
              v-if="
                // 不与下一条消息一起显示时，才显示头像和名称
                isMessagesDispalyTogetherNext === false
              "
              class="h-[40px] w-full rounded-full bg-color-background-soft"
              :style="{
                backgroundImage: `url('${messageUserAvatarUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            ></div>
          </div>
        </div>
        <!-- 消息列 -->
        <div class="col-message truncate">
          <div
            class="flex"
            :class="{
              // 消息为当前用户发送，flex-row-reverse使其靠右显示
              'flex-row-reverse': isMessageCurrentUser,
            }"
          >
            <div
              class="flex min-h-[40px] items-center truncate transition-colors"
              :class="{
                // 消息为当前用户发送，显示不同的消息背景色
                'bg-el-primary-light-4':
                  isMessageCurrentUser &&
                  !isCurrentMessageRealtimeUpdatedIsDeleted,
                'bg-color-background-soft':
                  !isMessageCurrentUser &&
                  !isCurrentMessageRealtimeUpdatedIsDeleted,
                'bg-el-danger-light-4':
                  isCurrentMessageRealtimeUpdatedIsDeleted,
                // 圆角控制
                'rounded-tl-[20px]': isMessageBoxroundedTL,
                'rounded-tr-[20px]': isMessageBoxroundedTR,
                'rounded-bl-[20px]': isMessageBoxroundedBL,
                'rounded-br-[20px]': isMessageBoxroundedBR,
                'rounded-tl-[4px]': !isMessageBoxroundedTL,
                'rounded-tr-[4px]': !isMessageBoxroundedTR,
                'rounded-bl-[4px]': !isMessageBoxroundedBL,
                'rounded-br-[4px]': !isMessageBoxroundedBR,
              }"
            >
              <div class="flex-1 truncate">
                <div
                  class="message-content-box relative flow-root"
                  :class="{
                    isCurrentMessageRealtimeUpdatedIsDeleted:
                      isCurrentMessageRealtimeUpdatedIsDeleted,
                  }"
                >
                  <!-- 删除时的遮罩，效果不太好 -->
                  <!-- <Transition name="fade">
                    <div
                      v-if="isCurrentMessageRealtimeUpdatedIsDeleted"
                      class="deleted-overlay absolute bottom-0 left-0 right-0 top-0"
                    ></div>
                  </Transition> -->
                  <div
                    class="my-2"
                    :class="{
                      'blinking-2s':
                        isCurrentMessageShouldUpdateRealtimeUpdated,
                    }"
                  >
                    <!-- 回复的消息 -->
                    <div
                      v-if="currentMessageData.expand.replyMessage != null"
                      class="mb-[4px] ml-[4px] mr-[12px]"
                    >
                      <div
                        class="flex items-center"
                        :class="{
                          'cursor-pointer':
                            !currentMessageData.expand.replyMessage.isDeleted,
                          'cursor-not-allowed':
                            currentMessageData.expand.replyMessage.isDeleted,
                        }"
                        @click="
                          () => {
                            if (
                              currentMessageData.expand.replyMessage != null &&
                              currentMessageData.expand.replyMessage.isDeleted
                            ) {
                              return
                            }
                            replyMessagesPositioningFn()
                          }
                        "
                      >
                        <!-- 头像 -->
                        <div class="ml-[4px] mr-[6px]">
                          <div
                            class="h-[20px] w-[20px] rounded-full bg-color-background-soft"
                            :style="{
                              backgroundImage: `url('${messageReplyMessageUserAvatarUrl}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }"
                          ></div>
                        </div>
                        <!-- 内容 -->
                        <div class="truncate">
                          <div
                            v-if="
                              currentMessageData.expand.replyMessage.isDeleted
                            "
                            class="select-none truncate text-[12px] text-color-text"
                          >
                            {{
                              i18nStore.t(
                                'chatMessageReplyMessageDeletedShowText'
                              )()
                            }}
                          </div>
                          <div
                            v-else
                            class="select-none truncate text-[12px] text-color-text"
                          >
                            {{ currentMessageData.expand.replyMessage.content }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- 消息文字内容 -->
                    <div
                      class="wrap-long-text mx-3 text-[15px] text-color-text"
                    >
                      {{ currentMessageData.content }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 图标列（详情按钮） -->
        <div class="col-icon">
          <div class="flex h-full flex-col-reverse items-center justify-center">
            <Transition name="fade-pop" mode="out-in">
              <!-- 删除标记 -->
              <div
                v-if="isCurrentMessageRealtimeUpdatedIsDeleted"
                class="cursor-not-allowed text-el-danger"
              >
                <RiDeleteBin7Fill></RiDeleteBin7Fill>
              </div>
              <!-- 更新标记 -->
              <div
                v-else-if="isCurrentMessageShouldUpdateRealtimeUpdated"
                class="cursor-pointer text-el-primary"
                @click="updateCurrentMessageRealtimeUpdated"
              >
                <RiRefreshLine></RiRefreshLine>
              </div>
              <!-- 编辑标记 -->
              <div
                v-else-if="isShowChatEditMessageFlag"
                class="cursor-pointer text-el-info"
                @click="openMessageInfoDialogFn"
              >
                <RiEditFill></RiEditFill>
              </div>
              <!-- 回复标记 -->
              <div
                v-else-if="isShowChatReplyMessageFlag"
                class="cursor-pointer text-el-success"
                @click="openMessageInfoDialogFn"
              >
                <RiDiscussFill></RiDiscussFill>
              </div>
              <!-- 回复定位标记 -->
              <div
                v-else-if="isShowReplyPositioningFlag"
                class="cursor-pointer text-el-primary"
                @click="replyPositioningFlagClickFn"
              >
                <RiDiscussLine></RiDiscussLine>
              </div>
              <!-- 链接定位标记 -->
              <div
                v-else-if="isShowLinkPositioningFlag"
                class="cursor-pointer text-el-primary"
                @click="linkPositioningFlagClickFn"
              >
                <RiLink></RiLink>
              </div>
              <!-- 普通更多按钮 -->
              <div
                v-else
                class="more-button cursor-pointer"
                @click="openMessageInfoDialogFn"
              >
                <RiMoreFill></RiMoreFill>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      <!-- 用户名与时间 -->
      <div
        v-if="
          // 不与下一条消息一起显示时，才显示头像和名称
          isMessagesDispalyTogetherNext === false
        "
        class="mb-3 flex select-none items-center"
        :class="{
          // 消息为当前用户发送，flex-row-reverse使其靠右显示
          'flex-row-reverse': isMessageCurrentUser,
        }"
      >
        <!-- 用户名 -->
        <div class="max-w-[50%] truncate text-[12px] font-bold text-color-text">
          {{ messageUserName }}
        </div>
        <!-- 分隔 -->
        <div class="mx-[8px]">
          <RiCircleFill size="4px" class="text-color-text-soft"></RiCircleFill>
        </div>
        <!-- 时间 -->
        <div class="truncate text-[12px] text-color-text-soft">
          {{ timeAgo }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-message-box {
  --avatar-width: 40px;
  --icon-width: 40px;
  --gap: 4px;

  display: flex;
  align-items: stretch;
  gap: var(--gap);

  .col-avatar {
    width: var(--avatar-width);
    min-height: var(--avatar-width);
  }

  .col-icon {
    width: var(--icon-width);
    min-height: var(--icon-width);
  }

  .col-message {
    // 限制消息列最大宽度， 40px 为头像列和图标列的宽度， 4px 为间隔宽度
    max-width: calc(
      100% - var(--avatar-width) - var(--icon-width) - var(--gap) - var(--gap)
    );
  }

  // more-button 默认不显示
  // 鼠标悬停在整个头像消息行时，会显示 more-button
  .more-button {
    // display: none;
    opacity: 0;
    transition:
      opacity 150ms,
      color 150ms;
    color: var(--color-text);
    // 这个是消息按钮的悬停
    &:hover {
      color: var(--color-text-soft);
    }
  }
  // 这个是整个头像消息行的悬停
  &:hover {
    .more-button {
      // display: block;
      opacity: 1;
    }
  }
}

.deleted-overlay {
  backdrop-filter: blur(15px); /* 模糊背景内容 */
  -webkit-backdrop-filter: blur(15px); /* Safari 支持 */
  transition: all 0.3s;
  // 悬停时透明
  &:hover {
    opacity: 0;
  }
}

.message-content-box {
  transition: all 0.3s;
  &.isCurrentMessageRealtimeUpdatedIsDeleted {
    opacity: 0;
    &:hover {
      opacity: 1;
    }
  }
}
</style>
