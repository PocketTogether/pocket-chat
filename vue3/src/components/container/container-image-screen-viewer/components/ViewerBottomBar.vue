<script setup lang="ts">
import { pbImageDataChooseBySmallestWithUrl } from '@/utils'
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
  viewerImageSwitch,
  viewerClose,
} = props.viewerControlDesuwa

const {
  //
  viewerImageList,
  viewerImageData,
} = props.viewerDisplayDesuwa
</script>

<template>
  <div class="relative">
    <!-- bar-box 补丁，为解决firefox中盒子边缘与外阴影的缝隙问题 -->
    <div
      class="pointer-events-none absolute bottom-0 left-[-0.5px] right-[-0.5px] top-[-0.5px] z-[4] rounded-t-[24px] border-2 border-color-background-soft"
    ></div>
    <div
      class="bar-box relative z-[3] flow-root overflow-hidden bg-color-background-soft pb-1"
    >
      <div class="my-2 flex items-center">
        <!-- 图片选择 -->
        <div class="mx-4">
          <div class="flex items-center">
            <div v-for="item in viewerImageList" :key="item.id">
              <div
                class="mx-[4px] cursor-pointer overflow-hidden rounded-[4px]"
                @click="viewerImageSwitch(item.id)"
              >
                <div
                  class="h-[30px] w-[30px] bg-cover bg-center bg-no-repeat"
                  :style="{
                    backgroundImage: `url(${pbImageDataChooseBySmallestWithUrl(item).url})`,
                  }"
                >
                  <div
                    class="h-full w-full rounded-[4px] border-2"
                    :class="{
                      'border-el-primary': item.id === viewerImageData?.id,
                      'border-transparent': item.id !== viewerImageData?.id,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 关闭按钮 -->
        <div class="mr-2">
          <ElButton circle type="info" @click="viewerClose">
            <template #icon>
              <RiCloseFill></RiCloseFill>
            </template>
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bar-box {
  border-radius: 24px 24px 0 0;
  box-shadow:
  // 外阴影
    0 0 6px 6px var(--color-background);
  // // 内阴影
  // inset 0 0 0 3px var(--color-background-soft);
}
</style>
