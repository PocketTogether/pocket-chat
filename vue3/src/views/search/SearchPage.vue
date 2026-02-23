<script setup lang="ts">
import { useI18nStore } from '@/stores'
import { useSearchMessageQueryDesuwa } from './composables'
import {
  SearchPageControlPanel,
  SearchPageMessagesList,
  SearchPageTopBar,
} from './components'
import { useWatchSourceToHoldTime } from '@/utils'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageSearch')()),
})

// 页面恢复数据获取

// QueryDesuwa 这一块
const searchMessageQueryDesuwa = useSearchMessageQueryDesuwa({
  // searchPagePageRecoverDataDesuwa,
})
const { searchmessagePageListQuery } = searchMessageQueryDesuwa

// 页面恢复 滚动恢复

// 页面恢复数据收集

const isFetching = computed(() => {
  return searchmessagePageListQuery.isFetching.value
})

// 让加载动画至少显示500ms
const { sourceHaveHold: isFetchingForAni } = useWatchSourceToHoldTime({
  source: isFetching,
  holdMs: 500,
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
            <SearchPageTopBar
              :pageTitle="i18nStore.t('pageSearch')()"
              :searchMessageQueryDesuwa="searchMessageQueryDesuwa"
            ></SearchPageTopBar>
          </div>
          <!-- 操作面板 -->
          <div class="mt-4">
            <SearchPageControlPanel
              :searchMessageQueryDesuwa="searchMessageQueryDesuwa"
            ></SearchPageControlPanel>
          </div>

          <!-- 消息列表 -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="searchmessagePageListQuery.data.value != null"
              class="mt-4"
            >
              <SearchPageMessagesList
                :searchMessageQueryDesuwa="searchMessageQueryDesuwa"
              ></SearchPageMessagesList>
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
