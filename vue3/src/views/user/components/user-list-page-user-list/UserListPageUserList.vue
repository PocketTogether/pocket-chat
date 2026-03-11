<script setup lang="ts">
import { useUserPageListQuery } from '@/queries'
import type { UserQueryModeDesuwaType } from './dependencies'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { PaginationBar } from './components'
import { watchUntilSourceCondition } from '@/utils'
import { UserListItem } from '@/components'

const props = defineProps<{
  userQueryModeDesuwa: UserQueryModeDesuwaType
}>()

const {
  //
  userQuerySortMode,
  userQuerySearch,
  userQueryPage,
  userQueryPageSet,
  userPageListQuery,
} = props.userQueryModeDesuwa

const windowsSize = useWindowSize()

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
  // 外边距
  const m = 16 * 2
  // 分页栏
  const pageBar = 48
  // 边框、分割线
  const b = 3
  // 顶栏
  const t = 40
  // 操作面板
  const c = 112

  const boxH = windowsSize.height.value - (t + m + c + b + pageBar + b)
  if (boxH < 400) {
    return 400
  }
  return boxH
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

const userPageListQueryDataValueOnSetupIsNotNull =
  userPageListQuery.data.value != null

const contentStyleHeight = computed(() => {
  // 已渲染完毕，transBoxHeight 即可
  if (isMountedForContent.value) {
    return `${transBoxHeight.value}px`
  }
  // 未渲染完毕，根据当亲查询是否有数据来判断
  else {
    // Setup时当前查询就有数据，可直接返回undefined，即高度直接随内容
    if (userPageListQueryDataValueOnSetupIsNotNull) {
      return undefined
    }
    // 当前查询无数据，返回高度，即默认高度
    return `${transBoxHeight.value}px`
  }
})
</script>

<template>
  <div>
    <!-- 用户显示 -->
    <div>
      <div>
        <div>
          <!-- 样式盒子 -->
          <div class="overflow-hidden bg-color-background-soft">
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
                  <!--
                  :key="
                      userPageListQuery.data.value.items
                        .map((i) => i.id)
                        .toString()
                    " -->
                  <div
                    v-if="userPageListQuery.data.value != null"
                    :key="
                      userPageListQuery.data.value.items
                        .map((i) => i.id)
                        .toString()
                    "
                  >
                    <div
                      v-for="item in userPageListQuery.data.value.items"
                      :key="item.id"
                    >
                      <div>
                        <UserListItem :userData="item"></UserListItem>
                      </div>
                      <!-- 分割线 -->
                      <div class="border-t-[3px] border-color-background"></div>
                    </div>
                    <!-- 当一页中消息过少时，显示占位高度 -->
                    <div v-if="userPageListQuery.data.value.items.length < 4">
                      <!-- 占位图标 -->
                      <div class="flex h-[200px] items-center justify-center">
                        <div
                          class="h-[100px] w-[100px] overflow-hidden text-color-background"
                        >
                          <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                          <RiMessage3Fill size="100px"></RiMessage3Fill>
                        </div>
                      </div>
                      <!-- 分割线 -->
                      <div class="border-t-[3px] border-color-background"></div>
                    </div>
                  </div>
                </Transition>
              </div>
              <!-- 加载遮罩 -->
              <Transition name="fade" mode="out-in">
                <div
                  v-if="
                    userPageListQuery.data.value == null ||
                    userPageListQuery.isFetching.value
                  "
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
          <div>
            <div class="relative">
              <div class="absolute bottom-0 left-0 right-0">
                <!-- 分割线 横向 -->
                <div class="border-t-[3px] border-color-background"></div>
              </div>
            </div>
            <!-- 分页栏 -->
            <PaginationBar
              :userQuerySortMode="userQuerySortMode"
              :userQuerySearch="userQuerySearch"
              :userQueryPage="userQueryPage"
              :userQueryPageSet="userQueryPageSet"
              :userQueryTotalPages="
                userPageListQuery.data.value?.totalPages ?? null
              "
            ></PaginationBar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
