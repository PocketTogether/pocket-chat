<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import type { ElScrollbar } from 'element-plus'
import type { StyleValue } from 'vue'

// 将默认值独立出来是因为这样才能有tailwind提示
// 默认居中
const defaultColContainerTwcss = 'justify-center'
// 默认一样宽
const defaultCol1Twcss = 'flex-1'
const defaultCol2Twcss = 'flex-1'

withDefaults(
  defineProps<{
    /**
     * 双列容器，通过tailwind类控制样式
     * ```
     * // 默认居中
     * const defaultColContainerTwcss = 'justify-center'
     * ```
     */
    colContainerTwcss?: string
    col1Twcss?: string
    col2Twcss?: string
    /**
     * col1 的位置，col1使用的是原生滚动条，col2是el滚动条
     */
    col1Position?: 'left' | 'right'
    /**
     * 不仅可以通过 Twcss（:class="...Twcss"） 的方式控制双列的样式，
     * 还可以通过 StyleValue（:style="...StyleValue"） 的方式控制双列的样式
     */
    col1StyleValue?: StyleValue
    col2StyleValue?: StyleValue
  }>(),
  {
    colContainerTwcss: defaultColContainerTwcss,
    col1Position: 'right',
    // col1Twcss: defaultCol1Twcss,
    // col2Twcss: defaultCol2Twcss,
    // 【251002】决定不设置默认值，避免与StyleValue冲突
    col1Twcss: undefined,
    col2Twcss: undefined,
    col1StyleValue: undefined,
    col2StyleValue: undefined,
  }
)

const refElScrollbar = ref<null | InstanceType<typeof ElScrollbar>>(null)

defineExpose({
  refElScrollbar,
})
</script>

<template>
  <div class="container-col2">
    <div class="flex" :class="colContainerTwcss">
      <div
        v-if="col1Position === 'left'"
        :class="col1Twcss"
        :style="col1StyleValue"
      >
        <div class="slot-col1">
          <slot name="col1"></slot>
        </div>
      </div>
      <div :class="col2Twcss" :style="col2StyleValue">
        <div class="slot-col2-with-el-scrollbar sticky top-0 h-dvh">
          <ElScrollbar ref="refElScrollbar" height="100dvh">
            <div class="slot-col2">
              <slot name="col2"></slot>
            </div>
          </ElScrollbar>
        </div>
      </div>
      <div
        v-if="col1Position === 'right'"
        :class="col1Twcss"
        :style="col1StyleValue"
      >
        <div class="slot-col1">
          <slot name="col1"></slot>
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
        /* 禁用滚动锚定 */
        // overflow-anchor: none;
      }
    }
  }
}
</style>
