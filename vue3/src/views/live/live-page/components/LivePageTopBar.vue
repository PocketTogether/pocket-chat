<script setup lang="ts">
import { useRouterHistoryTool } from '@/composables'
import { routerDict } from '@/config'
import { useI18nStore } from '@/stores'
import { onClickOutside } from '@vueuse/core'

const props = defineProps<{
  pageTitle: string
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
        <!-- 菜单项 首页 -->
        <ChatTopBarMoreMenuItem @click="$router.push(routerDict.ChatHome.path)">
          <template #icon>
            <RiHomeLine size="18px"></RiHomeLine>
          </template>
          <template #text> {{ i18nStore.t('pageHome')() }} </template>
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
  </div>
</template>

<style lang="scss" scoped></style>
