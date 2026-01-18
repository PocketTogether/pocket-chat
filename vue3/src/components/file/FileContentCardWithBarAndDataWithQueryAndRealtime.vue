<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { FileContentCardWithBar } from '.'
import { useFileDataWithQueryAndRealtimeDesuwa } from '@/composables'

const props = withDefaults(
  defineProps<{
    fileData: FilesResponseWithBaseExpand
    noIconColor?: boolean
  }>(),
  {
    noIconColor: false,
  }
)

const { fileDataWithQueryAndRealtime } = useFileDataWithQueryAndRealtimeDesuwa({
  fileData: computed(() => props.fileData),
})
</script>

<template>
  <FileContentCardWithBar
    :fileData="fileDataWithQueryAndRealtime"
    :noIconColor="noIconColor"
  ></FileContentCardWithBar>
</template>

<style lang="scss" scoped></style>
