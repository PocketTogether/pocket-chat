<script setup lang="ts">
import type {
  ImagesResponseWithBaseExpand,
  PMLRCApiParameters0DataPageParamNonNullable,
} from '@/api'
import {
  ContainerDialog,
  IGVSoltHoverSlideInfoGo,
  ImageGroupViewer,
  TextWithLink,
} from '@/components'
import { useRouteControlDialog, useRouterHistoryTool } from '@/composables'
import { useDateFormatYYYYMMDDHHmmss } from '@/utils'
import type {
  ChatDisplayDependentDataInitializationChooseType,
  ChatColPageRecoverDataCheckType,
} from './dependencies'
import type { ChatInputBar } from './dependencies'
import { useMessageControl, useMessageDispaly } from './composables'
import { MessageDeleteDialog } from './components'
import { useAuthStore, useI18nStore } from '@/stores'
import { chatRoomMessagesInfoDialogQueryKey } from '@/config'

const props = defineProps<{
  /** 聊天输入栏，将使用其中的数据 */
  refChatInputBar: InstanceType<typeof ChatInputBar> | null
  /** 聊天回复定位 */
  chatRoomMessagesReplyPositioningFn: (
    replyMessagePositioningData: PMLRCApiParameters0DataPageParamNonNullable
  ) => Promise<void>
  // 各种初始化情况的对应数据，决定使用哪种初始化
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  // “页面恢复数据”是否正确
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
}>()
export type MessageInfoDialogPropsType = typeof props

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  dialogQueryKey: chatRoomMessagesInfoDialogQueryKey,
})

// 封装 消息显示相关数据逻辑
// useMessageDispaly
const {
  dialogMessageId,
  chatRoomMessagesGetOneQuery,
  messageUserAvatarUrl,
  messageUserName,
  messageUserUsername,
  messageReplyMessageUserAvatarUrl,
  isMessageSendByCurrentUser,
} = useMessageDispaly({
  props,
})
export type ChatRoomMessagesGetOneQueryType = typeof chatRoomMessagesGetOneQuery

// 封装 消息操作相关数据逻辑
// useMessageControl
const {
  openMessageInfoDialog,
  actionButtonCopyMessageLink,
  actionButtonchatReplyMessageSet,
  actionButtonchatEditMessageSet,
  replyMessagesPositioningFn,
  shouldShowActionButtonchatReplyMessageSet,
  refMessageDeleteDialog,
  actionButtonDeleteMessage,
  shouldShowActionButtonDeleteMessage,
  messageDeleteDialogDialogVisible,
} = useMessageControl({
  props,
  chatRoomMessagesGetOneQuery,
  dialogMessageId,
  dialogOpen,
  dialogClose,
})

defineExpose({
  dialogMessageId,
  openMessageInfoDialog,
  dialogClose,
})

const i18nStore = useI18nStore()
const authStore = useAuthStore()

const {
  // 跳转至图片详情页的方法
  routerGoImageInfoPage,
} = useRouterHistoryTool()

const goImageInfoPage = (data: {
  imageId: string
  presetImageGetOneData: ImagesResponseWithBaseExpand
}) => {
  // dialogClose()
  // await new Promise((resolve) => setTimeout(resolve, 200))
  // await nextTick()
  routerGoImageInfoPage(data)
}
</script>

