import {
  uploadImageMaxSimultaneousNumConfig,
  type UploadImageStoreRecordStatus,
} from '@/config'
import type { UploadFile } from 'element-plus'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// 上传图片 最大同时上传数
// uploadImageMaxSimultaneousNumConfig

export interface UploadImageStoreRecord {
  uuid: string
  fileUid: number
  name: string
  type: string
  size: number
  addedAt: string
  status: UploadImageStoreRecordStatus
}

export interface UploadImageStoreFile {
  uuid: string
  uploadFile: UploadFile
}

export interface UploadImageStoreProgressInfo {
  uuid: string
  controller: AbortController
  loaded: number
  total?: number | null
  rate?: number // bytes/sec
  estimated?: number // seconds
}

export const useUploadImageStore = defineStore(
  'pocket-together-upload-image',
  () => {
    // 上传记录列表 持久化
    const uploadRecordList = ref<UploadImageStoreRecord[]>([])

    // 文件列表 不持久化
    const uploadFileList = ref<UploadImageStoreFile[]>([])

    // 上传进度列表 不持久化
    const uploadProgressInfoList = ref<UploadImageStoreProgressInfo[]>([])

    // 函数 获取，即通过uuid获取 上传记录-文件列表-上传进度列表
    const getRecordWithFileAndProgressInfo = (uuid: string) => {
      // uploadRecordList 必须要找到
      const findRecord = uploadRecordList.value.find((i) => i.uuid === uuid)
      if (findRecord == null) {
        return null
      }
      // uploadFileList uploadProgressInfoList 因其非持久化，所以可能没有
      const findFile = uploadFileList.value.find((i) => i.uuid === uuid)
      const findProgressInfo = uploadProgressInfoList.value.find(
        (i) => i.uuid === uuid
      )

      return {
        record: findRecord,
        file: findFile,
        progressInfo: findProgressInfo,
      }
    }

    //
    // AITODO

    // 函数 添加上传操作，即在 上传记录列表、文件列表 中添加
    //     参数 UploadFile

    // 函数 清除全部 已完成 或中止 或错误 的项

    //
    // AITODO 一些上传控制这一块的操作函数

    // 函数 是否能删除某项（参数uuid），为 上传完成、中止、错误、中断 时才能删除
    // 函数 删除某项，上传记录列表、文件列表、上传进度列表 中都要删除

    // 函数 是否能设置针对待上传的中止（参数uuid），只有 待上传 时才能进行
    // 函数 设置针对待上传的中止 将其对应 uploadRecord 状态改为aborted_while_pending即可

    // 函数 是否能设置针对上传中的中止（参数uuid），只有 上传中 时才能进行
    // 函数 设置针对上传中的中止 找到参数uuid所指的 uploadProgressInfo 项，用其 controller 中止 然后返回即可
    //     没有 uploadProgressInfo 项的话，将其对应 uploadRecord 状态改为aborted_while_uploading即可

    // 函数 是否能重新上传（参数uuid），为 中止、错误 时才能重新上传，有File时才能重新上传
    // 函数 重新上传，有File时才能重新上传，为中止或错误时才能重新上传
    //     找到参数uuid所指的 uploadRecord 将其状态设置为待上传即可

    return {
      //
      uploadRecordList,
    }
  },
  {
    persist: true, // 持久化
  }
)
