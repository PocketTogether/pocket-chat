import { axiosConfig } from '@/config'
import { Collections, pb, type Create } from '@/lib'
import type { ReplacePropertyType } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import type { UploadFile } from 'element-plus'
import axios, { type AxiosProgressEvent } from 'axios'

/**
 * 此函数用作示例，不打算使用，实际使用中使用 pbImageUploadWithAxios
 */
export const pbImageUploadApi = (uploadFile: UploadFile) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }
  if (uploadFile.raw == null) {
    throw new Error('uploadFile.raw == null')
  }

  // 准备类型，pb图片这一块类型不太完善，用类型工具修改一下
  type DataType = Create<Collections.Images>
  type DataTypeWithFile = ReplacePropertyType<DataType, 'image', File>
  // 准备数据
  const data: DataTypeWithFile = {
    author: pb.authStore.record.id,
    image: uploadFile.raw,
    imageWidth: 10,
    imageHeight: 10,
    isDeleted: false,
  }

  const pbRes = pb.collection(Collections.Images).create(data, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })

  return pbRes
}

/**
 * 使用 Axios 上传图片到 PocketBase `images` 集合。
 *
 * 该函数会自动构造 `FormData`，并支持上传进度回调与请求中断。
 * 与 `pbImageUploadApi` 保持类型一致，但通过 Axios 提供更灵活的控制。
 *
 * @param uploadFile - Element Plus 的 `UploadFile` 对象，必须包含 `raw` 文件。
 * @param options - 上传配置选项。
 * @param options.onImageUploadProgress - 上传进度回调，接收 Axios 的 `AxiosProgressEvent`。
 * @param options.controller - 可选的 `AbortController`，用于中断上传请求。
 *
 * @returns 返回值类型与 `pbImageUploadApi` 相同，通常为 PocketBase 创建记录的响应数据。
 *
 * @throws 如果用户未登录（`pb.authStore.isValid` 为 false 或 `record.id` 为空），会抛出错误。
 * @throws 如果 `uploadFile.raw` 为空，会抛出错误。
 *
 * @example
 * ```ts
 * const controller = new AbortController()
 *
 * const res = await pbImageUploadWithAxios(file, {
 *   onImageUploadProgress: (e) => {
 *     if (e.total) {
 *       const percent = Math.round((e.loaded * 100) / e.total)
 *       console.log(`上传进度: ${percent}%`)
 *     }
 *   },
 *   controller,
 * })
 *
 * // 如果需要取消上传
 * controller.abort()
 *
 * console.log('上传成功:', res)
 * ```
 */
export const pbImageUploadWithAxios = async (
  uploadFile: UploadFile,
  options?: {
    onImageUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    controller?: AbortController
  }
): ReturnType<typeof pbImageUploadApi> => {
  const { onImageUploadProgress, controller } = options ?? {}

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }
  if (uploadFile.raw == null) {
    throw new Error('uploadFile.raw == null')
  }

  // 准备类型
  type DataType = Create<Collections.Images>
  type DataTypeWithFile = ReplacePropertyType<DataType, 'image', File>

  // 准备数据（类型安全）
  const data: DataTypeWithFile = {
    author: pb.authStore.record.id,
    image: uploadFile.raw,
    imageWidth: 10,
    imageHeight: 10,
    isDeleted: false,
  }

  // 将 data 转换为 FormData
  const formData = new FormData()
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue
    }
    const processedValue = (() => {
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      }
      if (value instanceof File) {
        return value as Blob
      }
      return value
    })()
    formData.append(key, processedValue)
  }

  // Axios 请求
  const res = await axios.post(
    `/api/collections/${Collections.Images}/records`,
    formData,
    {
      baseURL: axiosConfig.baseUrl,
      headers: {
        Authorization: pb.authStore.token,
        'Content-Type': 'multipart/form-data',
      },
      // timeout: 5000,
      onUploadProgress: onImageUploadProgress,
      signal: controller?.signal,
    }
  )

  return res.data
}
