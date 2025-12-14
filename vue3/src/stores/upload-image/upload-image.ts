import {
  // 重命名 uploadImageStoreRecordStatusKeyConfig 为 UISRSKC 以便于使用
  uploadImageStoreRecordStatusKeyConfig as UISRSKC,
  type I18nMessagesKeyType,
  type PbCollectionConfigType,
  type UploadImageStoreRecordStatus,
} from '@/config'
import type { UploadFile } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  useUploadImageItemControlModule,
  useUploadImageSchedulerModule,
  useUploadImageSystemControlModule,
} from './modules'
import type { I18nMessagesUploadPartUploadProgressInfoErrorPartKeyType } from '@/config'

export interface UploadImageStoreRecord {
  uuid: string
  fileUid: number
  name: string
  type: string
  size: number
  addedAt: string
  status: UploadImageStoreRecordStatus
  errorContent?: {
    i18nMessagesKey: I18nMessagesUploadPartUploadProgressInfoErrorPartKeyType
    i18nTData?: unknown
  }
}

export interface UploadImageStoreFile {
  uuid: string
  uploadFile: UploadFile
  options: PbCollectionConfigType['upload-image-process-options']
}

export interface UploadImageStoreProgressInfo {
  uuid: string
  controller: AbortController
  loaded: number
  total?: number
  rate?: number // bytes/sec
  estimated?: number // seconds
}

export interface UploadRecordWithFileAndProgressInfo {
  record: UploadImageStoreRecord
  file: UploadImageStoreFile | undefined
  progressInfo: UploadImageStoreProgressInfo | undefined
}

// 方便封装在 ./modules 中的文件使用
export type UploadImageStoreDependenciesDataForModule = {
  uploadRecordList: Ref<UploadImageStoreRecord[]>
  uploadFileList: Ref<UploadImageStoreFile[]>
  uploadProgressInfoList: Ref<UploadImageStoreProgressInfo[]>
}

/**
 * 当前 Store 的版本号。
 *
 * 当 store 的结构（字段、类型）发生不兼容更新时，
 * 修改此版本号即可强制生成一个新的持久化存储空间。
 * 避免旧数据与新类型不符导致运行时错误。
 */
const STORE_VERSION = 'v1'

export const useUploadImageStore = defineStore(
  `pocket-together-upload-image-${STORE_VERSION}`,
  () => {
    /** 持久化：上传记录列表 */
    const uploadRecordList = ref<UploadImageStoreRecord[]>([])

    /** 非持久化：文件列表 */
    const uploadFileList = ref<UploadImageStoreFile[]>([])

    /** 非持久化：进度列表 */
    const uploadProgressInfoList = ref<UploadImageStoreProgressInfo[]>([])

    const uploadImageStoreDependenciesDataForModule: UploadImageStoreDependenciesDataForModule =
      {
        uploadRecordList,
        uploadFileList,
        uploadProgressInfoList,
      }

    /** 仅允许初始化一次，此为实现其所需的标记 */
    const initialized = ref(false)

    // ------------------------------------------------------------------------
    // 轮询驱动上传调度
    // ------------------------------------------------------------------------
    const { uploadScheduler, pollingDriverScheduler } =
      useUploadImageSchedulerModule(uploadImageStoreDependenciesDataForModule)

    // ------------------------------------------------------------------------
    // 单项操作函数
    // ------------------------------------------------------------------------
    const uploadImageItemControlModule = useUploadImageItemControlModule(
      uploadImageStoreDependenciesDataForModule
    )
    const { uploadAbortPending, uploadAbortUploading } =
      uploadImageItemControlModule

    // ------------------------------------------------------------------------
    // 上传管理相关函数
    // ------------------------------------------------------------------------
    const uploadImageSystemControlModule = useUploadImageSystemControlModule({
      ...uploadImageStoreDependenciesDataForModule,
      uploadScheduler,
      uploadAbortPending,
      uploadAbortUploading,
    })
    // const { clearFinished, clearAborted, clearErrorOrInterrupted } =
    //   uploadImageSystemControlModule

    // ------------------------------------------------------------------------
    // 统一初始化函数（只执行一次）将在app.vue调用
    // ------------------------------------------------------------------------
    const initialize = () => {
      if (initialized.value) return
      initialized.value = true

      // 上传记录初始处理函数：pending/uploading → interrupted
      const initialRecordProcess = () => {
        // // 清除已完成
        // clearFinished()
        // // 清除中止
        // clearAborted()
        // // 清除错误或中断
        // clearErrorOrInterrupted()

        // 上传中、待上传 的，将其修改为中断
        uploadRecordList.value.forEach((r) => {
          if (r.status === UISRSKC.pending || r.status === UISRSKC.uploading) {
            r.status = UISRSKC.interrupted
          }
        })
      }
      initialRecordProcess()

      // 启动轮询驱动的上传调度
      pollingDriverScheduler()
    }

    return {
      // 上传记录 持久化
      uploadRecordList,
      // 上传管理相关函数
      ...uploadImageSystemControlModule,
      // 单项操作函数
      ...uploadImageItemControlModule,

      initialize,
      initialized: computed(() => initialized.value),
    }
  },
  {
    persist: true,
  }
)
