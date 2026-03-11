<script setup lang="ts">
import type { ElScrollbar } from 'element-plus'
import {
  useCc2fchContentMaxWidthPresetDesuwa,
  useCc2fchDataDesuwa,
  useCc2fchDragExpandCollapseDesuwa,
} from './composables'

// ---------------------------
// 数据、状态（持久化）这一块
// ---------------------------
const cc2fchDataDesuwa = useCc2fchDataDesuwa()
const { isExpandedVal, contentMaxWidthPresetVal } = cc2fchDataDesuwa

// ---------------------------
// contentMaxWidthPreset 这一块
// ---------------------------
const cc2fchContentMaxWidthPresetDesuwa = useCc2fchContentMaxWidthPresetDesuwa({
  cc2fchDataDesuwa,
})
const {
  contentMaxWidthPresetCanIncrease,
  contentMaxWidthPresetCanDecrease,
  contentMaxWidthPresetIncrease,
  contentMaxWidthPresetDecrease,
} = cc2fchContentMaxWidthPresetDesuwa

// ---------------------------
// 拖拽收放这一块
// ---------------------------
const cc2fchDragExpandCollapseDesuwa = useCc2fchDragExpandCollapseDesuwa({
  cc2fchDataDesuwa,
})
const {
  FIXED_LEFT_MARGIN,
  FIXED_RIGHT_MARGIN,
  FIXED_DRAG_AND_BUTTON,
  LEFT_EXTRA,

  finalWidth,
  dragging,
  onDragStart,

  collapse,
  expand,
} = cc2fchDragExpandCollapseDesuwa

// ---------------------------
// ElScrollbar 引用
// ---------------------------
const refElScrollbar = ref<null | InstanceType<typeof ElScrollbar>>(null)

defineExpose({
  refElScrollbar,
})
</script>

<template>
  <div>
    <div
      class="mx-auto"
      :style="{
        maxWidth: `${contentMaxWidthPresetVal}px`,
      }"
    >
      <div class="container-col2">
        <div class="flex">
          <!-- 边距占位 -->
          <div :style="{ width: `${FIXED_LEFT_MARGIN}px` }"></div>

          <!-- 左栏 -->
          <div
            v-show="isExpandedVal"
            :style="{ width: `${finalWidth + LEFT_EXTRA}px` }"
          >
            <div class="slot-col2-with-el-scrollbar sticky top-0 h-dvh">
              <ElScrollbar ref="refElScrollbar" height="100dvh">
                <div class="slot-col2 mr-[10px]">
                  <slot name="col2"></slot>
                </div>
              </ElScrollbar>
            </div>
          </div>

          <!-- 收起按钮 + 拖拽线（展开时显示） -->
          <div
            v-show="isExpandedVal"
            class="select-none"
            :style="{ width: `${FIXED_DRAG_AND_BUTTON}px` }"
          >
            <div class="sticky top-0 h-dvh">
              <div class="flex h-full items-stretch">
                <!-- 拖拽线这一块 -->
                <div class="w-[20px]">
                  <div
                    class="col-collapse-button-and-drag-line h-full cursor-ew-resize select-none"
                    draggable="false"
                    :class="{ 'is-dragging': dragging }"
                    @pointerdown="onDragStart"
                  >
                    <div class="relative h-full">
                      <!-- 拖拽线 -->
                      <div class="absolute inset-0">
                        <div class="flex h-full items-stretch justify-center">
                          <div class="flow-root">
                            <div
                              class="h-full border-l-[3px] border-el-primary"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <!-- 收起按钮 -->
                      <div class="absolute inset-0">
                        <div class="flex h-full items-center justify-center">
                          <div
                            class="h-[128px] cursor-default rounded-[8px] bg-el-primary"
                            @pointerdown.stop
                          >
                            <div class="flex h-full flex-col items-stretch">
                              <!-- 最大宽度增大按钮 -->
                              <template v-if="contentMaxWidthPresetCanIncrease">
                                <div
                                  class="cursor-pointer"
                                  @click="contentMaxWidthPresetIncrease"
                                >
                                  <div
                                    class="mb-[4px] mt-[5px] flex justify-center text-white"
                                  >
                                    <RiAddFill size="80%"></RiAddFill>
                                  </div>
                                </div>
                                <div
                                  class="border-t-[2px] border-color-background"
                                ></div>
                              </template>
                              <!-- 收起按钮 -->
                              <div
                                class="flex-1 cursor-pointer"
                                @click.stop="collapse"
                              >
                                <div class="flex h-full items-center">
                                  <div class="text-white">
                                    <RiArrowLeftWideFill
                                      size="100%"
                                    ></RiArrowLeftWideFill>
                                  </div>
                                </div>
                              </div>
                              <!-- 最大宽度减小按钮 -->
                              <template v-if="contentMaxWidthPresetCanDecrease">
                                <div
                                  class="border-t-[2px] border-color-background"
                                ></div>
                                <div
                                  class="cursor-pointer"
                                  @click="contentMaxWidthPresetDecrease"
                                >
                                  <div
                                    class="mb-[5px] mt-[4px] flex justify-center text-white"
                                  >
                                    <RiSubtractFill size="80%"></RiSubtractFill>
                                  </div>
                                </div>
                              </template>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 占位 -->
                <div class="flex-1"></div>
              </div>
            </div>
          </div>

          <!-- 右栏 -->
          <div class="min-w-0 flex-1">
            <div
              class="slot-col1"
              :class="{ 'mx-auto max-w-[768px]': !isExpandedVal }"
            >
              <slot name="col1"></slot>
            </div>
          </div>

          <!-- 边距占位 -->
          <div :style="{ width: `${FIXED_RIGHT_MARGIN}px` }"></div>
        </div>

        <!-- 展开按钮，固定定位 -->
        <div v-show="!isExpandedVal" class="fixed bottom-0 left-0 top-0">
          <div class="h-full w-[20px]">
            <div class="flex h-full items-center">
              <div
                class="h-[100px] cursor-pointer rounded-r-[16px] bg-el-primary-light-4 transition-colors hover:bg-el-primary"
                @click="expand"
              >
                <div class="flex h-full items-center">
                  <div class="text-white">
                    <RiArrowRightWideFill size="100%"></RiArrowRightWideFill>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container-col2 {
  :deep() {
    .slot-col2-with-el-scrollbar {
      .el-scrollbar__wrap {
        // 防止目标区域中的滚动触发父元素中的滚动
        overscroll-behavior: contain;
      }
    }
  }
}

.col-collapse-button-and-drag-line {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  // transition-delay: 200ms;

  opacity: 0;

  &:hover,
  &.is-dragging {
    opacity: 1;
  }
}
</style>
