<script setup lang="ts">
import { layoutSettingPageConfig } from '@/config'
import { useAuthStore, useI18nStore } from '@/stores'
import { useWindowSize } from '@vueuse/core'
import UpdateNameBio from './components/UpdateNameBio.vue'
import UpdateUsername from './components/UpdateUsername.vue'
import UpdateAvatar from './components/UpdateAvatar.vue'
import UpdateEmail from './components/UpdateEmail.vue'
import VerifyEmail from './components/VerifyEmail.vue'
import UpdatePassword from './components/UpdatePassword.vue'
import LogOut from './components/LogOut.vue'
import NotLoginPrompt from './components/NotLoginPrompt.vue'

const i18nStore = useI18nStore()
useSeoMeta({
  title: computed(() => i18nStore.t('pageSettingProfile')()),
})

const { width: windowWidth } = useWindowSize()
/**
 * 窗口大于等于1024显示两列，小于则显示一列
 * useWindowSize
 */
const showContentTrueCol2FalseCol1 = computed(() => {
  if (
    windowWidth.value >= layoutSettingPageConfig.breakpointContentCol2ToCol1
  ) {
    return true
  }
  return false
})

const authStore = useAuthStore()
</script>

<template>
  <div>
    <!-- 未登录则显示提示 -->
    <NotLoginPrompt
      v-if="!authStore.isValid"
      :showContentTrueCol2FalseCol1="showContentTrueCol2FalseCol1"
    ></NotLoginPrompt>

    <!-- 大屏 双列-->
    <div v-if="showContentTrueCol2FalseCol1" class="flex gap-x-6">
      <!-- 第一列 -->
      <div class="flex-1">
        <!-- 需登录 修改头像 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <UpdateAvatar></UpdateAvatar>
          </div>
        </div>

        <!-- 需登录 修改昵称简介 -->
        <!-- 圆角盒子 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <!-- 内容盒子 -->
          <div class="m-4">
            <!-- 修改昵称简介组件 -->
            <UpdateNameBio></UpdateNameBio>
          </div>
        </div>

        <!-- 需登录 退出登录 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <LogOut></LogOut>
          </div>
        </div>
      </div>

      <!-- 第二列 -->
      <div class="flex-1">
        <!-- 需登录 修改用户名 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <UpdateUsername></UpdateUsername>
          </div>
        </div>
        <!-- 需登录 修改邮箱 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <UpdateEmail></UpdateEmail>
          </div>
        </div>
        <!-- 需登录 修改密码 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <UpdatePassword></UpdatePassword>
          </div>
        </div>
        <!-- 需登录 验证邮箱 -->
        <div
          v-if="authStore.isValid"
          class="mb-6 flow-root rounded-3xl bg-color-background-soft"
        >
          <div class="m-4">
            <VerifyEmail></VerifyEmail>
          </div>
        </div>
      </div>
    </div>

    <!-- 小屏 单列 -->
    <div v-else>
      <!-- 需登录 修改头像 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <UpdateAvatar></UpdateAvatar>
        </div>
      </div>
      <!-- 需登录 修改昵称简介 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <UpdateNameBio></UpdateNameBio>
        </div>
      </div>
      <!-- 需登录 修改用户名 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <UpdateUsername></UpdateUsername>
        </div>
      </div>
      <!-- 需登录 修改邮箱 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <UpdateEmail></UpdateEmail>
        </div>
      </div>
      <!-- 需登录 修改密码 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <UpdatePassword></UpdatePassword>
        </div>
      </div>
      <!-- 需登录 验证邮箱 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <VerifyEmail></VerifyEmail>
        </div>
      </div>
      <!-- 需登录 退出登录 -->
      <div
        v-if="authStore.isValid"
        class="mb-6 flow-root rounded-3xl bg-color-background-soft"
      >
        <div class="m-4">
          <LogOut></LogOut>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
