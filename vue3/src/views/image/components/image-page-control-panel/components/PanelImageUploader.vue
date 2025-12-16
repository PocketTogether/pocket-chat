<script setup lang="ts">
import { pbImageUploadApi, pbImageUploadWithAxios } from '@/api'
import { pbCollectionConfigDefaultGetFn } from '@/config'
import { usePbCollectionConfigQuery } from '@/queries'
import { useUploadImageStore } from '@/stores'
import type { UploadFile } from 'element-plus'

// 定义允许的图片类型
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

// // 最大文件大小（例如 1MB）
// const MAX_SIZE = 1 * 1024 * 1024

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

const uploadImageStore = useUploadImageStore()

const imageUploadAdd = async (uploadFile: UploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) {
    console.warn('未找到原始文件对象')
    return
  }

  // 类型校验
  // 头像、图片上传，拖拽文件上传时，el此时不会检查格式，应自己加上检查逻辑
  if (!allowedTypes.includes(rawFile.type)) {
    console.warn(`不支持的文件类型: ${rawFile.type}`)
    return
  }

  // // 大小校验
  // if (rawFile.size > MAX_SIZE) {
  //   console.warn(`文件过大: ${(rawFile.size / 1024 / 1024).toFixed(2)} MB`)
  //   return
  // }

  // 图片处理配置
  const options =
    pbCollectionConfigQuery.dataWithDefault.value[
      'upload-image-process-options'
    ]

  uploadImageStore.addUpload(uploadFile, options)
}
</script>

<template>
  <div>
    <!-- 上传图片 -->
    <div class="upload-box">
      <ElUpload
        :autoUpload="false"
        :accept="allowedTypes.join(',')"
        :onChange="imageUploadAdd"
        :showFileList="false"
        drag
        multiple
      >
        <div class="image-upload-box cursor-pointer">
          <div class="border-[4px] border-transparent">
            <div
              class="upload-border-content rounded-b-[2px] rounded-t-[22px] border-[2px] border-dashed border-color-text-soft text-color-text-soft transition-colors"
            >
              <div class="mx-[10px] my-[16px] flex items-center justify-center">
                <div class="mr-[8px]">
                  <RiImageAddLine></RiImageAddLine>
                </div>
                <div class="select-none truncate text-[14px] font-bold">
                  上传图片
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

.image-upload-box {
  &:hover {
    .upload-border-content {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}
</style>
