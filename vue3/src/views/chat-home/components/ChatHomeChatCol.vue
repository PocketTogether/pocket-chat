<script setup lang="ts">
import { routerDict } from '@/config'
import { ChatCol, ChatTopBarMoreMenuItem } from '@/components'
import { injectAppMainElScrollbar } from '@/composables'
import { usePbCollectionConfigQuery } from '@/queries'
import { useAuthStore, useI18nStore } from '@/stores'
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
  <div>
    <ChatCol
      :refScrollWarp="appMainElScrollbar?.wrapRef"
      :couldGoBack="false"
      roomId=""
      :chatTitle="websiteName"
    >
      <!-- 插槽 -->
      <template #chatTopBarMoreMenu>
        <!-- 测试批量添加消息，开发时才显示 -->
        <!-- <ChatTopBarMoreMenuItem v-if="isDev" @click="testPbSendMessage">
            <template #icon>
              <RiFlaskLine size="18px"></RiFlaskLine>
            </template>
            <template #text> 测试批量添加消息 </template>
          </ChatTopBarMoreMenuItem> -->

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

        <!-- 成员 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.UserListPage.path)"
        >
          <template #icon>
            <RiGroupLine size="18px"></RiGroupLine>
          </template>
          <template #text> {{ i18nStore.t('pageUserList')() }} </template>
        </ChatTopBarMoreMenuItem>

        <!-- 搜索 -->
        <ChatTopBarMoreMenuItem
          @click="$router.push(routerDict.SearchPage.path)"
        >
          <template #icon>
            <!-- 微调 -->
            <RiSearchLine size="18px" class="translate-y-[1px]"></RiSearchLine>
          </template>
          <template #text> {{ i18nStore.t('pageSearch')() }} </template>
        </ChatTopBarMoreMenuItem>
      </template>
    </ChatCol>
  </div>
</template>

<style lang="scss" scoped></style>
