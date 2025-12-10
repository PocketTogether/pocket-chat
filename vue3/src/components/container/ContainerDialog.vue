<script setup lang="ts">
import { useDark, useElementSize, useWindowSize } from '@vueuse/core'
import type { ElScrollbar } from 'element-plus'

const props = withDefaults(
  defineProps<{
    /** 控制对话框是否显示的值 */
    dialogVisible: boolean
    /**
     * 对话框的关闭方法，需要传入函数，才能让其点击遮罩时关闭，如
     * () => { dialogVisible.value = false }
     */
    dialogCloseFn: () => void
    /** 是否可以通过点击遮罩关闭 Dialog，默认为true */
    closeOnClickOverlay?: boolean
    /** 垂直对齐比例，应为小于1的数字，0.5表示居中，默认为0.3，将据此设置动态的上边距 */
    verticalAlignRatio?: number
    /** 是否模糊遮遮罩，默认为true */
    overlayBlur?: boolean
    /** 是否半透明遮罩，为false即全透明，默认为true */
    overlayTranslucent?: boolean
    /** 对话框最大宽度 默认为500px*/
    dialogMaxWidth?: number
  }>(),
  {
    closeOnClickOverlay: true,
    verticalAlignRatio: 0.3,
    overlayBlur: true,
    overlayTranslucent: true,
    dialogMaxWidth: 500,
  }
)

const refElScrollbar = ref<null | InstanceType<typeof ElScrollbar>>(null)
defineExpose({
  refElScrollbar,
})

const isDark = useDark()

const refContentDiv = ref<HTMLElement | null>()
const { height: contentDivHeight } = useElementSize(refContentDiv)
const { height: windowHeight } = useWindowSize()
// 根据内容高度有动态的上边距
const contentMarginTop = computed(() => {
  if (contentDivHeight.value > windowHeight.value) {
    return 0
  }
  // 内容高度与屏幕高度之差
  const differenceHeight = windowHeight.value - contentDivHeight.value
  // 计算上边距，高度差乘小于1的数字，0.5即居中
  const calcMarginTop = differenceHeight * props.verticalAlignRatio
  return calcMarginTop
})

// 遮罩点击后判断是否需要关闭
const dialogOverlayOnClickFn = () => {
  if (props.closeOnClickOverlay === true) {
    props.dialogCloseFn()
  }
}
</script>

<template>
  <!-- Vue3内建组件Teleport，用于将某段模板内容渲染到 DOM 的其他位置（通常是 `document.body`），而不是当前组件的默认挂载点。 -->
  <Teleport to="body">
    <div class="poto-container-dialog">
      <Transition name="poto-container-dialog">
        <!-- 遮罩，点击遮罩时可以关闭对话框 -->
        <div
          v-show="dialogVisible"
          class="dialog-overlay fixed bottom-0 left-0 right-0 top-0 z-[30]"
          :class="{
            // 明暗主题时的背景色稍有区别
            'bg-color-background-a80': !isDark && overlayTranslucent,
            'bg-color-background-a90': isDark && overlayTranslucent,
            'overlay-blur': overlayBlur,
          }"
          @click="dialogOverlayOnClickFn"
        >
          <ElScrollbar height="100vh">
            <!-- 内容左右距屏幕最小16px -->
            <div class="mx-[16px]">
              <!-- 内容最大宽度500px，居中 -->
              <div
                class="mx-auto"
                :style="{
                  // 'max-width': '500px',
                  'max-width': `${dialogMaxWidth}px`,
                }"
              >
                <!-- 高度最小为屏幕高度，以实现如果内容高度较小就垂直居中 -->
                <!-- <div class="flex min-h-screen items-center">
                  <div class="flex-1 overflow-hidden">
                  </div>
                </div> -->
                <!-- 根据内容高度有动态的上边距 -->
                <div
                  :style="{
                    'margin-top': `${contentMarginTop}px`,
                  }"
                >
                  <!-- 内容上下距屏幕最小32px -->
                  <div class="my-[32px]">
                    <!-- 阻断这之中的点击向父级传递，内容中的点击不会传递到遮罩，以达到只有遮罩被点击时才关闭 -->
                    <div @click.stop>
                      <!-- 此div用于测量内容高度 -->
                      <div ref="refContentDiv" class="dialog-content">
                        <!-- 内容插槽 -->
                        <slot></slot>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElScrollbar>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.dialog-overlay {
  &.overlay-blur {
    backdrop-filter: blur(15px); /* 模糊背景内容 */
    -webkit-backdrop-filter: blur(15px); /* Safari 支持 */
  }
  transition: all 0.3s;
}
.dialog-content {
  transition: all 0.3s;
  transition-delay: 0.2s;
}

// .poto-container-dialog-leave-active,
// .poto-container-dialog-enter-active {
//   // transition: all 0.3s;
// }
.poto-container-dialog-enter-from,
.poto-container-dialog-leave-to {
  opacity: 0;
  .dialog-content {
    opacity: 0;
  }
}
</style>
