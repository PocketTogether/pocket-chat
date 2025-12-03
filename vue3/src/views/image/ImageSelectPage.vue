<script setup lang="ts">
import { ContainerBar, ContainerCol2 } from '@/components'
import {
  ImagePageBottomBar,
  ImagePageControlPanel,
  ImagePageTopBar,
} from './components'
</script>

<template>
  <div>
    <!-- 大屏 双列 -->
    <div>
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{
          width: '500px',
        }"
        col1Twcss="flex-1"
      >
        <!-- 顶栏 底栏 操作面板 -->
        <template #col2>
          <div class="ml-6 mr-4">
            <ContainerBar :defaultBarHeight="60">
              <template #default>
                <div class="relative">
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
                  <!-- 图片预览 -->
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
          <div class="ml-2 mr-6">
            <div class="h-[1500px] bg-red-950"></div>
          </div>
        </template>
      </ContainerCol2>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
