<script setup lang="ts">
import { useRealtimeUsersStatusComputedForUserRealtimeStatus } from '@/composables'
import type { MessageDisplayDesuwaType } from './dependencies'
import { UserRealtimeStatusToIcon } from '@/components/user'

const props = defineProps<{
  messageDisplayDesuwa: MessageDisplayDesuwaType
  goUserInfoPage: () => void
}>()

const {
  //
  isMessageCurrentUser,
  messageUserName,
  timeAgo,
  messageUserId,
} = props.messageDisplayDesuwa

const realtimeUsersStatusComputedForUserRealtimeStatus =
  useRealtimeUsersStatusComputedForUserRealtimeStatus({
    userId: messageUserId,
  })
const { userRealtimeStatusForShow } =
  realtimeUsersStatusComputedForUserRealtimeStatus
</script>

<template>
  <div>
    <div
      class="mb-3 flex select-none items-center"
      :class="{
        // 消息为当前用户发送，flex-row-reverse使其靠右显示
        'flex-row-reverse': isMessageCurrentUser,
      }"
    >
      <!-- 用户名 -->
      <div
        class="max-w-[50%] cursor-pointer truncate text-[12px] font-bold transition-colors"
        :style="{
          color: userRealtimeStatusForShow.color,
        }"
        @click="goUserInfoPage"
      >
        {{ messageUserName }}
      </div>
      <!-- 状态图标 -->
      <div class="flow-root">
        <div
          class="mx-[5px] cursor-pointer transition-colors"
          :style="{
            color: userRealtimeStatusForShow.color,
          }"
          @click="goUserInfoPage"
        >
          <Transition mode="out-in" name="fade-pop">
            <div :key="userRealtimeStatusForShow.key">
              <UserRealtimeStatusToIcon
                :realtimeUsersStatusComputedForUserRealtimeStatus="
                  realtimeUsersStatusComputedForUserRealtimeStatus
                "
                size="12px"
              ></UserRealtimeStatusToIcon>
            </div>
          </Transition>
        </div>
      </div>
      <!-- 时间 -->
      <div class="mx-[2px] truncate text-[12px] text-color-text-soft">
        {{ timeAgo }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
