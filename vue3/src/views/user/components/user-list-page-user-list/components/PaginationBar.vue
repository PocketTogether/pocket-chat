<script setup lang="ts">
import { useAniStrIncreasingDecreasingSequentially } from '@/composables'
import { useI18nStore } from '@/stores'
import type { UserPageSortModeType } from '@/api'

const props = defineProps<{
  userQueryTotalPages: number | null
  userQuerySortMode: UserPageSortModeType
  userQuerySearch: string
  userQueryPage: number
  userQueryPageSet: (val: number) => void
}>()

// 计算属性：把外部传入的分页相关信息（总页数、模式、搜索条件）打包成一个对象
const userQueryTotalPageInfo = computed(() => {
  return {
    userQueryTotalPages: props.userQueryTotalPages, // 当前查询的总页数
    userQuerySortMode: props.userQuerySortMode, // 当前查询模式
    userQuerySearch: props.userQuerySearch, // 当前搜索条件
  }
})

// 缓存上一次有效的分页信息，用 ref 保存
const cacheTotalPageInfo = ref(userQueryTotalPageInfo.value)

// 监听分页信息变化，这里 不需要 deep: true
// 监听的是一个 computed 返回的对象，它每次都会生成一个新对象。所以无需深度监听
watch(userQueryTotalPageInfo, (val) => {
  // 如果新的总页数为空（null），说明数据还没准备好，不更新缓存
  if (val.userQueryTotalPages == null) {
    return
  }
  // 否则更新缓存为最新的分页信息
  cacheTotalPageInfo.value = val
})

// 计算属性：带缓存的总页数逻辑
const userQueryTotalPagesWithCache = computed(() => {
  // 如果当前有有效总页数，或者模式/搜索条件发生变化
  if (
    userQueryTotalPageInfo.value.userQueryTotalPages != null || // 有新的总页数
    userQueryTotalPageInfo.value.userQuerySortMode !==
      cacheTotalPageInfo.value.userQuerySortMode || // 模式切换
    userQueryTotalPageInfo.value.userQuerySearch !==
      cacheTotalPageInfo.value.userQuerySearch // 搜索条件切换
  ) {
    // 返回当前的总页数（最新）
    return userQueryTotalPageInfo.value.userQueryTotalPages
  }
  // 否则返回缓存的总页数（避免显示加载中）
  return cacheTotalPageInfo.value.userQueryTotalPages
})

// 分页栏加载时的字符串动画
const { text: pageBarAniStr } = useAniStrIncreasingDecreasingSequentially()

const i18nStore = useI18nStore()

const canGoPreviousPage = computed(() => {
  if (props.userQueryTotalPages == null || props.userQueryTotalPages <= 0) {
    return false
  }
  if (props.userQueryPage - 1 <= 0) {
    return false
  }
  return true
})
const goPreviousPage = () => {
  if (canGoPreviousPage.value === false) {
    return
  }
  props.userQueryPageSet(props.userQueryPage - 1)
}

const canGoNextPage = computed(() => {
  if (props.userQueryTotalPages == null || props.userQueryTotalPages <= 0) {
    return false
  }
  if (props.userQueryPage + 1 > props.userQueryTotalPages) {
    return false
  }
  return true
})
const goNextPage = () => {
  if (canGoNextPage.value === false) {
    return
  }
  props.userQueryPageSet(props.userQueryPage + 1)
}
</script>

<template>
  <!-- 分页栏 -->
  <div>
    <div class="overflow-hidden rounded-b-[24px] bg-color-background-soft">
      <div class="flex items-stretch">
        <!-- 上一页 -->
        <div
          class="flex items-center"
          :class="{
            'cursor-pointer': canGoPreviousPage,
            'cursor-not-allowed': !canGoPreviousPage,
          }"
          @click="goPreviousPage"
        >
          <div class="mx-[12px] my-[12px]">
            <RiArrowLeftWideFill></RiArrowLeftWideFill>
          </div>
        </div>
        <div class="border-l-[3px] border-color-background"></div>
        <!-- 分页按钮栏 -->
        <div class="flex-1 overflow-hidden">
          <Transition name="fade" mode="out-in">
            <!-- 加载中 -->
            <div
              v-if="userQueryTotalPagesWithCache == null"
              class="flex h-full items-center justify-center"
            >
              <div class="select-none text-[18px] font-bold text-color-text">
                {{ pageBarAniStr }}
              </div>
            </div>
            <!-- 正常显示 -->
            <div v-else class="page-button-scrollbar flow-root h-full">
              <ElScrollbar
                height="100%"
                class=""
                :viewStyle="{
                  height: '100%',
                }"
              >
                <div class="flex h-full w-fit items-stretch">
                  <template
                    v-for="item in userQueryTotalPagesWithCache"
                    :key="item"
                  >
                    <div
                      class="flex flex-shrink-0 cursor-pointer items-center transition-colors"
                      :class="{
                        'bg-el-primary-light-6': userQueryPage === item,
                      }"
                      @click="userQueryPageSet(item)"
                    >
                      <div
                        class="mx-[12px] my-[12px] min-w-[24px] select-none text-center text-[16px] font-bold text-color-text"
                      >
                        {{ item }}
                      </div>
                    </div>
                    <div class="border-l-[3px] border-color-background"></div>
                  </template>
                  <!-- 没有更多了 -->
                  <div class="flex flex-shrink-0 items-center">
                    <div
                      class="mx-[24px] my-[12px] select-none text-center text-[14px] font-bold italic text-color-text-soft"
                    >
                      {{ i18nStore.t('userPagePaginationBarNoMoreText')() }}
                    </div>
                  </div>
                </div>
              </ElScrollbar>
            </div>
          </Transition>
        </div>
        <div class="border-l-[3px] border-color-background"></div>
        <!-- 下一页 -->
        <div
          class="flex items-center"
          :class="{
            'cursor-pointer': canGoNextPage,
            'cursor-not-allowed': !canGoNextPage,
          }"
          @click="goNextPage"
        >
          <div class="mx-[12px] my-[12px]">
            <RiArrowRightWideFill></RiArrowRightWideFill>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
