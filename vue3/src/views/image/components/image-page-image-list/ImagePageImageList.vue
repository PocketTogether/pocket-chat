<script setup lang="ts">
import { useImagePageListQuery } from '@/queries'
import type {
  ImageQueryModeDesuwaType,
  ImageQueryModeMarkType,
  ImageSelectListDesuwaType,
} from './dependencies'
import { useAuthStore } from '@/stores'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { dataProcessChunkArrayBalancedUtil } from '@/utils'
import { ImageListItem, PaginationBar } from './components'

const props = defineProps<{
  imageQueryModeDesuwa: ImageQueryModeDesuwaType
  imageSelectListDesuwa: ImageSelectListDesuwaType
}>()

const {
  //
  imageQueryMode,
  imageQuerySearch,
  imageQueryPage,
  imageQueryPageSet,
} = props.imageQueryModeDesuwa

const authStore = useAuthStore()

const imagePageListQuery = useImagePageListQuery({
  pageNum: computed(() => {
    // 未登录且image_my，则应为null，不查询
    if (
      (authStore.isValid === false || authStore.record?.id == null) &&
      imageQueryMode.value === 'image_my'
    ) {
      return null
    }
    return imageQueryPage.value
  }),
  authorId: computed(() => {
    if (imageQueryMode.value === 'image_all') {
      return null
    } else {
      // imageQueryMode.value === 'image_my'
      if (authStore.isValid === false || authStore.record?.id == null) {
        return null
      }
      return authStore.record.id
    }
  }),
  searchContent: computed(() => {
    if (imageQuerySearch.value === '') {
      return null
    }
    return imageQuerySearch.value
  }),
})

// 内容的数据，图片的个数
const imageItemsCountByQuery = computed(
  () => imagePageListQuery.data.value?.items.length ?? 0
)

// 缓存的用于高度计算的，图片的个数
const imageItemsCountByCache = ref(0)
// 缓存逻辑，当图片的个数变化
watch(
  imageItemsCountByQuery,
  (val) => {
    if (val <= 0) {
      return
    }
    imageItemsCountByCache.value = val
  },
  {
    immediate: true,
  }
)

// 将用于高度计算的，图片的个数
const imageItemsCountForHeightCalc = computed(() => {
  if (imageItemsCountByQuery.value > 0) {
    return imageItemsCountByQuery.value
  }
  return imageItemsCountByCache.value
})

const refContentBox = ref<HTMLElement | null>(null)
const sizeContentBox = useElementSize(refContentBox)

// 一行中应显示的个数
const imageItemsPerRowCalcFn = (width: number): number => {
  if (width >= 1800) return 10
  if (width >= 1600) return 9
  if (width >= 1400) return 8
  if (width >= 1200) return 7
  if (width >= 1000) return 6
  if (width >= 800) return 5
  if (width >= 600) return 4
  if (width >= 330) return 3
  return 2 // 默认最少 2
}
// 一行中应显示的个数
const imageItemsPerRow = computed(() => {
  return imageItemsPerRowCalcFn(sizeContentBox.width.value)
})

// 内容盒子应保持的高度，根据图片计算
const contentBoxHeightByItemsCountCalcFn = (
  width: number,
  itemNum: number,
  itemsPerRow: number
) => {
  // width 除以 itemsPerRow 得到 正常情况下item的宽度，即正常情况下item的高度（正常情况下宽度和高度一致）
  // itemNum 除以 itemsPerRow （可能要向上取整）得到 行数
  // 行数 乘 正常情况下item的高度 得到 应为的高度

  if (itemNum <= 0 || width <= 0) {
    return 0
  }

  // 每个 item 的宽度（正常情况下宽高一致）
  const itemSize = width / itemsPerRow

  // 行数，向上取整
  const rows = Math.ceil(itemNum / itemsPerRow)

  // 总高度 = 行数 * item 高度
  return rows * itemSize
}

const windowsSize = useWindowSize()

// 内容盒子应保持的高度，图片为0时，使用此默认高度
const contentBoxHeightByDefault = () => {
  // 外边距
  const m = 16 * 2
  // 分页栏
  const pageBar = 48
  // 边框、分割线
  const b = 3 * 3
  return windowsSize.height.value - (m + pageBar + b)
}
// 内容盒子应保持的高度
const contentBoxHeigh = computed(() => {
  const contentBoxHeightByItemsCount = contentBoxHeightByItemsCountCalcFn(
    sizeContentBox.width.value,
    imageItemsCountForHeightCalc.value,
    imageItemsPerRow.value
  )

  if (contentBoxHeightByItemsCount > 0) {
    return contentBoxHeightByItemsCount
  }
  return contentBoxHeightByDefault()
})

// 内容的数据，图片二维数组
const imageQueryDataMatrix = computed(() => {
  if (imagePageListQuery.data.value?.items == null) {
    return null
  }
  return dataProcessChunkArrayBalancedUtil(
    imagePageListQuery.data.value.items,
    imageItemsPerRow.value
  )
})

// 当 imageQueryDataMatrix 只有一行时，可能需要进行特殊的渲染，需要垫片，
// 此为垫片宽度占比 flex-<number>
const imageQueryDataMatrixOneRowGasket = computed(() => {
  if (imageQueryDataMatrix.value == null) {
    return null
  }
  if (imageQueryDataMatrix.value.length !== 1) {
    return null
  }
  if (imageQueryDataMatrix.value[0].length <= 0) {
    return null
  }

  // 第一行的数量
  const firstRowlength = imageQueryDataMatrix.value[0].length
  // 一行中应显示的个数
  // imageItemsPerRow
  // 计算 imageItemsPerRow 减 firstRowlength 得到一个值，判断其是否大于等于2
  const diff = imageItemsPerRow.value - firstRowlength
  if (diff < 2) {
    return null
  }
  return diff
})

