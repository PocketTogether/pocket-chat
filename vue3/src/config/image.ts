// 图片分页查询，查询个数
export const imagePageListApiPerPageNumConfig = 30 as const

// 获取 dpr ，几倍屏
export const imageGetDprFn = () => {
  // 当前是几倍屏：
  const rawDpr = window.devicePixelRatio
  // 避免极端情况下的问题，限制为3到1
  const dpr = Math.min(3, Math.max(1, rawDpr))
  return dpr
}

// 单图比例计算配置
export const imageCalcSingleRatioOptionsConfig = {
  maxRatio: 3 / 1,
  minRatio: 1 / 2,
  defaultRatio: 16 / 9,
} as const

// 阶梯控制最大高度，图片页所用
/**
 * ## steps 阶梯匹配逻辑示例演示
 *
 * 假设 steps 配置如下：
 *
 *    [
 *      { ratio: 2/1, maxHeight: 260 },
 *      { ratio: 1/1, maxHeight: 360 },
 *      { ratio: 1/2, maxHeight: 480 }
 *    ]
 *
 * 则阶梯匹配逻辑等价于以下 if-else：
 *
 * ```ts
 * let maxHeight = 0
 *
 * if (ratio >= 2 / 1) {
 *   maxHeight = 260
 * } else if (ratio >= 1 / 1) {
 *   maxHeight = 360
 * } else if (ratio >= 1 / 2) {
 *   maxHeight = 480
 * } else {
 *   // 如果比最小阶梯还小，就使用最后一个阶梯（最竖的图）
 *   maxHeight = 480
 * }
 * ```
 *
 * 实际实现中，会将 steps 按 ratio 从大到小排序，
 * 然后查找第一个满足：`图片比例 >= step.ratio` 的阶梯。
 *
 */
export const imageCalcMaxWidthByRatioStepsOnImagePageConfig = [
  { ratio: 2 / 1, maxHeight: 200 },
  { ratio: 1 / 1, maxHeight: 300 },
  { ratio: 1 / 2, maxHeight: 400 },
]

// 阶梯控制最大高度，聊天页所用
export const imageCalcMaxWidthByRatioStepsOnChatPageConfig = [
  { ratio: 2 / 1, maxHeight: 200 },
  { ratio: 1 / 1, maxHeight: 300 },
  { ratio: 1 / 2, maxHeight: 400 },
]

/**
 * sizeLimitHandler 是一个“二次限制钩子（hook）”，用于在阶梯规则计算出初步 maxWidth 后，
 * 根据图片原始尺寸或业务需求对 maxWidth 进行进一步限制。
 */
export const imageCalcMaxWidthByRatioSizeLimitHandlerConfig = (data: {
  imageWidth: number
  imageHeight: number
  maxWidth: number
  maxHeight: number
}) => {
  const { imageHeight, imageWidth, maxWidth } = data

  // 图片显示时允许的最小宽度（避免过小）
  const minWidth = 100

  // 若图片尺寸异常，则不做额外限制
  if (imageHeight <= 0 || imageWidth <= 0) {
    return maxWidth
  }

  // 当前设备像素比（DPR），用于将物理像素转换为 CSS 像素
  const dpr = imageGetDprFn()

  /**
   * 将原图宽度从“物理像素”转换为“CSS 像素”
   *
   * 例如：
   * - 原图宽度 imageWidth = 1200（物理像素）
   * - dpr = 2
   * - cssPixelWidth = 600（CSS 像素）
   *
   * 这表示：图片在不被放大的情况下，最大只能以 600px 的宽度显示。
   */
  const cssPixelWidth = imageWidth / dpr

  // 若 CSS 像素宽度比 maxWidth 更小，则限制 maxWidth，避免放大导致失真
  if (cssPixelWidth < maxWidth) {
    return Math.max(cssPixelWidth, minWidth)
  }

  // 否则保持原 maxWidth
  return maxWidth
}
