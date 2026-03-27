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
import { useElementSize, useWindowSize } from '@vueuse/core'
import {
  fileTypeResolveIconContentUtil,
  pbImageDataChooseBySmallestWithUrl,
} from '@/utils'
import { useSelfPresenceTypingReporter } from '@/composables'

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
  chatMessageQueryisNullAndError: boolean
  chatRoomMessagesRestartFn: () => Promise<void>
  chatRoomMessagesRestartFnRunning: boolean
  chatRoomMessagesRestartFnRunnable: boolean
}>()
export type ChatInputBarPropsType = typeof props

const i18nStore = useI18nStore()

// 【260307】用户当前实时输入状态这一块
const selfPresenceTypingReporter = useSelfPresenceTypingReporter()
const {
  //
  reportTypingOnInput,
  reportTypingOnBlur,
} = selfPresenceTypingReporter

// 封装 聊天输入栏数据逻辑
// useChatInputBarData
const chatInputBarData = useChatInputBarData({ props })
const {
  chatInputContent,
  chatImageSelectList,
  chatFileSelectList,
  chatReplyMessage,
  chatReplyMessageSet,
  chatEditMessage,
  chatEditMessageSet,
  chatMessageIsRealtimeTimeout,
  chatMessageIsRealtimeTimeoutSet,
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
  openPermissionAdminContactNotif,
} = chatInputBarDispaly

// 封装 聊天输入栏的操作逻辑
// useChatInputBarControl
const chatInputBarControl = useChatInputBarControl({
  props,
  selfPresenceTypingReporter,
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
  chatImageSelectList,
  chatFileSelectList,
  chatReplyMessage,
  chatReplyMessageSet,
  chatEditMessage,
  chatEditMessageSet,
  chatMessageIsRealtimeTimeout,
  chatMessageIsRealtimeTimeoutSet,
})

const refCharInputBar = ref<HTMLElement | null>(null)
const { height: refCharInputBarHeight } = useElementSize(refCharInputBar)

const windowSize = useWindowSize()

// 输入栏编辑模式时，是否需加高，按钮纵向显示
const isInputBarEditModeNeedHigher = computed(() => {
  if (chatInputBarFunctionChoose.value !== 'edit') {
    return false
  }
  if (windowSize.width.value > 400) {
    return false
  }
  return true
})

const autosizeElInput = computed(() => {
  if (isInputBarEditModeNeedHigher.value) {
    return { minRows: 3, maxRows: 10 }
  }
  return { minRows: 1, maxRows: 10 }
})
</script>

<template>
  <div ref="refCharInputBar" class="chat-input-bar relative flow-root">
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
        <!-- 菜单项 文件 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.FileSelectPage.path)"
        >
          <template #icon>
            <RiFolderLine size="18px"></RiFolderLine>
          </template>
          <template #text>
            {{ i18nStore.t('chatInputBarBackMenuFile')() }}
          </template>
        </ChatTopBarMoreMenuItem>
        <!-- 菜单项 图片 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.ImageSelectPage.path)"
        >
          <template #icon>
            <RiImageLine size="18px"></RiImageLine>
          </template>
          <template #text>
            {{ i18nStore.t('chatInputBarBackMenuImage')() }}
          </template>
        </ChatTopBarMoreMenuItem>
        <!-- 垫片 -->
        <div
          :style="{
            height: `${refCharInputBarHeight + 12}px`,
          }"
        ></div>
      </div>
    </Transition>
    <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
    <div
      class="pointer-events-none absolute bottom-0 left-[-0.5px] right-[-0.5px] top-[-0.5px] z-[4] rounded-t-[24px] border-2 border-color-background-soft"
    ></div>
    <div
      class="chat-input-box bar-box relative z-[3] flow-root bg-color-background-soft pb-1"
    >
      <!-- <div class="m-3 h-16 bg-red-950">输入框</div> -->
      <div class="my-2 flex items-stretch">
        <!-- 左栏 -->
        <div class="ml-2 mr-1 flow-root flex-1 truncate">
          <!--
            【260308】遇到了问题，奇怪的是在双列布局下才有这个问题，在单列时没有。
            暂时通过 不使用v-if而是用v-show解决了
            具体问题描述：

flex双列布局中
min-w-0 flex-1 的某列
这之中，有一个其中包含着ElInput的div，div其会随着输入是否有内容而v-if，即无内容时不显示而v-else为一个别的div

我现在遇到了问题，现在我来给你说说：初始状态为有内容，且我向下滚动了一些距离，但当我按键盘退格键将输入内容一个个删除后，最后一个删除时，页面会突然滚动到顶部立即了

而我在非flex时（普通div），就没这个问题

我遇到的问题是怎么回事，是css的某种特性我不知道吗

或许可能是 ElInput 内部的某种操作导致的？
因为我别的元素在因为别的原因切换时都不会导致那样

ElInput 和 flex 的某种千丝万缕的机制共同作用下导致的？

有没有可能是因为一下几个共同同时原因导致的 v-if切换、输入栏失焦，用户在输入框的输入（退格） 几个东西都是同时瞬间发生的，所以共同导致了问题？

