<script setup lang="ts">
import type { ImagesResponseWithBaseExpand } from '@/api'
import { useDark } from '@vueuse/core'
import { ViewerBottomBar, ViewerImage, ViewerTopBar } from './components'
import { useViewerControlDesuwa, useViewerDisplayDesuwa } from './composables'
import { useElementOverlayClick } from '@/composables'

const props = withDefaults(
  defineProps<{
    imageList: ImagesResponseWithBaseExpand[]
    imageCurrentId: string
    /** 控制是否显示的值 */
    dialogVisible: boolean
    /**
     * 关闭方法，需要传入函数，才能让其点击遮罩时关闭，如
     * () => { dialogVisible.value = false }
     */
    dialogCloseFn: () => void
    /** 是否可以通过点击遮罩关闭，默认为true */
    closeOnClickOverlay?: boolean
  }>(),
  {
    closeOnClickOverlay: true,
  }
)
export type ViewerPropsType = typeof props

const isDark = useDark()

// 遮罩点击后判断是否需要关闭
const dialogOverlayOnClickFn = () => {
  if (props.closeOnClickOverlay === true) {
    props.dialogCloseFn()
  }
}

const { onOverlayDown, onOverlayUp, stopOverlayJudge } = useElementOverlayClick(
  {
    callback: dialogOverlayOnClickFn,
  }
)

const viewerDisplayDesuwa = useViewerDisplayDesuwa({
  props,
})
const {
  //
  viewerContentData,
  viewerImageData,
  viewerKeyUuid,
  viewerAllSize,
} = viewerDisplayDesuwa

const refViewerImage = ref<InstanceType<typeof ViewerImage> | null>(null)
export type RefViewerImageType = typeof refViewerImage

const viewerControlDesuwa = useViewerControlDesuwa({
  //
  props,
  viewerDisplayDesuwa,
  refViewerImage
})

const isImageLoading = computed(() => {
  if (refViewerImage.value == null) {
    return false
  }
  return refViewerImage.value.isImageLoading
})
</script>

<template>
  <Teleport to="body">
    <div>
      <Transition name="poto-container-dialog">
        <div
          v-show="dialogVisible"
          class="dialog-overlay fixed bottom-0 left-0 right-0 top-0 z-[30] overflow-hidden"
          :class="{
            // 明暗主题时的背景色稍有区别
            'bg-color-background-a80': !isDark,
            'bg-color-background-a90': isDark,
            'overlay-blur': true,
          }"
          @mousedown="onOverlayDown"
          @mouseup="onOverlayUp"
        >
          <div
            :key="imageCurrentId + viewerKeyUuid"
            class="relative h-full w-full"
          >
            <!-- 内容 居中 -->
            <Transition name="dialog-content-fade">
              <div
                v-show="dialogVisible"
                class="absolute bottom-0 left-0 right-0 top-0"
              >
                <div
                  v-if="viewerContentData != null && viewerAllSize != null"
                  class="relative h-full w-full"
                >
                  <Transition name="fade" mode="out-in">
                    <div
                      :key="viewerContentData.url"
                      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      :style="{
                        width: `${viewerContentData.width}px`,
                        height: `${viewerContentData.height}px`,
                      }"
                    >
                      <!-- 内容中的子元素负责位移与缩放 -->
                      <ViewerImage
                        ref="refViewerImage"
                        :imageSrc="viewerContentData.url"
                        :stopOverlayJudge="stopOverlayJudge"
                        :viewerAllSize="viewerAllSize"
                      ></ViewerImage>
                    </div>
                  </Transition>
                </div>
              </div>
            </Transition>
            <!-- 顶栏 -->
            <Transition name="fade-down-up" mode="out-in">
              <div
                v-if="viewerImageData != null && viewerImageData.alt !== ''"
                class="pointer-events-none absolute left-0 right-0 top-0"
              >
                <div class="mx-[8px]">
                  <div
                    class="pointer-events-auto mx-auto max-w-[500px]"
                    @mousedown.stop="stopOverlayJudge"
                    @mouseup.stop="stopOverlayJudge"
                  >
                    <ViewerTopBar
                      :viewerControlDesuwa="viewerControlDesuwa"
                      :viewerDisplayDesuwa="viewerDisplayDesuwa"
                    ></ViewerTopBar>
                  </div>
                </div>
              </div>
            </Transition>
            <!-- 底栏 -->
            <div class="pointer-events-none absolute bottom-0 left-0 right-0">
              <div class="mx-[8px]">
                <div
                  class="pointer-events-auto mx-auto w-fit"
                  @mousedown.stop="stopOverlayJudge"
                  @mouseup.stop="stopOverlayJudge"
                >
                  <ViewerBottomBar
                    :viewerControlDesuwa="viewerControlDesuwa"
                    :viewerDisplayDesuwa="viewerDisplayDesuwa"
                  ></ViewerBottomBar>
                </div>
              </div>
            </div>
            <!-- 加载状态 -->
            <Transition name="fade">
              <div
                v-show="isImageLoading"
                class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center"
              >
                <div
                  class="h-[50px] w-[50px] overflow-hidden text-color-text-soft"
                >
                  <RiLoader3Line
                    class="loading-spinner-800ms"
                    size="50px"
                  ></RiLoader3Line>
                </div>
              </div>
            </Transition>
          </div>
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
}

/* 遮罩进入：无 delay，立刻开始淡入 */
.poto-container-dialog-enter-from {
  opacity: 0;
}
.poto-container-dialog-enter-active {
  transition: opacity 0.3s;
}

/* 遮罩离开：延迟 再开始淡出 */
.poto-container-dialog-leave-to {
  opacity: 0;
}
.poto-container-dialog-leave-active {
  transition: opacity 0.3s;
  // transition-delay: 0.3s; /* ⭐ 关闭时遮罩比内容晚 */
}

/* 内容进入：延迟 再开始淡入 */
.dialog-content-fade-enter-from {
  opacity: 0;
}
.dialog-content-fade-enter-active {
  transition: opacity 0.3s;
  // transition-delay: 0.3s; /* ⭐ 打开时比遮罩晚 */
}

/* 内容离开：无 delay，立刻开始淡出 */
.dialog-content-fade-leave-to {
  opacity: 0;
}
.dialog-content-fade-leave-active {
  transition: opacity 0.3s;
}
</style>
