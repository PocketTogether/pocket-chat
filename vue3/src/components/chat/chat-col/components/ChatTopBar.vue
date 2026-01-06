<script setup lang="ts">
import { routerDict } from '@/config'
import { useI18nStore } from '@/stores'
import { useWatchSourceToHoldTimeAndStep } from '@/utils'
import { onClickOutside } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { ChatTopBarMoreMenuItem } from '.'
import { useRouterHistoryTool } from '@/composables'

const props = defineProps<{
  chatRoomMessagesRestartFn: () => Promise<void>
  chatRoomMessagesRestartFnRunning: boolean
  chatRoomMessagesRestartFnRunnable: boolean
  couldGoBack: boolean
  /** 房间id，空字符串为全局聊天 */
  roomId: string
  /** 聊天标题 */
  chatTitle: string
}>()

const isShowMoreMenu = ref(false)
const openMoreMenu = () => {
  isShowMoreMenu.value = true
}
const closeMoreMenu = () => {
  isShowMoreMenu.value = false
}
const toggleShowMoreMenu = () => {
  isShowMoreMenu.value = !isShowMoreMenu.value
}

// 当菜单展开时，点击菜单外部可以关闭菜单
const targetMoreMenu = useTemplateRef<HTMLElement>('targetMoreMenu')
const targetMoreMenuToggleShowButton = useTemplateRef<HTMLElement>(
  'targetMoreMenuToggleShowButton'
)
onClickOutside(targetMoreMenu, (event) => {
  // console.log(event)
  // 菜单未打开，直接返回
  if (targetMoreMenu == null || isShowMoreMenu.value === false) {
    return
  }
  // 点击正好是在菜单开关按钮上，直接返回
  if (
    targetMoreMenuToggleShowButton.value != null &&
    targetMoreMenuToggleShowButton.value?.contains(event.target as Node)
  ) {
    return
  }
  closeMoreMenu()
})

// 让加载动画至少显示1秒（转一圈），且转的圈数为整数
const { sourceHaveHold: chatRoomMessagesRestartFnRunningForAni } =
  useWatchSourceToHoldTimeAndStep({
    source: computed(() => props.chatRoomMessagesRestartFnRunning),
    holdMs: 1000,
    stepMs: 1000,
  })

// 动画进行时不能刷新
const chatRoomMessagesRestartFnWithDisableOnAni = () => {
  if (chatRoomMessagesRestartFnRunningForAni.value === true) {
    return
  }
  props.chatRoomMessagesRestartFn()
}

const i18nStore = useI18nStore()

const router = useRouter()
const { routerBackSafe } = useRouterHistoryTool()

const chatTopBarBack = () => {
  routerBackSafe({
    fallbackTo: routerDict.ChatHome.path,
  })
}

/** 是否为全局聊天 */
const isGlobalChat = computed(() => {
  if (props.roomId === '') {
    return true
  }
  return false
})
/** 房间信息 */
// const roomsGetOneQuery = useRoomsGetOneQuery({
//   roomId: computed(() => props.roomId),
// })

/** 房间标题 */
const roomTitle = computed(() => {
  // // 当前为全局聊天，返回全局聊天标题
  // if (isGlobalChat.value) {
  //   return i18nStore.t('chatTopBarGlobalChatTitle')()
  // }
  // // 房间信息有数据，返回房间标题
  // if (roomsGetOneQuery.data.value != null) {
  //   return roomsGetOneQuery.data.value.title
  // }
  // // 无数据，返回空字符串
  // return ''
  return props.chatTitle
})
</script>

<template>
  <!-- 聊天页顶栏 -->
  <div class="chat-top-bar relative">
    <!-- 展开菜单 -->
    <Transition name="fade-down-up">
      <div
        v-if="isShowMoreMenu"
        ref="targetMoreMenu"
        class="more-menu absolute top-0 z-[2] bg-color-background-soft"
      >
        <!-- 垫片 -->
        <div class="h-[50px]"></div>
        <!-- 聊天顶栏菜单项 插槽 -->
        <slot name="chatTopBarMoreMenu"></slot>
        <!-- 菜单项 刷新 -->
        <ChatTopBarMoreMenuItem
          :isRunning="chatRoomMessagesRestartFnRunningForAni"
          :isRunnable="chatRoomMessagesRestartFnRunnable"
          @click="chatRoomMessagesRestartFnWithDisableOnAni"
        >
          <template #icon>
            <RiRestartLine
              size="18px"
              :class="{
                'loading-spinner-1s': chatRoomMessagesRestartFnRunningForAni,
              }"
            ></RiRestartLine>
          </template>
          <template #text>
            {{ i18nStore.t('chatTopBarMoreMenuItemRestartText')() }}
          </template>
        </ChatTopBarMoreMenuItem>
        <!-- 收起 -->
        <div
          class="more-menu-close-button flow-root cursor-pointer select-none hover:bg-el-primary-light-4"
          @click="closeMoreMenu"
        >
          <div class="button-box flex items-center justify-center">
            <RiArrowUpWideLine size="20px"></RiArrowUpWideLine>
          </div>
        </div>
      </div>
    </Transition>
    <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
    <div
      class="pointer-events-none absolute bottom-[-0.5px] left-[-0.5px] right-[-0.5px] top-0 z-[4] rounded-b-[24px] border-2 border-color-background-soft"
    ></div>
    <div class="top-bar-box relative z-[3] flow-root bg-color-background-soft">
      <div class="">
        <!-- 顶栏 v-if="couldGoBack" -->
        <div class="flex items-center">
          <!-- 返回 -->
          <div
            v-if="couldGoBack"
            class="flex h-[40px] w-[48px] cursor-pointer items-center justify-center"
            @click="chatTopBarBack"
          >
            <RiArrowLeftSFill></RiArrowLeftSFill>
          </div>
          <!-- 返回按钮不存在时的垫片 v-else -->
          <div v-else class="w-[24px]"></div>
          <!-- 标题 -->
          <div class="flex-1 truncate">
            <div class="truncate text-[15px] font-bold text-color-text">
              {{ roomTitle }}
            </div>
          </div>
          <!-- 更多 -->
          <div
            ref="targetMoreMenuToggleShowButton"
            class="more-menu-toggle-show-button flex h-[40px] w-[48px] cursor-pointer items-center justify-center"
            :class="{
              'is-show-more-menu': isShowMoreMenu,
            }"
            @click="toggleShowMoreMenu"
          >
            <RiMore2Fill class="more-menu-icon"></RiMore2Fill>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar-box {
  border-radius: 0 0 24px 24px;
  box-shadow: 0 0 6px 6px var(--color-background);
}
.more-menu {
  border-radius: 0 0 24px 24px;
  box-shadow: 0 0 6px 6px var(--color-background);
  right: 24px;
  max-width: calc(100% - (2 * 24px));
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
}
.more-menu-toggle-show-button {
  .more-menu-icon {
    transition: all 300ms;
    transform: rotate(0);
  }
  &.is-show-more-menu {
    .more-menu-icon {
      transform: rotate(90deg);
    }
  }
}
.more-menu-close-button {
  .button-box {
    height: 24px;
  }
}
</style>
