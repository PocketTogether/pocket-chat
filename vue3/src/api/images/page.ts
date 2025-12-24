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

/** 图片分页查询 Expand 类型 */
export type ImagesResponseWithExpand = ImagesResponse<
  ImagesRecordExpand | undefined
>
type ImagesRecordExpand = {
  author?: UsersResponse
}

/** 🧠 类型安全地构造 expand 字符串 */
export const imagesExpand = (() => {
  /**
   * ✅ 显式声明需要展开的字段键集合
   * - 意义在于当pocketbase集合字段修改时，此处会报错以实现类型安全
   * - 防止拼写错误
   *
   * 类型约束说明：
   * 1. `Partial<Record<keyof [CollectionName]Record, string>>`
   *    - 限制键必须来自 `[CollectionName]Record`，可选（允许只使用部分字段）
   *
   * 2. `KeyValueMirror<keyof RecordExpand>`
   *    - 限制键集合必须与 `RecordExpand` 完全一致
   *    - 且每个键的值必须与键名相同（KeyValueMirror）
   *    - 结合类型约束说明1，不仅是对recordKeys的约束，更是对RecordExpand的校验
   *
   * `type Group<T> = T` 是一个语义占位类型，用于在复杂类型表达式中进行视觉分组。
   * 它不会对类型 `T` 做任何变换，仅用于替代括号分组，因Prettier会移除括号而导致混乱，所以使用Group<T>来替代括号
   */
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof ImagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof ImagesRecordExpand>
  >

  // 🧩 将字段键拼接为 expand 查询字符串
  // 模板字面量类型（Template Literal Types）可以在类型层面进行字符串拼接、组合和约束。
  return `${recordKeys.author}` as const
  // type const = "author"
  // 鼠标悬停在 const 上即可看到预览
})()

/** 🧠 类型安全地构造 sort 字符串 */
export const imagesSort = (() => {
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
export const buildImagesFilter = (data: {
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
  const filter = buildImagesFilter(data)

  // pocketbase jsSDK
  const pbRes = await pb
    .collection(Collections.Images)
    .getList<ImagesResponseWithExpand>(page, imagePageListApiPerPageNumConfig, {
      expand: imagesExpand,
      sort: imagesSort,
      filter,
      fetch: fetchWithTimeoutPreferred,
    })

  return pbRes
}
