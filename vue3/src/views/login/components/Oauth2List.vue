<script setup lang="ts">
import { useI18nStore } from '@/stores'
import { potoMessage, urlJoinUtil } from '@/utils'
import { pocketbaseConfig } from '@/config'
import type { AuthProviderInfo } from 'pocketbase'
import { Collections } from '@/lib'
import { pb, type Create } from '@/lib'
import { useListAuthMethodsQuery } from '@/queries'
import { useRouter } from 'vue-router'
import { routerDict } from '@/config'

const i18nStore = useI18nStore()
// const oauth2List = ['google', 'microsoft', 'github', 'apple']

const listAuthMethodsQuery = useListAuthMethodsQuery()
const listAuthMethodsResult = listAuthMethodsQuery.data

const oauth2List = computed(() => {
  if (listAuthMethodsResult.value == null) {
    return []
  }
  if (listAuthMethodsResult.value.oauth2.enabled === false) {
    return []
  }
  return listAuthMethodsResult.value.oauth2.providers
})

const router = useRouter()

const authWithOAuth2 = async (providerName: AuthProviderInfo['name']) => {
  // const createData: {
  //   level: Create<Collections.Users>['level']
  // } = {
  //   level: UsersLevelOptions.basic,
  // }

  try {
    // authWithOAuth2 比较复杂，暂不使用useMutation与fetchWithTimeoutPreferred
    const res = await pb.collection(Collections.Users).authWithOAuth2({
      provider: providerName,
      // createData
    })

    console.log(res)

    router.push(routerDict.ChatHome.path)
  } catch (error) {
    potoMessage({
      type: 'error',
      message: i18nStore.t('loginFailed')(),
    })
  }
}
</script>

<template>
  <!-- 左侧水平分割线 -->
  <div
    v-if="oauth2List.length > 0"
    class="border border-color-background"
  ></div>
  <!-- 左侧下栏 -->
  <div v-if="oauth2List.length > 0" class="mx-auto max-w-96">
    <div class="m-8">
      <!-- 各平台登录按钮 -->
      <button
        v-for="item in oauth2List"
        :key="item.name"
        class="oauth2-list-item my-4 flex h-10 w-full items-center rounded-full bg-color-background-soft py-2 pl-5 pr-3"
        @click="authWithOAuth2(item.name)"
      >
        <div class="mr-2">
          <!-- 利用pocketbase本身提供的各平台图标 -->
          <img
            :src="
              urlJoinUtil(
                pocketbaseConfig.baseUrl,
                `/_/images/oauth2/${item.name}.svg`
              )
            "
            class="h-5 w-5"
          />
        </div>
        <div
          class="oauth2-text flex flex-1 items-center justify-center truncate"
        >
          <span class="truncate text-[14px] font-bold">
            {{ i18nStore.t('loginWithOauth2Text')(item.displayName) }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oauth2-list-item {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  background-color: var(--color-background-soft);
  box-shadow: 0 0 0 2px var(--color-text-soft) inset;

  // color: var(--color-text-soft);
  color: var(--color-text);

  &:hover {
    background-color: var(--color-background);
    // color: var(--color-text);
  }
}
</style>
