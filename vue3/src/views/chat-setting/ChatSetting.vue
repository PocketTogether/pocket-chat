<script setup lang="ts">
import { PocketIconGroup } from '@/components'
import { SettingProfile } from './components'
import { useI18nStore } from '@/stores'
import { useRouterHistoryTool } from '@/composables'
import { routerDict } from '@/config'
import { useWindowSize } from '@vueuse/core'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageSetting')()),
})

const { routerBackSafe } = useRouterHistoryTool()

const chatTopBarBack = () => {
  routerBackSafe({
    fallbackTo: routerDict.ChatHome.path,
  })
}

const { width: windowWidth } = useWindowSize()

/** 窗口宽度大于1024时聊天栏宽度较大，小于则聊天栏宽度较小 */
const showChatWidthLargerTrueWidthSmallerFalse = computed(() => {
  if (windowWidth.value >= 1024) {
    return true
  }
  return false
})
</script>

<template>
  <div
    :class="{
      'mx-[40px]': showChatWidthLargerTrueWidthSmallerFalse,
      'mx-[8px]': !showChatWidthLargerTrueWidthSmallerFalse,
    }"
  >
    <div
      class="mx-auto"
      :class="{
        'max-w-[1280px]': showChatWidthLargerTrueWidthSmallerFalse,
        'max-w-[768px]': !showChatWidthLargerTrueWidthSmallerFalse,
      }"
    >
      <!-- 设置页顶栏 -->
      <div class="sticky top-0 z-[1] flow-root">
        <div class="relative">
          <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
          <div
            class="pointer-events-none absolute bottom-[-0.5px] left-[-0.5px] right-[-0.5px] top-0 z-[4] rounded-b-[24px] border-2 border-color-background-soft"
          ></div>
          <div
            class="top-bar-box relative z-[3] flow-root bg-color-background-soft"
          >
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
                <div
                  class="truncate text-center text-[15px] font-bold text-color-text"
                >
                  {{ i18nStore.t('pageSetting')() }}
                </div>
              </div>
              <!-- 垫片，为了让标题居中 -->
              <div class="h-[40px] w-[48px]"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-[20px]">
        <SettingProfile></SettingProfile>
      </div>
      <div class="mb-10 mt-4">
        <PocketIconGroup></PocketIconGroup>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar-box {
  border-radius: 0 0 24px 24px;
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
