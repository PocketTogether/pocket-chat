<script setup lang="ts">
import { useFilePageListQuery } from '@/queries'
import type {
  FileQueryModeDesuwaType,
  FileQueryModeMarkType,
  FileSelectListDesuwaType,
  FileSelectPagePageRecoverDataDesuwaType,
} from './dependencies'
import { useAuthStore } from '@/stores'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { dataProcessChunkArrayBalancedUtil } from '@/utils'
import { FileListItem, PaginationBar } from './components'

const props = defineProps<{
  fileQueryModeDesuwa: FileQueryModeDesuwaType
  fileSelectListDesuwa: FileSelectListDesuwaType
  fileSelectPagePageRecoverDataDesuwa: FileSelectPagePageRecoverDataDesuwaType
}>()

const {
  //
  fileQueryMode,
  fileQuerySearch,
  fileQueryPage,
  fileQueryPageSet,
  filePageListQuery,
} = props.fileQueryModeDesuwa

const { fileSelectPagePageRecoverData } =
  props.fileSelectPagePageRecoverDataDesuwa

const refContentBox = ref<HTMLElement | null>(null)
const sizeContentBox = useElementSize(refContentBox)

defineExpose({
  // // 父组件将等待这些数据，等待有内容高度，有内容高度才能初始化滚动
  // refContentBox,
  // sizeContentBox,
  // contentBoxHeigh,
})
</script>

<template>
  <div>
    <!-- 文件显示 -->
    <div>
      <!-- 样式盒子 -->
      <div class="overflow-hidden rounded-t-[24px] bg-color-background-soft">
        <!-- 高度过渡盒子 -->
        <div
          class="transition-[height] duration-300"
          :style="{
            height: `${400}px`,
          }"
        >
          <!-- 内容盒子 -->
        </div>
      </div>
    </div>
    <Transition name="fade500ms" mode="out-in">
      <div v-if="true">
        <!-- 分割线 横向 -->
        <div class="border-t-[3px] border-transparent"></div>
        <!-- 分页栏 -->
        <PaginationBar
          :fileQueryMode="fileQueryMode"
          :fileQuerySearch="fileQuerySearch"
          :fileQueryPage="fileQueryPage"
          :fileQueryPageSet="fileQueryPageSet"
          :fileQueryTotalPages="
            filePageListQuery.data.value?.totalPages ?? null
          "
        ></PaginationBar>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped></style>
