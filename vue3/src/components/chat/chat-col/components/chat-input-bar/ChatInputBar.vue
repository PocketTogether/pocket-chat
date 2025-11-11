<script setup lang="ts">
import { type PMLRCApiParameters0DataPageParamNonNullable } from '@/api'
import { chatInputBarDefaultHeightConfig, routerDict } from '@/config'
import { useI18nStore } from '@/stores'
import type {
  ChatDisplayDependentDataInitializationChooseType,
  ChatColPageRecoverDataCheckType,
} from './dependencies'
import { ChatTopBarMoreMenuItem } from './dependencies'
import type { ElButton } from 'element-plus'
import {
  useChatInputBarControl,
  useChatInputBarData,
  useChatInputBarDispaly,
} from './composables'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  /** 房间id，空字符串为全局聊天 */
  roomId: string
  /** 聊天回复定位 */
  chatRoomMessagesReplyPositioningFn: (
    replyMessagePositioningData: PMLRCApiParameters0DataPageParamNonNullable,
    couldReplyPositioningFlagOpen?: boolean
  ) => Promise<void>
  // 各种初始化情况的对应数据，决定使用哪种初始化
  chatDisplayDependentDataInitializationChoose: ChatDisplayDependentDataInitializationChooseType
  // “页面恢复数据”是否正确
  chatColPageRecoverDataCheck: ChatColPageRecoverDataCheckType
  chatBackBottomDisplayable: boolean
  chatBackBottomFn: () => Promise<void>
  chatRoomMessagesRealtimeUnReadNumber: number
}>()
export type ChatInputBarPropsType = typeof props

const i18nStore = useI18nStore()

// 封装 聊天输入栏数据逻辑
// useChatInputBarData
const chatInputBarData = useChatInputBarData({ props })
const {
  chatInputContent,
  chatReplyMessage,
  chatReplyMessageSet,
  chatEditMessage,
  chatEditMessageSet,
} = chatInputBarData

// 封装 聊天输入栏显示逻辑
// useChatInputBarDispaly
const chatInputBarDispaly = useChatInputBarDispaly({
  props,
  ...chatInputBarData,
})
const {
  messageSendSubmitRunning,
  messageEditSubmitRunning,
  chatReplyMessageUserAvatarUrl,
  chatInputBarFunctionChoose,
  autoCyclicValueToShowNewMessageAndBackBottom,
  isHaveNewMessage,
  isShowMoreMenu,
  closeMoreMenu,
  toggleShowMoreMenu,
  targetMoreMenu,
  targetMoreMenuToggleShowButtonEl,
} = chatInputBarDispaly

// 封装 聊天输入栏的操作逻辑
// useChatInputBarControl
const chatInputBarControl = useChatInputBarControl({
  props,
  ...chatInputBarData,
  ...chatInputBarDispaly,
})
const {
  chatReplyMessageCancel,
  replyMessagesPositioningFn,
  messageSendSubmit,
  messageEditSubmit,
  messageEditCancel,
  handleChatInputKeydownEnter,
} = chatInputBarControl

defineExpose({
  chatInputContent,
  chatReplyMessage,
  chatReplyMessageSet,
  chatEditMessage,
  chatEditMessageSet,
})
</script>

