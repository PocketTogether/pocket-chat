<script setup lang="ts">
// /* eslint vue/no-undef-components: "warn" */
import { useI18nStore } from '@/stores'
import {
  FileInfoControlPanel,
  FileInfoPageTopBar,
  FileInfoMessagesList,
} from './components'
import { useRoute, useRouter } from 'vue-router'
import { routerDict } from '@/config'
import { useFileInfoQueryDesuwa } from './composables'
import {
  useWatchSourceToHoldTime,
  useWatchSourceToHoldTimeAndStep,
} from '@/utils'

export type FileInfoRouteParamsType = typeof fileInfoRouteParams

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageFileInfo')()),
})

const route = useRoute()
const fileInfoRouteParams = computed(() => {
  const paramRawId = route.params[routerDict.FileInfoPage.paramsKey.id]
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

const fileInfoQueryDesuwa = useFileInfoQueryDesuwa({
  fileInfoRouteParams,
})
const {
  // 当前查询状态 "content" | "loading" | "none"
  fileInfoQueryStatus,
  filesGetOneQuery,
  fileInfoMessageListQuery,
  fileInfoDataWithRealtime,
} = fileInfoQueryDesuwa

const isFetching = computed(() => {
  return (
    filesGetOneQuery.isFetching.value ||
    fileInfoMessageListQuery.isFetching.value
  )
})
// 让加载动画至少显示300ms
const { sourceHaveHold: isFetchingForAni } = useWatchSourceToHoldTime({
  source: isFetching,
  holdMs: 500,
})

const router = useRouter()

// 清除路由中的查询参数，避免页面初始化时对话框就打开
const newQuery = { ...route.query }
delete newQuery['FileDeleteDialog']
router.replace({
  path: route.path,
  query: newQuery,
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
            <!-- 文件详情页顶栏 -->
            <FileInfoPageTopBar
              :pageTitle="i18nStore.t('pageFileInfo')()"
              :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
            ></FileInfoPageTopBar>
          </div>
          <!-- 内容 -->
          <div v-if="fileInfoQueryStatus === 'content'">
            <!-- 文件显示组件 -->
            <!-- <div class="mt-4">
              <FileInfoFileViewer
                :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
                :fileScreenViewerDesuwa="fileScreenViewerDesuwa"
              ></FileInfoFileViewer>
            </div> -->
            <!-- 文件详情显示、操作面板 -->
            <div class="mt-4">
              <FileInfoControlPanel
                :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
              ></FileInfoControlPanel>
            </div>
            <!-- 使用此文件的消息 -->
            <Transition name="fade" mode="out-in">
              <div
                v-if="
                  fileInfoMessageListQuery.data.value != null &&
                  fileInfoMessageListQuery.data.value.totalItems > 0
                "
                class="mt-4"
              >
                <!-- FileInfoMessagesList -->
                <FileInfoMessagesList
                  :fileInfoQueryDesuwa="fileInfoQueryDesuwa"
                ></FileInfoMessagesList>
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
          <div v-else-if="fileInfoQueryStatus === 'loading'">
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
          <!-- 文件不存在 -->
          <!-- <div v-else-if="fileInfoQueryStatus === 'none'"> -->
          <!-- <div v-else-if="fileInfoQueryStatus === 'isDeleted'"> -->
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
