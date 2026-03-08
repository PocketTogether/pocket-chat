<script setup lang="ts">
import type { UsersResponseWithBaseExpand } from '@/api'
import { UserRealtimeStatusToIcon } from '@/components'
import {
  useRealtimeUsersStatusComputedForUserRealtimeStatus,
  useRouterHistoryTool,
} from '@/composables'
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'
import { RiGlobalLine } from '@remixicon/vue'

const props = defineProps<{
  userData: UsersResponseWithBaseExpand
}>()

const userAuthor = computed(() => props.userData)

/**
 * 作者头像 URL
 */
const authorAvatarUrl = computed(() => {
  // 无头像
  if (userAuthor.value.avatar === '') {
    return appUserDefaultAvatar
  }
  // 有头像，返回 PB 文件 URL
  return pb.files.getURL(userAuthor.value, userAuthor.value.avatar, {
    thumb: fileUserAvatarConfig.thumb200x200,
  })
})

/**
 * 作者名称
 */
const authorName = computed(() => {
  if (userAuthor.value.name === '') {
    return authorUsername.value
  }
  return userAuthor.value.name
})

/**
 * 作者用户名
 */
const authorUsername = computed(() => {
  return userAuthor.value.username
})

const {
  // 跳转至用户详情页的方法
  routerGoUserInfoPage,
} = useRouterHistoryTool()

const goUserInfoPage = () => {
  routerGoUserInfoPage({
    userId: props.userData.id,
    presetUserGetOneData: props.userData,
  })
}

const realtimeUsersStatusComputedForUserRealtimeStatus =
  useRealtimeUsersStatusComputedForUserRealtimeStatus({
    userId: computed(() => userAuthor.value.id),
  })
const { userRealtimeStatusForShow } =
  realtimeUsersStatusComputedForUserRealtimeStatus
</script>

<template>
  <div>
    <div class="flow-root cursor-pointer select-none" @click="goUserInfoPage">
      <div class="mx-[16px] my-[6px]">
        <div class="flex items-center justify-between">
          <!-- 左侧：用户信息 -->
          <div class="flex flex-1 items-center truncate">
            <!-- 头像 -->
            <div
              class="h-[44px] w-[44px] shrink-0 rounded-full border-[2px] border-color-background bg-color-background"
              :style="{
                backgroundImage: `url('${authorAvatarUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }"
            ></div>

            <!-- 名称 / 用户名 -->
            <div class="ml-[10px] flex-1 truncate">
              <div class="truncate text-[15px] font-bold text-color-text">
                {{ authorName }}
              </div>
              <div class="truncate text-[12px] text-color-text-soft">
                @{{ authorUsername }}
              </div>
            </div>
          </div>

          <!-- 右侧：状态 -->
          <div class="">
            <div
              class="ml-[3px] flex select-none items-center transition-colors"
              :style="{
                color: userRealtimeStatusForShow.color,
              }"
            >
              <!-- 状态文字 -->
              <div class="mr-[7px]">
                <Transition mode="out-in" name="fade200ms">
                  <div :key="userRealtimeStatusForShow.key">
                    <div class="text-[13px] font-bold">
                      {{ userRealtimeStatusForShow.text }}
                    </div>
                  </div>
                </Transition>
              </div>
              <!-- 状态图标 -->
              <div>
                <Transition mode="out-in" name="fade-pop">
                  <div :key="userRealtimeStatusForShow.key">
                    <UserRealtimeStatusToIcon
                      :realtimeUsersStatusComputedForUserRealtimeStatus="
                        realtimeUsersStatusComputedForUserRealtimeStatus
                      "
                      size="21px"
                    ></UserRealtimeStatusToIcon>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
