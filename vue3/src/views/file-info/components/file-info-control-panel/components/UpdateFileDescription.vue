<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FileInfoQueryDesuwaType } from './dependencies'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { pbFileUpdateDescriptionApi } from '@/api'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { compareDatesSafe, potoMessage } from '@/utils'
import type { ElInput } from 'element-plus'
import { useAuthStore, useI18nStore } from '@/stores'
import { useUserPermissionsDesuwa } from '@/composables'

const props = defineProps<{
  fileInfoQueryDesuwa: FileInfoQueryDesuwaType
}>()

const {
  //
  filesGetOneQuery,
  isAuthorCurrent,
  fileInfoDataWithRealtime,
  fileInfoCheckSetQueryDataOnSuccessUpdate,
} = props.fileInfoQueryDesuwa

/**
 * 是否处于编辑状态
 */
const isEditingDescription = ref(false)

/**
 * 输入框内容
 */
const descriptionInputValue = ref('')

/**
 * 当前文件 description（来自查询结果）
 */
const fileDescription = computed(() => {
  return fileInfoDataWithRealtime.value?.description ?? ''
})

/**
 * 未编辑状态下：
 * 输入框内容始终与文件 description 保持同步
 */
watch(
  fileDescription,
  (newDescription) => {
    if (!isEditingDescription.value) {
      descriptionInputValue.value = newDescription
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
const startEditDescription = () => {
  isEditingDescription.value = true
  refElInputAlt.value?.focus()
}

/**
 * 取消编辑
 */
const cancelEditDescription = () => {
  descriptionInputValue.value = fileDescription.value
  isEditingDescription.value = false
}

const queryClient = useQueryClient()

const submitEditDescriptionMutation = useMutation({
  mutationFn: async () => {
    if (fileInfoDataWithRealtime.value == null) {
      throw new Error('fileInfoDataWithRealtime.value == null')
    }
    const pbRes = await pbFileUpdateDescriptionApi(
      fileInfoDataWithRealtime.value.id,
      {
        description: descriptionInputValue.value,
      }
    )
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  onSuccess: (data) => {
    fileInfoCheckSetQueryDataOnSuccessUpdate(data)
    cancelEditDescription()
  },
  onError: () => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('fileInfoPageUpdateFailedText')(),
    })
  },
})

/**
 * 提交修改（占位）
 */
const submitEditDescription = () => {
  submitEditDescriptionMutation.mutateAsync()
}
const isSubmitEditDescriptionRunning = submitEditDescriptionMutation.isPending

// 是否能提交，修改后才能提交
const canSubmitEditDescription = computed(() => {
  if (descriptionInputValue.value !== fileDescription.value) {
    return true
  }
  return false
})

const i18nStore = useI18nStore()

const { permissionUploadFile } = useUserPermissionsDesuwa()
</script>

<template>
  <div>
    <div class="my-2 flex items-stretch">
      <!-- 左侧：输入框 -->
      <div class="ml-2 flex-1 truncate">
        <!-- 标题 -->
        <div class="ml-3 text-[14px] font-bold text-color-text">
          <!-- Description -->
          {{ i18nStore.t('fileInfoPageDescriptionTitle')() }}
        </div>
        <!-- 输入框 -->
        <div class="textarea-box">
          <ElInput
            ref="refElInputAlt"
            v-model="descriptionInputValue"
            type="textarea"
            resize="none"
            :readonly="!isEditingDescription"
            :autosize="{ minRows: 2, maxRows: 10 }"
            :placeholder="
              isEditingDescription
                ? undefined
                : i18nStore.t('fileInfoPageDescriptionPlaceholder')()
            "
          ></ElInput>
        </div>
      </div>

      <!-- 右侧：按钮区 -->
      <div class="mr-2 flex flex-col justify-end">
        <!-- 未编辑状态 -->
        <template v-if="!isEditingDescription">
          <div>
            <ElButton
              circle
              type="info"
              :disabled="!isAuthorCurrent || !permissionUploadFile"
              @click="startEditDescription"
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
              <ElButton circle type="info" @click="cancelEditDescription">
                <template #icon>
                  <RiCloseFill />
                </template>
              </ElButton>
            </div>
            <div>
              <ElButton
                circle
                type="primary"
                :disabled="!canSubmitEditDescription"
                :loading="isSubmitEditDescriptionRunning"
                @click="submitEditDescription"
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
