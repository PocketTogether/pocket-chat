<script setup lang="ts">
import { layoutChatPageConfig, routerDict } from '@/config'
import { ChatCol, ChatTopBarMoreMenuItem } from '@/components'
import { injectAppMainElScrollbar } from '@/composables'
import { usePbCollectionConfigQuery, useProfileQuery } from '@/queries'
import { useAuthStore, useI18nStore } from '@/stores'
import { useWindowSize } from '@vueuse/core'
import { pbMessagesSendChatApi } from '@/api'
import { generateRandomIntegerBetween, generateRandomKey } from '@/utils'

const i18nStore = useI18nStore()

// inject获取应用主滚动实例
const appMainElScrollbar = injectAppMainElScrollbar()

const pbCollectionConfigQuery = usePbCollectionConfigQuery()

const websiteName = computed(
  () => pbCollectionConfigQuery.data.value?.['website-name'] ?? ''
)

const authStore = useAuthStore()

const { width: windowWidth } = useWindowSize()

/** 窗口宽度大于600时聊天栏边距宽度较大，小于则聊天栏边距宽度较小 */
const showChatWidthLargerTrueWidthSmallerFalse = computed(() => {
  if (windowWidth.value >= 600) {
    return true
  }
  return false
})

// 测试批量添加消息
const testPbSendMessage = async () => {
  // const sendNum = generateRandomIntegerBetween(1, 10)
  const sendNum = 10
  for (let i = 0; i < sendNum; i++) {
    await pbMessagesSendChatApi({
      content: generateRandomKey(
        generateRandomIntegerBetween(5, generateRandomIntegerBetween(20, 200))
      ),
      roomId: '',
      images: [],
      file: '',
    })
  }
}

const isDev = import.meta.env.DEV
</script>

<template>
  <div
    :class="{
      'mx-[40px]': showChatWidthLargerTrueWidthSmallerFalse,
      'mx-[8px]': !showChatWidthLargerTrueWidthSmallerFalse,
    }"
  >
    <div
      class="mx-auto max-w-[768px]"
      :class="{
        // 'max-w-[768px]': showChatWidthLargerTrueWidthSmallerFalse,
        // 'max-w-[512px]': !showChatWidthLargerTrueWidthSmallerFalse,
      }"
    >
      <ChatCol
        :refScrollWarp="appMainElScrollbar?.wrapRef"
        :couldGoBack="false"
        roomId=""
        :chatTitle="websiteName"
      >
        <!-- 插槽 -->
        <template #chatTopBarMoreMenu>
          <!-- 测试批量添加消息，开发时才显示 -->
          <ChatTopBarMoreMenuItem v-if="isDev" @click="testPbSendMessage">
            <!-- <ChatTopBarMoreMenuItem @click="testPbSendMessage"> -->
            <template #icon>
              <RiFlaskLine size="18px"></RiFlaskLine>
            </template>
            <template #text> 测试批量添加消息 </template>
          </ChatTopBarMoreMenuItem>

          <!-- 转到设置，已登录时才显示 -->
          <ChatTopBarMoreMenuItem
            v-if="authStore.isValid"
            @click="$router.push(routerDict.ChatSetting.path)"
          >
            <template #icon>
              <RiSettingsLine size="18px"></RiSettingsLine>
            </template>
            <template #text> {{ i18nStore.t('pageSetting')() }} </template>
          </ChatTopBarMoreMenuItem>
        </template>
      </ChatCol>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
