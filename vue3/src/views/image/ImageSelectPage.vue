<script setup lang="ts">
import {
  ContainerBar,
  ContainerCol2,
  ContainerImageScreenViewer,
  IGVSoltAltLable,
  ImageGroupViewerWithQueryAndRealtime,
} from '@/components'
import {
  ImagePageBottomBar,
  ImagePageControlPanel,
  ImagePageImageList,
  ImagePageTopBar,
  ImagePageUploadList,
} from './components'
import { useAuthStore, useI18nStore, useUploadImageStore } from '@/stores'
import {
  useImageQueryModeDesuwa,
  useImageScreenViewerDesuwa,
  useImageSelectListDesuwa,
  useImageSelectPagePageRecoverDataDesuwa,
  useImageSelectPagePageRecoverDataSetOnLeave,
  useImageSelectPagePageRecoverScrollTop,
} from './composables'
import type { ImagesResponseWithBaseExpand } from '@/api'
import {
  imageCalcMaxWidthByRatioUtil,
  pbImageDataChooseByLargest,
} from '@/utils'
import {
  imageCalcMaxWidthByRatioSizeLimitHandlerConfig,
  imageCalcMaxWidthByRatioStepsOnImagePageConfig,
  imageCalcSingleRatioOptionsConfig,
  imageScreenViewerDialogQueryKey,
} from '@/config'
import { useWindowSize } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageImageSelect')()),
})

// 页面恢复数据获取
const imageSelectPagePageRecoverDataDesuwa =
  useImageSelectPagePageRecoverDataDesuwa()
const {
  //
  imageSelectPagePageRecoverData,
} = imageSelectPagePageRecoverDataDesuwa

// 封装 imageQueryMode 这一块（desuwa）
// useImageQueryModeDesuwa
const imageQueryModeDesuwa = useImageQueryModeDesuwa({
  imageSelectPagePageRecoverDataDesuwa,
})

// 封装 imageSelectList 这一块desuwa
// image-select-list
// useImageSelectListDesuwa
const imageSelectListDesuwa = useImageSelectListDesuwa({
  imageSelectPagePageRecoverDataDesuwa,
})
const {
  //
  imageSelectList,
} = imageSelectListDesuwa

// src\views\image\components\image-page-image-list\ImagePageImageList.vue
const refImagePageImageList = ref<InstanceType<
  typeof ImagePageImageList
> | null>(null)
export type RefImagePageImageListType = typeof refImagePageImageList

// 页面恢复 滚动恢复
useImageSelectPagePageRecoverScrollTop({
  imageSelectPagePageRecoverDataDesuwa,
  refImagePageImageList,
})

// 图片查看器这一块
const imageScreenViewerDesuwa = useImageScreenViewerDesuwa({
  //
  imageSelectPagePageRecoverDataDesuwa,
})
const {
  imageScreenViewerOpen,
  imageScreenViewerClose,
  imageScreenViewerVisible,
  imageScreenViewerImageList,
  imageScreenViewerImageCurrentId,
} = imageScreenViewerDesuwa

// 页面恢复数据收集 在组件离开时执行
useImageSelectPagePageRecoverDataSetOnLeave({
  imageQueryModeDesuwa,
  imageSelectListDesuwa,
  refImagePageImageList,
  imageScreenViewerDesuwa,
})

const uploadImageStore = useUploadImageStore()

const imageGroupMaxWidth = computed(() => {
  // 单个图片
  if (imageSelectList.value.length === 1) {
    const { width: imageWidth, height: imageHeight } =
      pbImageDataChooseByLargest(imageSelectList.value[0])

    return imageCalcMaxWidthByRatioUtil({
      imageWidth,
      imageHeight,
      imageCalcSingleRatioOptions: imageCalcSingleRatioOptionsConfig,
      steps: imageCalcMaxWidthByRatioStepsOnImagePageConfig,
      sizeLimitHandler: imageCalcMaxWidthByRatioSizeLimitHandlerConfig,
    })
  }
  // 多个图片（或没有），以16比9计算，不加 sizeLimitHandler
  else {
    return imageCalcMaxWidthByRatioUtil({
      imageWidth: 16,
      imageHeight: 9,
      imageCalcSingleRatioOptions: imageCalcSingleRatioOptionsConfig,
      steps: imageCalcMaxWidthByRatioStepsOnImagePageConfig,
    })
  }
})

const windowSize = useWindowSize()

const route = useRoute()
const router = useRouter()

// 如果有恢复数据，则不需要
if (imageSelectPagePageRecoverData == null) {
  // 清除路由中的查询参数，避免页面初始化时图片查看器就打开
  const newQuery = { ...route.query }
  delete newQuery[imageScreenViewerDialogQueryKey]
  router.replace({
    path: route.path,
    query: newQuery,
  })
}
</script>

