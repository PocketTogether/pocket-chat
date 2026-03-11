<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type { SearchMessageQueryDesuwaType } from './dependencies'

const props = defineProps<{
  searchMessageQueryDesuwa: SearchMessageQueryDesuwaType
}>()

const {
  searchmessageQuerySortMode,
  searchmessageQuerySearch,
  searchmessageQuerySortModeSetToDesc,
  searchmessageQuerySortModeSetToAsc,
  searchmessageQuerySearchSet,
} = props.searchMessageQueryDesuwa

const i18nStore = useI18nStore()

const searchInputContent = ref(searchmessageQuerySearch.value)

// 是否能 搜索框开始查询
const canSearchInputContentSetToSearchmessageQuerySearch = computed(() => {
  if (searchmessageQuerySearch.value === searchInputContent.value) {
    return false
  }
  return true
})
// 搜索框开始查询
const searchInputContentSetToSearchmessageQuerySearch = () => {
  if (canSearchInputContentSetToSearchmessageQuerySearch.value === false) {
    return
  }
  searchmessageQuerySearchSet(searchInputContent.value)
}

// 搜索框清空
const searchInputContentClear = () => {
  searchInputContent.value = ''
  searchInputContentSetToSearchmessageQuerySearch()
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 降序 升序 -->
      <div>
        <div class="flex items-stretch">
          <!-- 左 降序 -->
          <div class="flex-1 truncate">
            <div
              class="flow-root cursor-pointer transition-colors"
              :class="{
                'bg-el-primary-light-6':
                  searchmessageQuerySortMode === 'created_desc',
              }"
              @click="searchmessageQuerySortModeSetToDesc"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[16px] font-bold text-color-text"
                >
                  {{ i18nStore.t('searchPageSortDescText')() }}
                </div>
                <div
                  class="select-none truncate text-center text-[10px] text-color-text"
                >
                  {{ i18nStore.t('searchPageSortFieldText')() }}
                </div>
              </div>
            </div>
          </div>
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 右 升序 -->
          <div class="flex-1 truncate">
            <div
              class="flow-root cursor-pointer transition-colors"
              :class="{
                'bg-el-primary-light-6':
                  searchmessageQuerySortMode === 'created_asc',
              }"
              @click="searchmessageQuerySortModeSetToAsc"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[16px] font-bold text-color-text"
                >
                  {{ i18nStore.t('searchPageSortAscText')() }}
                </div>
                <div
                  class="select-none truncate text-center text-[10px] text-color-text"
                >
                  {{ i18nStore.t('searchPageSortFieldText')() }}
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
                :placeholder="i18nStore.t('searchPageSearchPlaceholderText')()"
                @keydown.enter.exact.prevent="
                  searchInputContentSetToSearchmessageQuerySearch
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
              :disabled="!canSearchInputContentSetToSearchmessageQuerySearch"
              @click="searchInputContentSetToSearchmessageQuerySearch"
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
