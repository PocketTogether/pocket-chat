```
vue3 ts pocketbase
"pocketbase-typegen": "^1.3.1",
"pb-typegen-json": "pocketbase-typegen --json ../pocketbase/pb_schema.json --out ./src/lib/pocketbase/pocketbase-types.ts"
```

### PocketBase API 中类型安全地构造 `expand` / `filter` / `sort` 字符串  
（基于 TypeScript + `satisfies` + `KeyValueMirror` + `Group<T>`）

---

## 1. 为什么要类型安全地构造 expand / filter / sort

PocketBase 的 `expand` / `filter` / `sort` 参数本质都是字符串，如果直接手写：

- 字段名拼写错误不会在编译期暴露
- 集合字段变更不会触发任何提示
- 多层级关系字段极易写错
- 重构成本高，团队协作不安全

目标是利用 TypeScript 类型系统，让这些字符串：

- **字段来源受限于对应 Record 类型**
- **展开字段受限于 Expand 类型**
- **多层级字段必须显式声明**
- **字段变更/拼写错误在编译期直接报错**

---

## 2. 核心工具类型：`Group<T>` 与 `KeyValueMirror`

### `Group<T>`

```ts
type Group<T> = T
```

**作用：**

- 仅用于“视觉分组”的语义占位类型
- 避免复杂 `satisfies` 表达式中括号被 Prettier 移除
- 不改变类型，只提升可读性

### `KeyValueMirror`

```ts
type KeyValueMirror<K extends string | number | symbol> = {
  [P in K]: P
}
```

**约束效果：**

- key 必须来自 `K`
- value 必须与 key 完全一致（`"author": "author"`）
- 结合 `keyof SomeRecord` 使用时，可以同时校验：
  - 字段是否存在于 Record
  - 字段名是否拼写正确
  - 字段集合是否与 Expand 类型一致（配合 `keyof SomeRecordExpand`）

---

## 3. 类型安全 expand 的设计模式

**核心原则：**

> `expand` 字符串的每一个字段，都必须同时通过：
> - `keyof [Collection]Record` 校验
> - `keyof [Collection]RecordExpand` 校验
> - `KeyValueMirror` 的 key/value 一致性校验

典型写法（以 Images 为例，简化版）：

```ts
type ImagesRecordBaseExpand = {
  author?: UsersResponse
}

export type ImagesResponseWithBaseExpand = ImagesResponse<
  ImagesRecordBaseExpand | undefined
>

export const imagesBaseExpand = (() => {
  const recordKeys = {
    author: 'author',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof ImagesRecord>>
  > satisfies Group<
    KeyValueMirror<keyof ImagesRecordBaseExpand>
  >

  return `${recordKeys.author}` as const
  // type: "author"
})()
```

**关键点：**

- `Partial<KeyValueMirror<keyof ImagesRecord>>`：字段必须来自 `ImagesRecord`
- `KeyValueMirror<keyof ImagesRecordBaseExpand>`：字段集合必须与 `ImagesRecordBaseExpand` 一致
- `as const` + 模板字面量：让最终字符串在类型层面保持字面量精度

---

## 4. 多层级 expand（深度展开）

多层级关系（如 Messages 中的 `replyMessage.author`、`images.author`）通过**分层 recordKeys** 实现：

- 顶层：`MessagesRecord` + `MessagesRecordBaseExpand`
- 子层级：`MessagesRecordExpandReplyMessage`、`MessagesRecordExpandImages` 等

模式：

