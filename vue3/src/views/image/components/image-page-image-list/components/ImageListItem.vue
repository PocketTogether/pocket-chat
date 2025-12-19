<script setup lang="ts">
import type { ImagesResponseWithExpand } from '@/api'
import { pbImageDataChooseByTargetSizeWithUrl } from '@/utils'

const props = defineProps<{
  imageData: ImagesResponseWithExpand
  itemWidth: number
  itemHeight: number
}>()

// 当前是几倍屏：
const rawDpr = window.devicePixelRatio
// 避免极端情况下的问题，限制为3到1
const dpr = Math.min(3, Math.max(1, rawDpr))

const imageUrl = computed(() => {
  return pbImageDataChooseByTargetSizeWithUrl(props.imageData, {
    targetWidth: props.itemWidth * dpr,
    targetHeight: props.itemHeight * dpr,
  }).url
})
</script>

<template>
  <div
    class="h-full cursor-pointer bg-cover bg-center"
    :style="{
      backgroundImage: `url(${imageUrl})`,
    }"
  ></div>
</template>

<style lang="scss" scoped></style>
