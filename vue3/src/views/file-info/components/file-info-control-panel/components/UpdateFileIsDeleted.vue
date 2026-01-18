<script setup lang="ts">
import { useRouteControlDialog, useUserPermissionsDesuwa } from '@/composables'
import type { FileInfoQueryDesuwaType } from './dependencies'
import { ContainerDialog } from '@/components'
import { useI18nStore } from '@/stores'
import { compareDatesSafe, potoMessage } from '@/utils'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { pbFileUpdateIsDeletedApi } from '@/api'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const props = defineProps<{
  fileInfoQueryDesuwa: FileInfoQueryDesuwaType
}>()

const {
  //
  filesGetOneQuery,
  fileInfoDataWithRealtime,
  fileInfoCheckSetQueryDataOnSuccessUpdate,
} = props.fileInfoQueryDesuwa

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  /** 控制dialog是否显示的query键, 不同的对话框应使用不同的，且要避免与其他query参数冲突 */
  // 简单来讲就是如下图地址栏中显示的字符串
  dialogQueryKey: 'FileDeleteDialog',
})

const queryClient = useQueryClient()

const submitFileDeleteMutation = useMutation({
  mutationFn: async () => {
    if (fileInfoDataWithRealtime.value == null) {
      throw new Error('fileInfoDataWithRealtime.value == null')
    }
    const pbRes = await pbFileUpdateIsDeletedApi(
      fileInfoDataWithRealtime.value.id,
      {
        isDeleted: true,
      }
    )
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  onSuccess: (data) => {
    dialogClose()
    // 让文件分页查询invalidate
    queryClient.invalidateQueries({
      queryKey: queryKeys.filePageList(),
    })
    // 更新query
    fileInfoCheckSetQueryDataOnSuccessUpdate(data)
  },
  onError: () => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('fileInfoPageDeleteFailedText')(),
    })
  },
})

const submitFileDelete = () => {
  submitFileDeleteMutation.mutateAsync()
}
const isSubmitFileDeleteRunning = submitFileDeleteMutation.isPending

const i18nStore = useI18nStore()
</script>

<template>
  <div>
    <ContainerDialog
      :dialogVisible="dialogVisible"
      :dialogCloseFn="dialogClose"
    >
      <div
        class="content-box flow-root rounded-[20px] bg-color-background-soft shadow-[0_0_6px_6px] shadow-color-background"
      >
        <div class="m-[20px]">
          <div class="mb-[10px]">
            <div class="text-center text-[14px] font-bold text-color-text-soft">
              <!-- 确认要删除此文件吗？ -->
              {{ i18nStore.t('fileInfoPageDeleteConfirmText')() }}
            </div>
          </div>
          <div class="flex justify-center">
            <!-- “确认”按钮 -->
            <ElButton
              type="danger"
              round
              :loading="isSubmitFileDeleteRunning"
              size="small"
              @click="submitFileDelete"
            >
              {{ i18nStore.t('settingButtonConfirm')() }}
            </ElButton>
            <!-- “取消”按钮 -->
            <ElButton type="info" round size="small" @click="dialogClose">
              {{ i18nStore.t('settingButtonCancel')() }}
            </ElButton>
          </div>
        </div>
      </div>
    </ContainerDialog>
    <div class="my-2 flex items-center">
      <!-- 左侧 -->
      <div class="ml-2 flex-1 truncate">
        <!-- 标题 -->
        <div class="ml-3 text-[14px] font-bold text-color-text">
          <!-- 删除文件 -->
          {{ i18nStore.t('fileInfoPageDeleteFileTitle')() }}
        </div>
      </div>

      <!-- 右侧：按钮区 -->
      <div class="mr-2">
        <div>
          <ElButton circle type="danger" @click="dialogOpen">
            <template #icon>
              <RiDeleteBinLine />
            </template>
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-delete-dialog-content-box {
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
