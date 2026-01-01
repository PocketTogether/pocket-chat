<script setup lang="ts">
import { useAniStrIncreasingDecreasingSequentially } from '@/composables'
import type { ImageQueryModeMarkType } from './dependencies'
import { useI18nStore } from '@/stores'

const props = defineProps<{
  imageQueryTotalPages: number | null
  imageQueryMode: ImageQueryModeMarkType
  imageQuerySearch: string
  imageQueryPage: number
  imageQueryPageSet: (val: number) => void
}>()

// 计算属性：把外部传入的分页相关信息（总页数、模式、搜索条件）打包成一个对象
const imageQueryTotalPageInfo = computed(() => {
  return {
    imageQueryTotalPages: props.imageQueryTotalPages, // 当前查询的总页数
    imageQueryMode: props.imageQueryMode, // 当前查询模式
    imageQuerySearch: props.imageQuerySearch, // 当前搜索条件
  }
})

// 缓存上一次有效的分页信息，用 ref 保存
const cacheTotalPageInfo = ref(imageQueryTotalPageInfo.value)

// 监听分页信息变化，这里 不需要 deep: true
// 监听的是一个 computed 返回的对象，它每次都会生成一个新对象。所以无需深度监听
watch(imageQueryTotalPageInfo, (val) => {
  // 如果新的总页数为空（null），说明数据还没准备好，不更新缓存
  if (val.imageQueryTotalPages == null) {
    return
  }
  // 否则更新缓存为最新的分页信息
  cacheTotalPageInfo.value = val
})

// 计算属性：带缓存的总页数逻辑
const imageQueryTotalPagesWithCache = computed(() => {
  // 如果当前有有效总页数，或者模式/搜索条件发生变化
  if (
    imageQueryTotalPageInfo.value.imageQueryTotalPages != null || // 有新的总页数
    imageQueryTotalPageInfo.value.imageQueryMode !==
      cacheTotalPageInfo.value.imageQueryMode || // 模式切换
    imageQueryTotalPageInfo.value.imageQuerySearch !==
      cacheTotalPageInfo.value.imageQuerySearch // 搜索条件切换
  ) {
    // 返回当前的总页数（最新）
    return imageQueryTotalPageInfo.value.imageQueryTotalPages
  }
  // 否则返回缓存的总页数（避免显示加载中）
  return cacheTotalPageInfo.value.imageQueryTotalPages
})

// 分页栏加载时的字符串动画
const { text: pageBarAniStr } = useAniStrIncreasingDecreasingSequentially()

const i18nStore = useI18nStore()

const canGoPreviousPage = computed(() => {
  if (props.imageQueryTotalPages == null || props.imageQueryTotalPages <= 0) {
    return false
  }
  if (props.imageQueryPage - 1 <= 0) {
    return false
  }
  return true
})
const goPreviousPage = () => {
  if (canGoPreviousPage.value === false) {
    return
  }
  props.imageQueryPageSet(props.imageQueryPage - 1)
}

const canGoNextPage = computed(() => {
  if (props.imageQueryTotalPages == null || props.imageQueryTotalPages <= 0) {
    return false
  }
  if (props.imageQueryPage + 1 > props.imageQueryTotalPages) {
    return false
  }
  return true
})
const goNextPage = () => {
  if (canGoNextPage.value === false) {
    return
  }
  props.imageQueryPageSet(props.imageQueryPage + 1)
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
              v-if="imageQueryTotalPagesWithCache == null"
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
                    v-for="item in imageQueryTotalPagesWithCache"
                    :key="item"
                  >
                    <div
                      class="flex flex-shrink-0 cursor-pointer items-center transition-colors"
                      :class="{
                        'bg-el-primary-light-6': imageQueryPage === item,
                      }"
                      @click="imageQueryPageSet(item)"
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
                      {{ i18nStore.t('imagePagePaginationBarNoMoreText')() }}
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
