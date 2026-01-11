<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useViewerImageTransformDesuwa } from './composables'
import { v4 as uuidv4 } from 'uuid'

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

/**
 * 图片是否已成功加载
 */
const isLoaded = ref(false)
/**
 * 图片是否最终加载失败
 * - 当重试次数耗尽后置为 true
 * - 控制 <img> 是否继续渲染
 */
const isErrorFinal = ref(false)
/**
 * 当前已发生的加载失败次数
 * - 每次 onError 都会 +1
 * - 用于判断是否继续重试
 */
const imageLoadCountForErrorRetry = ref(0)
/**
 * 用于强制触发 <img> 重新渲染的 key
 * - 每次失败重试时生成新的 UUID
 * - Vue 会销毁旧 <img> 并创建新 <img>，从而触发浏览器重新加载
 */
const imageLoadKeyForErrorRetry = ref(uuidv4())

/**
 * 图片加载成功回调
 */
const onLoad = () => {
  isLoaded.value = true
}
/**
 * 图片加载失败回调（箭头函数）
 * - 增加失败计数
 * - 若未达到最大重试次数，则生成新的 key 触发重试
 * - 若达到最大次数，则标记为最终失败
 */
const onError = () => {
  imageLoadCountForErrorRetry.value += 1

  // 总共尝试 3 次（初次 + 2 次重试）
  if (imageLoadCountForErrorRetry.value < 3) {
    // 生成新的 key，强制 <img> 重新挂载 → 浏览器重新加载
    imageLoadKeyForErrorRetry.value = uuidv4()
  } else {
    // 重试耗尽，标记为最终失败
    isErrorFinal.value = true
  }
}

const allSize = computed(() => props.viewerAllSize)

const {
  transform,
  transition,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onPointerDown,
  reset,
} = useViewerImageTransformDesuwa({ allSize })

// 鼠标离开窗口时抬起时也触发onMouseUp
useEventListener(window, 'pointerup', onMouseUp)

const isImageLoading = computed(() => !isLoaded.value && !isErrorFinal.value)
const isImageError = computed(() => isErrorFinal.value)
defineExpose({
  isImageLoading,
  isImageError,
  reset,
})
</script>

<template>
  <div class="h-full w-full">
    <div
      class="img-box h-full w-full cursor-grab active:cursor-grabbing"
      :style="{
        transform,
        transition,
      }"
      @mousedown.stop="stopOverlayJudge"
      @mouseup.stop="stopOverlayJudge"
      @wheel="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @pointerdown="onPointerDown"
    >
      <img
        v-if="!isErrorFinal"
        :key="imageLoadKeyForErrorRetry"
        :src="imageSrc"
        class="h-full w-full select-none object-cover object-center"
        draggable="false"
        @load="onLoad"
        @error="onError"
      />
      <Transition name="fade">
        <div
          v-if="isErrorFinal"
          class="h-full w-full bg-color-background-soft"
        ></div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
