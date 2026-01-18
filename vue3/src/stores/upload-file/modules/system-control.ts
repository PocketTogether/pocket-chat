// 重命名 uploadStoreRecordStatusKeyConfig 为 USRSKC 以便于使用
import { uploadStoreRecordStatusKeyConfig as USRSKC } from '@/config'
import type { UploadFile } from 'element-plus'

import { v4 as uuidv4 } from 'uuid'
import type {
  UploadFileStoreDependenciesDataForModule,
  UploadFileStoreFile,
  UploadFileRecordWithFileAndProgressInfo,
} from './dependencies'

/** 封装上传管理相关函数 */
export const useUploadFileSystemControlModule = (
  data: {
    uploadScheduler: () => Promise<void>
    uploadAbortPending: (uuid: string) => void
    uploadAbortUploading: (uuid: string) => void
  } & UploadFileStoreDependenciesDataForModule
) => {
  const {
    //
    uploadScheduler,
    uploadAbortPending,
    uploadAbortUploading,
    uploadRecordList,
    uploadFileList,
    uploadProgressInfoList,
  } = data

  /** 上传信息获取函数，通过 uuid 获取 record/file/progressInfo */
  const getUploadFileRecordWithFileAndProgressInfo = (uuid: string) => {
    const record = uploadRecordList.value.find((i) => i.uuid === uuid)
    if (record == null) return null

    const file = uploadFileList.value.find((i) => i.uuid === uuid)
    const progressInfo = uploadProgressInfoList.value.find(
      (i) => i.uuid === uuid
    )

    return {
      record,
      file,
      progressInfo,
    } satisfies UploadFileRecordWithFileAndProgressInfo
  }
  /** 获取全部上传记录信息 */
  const uploadRecordWithFileAndProgressInfoList = computed(() => {
    return uploadRecordList.value
      .map((i) => getUploadFileRecordWithFileAndProgressInfo(i.uuid))
      .filter(
        (i) => i != null
      ) satisfies UploadFileRecordWithFileAndProgressInfo[]
  })

  /** 添加上传任务 */
  const addUpload = (
    uploadFile: UploadFileStoreFile['uploadFile']
    // options: UploadFileStoreFile['options']
  ) => {
    // uploadFile.raw 不能为null，返回null代表失败
    if (uploadFile.raw == null) {
      return null
    }

    const uuid = uuidv4()
    uploadRecordList.value.push({
      uuid,
      fileUid: uploadFile.uid,
      name: uploadFile.name,
      type: uploadFile.raw?.type ?? '',
      size: uploadFile.size ?? 0,
      addedAt: new Date().toISOString(),
      // 待上传
      status: USRSKC.pending,
    })

    uploadFileList.value.push({
      uuid,
      uploadFile,
      // options,
    })

    // 上传任务添加后，立即进行一次上传调度，以立即响应
    uploadScheduler()

    // 返回uuid代表成功
    return uuid
  }

  // 是否能全部中止，有待上传或上传中的才能进行
  const canAbortAll = () =>
    uploadRecordList.value.some(
      (i) => i.status === USRSKC.pending || i.status === USRSKC.uploading
    )
  // 全部中止
  const abortAll = () => {
    uploadRecordList.value.forEach((i) => {
      if (i.status === USRSKC.pending) {
        uploadAbortPending(i.uuid)
      } else if (i.status === USRSKC.uploading) {
        uploadAbortUploading(i.uuid)
      }
    })
  }

  // 是否能清除全部已完成的，存在已完成的才能进行
  const canClearFinished = () =>
    uploadRecordList.value.some((i) => i.status === USRSKC.success)
  // 清除全部已完成的（即在 上传记录列表、文件列表 中移除）
  const clearFinished = () => {
    uploadRecordList.value = uploadRecordList.value.filter(
      (i) => i.status !== USRSKC.success
    )
    uploadFileList.value = uploadFileList.value.filter((i) =>
      uploadRecordList.value.some((r) => r.uuid === i.uuid)
    )
  }

  // 是否能清除全部中止的，存在中止的才能进行
  const canClearAborted = () =>
    uploadRecordList.value.some(
      (i) =>
        i.status === USRSKC.aborted_while_pending ||
        i.status === USRSKC.aborted_while_uploading
    )
  // 清除全部中止的
  const clearAborted = () => {
    uploadRecordList.value = uploadRecordList.value.filter(
      (i) =>
        i.status !== USRSKC.aborted_while_pending &&
        i.status !== USRSKC.aborted_while_uploading
    )
    uploadFileList.value = uploadFileList.value.filter((i) =>
      uploadRecordList.value.some((r) => r.uuid === i.uuid)
    )
  }

  // 是否能清除全部错误或中断的，存在错误或中断的才能进行
  const canClearErrorOrInterrupted = () =>
    uploadRecordList.value.some(
      (i) => i.status === USRSKC.error || i.status === USRSKC.interrupted
    )
  // 清除全部错误或中断的
  const clearErrorOrInterrupted = () => {
    uploadRecordList.value = uploadRecordList.value.filter(
      (i) => i.status !== USRSKC.error && i.status !== USRSKC.interrupted
    )
    uploadFileList.value = uploadFileList.value.filter((i) =>
      uploadRecordList.value.some((r) => r.uuid === i.uuid)
    )
  }

  return {
    //
    getUploadFileRecordWithFileAndProgressInfo,
    uploadRecordWithFileAndProgressInfoList,

    addUpload,

    canAbortAll,
    abortAll,
    canClearFinished,
    clearFinished,
    canClearAborted,
    clearAborted,
    canClearErrorOrInterrupted,
    clearErrorOrInterrupted,
  }
}
