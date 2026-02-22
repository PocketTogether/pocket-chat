<script setup lang="ts">
import { TextWithLink } from '@/components'
import type { UserInfoQueryDesuwaType } from './dependencies'
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import { useI18nStore } from '@/stores'
import { useTimeAgo } from '@vueuse/core'

const props = defineProps<{
  userInfoQueryDesuwa: UserInfoQueryDesuwaType
}>()

const { userInfoDataWithRealtime } = props.userInfoQueryDesuwa

/** 当前用户数据（可能为 null） */
const user = computed(() => userInfoDataWithRealtime.value)

/** 头像 URL（无头像 → 默认） */
const avatarUrl200 = computed(() => {
  if (user.value == null) return appUserDefaultAvatar
  if (user.value.avatar === '') return appUserDefaultAvatar
  return pb.files.getURL(user.value, user.value.avatar, {
    thumb: fileUserAvatarConfig.thumb200x200,
  })
})

const avatarUrl400 = computed(() => {
  if (user.value == null) return appUserDefaultAvatar
  if (user.value.avatar === '') return appUserDefaultAvatar
  return pb.files.getURL(user.value, user.value.avatar, {
    thumb: fileUserAvatarConfig.thumb400x400,
  })
})

// 名称
const userDisplayName = computed(() => {
  const u = user.value

  // 无数据
  if (u == null) return ''

  // 无名称 → 返回用户名
  if (u.name === '') {
    return u.username
  }

  // 有名称 → 返回名称
  return u.name
})

// 用户名
const userDisplayUsername = computed(() => {
  return user.value?.username ?? ''
})

const i18nStore = useI18nStore()

/** 加入时间（created） */
const joinedAt = useTimeAgo(
  computed(() => user.value?.created ?? ''),
  {
    messages: i18nStore.t('useTimeAgoMessages')(),
    max: 'day',
  }
)

// /** 上次在线（updated） */
// const lastOnline = useTimeAgo(
//   computed(() => user.value?.updated),
//   {
//     messages: i18nStore.t('useTimeAgoMessages')(),
//     max: 'day',
//   }
// )
</script>

<template>
  <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
    <!-- 顶部背景 + 头像占位 -->
    <div class="bg-color-background">
      <div class="h-[20px]"></div>

      <!-- 头像行背景圆角 -->
      <div class="flow-root rounded-t-[24px] bg-color-background-soft">
        <div class="my-[10px] ml-[16px] mr-[20px]">
          <div class="flex items-center justify-between">
            <!-- 左：名称 / 用户名 -->
            <div class="flex flex-1 items-center truncate">
              <!-- 头像占位宽度 -->
              <div class="w-[70px]"></div>

              <div class="ml-[12px] flex-1 truncate">
                <div class="truncate text-[16px] font-bold text-color-text">
                  {{ userDisplayName }}
                </div>
                <div class="truncate text-[12px] text-color-text-soft">
                  @{{ userDisplayUsername }}
                </div>
              </div>
            </div>

            <!-- 右侧：状态 -->
            <div class="">
              <div
                class="ml-[4px] flex select-none items-center text-color-text-soft"
              >
                <!-- 状态文字 -->
                <div class="mr-[4px]">
                  <div class="text-[13px] font-bold">离线</div>
                </div>
                <!-- 状态图标 -->
                <div>
                  <div>
                    <RiGlobalLine size="22px"></RiGlobalLine>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 头像本体（绝对定位） -->
    <div class="relative">
      <div class="absolute bottom-[10px] left-[16px]">
        <div
          class="h-[70px] w-[70px] rounded-full border-[3px] border-color-background bg-color-background"
          :style="{
            backgroundImage: `url('${avatarUrl200}')`,
            // backgroundImage: `url('${avatarUrl400}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }"
        >
          <div
            class="h-full w-full rounded-full"
            :style="{
              backgroundImage: `url('${avatarUrl400}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div
      v-if="user?.bio != null && user?.bio != ''"
      class="border-t-[3px] border-color-background"
    ></div>
    <!-- 简介 -->
    <div v-if="user?.bio != null && user?.bio != ''" class="mb-3 mt-2">
      <div class="mx-5 text-[14px] font-bold text-color-text">
        {{ i18nStore.t('userInfoPageUserContentBioTitle')() }}
      </div>
      <div class="mx-5 mt-[4px] flex justify-center">
        <div class="wrap-long-text text-[14px] text-color-text">
          <!-- {{ user.bio }} -->
          <TextWithLink
            :data="user.bio"
            aTwcss="text-el-primary hover:underline"
          ></TextWithLink>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <div class="border-t-[3px] border-color-background"></div>

    <!-- 加入时间 -->
    <div class="mb-3 mt-2">
      <div class="mx-5 text-[14px] font-bold text-color-text">
        {{ i18nStore.t('userInfoPageUserContentJoinedAtTitle')() }}
      </div>
      <div class="mx-5 mt-[4px] flex justify-end">
        <div class="text-[14px] font-bold text-color-text-soft">
          {{ joinedAt }}
        </div>
      </div>
    </div>

    <!-- 加入时间 + 上次在线 -->
    <!-- <div class="flex">
      <div class="flex-1">
        <div class="mb-3 mt-2">
          <div class="mx-5 text-[14px] font-bold text-color-text">
            {{ i18nStore.t('userInfoPageUserContentJoinedAtTitle')() }}
          </div>
          <div class="mx-5 mt-[4px] flex justify-end">
            <div class="text-[14px] font-bold text-color-text-soft">
              {{ joinedAt }}
            </div>
          </div>
        </div>
      </div>
      <div class="border-l-[3px] border-color-background"></div>
      <div class="flex-1">
        <div class="mb-3 mt-2">
          <div class="mx-5 text-[14px] font-bold text-color-text">
            {{ i18nStore.t('userInfoPageUserContentLastOnlineTitle')() }}
          </div>
          <div class="mx-5 mt-[4px] flex justify-end">
            <div class="text-[14px] font-bold text-color-text-soft">
              {{ lastOnline }}
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<style lang="scss" scoped></style>
