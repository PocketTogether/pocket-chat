<script setup lang="ts">
import { i18nLocaleInfo } from './config'
import {
  useI18nStore,
  useRealtimeMessagesStore,
  useUploadImageStore,
} from './stores'
import { useDark } from '@vueuse/core'
import { computed } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import {
  provideAppMainElScrollbar,
  useFirstDataLoadingAndAnimationMaskClose,
  useInitPbAuth,
  useInitWebNotif,
  useRealtimeImagesSubscribe,
  useRealtimeMessagesSubscribe,
  useWatchAllowAnonymousViewAndAuthStoreIsValidCheckRouterLoginPage,
  type AppMainElScrollbar,
} from './composables'
import type { ElScrollbar } from 'element-plus'
import {
  useChatRoomMessagesInfiniteTwowayQuery,
  usePbCollectionConfigQuery,
  useProfileQuery,
} from './queries'
import { watchUntilQueryReady } from './utils'

const i18nStore = useI18nStore()
// 配置信息
const pbCollectionConfigQuery = usePbCollectionConfigQuery()
// 个人信息
const profileQuery = useProfileQuery()
// 聊天页消息 游标分页无限查询
const chatRoomMessagesInfiniteTwowayQuery =
  useChatRoomMessagesInfiniteTwowayQuery({
    roomId: computed(() => ''),
    twowayPositioningCursorData: computed(() => null),
  })

const websiteName = computed(
  () => pbCollectionConfigQuery.data.value?.['website-name']
)

// @unhead/vue
useHead({
  htmlAttrs: { lang: computed(() => i18nStore.locale) }, // BCP 47 language code
})
useSeoMeta({
  titleTemplate: (titleChunk) => {
    const siteName = websiteName.value ?? ''
    if (titleChunk == null) {
      return siteName
    }
    return `${titleChunk} - ${siteName}`
  },
})

// use消息订阅
const realtimeMessagesSubscribe = useRealtimeMessagesSubscribe()

// 控制首次数据的加载，以及加载动画遮罩的关闭
useFirstDataLoadingAndAnimationMaskClose({
  dataFirstLoadService: async () => {
    // 启动消息订阅
    await realtimeMessagesSubscribe.startSubscribe()
    // 遮罩的关闭会等待主要的query
    await watchUntilQueryReady(pbCollectionConfigQuery)
    await watchUntilQueryReady(profileQuery)
    await watchUntilQueryReady(chatRoomMessagesInfiniteTwowayQuery)
  },
})

// use图片订阅
const realtimeImagesSubscribe = useRealtimeImagesSubscribe()
realtimeImagesSubscribe.startSubscribe()

// 在程序初始化时，进行关于pocketbase身份验证的一些操作
useInitPbAuth()

// 监听，在禁止游客查看且未登录时跳转至登录页
useWatchAllowAnonymousViewAndAuthStoreIsValidCheckRouterLoginPage()

// 请求通知权限，并在成功时提示
useInitWebNotif()

// 初始化图片上传系统
const uploadImageStore = useUploadImageStore()
uploadImageStore.initialize()

const isDark = useDark()

// el滚动条的组件实例。【251017】不再使用HTML页面级滚动，使用el滚动条
const appMainElScrollbar: AppMainElScrollbar = ref(null)
provideAppMainElScrollbar(appMainElScrollbar)
</script>

<template>
  <!-- NConfigProvider 主题控制 国际化控制 -->
  <NConfigProvider
    :theme="isDark ? darkTheme : lightTheme"
    :locale="i18nLocaleInfo[i18nStore.locale].nuLocale"
    :dateLocale="i18nLocaleInfo[i18nStore.locale].nuDateLocale"
  >
    <!-- ElConfigProvider 国际化控制 -->
    <ElConfigProvider :locale="i18nLocaleInfo[i18nStore.locale].elLocale">
      <ElScrollbar
        ref="appMainElScrollbar"
        height="100dvh"
        class="appMainElScrollbar"
      >
        <RouterView></RouterView>
      </ElScrollbar>
    </ElConfigProvider>
  </NConfigProvider>
</template>

<style scoped lang="scss"></style>
