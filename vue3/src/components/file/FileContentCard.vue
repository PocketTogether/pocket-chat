<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { fileTypeResolveIconContentUtil, formatFileSize } from '@/utils'

const props = withDefaults(
  defineProps<{
    fileData: FilesResponseWithBaseExpand
    /** 是否优先显示文件类型 */
    isPrioritizeDisplayingFileType?: boolean
  }>(),
  {
    isPrioritizeDisplayingFileType: false,
  }
)
const iconContent = computed(() => {
  return fileTypeResolveIconContentUtil(props.fileData)
})
</script>

<template>
  <div>
    <!-- 左文件图标，右文字 -->
    <div class="flex items-center">
      <!-- 图标 -->
      <div class="mr-[10px] flow-root">
        <div class="my-[2px]" :class="iconContent.textColorTwcss">
          <!-- <RiFile3Fill size="32px"></RiFile3Fill> -->
          <i
            :class="iconContent.riIconClass"
            style="font-size: 32px; line-height: 32px"
          ></i>
        </div>
      </div>
      <!-- 文字 -->
      <div class="flex-1 truncate">
        <!-- 大字 文件名、类型、大小 -->
        <div class="flex items-center">
          <!-- 文件名 -->
          <div class="flex-1 truncate">
            <!-- 上 文件名 -->
            <div class="truncate text-[14px] font-bold">
              {{ fileData.fileName !== '' ? fileData.fileName : fileData.id }}
            </div>
            <!-- 下 文件描述 -->
            <div
              v-if="
                fileData.description !== '' &&
                (fileData.fileType === '' ||
                  isPrioritizeDisplayingFileType === false)
              "
            >
              <!-- <div v-if="true"> -->
              <div class="truncate text-[10px]">
                {{ fileData.description }}
              </div>
            </div>
            <div v-else>
              <div class="truncate text-[10px]">
                {{ fileData.fileType }}
              </div>
            </div>
          </div>
          <!-- 类型、大小 -->
          <div class="ml-2 flex items-center">
            <div>
              <div class="truncate text-[14px] font-bold">
                {{ formatFileSize(fileData.fileSize) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
