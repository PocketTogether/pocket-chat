<script setup lang="ts">
import { useRouteControlDialog, useUserPermissionsDesuwa } from '@/composables'
import type { ImageInfoQueryDesuwaType } from './dependencies'
import { ContainerDialog } from '@/components'
import { useI18nStore } from '@/stores'
import { compareDatesSafe, potoMessage } from '@/utils'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { pbImageUpdateIsDeletedApi } from '@/api'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const props = defineProps<{
  imageInfoQueryDesuwa: ImageInfoQueryDesuwaType
}>()

const {
  //
  imagesGetOneQuery,
  imageInfoDataWithRealtime,
  imageInfoCheckSetQueryDataOnSuccessUpdate,
} = props.imageInfoQueryDesuwa

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  /** 控制dialog是否显示的query键, 不同的对话框应使用不同的，且要避免与其他query参数冲突 */
  // 简单来讲就是如下图地址栏中显示的字符串
  dialogQueryKey: 'ImageDeleteDialog',
})

const queryClient = useQueryClient()

const submitImageDeleteMutation = useMutation({
  mutationFn: async () => {
    if (imageInfoDataWithRealtime.value == null) {
      throw new Error('imageInfoDataWithRealtime.value == null')
    }
    const pbRes = await pbImageUpdateIsDeletedApi(
      imageInfoDataWithRealtime.value.id,
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
    // 让图片分页查询invalidate
    queryClient.invalidateQueries({
      queryKey: queryKeys.imagePageList(),
    })
    // 更新query
    imageInfoCheckSetQueryDataOnSuccessUpdate(data)
  },
  onError: () => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('imageInfoPageDeleteFailedText')(),
    })
  },
})

const submitImageDelete = () => {
  submitImageDeleteMutation.mutateAsync()
}
const isSubmitImageDeleteRunning = submitImageDeleteMutation.isPending

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
              <!-- 确认要删除此图片吗？ -->
              {{ i18nStore.t('imageInfoPageDeleteConfirmText')() }}
            </div>
          </div>
          <div class="flex justify-center">
            <!-- “确认”按钮 -->
            <ElButton
              type="danger"
              round
              :loading="isSubmitImageDeleteRunning"
              size="small"
              @click="submitImageDelete"
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
          <!-- 删除图片 -->
          {{ i18nStore.t('imageInfoPageDeleteImageTitle')() }}
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
.image-delete-dialog-content-box {
  box-shadow: 0 0 6px 6px var(--color-background);
}
</style>
