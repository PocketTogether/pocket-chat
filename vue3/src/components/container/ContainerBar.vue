<script setup lang="ts">
/**
 * 底栏
 */
import { useElementSize, useWindowSize } from '@vueuse/core'

const props = defineProps<{
  /** bottomHeight测量的高度会有延时，如果需要立即测量滚动高度就会导致问题，此时可以通过此参数指定默认高度 */
  defaultBarHeight?: number
}>()

const refBarBottom = ref<HTMLElement | null>(null)
const { height: bottomHeight } = useElementSize(refBarBottom)

const bottomHeightWidthDefault = computed(() => {
  if (props.defaultBarHeight != null) {
    if (bottomHeight.value === 0) {
      return props.defaultBarHeight
    }
  }
  return bottomHeight.value
})
</script>

<template>
  <!-- 【旧】使用sticky bottom-0实现底栏，其需设置内容高度以保证底栏在底部，可能是因为这方面的原因导致其不稳定 -->
  <!-- <div class="container-bar">
    <div
      :style="{
        'min-height': `${windowHeight - bottomHeight}px`,
      }"
    >
      <slot></slot>
    </div>
    <div ref="refBarBottom" class="sticky bottom-0">
      <slot name="bar"></slot>
    </div>
  </div> -->
  <!-- 【250701】使用sticky top-0将一个屏幕高度的div固定，并在其中用绝对定位将底栏固定在底部 -->
  <!-- 需要使点击穿透固定的div -->
  <div class="container-bar relative">
    <!-- <div class="h-[3000px]">测试</div> -->
    <!-- 阻止 margin 塌陷 -->
    <div class="flow-root">
      <slot></slot>
    </div>
    <!-- 和底栏一样高的div，保证底栏滚动到底部时不会盖住内容 -->
    <div
      :style="{
        height: `${bottomHeightWidthDefault}px`,
      }"
    ></div>
    <!-- 不响应点击 -->
    <!-- 给 ContainerBar 的 z-index 设置为 10 class="z-10" -->
    <div class="pointer-events-none absolute top-0 z-10 h-full w-full">
      <!-- <div class="sticky top-0 h-screen"> -->
      <div class="sticky top-0 h-dvh">
        <div class="relative h-full">
          <!-- 响应点击 -->
          <div
            ref="refBarBottom"
            class="pointer-events-auto absolute bottom-0 w-full"
          >
            <slot name="bar"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
