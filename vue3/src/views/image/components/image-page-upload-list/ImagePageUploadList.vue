<script setup lang="ts">
import { useUploadImageStore } from '@/stores'
import { ImgUploadItem } from './components'
import { RiDeleteBin2Line, RiStopCircleLine, RiStopFill } from '@remixicon/vue'

const uploadImageStore = useUploadImageStore()
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 标题栏 -->
      <div class="mx-[10px] my-[10px]">
        <div class="flex items-center justify-between">
          <!-- 左 标题 -->
          <div class="flex flex-1 items-center truncate">
            <div class="mr-[4px]">
              <div class="flow-root">
                <div class="m-[4px] text-color-text">
                  <RiImageAddLine size="20px"></RiImageAddLine>
                </div>
              </div>
            </div>
            <div
              class="select-none truncate text-[14px] font-bold text-color-text"
            >
              上传图片
            </div>
          </div>
          <!-- 右 操作图标 -->
          <div class="flex items-center">
            <!-- 清除已完成 -->
            <!-- v-if="uploadImageStore.canClearFinished()" -->
            <div
              v-if="uploadImageStore.canClearFinished()"
              class="flow-root cursor-pointer"
              @click="uploadImageStore.clearFinished()"
            >
              <div class="m-[4px] text-el-success">
                <RiDeleteBin7Line size="20px"></RiDeleteBin7Line>
              </div>
            </div>
            <!-- 清除错误 -->
            <!-- v-if="uploadImageStore.canClearErrorOrInterrupted()" -->
            <div
              v-if="uploadImageStore.canClearErrorOrInterrupted()"
              class="flow-root cursor-pointer"
              @click="uploadImageStore.clearErrorOrInterrupted()"
            >
              <div class="m-[4px] text-el-danger">
                <RiDeleteBin2Line size="20px"></RiDeleteBin2Line>
              </div>
            </div>
            <!-- 清除中止 -->
            <!-- v-if="uploadImageStore.canClearAborted()" -->
            <div
              v-if="uploadImageStore.canClearAborted()"
              class="flow-root cursor-pointer"
              @click="uploadImageStore.clearAborted()"
            >
              <div class="m-[4px] text-el-info">
                <RiDeleteBinLine size="20px"></RiDeleteBinLine>
              </div>
            </div>
            <!-- 全部中止 -->
            <!-- v-if="uploadImageStore.canAbortAll()" -->
            <div
              v-if="uploadImageStore.canAbortAll()"
              class="flow-root cursor-pointer"
              @click="uploadImageStore.abortAll()"
            >
              <div class="m-[4px] text-color-text">
                <RiStopFill size="20px"></RiStopFill>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 列表 -->
      <div>
        <div
          v-for="item in uploadImageStore.uploadRecordWithFileAndProgressInfoList"
          :key="item.record.uuid"
        >
          <!-- 分割线 -->
          <div class="border-t-[3px] border-color-background"></div>
          <ImgUploadItem :uploadRecordInfo="item"></ImgUploadItem>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
