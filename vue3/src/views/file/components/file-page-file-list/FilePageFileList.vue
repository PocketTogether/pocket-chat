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

console.log('fileSelectPagePageRecoverData', fileSelectPagePageRecoverData)

const windowsSize = useWindowSize()

const refLayoutBox = ref<HTMLElement | null>(null)
const sizeLayoutBox = useElementSize(refLayoutBox)

const layoutBoxWidth = computed(() => {
  if (sizeLayoutBox.width.value <= 0) {
    return fileSelectPagePageRecoverData?.data.layoutBoxWidth ?? 0
  }
  return sizeLayoutBox.width.value
})

const refContentBox = ref<HTMLElement | null>(null)
const sizeContentBox = useElementSize(refContentBox)

// 缓存内容高度
const transBoxHeightByCache = ref(0)
// 缓存逻辑，当内容高度变化
watch(
  sizeContentBox.height,
  (val) => {
    if (val < 10) {
      return
    }
    transBoxHeightByCache.value = val
  },
  {
    immediate: true,
  }
)

// 过渡盒子应保持的高度，为0时，使用此默认高度
const transBoxHeightByDefault = () => {
  // 外边距
  const m = 16 * 2
  // 分页栏
  const pageBar = 48
  // 边框、分割线
  const b = 3
  return windowsSize.height.value - (m + pageBar + b)
}
// 过渡盒子的高度
const transBoxHeight = computed(() => {
  if (sizeContentBox.height.value > 10) {
    return sizeContentBox.height.value
  }
  if (transBoxHeightByCache.value > 10) {
    return transBoxHeightByCache.value
  }
  const transBoxHeightByPageRecoverData =
    fileSelectPagePageRecoverData?.data.transBoxHeight
  if (
    transBoxHeightByPageRecoverData != null &&
    transBoxHeightByPageRecoverData > 10
  ) {
    return transBoxHeightByPageRecoverData
  }
  return transBoxHeightByDefault()
})

defineExpose({
  transBoxHeight,
  layoutBoxWidth,
})
</script>

<template>
  <div>
    <!-- 文件显示 -->
    <!-- 布局盒子，获取宽度 -->
    <div ref="refLayoutBox">
      <Transition name="fade800ms" mode="out-in">
        <div v-if="layoutBoxWidth > 0">
          <!-- 样式盒子 -->
          <div
            class="overflow-hidden rounded-t-[24px] bg-color-background-soft"
          >
            <!-- 高度过渡盒子 -->
            <div
              class="relative overflow-hidden transition-[height] duration-300"
              :style="{
                height: `${transBoxHeight}px`,
              }"
            >
              <!-- 内容盒子 -->
              <div ref="refContentBox">
                <Transition name="fade" mode="out-in">
                  <!--
                  :key="
                      filePageListQuery.data.value.items
                        .map((i) => i.id)
                        .toString()
                    " -->
                  <div
                    v-if="filePageListQuery.data.value != null"
                    :key="
                      filePageListQuery.data.value.items
                        .map((i) => i.id)
                        .toString()
                    "
                  >
                    <div
                      v-for="(item, index) in filePageListQuery.data.value
                        .items"
                      :key="item.id"
                    >
                      <!-- 分割线 -->
                      <div
                        v-if="index > 0"
                        class="border-t-[3px] border-color-background"
                      ></div>
                      <div>
                        <FileListItem
                          :fileData="item"
                          :fileSelectListDesuwa="fileSelectListDesuwa"
                          :layoutBoxWidth="layoutBoxWidth"
                        ></FileListItem>
                      </div>
                    </div>
                    <!-- 当一页中消息过少时，显示占位高度 -->
                    <div v-if="filePageListQuery.data.value.items.length < 4">
                      <!-- 分割线 -->
                      <div
                        v-if="filePageListQuery.data.value.items.length > 0"
                        class="border-t-[3px] border-color-background"
                      ></div>
                      <!-- 占位图标 -->
                      <div class="flex h-[200px] items-center justify-center">
                        <div
                          class="h-[100px] w-[100px] overflow-hidden text-color-background"
                        >
                          <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                          <RiMessage3Fill size="100px"></RiMessage3Fill>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
              <!-- 分割线 横向 -->
              <div
                v-if="
                  filePageListQuery.data.value != null &&
                  filePageListQuery.data.value.items.length >= 4
                "
                class="border-t-[3px] border-color-background"
              ></div>
              <!-- 加载遮罩 -->
              <Transition name="fade" mode="out-in">
                <div
                  v-if="
                    filePageListQuery.data.value == null ||
                    filePageListQuery.isFetching.value
                  "
                  class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-color-background-soft"
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
          <div>
            <!-- 分割线 横向 -->
            <div class="border-t-[3px] border-color-background"></div>
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
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
