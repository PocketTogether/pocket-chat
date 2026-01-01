<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ImageInfoQueryDesuwaType } from './dependencies'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { pbImageUpdateKeywordApi } from '@/api'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { compareDatesSafe, potoMessage } from '@/utils'
import type { ElInput } from 'element-plus'
import { useAuthStore, useI18nStore } from '@/stores'

const props = defineProps<{
  imageInfoQueryDesuwa: ImageInfoQueryDesuwaType
}>()

const {
  //
  imagesGetOneQuery,
  isAuthorCurrent,
} = props.imageInfoQueryDesuwa

/**
 * 是否处于编辑状态
 */
const isEditingKeyword = ref(false)

/**
 * 输入框内容
 */
const keywordInputValue = ref('')

/**
 * 当前图片 keyword（来自查询结果）
 */
const imageKeyword = computed(() => {
  return imagesGetOneQuery.data.value?.keyword ?? ''
})

/**
 * 未编辑状态下：
 * 输入框内容始终与图片 keyword 保持同步
 */
watch(
  imageKeyword,
  (newKeyword) => {
    if (!isEditingKeyword.value) {
      keywordInputValue.value = newKeyword
    }
  },
  {
    immediate: true,
  }
)

const refElInputAlt = ref<InstanceType<typeof ElInput> | null>(null)

/**
 * 进入编辑状态
 */
const startEditKeyword = () => {
  isEditingKeyword.value = true
  refElInputAlt.value?.focus()
}

/**
 * 取消编辑
 */
const cancelEditKeyword = () => {
  keywordInputValue.value = imageKeyword.value
  isEditingKeyword.value = false
}

const queryClient = useQueryClient()

const submitEditKeywordMutation = useMutation({
  mutationFn: async () => {
    if (imagesGetOneQuery.data.value == null) {
      throw new Error('imagesGetOneQuery.data.value == null')
    }
    const pbRes = await pbImageUpdateKeywordApi(
      imagesGetOneQuery.data.value.id,
      {
        keyword: keywordInputValue.value,
      }
    )
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  onSuccess: (data) => {
    // 更新query
    // 更新前，应确认data.update时间为最新的，以此方式避免两次很近的请求导致问题
    if (
      imagesGetOneQuery.data.value != null &&
      // data.updated > imagesGetOneQuery.data.value.updated
      compareDatesSafe(data.updated, imagesGetOneQuery.data.value.updated) === 1
    ) {
      // 更新query缓存
      queryClient.setQueryData(
        queryKeys.imagesGetOne(imagesGetOneQuery.data.value.id),
        // 确保类型正确
        data satisfies NonNullable<typeof imagesGetOneQuery.data.value>
      )
    }
    cancelEditKeyword()
  },
  onError: () => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('imageInfoPageUpdateFailedText')(),
    })
  },
})

/**
 * 提交修改（占位）
 */
const submitEditKeyword = () => {
  submitEditKeywordMutation.mutateAsync()
}
const isSubmitEditKeywordRunning = submitEditKeywordMutation.isPending

// 是否能提交，修改后才能提交
const canSubmitEditKeyword = computed(() => {
  if (keywordInputValue.value !== imageKeyword.value) {
    return true
  }
  return false
})

const i18nStore = useI18nStore()
</script>

<template>
  <div>
    <div class="my-2 flex items-stretch">
      <!-- 左侧：输入框 -->
      <div class="ml-2 flex-1 truncate">
        <!-- 标题 -->
        <div class="ml-3 text-[14px] font-bold text-color-text">
          <!-- Keyword -->
          {{ i18nStore.t('imageInfoPageKeywordTitle')() }}
        </div>
        <!-- 输入框 -->
        <div class="textarea-box">
          <ElInput
            ref="refElInputAlt"
            v-model="keywordInputValue"
            type="textarea"
            resize="none"
            :readonly="!isEditingKeyword"
            :autosize="{ minRows: 2, maxRows: 10 }"
            :placeholder="
              isEditingKeyword
                ? undefined
                : i18nStore.t('imageInfoPageKeywordPlaceholder')()
            "
          ></ElInput>
        </div>
      </div>

      <!-- 右侧：按钮区 -->
      <div class="mr-2 flex flex-col justify-end">
        <!-- 未编辑状态 -->
        <template v-if="!isEditingKeyword">
          <div>
            <ElButton
              circle
              type="info"
              :disabled="!isAuthorCurrent"
              @click="startEditKeyword"
            >
              <template #icon>
                <RiEditLine />
              </template>
            </ElButton>
          </div>
        </template>

        <!-- 编辑状态 -->
        <template v-else>
          <div class="flex flex-1 flex-col items-center justify-between">
            <div>
              <ElButton circle type="info" @click="cancelEditKeyword">
                <template #icon>
                  <RiCloseFill />
                </template>
              </ElButton>
            </div>
            <div>
              <ElButton
                circle
                type="primary"
                :disabled="!canSubmitEditKeyword"
                :loading="isSubmitEditKeywordRunning"
                @click="submitEditKeyword"
              >
                <template #icon>
                  <RiCheckFill />
                </template>
              </ElButton>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.textarea-box {
  :deep() {
    .el-textarea__inner {
      border: none;
      box-shadow: none;
      background-color: transparent;
      color: var(--color-text);
      font-size: 14px;
      overscroll-behavior: contain;
      &::placeholder {
        color: var(--color-text-soft);
        font-size: 14px;
        font-style: italic;
        font-weight: bold;
      }
    }
  }
}
</style>
