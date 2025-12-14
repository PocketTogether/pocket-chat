import type { UploadFile } from 'element-plus'
import {
  imageLoadImageFromFileService,
  imageElementToCanvasService,
  imageScaleImageService,
  imageCanvasToBlobService,
  blobToFile,
} from '@/utils'

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

/**
 * 上传图片处理工具：生成大图和小图
 *
 * @param {UploadFile} uploadFile - 上传的文件对象
 * @param {Object} options - 配置选项
 * @param {Object} options.bigConfig - 大图配置
 * @param {number} options.bigConfig.sumWidthHeightLimit - 大图长宽之和限制值
 * @param {'image/png' | 'image/jpeg' | 'image/webp'} options.bigConfig.format - 大图首选输出格式
 * @param {number} options.bigConfig.quality - 大图首选输出质量 (0~1)
 * @param {Object} options.smallConfig - 小图配置
 * @param {number} options.smallConfig.sumWidthHeightLimit - 小图长宽之和限制值
 * @param {'image/png' | 'image/jpeg' | 'image/webp'} options.smallConfig.format - 小图首选输出格式
 * @param {number} options.smallConfig.quality - 小图首选输出质量 (0~1)
 *
 * @returns {Promise<{
 *   image: File,
 *   imageWidth: number,
 *   imageHeight: number,
 *   imageSmall: File,
 *   imageSmallWidth: number,
 *   imageSmallHeight: number
 * }>} 返回处理后的大图和小图文件及其尺寸信息
 *
 * @example
 * const result = await uploadImageProcessUtil(file, {
 *   bigConfig: {
 *     sumWidthHeightLimit: 4000,
 *     format: 'image/webp',
 *     quality: 0.9,
 *   },
 *   smallConfig: {
 *     sumWidthHeightLimit: 1400,
 *     format: 'image/png',
 *     quality: 0.8,
 *   }
 * })
 * console.log(result.image, result.imageSmall)
 */
export const uploadImageProcessUtil = async (
  uploadFile: UploadFile,
  options: {
    bigConfig: {
      sumWidthHeightLimit: number
      format: 'image/png' | 'image/jpeg' | 'image/webp'
      quality: number
    }
    smallConfig: {
      sumWidthHeightLimit: number
      format: 'image/png' | 'image/jpeg' | 'image/webp'
      quality: number
    }
  }
) => {
  const { bigConfig, smallConfig } = options

  // 1. 加载图片
  const img = await imageLoadImageFromFileService(uploadFile)
  const originWidth = img.width
  const originHeight = img.height
  const originSum = originWidth + originHeight

  // 2. 生成大图 canvas
  let bigCanvas: HTMLCanvasElement
  if (originSum <= bigConfig.sumWidthHeightLimit) {
    bigCanvas = imageElementToCanvasService(img)
  } else {
    const scaleFactor = bigConfig.sumWidthHeightLimit / originSum
    bigCanvas = imageScaleImageService(img, scaleFactor)
  }

  // 3. 生成小图 canvas
  let smallCanvas: HTMLCanvasElement
  if (originSum <= smallConfig.sumWidthHeightLimit) {
    smallCanvas = imageElementToCanvasService(img)
  } else {
    const scaleFactor = smallConfig.sumWidthHeightLimit / originSum
    smallCanvas = imageScaleImageService(img, scaleFactor)
  }

  // 4. 转换为 Blob → File，带格式回退
  async function canvasToFile(
    canvas: HTMLCanvasElement,
    type: 'image/png' | 'image/jpeg' | 'image/webp',
    q: number
  ): Promise<File> {
    try {
      const blob = await imageCanvasToBlobService(canvas, type, q)
      return blobToFile(blob, 'image')
    } catch {
      const blob = await imageCanvasToBlobService(canvas, 'image/jpeg', q)
      return blobToFile(blob, 'image')
    }
  }

  const imageFile = await canvasToFile(
    bigCanvas,
    bigConfig.format,
    bigConfig.quality
  )

  const imageSmallFile = await canvasToFile(
    smallCanvas,
    smallConfig.format,
    smallConfig.quality
  )

  return {
    image: imageFile,
    imageWidth: bigCanvas.width,
    imageHeight: bigCanvas.height,
    imageSmall: imageSmallFile,
    imageSmallWidth: smallCanvas.width,
    imageSmallHeight: smallCanvas.height,
  }
}
