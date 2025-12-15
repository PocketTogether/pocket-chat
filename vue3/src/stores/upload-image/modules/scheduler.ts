import { pbImageUploadWithAxios } from '@/api'
import {
  uploadImageMaxSimultaneousNumConfig,
  // 重命名 uploadImageStoreRecordStatusKeyConfig 为 UISRSKC 以便于使用
  uploadImageStoreRecordStatusKeyConfig as UISRSKC,
} from '@/config'
import throttle from 'lodash-es/throttle'
import type { AxiosProgressEvent } from 'axios'
import type { UploadImageStoreDependenciesDataForModule } from './dependencies'
import { uploadImageProcessUtil } from '@/utils'

/** 封装轮询驱动上传调度 */
export const useUploadImageSchedulerModule = (
  data: UploadImageStoreDependenciesDataForModule
) => {
  const { uploadRecordList, uploadFileList, uploadProgressInfoList } = data

  // ------------------------------------------------------------------------
  // 上传调度函数
  // ------------------------------------------------------------------------

  // 准备 uploadScheduler 中使用的 onImageUploadProgress，将传入 pbImageUploadWithAxios
  // 限制其更新速率以避免有性能问题
  const throttledProgressUpdate = throttle(
    (uuid: string, e: AxiosProgressEvent) => {
      const p = uploadProgressInfoList.value.find((i) => i.uuid === uuid)
      if (!p) return

      p.loaded = e.loaded
      p.total = e.total
      p.rate = e.rate
      p.estimated = e.estimated
    },
    1000,
    { leading: true, trailing: true }
  )

  // 上传调度函数
  const uploadScheduler = async () => {
    // 正在上传中的数量
    const uploadingCount = uploadRecordList.value.filter(
      (i) => i.status === UISRSKC.uploading
    ).length
    // 正在上传中的数量 大于等于最大同时上传数时 返回
    if (uploadingCount >= uploadImageMaxSimultaneousNumConfig) return

    // 准备下一个待上传的项，状态为待上传
    const next = uploadRecordList.value.find(
      (i) => i.status === UISRSKC.pending
    )
    // 没有待上传，返回
    if (next == null) return

    // 准备对应文件
    const file = uploadFileList.value.find((i) => i.uuid === next.uuid)
    // 没有文件，将其状态设置为错误，返回
    if (file == null) {
      next.status = UISRSKC.error
      return
    }

    // 准备开始上传，状态设置为上传中
    next.status = UISRSKC.uploading
    // 创建中止控制器
    const controller = new AbortController()
    // 上传进度记录列表 uploadProgressInfoList 中添加项
    uploadProgressInfoList.value.push({
      uuid: next.uuid,
      controller,
      loaded: 0,
      total: undefined,
      rate: undefined,
      estimated: undefined,
    })

    let isImageProcessError = false

    // 调用 api 开始上传，捕获错误并处理各种情况
    try {
      // 图片处理
      const imageProcessData = await uploadImageProcessUtil(
        file.uploadFile,
        file.options
      ).catch((err) => {
        isImageProcessError = true
        throw err
      })

      // 上传 api
      await pbImageUploadWithAxios(imageProcessData, {
        controller,
        onImageUploadProgress: (e) => {
          throttledProgressUpdate(next.uuid, e)
        },
      })
      // 成功，状态设置为已完成
      next.status = UISRSKC.success
      // 成功后可以删除文件
      uploadFileList.value = uploadFileList.value.filter(
        (i) => i.uuid !== next.uuid
      )
    } catch (err: unknown) {
      // 中止的情况
      if (controller.signal.aborted) {
        next.status = UISRSKC.aborted_while_uploading
      }
      // 错误的情况
      else {
        // 图片处理错误
        if (isImageProcessError) {
          next.errorContent = {
            i18nMessagesKey: 'uploadProgressInfoErrorImageProcessText',
          }
        }
        // 未知错误
        else {
          // next.errorContent = {
          //   i18nMessagesKey: 'uploadProgressInfoErrorUnknowText',
          // }
        }
        next.status = UISRSKC.error
        console.error('upload-image error:', err)
      }
    } finally {
      // 最终无论什么结果，都要移除对应的 uploadProgressInfo 项
      uploadProgressInfoList.value = uploadProgressInfoList.value.filter(
        (i) => i.uuid !== next.uuid
      )
    }
  }

  // ------------------------------------------------------------------------
  // 轮询驱动函数
  // ------------------------------------------------------------------------
  const pollingDriverScheduler = async () => {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      uploadScheduler()
    }
  }

  return {
    //
    uploadScheduler,
    pollingDriverScheduler,
  }
}
