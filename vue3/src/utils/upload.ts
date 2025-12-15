import type { UploadFile } from 'element-plus'
import {
  imageLoadImageFromFileService,
  imageElementToCanvasService,
  blobToFile,
  imageScaleImageWithPicaService,
  imageCanvasToBlobWithPicaService,
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
 * 上传图片处理工具：生成 主图、大图、小图、超小图
 */
export const uploadImageProcessUtil = async (
  uploadFile: UploadFile,
  options: {
    imageConfig: {
      sumWidthHeightLimit: number
      format: 'image/png' | 'image/jpeg' | 'image/webp'
      quality: number
    }
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
    tinyConfig: {
      sumWidthHeightLimit: number
      format: 'image/png' | 'image/jpeg' | 'image/webp'
      quality: number
    }
  }
) => {
  const { imageConfig, bigConfig, smallConfig, tinyConfig } = options

  // 1. 加载图片
  const img = await imageLoadImageFromFileService(uploadFile)
  const originCanvas = imageElementToCanvasService(img)
  const originWidth = originCanvas.width
  const originHeight = originCanvas.height
  const originSum = originWidth + originHeight

  // 2. 生成大图 canvas
  let bigCanvas: HTMLCanvasElement | undefined
  // 图片较小，不需要大图 返回undefined
  if (originSum <= imageConfig.sumWidthHeightLimit) {
    bigCanvas = undefined
  } else if (originSum <= bigConfig.sumWidthHeightLimit) {
    bigCanvas = originCanvas
  } else {
    const scaleFactor = bigConfig.sumWidthHeightLimit / originSum
    bigCanvas = await imageScaleImageWithPicaService(originCanvas, scaleFactor)
  }

  // 生成 image Canvas
  let imageCanvas: HTMLCanvasElement
  if (originSum <= imageConfig.sumWidthHeightLimit) {
    imageCanvas = originCanvas
  } else {
    const scaleFactor = imageConfig.sumWidthHeightLimit / originSum
    imageCanvas = await imageScaleImageWithPicaService(
      originCanvas,
      scaleFactor
    )
  }

  // 3. 生成小图 canvas
  let smallCanvas: HTMLCanvasElement
  if (originSum <= smallConfig.sumWidthHeightLimit) {
    smallCanvas = originCanvas
  } else {
    const scaleFactor = smallConfig.sumWidthHeightLimit / originSum
    smallCanvas = await imageScaleImageWithPicaService(
      originCanvas,
      scaleFactor
    )
  }

  let tinyCanvas: HTMLCanvasElement
  if (originSum <= tinyConfig.sumWidthHeightLimit) {
    tinyCanvas = originCanvas
  } else {
    const scaleFactor = tinyConfig.sumWidthHeightLimit / originSum
    tinyCanvas = await imageScaleImageWithPicaService(originCanvas, scaleFactor)
  }

  // 4. 转换为 Blob → File，带格式回退
  async function canvasToFile(
    canvas: HTMLCanvasElement,
    type: 'image/png' | 'image/jpeg' | 'image/webp',
    q: number
  ): Promise<File> {
    try {
      const blob = await imageCanvasToBlobWithPicaService(canvas, type, q)
      return blobToFile(blob, 'image')
    } catch {
      const blob = await imageCanvasToBlobWithPicaService(
        canvas,
        'image/jpeg',
        q
      )
      return blobToFile(blob, 'image')
    }
  }

  const imageBigFile = await (async () => {
    if (bigCanvas == null) {
      return undefined
    }
    return canvasToFile(bigCanvas, bigConfig.format, bigConfig.quality)
  })()

  const imageFile = await canvasToFile(
    imageCanvas,
    imageConfig.format,
    imageConfig.quality
  )

  const imageSmallFile = await canvasToFile(
    smallCanvas,
    smallConfig.format,
    smallConfig.quality
  )

  const imageTinyFile = await canvasToFile(
    tinyCanvas,
    tinyConfig.format,
    tinyConfig.quality
  )

  const imageProcessData = {
    imageBig: imageBigFile,
    imageBigWidth: bigCanvas?.width ?? 0,
    imageBigHeight: bigCanvas?.height ?? 0,

    image: imageFile,
    imageWidth: imageCanvas.width,
    imageHeight: imageCanvas.height,

    imageSmall: imageSmallFile,
    imageSmallWidth: smallCanvas.width,
    imageSmallHeight: smallCanvas.height,

    imageTiny: imageTinyFile,
    imageTinyWidth: tinyCanvas.width,
    imageTinyHeight: tinyCanvas.height,
  }
  return imageProcessData
}
