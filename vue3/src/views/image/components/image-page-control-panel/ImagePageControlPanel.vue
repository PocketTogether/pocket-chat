<script setup lang="ts">
import type {
  ImageQueryModeDesuwaType,
  ImageQueryModeMarkType,
} from './dependencies'
import { PanelImageUploader } from './components'
import { useAuthStore, useI18nStore } from '@/stores'
import { useImagePageListQuery } from '@/queries'
import { useAniStrIncreasingDecreasingSequentially } from '@/composables'

const props = defineProps<{
  imageQueryModeDesuwa: ImageQueryModeDesuwaType
}>()

const {
  imageQueryMode,
  canImageQueryModeSetToImageAll,
  imageQueryModeSetToImageAll,
  canImageQueryModeSetToImageMy,
  imageQueryModeSetToImageMy,
  imageQuerySearch,
  imageQuerySearchSet,
} = props.imageQueryModeDesuwa

const i18nStore = useI18nStore()

const searchInputContent = ref(imageQuerySearch.value)

// 是否能 搜索框开始查询
const canSearchInputContentSetToImageQuerySearch = computed(() => {
  if (imageQuerySearch.value === searchInputContent.value) {
    return false
  }
  return true
})
// 搜索框开始查询
const searchInputContentSetToImageQuerySearch = () => {
  if (canSearchInputContentSetToImageQuerySearch.value === false) {
    return
  }
  imageQuerySearchSet(searchInputContent.value)
}

// 搜索框清空
const searchInputContentClear = () => {
  searchInputContent.value = ''
  searchInputContentSetToImageQuerySearch()
}

// 图片数量查询

// 全部图片
const numAllImagePageListQuery = useImagePageListQuery({
  pageNum: computed(() => 1),
  authorId: computed(() => null),
  searchContent: computed(() => null),
})

const authStore = useAuthStore()

// 我的图片
const numMyImagePageListQuery = useImagePageListQuery({
  pageNum: computed(() => {
    // 未登录则 pageNum 为 null 即不查询
    if (authStore.isValid === false || authStore.record?.id == null) {
      return null
    }
    return 1
  }),
  authorId: computed(() => {
    if (authStore.isValid === false || authStore.record?.id == null) {
      return null
    }
    return authStore.record.id
  }),
  searchContent: computed(() => null),
})

// 图片数字加载时的字符串动画
const { text: imgNumAniStr } = useAniStrIncreasingDecreasingSequentially()
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 上传图片 -->
      <div>
        <PanelImageUploader></PanelImageUploader>
      </div>
      <!-- 分割线 -->
      <div class="border-t-[3px] border-color-background"></div>
      <!-- 全部图片 我的图片 -->
      <div>
        <div class="flex items-stretch">
          <!-- 左 全部图片 -->
          <div class="flex-1 truncate">
            <div
              class="flow-root transition-colors"
              :class="{
                'bg-el-primary-light-6': imageQueryMode === 'image_all',
                'cursor-pointer': canImageQueryModeSetToImageAll,
                'cursor-not-allowed': !canImageQueryModeSetToImageAll,
              }"
              @click="imageQueryModeSetToImageAll"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[18px] font-bold text-color-text"
                >
                  {{
                    numAllImagePageListQuery.data.value?.totalItems ??
                    imgNumAniStr
                  }}
                </div>
                <div
                  class="select-none truncate text-center text-[12px] font-bold text-color-text"
                >
                  {{ i18nStore.t('imagePageAllImageText')() }}
                </div>
              </div>
            </div>
          </div>
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 左 我的图片 -->
          <div class="flex-1">
            <div
              class="flow-root transition-colors"
              :class="{
                'bg-el-primary-light-6': imageQueryMode === 'image_my',
                'cursor-pointer': canImageQueryModeSetToImageMy,
                'cursor-not-allowed': !canImageQueryModeSetToImageMy,
              }"
              @click="imageQueryModeSetToImageMy"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[18px] font-bold text-color-text"
                >
                  {{
                    numMyImagePageListQuery.data.value?.totalItems ??
                    imgNumAniStr
                  }}
                </div>
                <div
                  class="select-none truncate text-center text-[12px] font-bold text-color-text"
                >
                  {{ i18nStore.t('imagePageMyImageText')() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分割线 -->
      <div class="border-t-[3px] border-color-background"></div>
      <!-- 搜索栏 -->
      <div class="search-input-box">
        <div class="my-2 flex items-stretch">
          <!-- 左栏 输入框 -->
          <div class="ml-2 flow-root flex-1 truncate">
            <div>
              <ElInput
                v-model="searchInputContent"
                :placeholder="i18nStore.t('imagePageSearchPlaceholderText')()"
                @keydown.enter.exact.prevent="
                  searchInputContentSetToImageQuerySearch
                "
              >
                <template #suffix>
                  <div
                    v-if="searchInputContent !== ''"
                    class="cursor-pointer text-color-text-soft"
                    @click="searchInputContentClear"
                  >
                    <RiCloseCircleLine size="18px"></RiCloseCircleLine>
                  </div>
                </template>
              </ElInput>
            </div>
          </div>
          <!-- 右栏 按钮 -->
          <div class="mr-2 flex flex-col-reverse">
            <ElButton
              circle
              type="info"
              :disabled="!canSearchInputContentSetToImageQuerySearch"
              @click="searchInputContentSetToImageQuerySearch"
            >
              <template #icon>
                <RiSearchLine></RiSearchLine>
              </template>
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-input-box {
  .el-input {
    :deep() {
      .el-input__wrapper {
        background-color: transparent;
        box-shadow: none;

        &:hover {
          box-shadow: none;
        }
        .el-input__inner {
          color: var(--color-text);
          font-size: 14px;
          font-weight: bold;
          // text-align: center;
          &::placeholder {
            color: var(--color-text-soft);
            font-size: 14px;
            font-style: italic;
          }
        }
      }
    }
  }
}
</style>
