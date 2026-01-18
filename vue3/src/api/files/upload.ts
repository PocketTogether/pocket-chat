import { axiosConfig } from '@/config'
import { Collections, pb, type Create } from '@/lib'
import type { ReplacePropertyType } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import type { UploadFile } from 'element-plus'
import axios, { type AxiosProgressEvent } from 'axios'

/**
 * 此函数用作示例，不打算使用，实际使用中使用 pbFileUploadWithAxios
 */
export const pbFileUploadApi = (uploadFile: UploadFile) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }
  if (uploadFile.raw == null) {
    throw new Error('uploadFile.raw == null')
  }

  // 准备类型，pb文件这一块类型不太完善，用类型工具修改一下
  type DataType = Create<Collections.Files>
  type DataTypeWithFile = ReplacePropertyType<DataType, 'file', File>
  // 准备数据
  const data: DataTypeWithFile = {
    author: pb.authStore.record.id,
    file: uploadFile.raw,
    fileName: uploadFile.raw.name,
    fileSize: uploadFile.raw.size,
    fileType: uploadFile.raw.type,
    isDeleted: false,
  }

  const pbRes = pb.collection(Collections.Files).create(data, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })

  return pbRes
}

/**
 * 使用 Axios 上传文件到 PocketBase `files` 集合。
 *
 * 该函数会自动构造 `FormData`，并支持上传进度回调与请求中断。
 * 与 `pbFileUploadApi` 保持类型一致，但通过 Axios 提供更灵活的控制。
 *
 * @param uploadFile - Element Plus 的 `UploadFile` 对象，必须包含 `raw` 文件。
 * @param options - 上传配置选项。
 * @param options.onFileUploadProgress - 上传进度回调，接收 Axios 的 `AxiosProgressEvent`。
 * @param options.controller - 可选的 `AbortController`，用于中断上传请求。
 *
 * @returns 返回值类型与 `pbFileUploadApi` 相同，通常为 PocketBase 创建记录的响应数据。
 *
 * @throws 如果用户未登录（`pb.authStore.isValid` 为 false 或 `record.id` 为空），会抛出错误。
 * @throws 如果 `uploadFile.raw` 为空，会抛出错误。
 *
 * @example
 * ```ts
 * const controller = new AbortController()
 *
 * const res = await pbFileUploadWithAxios(file, {
 *   onFileUploadProgress: (e) => {
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
export const pbFileUploadWithAxios = async (
  fileCreateData: {
    fileName?: string
    description?: string
    keyword?: string

    file: File
  },
  options?: {
    onFileUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    controller?: AbortController
  }
): ReturnType<typeof pbFileUploadApi> => {
  const { onFileUploadProgress, controller } = options ?? {}

  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备类型
  type DataType = Create<Collections.Files>
  type DataTypeWithFile = ReplacePropertyType<DataType, 'file', File>

  // 准备数据（类型安全）
  const data: DataTypeWithFile = {
    author: pb.authStore.record.id,
    isDeleted: false,
    description: fileCreateData.description,
    keyword: fileCreateData.keyword,
    file: fileCreateData.file,
    fileName: fileCreateData.fileName ?? fileCreateData.file.name,
    fileType: fileCreateData.file.type,
    fileSize: fileCreateData.file.size,
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
    `/api/collections/${Collections.Files}/records`,
    formData,
    {
      baseURL: axiosConfig.baseUrl,
      headers: {
        Authorization: pb.authStore.token,
        'Content-Type': 'multipart/form-data',
      },
      // timeout: 5000,
      onUploadProgress: onFileUploadProgress,
      signal: controller?.signal,
    }
  )

  return res.data
}
