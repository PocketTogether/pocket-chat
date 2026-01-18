<script setup lang="ts">
import { useI18nStore } from '@/stores'
import {
  ImageInfoControlPanel,
  ImageInfoImageViewer,
  ImageInfoPageTopBar,
  ImageInfoMessagesList,
} from './components'
import { useRoute, useRouter } from 'vue-router'
import { imageScreenViewerDialogQueryKey, routerDict } from '@/config'
import {
  useImageInfoQueryDesuwa,
  useImageScreenViewerDesuwa,
} from './composables'
import {
  useWatchSourceToHoldTime,
  useWatchSourceToHoldTimeAndStep,
} from '@/utils'
import { ContainerImageScreenViewer } from '@/components'
import { useRouteControlDialog } from '@/composables'

export type ImageInfoRouteParamsType = typeof imageInfoRouteParams

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageImageInfo')()),
})

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
  imageInfoDataWithRealtime,
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

const imageScreenViewerDesuwa = useImageScreenViewerDesuwa()
const {
  imageScreenViewerOpen,
  imageScreenViewerClose,
  imageScreenViewerVisible,
} = imageScreenViewerDesuwa

const router = useRouter()

// 清除路由中的查询参数，避免页面初始化时图片查看器就打开
const newQuery = { ...route.query }
delete newQuery[imageScreenViewerDialogQueryKey]
delete newQuery['ImageDeleteDialog']
router.replace({
  path: route.path,
  query: newQuery,
})
</script>

<template>
  <div>
    <!-- 图片查看器 -->
    <ContainerImageScreenViewer
      v-if="imageInfoDataWithRealtime != null"
      :imageList="[imageInfoDataWithRealtime]"
      :imageCurrentId="imageInfoDataWithRealtime.id"
      :dialogVisible="imageScreenViewerVisible"
      :dialogCloseFn="imageScreenViewerClose"
    ></ContainerImageScreenViewer>
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
                :imageScreenViewerDesuwa="imageScreenViewerDesuwa"
              ></ImageInfoImageViewer>
            </div>
            <!-- 图片详情显示、操作面板 -->
            <div class="mt-2">
              <ImageInfoControlPanel
                :imageInfoQueryDesuwa="imageInfoQueryDesuwa"
              ></ImageInfoControlPanel>
            </div>
            <!-- 使用此图片的消息 -->
            <Transition name="fade" mode="out-in">
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
            </Transition>
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
