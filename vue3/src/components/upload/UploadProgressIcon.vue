<script setup lang="ts">
const props = defineProps<{
  // 0-100 的数字（百分比）
  percentage: number | null
  size?: string
}>()

/**
 * 将 0-100 的百分比映射为 1-8 档位。
 * 当 null 时，直接显示第 8 档。
 * 档位边界采用等分（12.5% 一档），用上界闭区间更直观。
 */
const progressStep = computed<number>(() => {
  const p = props.percentage
  if (p == null) {
    return 8
  }
  if (p <= 12) return 1
  if (p <= 25) return 2
  if (p <= 37) return 3
  if (p <= 50) return 4
  if (p <= 62) return 5
  if (p <= 75) return 6
  if (p <= 87) return 7
  return 8
})
</script>

<template>
  <!-- 用 v-if 显示不同图标，无动态组件 -->
  <RiProgress1Line v-if="progressStep === 1" :size="size" />
  <RiProgress2Line v-else-if="progressStep === 2" :size="size" />
  <RiProgress3Line v-else-if="progressStep === 3" :size="size" />
  <RiProgress4Line v-else-if="progressStep === 4" :size="size" />
  <RiProgress5Line v-else-if="progressStep === 5" :size="size" />
  <RiProgress6Line v-else-if="progressStep === 6" :size="size" />
  <RiProgress7Line v-else-if="progressStep === 7" :size="size" />
  <RiProgress8Line v-else :size="size" />
</template>

<style lang="scss" scoped></style>
