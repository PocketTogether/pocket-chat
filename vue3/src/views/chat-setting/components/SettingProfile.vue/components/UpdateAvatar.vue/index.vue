<script setup lang="ts">
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import {
  Collections,
  onPbResErrorStatus401AuthClear,
  pb,
  type Update,
} from '@/lib'
import { queryKeys, queryRetryPbNetworkError, useProfileQuery } from '@/queries'
import { useI18nStore } from '@/stores'
import {
  blobToFile,
  compareDatesSafe,
  fetchWithTimeoutPreferred,
  potoMessage,
} from '@/utils'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { UploadFile } from 'element-plus'
import CropDialog from './components/CropDialog.vue'
import { pbUsersUpdateAvatarApi } from '@/api'

const i18nStore = useI18nStore()

// 个人信息查询
const profileQuery = useProfileQuery()
const profileAvatarUrl = computed(() => {
  if (
    profileQuery.data.value == null ||
    profileQuery.data.value.avatar === ''
  ) {
    return appUserDefaultAvatar
  }
  return pb.files.getURL(
    profileQuery.data.value,
    profileQuery.data.value.avatar
    // { thumb: fileUserAvatarConfig.thumb200x200f }
  )
})

// 存储裁剪后的图片 Blob 数据
const imageBlobRef = ref<Blob | null>(null)
// 存储裁剪后图片的预览 URL，通过 vue3\src\utils\image.ts 的函数11生成
const imageUrlRef = ref<string | null>(null)
// 优先显示新裁剪的图片，否则显示当前头像。
const imageForShow = computed(() => {
  if (imageUrlRef.value != null) {
    return imageUrlRef.value
  }
  return profileAvatarUrl.value
})

// 对话框显示隐藏
// const cropDialogVisible = ref(false)
// 存储用户选择的原始图片的临时 URL，用于在裁剪器中显示
const originalImage = ref<string | null>(null)

// 引用CropDialog
const refCropDialog = ref<InstanceType<typeof CropDialog> | null>(null)

// 当用户通过 ElUpload 选择图片后触发
// 用 URL.createObjectURL() 创建 原始图片 的临时 URL，并显示裁剪对话框
const onImageSelect = (uploadFile: UploadFile) => {
  if (uploadFile.raw) {
    originalImage.value = URL.createObjectURL(uploadFile.raw)
    refCropDialog.value?.dialogOpen()
  }
}

// 取消按钮函数
const cancelFn = () => {
  // 释放
  if (imageUrlRef.value != null) {
    URL.revokeObjectURL(imageUrlRef.value)
  }
  imageBlobRef.value = null
  imageUrlRef.value = null
}

// 何时禁用提交按钮
const isDisableSubmit = computed(() => {
  if (imageBlobRef.value == null) {
    return true
  }
  return false
})

const queryClient = useQueryClient()

// mutation
const mutation = useMutation({
  // mutation函数
  mutationFn: async () => {
    // 未登录，抛出错误
    if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
      throw new Error(
        '!pb.authStore.isValid || pb.authStore.record?.id == null'
      )
    }

    // 无文件，抛出错误
    if (imageBlobRef.value == null) {
      throw new Error('imageBlobRef.value == null')
    }

    // 准备文件
    const imageFile = blobToFile(imageBlobRef.value, 'image')

    // 通过 pocketbase SDK 请求
    const pbRes = await pbUsersUpdateAvatarApi({
      avatar: imageFile,
    })

    console.log(pbRes)
    return pbRes
  },
  // ✅ 在网络错误时重试
  retry: queryRetryPbNetworkError,
  // 成功之后的处理
  onSuccess: (data) => {
    // 更新query缓存
    // 更新前，应确认data.update时间为最新的，以此方式避免两次很近的请求导致问题
    if (
      profileQuery.data.value != null &&
      // data.updated > profileQuery.data.value.updated
      compareDatesSafe(data.updated, profileQuery.data.value.updated) === 1
    ) {
      // 更新query缓存
      queryClient.setQueryData(
        queryKeys.profile(pb.authStore.record?.id ?? ''),
        // 确保类型正确
        data satisfies NonNullable<typeof profileQuery.data.value>
      )
    }
    // 成功后清理 imageBlobRef 等变量
    cancelFn()
    potoMessage({
      type: 'success',
      message: i18nStore.t('messageUpdateSuccess')(),
    })
  },
  // 失败之后的处理
  onError: (error) => {
    potoMessage({
      type: 'error',
      message: i18nStore.t('messageUpdateFailure')(),
    })
  },
})
const isSubmitting = mutation.isPending
const submit = mutation.mutateAsync
</script>

<template>
  <!-- 修改头像组件 -->
  <div>
    <!-- 内容标题 -->
    <div class="mb-3 ml-3 text-sm font-bold text-color-text-soft">
      {{ i18nStore.t('settingProfileUpdateAvatarContentTitle')() }}
    </div>
    <!-- 头像盒子 -->
    <div>
      <!-- 居中 -->
      <div class="flex justify-center">
        <!-- ElUpload -->
        <!--
        将这个div换为ElUpload
        单个文件，只允许 png jpg webp
        用户点击这个后不是会选择文件吗，选择文件后打印文件信息
        -->
        <div class="upload-box">
          <ElUpload
            :autoUpload="false"
            :showFileList="false"
            :onChange="onImageSelect"
            accept="image/png,image/jpeg,image/webp"
            drag
          >
            <div
              class="cursor-pointer rounded-full border-2 border-dashed border-color-text-soft transition-colors hover:border-el-primary"
            >
              <div
                class="m-[1px] h-[100px] w-[100px] overflow-hidden rounded-full"
              >
                <img
                  :src="imageForShow"
                  alt="App Icon"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
          </ElUpload>
        </div>
      </div>
    </div>
    <!-- 按钮盒子 -->
    <div class="poto-setting-button-box center-mt-3">
      <ElButton
        :loading="isSubmitting"
        type="primary"
        round
        :disabled="isDisableSubmit"
        @click="submit()"
      >
        {{ i18nStore.t('settingButtonSave')() }}
      </ElButton>
      <ElButton type="info" round @click="cancelFn()">
        {{ i18nStore.t('settingButtonCancel')() }}
      </ElButton>
    </div>

    <!-- 裁剪对话框 -->
    <CropDialog
      ref="refCropDialog"
      v-model:originalImage="originalImage"
      v-model:imageUrlRef="imageUrlRef"
      v-model:imageBlobRef="imageBlobRef"
    ></CropDialog>
  </div>
</template>

<style lang="scss" scoped>
.upload-box {
  :deep() {
    .el-upload {
      .el-upload-dragger {
        background-color: unset;
        border: none;
        padding: 0;
      }
    }
  }
}
</style>
