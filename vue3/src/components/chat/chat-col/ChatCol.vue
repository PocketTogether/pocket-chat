<script setup lang="ts">
import ChatColTwowayPositioningCursor from './ChatColTwowayPositioningCursor.vue'

const props = defineProps<{
  /** 滚动容器元素 */
  refScrollWarp?: HTMLElement
  /** 是否能返回，控制聊天顶栏的返回按钮是否显示 */
  couldGoBack: boolean
  /** 房间id，空字符串为全局聊天 */
  roomId: string
  /** 聊天标题 */
  chatTitle: string
}>()
</script>

<template>
  <div>
    <ChatColTwowayPositioningCursor
      :key="roomId"
      :refScrollWarp="refScrollWarp"
      :couldGoBack="couldGoBack"
      :roomId="roomId"
      :chatTitle="chatTitle"
    >
      <template #chatTopBarMoreMenu>
        <!-- 聊天顶栏菜单项 插槽 -->
        <slot name="chatTopBarMoreMenu"></slot>
      </template>
    </ChatColTwowayPositioningCursor>
  </div>
</template>

<style lang="scss" scoped></style>