<template>
  <div class="chat-input-bar relative flow-root">
    <!-- 展开菜单 -->
    <Transition name="fade-up-down">
      <div
        v-if="isShowMoreMenu"
        ref="targetMoreMenu"
        class="more-menu absolute bottom-0 z-[2] bg-color-background-soft"
      >
        <!-- 收起 -->
        <div
          class="more-menu-close-button flow-root cursor-pointer select-none hover:bg-el-primary-light-4"
          @click="closeMoreMenu"
        >
          <div class="button-box flex items-center justify-center">
            <RiArrowDownWideLine size="20px"></RiArrowDownWideLine>
          </div>
        </div>
        <!-- 菜单项 图片 -->
        <ChatTopBarMoreMenuItem @click="() => {}">
          <template #icon>
            <RiImageLine size="18px"></RiImageLine>
          </template>
          <template #text>
            {{ i18nStore.t('chatInputBarBackMenuImage')() }}
          </template>
        </ChatTopBarMoreMenuItem>
        <!-- 菜单项 文件 -->
        <ChatTopBarMoreMenuItem @click="() => {}">
          <template #icon>
            <RiFolderLine size="18px"></RiFolderLine>
          </template>
          <template #text>
            {{ i18nStore.t('chatInputBarBackMenuFile')() }}
          </template>
        </ChatTopBarMoreMenuItem>
        <!-- 垫片 -->
        <div
          :style="{
            height: `${chatInputBarDefaultHeightConfig}px`,
          }"
        ></div>
      </div>
    </Transition>
    <div
      class="chat-input-box relative z-[3] flow-root bg-color-background-soft pb-1"
    >
      <!-- <div class="m-3 h-16 bg-red-950">输入框</div> -->
      <div class="my-2 flex items-stretch">
        <!-- 左栏 -->
        <div class="ml-2 mr-1 flow-root flex-1 truncate">
          <!-- 登录提示 -->
          <template v-if="chatInputBarFunctionChoose === 'login'">
            <div class="mr-[4px] flex h-full items-center justify-end">
              <div
                class="select-none truncate text-[14px] font-bold text-color-text"
              >
                {{ i18nStore.t('chatInputBarLoginText')() }}
              </div>
            </div>
          </template>
          <!-- 回到底部文字，有新消息时与新消息通知循环闪烁显示 -->
          <template v-else-if="chatInputBarFunctionChoose === 'backBottom'">
            <div class="mr-[4px] flex h-full items-center justify-end">
              <Transition name="fade800ms" mode="out-in">
                <div
                  v-if="
                    isHaveNewMessage &&
                    autoCyclicValueToShowNewMessageAndBackBottom ===
                      'NewMessage'
                  "
                  class="select-none truncate text-[14px] font-bold text-color-text"
                >
                  {{
                    i18nStore.t('chatInputBarNewMessageText')(
                      chatRoomMessagesRealtimeUnReadNumber
                    )
                  }}
                </div>
                <div
                  v-else
                  class="select-none truncate text-[14px] font-bold text-color-text"
                >
                  {{ i18nStore.t('chatInputBarBackBottomText')() }}
                </div>
              </Transition>
            </div>
          </template>
          <!-- 输入框 -->
          <template v-else>
            <!-- 回复的消息 -->
            <div v-if="chatReplyMessage != null">
              <div
                class="flex items-center"
                :class="{
                  'cursor-pointer': !chatReplyMessage.isDeleted,
                  'cursor-not-allowed': chatReplyMessage.isDeleted,
                }"
                @click="
                  () => {
                    if (
                      chatReplyMessage != null &&
                      chatReplyMessage.isDeleted
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
                      backgroundImage: `url('${chatReplyMessageUserAvatarUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }"
                  ></div>
                </div>
                <!-- 内容 -->
                <div class="truncate">
                  <div
                    v-if="chatReplyMessage.isDeleted"
                    class="select-none truncate text-[12px] text-color-text"
                  >
                    {{
                      i18nStore.t('chatMessageReplyMessageDeletedShowText')()
                    }}
                  </div>
                  <div
                    v-else
                    class="select-none truncate text-[12px] text-color-text"
                  >
                    {{ chatReplyMessage.content }}
                  </div>
                </div>
                <!-- 取消按钮 -->
                <div
                  class="flow-root cursor-pointer"
                  @click="chatReplyMessageCancel"
                >
                  <div class="ml-[6px] mr-[10px] text-color-text">
                    <RiCloseCircleFill size="18px"></RiCloseCircleFill>
                  </div>
                </div>
              </div>
            </div>
            <!-- 聊天输入框 -->
            <div class="mt-[1px]">
              <ElInput
                v-model="chatInputContent"
                size="large"
                type="textarea"
                resize="none"
                :rows="1"
                :autosize="{ minRows: 1, maxRows: 10 }"
                @keydown.enter.exact.prevent="handleChatInputKeydownEnter"
              />
            </div>
          </template>
        </div>
        <!-- 右栏 按钮 -->
        <div class="mr-2 flex flex-col-reverse">
          <!-- 登录按钮 -->
          <template v-if="chatInputBarFunctionChoose === 'login'">
            <ElButton
              circle
              type="primary"
              :tag="RouterLink"
              :to="routerDict.LoginPage.path"
            >
              <template #icon>
                <RiLoginBoxLine></RiLoginBoxLine>
              </template>
            </ElButton>
          </template>
          <!-- 编辑按钮组 -->
          <template v-else-if="chatInputBarFunctionChoose === 'edit'">
            <div class="flex">
              <div>
                <!-- 取消 -->
                <ElButton
                  circle
                  type="info"
                  :disabled="messageEditSubmitRunning"
                  @click="messageEditCancel"
                >
                  <template #icon>
                    <RiCloseFill></RiCloseFill>
                  </template>
                </ElButton>
              </div>
              <div class="ml-[8px]">
                <!-- 确认 -->
                <ElButton
                  class=""
                  circle
                  type="primary"
                  :loading="messageEditSubmitRunning"
                  :disabled="
                    chatInputContent.trim() === '' && !messageEditSubmitRunning
                  "
                  @click="messageEditSubmit"
                >
                  <template #icon>
                    <RiCheckFill></RiCheckFill>
                  </template>
                </ElButton>
              </div>
            </div>
          </template>
          <!-- 发送按钮 -->
          <template v-else-if="chatInputBarFunctionChoose === 'send'">
            <ElButton
              circle
              type="primary"
              :loading="messageSendSubmitRunning"
              :disabled="
                chatInputContent.trim() === '' && !messageSendSubmitRunning
              "
              @click="messageSendSubmit"
            >
              <template #icon>
                <RiSendPlane2Fill></RiSendPlane2Fill>
              </template>
            </ElButton>
          </template>
          <!-- 回到底部按钮 -->
          <template v-else-if="chatInputBarFunctionChoose === 'backBottom'">
            <ElButton circle type="info" @click="chatBackBottomFn">
              <template #icon>
                <RiArrowDownLongLine></RiArrowDownLongLine>
              </template>
            </ElButton>
          </template>
          <!-- 菜单按钮 -->
          <template v-else>
            <ElButton
              ref="targetMoreMenuToggleShowButtonEl"
              circle
              type="info"
              @click="toggleShowMoreMenu"
            >
              <template #icon>
                <RiAttachmentLine></RiAttachmentLine>
              </template>
            </ElButton>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-input-bar {
  // 背景色 --color-background
  // 渐变，透明
  // background: linear-gradient(
  //   to bottom,
  //   transparent 0%,
  //   var(--color-background) 12px
  // );
}
.chat-input-box {
  border-radius: 24px 24px 0 0;
  box-shadow: 0 0 6px 6px var(--color-background);
  :deep() {
    .el-textarea__inner {
      // color: var(--color-text);
      // font-weight: bold;
      border: none;
      box-shadow: none;
      background-color: transparent;
      // transition:
      //   background-color 0.5s,
      //   color 0.2s;
      color: var(--color-text);
      // font-weight: bold;
      // font-size: 16px;
      // 防止目标区域中的滚动触发父元素中的滚动
      overscroll-behavior: contain;
    }
    // .el-input__wrapper {
    //   background-color: var(--color-background-soft);
    //   transition: all 0.5s;
    //   box-shadow: none;
    //   &:hover {
    //     box-shadow: none;
    //   }
    //   .el-input__inner {
    //     color: var(--color-text);
    //     transition: all 0.2s;
    //     font-weight: bold;
    //     // text-align: center;
    //   }
    // }
  }
}

.more-menu {
  border-radius: 24px 24px 0 0;
  box-shadow: 0 0 6px 6px var(--color-background);
  right: 24px;
  max-width: calc(100% - (2 * 24px));
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
}

.more-menu-close-button {
  .button-box {
    height: 24px;
  }
}
</style>
