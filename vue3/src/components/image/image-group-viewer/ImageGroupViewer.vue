<script setup lang="ts">
import type { ImagesResponseWithBaseExpand } from '@/api'
import { ImageGroupItem } from './components'
import { imageCalcSingleRatioUtil } from '@/utils'
import { imageCalcSingleRatioOptionsConfig } from '@/config'

const props = defineProps<{
  imageList: ImagesResponseWithBaseExpand[]
  // 用于设置背景色
  bgTwcss?: string
}>()

// 支持 1 到 4 个图片
// 1个图片时，比例根据 imageWidth / imageHeight 计算，最大 2/1 最小 1/3，如果其中之一为0则默认为16/9
// 2、3、4个时，比例为 16/9
// 2个图片时，左1个，右1个
// 3个图片时，左1个，右2个
// 4个图片时，左2个，右2个

/**
 * 单图比例计算
 * - 最大 3/1 宽3 高1
 * - 最小 1/2 宽1 高2
 * - 宽或高为 0 → 默认 16/9
 */
function calcSingleRatio(img: {
  imageWidth: number
  imageHeight: number
}): number {
  return imageCalcSingleRatioUtil(img, imageCalcSingleRatioOptionsConfig)
}

/**
 * 多图固定比例：16/9
 */
function calcMultiRatio(): number {
  return 16 / 9
}

/**
 * 计算 aspectRatio
 */
const aspectRatio = computed(() => {
  const list = props.imageList
  const count = list.length

  if (count === 0) return 16 / 9

  if (count === 1) {
    return calcSingleRatio(list[0])
  }

  // 2、3、4 张图固定 16/9
  return calcMultiRatio()
})

/**
 * 计算布局结构
 * 返回：
 * {
 *   single?: ImagesResponseWithBaseExpand
 *   left?: ImagesResponseWithBaseExpand[],
 *   right?: ImagesResponseWithBaseExpand[]
 * }
 */
const layout = computed(() => {
  const list = props.imageList
  const count = list.length

  // 1 个 → single
  if (count === 1) {
    return { single: list[0] }
  }

  // 2 个 → 左 1 右 1
  if (count === 2) {
    return {
      left: [list[0]],
      right: [list[1]],
    }
  }

  // 3 个 → 左 1 右 2
  if (count === 3) {
    return {
      left: [list[0]],
      right: [list[1], list[2]],
    }
  }

  // 4 个 → 左 2 右 2
  if (count >= 4) {
    return {
      left: [list[0], list[2]],
      right: [list[1], list[3]],
    }
  }

  // 0 个 → 不显示
  return {}
})
</script>

<template>
  <div>
    <!-- 单图 -->
    <div v-if="layout.single != null" class="w-full" :style="{ aspectRatio }">
      <ImageGroupItem
        v-slot="{ imageItem }"
        :imageItem="layout.single"
        :bgTwcss="bgTwcss"
      >
        <slot :imageItem="imageItem"></slot>
      </ImageGroupItem>
    </div>

    <!-- 多图（2～4） -->
    <div
      v-else-if="layout.left != null && layout.right != null"
      class="w-full"
      :style="{ aspectRatio }"
    >
      <div class="flex h-full items-stretch">
        <!-- 左半 -->
        <div class="flex flex-1 flex-col">
          <template v-for="(img, index) in layout.left" :key="img.id">
            <div class="flex-1">
              <ImageGroupItem
                v-slot="{ imageItem }"
                :imageItem="img"
                :bgTwcss="bgTwcss"
              >
                <slot :imageItem="imageItem"></slot>
              </ImageGroupItem>
            </div>

            <!-- 左半内部的分割线 -->
            <div
              v-if="index !== layout.left.length - 1"
              class="border-t-[3px] border-transparent"
            ></div>
          </template>
        </div>

        <!-- 左右分割线 -->
        <div
          v-if="layout.right && layout.right.length > 0"
          class="border-l-[3px] border-transparent"
        ></div>

        <!-- 右半 -->
        <div class="flex flex-1 flex-col">
          <template v-for="(img, index) in layout.right" :key="img.id">
            <div class="flex-1">
              <ImageGroupItem
                v-slot="{ imageItem }"
                :imageItem="img"
                :bgTwcss="bgTwcss"
              >
                <slot :imageItem="imageItem"></slot>
              </ImageGroupItem>
            </div>

            <!-- 右半内部的分割线 -->
            <div
              v-if="index !== layout.right.length - 1"
              class="border-t-[3px] border-transparent"
            ></div>
          </template>
        </div>
      </div>
    </div>

    <!-- 无图片 -->
  </div>
</template>

<style lang="scss" scoped></style>
