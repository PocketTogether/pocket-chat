<script setup lang="ts">
import { useI18nStore } from '@/stores'
import { MessagesListItem } from './components'
import type { FileInfoQueryDesuwaType } from './dependencies'

const props = defineProps<{
  fileInfoQueryDesuwa: FileInfoQueryDesuwaType
}>()

const {
  //
  fileInfoMessageListQuery,
  fileInfoMessageListPageNum,
  fileInfoMessageListPageSet,
} = props.fileInfoQueryDesuwa

// 分页控制
const canGoPreviousPage = computed(() => {
  if (
    fileInfoMessageListQuery.data.value?.totalPages == null ||
    fileInfoMessageListQuery.data.value?.totalPages <= 0
  ) {
    return false
  }
  if (fileInfoMessageListPageNum.value - 1 <= 0) {
    return false
  }
  return true
})
const goPreviousPage = () => {
  if (canGoPreviousPage.value === false) {
    return
  }
  fileInfoMessageListPageSet(fileInfoMessageListPageNum.value - 1)
}
const canGoNextPage = computed(() => {
  if (
    fileInfoMessageListQuery.data.value?.totalPages == null ||
    fileInfoMessageListQuery.data.value?.totalPages <= 0
  ) {
    return false
  }
  if (
    fileInfoMessageListPageNum.value + 1 >
    fileInfoMessageListQuery.data.value?.totalPages
  ) {
    return false
  }
  return true
})
const goNextPage = () => {
  if (canGoNextPage.value === false) {
    return
  }
  fileInfoMessageListPageSet(fileInfoMessageListPageNum.value + 1)
}

const i18nStore = useI18nStore()
</script>

<template>
  <div v-if="fileInfoMessageListQuery.data.value != null">
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 标题栏 -->
      <div class="mx-[8px] my-[8px]">
        <div class="flex items-center justify-between">
          <!-- 左 标题 -->
          <div class="ml-[12px] flex-1 truncate">
            <div
              class="select-none truncate pr-1 text-[14px] font-bold text-color-text"
            >
              {{ i18nStore.t('fileInfoPageMessageListTitle')() }}
            </div>
          </div>
          <!-- 右 个数 -->
          <div>
            <div class="flex items-center">
              <div class="select-none text-[14px] font-bold text-color-text">
                {{ fileInfoMessageListQuery.data.value.totalItems }}
              </div>
              <div class="ml-[0px]">
                <div class="flow-root">
                  <div class="m-[4px] text-color-text">
                    <RiMessage3Line size="20px"></RiMessage3Line>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 列表 -->
      <div class="relative">
        <!-- 消息项 -->
        <div
          v-for="item in fileInfoMessageListQuery.data.value.items"
          :key="item.id"
        >
          <!-- 分割线 -->
          <div class="border-t-[3px] border-color-background"></div>
          <MessagesListItem :messageItem="item"></MessagesListItem>
        </div>
        <!-- 当一页中消息过少时，显示占位高度 -->
        <div
          v-if="
            fileInfoMessageListQuery.data.value.totalPages > 1 &&
            fileInfoMessageListQuery.data.value.items.length < 2
          "
        >
          <!-- 分割线 -->
          <div class="border-t-[3px] border-color-background"></div>
          <div class="flex h-[150px] items-center justify-center">
            <div
              class="h-[100px] w-[100px] overflow-hidden text-color-background"
            >
              <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
              <RiMessage3Fill size="100px"></RiMessage3Fill>
            </div>
          </div>
        </div>
        <!-- 加载时的遮罩 -->
        <!-- <Transition name="fade500ms" mode="out-in">
          <div
            v-if="
              fileInfoMessageListQuery.isFetching.value === true &&
              // 有足够空间时才显示
              fileInfoMessageListQuery.data.value.totalItems >= 2
            "
            class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-color-background-soft"
          >
            <div class="h-[50px] w-[50px] overflow-hidden text-color-text-soft">
              <RiLoader3Line
                class="loading-spinner-800ms"
                size="50px"
              ></RiLoader3Line>
            </div>
          </div>
        </Transition> -->
      </div>
      <!-- 分页栏在需要时才显示 -->
      <template v-if="fileInfoMessageListQuery.data.value.totalPages > 1">
        <!-- 分割线 -->
        <div class="border-t-[3px] border-color-background"></div>
        <!-- 分页栏 -->
        <div>
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
              <div class="mx-[10px] my-[10px]">
                <RiArrowLeftWideFill size="24px"></RiArrowLeftWideFill>
              </div>
            </div>
            <div class="border-l-[3px] border-color-background"></div>
            <!-- 分页按钮栏 -->
            <div class="flex-1 overflow-hidden">
              <div class="page-button-scrollbar flow-root h-full">
                <ElScrollbar
                  height="100%"
                  class=""
                  :viewStyle="{
                    height: '100%',
                  }"
                >
                  <div class="flex h-full w-fit items-stretch">
                    <template
                      v-for="item in fileInfoMessageListQuery.data.value
                        .totalPages"
                      :key="item"
                    >
                      <div
                        class="flex flex-shrink-0 cursor-pointer items-center transition-colors"
                        :class="{
                          'bg-el-primary-light-6':
                            fileInfoMessageListPageNum === item,
                        }"
                        @click="fileInfoMessageListPageSet(item)"
                      >
                        <div
                          class="mx-[10px] my-[10px] min-w-[24px] select-none text-center text-[16px] font-bold text-color-text"
                        >
                          {{ item }}
                        </div>
                      </div>
                      <div class="border-l-[3px] border-color-background"></div>
                    </template>
                    <!-- 没有更多了 -->
                    <div class="flex flex-shrink-0 items-center">
                      <div
                        class="mx-[24px] my-[10px] select-none text-center text-[14px] font-bold italic text-color-text-soft"
                      >
                        {{ i18nStore.t('filePagePaginationBarNoMoreText')() }}
                      </div>
                    </div>
                  </div>
                </ElScrollbar>
              </div>
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
              <div class="mx-[10px] my-[10px]">
                <RiArrowRightWideFill size="24px"></RiArrowRightWideFill>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
