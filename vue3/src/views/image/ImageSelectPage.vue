<script setup lang="ts">
import {
  ContainerBar,
  ContainerCol2,
  IGVSoltAltLable,
  ImageGroupViewer,
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
  useImageSelectListDesuwa,
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
  imageGetDprFn,
} from '@/config'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageImageSelect')()),
})

// 封装 imageQueryMode 这一块（desuwa）
// useImageQueryModeDesuwa
const imageQueryModeDesuwa = useImageQueryModeDesuwa()

// 封装 imageSelectList 这一块desuwa
// image-select-list
// useImageSelectListDesuwa
const imageSelectListDesuwa = useImageSelectListDesuwa()
const {
  //
  imageSelectList,
} = imageSelectListDesuwa

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
</script>

<template>
  <div>
    <!-- 大屏 双列 -->
    <div class="">
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{
          width: '500px',
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
                          <ImageGroupViewer
                            v-slot="{ imageItem }"
                            :imageList="imageSelectList"
                            bgTwcss="bg-color-background-mute"
                          >
                            <div
                              class="h-full cursor-pointer"
                              @click="
                                () => {
                                  console.log('imageItem', imageItem)
                                }
                              "
                            >
                              <IGVSoltAltLable
                                :imageItem="imageItem"
                              ></IGVSoltAltLable>
                            </div>
                          </ImageGroupViewer>
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
              :imageQueryModeDesuwa="imageQueryModeDesuwa"
              :imageSelectListDesuwa="imageSelectListDesuwa"
            ></ImagePageImageList>
          </div>
        </template>
      </ContainerCol2>
    </div>
    <!-- 小屏 单列 -->
  </div>
</template>

<style lang="scss" scoped></style>
