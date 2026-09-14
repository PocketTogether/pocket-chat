---
name: pb-type-safety
description: >-
  Use when working with PocketBase TypeScript types, type-safe expand/filter/sort string construction, Create/Update utility types, or pocketbase-typegen in the vue3/ directory.
  在 vue3/ 中处理 PocketBase 类型定义、类型安全的 expand/filter/sort 构造、Create/Update 工具类型、pocketbase-typegen 时使用。
---

# PocketBase 类型安全

## 生成的类型文件

通过 pocketbase-typegen 从 `pocketbase/pb_schema.json` 生成：

```bash
pocketbase-typegen --json ../pocketbase/pb_schema.json --out ./src/lib/pocketbase/pocketbase-types.ts
```

生成文件位于 `vue3/src/lib/pocketbase/pocketbase-types.ts`，**是生成文件，勿手改**，只通过 typegen 重新生成。

### 核心类型结构

```ts
export enum Collections {
  Config = "config",
  Files = "files",
  Images = "images",
  Messages = "messages",
  Users = "users",
}

// Record 类型 —— 对应集合的字段
export type FilesRecord = {
  author: RecordIdString
  created?: IsoDateString
  description?: string
  file: string
  fileName?: string
  // ...
}

// Response 类型 = Record + 系统字段
export type FilesResponse<Texpand = unknown> = Required<FilesRecord> & BaseSystemFields<Texpand>

// TypedPocketBase —— 类型安全的 SDK 实例
export type TypedPocketBase = PocketBase & {
  collection(idOrName: 'files'): RecordService<FilesResponse>
  collection(idOrName: 'images'): RecordService<ImagesResponse>
  // ...
}
```

### Create/Update 工具类型

`vue3/src/lib/pocketbase/utility-types-for-create-update-operations/index.ts` 中定义：

```ts
// 创建类型 —— Base 集合
export type CreateBase<T> = {
  id?: RecordIdString
} & Omit<
  { [K in keyof T as T[K] extends IsoAutoDateString | (IsoAutoDateString | undefined) ? never : K]: T[K] },
  'id'
>

// 创建类型 —— Auth 集合（额外忽略 tokenKey）
export type CreateAuth<T> = {
  id?: RecordIdString
  email: string
  emailVisibility?: boolean
  password: string
  passwordConfirm: string
  verified?: boolean
} & Omit<
  { [K in keyof T as T[K] extends IsoAutoDateString ? never : K]: T[K] },
  'id' | 'tokenKey'
>

// 更新类型
export type UpdateBase<T> = Partial<Omit<T, keyof BaseSystemFields>>
export type UpdateAuth<T> = Partial<Omit<T, keyof AuthSystemFields>> & { /* ... */ }

// 按集合自动选择
export type Create<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? CreateAuth<CollectionRecords[T]>
    : CreateBase<CollectionRecords[T]>

export type Update<T extends keyof CollectionResponses> =
  CollectionResponses[T] extends AuthSystemFields
    ? UpdateAuth<CollectionRecords[T]>
    : UpdateBase<CollectionRecords[T]>
```

使用示例：

```ts
import { Collections } from '@/lib'
import type { Create, Update } from '@/lib/pocketbase/utility-types-for-create-update-operations'

// 创建
const createData: Create<Collections.Users> = {
  username: data.username,
  email: data.email,
  password: data.password,
  passwordConfirm: data.passwordConfirm,
}
const pbRes = await pb.collection(Collections.Users).create(createData, { fetch: fetchWithTimeoutPreferred })

// 更新
const updateData: Update<Collections.Images> = {
  alt: data.alt,
  keyword: data.keyword,
  isDeleted: data.isDeleted,
}
const pbRes = await pb.collection(Collections.Images).update<ImagesResponseWithBaseExpand>(imageId, updateData, {
  expand: imagesBaseExpand,
  fetch: fetchWithTimeoutPreferred,
})
```

---

## 类型安全的 expand / filter / sort

### 为什么要类型安全

PocketBase 的 `expand` / `filter` / `sort` 参数本质都是字符串，直接手写会导致：
- 字段名拼写错误不会在编译期暴露
- 集合字段变更不会触发任何提示
- 多层级关系字段极易写错
- 重构成本高

### 核心工具类型

```ts
// 语义占位类型，用于复杂 satisfies 表达式中替代括号（Prettier 会移除括号）
type Group<T> = T

// key 必须来自 K，value 必须与 key 完全一致（"author": "author"）
type KeyValueMirror<K extends string | number | symbol> = {
  [P in K]: P
}
```

