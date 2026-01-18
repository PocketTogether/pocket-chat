import { type FilesRecord, type FilesResponse, type UsersResponse } from '@/lib'
import type { Group, KeyValueMirror } from '@/types'

/** 图片分页查询 Expand 类型 */
export type FilesResponseWithBaseExpand = FilesResponse<
  FilesRecordBaseExpand | undefined
>
type FilesRecordBaseExpand = {
  author?: UsersResponse
}

/** 🧠
 * 类型安全地构造 expand 字符串
 * filesBaseExpand（base），命名规则 files[name]Expand）
 * 即基础的 expand 字符串，将在多个api中使用
 */
export const filesBaseExpand = (() => {
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
    Partial<KeyValueMirror<keyof FilesRecord>>
  > satisfies Group<
    // 限制键集合必须与 `[CollectionName]RecordExpand[DeepExpandKey]` 完全一致，且每个键的值必须与键名相同（KeyValueMirror）
    // 不仅是对键的检查，也是对 `[CollectionName]RecordExpand[DeepExpandKey]` 这个类型本身的检查
    KeyValueMirror<keyof FilesRecordBaseExpand>
  >

  // 🧩 将字段键拼接为 expand 查询字符串
  // 模板字面量类型（Template Literal Types）可以在类型层面进行字符串拼接、组合和约束。
  return `${recordKeys.author}` as const
  // type const = "author"
  // 鼠标悬停在 const 上即可看到预览
})()
