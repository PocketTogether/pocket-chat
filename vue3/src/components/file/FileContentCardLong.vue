<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { formatFileSize } from '@/utils'

const props = defineProps<{
  fileData: FilesResponseWithBaseExpand
}>()
</script>

<template>
  <div>
    <!-- 左文件图标，右文字 -->
    <div class="flex items-center">
      <!-- 图标 -->
      <div class="mr-[10px] flow-root">
        <div class="my-[2px]">
          <RiFile3Fill size="32px"></RiFile3Fill>
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
            <div v-if="fileData.description !== ''">
              <!-- <div v-if="true"> -->
              <div class="truncate text-[10px]">
                {{ fileData.description }}
              </div>
            </div>
          </div>
          <!-- 类型、大小 -->
          <div class="ml-2 flex w-[200px] items-center">
            <div class="flex-1 truncate">
              <div class="truncate text-[12px] font-bold">
                {{ fileData.fileType }}
              </div>
            </div>
            <div class="ml-2">
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
