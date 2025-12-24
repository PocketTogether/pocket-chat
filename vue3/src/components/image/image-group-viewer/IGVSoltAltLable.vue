<script setup lang="ts">
import type { ImagesResponseWithBaseExpand } from '@/api'
import { useI18nStore } from '@/stores'
// IGVSoltAltLable.vue
// 其用法是用于 ImageGroupViewer 的插槽中，加上它就根据其是否有alt来显示alt标签
const props = defineProps<{
  imageItem: ImagesResponseWithBaseExpand
}>()

const i18nStore = useI18nStore()
</script>

<template>
  <div class="flex h-full items-end justify-start">
    <div v-if="imageItem.alt !== ''" class="flow-root">
      <!-- <div v-if="1" class="flow-root"> -->
      <!-- 距离图片边的距离 -->
      <div class="border-x-[10px] border-y-[4px] border-transparent">
        <!-- alt标签背景色 -->
        <div class="flow-root rounded-full bg-black/50">
          <!-- 边距控制标签大小 -->
          <!-- mx-[7px] my-[2px] -->
          <!-- 边框控制大小 -->
          <!-- border-x-[7px] border-y-[2px] -->
          <!-- margin/padding 在小 px 下会出现不一致，而 border 却非常稳定。 -->
          <!-- 边框（border）在渲染时会被浏览器尽量对齐到物理像素（device pixel） -->
          <div class="border-x-[7px] border-y-[2px] border-transparent">
            <div class="select-none text-[10px] font-bold text-white">
              {{ i18nStore.t('imageShowAltLableText')() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