<template>
  <div>
    <!-- 图片查看器 -->
    <ContainerImageScreenViewer
      :imageList="imageScreenViewerImageList"
      :imageCurrentId="imageScreenViewerImageCurrentId"
      :dialogVisible="imageScreenViewerVisible"
      :dialogCloseFn="imageScreenViewerClose"
    ></ContainerImageScreenViewer>
    <!-- 大屏 双列 -->
    <div v-if="windowSize.width.value >= 768" class="">
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{
          width: (() => {
            // 大于1024时左栏宽度较大，小于则左栏宽度较小
            if (windowSize.width.value >= 1024) {
              return `500px`
            }
            return `400px`
          })(),
        }"
        col1Twcss="flex-1 overflow-hidden"
      >
        <!-- 顶栏 底栏 操作面板 -->
        <template #col2>
          <div class="ml-6 mr-4">
            <ContainerBar :defaultBarHeight="60">
              <template #default>
                <div class="relative mb-4">
                  <div class="sticky top-0 z-[1] flow-root">
                    <!-- 图片页顶栏 -->
                    <ImagePageTopBar
                      :pageTitle="i18nStore.t('pageImageSelect')()"
                      :imageQueryModeDesuwa="imageQueryModeDesuwa"
                    ></ImagePageTopBar>
                  </div>
                  <!-- 操作面板 -->
                  <div class="mt-4">
                    <ImagePageControlPanel
                      :imageQueryModeDesuwa="imageQueryModeDesuwa"
                    ></ImagePageControlPanel>
                  </div>
                  <!-- <div class="my-4 h-[1200px] bg-red-950"></div> -->
                  <!-- 上传列表 -->
                  <Transition name="fade" mode="out-in">
                    <div
                      v-if="uploadImageStore.uploadRecordList.length > 0"
                      class="mt-4"
                    >
                      <ImagePageUploadList></ImagePageUploadList>
                    </div>
                  </Transition>
                  <!-- 图片预览 -->
                  <Transition name="fade" mode="out-in">
                    <div
                      v-if="imageSelectList.length > 0"
                      :key="imageSelectList.map((i) => i.id).toString()"
                      class="mt-4"
                    >
                      <div
                        class="mx-auto"
                        :style="{
                          maxWidth: `${imageGroupMaxWidth}px`,
                        }"
                      >
                        <div
                          class="overflow-hidden rounded-[20px] border-[3px] border-transparent bg-color-background-soft"
                        >
                          <ImageGroupViewerWithQueryAndRealtime
                            v-slot="{ imageItem, imageList }"
                            :imageList="imageSelectList"
                          >
                            <div
                              class="h-full cursor-pointer"
                              @click="
                                imageScreenViewerOpen({
                                  imageList: imageList,
                                  imageCurrentId: imageItem.id,
                                })
                              "
                            >
                              <IGVSoltAltLable
                                :imageItem="imageItem"
                              ></IGVSoltAltLable>
                            </div>
                          </ImageGroupViewerWithQueryAndRealtime>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>
              <template #bar>
                <div class="flow-root">
                  <!-- 图片页底栏 -->
                  <ImagePageBottomBar
                    :imageSelectListDesuwa="imageSelectListDesuwa"
                  ></ImagePageBottomBar>
                </div>
              </template>
            </ContainerBar>
          </div>
        </template>
        <!-- 图片列表 -->
        <template #col1>
          <div class="my-4 ml-2 mr-6">
            <ImagePageImageList
              ref="refImagePageImageList"
              :imageQueryModeDesuwa="imageQueryModeDesuwa"
              :imageSelectListDesuwa="imageSelectListDesuwa"
              :imageSelectPagePageRecoverDataDesuwa="
                imageSelectPagePageRecoverDataDesuwa
              "
            ></ImagePageImageList>
          </div>
        </template>
      </ContainerCol2>
    </div>
    <!-- 小屏 单列 -->
    <div v-else>
      <!-- 顶栏 底栏 操作面板 图片列表 -->
      <div class="mx-[8px]">
        <div
          class="mx-auto"
          :style="{
            maxWidth: '500px',
          }"
        >
          <ContainerBar :defaultBarHeight="52">
            <template #default>
              <div class="relative mb-4">
                <div class="sticky top-0 z-[1] flow-root">
                  <!-- 图片页顶栏 -->
                  <ImagePageTopBar
                    :pageTitle="i18nStore.t('pageImageSelect')()"
                    :imageQueryModeDesuwa="imageQueryModeDesuwa"
                  ></ImagePageTopBar>
                </div>
                <!-- 操作面板 -->
                <div class="mt-4">
                  <ImagePageControlPanel
                    :imageQueryModeDesuwa="imageQueryModeDesuwa"
                  ></ImagePageControlPanel>
                </div>
                <!-- 上传列表 -->
                <Transition name="fade" mode="out-in">
                  <div
                    v-if="uploadImageStore.uploadRecordList.length > 0"
                    class="mt-4"
                  >
                    <ImagePageUploadList></ImagePageUploadList>
                  </div>
                </Transition>
                <!-- 图片列表 -->
                <div class="mt-4">
                  <ImagePageImageList
                    ref="refImagePageImageList"
                    :imageQueryModeDesuwa="imageQueryModeDesuwa"
                    :imageSelectListDesuwa="imageSelectListDesuwa"
                    :imageSelectPagePageRecoverDataDesuwa="
                      imageSelectPagePageRecoverDataDesuwa
                    "
                  ></ImagePageImageList>
                </div>
              </div>
            </template>
            <template #bar>
              <div class="flow-root">
                <!-- 图片页底栏 -->
                <ImagePageBottomBar
                  :imageSelectListDesuwa="imageSelectListDesuwa"
                ></ImagePageBottomBar>
              </div>
            </template>
          </ContainerBar>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
