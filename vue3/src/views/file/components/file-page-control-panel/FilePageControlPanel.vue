<script setup lang="ts">
import type {
  FileQueryModeDesuwaType,
  FileQueryModeMarkType,
} from './dependencies'
import { PanelFileUploader } from './components'
import { useAuthStore, useI18nStore } from '@/stores'
import { useFilePageListQuery } from '@/queries'
import { useAniStrIncreasingDecreasingSequentially } from '@/composables'

const props = defineProps<{
  fileQueryModeDesuwa: FileQueryModeDesuwaType
}>()

const {
  fileQueryMode,
  canFileQueryModeSetToFileAll,
  fileQueryModeSetToFileAll,
  canFileQueryModeSetToFileMy,
  fileQueryModeSetToFileMy,
  fileQuerySearch,
  fileQuerySearchSet,
  numAllFilePageListQuery,
  numMyFilePageListQuery,
} = props.fileQueryModeDesuwa

const i18nStore = useI18nStore()

const searchInputContent = ref(fileQuerySearch.value)

// 是否能 搜索框开始查询
const canSearchInputContentSetToFileQuerySearch = computed(() => {
  if (fileQuerySearch.value === searchInputContent.value) {
    return false
  }
  return true
})
// 搜索框开始查询
const searchInputContentSetToFileQuerySearch = () => {
  if (canSearchInputContentSetToFileQuerySearch.value === false) {
    return
  }
  fileQuerySearchSet(searchInputContent.value)
}

// 搜索框清空
const searchInputContentClear = () => {
  searchInputContent.value = ''
  searchInputContentSetToFileQuerySearch()
}

// 图片数字加载时的字符串动画
const { text: imgNumAniStr } = useAniStrIncreasingDecreasingSequentially()
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 上传图片 -->
      <div>
        <PanelFileUploader></PanelFileUploader>
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
                'bg-el-primary-light-6': fileQueryMode === 'file_all',
                'cursor-pointer': canFileQueryModeSetToFileAll,
                'cursor-not-allowed': !canFileQueryModeSetToFileAll,
              }"
              @click="fileQueryModeSetToFileAll"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[18px] font-bold text-color-text"
                >
                  {{
                    numAllFilePageListQuery.data.value?.totalItems ??
                    imgNumAniStr
                  }}
                </div>
                <div
                  class="select-none truncate text-center text-[12px] font-bold text-color-text"
                >
                  {{ i18nStore.t('filePageAllFileText')() }}
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
                'bg-el-primary-light-6': fileQueryMode === 'file_my',
                'cursor-pointer': canFileQueryModeSetToFileMy,
                'cursor-not-allowed': !canFileQueryModeSetToFileMy,
              }"
              @click="fileQueryModeSetToFileMy"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[18px] font-bold text-color-text"
                >
                  {{
                    numMyFilePageListQuery.data.value?.totalItems ??
                    imgNumAniStr
                  }}
                </div>
                <div
                  class="select-none truncate text-center text-[12px] font-bold text-color-text"
                >
                  {{ i18nStore.t('filePageMyFileText')() }}
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
                :placeholder="i18nStore.t('filePageSearchPlaceholderText')()"
                @keydown.enter.exact.prevent="
                  searchInputContentSetToFileQuerySearch
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
              :disabled="!canSearchInputContentSetToFileQuerySearch"
              @click="searchInputContentSetToFileQuerySearch"
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