我发现输入框这一块把v-if换为v-show就解决了 别的东西即使是v-if也一直都没问题

帮我为此写一篇笔记

260309-1108-笔记：一次由v-if_ElInput_flex共同触发的页面跳动问题分析
          -->
          <!-- 错误提示 -->
          <div v-show="chatInputBarFunctionChoose === 'error'" class="h-full">
            <!-- <div v-if="chatInputBarFunctionChoose === 'error'" class="h-full"> -->
            <div class="mr-[4px] flex h-full items-center justify-end">
              <div
                class="select-none truncate text-[14px] font-bold text-color-text"
              >
                {{ i18nStore.t('chatInputBarMessageErrorText')() }}
              </div>
            </div>
          </div>
          <!-- 登录提示 -->
          <div v-show="chatInputBarFunctionChoose === 'login'" class="h-full">
            <!-- <div
            v-else-if="chatInputBarFunctionChoose === 'login'"
            class="h-full"
          > -->
            <div class="mr-[4px] flex h-full items-center justify-end">
              <div
                class="select-none truncate text-[14px] font-bold text-color-text"
              >
                {{ i18nStore.t('chatInputBarLoginText')() }}
              </div>
            </div>
          </div>
          <!-- 无发送消息权限 -->
          <div
            v-show="chatInputBarFunctionChoose === 'noPermissionSendMessage'"
            class="h-full"
          >
            <!-- <div
            v-else-if="chatInputBarFunctionChoose === 'noPermissionSendMessage'"
            class="h-full"
          > -->
            <div class="mr-[4px] flex h-full items-center justify-end">
              <div
                class="select-none truncate text-[14px] font-bold text-color-text"
              >
                {{ i18nStore.t('permissionNoPermissionSendMessageText')() }}
              </div>
            </div>
          </div>
          <!-- 回到底部文字，有新消息时与新消息通知循环闪烁显示 -->
          <div
            v-show="chatInputBarFunctionChoose === 'backBottom'"
            class="h-full"
          >
            <!-- <div
            v-else-if="chatInputBarFunctionChoose === 'backBottom'"
            class="h-full"
          > -->
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
          </div>
          <!-- 输入框 或图片选择 -->
          <div
            v-show="
              [
                'error',
                'login',
                'noPermissionSendMessage',
                'backBottom',
              ].includes(chatInputBarFunctionChoose) === false
            "
            class="h-full"
          >
            <!-- <div v-else class="h-full"> -->
            <div class="flex h-full flex-col items-stretch">
              <!-- 回复的消息 -->
              <div v-if="chatReplyMessage != null">
                <div
                  class="flex items-center"
                  :class="{
                    'cursor-pointer': !chatReplyMessage.isDeleted,
                    'cursor-not-allowed': chatReplyMessage.isDeleted,
                    'mb-1': chatImageSelectList.length <= 0,
                    'mb-2': chatImageSelectList.length > 0,
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
                      v-else-if="chatReplyMessage.images.length > 0"
                      class="select-none truncate text-[12px] text-color-text"
                    >
                      {{
                        i18nStore.t('chatMessageReplyMessageImageShowText')()
                      }}
                    </div>
                    <div
                      v-else-if="chatReplyMessage.file !== ''"
                      class="select-none truncate text-[12px] text-color-text"
                    >
                      {{ i18nStore.t('chatMessageReplyMessageFileShowText')() }}
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
              <!-- :placeholder="
                  i18nStore.t('chatInputBarShiftEnterPlaceholderText')()
                " -->
              <div class="flex flex-1 items-center truncate">
                <div class="flex-1 truncate">
                  <!-- 图片选择 -->
                  <div v-if="chatImageSelectList.length > 0" class="">
                    <div class="flex items-center">
                      <!-- 取消按钮 或 图片重新选择 -->
                      <div>
                        <!-- 在消息编辑时，应显示 图片重新选择 -->
                        <ElButton
                          v-if="chatInputBarFunctionChoose === 'edit'"
                          circle
                          type="info"
                          :disabled="messageEditSubmitRunning"
                          @click="$router.push(routerDict.ImageSelectPage.path)"
                        >
                          <template #icon>
                            <RiImageLine></RiImageLine>
                          </template>
                        </ElButton>
                        <!-- 取消按钮 -->
                        <ElButton
                          v-else
                          circle
                          type="info"
                          :disabled="messageSendSubmitRunning"
                          @click="chatImageSelectList = []"
                        >
                          <template #icon>
                            <RiCloseFill></RiCloseFill>
                          </template>
                        </ElButton>
                      </div>
                      <!-- 图片 -->
                      <div class="flex-1">
                        <div class="ml-1 flex items-center justify-center">
                          <div
                            v-for="item in chatImageSelectList"
                            :key="item.id"
                          >
                            <div class="mx-[4px] overflow-hidden rounded-[4px]">
                              <div
                                class="h-[30px] w-[30px] bg-cover bg-center"
                                :style="{
                                  backgroundImage: `url(${pbImageDataChooseBySmallestWithUrl(item).url})`,
                                }"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 文件选择 -->
                  <div v-else-if="chatFileSelectList.length > 0" class="">
                    <div class="flex items-center">
                      <!-- 取消按钮 或 文件重新选择 -->
                      <div>
                        <!-- 在消息编辑时，应显示 图片重新选择 -->
                        <ElButton
                          v-if="chatInputBarFunctionChoose === 'edit'"
                          circle
                          type="info"
                          :disabled="messageEditSubmitRunning"
                          @click="$router.push(routerDict.FileSelectPage.path)"
                        >
                          <template #icon>
                            <RiFolderLine></RiFolderLine>
                          </template>
                        </ElButton>
                        <!-- 取消按钮 -->
                        <ElButton
                          v-else
                          circle
                          type="info"
                          :disabled="messageSendSubmitRunning"
                          @click="chatFileSelectList = []"
                        >
                          <template #icon>
                            <RiCloseFill></RiCloseFill>
                          </template>
                        </ElButton>
                      </div>
                      <!-- 文件 -->
                      <div class="flex-1 truncate">
                        <div class="ml-1 flow-root">
                          <div
                            class="mx-3 flex select-none items-center justify-center text-color-text"
                          >
                            <!-- 图标 -->
                            <div class="mr-[6px]">
                              <!-- <RiFile3Fill size="24px"></RiFile3Fill> -->
                              <i
                                :class="
                                  fileTypeResolveIconContentUtil(
                                    chatFileSelectList[0]
                                  ).riIconClass
                                "
                                style="font-size: 24px; line-height: 24px"
                              ></i>
                            </div>
                            <!-- 文件名 -->
                            <div class="truncate">
                              <div class="truncate text-[14px] font-bold">
                                {{
                                  chatFileSelectList[0].fileName !== ''
                                    ? chatFileSelectList[0].fileName
                                    : chatFileSelectList[0].id
                                }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 聊天输入框 -->
                  <div v-else class="mt-[1px]">
                    <ElInput
                      v-model="chatInputContent"
                      type="textarea"
                      resize="none"
                      :autosize="autosizeElInput"
                      @keydown.alt.enter.exact.prevent="
                        handleChatInputKeydownEnter
                      "
                      @input="reportTypingOnInput"
                      @blur="reportTypingOnBlur"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右栏 按钮 -->
        <div class="mr-2 flex flex-col-reverse">
          <!-- 错误按钮（刷新） -->
          <template v-if="chatInputBarFunctionChoose === 'error'">
            <ElButton
              circle
              type="warning"
              :loading="chatRoomMessagesRestartFnRunning"
              :disabled="
                !chatRoomMessagesRestartFnRunnable &&
                !chatRoomMessagesRestartFnRunning
              "
              @click="chatRoomMessagesRestartFn"
            >
              <template #icon>
                <RiRestartLine></RiRestartLine>
              </template>
            </ElButton>
          </template>
          <!-- 登录按钮 -->
          <template v-else-if="chatInputBarFunctionChoose === 'login'">
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
          <!-- 无发送消息权限 -->
          <template
            v-else-if="chatInputBarFunctionChoose === 'noPermissionSendMessage'"
          >
            <ElButton
              circle
              type="info"
              @click="openPermissionAdminContactNotif"
            >
              <template #icon>
                <RiInformationLine></RiInformationLine>
              </template>
            </ElButton>
          </template>
          <!-- 编辑按钮组 -->
          <template v-else-if="chatInputBarFunctionChoose === 'edit'">
            <div v-if="isInputBarEditModeNeedHigher" class="flex flex-col">
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
              <div class="mt-[8px]">
                <!-- 确认 -->
                <ElButton
                  class=""
                  circle
                  type="primary"
                  :loading="messageEditSubmitRunning"
                  :disabled="
                    chatInputContent.trim() === '' &&
                    chatImageSelectList.length <= 0 &&
                    chatFileSelectList.length <= 0 &&
                    !messageEditSubmitRunning
                  "
                  @click="messageEditSubmit"
                >
                  <template #icon>
                    <RiCheckFill></RiCheckFill>
                  </template>
                </ElButton>
              </div>
            </div>
            <div v-else class="flex">
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
                    chatInputContent.trim() === '' &&
                    chatImageSelectList.length <= 0 &&
                    chatFileSelectList.length <= 0 &&
                    !messageEditSubmitRunning
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
                chatInputContent.trim() === '' &&
                chatImageSelectList.length <= 0 &&
                chatFileSelectList.length <= 0 &&
                !messageSendSubmitRunning
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
// .chat-input-bar {
// 背景色 --color-background
// 渐变，透明
// background: linear-gradient(
//   to bottom,
//   transparent 0%,
//   var(--color-background) 12px
// );
// }
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
      font-size: 14px;
      // 防止目标区域中的滚动触发父元素中的滚动
      overscroll-behavior: contain;
      &::placeholder {
        color: var(--color-text-soft);
        font-size: 14px;
        font-style: italic;
      }
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
  max-height: calc(100dvh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
}

.more-menu-close-button {
  .button-box {
    height: 24px;
  }
}
</style>