```ts
type MessagesRecordBaseExpand = {
  author?: UsersResponse
  replyMessage?: MessagesResponseWithBaseExpandReplyMessage
  images?: MessagesResponseWithBaseExpandImages[]
}

type MessagesRecordExpandReplyMessage = {
  author?: UsersResponse
}

type MessagesRecordExpandImages = {
  author?: UsersResponse
}

export const messagesBaseExpand = (() => {
  const recordKeys = {
    author: 'author',
    replyMessage: 'replyMessage',
    images: 'images',
  } as const satisfies Group<
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    KeyValueMirror<keyof MessagesRecordBaseExpand>
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
    Partial<KeyValueMirror<keyof ImagesRecord>>
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

**要点：**

- 每一层关系字段都用独立的 `recordKeys*` 显式声明
- 每一层都用 `KeyValueMirror<keyof 对应 Expand 类型>` 校验
- 多层级路径通过模板字面量拼接：`parent.child`、`parent.child.grandChild`

---

## 5. 类型安全 sort 的设计模式

sort 只依赖 Record 字段，不依赖 Expand：

```ts
export const imagesPageSort = (() => {
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

**要点：**

- 只用 `keyof [Collection]Record` + `KeyValueMirror`
- 通过模板字面量构造 `-field,field2` 等排序字符串
- `as const` 保留字面量类型，方便后续复用与检查

---

## 6. 类型安全 filter 的设计模式

filter 的复杂度在于：

- 需要组合多个条件
- 可能包含多层级字段
- 需要遵守 `strict-boolean-expressions`
- 需要避免隐式 `null` / `undefined` 逻辑

模式（以 Images 为例，保留结构要点）：

```ts
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
    Partial<KeyValueMirror<keyof ImagesRecord>>
  >

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

  if (filterAuthorPart !== null && filterSearchPart !== null) {
    return `(
      ${filterAuthorPart} &&
      ${filterSearchPart}
    )` as const
  }
  if (filterAuthorPart !== null) return filterAuthorPart
  if (filterSearchPart !== null) return filterSearchPart
  return undefined
}
```

**关键约束：**

- 所有字段均来自 `keyof [Collection]Record` 或关联 Record
- 多层级字段通过额外 `recordKeys*` 显式声明
- 不使用 `??`、`||` 等隐式布尔逻辑，全部用显式 `if`
- 返回值要么是 `as const` 的字符串，要么是 `undefined`

---

## 7. 完整示例：Images API
放在本节，作为“单集合 + 单层级 + Page API”的完整落地案例。
```ts
// src\api\images\page.ts

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
```

---

## 8. 完整示例：Messages API（多层级）
放在本节，重点展示：
- 多层级 `expand`（`replyMessage.author`、`images.author`）
- 多个 `RecordExpand*` 类型
- 多个 `recordKeys*` 的协同

```ts
// src\api\messages\base.ts

/** messages pb查询时一般要用的 Expand ，将在多个api中使用 */

import type {
  ImagesResponse,
  MessagesRecord,
  MessagesResponse,
  UsersResponse,
} from '@/lib'
import type { Group, KeyValueMirror } from '@/types'

// 📦 定义 PocketBase 扩展字段的响应类型
// 完整的消息类型
export type MessagesResponseWidthExpand = MessagesResponse<
  MessagesRecordExpand | undefined
>
// 辅助类型，消息中replyMessage的类型
export type MessagesResponseWidthExpandReplyMessage = MessagesResponse<
  MessagesRecordExpandReplyMessage | undefined
>
// 辅助类型，消息中images的类型
export type MessagesResponseWidthExpandImages = ImagesResponse<
  MessagesRecordExpandImages | undefined
>
// 🎯 指定集合中需要展开的关联字段及其响应类型
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

// 🧠 类型安全地构造 expand 字符串
export const messagesExpand = (() => {
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
    replyMessage: 'replyMessage',
    images: 'images',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    KeyValueMirror<keyof MessagesRecordExpand>
  >
  const recordKeysReplyMessage = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof MessagesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    KeyValueMirror<keyof MessagesRecordExpandReplyMessage>
  >

  const recordKeysImages = {
    author: 'author',
  } as const satisfies Group<
    // 限制键必须来自 `[CollectionName]Record`，且每个键的值必须与键名相同（KeyValueMirror），可选（允许只使用部分字段）
    Partial<KeyValueMirror<keyof ImagesResponse>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    KeyValueMirror<keyof MessagesRecordExpandImages>
  >

  // 🧩 将字段键拼接为 expand 查询字符串
  // 模板字面量类型（Template Literal Types）可以在类型层面进行字符串拼接、组合和约束。
  const rk = recordKeys
  const rkrm = recordKeysReplyMessage
  const rki = recordKeysImages
  return `${rk.author},${rk.replyMessage}.${rkrm.author},${rk.images}.${rki.author}` as const
  // type const = "author,replyMessage.author,images.author"
})()
```

---

## 9. 常见错误与自动报错机制

通过 `KeyValueMirror` + `keyof Record` + `keyof RecordExpand` 的组合，可以在编译期捕获：

- **字段拼写错误**

  ```ts
  const recordKeys = {
    auther: 'auther', // ❌ 不在 keyof ImagesRecord
  } as const satisfies KeyValueMirror<keyof ImagesRecord>
  ```

- **使用了不存在的 Record 字段**

  ```ts
  const recordKeys = {
    replymessage: 'replymessage', // ❌ 不在 keyof MessagesRecord
  } as const satisfies KeyValueMirror<keyof MessagesRecord>
  ```

- **Expand 类型与实际展开字段不一致**

  ```ts
  type ImagesRecordBaseExpand = {
    author?: UsersResponse
    // 新增了一个字段但忘记在 recordKeys 中声明时，KeyValueMirror<keyof ImagesRecordBaseExpand> 会报错
  }
  ```

- **多层级字段路径错误**

  ```ts
  const recordKeysReplyMessage = {
    auther: 'auther', // ❌ 不在 keyof MessagesRecordExpandReplyMessage
  } as const satisfies KeyValueMirror<keyof MessagesRecordExpandReplyMessage>
  ```

- **filter 中字段名错误**

  ```ts
  `${recordKeys.altx}~'cat'` // ❌ altx 不在 keyof ImagesRecord
  ```

这些错误全部在编译期暴露，避免运行时才发现请求失败。
这就是这一块的意义
