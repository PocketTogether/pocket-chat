<script setup lang="ts">
import {
  imageCalcMaxWidthByRatioUtil,
  pbImageDataChooseByLargest,
} from '@/utils'
import type {
  ImageInfoQueryDesuwaType,
  ImageScreenViewerDesuwaType,
} from './dependencies'
import {
  imageCalcMaxWidthByRatioSizeLimitHandlerConfig,
  imageCalcMaxWidthByRatioStepsOnImagePageConfig,
  imageCalcSingleRatioOptionsConfig,
} from '@/config'
import { IGVSoltAltLable, ImageGroupViewer } from '@/components'

const props = defineProps<{
  imageInfoQueryDesuwa: ImageInfoQueryDesuwaType
  imageScreenViewerDesuwa: ImageScreenViewerDesuwaType
}>()

const {
  //
  imagesGetOneQuery,
  imageInfoDataWithRealtime,
} = props.imageInfoQueryDesuwa

const {
  //
  imageScreenViewerOpen,
} = props.imageScreenViewerDesuwa

const imageViewerMaxWidth = computed(() => {
  if (imageInfoDataWithRealtime.value == null) {
    return undefined
  }
  const { width: imageWidth, height: imageHeight } = pbImageDataChooseByLargest(
    imageInfoDataWithRealtime.value
  )

  const maxWidthNum = imageCalcMaxWidthByRatioUtil({
    imageWidth,
    imageHeight,
    imageCalcSingleRatioOptions: imageCalcSingleRatioOptionsConfig,
    steps: imageCalcMaxWidthByRatioStepsOnImagePageConfig,
    sizeLimitHandler: imageCalcMaxWidthByRatioSizeLimitHandlerConfig,
  })
  return `${maxWidthNum}px`
})
</script>

<template>
  <div>
    <div v-if="imageInfoDataWithRealtime != null">
      <div
        class="mx-auto"
        :style="{
          maxWidth: imageViewerMaxWidth,
        }"
      >
        <div
          class="overflow-hidden rounded-[20px] border-[3px] border-transparent bg-color-background-soft"
        >
          <ImageGroupViewer
            v-slot="{ imageItem }"
            :imageList="[imageInfoDataWithRealtime]"
            bgTwcss="bg-color-background-mute"
          >
            <div
              class="h-full cursor-pointer"
              @click="
                () => {
                  imageScreenViewerOpen()
                  // console.log('imageItem', imageItem)
                }
              "
            >
              <IGVSoltAltLable :imageItem="imageItem"></IGVSoltAltLable>
            </div>
          </ImageGroupViewer>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
