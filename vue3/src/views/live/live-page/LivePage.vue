<script setup lang="ts">
import { useI18nStore } from '@/stores'
import { LivePageTopBar } from './components'
import { LiveContent } from './dependencies'
import { injectAppMainElScrollbar } from '@/composables'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageLive')()),
})

// inject获取应用主滚动实例
const appMainElScrollbar = injectAppMainElScrollbar()
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
        <div class="relative mb-[24px]">
          <!-- 顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <LivePageTopBar
              :pageTitle="i18nStore.t('pageLive')()"
            ></LivePageTopBar>
          </div>
          <!-- 内容 -->
          <div class="mt-[16px]">
            <LiveContent
              :refScrollWarp="appMainElScrollbar?.wrapRef"
            ></LiveContent>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
