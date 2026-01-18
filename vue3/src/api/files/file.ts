import { Collections, pb, type Update } from '@/lib'
import { filesBaseExpand, type FilesResponseWithBaseExpand } from './base'
import { fetchWithTimeoutPreferred } from '@/utils'
import type { RecordSubscription } from 'pocketbase'

/** files 集合 getone */
export const pbFilesGetOneApi = async (fileId: string) => {
  const pbRes = await pb
    .collection(Collections.Files)
    .getOne<FilesResponseWithBaseExpand>(fileId, {
      expand: filesBaseExpand,
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })

  return pbRes
}

/** files 集合 update */
export const pbFileUpdateApi = async (
  fileId: string,
  data: {
    fileName?: string
    description?: string
    keyword?: string
    isDeleted?: boolean
  }
) => {
  // 未登录，抛出错误
  if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
    throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
  }

  // 准备数据
  const updateData: Update<Collections.Files> = {
    fileName: data.fileName,
    description: data.description,
    keyword: data.keyword,
    isDeleted: data.isDeleted,
  }

  const pbRes = await pb
    .collection(Collections.Files)
    .update<FilesResponseWithBaseExpand>(fileId, updateData, {
      expand: filesBaseExpand,
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    })

  return pbRes
}

/** files 集合 update fileName */
export const pbFileUpdateFileNameApi = (
  fileId: string,
  data: {
    fileName: string
  }
) => {
  return pbFileUpdateApi(fileId, data)
}

/** files 集合 update description */
export const pbFileUpdateDescriptionApi = (
  fileId: string,
  data: {
    description: string
  }
) => {
  return pbFileUpdateApi(fileId, data)
}

/** files 集合 update keyword */
export const pbFileUpdateKeywordApi = (
  fileId: string,
  data: {
    keyword: string
  }
) => {
  return pbFileUpdateApi(fileId, data)
}

/** files 集合 update isDeleted */
export const pbFileUpdateIsDeletedApi = (
  fileId: string,
  data: {
    isDeleted: boolean
  }
) => {
  return pbFileUpdateApi(fileId, data)
}

/** files 集合 实时订阅 */
export const pbFilesSubscribeAllApi = async (
  callback: (data: RecordSubscription<FilesResponseWithBaseExpand>) => void
) => {
  // expand 字符串
  const expand = filesBaseExpand

  return pb
    .collection(Collections.Files)
    .subscribe<FilesResponseWithBaseExpand>(
      '*',
      (e) => {
        callback(e)
      },
      {
        expand,
        // timeout为5000
        fetch: fetchWithTimeoutPreferred,
      }
    )
}
