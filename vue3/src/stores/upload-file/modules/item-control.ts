import {
  // 重命名 uploadStoreRecordStatusKeyConfig 为 USRSKC 以便于使用
  uploadStoreRecordStatusKeyConfig as USRSKC,
} from '@/config'
import type { UploadFileStoreDependenciesDataForModule } from './dependencies'

/** 封装 单项操作函数 */
export const useUploadFileItemControlModule = (
  data: UploadFileStoreDependenciesDataForModule
) => {
  const { uploadRecordList, uploadFileList, uploadProgressInfoList } = data

  // 是否能删除某项（参数uuid），为 上传完成、中止、错误、中断 时才能删除
  const canUploadDelete = (uuid: string) => {
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    if (r == null) return false

    return (
      [
        USRSKC.success,
        USRSKC.aborted_while_pending,
        USRSKC.aborted_while_uploading,
        USRSKC.error,
        USRSKC.interrupted,
      ] as string[]
    ).includes(r.status)
  }
  // 删除某项，上传记录列表、文件列表、上传进度列表 中都要删除
  const uploadDelete = (uuid: string) => {
    const can = canUploadDelete(uuid)
    if (!can) {
      return
    }
    uploadRecordList.value = uploadRecordList.value.filter(
      (i) => i.uuid !== uuid
    )
    uploadFileList.value = uploadFileList.value.filter((i) => i.uuid !== uuid)
    uploadProgressInfoList.value = uploadProgressInfoList.value.filter(
      (i) => i.uuid !== uuid
    )
  }

  // 是否能设置针对待上传的中止（参数uuid），只有 待上传 时才能进行
  const canUploadAbortPending = (uuid: string) => {
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    return r?.status === USRSKC.pending
  }
  // 设置针对待上传的中止 将其对应 uploadRecord 状态改为aborted_while_pending即可
  const uploadAbortPending = (uuid: string) => {
    const can = canUploadAbortPending(uuid)
    if (!can) {
      return
    }
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    if (r == null) return
    r.status = USRSKC.aborted_while_pending
  }

  // 是否能设置针对上传中的中止（参数uuid），只有 上传中 时才能进行
  const canUploadAbortUploading = (uuid: string) => {
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    return r?.status === USRSKC.uploading
  }
  // 设置针对上传中的中止 找到参数uuid所指的 uploadProgressInfo 项，用其 controller 中止 然后返回即可
  //     没有 uploadProgressInfo 项的话，将其对应 uploadRecord 状态改为aborted_while_uploading即可
  const uploadAbortUploading = (uuid: string) => {
    const can = canUploadAbortUploading(uuid)
    if (!can) {
      return
    }
    const p = uploadProgressInfoList.value.find((i) => i.uuid === uuid)
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    if (r == null) return

    if (p?.controller != null) {
      p.controller.abort()
    } else {
      r.status = USRSKC.aborted_while_uploading
    }
  }

  // 是否能重新上传（参数uuid），为 中止、错误 时才能重新上传，有File时才能重新上传
  const canUploadRetry = (uuid: string) => {
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    const f = uploadFileList.value.find((i) => i.uuid === uuid)
    if (r == null || f == null) return false
    return (
      [
        USRSKC.error,
        USRSKC.aborted_while_pending,
        USRSKC.aborted_while_uploading,
      ] as string[]
    ).includes(r.status)
  }
  // 重新上传，有File时才能重新上传，为中止或错误时才能重新上传
  const uploadRetry = (uuid: string) => {
    const can = canUploadRetry(uuid)
    if (!can) {
      return
    }
    const r = uploadRecordList.value.find((i) => i.uuid === uuid)
    const f = uploadFileList.value.find((i) => i.uuid === uuid)
    if (r == null || f == null) return
    r.status = USRSKC.pending
  }

  return {
    //
    canUploadDelete,
    uploadDelete,

    canUploadAbortPending,
    uploadAbortPending,

    canUploadAbortUploading,
    uploadAbortUploading,

    canUploadRetry,
    uploadRetry,
  }
}
