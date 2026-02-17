<script setup lang="ts">
import { useI18nStore } from '@/stores'
import type { UserQueryModeDesuwaType } from './dependencies'

const props = defineProps<{
  userQueryModeDesuwa: UserQueryModeDesuwaType
}>()

const {
  userQuerySortMode,
  userQuerySearch,
  userQuerySortModeSetToJoinedAtDesc,
  userQuerySortModeSetToJoinedAtAsc,
  userQuerySearchSet,
} = props.userQueryModeDesuwa

const i18nStore = useI18nStore()

const searchInputContent = ref(userQuerySearch.value)

// 是否能 搜索框开始查询
const canSearchInputContentSetToUserQuerySearch = computed(() => {
  if (userQuerySearch.value === searchInputContent.value) {
    return false
  }
  return true
})
// 搜索框开始查询
const searchInputContentSetToUserQuerySearch = () => {
  if (canSearchInputContentSetToUserQuerySearch.value === false) {
    return
  }
  userQuerySearchSet(searchInputContent.value)
}

// 搜索框清空
const searchInputContentClear = () => {
  searchInputContent.value = ''
  searchInputContentSetToUserQuerySearch()
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-t-[24px] bg-color-background-soft">
      <!-- 降序 升序 -->
      <div>
        <div class="flex items-stretch">
          <!-- 左 降序 -->
          <div class="flex-1 truncate">
            <div
              class="flow-root cursor-pointer transition-colors"
              :class="{
                'bg-el-primary-light-6': userQuerySortMode === 'joined_at_desc',
              }"
              @click="userQuerySortModeSetToJoinedAtDesc"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[16px] font-bold text-color-text"
                >
                  {{ '降序排序' }}
                </div>
                <div
                  class="select-none truncate text-center text-[11px] font-bold text-color-text"
                >
                  {{
                    // i18nStore.t('userPageAllUserText')()
                    '加入时间'
                  }}
                </div>
              </div>
            </div>
          </div>
          <div class="border-l-[3px] border-color-background"></div>
          <!-- 右 升序 -->
          <div class="flex-1">
            <div
              class="flow-root cursor-pointer transition-colors"
              :class="{
                'bg-el-primary-light-6': userQuerySortMode === 'joined_at_asc',
              }"
              @click="userQuerySortModeSetToJoinedAtAsc"
            >
              <div class="mx-[10px] mb-[12px] mt-[10px]">
                <div
                  class="select-none truncate text-center text-[16px] font-bold text-color-text"
                >
                  {{ '升序排序' }}
                </div>
                <div
                  class="select-none truncate text-center text-[11px] font-bold text-color-text"
                >
                  {{
                    // i18nStore.t('userPageMyUserText')()
                    '加入时间'
                  }}
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
                :placeholder="i18nStore.t('userPageSearchPlaceholderText')()"
                @keydown.enter.exact.prevent="
                  searchInputContentSetToUserQuerySearch
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
              :disabled="!canSearchInputContentSetToUserQuerySearch"
              @click="searchInputContentSetToUserQuerySearch"
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
