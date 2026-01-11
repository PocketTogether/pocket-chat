/**
 * 用户头像文件相关配置
 */
export const fileUserAvatarConfig = {
  /** 缩略图字符串 400x400 */
  thumb400x400: '400x400',
  /** 缩略图字符串 200x200 */
  thumb200x200: '200x200',
  /** 缩略图字符串 100x100 */
  thumb100x100: '100x100',
  /**
   * 图片处理 图片大小
   */
  imageResizeNumber: 800,
  /**
   * 图片处理 图片类型
   */
  toBlobType: 'image/jpeg',
  /**
   * 图片处理 图片质量
   */
  toBlobQuality: 0.8,
  /**
   * 图片处理 大小检查 不应大于或等等与 1MB
   */
  imageBlobSizeNotGte: 1000000,
} as const

export const fileRoomImageConfig = {
  // 这里是房间图片相关配置
  roomImageBlobFileMaxSize: 10485760, // 10MB
  // 锁
} as const
