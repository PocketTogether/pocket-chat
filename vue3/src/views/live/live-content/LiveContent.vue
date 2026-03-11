<script setup lang="ts">
import { LiveContentUserList } from './components'
import {
  useLiveContentPageRecoverDataDesuwa,
  useLiveContentPageRecoverDataSetOnLeave,
  useLiveContentPageRecoverScrollTop,
  useLiveListUserDesuwa,
} from './composables'

const props = defineProps<{
  /** 滚动容器元素 */
  refScrollWarp?: HTMLElement
}>()

export type PropsLiveContentType = typeof props

// 页面恢复数据获取
const liveContentPageRecoverDataDesuwa = useLiveContentPageRecoverDataDesuwa()

const liveListUserDesuwa = useLiveListUserDesuwa({
  liveContentPageRecoverDataDesuwa,
})

// 页面恢复 滚动恢复
useLiveContentPageRecoverScrollTop({
  props,
  liveContentPageRecoverDataDesuwa,
})

// 页面恢复数据收集
useLiveContentPageRecoverDataSetOnLeave({
  props,
  liveListUserDesuwa,
})
</script>

<template>
  <div>
    <div class="mt-4">
      <LiveContentUserList
        :liveListUserDesuwa="liveListUserDesuwa"
      ></LiveContentUserList>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
