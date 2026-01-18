/** 上传图片 最大同时上传数 */
export const uploadImageMaxSimultaneousNumConfig = 2 as const
/** 上传图片 调度轮询间隔 单位 ms*/
export const uploadImageSchedulerPollingIntervalMsConfig = 2000 as const
/** 上传图片 上传进度更新间隔 单位 ms*/
export const uploadImageProgressUpdateIntervalMsConfig = 1000 as const

/** 上传文件 最大同时上传数 */
export const uploadFileMaxSimultaneousNumConfig = 2 as const
/** 上传文件 调度轮询间隔 单位 ms*/
export const uploadFileSchedulerPollingIntervalMsConfig = 2000 as const
/** 上传文件 上传进度更新间隔 单位 ms*/
export const uploadFileProgressUpdateIntervalMsConfig = 1000 as const

/**
 * 上传记录状态配置对象。
 *
 * 所有合法的上传状态值都集中定义在此对象中，并通过 `as const` 固定为字面量类型。
 * 在业务逻辑中进行状态比对时，应使用该对象提供的常量，而不是直接使用字符串，
 * 以确保类型安全、避免拼写错误，并提升可维护性。
 *
 * 示例：
 * ```ts
 * // 推荐写法：使用配置对象中的常量
 * if (record.status === uploadStoreRecordStatusKeyConfig.pending) {
 *   // ...
 * }
 *
 * // 可行但不推荐：直接使用字符串，虽然 TS 会提示类型，但不利于维护
 * if (record.status === 'pending') {
 *   // ...
 * }
 * ```
 *
 * 状态说明：
 * - `pending`                待上传
 * - `uploading`              上传中
 * - `success`                上传完成
 * - `aborted_while_pending`  在 pending 状态时被中止
 * - `aborted_while_uploading`在 uploading 状态时被中止
 * - `error`                  上传错误
 * - `interrupted`            中断（初始化时将 pending/uploading 改为此状态）
 */
export const uploadStoreRecordStatusKeyConfig = {
  pending: 'pending',
  uploading: 'uploading',
  success: 'success',
  aborted_while_pending: 'aborted_while_pending',
  aborted_while_uploading: 'aborted_while_uploading',
  error: 'error',
  interrupted: 'interrupted',
} as const

/**
 * 上传记录状态类型。
 *
 * 该类型由 `uploadStoreRecordStatusKeyConfig` 自动推导，
 * 表示所有可能的上传状态值的联合类型。
 * 使用此类型可以在编译期获得完整的状态范围提示。
 */
export type UploadStoreRecordStatus =
  (typeof uploadStoreRecordStatusKeyConfig)[keyof typeof uploadStoreRecordStatusKeyConfig]