// sizeContentBox.width.value 宽度
// imageItemsPerRow.value 行中最大个数

// 为用于渲染的数据 imageQueryDataMatrix 二维数组，计算尺寸，将传入 ImageListItem ，用于决定显示何种大小的图片
// 宽度 除以 行中最大个数 ，即为 每一项的高度（每一项正常情况下的宽度，正常情况下宽高一致）
// 宽度 除以 行中实际个数 ，即为 每一项的宽度
const imageQueryDataMatrixWithSize = computed(() => {
  const matrix = imageQueryDataMatrix.value
  const containerWidth = sizeContentBox.width.value
  const maxPerRow = imageItemsPerRow.value

  if (matrix == null || containerWidth <= 0 || maxPerRow <= 0) {
    return null
  }
  const itemHeight = containerWidth / maxPerRow

  return matrix.map((row) => {
    const rowCount = row.length
    if (rowCount <= 0) {
      return []
    }

    const itemWidth = (() => {
      // 特殊情况，单行、垫片，rowCount需要加上垫片的大小
      if (imageQueryDataMatrixOneRowGasket.value != null) {
        return (
          containerWidth / (rowCount + imageQueryDataMatrixOneRowGasket.value)
        )
      }
      // 正常情况
      return containerWidth / rowCount
    })()
    return row.map((item) => ({
      id: item.id,
      imageData: item,
      itemWidth: itemWidth,
      itemHeight: itemHeight,
    }))
  })
})
</script>

<template>
  <div>
    <!-- 图片显示 -->
    <div>
      <!-- 内容盒子，将获取其宽度，控制其高度 -->
      <div
        ref="refContentBox"
        class="transition-[height] duration-300"
        :style="{
          height: `${contentBoxHeigh}px`,
        }"
      >
        <Transition name="fade500ms" mode="out-in">
          <div
            v-if="refContentBox != null && sizeContentBox.width.value >= 0"
            class="h-full overflow-hidden rounded-t-[24px] border-[3px] border-transparent bg-color-background-soft"
          >
            <div class="relative h-full">
              <Transition name="fade" mode="out-in">
                <!-- 正常情况 -->
                <div
                  v-if="
                    imageQueryDataMatrixWithSize != null &&
                    imageQueryDataMatrixWithSize.length > 0 &&
                    imageQueryDataMatrixWithSize[0].length > 0 &&
                    imagePageListQuery.isFetching.value === false
                  "
                  :key="
                    imageQueryDataMatrixWithSize
                      .map((r) => r.map((i) => i.id).toString())
                      .toString()
                  "
                  class="flex h-full flex-col items-stretch"
                >
                  <template
                    v-for="(row, rowIndex) in imageQueryDataMatrixWithSize"
                    :key="row.map((i) => i.id).toString()"
                  >
                    <!-- 分割线 横向 -->
                    <div
                      v-if="rowIndex !== 0"
                      class="border-t-[3px] border-transparent"
                    ></div>
                    <!-- 行 -->
                    <div class="flex flex-1 items-stretch">
                      <template v-for="(item, index) in row" :key="item.id">
                        <!-- 分割线 -->
                        <div
                          v-if="index !== 0"
                          class="border-l-[3px] border-transparent"
                        ></div>
                        <!-- 列 -->
                        <div class="flex-1">
                          <ImageListItem
                            :imageData="item.imageData"
                            :itemWidth="item.itemWidth"
                            :itemHeight="item.itemHeight"
                            :imageSelectListDesuwa="imageSelectListDesuwa"
                          ></ImageListItem>
                        </div>
                      </template>
                      <!-- 特殊情况，只有一行且需垫片 -->
                      <div
                        v-if="imageQueryDataMatrixOneRowGasket != null"
                        :style="{
                          flex: `${imageQueryDataMatrixOneRowGasket}`,
                        }"
                        class="flex items-center justify-center"
                      >
                        <div class="text-color-background">
                          <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                          <RiMessage3Fill size="100px"></RiMessage3Fill>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
                <!-- 空白状态 由大小未加载引起 -->
                <div
                  v-else-if="
                    imageQueryDataMatrixWithSize == null &&
                    imagePageListQuery.isFetching.value === false
                  "
                  class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center"
                ></div>
                <!-- 无内容状态 由无内容引起 -->
                <div
                  v-else-if="
                    imageQueryDataMatrixWithSize != null &&
                    imageQueryDataMatrixWithSize.length <= 0 &&
                    imagePageListQuery.isFetching.value === false
                  "
                  class="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center"
                >
                  <div
                    class="h-[100px] w-[100px] overflow-hidden text-color-background"
                  >
                    <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                    <RiMessage3Fill size="100px"></RiMessage3Fill>
                  </div>
                </div>
                <!-- 加载状态 -->
                <div
                  v-else
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
    </div>
    <Transition name="fade500ms" mode="out-in">
      <div v-if="refContentBox != null && sizeContentBox.width.value >= 0">
        <!-- 分割线 横向 -->
        <div class="border-t-[3px] border-transparent"></div>
        <!-- 分页栏 -->
        <PaginationBar
          :imageQueryMode="imageQueryMode"
          :imageQuerySearch="imageQuerySearch"
          :imageQueryPage="imageQueryPage"
          :imageQueryPageSet="imageQueryPageSet"
          :imageQueryTotalPages="
            imagePageListQuery.data.value?.totalPages ?? null
          "
        ></PaginationBar>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped></style>
