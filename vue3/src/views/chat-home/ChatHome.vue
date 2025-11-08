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

/** 窗口宽度大于1024时聊天栏宽度较大，小于则聊天栏宽度较小 */
const showChatWidthLargerTrueWidthSmallerFalse = computed(() => {
  if (windowWidth.value >= 1024) {
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
    })
  }
}

const profileQuery = useProfileQuery()
</script>

<template>
  <div class="mx-[8px]">
    <div
      class="mx-auto"
      :class="{
        'max-w-[768px]': showChatWidthLargerTrueWidthSmallerFalse,
        'max-w-[512px]': !showChatWidthLargerTrueWidthSmallerFalse,
      }"
    >
      <ChatCol
        :refScrollWarp="appMainElScrollbar?.wrapRef"
        :couldGoBack="false"
        roomId=""
        :chatTitle="websiteName"
      >
        <template #chatTopBarMoreMenu>
          <!-- 测试批量添加消息 -->
          <ChatTopBarMoreMenuItem @click="testPbSendMessage">
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
