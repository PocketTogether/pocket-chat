<script setup lang="ts">
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import type { ImageInfoQueryDesuwaType } from './dependencies'
import { computed } from 'vue'
import { pb } from '@/lib'
import {
  pbImageDataChooseByLargest,
  pbImageDataChooseByLargestWithUrl,
  potoMessage,
  potoNotification,
} from '@/utils'
import { useClipboard } from '@vueuse/core'
import { useI18nStore } from '@/stores'

const props = defineProps<{
  imageInfoQueryDesuwa: ImageInfoQueryDesuwaType
}>()

const {
  //
  imagesGetOneQuery,
  imageInfoQueryStatus,
  imageInfoDataWithRealtime,
} = props.imageInfoQueryDesuwa

/**
 * 当前图片记录
 */
const imageRecord = computed(() => imageInfoDataWithRealtime.value)

/**
 * 作者（假定已 expand author）
 */
const imageAuthor = computed(() => imageRecord.value?.expand?.author)

/**
 * 作者头像 URL
 */
const authorAvatarUrl = computed(() => {
  // 无数据（理论上不会渲染到这里，返回默认头像兜底）
  if (imageInfoDataWithRealtime.value == null) {
    return appUserDefaultAvatar
  }

  // expand.author 异常（pb expand / api 配置问题）
  if (imageAuthor.value == null) {
    console.error('imageAuthor.value == null')
    return appUserDefaultAvatar
  }

  // 无头像
  if (imageAuthor.value.avatar === '') {
    return appUserDefaultAvatar
  }

  // 有头像，返回 PB 文件 URL
  return pb.files.getURL(imageAuthor.value, imageAuthor.value.avatar, {
    thumb: fileUserAvatarConfig.thumb200x200,
  })
})

/**
 * 作者名称
 */
const authorName = computed(() => {
  if (imageAuthor.value?.name == null || imageAuthor.value?.name === '') {
    return authorUsername.value
  }
  return imageAuthor.value.name
})

/**
 * 作者用户名
 */
const authorUsername = computed(() => {
  return imageAuthor.value?.username ?? ''
})

const clipboard = useClipboard()
const i18nStore = useI18nStore()

/**
 * 复制图片链接（占位）
 */
const copyImageLink = async () => {
  if (imageRecord.value == null) {
    return
  }
  const link = pbImageDataChooseByLargestWithUrl(imageRecord.value).url

  // 浏览支持复制
  if (clipboard.isSupported.value) {
    try {
      await clipboard.copy(link)
      potoNotification({
        type: 'success',
        title: i18nStore.t('imageInfoPageImageLinkCopyText')(),
        message: link,
      })
    } catch (error) {
      potoNotification({
        type: 'warning',
        title: i18nStore.t('imageInfoPageImageLinkCopyNotSupportedTitle')(),
        message: link,
      })
    }
  }
  // 浏览器不支持复制
  else {
    potoNotification({
      type: 'warning',
      title: i18nStore.t('imageInfoPageImageLinkCopyNotSupportedTitle')(),
      message: link,
    })
  }
}

const imageChoose = computed(() => {
  if (imageRecord.value == null) {
    return null
  }
  return pbImageDataChooseByLargest(imageRecord.value)
})

const imageOpenUrl = computed(() => {
  if (imageRecord.value == null) {
    return null
  }
  if (imageChoose.value == null) {
    return null
  }
  return pb.files.getURL(imageRecord.value, imageChoose.value.image)
})
const imageDownloadUrl = computed(() => {
  if (imageRecord.value == null) {
    return null
  }
  if (imageChoose.value == null) {
    return null
  }
  return pb.files.getURL(imageRecord.value, imageChoose.value.image, {
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

      <!-- 右侧：链接按钮 -->
      <div>
        <div class="mx-[3px] flex items-center">
          <a
            v-if="imageDownloadUrl != null"
            class="mx-[7px] cursor-pointer text-color-text hover:text-el-primary"
            :href="imageDownloadUrl"
            download
          >
            <RiDownloadLine size="24px" />
          </a>
          <a
            v-if="imageOpenUrl != null"
            class="mx-[7px] cursor-pointer text-color-text hover:text-el-primary"
            :href="imageOpenUrl"
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
