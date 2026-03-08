<script setup lang="ts">
import type { RealtimeUsersStatusComputedForUserRealtimeStatusType } from '@/composables'
import { usersStatusItemPresenceStatusKeyConfig } from '@/config'

const props = defineProps<{
  realtimeUsersStatusComputedForUserRealtimeStatus: RealtimeUsersStatusComputedForUserRealtimeStatusType
  size: string
}>()

const {
  //
  userRealtimeStatusForShow,
} = props.realtimeUsersStatusComputedForUserRealtimeStatus

const usipskc = usersStatusItemPresenceStatusKeyConfig
</script>

<template>
  <div>
    <div v-if="userRealtimeStatusForShow.key === usipskc.online">
      <div>
        <RiCloudFill :size="size"></RiCloudFill>
      </div>
    </div>
    <div v-else-if="userRealtimeStatusForShow.key === usipskc.typing">
      <div class="icon-typing">
        <RiSendPlane2Fill :size="size"></RiSendPlane2Fill>
      </div>
    </div>
    <div v-else-if="userRealtimeStatusForShow.key === usipskc.not_viewing">
      <div>
        <RiContrast2Fill :size="size"></RiContrast2Fill>
      </div>
    </div>
    <div v-else>
      <div>
        <RiGlobalLine :size="size"></RiGlobalLine>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// .icon-typing {
//   // 我想要一个左右摇晃的动画
// }
.icon-typing {
  animation: rotate-swing 0.8s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes rotate-swing {
  0% {
    transform: rotate(-12deg);
  }
  100% {
    transform: rotate(10deg);
  }
}
</style>
