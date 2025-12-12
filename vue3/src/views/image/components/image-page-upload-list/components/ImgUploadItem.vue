<script setup lang="ts">
import { UploadProgressIcon } from '@/components'
import {
  useUploadImageStore,
  type UploadRecordWithFileAndProgressInfo,
} from '@/stores'
import { uploadProgressPercentageUtil } from '@/utils'
import { RiArrowUpCircleLine, RiStopCircleLine } from '@remixicon/vue'

// uploadProgressPercentageUtil

const props = defineProps<{
  uploadRecordInfo: UploadRecordWithFileAndProgressInfo
}>()

// 上传信息显示模式
const uploadInfoModeKeyDict = {
  /** 文件名 上传速度 */
  filename_rate: 'filename_rate',
  /** 预计剩余时间 已上传/总大小 */
  estimated_seconds_loaded_total: 'estimated_seconds_loaded_total',
} as const

// 所有模式的数组，保持定义顺序
const uploadInfoModeKeyTuple = Object.values(uploadInfoModeKeyDict)

type UploadInfoModeKey = (typeof uploadInfoModeKeyTuple)[number]

// 上传信息显示模式
const uploadInfoMode = ref<UploadInfoModeKey>(
  uploadInfoModeKeyDict.filename_rate
)

// 上传信息显示模式切换，切换到下一个
const uploadInfoModeSwitch = () => {
  const currentIndex = uploadInfoModeKeyTuple.indexOf(uploadInfoMode.value)
  const nextIndex = (currentIndex + 1) % uploadInfoModeKeyTuple.length
  uploadInfoMode.value = uploadInfoModeKeyTuple[nextIndex]
}

// 操作
const uploadImageStore = useUploadImageStore()

const canUploadDelete = computed(() =>
  uploadImageStore.canUploadDelete(props.uploadRecordInfo.record.uuid)
)
const canUploadAbortPending = computed(() =>
  uploadImageStore.canUploadAbortPending(props.uploadRecordInfo.record.uuid)
)
const canUploadAbortUploading = computed(() =>
  uploadImageStore.canUploadAbortUploading(props.uploadRecordInfo.record.uuid)
)
const canUploadRetry = computed(() =>
  uploadImageStore.canUploadRetry(props.uploadRecordInfo.record.uuid)
)

const uploadDelete = () =>
  uploadImageStore.uploadDelete(props.uploadRecordInfo.record.uuid)

const uploadAbortPending = () =>
  uploadImageStore.uploadAbortPending(props.uploadRecordInfo.record.uuid)

const uploadAbortUploading = () =>
  uploadImageStore.uploadAbortUploading(props.uploadRecordInfo.record.uuid)

const uploadRetry = () =>
  uploadImageStore.uploadRetry(props.uploadRecordInfo.record.uuid)
</script>

<template>
  <div>
    <!-- 列表项 -->
    <div class="mx-[10px] my-[6px]">
      <div class="flex items-center justify-between">
        <!-- 左 进度与文件名 -->
        <div class="flex flex-1 items-center truncate">
          <!-- 进度图标 -->
          <div class="mr-[4px]">
            <div class="flow-root cursor-pointer" @click="uploadInfoModeSwitch">
              <div class="m-[4px] text-el-primary">
                <!-- <RiProgress8Line size="20px"></RiProgress8Line> -->
                <UploadProgressIcon
                  :percentage="10"
                  size="20px"
                ></UploadProgressIcon>
              </div>
            </div>
          </div>

          <!-- 文件名，或进度信息 -->
          <div class="flex-1 truncate">
            <Transition name="fade150ms" mode="out-in">
              <!-- 文件名 上传速度 -->
              <template
                v-if="uploadInfoMode === uploadInfoModeKeyDict.filename_rate"
              >
                <div class="mr-[10px] flex items-center justify-between">
                  <div
                    class="select-none truncate text-[14px] font-bold text-color-text"
                  >
                    {{ uploadRecordInfo.record.name }}
                  </div>
                  <div
                    v-if="uploadRecordInfo.progressInfo != null"
                    class="ml-[4px] select-none text-[14px] font-bold text-color-text"
                  >
                    50KB/s
                  </div>
                </div>
              </template>
              <!-- 预计剩余时间 已上传/总大小 -->
              <template v-else>
                <div class="mr-[10px] flex items-center justify-between">
                  <div
                    class="select-none truncate text-[14px] font-bold text-color-text"
                  >
                    <template v-if="uploadRecordInfo.progressInfo != null">
                      预计 3 秒后完成
                    </template>
                    <!-- 已完成、错误、…… -->
                    <template v-else> 已完成 </template>
                  </div>
                  <div
                    v-if="uploadRecordInfo.progressInfo != null"
                    class="ml-[4px] select-none text-[14px] font-bold text-color-text"
                  >
                    10KB/100KB
                  </div>
                </div>
              </template>
            </Transition>
          </div>
        </div>
        <!-- 右 操作图标 -->
        <div class="flex items-center">
          <!-- 中止 Pending -->
          <div
            v-if="canUploadAbortPending"
            class="flow-root cursor-pointer"
            @click="uploadAbortPending"
          >
            <div class="m-[4px] text-color-text">
              <RiStopCircleLine size="20px"></RiStopCircleLine>
            </div>
          </div>
          <!-- 中止 Uploading -->
          <div
            v-if="canUploadAbortUploading"
            class="flow-root cursor-pointer"
            @click="uploadAbortUploading"
          >
            <div class="m-[4px] text-color-text">
              <RiStopCircleLine size="20px"></RiStopCircleLine>
            </div>
          </div>
          <!-- 重新上传 -->
          <div
            v-if="canUploadRetry"
            class="flow-root cursor-pointer"
            @click="uploadRetry"
          >
            <div class="m-[4px] text-color-text">
              <RiArrowUpCircleLine size="20px"></RiArrowUpCircleLine>
            </div>
          </div>
          <!-- 删除 -->
          <div
            v-if="canUploadDelete"
            class="flow-root cursor-pointer"
            @click="uploadDelete"
          >
            <div class="m-[4px] text-color-text">
              <RiCloseCircleLine size="20px"></RiCloseCircleLine>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
