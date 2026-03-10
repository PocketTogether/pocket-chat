<script setup lang="ts">
import { useI18nStore } from '@/stores'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageLive')()),
})
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
            <LivePageTopBar
              :pageTitle="i18nStore.t('pageLive')()"
            ></LivePageTopBar>
          </div>
          <!-- 内容1 -->
          <div class="mt-4"></div>
          <!-- 内容2 -->
          <div class="mt-4"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
