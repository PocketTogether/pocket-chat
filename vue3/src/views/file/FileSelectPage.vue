<script setup lang="ts">
/* eslint vue/no-undef-components: "warn" */

import { useI18nStore, useUploadFileStore } from '@/stores'
import { useWindowSize } from '@vueuse/core'
import {
  useFileQueryModeDesuwa,
  useFileSelectListDesuwa,
  useFileSelectPagePageRecoverDataDesuwa,
} from './composables'
import {
  ContainerBar,
  ContainerCol2,
  FileContentCardWithBar,
} from '@/components'
import {
  FilePageBottomBar,
  FilePageControlPanel,
  FilePageFileList,
  FilePageTopBar,
  FilePageUploadList,
} from './components'

const i18nStore = useI18nStore()

useSeoMeta({
  title: computed(() => i18nStore.t('pageFileSelect')()),
})

const windowSize = useWindowSize()

// 页面恢复数据获取
const fileSelectPagePageRecoverDataDesuwa =
  useFileSelectPagePageRecoverDataDesuwa()

// 封装 fileQueryMode 这一块（desuwa）
// useFileQueryModeDesuwa
const fileQueryModeDesuwa = useFileQueryModeDesuwa({
  fileSelectPagePageRecoverDataDesuwa,
})

// 封装 fileSelectList 这一块desuwa
// file-select-list
// useFileSelectListDesuwa
const fileSelectListDesuwa = useFileSelectListDesuwa({
  fileSelectPagePageRecoverDataDesuwa,
})
const {
  //
  fileSelectList,
} = fileSelectListDesuwa

const uploadFileStore = useUploadFileStore()
</script>

<template>
  <div>
    <!-- 大屏 双列 -->
    <div v-if="windowSize.width.value >= 768" class="">
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{
          width: (() => {
            // 大于1024时左栏宽度较大，小于则左栏宽度较小
            if (windowSize.width.value >= 1024) {
              return `500px`
            }
            return `400px`
          })(),
        }"
        col1Twcss="flex-1 overflow-hidden"
      >
        <!-- 左侧 | 顶栏 底栏 操作面板 -->
        <template #col2>
          <div class="ml-6 mr-4">
            <ContainerBar :defaultBarHeight="60">
              <template #default>
                <div class="relative mb-4">
                  <div class="sticky top-0 z-[1] flow-root">
                    <!-- 文件页顶栏 -->
                    <FilePageTopBar
                      :pageTitle="i18nStore.t('pageFileSelect')()"
                      :fileQueryModeDesuwa="fileQueryModeDesuwa"
                    ></FilePageTopBar>
                  </div>
                  <!-- 操作面板 -->
                  <div class="mt-4">
                    <FilePageControlPanel
                      :fileQueryModeDesuwa="fileQueryModeDesuwa"
                    ></FilePageControlPanel>
                  </div>
                  <!-- 上传列表 -->
                  <Transition name="fade" mode="out-in">
                    <div
                      v-if="uploadFileStore.uploadRecordList.length > 0"
                      class="mt-4"
                    >
                      <FilePageUploadList></FilePageUploadList>
                    </div>
                  </Transition>
                  <!-- 文件预览 -->
                  <Transition name="fade" mode="out-in">
                    <div
                      v-if="fileSelectList.length > 0"
                      :key="fileSelectList.map((i) => i.id).toString()"
                      class="mt-4"
                    >
                      <div
                        class="mx-auto"
                        :style="{
                          maxWidth: `${412}px`,
                        }"
                      >
                        <div
                          class="overflow-hidden rounded-[20px] bg-color-background-soft"
                        >
                          <FileContentCardWithBar
                            :fileData="fileSelectList[0]"
                          ></FileContentCardWithBar>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>
              <template #bar>
                <div class="flow-root">
                  <!-- 图片页底栏 -->
                  <FilePageBottomBar
                    :fileSelectListDesuwa="fileSelectListDesuwa"
                  ></FilePageBottomBar>
                </div>
              </template>
            </ContainerBar>
          </div>
        </template>
        <!-- 右侧 | 文件列表 -->
        <template #col1>
          <div class="my-4 ml-2 mr-6">
            <FilePageFileList
              :fileQueryModeDesuwa="fileQueryModeDesuwa"
              :fileSelectListDesuwa="fileSelectListDesuwa"
              :fileSelectPagePageRecoverDataDesuwa="
                fileSelectPagePageRecoverDataDesuwa
              "
            ></FilePageFileList>
          </div>
        </template>
      </ContainerCol2>
    </div>
    <!-- 小屏 单列 -->
    <div v-else></div>
  </div>
</template>

<style lang="scss" scoped></style>
