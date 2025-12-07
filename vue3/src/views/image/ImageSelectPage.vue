<script setup lang="ts">
import { ContainerBar, ContainerCol2 } from '@/components'
import {
  ImageGroupViewer,
  ImagePageBottomBar,
  ImagePageControlPanel,
  ImagePageImageList,
  ImagePageTopBar,
  ImagePageUploadList,
} from './components'
</script>

<template>
  <div>
    <!-- 大屏 双列 -->
    <div class="">
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{
          width: '500px',
        }"
        col1Twcss="flex-1 overflow-hidden"
      >
        <!-- 顶栏 底栏 操作面板 -->
        <template #col2>
          <div class="ml-6 mr-4">
            <ContainerBar :defaultBarHeight="60">
              <template #default>
                <div class="relative mb-4">
                  <div class="sticky top-0 z-[1] flow-root">
                    <!-- 图片页顶栏 -->
                    <ImagePageTopBar></ImagePageTopBar>
                  </div>
                  <!-- 操作面板 -->
                  <div class="mt-4">
                    <ImagePageControlPanel></ImagePageControlPanel>
                  </div>
                  <!-- <div class="my-4 h-[1200px] bg-red-950"></div> -->
                  <!-- 上传列表 -->
                  <div class="mt-4">
                    <ImagePageUploadList></ImagePageUploadList>
                  </div>
                  <!-- 图片预览 -->
                  <div class="mt-4">
                    <div class="">
                      <div
                        class="overflow-hidden rounded-[24px] border-[3px] border-transparent bg-color-background-soft"
                      >
                        <ImageGroupViewer></ImageGroupViewer>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template #bar>
                <div class="flow-root">
                  <!-- 图片页底栏 -->
                  <ImagePageBottomBar></ImagePageBottomBar>
                </div>
              </template>
            </ContainerBar>
          </div>
        </template>
        <!-- 图片列表 -->
        <template #col1>
          <div class="my-4 ml-2 mr-6">
            <ImagePageImageList></ImagePageImageList>
          </div>
        </template>
      </ContainerCol2>
    </div>
    <!-- 小屏 单列 -->
  </div>
</template>

<style lang="scss" scoped></style>
