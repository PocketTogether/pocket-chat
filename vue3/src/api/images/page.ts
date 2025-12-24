import { imagePageListApiPerPageNumConfig } from '@/config'
import {
  Collections,
  pb,
  type ImagesRecord,
  type ImagesResponse,
  type UsersRecord,
  type UsersResponse,
} from '@/lib'
import type { Group, KeyValueMirror } from '@/types'
import { fetchWithTimeoutPreferred } from '@/utils'
import { imagesBaseExpand, type ImagesResponseWithBaseExpand } from './base'

/** 🧠 类型安全地构造 sort 字符串 */
export const imagesPageSort = (() => {
  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof ImagesRecord>>
  >

  return `-${recordKeys.created},${recordKeys.id}` as const
  // type const = "-created,id"
})()

/** 🧠 类型安全地构造 filter 字符串（严格遵守 strict-boolean-expressions） */
export const imagesPageFilterBuildFn = (data: {
  author?: string | null
  search?: string | null
}) => {
  const recordKeys = {
    author: 'author',
    alt: 'alt',
    keyword: 'keyword',
    id: 'id',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof ImagesRecord>>
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
    if (data.author === null || data.author === undefined) {
      return null
    }
    if (data.author === '') {
      return null
    }
    return `${recordKeys.author}='${data.author}'` as const
  })()

  // --- search 部分 ---
  const filterSearchPart = (() => {
    if (data.search === null || data.search === undefined) {
      return null
    }
    if (data.search === '') {
      return null
    }
    const s = data.search
    return `(
      ${recordKeys.alt}~'${s}' ||
      ${recordKeys.keyword}~'${s}' ||
      ${recordKeys.id}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.username}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.name}='${s}'
    )` as const
  })()

  // --- 显式 if 分支 ---
  if (filterAuthorPart !== null && filterSearchPart !== null) {
    return `(
    ${filterAuthorPart} &&
    ${filterSearchPart}
    )` as const
  }
  if (filterAuthorPart !== null && filterSearchPart === null) {
    return filterAuthorPart
  }
  if (filterAuthorPart === null && filterSearchPart !== null) {
    return filterSearchPart
  }
  // 两者都为 null
  return undefined
}

/** 图片分页查询，普通分页 */
export const pbImagePageListApi = async (
  page: number,
  data: {
    author?: string | null
    search?: string | null
  }
) => {
  const filter = imagesPageFilterBuildFn(data)

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Images)
    .getList<ImagesResponseWithBaseExpand>(
      page,
      imagePageListApiPerPageNumConfig,
      {
        expand: imagesBaseExpand,
        sort: imagesPageSort,
        filter,
        fetch: fetchWithTimeoutPreferred,
      }
    )

  return pbRes
}
