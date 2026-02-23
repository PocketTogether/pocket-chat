<script setup lang="ts">
import type { MessagesResponseWithFileInfoMessageListExpand } from '@/api'
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import { useI18nStore } from '@/stores'
import { useMessageContentProcess, useMessageLinkProcess } from '@/composables'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  messageItem: MessagesResponseWithFileInfoMessageListExpand
}>()

const messageData = computed(() => props.messageItem)

const messageAuthor = computed(() => props.messageItem.expand?.author)

const authorAvatarUrl = computed(() => {
  // expand.author 异常（pb expand / api 配置问题）
  if (messageAuthor.value == null) {
    console.error('messageAuthor.value == null')
    return appUserDefaultAvatar
  }

  // 无头像
  if (messageAuthor.value.avatar === '') {
    return appUserDefaultAvatar
  }

  // 有头像，返回 PB 文件 URL
  return pb.files.getURL(messageAuthor.value, messageAuthor.value.avatar, {
    thumb: fileUserAvatarConfig.thumb100x100,
  })
})

// 消息
const { messageContentText } = useMessageContentProcess({
  messageData,
})

const i18nStore = useI18nStore()

/** 时间（useTimeAgo） */
const timeAgo = useTimeAgo(
  computed(() => messageData.value.created),
  {
    messages: i18nStore.t('useTimeAgoMessages')(),
    max: 'day',
  }
)

const {
  /** 复制消息链接 */
  copyMessageLink,
  /** 消息跳转所需对象 */
  messageRouterResolveObj,
} = useMessageLinkProcess({
  messageData,
})
</script>

<template>
  <div>
    <!-- 列表项 -->
    <div class="mx-[8px] my-[6px]">
      <div class="flex items-center justify-between">
        <!-- 左 用户头像与日期 -->
        <div class="flex flex-1 items-center truncate">
          <!-- 头像 -->
          <div class="mr-[6px]">
            <div class="flow-root">
              <div class="m-[2px]">
                <div
                  class="h-[24px] w-[24px] rounded-full bg-color-background-mute"
                  :style="{
                    backgroundImage: `url('${authorAvatarUrl}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }"
                ></div>
              </div>
            </div>
          </div>
          <!-- 消息 -->
          <div class="flex-1 truncate">
            <div class="mr-[8px] flex items-center justify-between">
              <div class="flex-1 truncate">
                <div
                  class="select-none truncate text-[14px] font-bold text-color-text"
                >
                  {{ messageContentText }}
                </div>
              </div>
              <div class="ml-[5px]">
                <div
                  class="select-none text-[11px] font-normal italic text-color-text-soft"
                >
                  {{ timeAgo }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 右 操作图标 -->
        <div class="flex items-center">
          <!-- 复制链接 -->
          <div
            class="flow-root cursor-pointer text-color-text hover:text-el-primary"
            @click="copyMessageLink"
          >
            <div class="m-[4px]">
              <RiLink size="20px"></RiLink>
            </div>
          </div>
          <!-- 跳转 -->
          <RouterLink
            v-if="messageRouterResolveObj != null"
            class="flow-root cursor-pointer text-color-text hover:text-el-primary"
            :to="messageRouterResolveObj"
          >
            <div class="m-[4px]">
              <RiArrowRightLine size="20px"></RiArrowRightLine>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
