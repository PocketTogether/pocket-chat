<script setup lang="ts">
import type { FilesResponseWithBaseExpand } from '@/api'
import { FileContentCard } from '.'
import { useRouterHistoryTool } from '@/composables'
import { pb } from '@/lib'
import { useI18nStore } from '@/stores'
import { useElementSize } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    fileData: FilesResponseWithBaseExpand
    noIconColor?: boolean
  }>(),
  {
    noIconColor: false,
  }
)

// RiDownloadLine
// RiExternalLinkLine
// RiShareBoxLine

const {
  // 跳转至图片详情页的方法
  routerGoFileInfoPage,
} = useRouterHistoryTool()

const goFileInfoPage = () => {
  routerGoFileInfoPage({
    fileId: props.fileData.id,
    presetFileGetOneData: props.fileData,
  })
}

const fileOpenUrl = computed(() => {
  return pb.files.getURL(props.fileData, props.fileData.file)
})
const fileDownloadUrl = computed(() => {
  return pb.files.getURL(props.fileData, props.fileData.file, {
    download: true,
  })
})
const i18nStore = useI18nStore()

const refContentDiv = ref<HTMLElement | null>()
const sizeContentDiv = useElementSize(refContentDiv)
</script>

<template>
  <div ref="refContentDiv" class="text-color-text">
    <div class="flow-root cursor-pointer select-none" @click="goFileInfoPage">
      <div class="mx-[15px] my-[12px]">
        <FileContentCard
          :fileData="fileData"
          :isSecondLineDisplayingFileSize="sizeContentDiv.width.value < 330"
          :noIconColor="noIconColor"
        ></FileContentCard>
      </div>
    </div>
    <div class="border-t-[3px] border-color-background"></div>
    <div class="text-color-text">
      <div class="flex items-stretch">
        <!-- 左 下载 -->
        <a
          :href="fileDownloadUrl"
          download
          class="flow-root flex-1 cursor-pointer select-none truncate"
        >
          <div class="flex h-full items-center">
            <!-- 图标 -->
            <div class="my-2 ml-[14px] mr-2">
              <RiDownloadLine size="18px"></RiDownloadLine>
            </div>
            <!-- 文字 -->
            <div class="mr-[6px] flex-1 truncate">
              <div class="truncate text-center text-[13px] font-bold">
                {{ i18nStore.t('fileContentCardBarDownloadText')() }}
              </div>
            </div>
          </div>
        </a>
        <div class="border-l-[3px] border-color-background"></div>
        <!-- 右 打开 -->
        <a
          class="flow-root flex-1 cursor-pointer select-none truncate"
          :href="fileOpenUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="flex h-full items-center">
            <!-- 图标 -->
            <div class="my-2 ml-3 mr-2">
              <RiShareBoxLine size="18px"></RiShareBoxLine>
            </div>
            <!-- 文字 -->
            <div class="mr-2 flex-1 truncate">
              <div class="truncate text-center text-[13px] font-bold">
                {{ i18nStore.t('fileContentCardBarOpenText')() }}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
