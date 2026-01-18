<script setup lang="ts">
import { pbFileUploadApi, pbFileUploadWithAxios } from '@/api'
import { useUserPermissionsDesuwa } from '@/composables'
import { pbCollectionConfigDefaultGetFn, routerDict } from '@/config'
import { usePbCollectionConfigQuery } from '@/queries'
import { useAuthStore, useI18nStore, useUploadFileStore } from '@/stores'
import { formatFileSize, potoMessage } from '@/utils'
import type { UploadFile } from 'element-plus'

const uploadFileStore = useUploadFileStore()

const i18nStore = useI18nStore()

const authStore = useAuthStore()

const {
  permissionUploadFile,
  permissionMaxUploadFileSize,
  openPermissionAdminContactNotif,
} = useUserPermissionsDesuwa()

const fileUploadAdd = async (uploadFile: UploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) {
    console.warn('!rawFile')
    return
  }

  // 大小校验
  if (rawFile.size > permissionMaxUploadFileSize.value) {
    console.warn('rawFile.size > permissionMaxUploadFileSize.value')
    potoMessage({
      type: 'error',
      message: i18nStore.t('permissionFileTooLargeText')(
        formatFileSize(permissionMaxUploadFileSize.value)
      ),
    })
    openPermissionAdminContactNotif()
    return
  }

  uploadFileStore.addUpload(uploadFile)
}
</script>

<template>
  <div>
    <!-- 登录提示 -->
    <div v-if="authStore.isValid === false || authStore.record?.id == null">
      <RouterLink :to="routerDict.LoginPage.path">
        <div class="file-upload-box cursor-pointer">
          <div class="border-[4px] border-transparent">
            <div
              class="upload-border-content rounded-b-[2px] rounded-t-[22px] border-[2px] border-dashed border-color-text-soft text-color-text-soft transition-colors"
            >
              <div class="mx-[10px] my-[16px] flex items-center justify-center">
                <div class="mr-[8px]">
                  <RiLoginBoxLine></RiLoginBoxLine>
                </div>
                <div class="select-none truncate text-[14px] font-bold">
                  {{ i18nStore.t('filePageFileLoginText')() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>
    <!-- 权限提示 -->
    <div v-else-if="permissionUploadFile === false">
      <div @click="openPermissionAdminContactNotif">
        <div class="file-upload-box cursor-pointer">
          <div class="border-[4px] border-transparent">
            <div
              class="upload-border-content rounded-b-[2px] rounded-t-[22px] border-[2px] border-dashed border-color-text-soft text-color-text-soft transition-colors"
            >
              <div class="mx-[10px] my-[16px] flex items-center justify-center">
                <div class="mr-[8px]">
                  <RiInformationLine></RiInformationLine>
                </div>
                <div class="select-none truncate text-[14px] font-bold">
                  {{ i18nStore.t('permissionNoPermissionUploadFileText')() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 上传图片 -->
    <div v-else class="upload-box">
      <ElUpload
        :autoUpload="false"
        :onChange="fileUploadAdd"
        :showFileList="false"
        drag
        multiple
      >
        <div class="file-upload-box cursor-pointer">
          <div class="border-[4px] border-transparent">
            <div
              class="upload-border-content relative rounded-b-[2px] rounded-t-[22px] border-[2px] border-dashed border-color-text-soft text-color-text-soft transition-colors"
            >
              <div class="mx-[10px] my-[16px] flex items-center justify-center">
                <div class="mr-[8px]">
                  <RiFolderUploadLine></RiFolderUploadLine>
                </div>
                <div class="select-none truncate text-[14px] font-bold">
                  {{ i18nStore.t('filePageFileUploadText')() }}
                </div>
              </div>
              <div class="absolute bottom-0 right-0 max-w-full truncate">
                <div
                  class="mx-[6px] my-[1px] select-none truncate text-[10px] font-bold"
                >
                  {{
                    i18nStore.t('permissionFileMaxSizeText')(
                      formatFileSize(permissionMaxUploadFileSize)
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElUpload>
    </div>
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
        border-radius: 0;
        transition-property:
          color, background-color, border-color, text-decoration-color, fill,
          stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
        &.is-dragover {
          background-color: var(--el-color-primary-light-6);
        }
      }
    }
  }
}

.file-upload-box {
  &:hover {
    .upload-border-content {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}
</style>
