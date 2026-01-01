<script setup lang="ts">
import { useI18nStore } from '@/stores'
import {
  ImageInfoControlPanel,
  ImageInfoImageViewer,
  ImageInfoPageTopBar,
  ImageInfoMessagesList,
} from './components'
import { useRoute } from 'vue-router'
import { routerDict } from '@/config'
import { useImageInfoQueryDesuwa } from './composables'
import {
  useWatchSourceToHoldTime,
  useWatchSourceToHoldTimeAndStep,
} from '@/utils'

export type ImageInfoRouteParamsType = typeof imageInfoRouteParams

const i18nStore = useI18nStore()

const route = useRoute()
const imageInfoRouteParams = computed(() => {
  const paramRawId = route.params[routerDict.ImageInfoPage.paramsKey.id]
  const id = (() => {
    if (typeof paramRawId === 'string') {
      return paramRawId
    }
    return null
  })()
  return {
    id: id,
  }
})

const imageInfoQueryDesuwa = useImageInfoQueryDesuwa({
  imageInfoRouteParams,
})
const {
  // 当前查询状态 "content" | "loading" | "none"
  imageInfoQueryStatus,
  imagesGetOneQuery,
  imageInfoMessageListQuery,
} = imageInfoQueryDesuwa

const isFetching = computed(() => {
  return (
    imagesGetOneQuery.isFetching.value ||
    imageInfoMessageListQuery.isFetching.value
  )
})
// 让加载动画至少显示300ms
const { sourceHaveHold: isFetchingForAni } = useWatchSourceToHoldTime({
  source: isFetching,
  holdMs: 500,
})
</script>

<template>
  <div>
    <!-- 边距控制 -->
    <div class="mx-[8px]">
      <div
        class="mx-auto"
        :style="{
          maxWidth: '500px',
        }"
      >
        <div class="relative">
          <!-- 顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <!-- 图片详情页顶栏 -->
            <ImageInfoPageTopBar
              :pageTitle="i18nStore.t('pageImageInfo')()"
              :imageInfoQueryDesuwa="imageInfoQueryDesuwa"
            ></ImageInfoPageTopBar>
          </div>
          <!-- 内容 -->
          <div v-if="imageInfoQueryStatus === 'content'">
            <!-- 图片显示组件 -->
            <div class="mt-4">
              <ImageInfoImageViewer
                :imageInfoQueryDesuwa="imageInfoQueryDesuwa"
              ></ImageInfoImageViewer>
            </div>
            <!-- 图片详情显示、操作面板 -->
            <div class="mt-2">
              <ImageInfoControlPanel
                :imageInfoQueryDesuwa="imageInfoQueryDesuwa"
              ></ImageInfoControlPanel>
            </div>
            <!-- 使用此图片的消息 -->
            <div
              v-if="
                imageInfoMessageListQuery.data.value != null &&
                imageInfoMessageListQuery.data.value.totalItems > 0
              "
              class="mt-4"
            >
              <!-- ImageInfoMessagesList -->
              <ImageInfoMessagesList
                :imageInfoQueryDesuwa="imageInfoQueryDesuwa"
              ></ImageInfoMessagesList>
            </div>
            <!-- 刷新时的占位指示，同时充当底部高度垫片 -->
            <div class="my-4">
              <div class="flex h-[40px] items-center justify-center">
                <Transition name="fade" mode="out-in">
                  <div
                    v-show="isFetchingForAni"
                    class="h-[40px] w-[40px] overflow-hidden text-color-text-soft"
                  >
                    <RiLoader3Line
                      class="loading-spinner-800ms"
                      size="40px"
                    ></RiLoader3Line>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
          <!-- 加载状态 -->
          <div v-else-if="imageInfoQueryStatus === 'loading'">
            <div class="flex h-[400px] items-center justify-center">
              <div
                class="h-[50px] w-[50px] overflow-hidden text-color-text-soft"
              >
                <RiLoader3Line
                  class="loading-spinner-800ms"
                  size="50px"
                ></RiLoader3Line>
              </div>
            </div>
          </div>
          <!-- 图片不存在 -->
          <!-- <div v-else-if="imageInfoQueryStatus === 'none'"> -->
          <!-- <div v-else-if="imageInfoQueryStatus === 'isDeleted'"> -->
          <div v-else>
            <div class="flex h-[400px] items-center justify-center">
              <div
                class="h-[100px] w-[100px] overflow-hidden text-color-background-soft"
              >
                <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                <RiMessage3Fill size="100px"></RiMessage3Fill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
