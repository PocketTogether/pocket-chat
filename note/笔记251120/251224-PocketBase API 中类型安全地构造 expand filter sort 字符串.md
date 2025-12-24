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


当然可以，Haruki。我现在完全明白你的意图了：

你希望我写一份**正式的、可放入团队 Wiki 的命名规范文档**，  
**以 Images 集合作为示例**，  
但这份规范将来会成为**所有集合（Messages / Users / Rooms / …）的统一命名标准**。

并且文档要体现你最近做的重命名规范：

- `ImagesResponseWithExpand` → `ImagesResponseWithBaseExpand`
- `ImagesRecordExpand` → `ImagesRecordBaseExpand`
- `imagesExpand` → `imagesBaseExpand`
- `imagesSort` → `imagesPageSort`
- `buildImagesFilter` → `imagesPageFilterBuildFn`

以及这些命名背后的语义、结构、可维护性逻辑。

我会写得非常系统、严谨、工程化，让它成为你 PocketBase API 体系的“官方命名规范”。

---

# 📘 PocketBase API 命名规范（以 Images 集合为示例）

> **适用于所有集合（Images / Messages / Users / Rooms / …）的统一命名体系**  
> —— Haruki 的类型安全 API 设计规范

---

# #️⃣ 1. 规范目标

本命名规范旨在为所有 PocketBase 集合提供：

- **统一的命名体系**
- **明确的语义层级**
- **可维护性强的结构**
- **可扩展到所有集合**
- **与文件结构一致**
- **与 TypeScript 类型安全体系一致**

文档以 **Images 集合** 为示例，但规范适用于所有集合。

---

# #️⃣ 2. 命名结构总览

所有命名遵循统一格式：

```
[collection][Scope][Name]
```

其中：

|部分|示例|说明|
|---|---|---|
|collection|images / messages / users|所属集合|
|Scope|Base / Page / Cursor / Detail / Mutate|所属 API 场景|
|Name|Expand / Sort / FilterBuildFn / Response / Params|功能名称|

---

# #️⃣ 3. Base 层命名规范（基础可复用）

Base 层表示：

- 与具体 API 无关
- 多个 API 可复用
- 通常包含 expand / recordExpand / response 类型
- 文件位置：`src/api/[collection]/base.ts`

---

## ✔ 3.1 Base Expand 字符串

### 命名规则

```
[collection]BaseExpand
```

### Images 示例

```
imagesBaseExpand
```

### 用途

- 集合的基础 expand 字符串
- 多个 API 共用
- 只包含最常用、最基础的展开字段

### 示例代码

```ts
export const imagesBaseExpand = `${recordKeys.author}` as const
```

---

## ✔ 3.2 Base Expand 类型

### 命名规则

```
[Collection]RecordBaseExpand
```

### Images 示例

```
ImagesRecordBaseExpand
```

### 用途

- 描述 expand 后的响应结构
- 与 imagesBaseExpand 一一对应

### 示例代码

```ts
type ImagesRecordBaseExpand = {
  author?: UsersResponse
}
```

---

## ✔ 3.3 Base Response 类型

### 命名规则

```
[Collection]ResponseWithBaseExpand
```

### Images 示例

```
ImagesResponseWithBaseExpand
```

### 用途

- getList / getOne 的响应类型
- 包含 BaseExpand 的 expand 类型

### 示例代码

```ts
export type ImagesResponseWithBaseExpand = ImagesResponse<
  ImagesRecordBaseExpand | undefined
>
```

---

# #️⃣ 4. Page 层命名规范（分页 API 专用）

Page 层表示：

- 专用于分页 API（page-based pagination）
- 不会被其他 API 复用
- 文件位置：`src/api/[collection]/page.ts`

---

## ✔ 4.1 Page Sort

### 命名规则

```
[collection]PageSort
```

### Images 示例

```
imagesPageSort
```

### 用途

- 分页 API 的 sort 字符串
- 通常是 `-created,id`

### 示例代码

```ts
export const imagesPageSort = `-${recordKeys.created},${recordKeys.id}` as const
```

---

## ✔ 4.2 Page Filter 构造函数

### 命名规则

```
[collection]PageFilterBuildFn
```

### Images 示例

```
imagesPageFilterBuildFn
```

### 用途

- 构造分页 API 的 filter 字符串
- 遵守 strict-boolean-expressions
- 字符串拼接 as const
- 多层级字段需显式 recordKeys

### 示例代码

```ts
export const imagesPageFilterBuildFn = (data) => { ... }
```

---

# #️⃣ 5. 命名规范总结表（以 Images 集合为例）

|层级|命名规则|示例|用途|
|---|---|---|---|
|Base|`[collection]BaseExpand`|`imagesBaseExpand`|基础 expand 字符串|
|Base|`[Collection]RecordBaseExpand`|`ImagesRecordBaseExpand`|expand 类型|
|Base|`[Collection]ResponseWithBaseExpand`|`ImagesResponseWithBaseExpand`|响应类型|
|Page|`[collection]PageSort`|`imagesPageSort`|分页 sort|
|Page|`[collection]PageFilterBuildFn`|`imagesPageFilterBuildFn`|分页 filter|

---

# #️⃣ 6. 为什么这种命名体系是最优的？

### ✔ 语义清晰

`imagesPageSort` 一眼就知道：

- 属于 Images 集合
- 用于 Page API
- 是 sort 字符串

### ✔ 可维护性强

未来新增：

```
imagesDetailExpand
imagesCursorFilterBuildFn
imagesMutateCreateParams
```

团队成员也能立刻理解用途。

### ✔ 与文件结构一致

`src/api/images/base.ts` → `imagesBase*`  
`src/api/images/page.ts` → `imagesPage*`

### ✔ 与 TypeScript 类型体系一致

所有类型都以：

```
ImagesRecord*
ImagesResponse*
```

开头，保持一致性。

---

# #️⃣ 7. 未来扩展（适用于所有集合）

当你为 Messages / Users / Rooms 等集合编写 API 时，只需遵循同样的规则：

例如 Messages：

```
messagesBaseExpand
MessagesRecordBaseExpand
MessagesResponseWithBaseExpand

messagesPageSort
messagesPageFilterBuildFn

messagesCursorSort
messagesCursorFilterBuildFn
```

整个项目的 API 命名将保持一致、可读、可维护。

---

# 📌 总结

你现在的命名体系已经非常成熟，而这份文档将它系统化、标准化，使其成为：

- 可复用
- 可扩展
- 可团队协作
- 可长期维护

的 PocketBase API 命名规范。

---

如果你愿意，我还能继续帮你：

- 生成 Markdown 版（含目录）
- 生成 README 版
- 生成“常见错误与最佳实践”章节
- 生成“如何为新集合编写 Base / Page API”教程

你想继续扩展哪一部分？