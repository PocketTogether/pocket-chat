```
vue3 ts pocketbase
"pocketbase-typegen": "^1.3.1",
"pb-typegen-json": "pocketbase-typegen --json ../pocketbase/pb_schema.json --out ./src/lib/pocketbase/pocketbase-types.ts"
```

下面我给你写一篇**完整、系统、可直接放进团队 Wiki 的说明文档**，专门讲解：

# 📘 PocketBase API 中类型安全地构造 expand / filter / sort 字符串

`（基于 TypeScript + satisfies + KeyValueMirror + Group<T>）`

这篇文档会：

- 解释你的设计思想
- 展示完整示例（messages / images）
- 说明为什么这样写能做到“字段变更自动报错”
- 给出最佳实践与扩展方式

内容会非常贴近你当前的工程风格，语义严谨、结构清晰、可维护性强。

---
# 目录

1. 为什么要类型安全地构造 expand / filter / sort
2. 核心工具类型：`Group<T>` 与 KeyValueMirror
3. 类型安全 expand 的设计模式
4. 多层级 expand（深度展开）
5. 类型安全 sort 的设计模式
6. 类型安全 filter 的设计模式
7. 完整示例：Images API
8. 完整示例：Messages API（多层级）
9. 常见错误与自动报错机制
10. 未来可扩展方向（可选）

---

# 1. 为什么要类型安全地构造 expand / filter / sort？

PocketBase 的 API 参数（expand / filter / sort）都是**字符串**：

```ts
expand: "author,replyMessage.author,images.author"
sort: "-created,id"
filter: "(author='xxx' && alt~'cat')"
```

字符串的问题：

- 拼写错误不会报错
- 字段变更不会报错
- 多层级字段容易写错
- 团队成员难以维护
- 重构时容易遗漏

你现在的方案通过 TypeScript 的类型系统，让所有这些字符串：

✔ 字段必须来自 Record 类型  
✔ 字段必须与 Expand 类型一致  
✔ 多层级字段必须显式声明  
✔ 拼写错误立即报错  
✔ 字段变更自动报错

这是 PocketBase + TypeScript 的最佳实践。

---

# 2. 核心工具类型：`Group<T>` 与 KeyValueMirror

## `Group<T>`

```ts
type Group<T> = T
```

它不做任何事，只是为了让复杂类型表达式更清晰。

因为 Prettier 会移除括号：

```ts
(A & B) & C  // Prettier 会改写
```

但：

```ts
Group<A> satisfies Group<B>
```

可读性更强。

---

## KeyValueMirror

```ts
type KeyValueMirror<K extends string | number | symbol> = {
  [P in K]: P
}
```

它要求：

- key 必须来自 K
- value 必须与 key 完全一致

例如：

```ts
{
  author: "author"
}
```

如果你写成：

```ts
{
  author: "auther" // ❌ 报错
}
```

---

# 3. 类型安全 expand 的设计模式

核心思想：

> **expand 字段必须与 RecordExpand 类型完全一致，并且字段必须来自 Record 类型。**

例如 Images：

```ts
type ImagesRecordExpand = {
  author?: UsersResponse
}
```

构造 expand：

```ts
const recordKeys = {
  author: 'author',
} as const satisfies Group<
  Partial<KeyValueMirror<keyof ImagesRecord>>
> satisfies Group<
  KeyValueMirror<keyof ImagesRecordExpand>
>
```

这段代码同时校验：

1. `author` 必须来自 ImagesResponse
2. `author` 必须来自 ImagesRecordExpand
3. key 与 value 必须一致

最终 expand：

```ts
return `${recordKeys.author}` as const
```

---

# 4. 多层级 expand（深度展开）

Messages API 中有多层级：

```
author
replyMessage.author
images.author
```

对应类型：

```ts
type MessagesRecordExpand = {
  author?: UsersResponse
  replyMessage?: MessagesResponseWidthExpandReplyMessage
  images?: MessagesResponseWidthExpandImages[]
}
```

你为每一层都声明一个 recordKeys：

### 顶层

```ts
const recordKeys = {
  author: 'author',
  replyMessage: 'replyMessage',
  images: 'images',
}
```

### replyMessage 子层级

```ts
const recordKeysReplyMessage = {
  author: 'author',
}
```

### images 子层级

```ts
const recordKeysImages = {
  author: 'author',
}
```

最终 expand：

```ts
`${rk.author},${rk.replyMessage}.${rkrm.author},${rk.images}.${rki.author}`
```

生成：

```
author,replyMessage.author,images.author
```

并且完全类型安全。

---

# 5. 类型安全 sort 的设计模式

sort 也必须来自 Record：

```ts
const recordKeys = {
  created: 'created',
  id: 'id',
} as const satisfies Group<
  Partial<KeyValueMirror<keyof ImagesRecord>>
>
```

最终：

```ts
return `-${recordKeys.created},${recordKeys.id}` as const
```

生成：

```
-created,id
```

---

# 6. 类型安全 filter 的设计模式

filter 需要：

- 字段必须来自 Record
- 多层级字段必须显式声明
- 严格遵守 strict-boolean-expressions
- 字符串拼接 as const
- 显式 if 分支，不使用 ??

示例：

```ts
const recordKeys = {
  author: 'author',
  alt: 'alt',
  keyword: 'keyword',
  id: 'id',
} as const satisfies Group<
  Partial<KeyValueMirror<keyof ImagesRecord>>
>
```

多层级字段：

```ts
const recordKeysAuthor = {
  username: 'username',
  name: 'name',
} as const satisfies Group<
  Partial<KeyValueMirror<keyof UsersRecord>>
>
```

最终 filter：

```ts
${recordKeys.author}.${recordKeysAuthor.username}='${s}'
```

---

# 7. 完整示例：Images API

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

# 8. 完整示例：Messages API

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

# 9. 常见错误与自动报错机制

|错误类型|示例|会报错吗？|原因|
|---|---|---|---|
|拼写错误|`"auther"`|✔|KeyValueMirror 校验|
|Record 字段不存在|`"replymessage"`|✔|keyof MessagesRecord 校验|
|Expand 类型不一致|RecordExpand 多字段|✔|`KeyValueMirror<keyof RecordExpand>` 校验|
|多层级字段写错|`"replyMessage.auther"`|✔|子层级 recordKeysReplyMessage 校验|
|filter 中字段写错|`"altx~'cat'"`|✔|keyof ImagesRecord 校验|

---

# 10. 未来可扩展方向（可选）

你现在的体系已经非常强大，但还可以进一步抽象：

- `buildExpand<Record, Expand>()`
- `buildSort<Record>()`
- `buildFilter<Record>()`
- 自动生成 recordKeys（基于 satisfies + mapped types）
- 自动生成多层级 expand DSL

如果你愿意，我可以帮你把整个体系抽象成一个**可复用的 DSL**，让所有 API 都能统一使用。

---

# 📌 总结

你的方案本质上是：

> **利用 TypeScript 的类型系统，将 PocketBase 的字符串 API 参数变成完全类型安全的结构化声明。**

它带来的好处：

- 字段变更自动报错
- 拼写错误自动报错
- 多层级展开自动校验
- filter / sort / expand 全部类型安全
- 团队成员不需要记字段名
- 重构安全性极高

这是一个非常成熟、非常工程化的 PocketBase + TypeScript 解决方案。

---

如果你愿意，我可以继续帮你：

- 写一份团队 Wiki 版本
- 写一份 README 版本
- 写一份“如何扩展到更多 API”的指南
- 抽象成通用工具函数

你想继续深入哪一部分？