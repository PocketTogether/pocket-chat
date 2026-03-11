import { z } from 'zod'

/**
 * PocketBase `messages` 集合中 JSON 字段 `mentionMap` 的 Zod 校验 Schema。
 *
 * 用途：
 * - 记录消息文本中出现的 @username 与其对应的稳定 userId 的映射关系。
 * - 解决用户名可被用户修改的问题，确保消息在任何时间点都能正确指向被提及的用户。
 *
 * 数据结构说明：
 * - 键（key）：消息内容中实际出现的用户名（username 字符串）。
 * - 值（value）：该用户名当时对应的稳定 userId（来自 `users` 集合）。
 *
 * 示例：
 * {
 *   "haruki": "abc123",
 *   "alice": "xyz789"
 * }
 *
 * 备注：
 * - 与关系字段 `mentionedUsers` 配合使用：
 *   - `mentionMap` 负责“文本层”的 username → userId 映射。
 *   - `mentionedUsers` 负责“关系层”的 userId → 用户记录引用。
 * - 两者共同确保 @mention 的解析在未来依然稳定可靠。
 */
export const pbMessagesMentionMapSchema = z.record(
  z.string(), // username
  z.string() // userId
)

// 类型体操：自动推导出类型结构
export type PbMessagesMentionMapType = z.infer<
  typeof pbMessagesMentionMapSchema
>
