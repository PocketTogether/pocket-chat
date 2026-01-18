<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FileInfoQueryDesuwaType } from './dependencies'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { pbFileUpdateFileNameApi } from '@/api'
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
const isEditingFileName = ref(false)

/**
 * 输入框内容
 */
const fileNameInputValue = ref('')

/**
 * 当前文件 fileName（来自查询结果）
 */
const fileFileName = computed(() => {
  return fileInfoDataWithRealtime.value?.fileName ?? ''
})

/**
 * 未编辑状态下：
 * 输入框内容始终与文件 fileName 保持同步
 */
watch(
  fileFileName,
  (newFileName) => {
    if (!isEditingFileName.value) {
      fileNameInputValue.value = newFileName
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
const startEditFileName = () => {
  isEditingFileName.value = true
  refElInputAlt.value?.focus()
}

/**
 * 取消编辑
 */
const cancelEditFileName = () => {
  fileNameInputValue.value = fileFileName.value
  isEditingFileName.value = false
}

const queryClient = useQueryClient()

const submitEditFileNameMutation = useMutation({
  mutationFn: async () => {
    if (fileInfoDataWithRealtime.value == null) {
      throw new Error('fileInfoDataWithRealtime.value == null')
    }
    const pbRes = await pbFileUpdateFileNameApi(
      fileInfoDataWithRealtime.value.id,
      {
        fileName: fileNameInputValue.value,
      }
    )
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  onSuccess: (data) => {
    fileInfoCheckSetQueryDataOnSuccessUpdate(data)
    cancelEditFileName()
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
const submitEditFileName = () => {
  submitEditFileNameMutation.mutateAsync()
}
const isSubmitEditFileNameRunning = submitEditFileNameMutation.isPending

// 是否能提交，修改后才能提交
const canSubmitEditFileName = computed(() => {
  if (fileNameInputValue.value !== fileFileName.value) {
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
          <!-- FileName -->
          {{ i18nStore.t('fileInfoPageFileNameTitle')() }}
        </div>
        <!-- 输入框 -->
        <div class="textarea-box">
          <ElInput
            ref="refElInputAlt"
            v-model="fileNameInputValue"
            type="textarea"
            resize="none"
            :readonly="!isEditingFileName"
            :autosize="{ minRows: 2, maxRows: 10 }"
            :placeholder="
              isEditingFileName
                ? undefined
                : i18nStore.t('fileInfoPageFileNamePlaceholder')()
            "
          ></ElInput>
        </div>
      </div>

      <!-- 右侧：按钮区 -->
      <div class="mr-2 flex flex-col justify-end">
        <!-- 未编辑状态 -->
        <template v-if="!isEditingFileName">
          <div>
            <ElButton
              circle
              type="info"
              :disabled="!isAuthorCurrent || !permissionUploadFile"
              @click="startEditFileName"
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
              <ElButton circle type="info" @click="cancelEditFileName">
                <template #icon>
                  <RiCloseFill />
                </template>
              </ElButton>
            </div>
            <div>
              <ElButton
                circle
                type="primary"
                :disabled="!canSubmitEditFileName"
                :loading="isSubmitEditFileNameRunning"
                @click="submitEditFileName"
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
