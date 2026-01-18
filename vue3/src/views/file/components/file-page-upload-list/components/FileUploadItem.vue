<script setup lang="ts">
import { UploadProgressIcon } from '@/components'
import {
  useI18nStore,
  useUploadFileStore,
  type UploadFileRecordWithFileAndProgressInfo,
} from '@/stores'
import {
  convertSecondsToTimeDuration,
  formatFileSize,
  uploadProgressPercentageUtil,
} from '@/utils'
import {
  RiArrowUpCircleLine,
  RiErrorWarningFill,
  RiStopCircleLine,
  RiTimeFill,
} from '@remixicon/vue'
import {
  // 重命名 uploadStoreRecordStatusKeyConfig 为 USRSKC 以便于使用
  uploadStoreRecordStatusKeyConfig as USRSKC,
  type UploadStoreRecordStatus,
} from '@/config'
import type { IconDescriptionKeyType } from './dependencies'

// uploadProgressPercentageUtil

const props = defineProps<{
  uploadRecordInfo: UploadFileRecordWithFileAndProgressInfo
  setIconDescription: (key: IconDescriptionKeyType) => void
  clearIconDescription: () => void
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
const uploadFileStore = useUploadFileStore()

const canUploadDelete = computed(() =>
  uploadFileStore.canUploadDelete(props.uploadRecordInfo.record.uuid)
)
const canUploadAbortPending = computed(() =>
  uploadFileStore.canUploadAbortPending(props.uploadRecordInfo.record.uuid)
)
const canUploadAbortUploading = computed(() =>
  uploadFileStore.canUploadAbortUploading(props.uploadRecordInfo.record.uuid)
)
const canUploadRetry = computed(() =>
  uploadFileStore.canUploadRetry(props.uploadRecordInfo.record.uuid)
)

const uploadDelete = () =>
  uploadFileStore.uploadDelete(props.uploadRecordInfo.record.uuid)

const uploadAbortPending = () =>
  uploadFileStore.uploadAbortPending(props.uploadRecordInfo.record.uuid)

const uploadAbortUploading = () =>
  uploadFileStore.uploadAbortUploading(props.uploadRecordInfo.record.uuid)

const uploadRetry = () =>
  uploadFileStore.uploadRetry(props.uploadRecordInfo.record.uuid)

// 上传进度
const uploadProgressPercentage = computed(() => {
  if (
    props.uploadRecordInfo.progressInfo == null ||
    props.uploadRecordInfo.progressInfo.total == null
  ) {
    return null
  }
  return uploadProgressPercentageUtil(
    props.uploadRecordInfo.progressInfo.loaded,
    props.uploadRecordInfo.progressInfo.total
  )
})

const i18nStore = useI18nStore()

// 预计剩余时间
const uploadProgressEstimatedText = computed(() => {
  const estimated = props.uploadRecordInfo.progressInfo?.estimated
  if (estimated == null) {
    return null
  }
  return i18nStore.t('uploadProgressInfoEstimatedText')(
    convertSecondsToTimeDuration({
      seconds: estimated,
      unitLength: 1,
      messages: i18nStore.t('convertSecondsToTimeDurationMessages')(),
    })
  )
})

// 上传进度 总数
const uploadProgressLoadedTotalText = computed(() => {
  if (props.uploadRecordInfo.progressInfo == null) {
    return null
  }
  const loadedText = formatFileSize(props.uploadRecordInfo.progressInfo.loaded)
  const totalText = (() => {
    if (props.uploadRecordInfo.progressInfo.total == null) {
      return i18nStore.t('uploadProgressInfoTotalUnknowText')()
    }
    return formatFileSize(props.uploadRecordInfo.progressInfo.total)
  })()
  return `${loadedText}/${totalText}`
})
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
              <Transition name="fade150ms" mode="out-in">
                <!-- 待上传 -->
                <div
                  v-if="uploadRecordInfo.record.status === USRSKC.pending"
                  class="m-[4px] text-el-warning"
                >
                  <RiTimeFill size="20px"></RiTimeFill>
                </div>
                <!-- 上传中 -->
                <div
                  v-else-if="
                    uploadRecordInfo.record.status === USRSKC.uploading
                  "
                  class="m-[4px]"
                  :class="{
                    'text-el-primary': uploadProgressPercentage != null,
                    'text-el-warning': uploadProgressPercentage == null,
                  }"
                >
                  <UploadProgressIcon
                    :percentage="uploadProgressPercentage"
                    size="20px"
                  ></UploadProgressIcon>
                </div>
                <!-- 上传完成 -->
                <div
                  v-else-if="uploadRecordInfo.record.status === USRSKC.success"
                  class="m-[4px] text-el-success"
                >
                  <RiCheckboxCircleFill size="20px"></RiCheckboxCircleFill>
                </div>
                <!-- 已中止 -->
                <div
                  v-else-if="
                    uploadRecordInfo.record.status ===
                      USRSKC.aborted_while_pending ||
                    uploadRecordInfo.record.status ===
                      USRSKC.aborted_while_uploading
                  "
                  class="m-[4px] text-el-info"
                >
                  <RiStopCircleFill size="20px"></RiStopCircleFill>
                </div>
                <!-- 上传错误 已中断 -->
                <div v-else class="m-[4px] text-el-error">
                  <RiErrorWarningFill size="20px"></RiErrorWarningFill>
                </div>
              </Transition>
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
                    v-if="uploadRecordInfo.progressInfo?.rate != null"
                    class="ml-[4px] select-none text-[14px] font-bold text-color-text"
                  >
                    {{ formatFileSize(uploadRecordInfo.progressInfo.rate) }}/s
                  </div>
                </div>
              </template>
              <!-- 预计剩余时间 已上传/总大小 -->
              <template v-else>
                <div class="mr-[10px] flex items-center justify-between">
                  <div
                    class="select-none truncate text-[14px] font-bold text-color-text"
                  >
                    <!-- 预计剩余时间 -->
                    <template v-if="uploadProgressEstimatedText != null">
                      {{ uploadProgressEstimatedText }}
                    </template>
                    <!-- 已完成、错误、…… -->
                    <template v-else>
                      <!-- 错误原因 -->
                      <template
                        v-if="uploadRecordInfo.record.errorContent != null"
                      >
                        {{
                          i18nStore.t(
                            uploadRecordInfo.record.errorContent.i18nMessagesKey
                          )(uploadRecordInfo.record.errorContent.i18nTData)
                        }}
                      </template>
                      <!-- 当前状态 -->
                      <template v-else>
                        {{
                          i18nStore.t(
                            `uploadStoreRecordStatusText_${uploadRecordInfo.record.status}`
                          )()
                        }}
                      </template>
                    </template>
                  </div>
                  <div
                    v-if="uploadProgressLoadedTotalText != null"
                    class="ml-[4px] select-none text-[14px] font-bold text-color-text"
                  >
                    {{ uploadProgressLoadedTotalText }}
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
            @mouseenter="setIconDescription('abortPending')"
            @mouseleave="clearIconDescription"
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
            @mouseenter="setIconDescription('abortUploading')"
            @mouseleave="clearIconDescription"
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
            @mouseenter="setIconDescription('retryUpload')"
            @mouseleave="clearIconDescription"
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
            @mouseenter="setIconDescription('deleteUpload')"
            @mouseleave="clearIconDescription"
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
