/**
 * 计算上传进度百分比（0-100 的整数）。
 * - total 为 null/undefined 或 <= 0 时无法计算，返回 null。
 * - 超出范围自动裁剪到 [0, 100]。
 */
export const uploadProgressPercentageUtil = (
  loaded: number,
  total?: number
) => {
  if (total == null || total <= 0) return null
  const ratio = loaded / total
  const percent = Math.floor(ratio * 100)
  return Math.min(100, Math.max(0, percent))
}
