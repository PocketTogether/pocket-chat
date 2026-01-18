import { filePageListApiPerPageNumConfig } from '@/config'
import { Collections, pb, type FilesRecord, type UsersRecord } from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import { filesBaseExpand, type FilesResponseWithBaseExpand } from './base'

/** 🧠 类型安全地构造 sort 字符串 */
export const filesPageSort = (() => {
  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof FilesRecord>>
  >

  return `-${recordKeys.created},${recordKeys.id}` as const
  // type const = "-created,id"
})()

/** 🧠 类型安全地构造 filter 字符串（严格遵守 strict-boolean-expressions） */
export const filesPageFilterBuildFn = (data: {
  author?: string | null
  search?: string | null
}) => {
  const recordKeys = {
    author: 'author',
    fileName: 'fileName',
    description: 'description',
    keyword: 'keyword',
    id: 'id',
    isDeleted: 'isDeleted',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof FilesRecord>>
  >
  // 如 expand filter sort 字符串中要扩展使用关系字段之下的字段，就需再来一个 recordKey
  // 如 ${recordKeys.author}.${recordKeysAuthor.username}='${s}' author 对应 recordKeysAuthor
  const recordKeysAuthor = {
    username: 'username',
    name: 'name',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof UsersRecord>>
  >

  // --- author 部分 ---
  const filterAuthorPart = (() => {
    if (data.author == null) {
      return null
    }
    if (data.author === '') {
      return null
    }
    return `${recordKeys.author}='${data.author}'` as const
  })()

  // --- search 部分 ---
  const filterSearchPart = (() => {
    if (data.search == null) {
      return null
    }
    if (data.search === '') {
      return null
    }
    const s = data.search
    return `(
      ${recordKeys.fileName}~'${s}' ||
      ${recordKeys.description}~'${s}' ||
      ${recordKeys.keyword}~'${s}' ||
      ${recordKeys.id}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.username}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.name}='${s}'
    )` as const
  })()

  // isDelete 部分
  const filterIsDeletePart = `${recordKeys.isDeleted}=false` as const

  // --- 显式 if 分支 ---
  if (filterAuthorPart != null && filterSearchPart != null) {
    return `(
    ${filterAuthorPart} &&
    ${filterSearchPart} &&
    ${filterIsDeletePart}
    )` as const
  }
  if (filterAuthorPart != null && filterSearchPart == null) {
    // return filterAuthorPart
    return `(
    ${filterAuthorPart} &&
    ${filterIsDeletePart}
    )` as const
  }
  if (filterAuthorPart == null && filterSearchPart != null) {
    // return filterSearchPart
    return `(
    ${filterSearchPart} &&
    ${filterIsDeletePart}
    )` as const
  }
  // 两者都为 null
  return filterIsDeletePart
}

/** 图片分页查询，普通分页 */
export const pbFilePageListApi = async (
  page: number,
  data: {
    author?: string | null
    search?: string | null
  }
) => {
  const filter = filesPageFilterBuildFn(data)

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Files)
    .getList<FilesResponseWithBaseExpand>(
      page,
      filePageListApiPerPageNumConfig,
      {
        expand: filesBaseExpand,
        sort: filesPageSort,
        filter,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
