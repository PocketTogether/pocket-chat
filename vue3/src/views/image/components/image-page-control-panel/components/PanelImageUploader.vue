<script setup lang="ts">
import { pbImageUploadApi, pbImageUploadWithAxios } from '@/api'
import type { UploadFile } from 'element-plus'

/*
关于图片上传的实现，自己的一些看法
*/

const imageUploadAdd = async (uploadFile: UploadFile) => {
  // await pbImageUploadApi(uploadFile)
  const res = await pbImageUploadWithAxios(uploadFile)
  console.log(res)
  console.log(uploadFile)
  /*
{
    "name": "0e64b07abb80542fe4af7db59ca11c9d14163774.jpg",
    "percentage": 0,
    "status": "ready",
    "size": 69246,
    "raw": {
        "uid": 1765175858636
        ……
    },
    "uid": 1765175858636
    ……
}
*/

  /*
// import type { UploadFile } from 'element-plus'
export interface UploadFile {
    name: string;
    percentage?: number;
    status: UploadStatus;
    size?: number;
    response?: unknown;
    uid: number;
    url?: string;
    raw?: UploadRawFile;
}
export interface UploadRawFile extends File {
    uid: number;
    isDirectory?: boolean;
}
*/
}
</script>

<template>
  <div>
    <!-- 上传图片 -->
    <div class="upload-box">
      <ElUpload
        :autoUpload="false"
        accept="image/png,image/jpeg,image/webp"
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
