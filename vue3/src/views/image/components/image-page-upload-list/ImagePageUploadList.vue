<script setup lang="ts">
import { useUploadImageStore } from '@/stores'
import { ImgUploadItem, UploadControlIconDescription } from './components'
import throttle from 'lodash-es/throttle'

const uploadImageStore = useUploadImageStore()

// 帮我实现在图标上悬停时，在图标说明显示其作用
// 本组件内弄一个变量，然后有两个方法，一个设置、一个取消
// 在需要的地方绑定鼠标进入时间、鼠标离开事件
// 这样实现

// 帮我为每种情况，都要有小驼峰式的命名
// 国际化字符串，你不用在代码中调用，单独给我即可
// aaaaaaaaaaa: {
//     'en-US': () => '' as const,
//     'zh-CN': () => '' as const,
//     'zh-TW': () => '' as const,
//     'ja-JP': () => '' as const,
//     'ko-KR': () => '' as const,
//     'ru-RU': () => '' as const,
//   },

// 注意 进度图标 虽然也是可点击的，但不要参与到上面其中

export type IconDescriptionKeyType =
  | 'clearFinished'
  | 'clearErrorOrInterrupted'
  | 'clearAborted'
  | 'abortAll'
  | 'abortPending'
  | 'abortUploading'
  | 'retryUpload'
  | 'deleteUpload'

const iconDescriptionKey = ref<IconDescriptionKeyType | null>(null)

// 统一的更新函数：任何值（含 null）都走它
const applyIconDescription = (next: IconDescriptionKeyType | null) => {
  iconDescriptionKey.value = next
}

// 节流包装：时间 内最多执行一次更新
const throttledUpdate = throttle(applyIconDescription, 400, {
  leading: true, // 第一次立即执行
  trailing: true, // 开启尾调用
})

// 对外暴露：设值和清空都用同一个节流器
const setIconDescription = (key: IconDescriptionKeyType) => {
  throttledUpdate(key)
}

const clearIconDescription = () => {
  throttledUpdate(null)
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-[24px] bg-color-background-soft">
      <!-- 标题栏 -->
      <div class="mx-[10px] my-[10px]">
        <div class="flex items-center justify-between">
          <!-- 左 标题 图标说明 -->
          <div class="flex-1 truncate">
            <UploadControlIconDescription
              :iconDescriptionKey="iconDescriptionKey"
            >
              <div class="flex items-center">
                <div class="mr-[4px]">
                  <div class="flow-root">
                    <div class="m-[4px] text-color-text">
                      <RiImageAddLine size="20px"></RiImageAddLine>
                    </div>
                  </div>
                </div>
                <div
                  class="select-none truncate pr-1 text-[14px] font-bold text-color-text"
                >
                  上传图片
                </div>
              </div>
            </UploadControlIconDescription>
          </div>
          <!-- 右 操作图标 -->
          <div class="relative flex min-w-[60] items-center">
            <!-- 清除已完成 -->
            <!-- v-if="uploadImageStore.canClearFinished()" -->
            <div
              v-if="uploadImageStore.canClearFinished()"
              class="flow-root cursor-pointer"
              @click="uploadImageStore.clearFinished()"
              @mouseenter="setIconDescription('clearFinished')"
              @mouseleave="clearIconDescription"
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
              @mouseenter="setIconDescription('clearErrorOrInterrupted')"
              @mouseleave="clearIconDescription"
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
              @mouseenter="setIconDescription('clearAborted')"
              @mouseleave="clearIconDescription"
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
              @mouseenter="setIconDescription('abortAll')"
              @mouseleave="clearIconDescription"
            >
              <div class="m-[4px] text-color-text">
                <RiStopFill size="20px"></RiStopFill>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 列表 -->
      <div class="relative">
        <!-- <TransitionGroup name="fade-150ms-list"> -->
        <div
          v-for="item in uploadImageStore.uploadRecordWithFileAndProgressInfoList"
          :key="item.record.uuid"
          class="w-full"
        >
          <!-- 分割线 -->
          <div class="border-t-[3px] border-color-background"></div>
          <ImgUploadItem
            :uploadRecordInfo="item"
            :setIconDescription="setIconDescription"
            :clearIconDescription="clearIconDescription"
          ></ImgUploadItem>
        </div>
        <!-- </TransitionGroup> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
