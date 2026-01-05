<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type {
  ViewerControlDesuwaType,
  ViewerDisplayDesuwaType,
} from './dependencise'

const props = defineProps<{
  viewerControlDesuwa: ViewerControlDesuwaType
  viewerDisplayDesuwa: ViewerDisplayDesuwaType
}>()

const {
  //
  altOpen,
  altClose,
} = props.viewerControlDesuwa

const {
  //
  isAltOpen,
  viewerImageData,
} = props.viewerDisplayDesuwa

const i18nStore = useI18nStore()
</script>

<template>
  <div class="relative">
    <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
    <div
      class="pointer-events-none absolute bottom-[-0.5px] left-[-0.5px] right-[-0.5px] top-0 z-[4] rounded-b-[24px] border-2 border-color-background-soft"
    ></div>
    <div
      class="bar-box relative z-[3] flow-root overflow-hidden bg-color-background-soft pt-0"
    >
      <div
        class="bar-box-inset pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-[1]"
      ></div>
      <div class="flex items-stretch justify-between">
        <!-- 左 Alt 内容 -->
        <div class="ml-4 flex flex-1 items-center justify-center truncate">
          <div class="flex-1 truncate">
            <!-- 单行 -->
            <div
              v-if="!isAltOpen"
              class="ml-[6px] mr-2 truncate text-[15px] text-color-text"
            >
              {{ viewerImageData?.alt }}
            </div>
            <!-- 展开 -->
            <div v-else class="mr-[2px]">
              <ElScrollbar max-height="200px">
                <div
                  class="wrap-long-text my-3 ml-[6px] mr-[6px] min-h-[80px] text-[15px] text-color-text"
                >
                  {{ viewerImageData?.alt }}
                </div>
              </ElScrollbar>
            </div>
          </div>
        </div>
        <!-- 右 Alt 标题与按钮 -->
        <div class="my-2 mr-2 flex items-end">
          <div class="flex items-center">
            <template v-if="!isAltOpen">
              <div class="mr-2">
                <div class="select-none text-[14px] font-bold text-color-text">
                  {{ i18nStore.t('imageInfoPageAltTitle')() }}
                </div>
              </div>
              <div>
                <ElButton circle type="primary" @click="altOpen">
                  <template #icon>
                    <RiArrowDownLine></RiArrowDownLine>
                  </template>
                </ElButton>
              </div>
            </template>
            <template v-else>
              <div>
                <ElButton circle type="primary" @click="altClose">
                  <template #icon>
                    <RiArrowUpLine></RiArrowUpLine>
                  </template>
                </ElButton>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bar-box {
  border-radius: 0 0 24px 24px;
  box-shadow:
  // 外阴影
    0 0 6px 6px var(--color-background);
}
.bar-box-inset {
  border-radius: 0 0 24px 24px;
  box-shadow:
    // 内阴影
    inset 0 0 3px 5px var(--color-background-soft);
}
</style>
