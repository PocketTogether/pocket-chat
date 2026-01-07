<script setup lang="ts">
import { ChatTopBarMoreMenuItem } from '@/components'
import { useRouterHistoryTool } from '@/composables'
import { routerDict } from '@/config'
import { onClickOutside } from '@vueuse/core'
import { useWatchSourceToHoldTimeAndStep } from '@/utils'
import { useI18nStore } from '@/stores'
import type { ImageInfoQueryDesuwaType } from './dependencies'

const props = defineProps<{
  pageTitle: string
  imageInfoQueryDesuwa: ImageInfoQueryDesuwaType
}>()

const { imageQueryRefresh, isImageQueryRefreshRunning } =
  props.imageInfoQueryDesuwa

// 让加载动画至少显示1秒（转一圈），且转的圈数为整数
const { sourceHaveHold: isImageQueryRefreshRunningForAni } =
  useWatchSourceToHoldTimeAndStep({
    source: computed(() => isImageQueryRefreshRunning.value),
    holdMs: 1000,
    stepMs: 1000,
  })

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

const { routerBackSafe } = useRouterHistoryTool()

const chatTopBarBack = () => {
  routerBackSafe({
    fallbackTo: routerDict.ChatHome.path,
  })
}

const i18nStore = useI18nStore()
</script>

<template>
  <div class="relative">
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
          :isRunning="isImageQueryRefreshRunningForAni"
          :isRunnable="true"
          @click="imageQueryRefresh"
        >
          <template #icon>
            <RiRestartLine
              size="18px"
              :class="{
                'loading-spinner-1s': isImageQueryRefreshRunningForAni,
              }"
            ></RiRestartLine>
          </template>
          <template #text>
            {{ i18nStore.t('imageInfoPageImageQueryRefreshText')() }}
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
      <div class="flex items-center">
        <!-- 返回 -->
        <div
          class="flex h-[40px] w-[48px] cursor-pointer items-center justify-center"
          @click="chatTopBarBack"
        >
          <RiArrowLeftSFill></RiArrowLeftSFill>
        </div>
        <!-- 标题 -->
        <div class="flex-1 truncate">
          <div class="truncate text-[15px] font-bold text-color-text">
            {{ pageTitle }}
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
  max-height: calc(100dvh - 100px);
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
