<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { LiveListUserDesuwaType } from './dependencies'
import { useI18nStore } from '@/stores'
import { UserListItem } from '@/components'
import { routerDict } from '@/config'

const props = defineProps<{
  liveListUserDesuwa: LiveListUserDesuwaType
}>()

const {
  //
  isExpanded,
  toggleExpanded,
  userListForShow,
} = props.liveListUserDesuwa

const refContentBox = ref<HTMLElement | null>(null)
const sizeContentBox = useElementSize(refContentBox)

// 缓存内容高度
const transBoxHeightByCache = ref(0)
// 缓存逻辑，当内容高度变化
watch(
  sizeContentBox.height,
  (val) => {
    if (val < 10) {
      return
    }
    transBoxHeightByCache.value = val
  },
  {
    immediate: true,
  }
)

// 过渡盒子应保持的高度，为0时，使用此默认高度
const transBoxHeightByDefault = () => {
  return 200
}
// 过渡盒子的高度
const transBoxHeight = computed(() => {
  if (sizeContentBox.height.value > 10) {
    return sizeContentBox.height.value
  }
  if (transBoxHeightByCache.value > 10) {
    return transBoxHeightByCache.value
  }
  return transBoxHeightByDefault()
})

const isMountedForContent = ref(false)
onMounted(async () => {
  // 等待sizeContentBox有高度才算渲染完成
  // 不过即使加了这个也仍然不够，索性直接300ms算了
  // await watchUntilSourceCondition(
  //   computed(() => sizeContentBox.height.value > 10),
  //   (val) => val === true
  // )
  // await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 300))
  isMountedForContent.value = true
})

const userListForShowLengthOnSetupIsGtZero = userListForShow.value.length > 0

const contentStyleHeight = computed(() => {
  // 已渲染完毕，transBoxHeight 即可
  if (isMountedForContent.value) {
    return `${transBoxHeight.value}px`
  }
  // 未渲染完毕，根据当亲查询是否有数据来判断
  else {
    // Setup时当前查询就有数据，可直接返回undefined，即高度直接随内容
    if (userListForShowLengthOnSetupIsGtZero) {
      return undefined
    }
    // 当前查询无数据，返回高度，即默认高度
    return `${transBoxHeight.value}px`
  }
})

const i18nStore = useI18nStore()
</script>

<template>
  <div>
    <!-- 用户列表块 -->
    <div>
      <!-- 样式盒子 -->
      <div
        class="flow-root overflow-hidden rounded-t-[24px] bg-color-background-soft"
      >
        <!-- 高度过渡盒子 -->
        <div
          class="relative overflow-hidden transition-[height] duration-300"
          :style="{
            height: contentStyleHeight,
          }"
        >
          <!-- 内容盒子 -->
          <div ref="refContentBox">
            <Transition name="fade" mode="out-in">
              <!-- :key="userListForShow.map((i) => i.id).toString()" -->
              <div v-if="userListForShow.length > 0" class="relative">
                <TransitionGroup name="fade-300ms-list">
                  <div
                    v-for="item in userListForShow"
                    :key="item.id"
                    class="w-full"
                  >
                    <div>
                      <UserListItem :userData="item"></UserListItem>
                    </div>
                    <!-- 分割线 -->
                    <div class="border-t-[3px] border-color-background"></div>
                  </div>
                </TransitionGroup>
              </div>
            </Transition>
          </div>
          <!-- 加载遮罩 -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="userListForShow.length === 0"
              class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-color-background-soft"
            >
              <div
                class="h-[50px] w-[50px] overflow-hidden text-color-text-soft"
              >
                <RiLoader3Line
                  class="loading-spinner-800ms"
                  size="50px"
                ></RiLoader3Line>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <!-- 展开按钮块 -->
    <div>
      <div class="relative">
        <div class="absolute bottom-0 left-0 right-0">
          <!-- 分割线 横向 -->
          <div class="border-t-[3px] border-color-background"></div>
        </div>
      </div>
      <!-- 样式盒子 -->
      <div
        class="flow-root overflow-hidden rounded-b-[24px] bg-color-background-soft"
      >
        <div class="flex items-stretch">
          <!-- 全部（点击跳转至用户列表页） -->
          <div class="">
            <div
              class="flow-root h-full cursor-pointer select-none text-color-text"
              @click="$router.push(routerDict.UserListPage.path)"
            >
              <div class="flex h-full items-center">
                <div class="flex-1">
                  <div class="my-[8px] ml-[22px] mr-[20px] flex items-center">
                    <!-- 图标 -->
                    <div class="mr-[8px]">
                      <RiGroupLine size="18px"></RiGroupLine>
                    </div>
                    <!-- 文字 -->
                    <div>
                      <div class="text-[14px] font-bold">
                        {{ i18nStore.t('pageUserList')() }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 分割线 纵向 -->
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 展开或收起按钮 -->
          <div class="flex-1">
            <div
              class="flow-root h-full cursor-pointer select-none text-color-text"
              @click="toggleExpanded"
            >
              <div class="flex h-full items-center justify-center">
                <RiArrowUpWideLine
                  v-show="isExpanded"
                  size="25px"
                ></RiArrowUpWideLine>
                <RiArrowDownWideLine
                  v-show="!isExpanded"
                  size="25px"
                ></RiArrowDownWideLine>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
