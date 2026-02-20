<script setup lang="ts">
import { routerDict } from '@/config'
import { useI18nStore } from '@/stores'
import { useWatchSourceToHoldTime } from '@/utils'
import { useRoute } from 'vue-router'
import { useUserInfoQueryDesuwa } from './composables'
import { UserInfoMessagesList, UserInfoPageTopBar } from './components'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageUserInfo')()),
})

export type UserInfoRouteParamsType = typeof userInfoRouteParams

const route = useRoute()
const userInfoRouteParams = computed(() => {
  const paramRawId = route.params[routerDict.UserInfoPage.paramsKey.id]
  const id = (() => {
    if (typeof paramRawId === 'string') {
      return paramRawId
    }
    return null
  })()
  return {
    id: id,
  }
})

const userInfoQueryDesuwa = useUserInfoQueryDesuwa({
  userInfoRouteParams,
})
const {
  // 当前查询状态 "content" | "loading" | "none"
  userInfoQueryStatus,
  usersGetOneQuery,
  userInfoMessageListQuery,
  userInfoDataWithRealtime,
} = userInfoQueryDesuwa

const isFetching = computed(() => {
  return (
    usersGetOneQuery.isFetching.value ||
    userInfoMessageListQuery.isFetching.value
  )
})
// 让加载动画至少显示300ms
const { sourceHaveHold: isFetchingForAni } = useWatchSourceToHoldTime({
  source: isFetching,
  holdMs: 500,
})
</script>

<template>
  <div>
    <!-- 边距控制 -->
    <div class="mx-[8px]">
      <div
        class="mx-auto"
        :style="{
          maxWidth: '500px',
        }"
      >
        <div class="relative">
          <!-- 顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <!-- 文件详情页顶栏 -->
            <UserInfoPageTopBar
              :pageTitle="i18nStore.t('pageUserInfo')()"
              :userInfoQueryDesuwa="userInfoQueryDesuwa"
            ></UserInfoPageTopBar>
          </div>
          <!-- 内容 -->
          <div v-if="userInfoQueryStatus === 'content'">
            <!-- 用户详情显示详情显示、操作面板 -->
            <div class="mt-4">
              <!-- TODO UserInfoContentCard -->
              <div class="h-[400px] bg-red-950"></div>
            </div>
            <!-- 使用此文件的消息 -->
            <Transition name="fade" mode="out-in">
              <div
                v-if="
                  userInfoMessageListQuery.data.value != null &&
                  userInfoMessageListQuery.data.value.totalItems > 0
                "
                class="mt-4"
              >
                <!-- UserInfoMessagesList -->
                <UserInfoMessagesList
                  :userInfoQueryDesuwa="userInfoQueryDesuwa"
                ></UserInfoMessagesList>
              </div>
            </Transition>
            <!-- 刷新时的占位指示，同时充当底部高度垫片 -->
            <div class="my-4">
              <div class="flex h-[40px] items-center justify-center">
                <Transition name="fade" mode="out-in">
                  <div
                    v-show="isFetchingForAni"
                    class="h-[40px] w-[40px] overflow-hidden text-color-text-soft"
                  >
                    <RiLoader3Line
                      class="loading-spinner-800ms"
                      size="40px"
                    ></RiLoader3Line>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
          <!-- 加载状态 -->
          <div v-else-if="userInfoQueryStatus === 'loading'">
            <div class="flex h-[400px] items-center justify-center">
              <div
                class="h-[50px] w-[50px] overflow-hidden text-color-text-soft"
              >
                <RiLoader3Line
                  class="loading-spinner-800ms"
                  size="50px"
                ></RiLoader3Line>
              </div>
            </div>
          </div>
          <!-- 用户不存在 -->
          <!-- <div v-else-if="userInfoQueryStatus === 'none'"> -->
          <!-- <div v-else-if="userInfoQueryStatus === 'isBanned'"> -->
          <div v-else>
            <div class="flex h-[400px] items-center justify-center">
              <div
                class="h-[100px] w-[100px] overflow-hidden text-color-background-soft"
              >
                <!-- class="h-full max-h-[50%] w-full max-w-[50%] object-contain" -->
                <RiMessage3Fill size="100px"></RiMessage3Fill>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