<template>
  <div>
    <ContainerDialog
      :dialogVisible="dialogVisible"
      :dialogCloseFn="dialogClose"
    >
      <!-- 显示消息数据 -->
      <template v-if="chatRoomMessagesGetOneQuery.data.value != null">
        <div
          class="content-box"
          :class="{
            messageDeleteDialogDialogVisible: messageDeleteDialogDialogVisible,
          }"
        >
          <!-- 测试 数据显示 -->
          <!-- <div class="wrap-long-text font-mono">
          {{ JSON.stringify(chatRoomMessagesGetOneQuery.data.value, null, 2) }}
        </div> -->

          <!-- 用户信息 + 关闭按钮 -->
          <div class="ml-[15px] flex items-center justify-between">
            <!-- 头像 名称 用户名 -->
            <div class="flex-1 truncate">
              <div class="flex items-center">
                <!-- 头像 -->
                <div
                  class="h-[44px] w-[44px] rounded-full border-[2px] border-color-background-soft bg-color-background-soft"
                  :style="{
                    backgroundImage: `url('${messageUserAvatarUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                ></div>
                <!-- 名称 用户名 -->
                <div class="flex-1 truncate">
                  <div class="ml-[10px]">
                    <div class="truncate font-bold text-color-text">
                      {{ messageUserName }}
                    </div>
                    <div class="truncate text-[12px] text-color-text-soft">
                      @{{ messageUserUsername }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 关闭按钮 -->
            <div class="mx-[10px] cursor-pointer" @click="dialogClose()">
              <RiCloseFill></RiCloseFill>
            </div>
          </div>
          <!-- 消息卡片 -->
          <div class="mt-[10px]">
            <div
              class="message-box flow-root rounded-[20px] bg-color-background-soft"
            >
              <div class="my-[10px]">
                <!-- 回复的消息 -->
                <div
                  v-if="
                    chatRoomMessagesGetOneQuery.data.value.expand
                      ?.replyMessage != null
                  "
                  class="mb-[6px] ml-[10px] mr-[12px]"
                >
                  <div
                    class="flex items-center"
                    :class="{
                      'cursor-pointer':
                        !chatRoomMessagesGetOneQuery.data.value.expand
                          .replyMessage.isDeleted,
                      'cursor-not-allowed':
                        chatRoomMessagesGetOneQuery.data.value.expand
                          .replyMessage.isDeleted,
                    }"
                    @click="
                      () => {
                        if (
                          chatRoomMessagesGetOneQuery.data.value != null &&
                          chatRoomMessagesGetOneQuery.data.value.expand
                            ?.replyMessage != null &&
                          chatRoomMessagesGetOneQuery.data.value.expand
                            .replyMessage.isDeleted
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
                          chatRoomMessagesGetOneQuery.data.value.expand
                            .replyMessage.isDeleted
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
                        v-else-if="
                          chatRoomMessagesGetOneQuery.data.value.expand
                            .replyMessage.images.length > 0
                        "
                        class="select-none truncate text-[12px] text-color-text"
                      >
                        {{
                          i18nStore.t('chatMessageReplyMessageImageShowText')()
                        }}
                      </div>
                      <div
                        v-else
                        class="select-none truncate text-[12px] text-color-text"
                      >
                        {{
                          chatRoomMessagesGetOneQuery.data.value.expand
                            .replyMessage.content
                        }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 图片 -->
                <div
                  v-if="
                    chatRoomMessagesGetOneQuery.data.value.expand?.images !=
                      null &&
                    chatRoomMessagesGetOneQuery.data.value.expand.images
                      .length > 0
                  "
                  class="flow-root"
                >
                  <div
                    class="mx-[15px]"
                    :class="{
                      // 无回复消息是，上边距多一点
                      'mt-[5px]':
                        chatRoomMessagesGetOneQuery.data.value.expand
                          ?.replyMessage == null,
                    }"
                  >
                    <div
                      class="overflow-hidden rounded-[20px] border-[3px] border-transparent bg-color-background"
                    >
                      <ImageGroupViewer
                        v-slot="{ imageItem }"
                        :imageList="
                          chatRoomMessagesGetOneQuery.data.value.expand.images
                        "
                      >
                        <IGVSoltHoverSlideInfoGo
                          :imageItem="imageItem"
                          :onSlideClick="
                            () => {
                              goImageInfoPage({
                                imageId: imageItem.id,
                                presetImageGetOneData: imageItem,
                              })
                            }
                          "
                        ></IGVSoltHoverSlideInfoGo>
                      </ImageGroupViewer>
                    </div>
                  </div>
                </div>
                <!-- 消息 -->
                <div
                  v-else
                  class="wrap-long-text mx-[15px] text-[16px] text-color-text"
                >
                  <TextWithLink
                    :data="chatRoomMessagesGetOneQuery.data.value.content"
                    aTwcss="text-el-primary hover:underline"
                  ></TextWithLink>
                </div>
                <!-- 时间 -->
                <div class="mx-[15px] mt-[5px] flex items-center justify-end">
                  <!-- 已修改图标 是否已修改 -->
                  <div
                    v-if="
                      chatRoomMessagesGetOneQuery.data.value.created !==
                      chatRoomMessagesGetOneQuery.data.value.updated
                    "
                    class="mr-[6px] mt-[1px]"
                  >
                    <ElTooltip
                      :content="
                        useDateFormatYYYYMMDDHHmmss(
                          chatRoomMessagesGetOneQuery.data.value.updated
                        ).value
                      "
                      placement="top"
                      effect="light"
                    >
                      <div>
                        <RiEditFill
                          size="12px"
                          class="text-color-text-soft"
                        ></RiEditFill>
                      </div>
                    </ElTooltip>
                  </div>
                  <!-- 时间 -->
                  <div class="text-[12px] text-color-text-soft">
                    {{
                      useDateFormatYYYYMMDDHHmmss(
                        chatRoomMessagesGetOneQuery.data.value.created
                      ).value
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="mr-[10px] mt-[5px]">
            <div class="flex items-center justify-end">
              <!-- 复制消息链接 -->
              <div
                class="flow-root cursor-pointer transition-colors hover:text-el-primary"
                @click="actionButtonCopyMessageLink"
              >
                <div class="m-[5px]">
                  <RiLink size="24px"></RiLink>
                </div>
              </div>
              <!-- 用户已登录才显示的操作按钮 -->
              <template v-if="authStore.isValid">
                <!-- 收藏 -->
                <!-- <div
                  class="flow-root cursor-pointer transition-colors hover:text-el-warning"
                >
                  <div class="m-[5px]">
                    <RiBookmarkLine size="24px"></RiBookmarkLine>
                  </div>
                </div> -->
                <!-- 回复 -->
                <Transition name="fade">
                  <div
                    v-if="shouldShowActionButtonchatReplyMessageSet"
                    class="flow-root cursor-pointer transition-colors hover:text-el-success"
                    @click="actionButtonchatReplyMessageSet"
                  >
                    <div class="m-[5px]">
                      <RiDiscussLine size="24px"></RiDiscussLine>
                    </div>
                  </div>
                </Transition>

                <!-- isMessageSendByCurrentUser 消息为当前用户发送才能进行的操作 -->
                <template v-if="isMessageSendByCurrentUser">
                  <!-- 修改 -->
                  <div
                    class="flow-root cursor-pointer transition-colors hover:text-el-info"
                    @click="actionButtonchatEditMessageSet"
                  >
                    <div class="m-[5px]">
                      <RiEditLine size="24px"></RiEditLine>
                    </div>
                  </div>
                  <!-- 删除 -->
                  <Transition name="fade">
                    <div
                      v-if="shouldShowActionButtonDeleteMessage"
                      class="flow-root cursor-pointer transition-colors hover:text-el-danger"
                      @click="actionButtonDeleteMessage"
                    >
                      <div class="m-[5px]">
                        <RiDeleteBin7Line size="24px"></RiDeleteBin7Line>
                      </div>
                    </div>
                  </Transition>
                </template>
              </template>
            </div>
          </div>
          <!-- 垫片，视觉高度调整 -->
          <!-- <div class="h-[16px]"></div> -->
        </div>
      </template>
      <template v-else>
        <!-- 显示获取中 -->
        <template v-if="chatRoomMessagesGetOneQuery.isFetching.value === true">
          获取中
        </template>
        <!-- 消息不存在 -->
        <template v-else> 消息不存在 </template>
      </template>
    </ContainerDialog>
    <!-- 消息删除对话框 -->
    <MessageDeleteDialog
      ref="refMessageDeleteDialog"
      :dialogMessageId="dialogMessageId"
      :messageInfoDialogClose="dialogClose"
      :refChatInputBar="refChatInputBar"
    ></MessageDeleteDialog>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  transition: opacity 300ms;
  &.messageDeleteDialogDialogVisible {
    // opacity: 0.1;
    opacity: 0;
  }
}

.message-box {
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
