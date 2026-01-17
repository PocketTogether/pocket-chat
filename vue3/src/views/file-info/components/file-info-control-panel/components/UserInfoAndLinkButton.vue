<script setup lang="ts">
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import type { FileInfoQueryDesuwaType } from './dependencies'
import { computed } from 'vue'
import { pb } from '@/lib'
import { potoMessage, potoNotification } from '@/utils'
import { useClipboard } from '@vueuse/core'
import { useI18nStore } from '@/stores'

const props = defineProps<{
  fileInfoQueryDesuwa: FileInfoQueryDesuwaType
}>()

const {
  //
  filesGetOneQuery,
  fileInfoQueryStatus,
  fileInfoDataWithRealtime,
} = props.fileInfoQueryDesuwa

/**
 * 当前文件记录
 */
const fileRecord = computed(() => fileInfoDataWithRealtime.value)

/**
 * 作者（假定已 expand author）
 */
const fileAuthor = computed(() => fileRecord.value?.expand?.author)

/**
 * 作者头像 URL
 */
const authorAvatarUrl = computed(() => {
  // 无数据（理论上不会渲染到这里，返回默认头像兜底）
  if (fileInfoDataWithRealtime.value == null) {
    return appUserDefaultAvatar
  }

  // expand.author 异常（pb expand / api 配置问题）
  if (fileAuthor.value == null) {
    console.error('fileAuthor.value == null')
    return appUserDefaultAvatar
  }

  // 无头像
  if (fileAuthor.value.avatar === '') {
    return appUserDefaultAvatar
  }

  // 有头像，返回 PB 文件 URL
  return pb.files.getURL(fileAuthor.value, fileAuthor.value.avatar, {
    thumb: fileUserAvatarConfig.thumb200x200,
  })
})

/**
 * 作者名称
 */
const authorName = computed(() => {
  if (fileAuthor.value?.name == null || fileAuthor.value?.name === '') {
    return authorUsername.value
  }
  return fileAuthor.value.name
})

/**
 * 作者用户名
 */
const authorUsername = computed(() => {
  return fileAuthor.value?.username ?? ''
})

const i18nStore = useI18nStore()

const fileOpenUrl = computed(() => {
  if (fileRecord.value == null) {
    return null
  }
  return pb.files.getURL(fileRecord.value, fileRecord.value.file)
})
const fileDownloadUrl = computed(() => {
  if (fileRecord.value == null) {
    return null
  }
  return pb.files.getURL(fileRecord.value, fileRecord.value.file, {
    download: true,
  })
})
</script>

<template>
  <div>
    <div class="ml-[15px] mr-[5px] flex items-center justify-between">
      <!-- 左侧：用户信息 -->
      <div class="flex flex-1 items-center truncate">
        <!-- 头像 -->
        <div
          class="h-[44px] w-[44px] shrink-0 rounded-full border-[2px] border-color-background-soft bg-color-background-soft"
          :style="{
            backgroundImage: `url('${authorAvatarUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        ></div>

        <!-- 名称 / 用户名 -->
        <div class="ml-[10px] flex-1 truncate">
          <div class="truncate font-bold text-color-text">
            {{ authorName }}
          </div>
          <div class="truncate text-[12px] text-color-text-soft">
            @{{ authorUsername }}
          </div>
        </div>
      </div>

      <!-- 右侧：复制文件链接按钮 -->
      <div>
        <div class="mx-[3px] flex items-center">
          <a
            v-if="fileDownloadUrl != null"
            class="mx-[7px] cursor-pointer text-color-text hover:text-el-primary"
            :href="fileDownloadUrl"
            download
          >
            <RiDownloadLine size="24px" />
          </a>
          <a
            v-if="fileOpenUrl != null"
            class="mx-[7px] cursor-pointer text-color-text hover:text-el-primary"
            :href="fileOpenUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiShareBoxLine size="24px" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
