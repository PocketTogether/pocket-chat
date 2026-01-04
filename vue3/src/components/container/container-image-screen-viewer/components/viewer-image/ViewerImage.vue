<script setup lang="ts">
import { useImage } from '@vueuse/core'
import { useViewerImageTransformDesuwa } from './composables'

const props = defineProps<{
  imageSrc: string
  stopOverlayJudge: () => void
  viewerAllSize: {
    windowWidth: number
    windowHeight: number
    contentWidth: number
    contentHeight: number
  }
}>()

const refImgEl = ref<HTMLImageElement | null>(null)
const { isLoading: isImageLoading } = useImage(() => {
  return {
    src: props.imageSrc,
  }
})

const allSize = computed(() => props.viewerAllSize)

const {
  transform,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,

  reset,
} = useViewerImageTransformDesuwa({ allSize })

defineExpose({
  isImageLoading,
})
</script>

<template>
  <div class="h-full w-full">
    <div
      class="img-box h-full w-full cursor-grab active:cursor-grabbing"
      :style="{ transform }"
      @mousedown.stop="stopOverlayJudge"
      @mouseup.stop="stopOverlayJudge"
      @wheel="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
    >
      <img
        ref="refImgEl"
        :src="imageSrc"
        class="h-full w-full select-none object-cover object-center"
        draggable="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
