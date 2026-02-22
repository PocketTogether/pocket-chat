/** 用户分页查询，每页个数 */
export const userPageListApiPerPageNumConfig = 20 as const

/** 某用户的消息查询，分页查询，每页个数 */
export const userInfoMessageListApiPerPageNumConfig = 10 as const

/**
 * 构建一个用于匹配用户消息中 @username 的正则表达式。
 *
 * 每次调用都会返回一个全新的 RegExp 实例，避免 `g` 标志导致的 lastIndex 状态污染。
 *
 * 匹配规则：
 * - 前置边界：字符串开头或空白字符（会被匹配并包含在 match[0] 中）
 * - `@` 符号
 * - 用户名：由 1–32 位字母、数字或下划线组成
 * - 后置边界：字符串结尾或空白字符（通过先行断言匹配，不会被消费）
 *
 * 使用了 `g` 和 `m` 标志：
 * - `g`：允许通过 `exec()` 进行多次迭代匹配
 * - `m`：使 `^` 和 `$` 在多行文本中按行匹配
 *
 * 注意：不吃后空格、会吃前空格，处理时注意判断并修正index
 * - 由于前置分组 `(^|\\s)` 会消费空格，`match.index` 指向的是前置空格的位置。
 * - 如果需要获得精确的 '@' 位置，可通过以下方式修正：
 *     const correctedIndex = match.index + (match[0].length - match[2].length)
 *
 * 捕获组说明：
 * - match[2]：完整的 @username（如 "@haruki"）
 * - match[3]：username 本体（如 "haruki"）
 *
 * @returns {RegExp} 一个新的、无状态的 RegExp 实例
 */
//
export const userMessageMentionRegexBulidFn = (): RegExp =>
  /(^|\s)(@([a-zA-Z0-9_]{1,32}))(?=$|\s)/gm

// match[2] 即是如 @haruki
/**
 * 在 mention 匹配结果中，表示完整 @username（如 "@haruki"）的捕获组编号。
 *
 * 对应正则中的第二个捕获组：
 *   ( @([a-zA-Z0-9_]{1,32}) )
 *
 * 即 match[2]。
 */
export const userMessageMentionRegexAtUsernameIndexNum = 2 as const

// match[3] 即是如 haruki
/**
 * 在 mention 匹配结果中，表示 username 本体（如 "haruki"）的捕获组编号。
 *
 * 对应正则中的第三个捕获组：
 *   ( [a-zA-Z0-9_]{1,32} )
 *
 * 即 match[3]。
 */
export const userMessageMentionRegexUsernameIndexNum = 3 as const