### 类型安全 expand 的设计模式

```ts
// 1. 定义 Expand 类型
type ImagesRecordBaseExpand = {
  author?: UsersResponse
}

export type ImagesResponseWithBaseExpand = ImagesResponse<ImagesRecordBaseExpand | undefined>

// 2. 类型安全地构造 expand 字符串
export const imagesExpand = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof ImagesRecord>>       // 字段必须来自 Record
  > satisfies Group<
    KeyValueMirror<keyof ImagesRecordBaseExpand>      // 字段集合必须与 Expand 类型一致
  >

  return `${recordKeys.author}` as const
  // type: "author"
})()
```

**关键约束：**
- `Partial<KeyValueMirror<keyof ImagesRecord>>` — 字段必须来自 Record（可选）
- `KeyValueMirror<keyof ImagesRecordBaseExpand>` — 字段集合必须与 Expand 类型完全一致

### 多层级 expand（深度展开）

如 Messages 中的 `replyMessage.author`、`images.author`：

```ts
type MessagesRecordExpand = {
  author?: UsersResponse
  replyMessage?: MessagesResponseWidthExpandReplyMessage
  images?: MessagesResponseWidthExpandImages[]
}

type MessagesRecordExpandReplyMessage = {
  author?: UsersResponse
}

type MessagesRecordExpandImages = {
  author?: UsersResponse
}

export const messagesExpand = (() => {
  const recordKeys = {
    author: 'author',
    replyMessage: 'replyMessage',
    images: 'images',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    KeyValueMirror<keyof MessagesRecordExpand>
  >

  const recordKeysReplyMessage = {
    author: 'author',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    KeyValueMirror<keyof MessagesRecordExpandReplyMessage>
  >

  const recordKeysImages = {
    author: 'author',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof ImagesResponse>>
  > satisfies Group<
    KeyValueMirror<keyof MessagesRecordExpandImages>
  >

  const rk = recordKeys
  const rkrm = recordKeysReplyMessage
  const rki = recordKeysImages

  return `${rk.author},${rk.replyMessage}.${rkrm.author},${rk.images}.${rki.author}` as const
  // type: "author,replyMessage.author,images.author"
})()
```

### 类型安全 sort

sort 只依赖 Record 字段，不依赖 Expand：

```ts
export const imagesSort = (() => {
  const recordKeys = {
    created: 'created',
    id: 'id',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof ImagesRecord>>
  >

  return `-${recordKeys.created},${recordKeys.id}` as const
  // type: "-created,id"
})()
```

### 类型安全 filter

```ts
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
    Partial<KeyValueMirror<keyof ImagesRecord>>
  >

  // 扩展使用关系字段之下的字段时，需要额外的 recordKeys
  const recordKeysAuthor = {
    username: 'username',
    name: 'name',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof UsersRecord>>
  >

  const filterAuthorPart = (() => {
    if (data.author === null || data.author === undefined) return null
    if (data.author === '') return null
    return `${recordKeys.author}='${data.author}'` as const
  })()

  const filterSearchPart = (() => {
    if (data.search === null || data.search === undefined) return null
    if (data.search === '') return null
    const s = data.search
    return `(
      ${recordKeys.alt}~'${s}' ||
      ${recordKeys.keyword}~'${s}' ||
      ${recordKeys.id}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.username}='${s}' ||
      ${recordKeys.author}.${recordKeysAuthor.name}='${s}'
    )` as const
  })()

  // 显式 if 分支，不使用 ??、|| 等隐式布尔逻辑
  if (filterAuthorPart !== null && filterSearchPart !== null) {
    return `(${filterAuthorPart} && ${filterSearchPart})` as const
  }
  if (filterAuthorPart !== null) return filterAuthorPart
  if (filterSearchPart !== null) return filterSearchPart
  return undefined
}
```

### 完整 API 使用示例

```ts
export const pbImagePageListApi = async (
  page: number,
  data: { author?: string | null; search?: string | null }
) => {
  const filter = buildImagesFilter(data)
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
```

### 自动报错机制

通过 `KeyValueMirror` + `keyof Record` + `keyof RecordExpand` 的组合，以下错误全部在编译期暴露：

- 字段拼写错误（如 `auther` 不在 `keyof ImagesRecord`）
- 使用了不存在的 Record 字段
- Expand 类型与实际展开字段不一致
- 多层级字段路径错误
- filter 中字段名错误
