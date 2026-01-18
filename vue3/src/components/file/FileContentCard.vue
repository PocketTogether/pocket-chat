<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { fileTypeResolveIconContentUtil, formatFileSize } from '@/utils'

const props = withDefaults(
  defineProps<{
    fileData: FilesResponseWithBaseExpand
    /** 是否优先显示文件类型 */
    isPrioritizeDisplayingFileType?: boolean
    /** 是否让文件大小显示在第二行 */
    isSecondLineDisplayingFileSize?: boolean
    /** 不为图标上色 */
    noIconColor?: boolean
  }>(),
  {
    isPrioritizeDisplayingFileType: false,
    isSecondLineDisplayingFileSize: false,
    noIconColor: false,
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
        <div
          class="my-[2px] transition-colors"
          :class="{
            [iconContent.textColorTwcss]: !noIconColor,
          }"
        >
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
            <!-- 下 小字 -->
            <div class="flex items-center">
              <!-- 文件描述、类型 -->
              <div class="flex-1 truncate">
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
              <!-- 大小 -->
              <div v-if="isSecondLineDisplayingFileSize" class="ml-2">
                <div class="truncate text-[10px] font-bold">
                  {{ formatFileSize(fileData.fileSize) }}
                </div>
              </div>
            </div>
          </div>
          <!-- 大小 -->
          <div
            v-if="!isSecondLineDisplayingFileSize"
            class="ml-2 flex items-center"
          >
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
