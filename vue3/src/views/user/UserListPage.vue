<script setup lang="ts">
import { useI18nStore } from '@/stores'
import { useUserQueryModeDesuwa } from './composables'
import { UserListPageControlPanel, UserListPageTopBar } from './components'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageUserList')()),
})

const userQueryModeDesuwa = useUserQueryModeDesuwa()
</script>

<template>
  <div>
    <!-- 单列布局 -->
    <div class="mx-[8px]">
      <div
        class="mx-auto"
        :style="{
          maxWidth: '500px',
        }"
      >
        <!-- 顶栏 操作面本 用户列表 -->
        <div class="relative mb-4">
          <!-- 顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <UserListPageTopBar
              :pageTitle="i18nStore.t('pageUserList')()"
              :userQueryModeDesuwa="userQueryModeDesuwa"
            ></UserListPageTopBar>
          </div>
          <!-- 操作面板 -->
          <div class="mt-4">
            <UserListPageControlPanel
              :userQueryModeDesuwa="userQueryModeDesuwa"
            ></UserListPageControlPanel>
          </div>
          <!-- 分割线 -->
          <div class="border-t-[3px] border-color-background"></div>
          <!-- 用户列表 -->
          <div>
            <!--  -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
